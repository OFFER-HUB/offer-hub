import { NextFunction, Response } from 'express';
import { AppError } from '@/utils/AppError';
import { 
  AuthenticatedRequest, 
  RoleMiddlewareOptions,
  AuthAttemptLog 
} from '@/types/middleware.types';
import { UserRole } from '@/types/auth.types';
import { authConfig, getRequiredRole } from '@/config/auth.config';
import { v4 as uuidv4 } from 'uuid';

/**
 * Role-based access control middleware
 * Validates user roles against required permissions for specific routes
 */
export const requireRole = (options: RoleMiddlewareOptions) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Ensure user is authenticated
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const userRole = req.user.role;
    const requiredRoles = options.requiredRoles;
    const allowAny = options.allowAny ?? true; // Default to allowing any of the required roles

    // Check if user has required role(s)
    const hasRequiredRole = allowAny 
      ? requiredRoles.includes(userRole)
      : requiredRoles.every(role => userRole === role);

    if (!hasRequiredRole) {
      // Log unauthorized access attempt
      if (options.logAccess !== false && authConfig.logging.logRoleAccess) {
        logRoleAccessAttempt({
          requestId: req.securityContext?.requestId || uuidv4(),
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          timestamp: Date.now(),
          endpoint: req.url,
          method: req.method,
          isAuthenticated: true,
          userId: req.user.id,
          userRole: userRole,
          success: false,
          errorMessage: `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`,
        });
      }

      const errorMessage = options.errorMessage || 
        `Access denied. Required role${requiredRoles.length > 1 ? 's' : ''}: ${requiredRoles.join(', ')}`;

      return next(new AppError(errorMessage, 403));
    }

    // Log successful role access
    if (options.logAccess !== false && authConfig.logging.logRoleAccess) {
      logRoleAccessAttempt({
        requestId: req.securityContext?.requestId || uuidv4(),
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        timestamp: Date.now(),
        endpoint: req.url,
        method: req.method,
        isAuthenticated: true,
        userId: req.user.id,
        userRole: userRole,
        success: true,
      });
    }

    next();
  };
};

/**
 * Admin-only access middleware
 * Shortcut for requiring admin role
 */
export const requireAdmin = (options: Partial<RoleMiddlewareOptions> = {}) => {
  return requireRole({
    requiredRoles: [UserRole.ADMIN],
    allowAny: true,
    ...options,
  });
};

/**
 * Moderator or Admin access middleware
 * Allows access to moderators and admins
 */
export const requireModerator = (options: Partial<RoleMiddlewareOptions> = {}) => {
  return requireRole({
    requiredRoles: [UserRole.ADMIN, UserRole.MODERATOR],
    allowAny: true,
    ...options,
  });
};

/**
 * Freelancer access middleware
 * Allows access to freelancers and admins
 */
export const requireFreelancer = (options: Partial<RoleMiddlewareOptions> = {}) => {
  return requireRole({
    requiredRoles: [UserRole.FREELANCER, UserRole.ADMIN],
    allowAny: true,
    ...options,
  });
};

/**
 * Client access middleware
 * Allows access to clients and admins
 */
export const requireClient = (options: Partial<RoleMiddlewareOptions> = {}) => {
  return requireRole({
    requiredRoles: [UserRole.CLIENT, UserRole.ADMIN],
    allowAny: true,
    ...options,
  });
};

/**
 * Resource ownership middleware
 * Validates that the user owns the resource they're trying to access
 * @param resourceIdParam - Parameter name containing the resource ID
 * @param resourceType - Type of resource (user, project, etc.)
 * @param options - Additional options
 */
