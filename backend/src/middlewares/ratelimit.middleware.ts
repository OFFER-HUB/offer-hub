import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { 
  RateLimitMiddlewareOptions, 
  AuthenticatedRequest,
  RateLimitInfo 
} from '@/types/middleware.types';
import { authConfig } from '@/config/auth.config';

/**
 * Enhanced rate limiter with comprehensive configuration options
 * @param options - Rate limiting configuration options
 * @returns Express rate limit middleware
 */
function createEnhancedLimiter(options: RateLimitMiddlewareOptions) {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: options.errorMessage || 'Too many requests, please try again later.',
        timestamp: new Date().toISOString(),
      },
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    skipFailedRequests: options.skipFailedRequests || false,
    keyGenerator: options.keyGenerator || ((req: Request) => {
      // Default key generator: use IP address for unauthenticated requests,
      // user ID for authenticated requests
      const authReq = req as AuthenticatedRequest;
      return authReq.user?.id || req.ip || 'anonymous';
    }),
    handler: (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest;
      const rateLimitInfo: RateLimitInfo = {
        limit: options.max,
        remaining: 0,
        resetTime: Date.now() + options.windowMs,
        retryAfter: Math.ceil(options.windowMs / 1000),
      };

      // Attach rate limit info to request for logging
      if (authReq.securityContext) {
        authReq.securityContext.rateLimitInfo = rateLimitInfo;
      }

      // Log rate limit violation
      console.log(JSON.stringify({
        type: 'RATE_LIMIT_VIOLATION',
        timestamp: new Date().toISOString(),
        userId: authReq.user?.id,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        endpoint: req.url,
        method: req.method,
        limit: options.max,
        windowMs: options.windowMs,
      }));

      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: options.errorMessage || 'Too many requests, please try again later.',
          details: {
            limit: options.max,
            windowMs: options.windowMs,
            retryAfter: rateLimitInfo.retryAfter,
          },
          timestamp: new Date().toISOString(),
        },
      });
    },
  });
}

/**
 * General API rate limiter
 * Applied to all API endpoints by default
 */
export const generalLimiter = createEnhancedLimiter({
  windowMs: authConfig.rateLimiting.general.windowMs,
  max: authConfig.rateLimiting.general.max,
  errorMessage: 'Too many requests from this IP, please try again later.',
});

/**
 * Authentication endpoints rate limiter
 * Stricter limits for login/register endpoints
 */
export const authLimiter = createEnhancedLimiter({
  windowMs: authConfig.rateLimiting.auth.windowMs,
  max: authConfig.rateLimiting.auth.max,
  errorMessage: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * Admin endpoints rate limiter
 * Higher limits for admin users
 */
export const adminLimiter = createEnhancedLimiter({
  windowMs: authConfig.rateLimiting.admin.windowMs,
  max: authConfig.rateLimiting.admin.max,
  errorMessage: 'Too many admin requests, please try again later.',
  keyGenerator: (req: Request) => {
    const authReq = req as AuthenticatedRequest;
    // Use user ID for authenticated admin requests, IP for others
    return authReq.user?.id || req.ip || 'anonymous';
  },
});

/**
 * User-specific rate limiter
 * Limits requests per authenticated user
 */
export const userLimiter = createEnhancedLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per user per window
  errorMessage: 'Too many requests from this user, please try again later.',
  keyGenerator: (req: Request) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return req.ip || 'anonymous';
    }
    return `user:${authReq.user.id}`;
  },
});

/**
 * Strict rate limiter for sensitive operations
 * Very restrictive limits for operations like password changes, account deletion
 */
export const strictLimiter = createEnhancedLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Only 5 attempts per hour
  errorMessage: 'Too many sensitive operations attempted, please try again later.',
  keyGenerator: (req: Request) => {
    const authReq = req as AuthenticatedRequest;
    return authReq.user?.id || req.ip || 'anonymous';
  },
});

/**
 * File upload rate limiter
 * Specific limits for file upload endpoints
 */
export const uploadLimiter = createEnhancedLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  errorMessage: 'Too many file uploads, please try again later.',
  keyGenerator: (req: Request) => {
    const authReq = req as AuthenticatedRequest;
    return authReq.user?.id || req.ip || 'anonymous';
  },
});

/**
 * Search rate limiter
 * Limits for search endpoints to prevent abuse
 */
export const searchLimiter = createEnhancedLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 searches per 5 minutes
  errorMessage: 'Too many search requests, please try again later.',
  keyGenerator: (req: Request) => {
    const authReq = req as AuthenticatedRequest;
    return authReq.user?.id || req.ip || 'anonymous';
  },
});

/**
 * Create a custom rate limiter with specific configuration
 * @param options - Custom rate limiting options
 * @returns Configured rate limit middleware
 */
export function createCustomLimiter(options: RateLimitMiddlewareOptions) {
  return createEnhancedLimiter(options);
}

/**
 * Get rate limit info for a request
 * @param req - Express request object
 * @returns Rate limit information or null
 */
export function getRateLimitInfo(req: Request): RateLimitInfo | null {
  const authReq = req as AuthenticatedRequest;
  return authReq.securityContext?.rateLimitInfo || null;
}
