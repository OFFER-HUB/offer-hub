import { UserRole } from '@/types/auth.types';

/**
 * Authentication and security configuration
 * Centralizes all auth-related settings for the application
 */
export const authConfig = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET as string,
    accessTokenExpiry: process.env.JWT_EXPIRES_IN || '24h',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    refreshThreshold: 5 * 60 * 1000, // 5 minutes in milliseconds
  },

  // Security Headers Configuration
  securityHeaders: {
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    xXSSProtection: '1; mode=block',
    strictTransportSecurity: 'max-age=31536000; includeSubDomains',
    contentSecurityPolicy: 'default-src \'self\'',
  },

  // Rate Limiting Configuration
  rateLimiting: {
    // General API rate limits
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per window
    },
    // Authentication endpoints rate limits
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // 10 login attempts per window
    },
    // Admin endpoints rate limits
    admin: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 50, // 50 requests per window
    },
  },

  // Public routes that don't require authentication
  publicRoutes: [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/health',
    '/api/docs',
    '/api/public',
  ],

  // Routes that require specific roles
  roleBasedRoutes: {
    admin: [
      '/api/admin',
      '/api/users/delete',
      '/api/system',
    ],
    moderator: [
      '/api/moderate',
      '/api/reports',
    ],
    // Freelancer and client routes are handled by business logic
  },

  // Token validation settings
  tokenValidation: {
    // Maximum number of failed attempts before temporary lockout
    maxFailedAttempts: 5,
    // Lockout duration in milliseconds
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    // Token blacklist cleanup interval
    blacklistCleanupInterval: 60 * 60 * 1000, // 1 hour
  },

  // Logging configuration
  logging: {
    // Log all authentication attempts
    logAuthAttempts: true,
    // Log successful authentications
    logSuccessfulAuth: true,
    // Log failed authentications
    logFailedAuth: true,
    // Log token refresh attempts
    logTokenRefresh: true,
    // Log role-based access attempts
    logRoleAccess: true,
  },

  // Session configuration
  session: {
    // Session timeout in milliseconds
    timeout: 24 * 60 * 60 * 1000, // 24 hours
    // Maximum concurrent sessions per user
    maxConcurrentSessions: 3,
  },
} as const;

/**
 * Check if a route is public (doesn't require authentication)
 * @param path - Route path to check
 * @returns boolean indicating if route is public
 */
export function isPublicRoute(path: string): boolean {
  return authConfig.publicRoutes.some(route => 
    path.startsWith(route) || path === route
  );
}

/**
 * Get required role for a specific route
 * @param path - Route path to check
 * @returns UserRole or null if no specific role required
 */
export function getRequiredRole(path: string): UserRole | null {
  for (const [role, routes] of Object.entries(authConfig.roleBasedRoutes)) {
    if (routes.some(route => path.startsWith(route))) {
      return role as UserRole;
    }
  }
  return null;
}

/**
 * Validate JWT secret is configured
 * @throws Error if JWT secret is not configured
 */
export function validateAuthConfig(): void {
  if (!authConfig.jwt.secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  if (authConfig.jwt.secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long for security');
  }
}

// Validate configuration on module load
validateAuthConfig();
