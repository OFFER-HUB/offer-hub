import { supabase } from '@/lib/supabase/supabase';
import { AppError } from '@/utils/AppError';
import {
  hashToken,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
  isValidTokenFormat,
  isTokenExpired,
  isTokenNearExpiration,
  getTokenExpiration,
} from '@/utils/jwt.utils';
import { NextFunction, Request, Response } from 'express';
import { 
  AuthenticatedRequest, 
  AuthMiddlewareOptions, 
  SecurityContext,
  AuthAttemptLog,
  TokenValidationResult 
} from '@/types/middleware.types';
import { authConfig, isPublicRoute } from '@/config/auth.config';
import { UserRole, AuthUser } from '@/types/auth.types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Enhanced authentication middleware with comprehensive security features
 * Implements JWT validation, automatic token refresh, and security logging
 * 
 * @param options - Configuration options for authentication behavior
 * @param options.authErrorMessage - Custom error message for authentication failures
 * @returns Express middleware function that validates JWT tokens
 * 
 * This middleware:
 * - Extracts JWT token from Authorization header in "Bearer <token>" format
 * - Validates token format, signature, and expiration
 * - Fetches user data from database and attaches to req.user
 * - Checks if token needs refresh and provides token info
 * - Logs authentication attempts for security auditing
 * - Sets security headers for protected routes
 * - Skips authentication for public routes
 * 
 * Usage:
 * ```typescript
 * app.use('/api/protected', authenticateToken());
 * app.use('/api/admin', authenticateToken({ authErrorMessage: 'Admin access required' }));
 * ```
 */
export const authenticateToken = (options: AuthMiddlewareOptions = {}) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const startTime = Date.now();
    const requestId = uuidv4();
    
    // Create security context for logging
    const securityContext: SecurityContext = {
      requestId,
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      timestamp: startTime,
      endpoint: req.url,
      method: req.method,
      isAuthenticated: false,
    };

    try {
      // Check if route is public
      if (isPublicRoute(req.url)) {
        securityContext.isAuthenticated = false;
        req.securityContext = securityContext;
        return next();
      }

      // Extract token from Authorization header
      const token = extractTokenFromHeader(req.headers.authorization);
      
      if (!token) {
        await logAuthAttempt({
          ...securityContext,
          success: false,
          errorMessage: 'No token provided',
        });
        
        return next(new AppError(
          options.authErrorMessage || 'Authentication required. Please provide a valid token.',
          401
        ));
      }

      // Validate token format
      if (!isValidTokenFormat(token)) {
        await logAuthAttempt({
          ...securityContext,
          success: false,
          errorMessage: 'Invalid token format',
        });
        
        return next(new AppError('Invalid token format', 401));
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        await logAuthAttempt({
          ...securityContext,
          success: false,
          errorMessage: 'Token expired',
          tokenInfo: {
            isExpired: true,
            needsRefresh: false,
          },
        });
        
        return next(new AppError('Token has expired. Please login again.', 401));
      }

      // Verify token signature and decode payload
      let decoded;
      try {
        decoded = verifyAccessToken(token);
      } catch (error) {
        await logAuthAttempt({
          ...securityContext,
          success: false,
          errorMessage: 'Invalid token signature',
        });
        
        return next(new AppError('Invalid token signature', 401));
      }

      // Fetch user from database
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.user_id)
        .single();

      if (userError || !user) {
        await logAuthAttempt({
          ...securityContext,
          userId: decoded.user_id,
          success: false,
          errorMessage: 'User not found',
        });
        
        return next(new AppError('User associated with this token does not exist', 401));
      }

      // Check if token needs refresh
      const needsRefresh = isTokenNearExpiration(token);
      const expiresAt = getTokenExpiration(token);

      // Ensure user has required fields for AuthUser type
      const authUser: AuthUser = {
        id: user.id,
        email: user.email || '',
        firstName: user.name || '',
        lastName: '',
        role: user.role || UserRole.CLIENT,
        permissions: user.permissions || [],
        isActive: user.isActive !== false,
        isEmailVerified: user.isEmailVerified || false,
        lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
        createdAt: new Date(user.created_at || new Date()),
        updatedAt: new Date(),
        wallet_address: user.wallet_address,
      };

      // Attach user and token info to request
      req.user = authUser;
      req.tokenInfo = {
        token,
        expiresAt: expiresAt || 0,
        needsRefresh,
      };

      // Update security context
      securityContext.isAuthenticated = true;
      securityContext.userRole = user.role;
      req.securityContext = securityContext;

      // Log successful authentication
      if (authConfig.logging.logSuccessfulAuth) {
        await logAuthAttempt({
          ...securityContext,
          userId: user.id,
          success: true,
          tokenInfo: {
            isExpired: false,
            needsRefresh,
          },
        });
      }

      // Set security headers
      setSecurityHeaders(res);

      next();
    } catch (error) {
      console.error('Token validation error:', error);
      await logAuthAttempt({
        ...securityContext,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      
      return next(new AppError('Authentication failed', 401));
    }
  };
};

