

// Permission Resource Types
export enum PermissionResource {
  USER = 'user',
  PROJECT = 'project',
  CONTRACT = 'contract',
  PAYMENT = 'payment',
  REVIEW = 'review',
  DISPUTE = 'dispute',
  ADMIN = 'admin',
  SYSTEM = 'system',
  NOTIFICATION = 'notification',
  PROFILE = 'profile',
  SESSION = 'session'
}

// Permission Action Types
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
  APPROVE = 'approve',
  REJECT = 'reject',
  VIEW = 'view',
  EDIT = 'edit',
  PUBLISH = 'publish',
  ARCHIVE = 'archive',
  EXPORT = 'export',
  IMPORT = 'import'
}

// Permission Types
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: PermissionResource;
  action: PermissionAction;
  scope?: PermissionScope;
  conditions?: PermissionCondition[];
}

// Permission Scope Types
export enum PermissionScope {
  GLOBAL = 'global',
  OWN = 'own',
  TEAM = 'team',
  DEPARTMENT = 'department',
  ORGANIZATION = 'organization'
}

// Permission Condition Types
export interface PermissionCondition {
  field: string;
  operator: PermissionOperator;
  value: unknown;
}

export enum PermissionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  IN = 'in',
  NOT_IN = 'not_in',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  CONTAINS = 'contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with'
}

// Role Definition Types
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
  hierarchy: number; // Higher number = more permissions
  createdAt: Date;
  updatedAt: Date;
}

// Predefined System Roles
export enum SystemRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
  FREELANCER = 'freelancer',
  CLIENT = 'client',
  GUEST = 'guest'
}

// Role Hierarchy Configuration
export interface RoleHierarchy {
  [SystemRole.SUPER_ADMIN]: {
    level: 100;
    inherits: never[];
    description: 'Full system access with all permissions';
  };
  [SystemRole.ADMIN]: {
    level: 80;
    inherits: [SystemRole.USER];
    description: 'Administrative access to most system features';
  };
  [SystemRole.MODERATOR]: {
    level: 60;
    inherits: [SystemRole.USER];
    description: 'Content moderation and user management permissions';
  };
  [SystemRole.USER]: {
    level: 40;
    inherits: [SystemRole.GUEST];
    description: 'Standard user permissions for platform usage';
  };
  [SystemRole.FREELANCER]: {
    level: 35;
    inherits: [SystemRole.USER];
    description: 'Freelancer-specific permissions for project work';
  };
  [SystemRole.CLIENT]: {
    level: 35;
    inherits: [SystemRole.USER];
    description: 'Client-specific permissions for project management';
  };
  [SystemRole.GUEST]: {
    level: 10;
    inherits: never[];
    description: 'Basic permissions for unauthenticated users';
  };
}

// Permission Group Types
export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  category: PermissionCategory;
}

export enum PermissionCategory {
  USER_MANAGEMENT = 'user_management',
  CONTENT_MANAGEMENT = 'content_management',
  FINANCIAL = 'financial',
  SYSTEM_ADMIN = 'system_admin',
  COMMUNICATION = 'communication',
  PROJECT_MANAGEMENT = 'project_management'
}

// User Permission Assignment Types
export interface UserPermission {
  userId: string;
  permissionId: string;
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  scope?: PermissionScope;
  conditions?: PermissionCondition[];
}

export interface UserRoleAssignment {
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

// Permission Check Types
export interface PermissionCheck {
  userId: string;
  resource: PermissionResource;
  action: PermissionAction;
  resourceId?: string;
  context?: PermissionContext;
}

export interface PermissionContext {
  userId: string;
  resourceOwnerId?: string;
  teamId?: string;
  departmentId?: string;
  organizationId?: string;
  projectId?: string;
  contractId?: string;
  [key: string]: unknown;
}

// Permission Result Types
export interface PermissionResult {
  granted: boolean;
  reason?: PermissionDenialReason;
  requiredPermissions?: Permission[];
  userPermissions?: Permission[];
  context?: PermissionContext;
}

export enum PermissionDenialReason {
  INSUFFICIENT_PERMISSIONS = 'insufficient_permissions',
  RESOURCE_NOT_FOUND = 'resource_not_found',
  RESOURCE_ACCESS_DENIED = 'resource_access_denied',
  SCOPE_VIOLATION = 'scope_violation',
  CONDITION_NOT_MET = 'condition_not_met',
  PERMISSION_EXPIRED = 'permission_expired',
  USER_INACTIVE = 'user_inactive',
  SYSTEM_ERROR = 'system_error'
}

// Permission Policy Types
export interface PermissionPolicy {
  id: string;
  name: string;
  description: string;
  rules: PermissionRule[];
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PermissionRule {
  resource: PermissionResource;
  action: PermissionAction;
  conditions: PermissionCondition[];
  effect: PermissionEffect;
}

export enum PermissionEffect {
  ALLOW = 'allow',
  DENY = 'deny'
}

// Access Control List (ACL) Types
export interface ACL {
  resourceId: string;
  resourceType: PermissionResource;
  permissions: ACLPermission[];
}

export interface ACLPermission {
  userId?: string;
  roleId?: string;
  permission: Permission;
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
}

// Permission Audit Types
export interface PermissionAuditLog {
  id: string;
  userId: string;
  action: PermissionAuditAction;
  resource: PermissionResource;
  resourceId?: string;
  permission?: Permission;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

export enum PermissionAuditAction {
  PERMISSION_GRANTED = 'permission_granted',
  PERMISSION_REVOKED = 'permission_revoked',
  ROLE_ASSIGNED = 'role_assigned',
  ROLE_REVOKED = 'role_revoked',
  PERMISSION_CHECK = 'permission_check',
  POLICY_CREATED = 'policy_created',
  POLICY_UPDATED = 'policy_updated',
  POLICY_DELETED = 'policy_deleted'
}

// Permission Service Interface Types
export interface PermissionService {
  // Permission checks
  checkPermission(check: PermissionCheck): Promise<PermissionResult>;
  checkMultiplePermissions(checks: PermissionCheck[]): Promise<PermissionResult[]>;
  hasPermission(userId: string, permission: Permission): Promise<boolean>;
  hasAnyPermission(userId: string, permissions: Permission[]): Promise<boolean>;
  hasAllPermissions(userId: string, permissions: Permission[]): Promise<boolean>;