export const requireOwnership = (
  resourceIdParam: string = 'id',
  resourceType: string = 'resource',
  options: {
    allowAdmin?: boolean;
    allowModerator?: boolean;
    customCheck?: (req: AuthenticatedRequest, resourceId: string) => Promise<boolean>;
  } = {}
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const resourceId = req.params[resourceIdParam];
    if (!resourceId) {
      return next(new AppError(`Resource ID not found in parameter: ${resourceIdParam}`, 400));
    }

    const userRole = req.user.role;
    const userId = req.user.id;

    // Allow admins to access any resource
    if (options.allowAdmin && userRole === 'admin') {
      return next();
    }

    // Allow moderators to access any resource if configured
    if (options.allowModerator && userRole === 'moderator') {
      return next();
    }

    // Check if user owns the resource
    const isOwner = resourceId === userId;

    // Custom ownership check
    if (!isOwner && options.customCheck) {
      try {
        const customResult = await options.customCheck(req, resourceId);
        if (customResult) {
          return next();
        }
      } catch (error) {
        return next(new AppError(`Failed to verify ${resourceType} ownership`, 500));
      }
    }

    if (!isOwner) {
      // Log unauthorized access attempt
      if (authConfig.logging.logRoleAccess) {
        logRoleAccessAttempt({
          requestId: req.securityContext?.requestId || uuidv4(),
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          timestamp: Date.now(),
          endpoint: req.url,
          method: req.method,
          isAuthenticated: true,
          userId: userId,
          userRole: userRole,
          success: false,
          errorMessage: `Access denied. User does not own ${resourceType} with ID: ${resourceId}`,
        });
      }

      return next(new AppError(
        `Access denied. You don't have permission to access this ${resourceType}`,
        403
      ));
    }

    next();
  };
};

/**
 * Dynamic role-based middleware that checks route configuration
 * Automatically determines required role based on route path
 */
export const requireRouteRole = (options: Partial<RoleMiddlewareOptions> = {}) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Get required role for the current route
    const requiredRole = getRequiredRole(req.url);
    
    if (!requiredRole) {
      // No specific role required for this route
      return next();
    }

    // Apply role requirement
    const roleMiddleware = requireRole({
      requiredRoles: [requiredRole],
      allowAny: true,
      ...options,
    });

    return roleMiddleware(req, res, next);
  };
};

/**
 * Log role-based access attempts for security auditing
 * @param logEntry - Role access attempt log entry
 */
async function logRoleAccessAttempt(logEntry: AuthAttemptLog): Promise<void> {
  if (!authConfig.logging.logRoleAccess) return;

  try {
    // In a production environment, you would send this to a logging service
    console.log(JSON.stringify({
      type: 'ROLE_ACCESS_ATTEMPT',
      ...logEntry,
    }));
    
    // You could also store in database for audit trail
    // await supabase.from('role_access_logs').insert(logEntry);
  } catch (error) {
    console.error('Failed to log role access attempt:', error);
  }
}

/**
 * Check if user has any of the specified roles
 * @param userRole - User's role
 * @param allowedRoles - Array of allowed roles
 * @returns boolean indicating if user has permission
 */
export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Check if user has all of the specified roles (useful for multi-role requirements)
 * @param userRole - User's role
 * @param requiredRoles - Array of required roles
 * @returns boolean indicating if user has all permissions
 */
export function hasAllRoles(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.every(role => userRole === role);
}

/**
 * Get user's permission level (numeric value for comparison)
 * @param role - User role
 * @returns numeric permission level (higher = more permissions)
 */
export function getPermissionLevel(role: UserRole): number {
  const levels: Record<UserRole, number> = {
    [UserRole.CLIENT]: 1,
    [UserRole.FREELANCER]: 2,
    [UserRole.MODERATOR]: 3,
    [UserRole.ADMIN]: 4,
    [UserRole.USER]: 1, // Default level for USER role
  };

  return levels[role] || 0;
}

/**
 * Check if user has permission level equal to or higher than required
 * @param userRole - User's role
 * @param requiredLevel - Required permission level
 * @returns boolean indicating if user has sufficient permissions
 */
export function hasPermissionLevel(userRole: UserRole, requiredLevel: number): boolean {
  return getPermissionLevel(userRole) >= requiredLevel;
}