/**
 * Legacy function for backward compatibility
 * 
 * @deprecated Use authenticateToken() instead for new implementations
 * 
 * This is a convenience wrapper around authenticateToken() with default options.
 * Provided for backward compatibility with existing code that uses verifyToken.
 * 
 * @returns Express middleware function that validates JWT tokens
 * 
 * Usage:
 * ```typescript
 * app.use('/api/legacy', verifyToken);
 * ```
 */
export const verifyToken = authenticateToken();

/**
 * Role-based authorization middleware
 * 
 * Authorizes user access based on their assigned roles. Must be used after authentication middleware.
 * Checks if the authenticated user's role is included in the allowed roles list.
 * 
 * @param roles - Variable number of allowed UserRole values (e.g., UserRole.ADMIN, UserRole.FREELANCER)
 * @returns Express middleware function that validates user roles
 * 
 * This middleware:
 * - Requires user to be authenticated (req.user must exist)
 * - Checks if user's role is in the allowed roles array
 * - Returns 403 Forbidden if user doesn't have required role
 * - Logs unauthorized access attempts for security auditing
 * - Calls next() if user has sufficient permissions
 * 
 * Usage:
 * ```typescript
 * // Single role
 * app.use('/api/admin', authenticateToken(), authorizeRoles(UserRole.ADMIN));
 * 
 * // Multiple roles
 * app.use('/api/protected', authenticateToken(), authorizeRoles(UserRole.ADMIN, UserRole.MODERATOR));
 * 
 * // Client and freelancer access
 * app.use('/api/jobs', authenticateToken(), authorizeRoles(UserRole.CLIENT, UserRole.FREELANCER));
 * ```
 */
export function authorizeRoles(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      // Log unauthorized access attempt
      if (authConfig.logging.logRoleAccess) {
        logAuthAttempt({
          requestId: req.securityContext?.requestId || uuidv4(),
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          timestamp: Date.now(),
          endpoint: req.url,
          method: req.method,
          isAuthenticated: true,
          userId: req.user.id,
          userRole: req.user.role,
          success: false,
          errorMessage: `Insufficient permissions. Required roles: ${roles.join(', ')}`,
        });
      }
      
      return next(new AppError(
        `Access denied. Required roles: ${roles.join(', ')}`,
        403
      ));
    }

    next();
  };
}

/**
 * Set security headers for protected routes
 * 
 * Configures HTTP security headers to protect against common web vulnerabilities
 * like XSS, clickjacking, and content type sniffing attacks.
 * 
 * @param res - Express response object to set headers on
 * 
 * Sets the following security headers:
 * - X-Frame-Options: Prevents clickjacking attacks
 * - X-Content-Type-Options: Prevents MIME type sniffing
 * - X-XSS-Protection: Enables browser XSS filtering
 * - Strict-Transport-Security: Enforces HTTPS connections
 * - Content-Security-Policy: Defines allowed content sources
 * 
 * Headers are configured via authConfig.securityHeaders setting.
 */
function setSecurityHeaders(res: Response): void {
  const headers = authConfig.securityHeaders;
  
  res.setHeader('X-Frame-Options', headers.xFrameOptions);
  res.setHeader('X-Content-Type-Options', headers.xContentTypeOptions);
  res.setHeader('X-XSS-Protection', headers.xXSSProtection);
  res.setHeader('Strict-Transport-Security', headers.strictTransportSecurity);
  res.setHeader('Content-Security-Policy', headers.contentSecurityPolicy);
}

/**
 * Log authentication attempts for security auditing
 * 
 * Records authentication events for security monitoring and audit trails.
 * Logs include success/failure status, user information, and security context.
 * 
 * @param logEntry - Authentication attempt log entry containing security context and results
 * @param logEntry.requestId - Unique identifier for the request
 * @param logEntry.ipAddress - Client IP address
 * @param logEntry.userAgent - Client user agent string
 * @param logEntry.timestamp - When the attempt occurred
 * @param logEntry.endpoint - API endpoint being accessed
 * @param logEntry.method - HTTP method used
 * @param logEntry.isAuthenticated - Whether authentication was successful
 * @param logEntry.userId - User ID (if authenticated)
 * @param logEntry.userRole - User role (if authenticated)
 * @param logEntry.success - Whether the attempt was successful
 * @param logEntry.errorMessage - Error message (if failed)
 * @param logEntry.tokenInfo - Token validation details (if applicable)
 * 
 * Logging behavior is controlled by authConfig.logging settings:
 * - logAuthAttempts: Whether to log at all
 * - logSuccessfulAuth: Whether to log successful authentications
 * - logRoleAccess: Whether to log role-based access attempts
 * 
 * In production, logs should be sent to a centralized logging service.
 * Currently outputs structured JSON to console for development.
 */