  // Role management
  assignRole(userId: string, roleId: string, assignedBy: string): Promise<void>;
  revokeRole(userId: string, roleId: string): Promise<void>;
  getUserRoles(userId: string): Promise<Role[]>;
  getRoleUsers(roleId: string): Promise<string[]>;

  // Permission management
  grantPermission(assignment: Omit<UserPermission, 'id' | 'grantedAt'>): Promise<void>;
  revokePermission(userId: string, permissionId: string): Promise<void>;
  getUserPermissions(userId: string): Promise<Permission[]>;
  getEffectivePermissions(userId: string): Promise<Permission[]>;

  // Role hierarchy
  getRoleHierarchy(): RoleHierarchy;
  isRoleHigher(role1: SystemRole, role2: SystemRole): boolean;
  getInheritedPermissions(role: SystemRole): Permission[];

  // Policy management
  createPolicy(policy: Omit<PermissionPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<PermissionPolicy>;
  updatePolicy(id: string, updates: Partial<PermissionPolicy>): Promise<PermissionPolicy>;
  deletePolicy(id: string): Promise<void>;
  evaluatePolicy(policy: PermissionPolicy, context: PermissionContext): Promise<PermissionEffect>;

  // ACL management
  createACL(acl: Omit<ACL, 'id'>): Promise<ACL>;
  updateACL(resourceId: string, permissions: ACLPermission[]): Promise<ACL>;
  getACL(resourceId: string): Promise<ACL | null>;
  checkACLAccess(userId: string, resourceId: string, action: PermissionAction): Promise<boolean>;
}

// Permission Cache Types
export interface PermissionCache {
  getUserPermissions(userId: string): Promise<Permission[] | null>;
  setUserPermissions(userId: string, permissions: Permission[], ttl?: number): Promise<void>;
  invalidateUserPermissions(userId: string): Promise<void>;
  getPermissionCheck(check: PermissionCheck): Promise<PermissionResult | null>;
  setPermissionCheck(check: PermissionCheck, result: PermissionResult, ttl?: number): Promise<void>;
  invalidatePermissionCheck(check: PermissionCheck): Promise<void>;
  clear(): Promise<void>;
}

// Permission Validation Types
export interface PermissionValidation {
  validatePermission(permission: Permission): ValidationResult;
  validateRole(role: Role): ValidationResult;
  validatePermissionCheck(check: PermissionCheck): ValidationResult;
  validatePermissionCondition(condition: PermissionCondition): ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Permission Constants
export const PERMISSION_CONSTANTS = {
  CACHE_TTL: 300000, // 5 minutes
  MAX_PERMISSION_NAME_LENGTH: 100,
  MAX_PERMISSION_DESCRIPTION_LENGTH: 500,
  MAX_CONDITIONS_PER_RULE: 10,
  MAX_PERMISSIONS_PER_ROLE: 100,
  MAX_ROLES_PER_USER: 5,
  DEFAULT_PERMISSION_SCOPE: PermissionScope.OWN
} as const;

// Export convenience types
export type PermissionId = string;
export type RoleId = string;
export type UserId = string;
export type ResourceId = string;

// Export all permission-related types
export type PermissionTypes =
  | Permission
  | Role
  | UserPermission
  | UserRoleAssignment
  | PermissionCheck
  | PermissionResult
  | PermissionPolicy
  | ACL
  | PermissionAuditLog;