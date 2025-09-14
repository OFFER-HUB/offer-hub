import { Request, Response, NextFunction } from 'express';
import { UserRole, AuthUser } from './auth.types';

/**
 * Extended Request interface with authentication and security context
 */
export interface AuthenticatedRequest extends Request {
  user: AuthUser;
  tokenInfo?: {
    token: string;
    expiresAt: number;
    needsRefresh: boolean;
  };
  securityContext?: SecurityContext;
}

/**
 * Security context for request tracking and logging
 */
export interface SecurityContext {
  requestId: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: number;
  endpoint: string;
  method: string;
  isAuthenticated: boolean;
  userRole?: UserRole;
  rateLimitInfo?: RateLimitInfo;
}

/**
 * Rate limiting information
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Authentication middleware options
 */
export interface AuthMiddlewareOptions {
  // Whether to require authentication
  requireAuth?: boolean;
  // Specific roles required for access
  requiredRoles?: UserRole[];
  // Whether to allow token refresh
  allowRefresh?: boolean;
  // Whether to log access attempts
  logAccess?: boolean;
  // Custom error message for authentication failures
  authErrorMessage?: string;
  // Custom error message for authorization failures
  authzErrorMessage?: string;
}

/**
 * Role-based access control options
 */
export interface RoleMiddlewareOptions {
  // Required roles for access
  requiredRoles: UserRole[];
  // Whether to allow access if user has any of the required roles
  allowAny?: boolean;
  // Custom error message
  errorMessage?: string;
  // Whether to log role access attempts
  logAccess?: boolean;
}

/**
 * Rate limiting middleware options
 */
export interface RateLimitMiddlewareOptions {
  // Time window in milliseconds
  windowMs: number;
  // Maximum number of requests per window
  max: number;
  // Custom error message
  errorMessage?: string;
  // Whether to skip successful requests
  skipSuccessfulRequests?: boolean;
  // Whether to skip failed requests
  skipFailedRequests?: boolean;
  // Custom key generator function
  keyGenerator?: (req: Request) => string;
}

/**
 * Security headers middleware options
 */
export interface SecurityHeadersOptions {
  // Whether to set X-Frame-Options header
  xFrameOptions?: string;
  // Whether to set X-Content-Type-Options header
  xContentTypeOptions?: string;
  // Whether to set X-XSS-Protection header
  xXSSProtection?: string;
  // Whether to set Strict-Transport-Security header
  strictTransportSecurity?: string;
  // Whether to set Content-Security-Policy header
  contentSecurityPolicy?: string;
}

/**
 * Token validation result
 */
export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  needsRefresh: boolean;
  payload?: any;
  error?: string;
}

/**
 * Authentication attempt log entry
 */
export interface AuthAttemptLog {
  requestId?: string;
  timestamp: number;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  endpoint: string;
  method: string;
  isAuthenticated?: boolean;
  userRole?: UserRole;
  success: boolean;
  errorMessage?: string;
  tokenInfo?: {
    isExpired: boolean;
    needsRefresh: boolean;
  };
}

/**
 * Middleware function type
 */
export type MiddlewareFunction = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Error response format
 */
export interface AuthErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Success response format for authentication
 */
export interface AuthSuccessResponse {
  success: true;
  data: {
    user: {
      id: string;
      role: UserRole;
      wallet_address: string;
    };
    token?: {
      accessToken: string;
      refreshToken?: string;
      expiresAt: number;
    };
  };
  timestamp: string;
  requestId?: string;
}