async function logAuthAttempt(logEntry: AuthAttemptLog): Promise<void> {
  if (!authConfig.logging.logAuthAttempts) return;

  try {
    // In a production environment, you would send this to a logging service
    // For now, we'll use console.log with structured format
    console.log(JSON.stringify({
      type: 'AUTH_ATTEMPT',
      ...logEntry,
    }));
    
    // You could also store in database for audit trail
    // await supabase.from('auth_logs').insert(logEntry);
  } catch (error) {
    console.error('Failed to log auth attempt:', error);
  }
}

/**
 * Validate token and return detailed result
 * 
 * Performs comprehensive validation of a JWT token including format, expiration,
 * signature verification, and refresh status. Returns detailed validation results
 * for programmatic handling of token states.
 * 
 * @param token - JWT token string to validate
 * @returns TokenValidationResult object with validation details
 * @returns TokenValidationResult.isValid - Whether token is valid and usable
 * @returns TokenValidationResult.isExpired - Whether token has expired
 * @returns TokenValidationResult.needsRefresh - Whether token should be refreshed soon
 * @returns TokenValidationResult.payload - Decoded token payload (if valid)
 * @returns TokenValidationResult.error - Error message (if validation failed)
 * 
 * This function:
 * - Checks token format validity
 * - Validates token expiration
 * - Verifies token signature
 * - Determines if token needs refresh
 * - Returns structured result for easy handling
 * 
 * Usage:
 * ```typescript
 * const result = validateToken(userToken);
 * if (!result.isValid) {
 *   if (result.isExpired) {
 *     // Redirect to login
 *   } else {
 *     // Handle other validation errors
 *   }
 * } else if (result.needsRefresh) {
 *   // Request new token
 * }
 * ```
 */
export function validateToken(token: string): TokenValidationResult {
  try {
    if (!isValidTokenFormat(token)) {
      return {
        isValid: false,
        isExpired: false,
        needsRefresh: false,
        error: 'Invalid token format',
      };
    }

    const isExpired = isTokenExpired(token);
    const needsRefresh = isTokenNearExpiration(token);

    if (isExpired) {
      return {
        isValid: false,
        isExpired: true,
        needsRefresh: false,
        error: 'Token has expired',
      };
    }

    const payload = verifyAccessToken(token);
    
    return {
      isValid: true,
      isExpired: false,
      needsRefresh,
      payload,
    };
  } catch (error) {
    return {
      isValid: false,
      isExpired: false,
      needsRefresh: false,
      error: error instanceof Error ? error.message : 'Token validation failed',
    };
  }
}

/**
 * Enhanced refresh token validation middleware
 * 
 * Validates refresh tokens for token renewal requests and handles automatic cleanup
 * of expired tokens. Ensures refresh tokens are valid, not expired, and properly
 * associated with the requesting user.
 * 
 * @param req - Express request object containing refreshToken in body
 * @param req.body.refreshToken - Refresh token string to validate
 * @param res - Express response object
 * @param next - Express next function to continue middleware chain
 * 
 * This middleware:
 * - Validates refresh token format and presence
 * - Hashes token and checks against database records
 * - Verifies token signature and expiration
 * - Ensures token belongs to the requesting user
 * - Automatically cleans up expired tokens from database
 * - Attaches token record to req.refreshTokenRecord for downstream use
 * 
 * Error responses:
 * - 400: Missing refresh token
 * - 403: Invalid, expired, or mismatched refresh token
 * 
 * Usage:
 * ```typescript
 * app.post('/api/auth/refresh', validateRefreshToken, refreshTokenController);
 * ```
 * 
 * The refresh token record is attached to the request for use in token renewal:
 * ```typescript
 * // In the controller after this middleware
 * const tokenRecord = req.refreshTokenRecord;
 * ```
 */
export const validateRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  const refreshTokenHash = hashToken(refreshToken);

  try {
    const decoded = verifyRefreshToken(refreshToken);

    const { data: tokenRecord, error } = await supabase
      .from('refresh_tokens')
      .select('*')
      .eq('token_hash', refreshTokenHash)
      .single();

    if (error || !tokenRecord) {
      return next(
        new AppError('Invalid refresh token. Please log in again', 403)
      );
    }

    // Verify user ID matches between token and record
    if (tokenRecord.user_id !== decoded.user_id) {
      return next(new AppError('Refresh token does not match the user', 403));
    }

    req.refreshTokenRecord = tokenRecord;
    next();
  } catch (err) {
    if ((err as Error).name === 'TokenExpiredError') {
      // Clean up expired refresh token
      await supabase
        .from('refresh_tokens')
        .delete()
        .eq('token_hash', refreshTokenHash);
      return next(new AppError('Refresh token has expired', 403));
    }

    return next(new AppError('Invalid refresh token', 403));
  }
};
