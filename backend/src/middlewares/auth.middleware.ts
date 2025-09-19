import { supabase } from "@/lib/supabase/supabase";
import { AppError } from "@/utils/AppError";
import {
  hashToken,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
  isValidTokenFormat,
  isTokenExpired,
  isTokenNearExpiration,
  getTokenExpiration,
} from "@/utils/jwt.utils";
import { NextFunction, Request, Response } from "express";
import { 
  AuthenticatedRequest, 
  AuthMiddlewareOptions, 
  SecurityContext,
  AuthAttemptLog,
  TokenValidationResult 
} from "@/types/middleware.types";
import { authConfig, isPublicRoute } from "@/config/auth.config";
import { UserRole, AuthUser } from "@/types/auth.types";
import { v4 as uuidv4 } from "uuid";

/**
 * Enhanced authentication middleware with comprehensive security features
 * Implements JWT validation, automatic token refresh, and security logging
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
          errorMessage: "No token provided",
        });
        
        return next(new AppError(
          options.authErrorMessage || "Authentication required. Please provide a valid token.",
          401
        ));
      }

      // Validate token format
      if (!isValidTokenFormat(token)) {
        await logAuthAttempt({
          ...securityContext,
          success: false,
          errorMessage: "Invalid token format",
        });
        
        return next(new AppError("Invalid token format", 401));
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        await logAuthAttempt({
          ...securityContext,
          success: false,
          errorMessage: "Token expired",
          tokenInfo: {
            isExpired: true,
            needsRefresh: false,
          },
        });
        
        return next(new AppError("Token has expired. Please login again.", 401));
      }

      // Verify token signature and decode payload
      let decoded;
      try {
        decoded = verifyAccessToken(token);
      } catch (error) {
        await logAuthAttempt({
          ...securityContext,
          success: false,
          errorMessage: "Invalid token signature",
        });
        
        return next(new AppError("Invalid token signature", 401));
      }

      // Fetch user from database
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", decoded.user_id)
        .single();

      if (userError || !user) {
        await logAuthAttempt({
          ...securityContext,
          userId: decoded.user_id,
          success: false,
          errorMessage: "User not found",
        });
        
        return next(new AppError("User associated with this token does not exist", 401));
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
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
      
      return next(new AppError("Authentication failed", 401));
    }
  };
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use authenticateToken() instead
 */
export const verifyToken = authenticateToken();

/**
 * Role-based authorization middleware
 * @param roles - Array of allowed roles
 * @returns middleware function
 */
export function authorizeRoles(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
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
 * @param res - Express response object
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
 * @param logEntry - Authentication attempt log entry
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
 * @param token - JWT token to validate
 * @returns TokenValidationResult
 */
export function validateToken(token: string): TokenValidationResult {
  try {
    if (!isValidTokenFormat(token)) {
      return {
        isValid: false,
        isExpired: false,
        needsRefresh: false,
        error: "Invalid token format",
      };
    }

    const isExpired = isTokenExpired(token);
    const needsRefresh = isTokenNearExpiration(token);

    if (isExpired) {
      return {
        isValid: false,
        isExpired: true,
        needsRefresh: false,
        error: "Token has expired",
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
      error: error instanceof Error ? error.message : "Token validation failed",
    };
  }
}

/**
 * Enhanced refresh token validation middleware
 * Validates refresh tokens and handles token cleanup
 */
export const validateRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError("Refresh token is required", 400));
  }

  const refreshTokenHash = hashToken(refreshToken);

  try {
    const decoded = verifyRefreshToken(refreshToken);

    const { data: tokenRecord, error } = await supabase
      .from("refresh_tokens")
      .select("*")
      .eq("token_hash", refreshTokenHash)
      .single();

    if (error || !tokenRecord) {
      return next(
        new AppError("Invalid refresh token. Please log in again", 403)
      );
    }

    // Verify user ID matches between token and record
    if (tokenRecord.user_id !== decoded.user_id) {
      return next(new AppError("Refresh token does not match the user", 403));
    }

    req.refreshTokenRecord = tokenRecord;
    next();
  } catch (err) {
    if ((err as Error).name === "TokenExpiredError") {
      // Clean up expired refresh token
      await supabase
        .from("refresh_tokens")
        .delete()
        .eq("token_hash", refreshTokenHash);
      return next(new AppError("Refresh token has expired", 403));
    }

    return next(new AppError("Invalid refresh token", 403));
  }
};
