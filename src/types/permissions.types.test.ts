/**
 * Tests for Permissions Types
 *
 * This file tests the TypeScript types and interfaces defined in permissions.types.ts
 * to ensure they work correctly and provide proper type safety.
 */

import {
  PermissionResource,
  PermissionAction,
  Permission,
  PermissionScope,
  PermissionOperator,
  Role,
  SystemRole,
  PermissionGroup,
  PermissionCategory,
  UserPermission,
  UserRoleAssignment,
  PermissionCheck,
  PermissionContext,
  PermissionResult,
  PermissionDenialReason,
  PermissionPolicy,
  PermissionRule,
  PermissionEffect,
  ACL,
  ACLPermission,
  PermissionAuditLog,
  PermissionAuditAction,
  PERMISSION_CONSTANTS,
  PermissionId,
  RoleId,
  UserId,
  ResourceId,
  PermissionTypes
} from './permissions.types';

describe('PermissionResource Enum', () => {
  it('should have correct enum values', () => {
    expect(PermissionResource.USER).toBe('user');
    expect(PermissionResource.PROJECT).toBe('project');
    expect(PermissionResource.CONTRACT).toBe('contract');
    expect(PermissionResource.PAYMENT).toBe('payment');
    expect(PermissionResource.REVIEW).toBe('review');
    expect(PermissionResource.DISPUTE).toBe('dispute');
    expect(PermissionResource.ADMIN).toBe('admin');
    expect(PermissionResource.SYSTEM).toBe('system');
    expect(PermissionResource.NOTIFICATION).toBe('notification');
    expect(PermissionResource.PROFILE).toBe('profile');
    expect(PermissionResource.SESSION).toBe('session');
  });
});

describe('PermissionAction Enum', () => {
  it('should have correct enum values', () => {
    expect(PermissionAction.CREATE).toBe('create');
    expect(PermissionAction.READ).toBe('read');
    expect(PermissionAction.UPDATE).toBe('update');
    expect(PermissionAction.DELETE).toBe('delete');
    expect(PermissionAction.MANAGE).toBe('manage');
    expect(PermissionAction.APPROVE).toBe('approve');
    expect(PermissionAction.REJECT).toBe('reject');
    expect(PermissionAction.VIEW).toBe('view');
    expect(PermissionAction.EDIT).toBe('edit');
    expect(PermissionAction.PUBLISH).toBe('publish');
    expect(PermissionAction.ARCHIVE).toBe('archive');
    expect(PermissionAction.EXPORT).toBe('export');
    expect(PermissionAction.IMPORT).toBe('import');
  });
});

describe('PermissionScope Enum', () => {
  it('should have correct enum values', () => {
    expect(PermissionScope.GLOBAL).toBe('global');
    expect(PermissionScope.OWN).toBe('own');
    expect(PermissionScope.TEAM).toBe('team');
    expect(PermissionScope.DEPARTMENT).toBe('department');
    expect(PermissionScope.ORGANIZATION).toBe('organization');
  });
});

describe('PermissionOperator Enum', () => {
  it('should have correct enum values', () => {
    expect(PermissionOperator.EQUALS).toBe('equals');
    expect(PermissionOperator.NOT_EQUALS).toBe('not_equals');
    expect(PermissionOperator.IN).toBe('in');
    expect(PermissionOperator.NOT_IN).toBe('not_in');
    expect(PermissionOperator.GREATER_THAN).toBe('greater_than');
    expect(PermissionOperator.LESS_THAN).toBe('less_than');
    expect(PermissionOperator.CONTAINS).toBe('contains');
    expect(PermissionOperator.STARTS_WITH).toBe('starts_with');
    expect(PermissionOperator.ENDS_WITH).toBe('ends_with');
  });
});

describe('Permission Interface', () => {
  it('should create a valid Permission object', () => {
    const permission: Permission = {
      id: 'perm-1',
      name: 'read_users',
      description: 'Can read user data',
      resource: PermissionResource.USER,
      action: PermissionAction.READ,
      scope: PermissionScope.OWN
    };

    expect(permission.id).toBe('perm-1');
    expect(permission.name).toBe('read_users');
    expect(permission.resource).toBe(PermissionResource.USER);
    expect(permission.action).toBe(PermissionAction.READ);
    expect(permission.scope).toBe(PermissionScope.OWN);
  });

  it('should handle optional scope', () => {
    const permission: Permission = {
      id: 'perm-2',
      name: 'manage_system',
      description: 'Can manage system settings',
      resource: PermissionResource.SYSTEM,
      action: PermissionAction.MANAGE
    };

    expect(permission.scope).toBeUndefined();
  });
});

describe('SystemRole Enum', () => {
  it('should have correct enum values', () => {
    expect(SystemRole.SUPER_ADMIN).toBe('super_admin');
    expect(SystemRole.ADMIN).toBe('admin');
    expect(SystemRole.MODERATOR).toBe('moderator');
    expect(SystemRole.USER).toBe('user');
    expect(SystemRole.FREELANCER).toBe('freelancer');
    expect(SystemRole.CLIENT).toBe('client');
    expect(SystemRole.GUEST).toBe('guest');
  });
});

describe('Role Interface', () => {
  it('should create a valid Role object', () => {
    const permissions: Permission[] = [
      {
        id: 'perm-1',
        name: 'read_users',
        description: 'Can read user data',
        resource: PermissionResource.USER,
        action: PermissionAction.READ
      }
    ];

    const role: Role = {
      id: 'role-1',
      name: 'User',
      description: 'Standard user role',
      permissions,
      isSystemRole: true,
      hierarchy: 40,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(role.id).toBe('role-1');
    expect(role.name).toBe('User');
    expect(role.permissions).toEqual(permissions);
    expect(role.isSystemRole).toBe(true);
    expect(role.hierarchy).toBe(40);
    expect(role.createdAt).toBeInstanceOf(Date);
  });
});

describe('PermissionGroup Interface', () => {
  it('should create a valid PermissionGroup', () => {
    const permissions: Permission[] = [
      {
        id: 'perm-1',
        name: 'read_users',
        description: 'Can read user data',
        resource: PermissionResource.USER,
        action: PermissionAction.READ
      }
    ];

    const group: PermissionGroup = {
      id: 'group-1',
      name: 'User Management',
      description: 'Permissions for managing users',
      permissions,
      category: PermissionCategory.USER_MANAGEMENT
    };

    expect(group.id).toBe('group-1');
    expect(group.name).toBe('User Management');
    expect(group.category).toBe(PermissionCategory.USER_MANAGEMENT);
  });
});

describe('PermissionCategory Enum', () => {
  it('should have correct enum values', () => {
    expect(PermissionCategory.USER_MANAGEMENT).toBe('user_management');
    expect(PermissionCategory.CONTENT_MANAGEMENT).toBe('content_management');
    expect(PermissionCategory.FINANCIAL).toBe('financial');
    expect(PermissionCategory.SYSTEM_ADMIN).toBe('system_admin');
    expect(PermissionCategory.COMMUNICATION).toBe('communication');
    expect(PermissionCategory.PROJECT_MANAGEMENT).toBe('project_management');
  });
});

describe('UserPermission Interface', () => {
  it('should create a valid UserPermission', () => {
    const userPermission: UserPermission = {
      userId: 'user-1',
      permissionId: 'perm-1',
      grantedBy: 'admin-1',
      grantedAt: new Date(),
      expiresAt: new Date(Date.now() + 86400000), // 24 hours
      isActive: true,
      scope: PermissionScope.OWN
    };

    expect(userPermission.userId).toBe('user-1');
    expect(userPermission.permissionId).toBe('perm-1');
    expect(userPermission.grantedBy).toBe('admin-1');
    expect(userPermission.isActive).toBe(true);
    expect(userPermission.scope).toBe(PermissionScope.OWN);
  });

  it('should handle optional properties', () => {
    const userPermission: UserPermission = {
      userId: 'user-1',
      permissionId: 'perm-1',
      grantedBy: 'admin-1',
      grantedAt: new Date(),
      isActive: true
    };

    expect(userPermission.expiresAt).toBeUndefined();
    expect(userPermission.scope).toBeUndefined();
  });
});

describe('UserRoleAssignment Interface', () => {
  it('should create a valid UserRoleAssignment', () => {
    const assignment: UserRoleAssignment = {
      userId: 'user-1',
      roleId: 'role-1',
      assignedBy: 'admin-1',
      assignedAt: new Date(),
      expiresAt: new Date(Date.now() + 86400000),
      isActive: true
    };

    expect(assignment.userId).toBe('user-1');
    expect(assignment.roleId).toBe('role-1');
    expect(assignment.assignedBy).toBe('admin-1');
    expect(assignment.isActive).toBe(true);
  });
});

describe('PermissionCheck Interface', () => {
  it('should create a valid PermissionCheck', () => {
    const check: PermissionCheck = {
      userId: 'user-1',
      resource: PermissionResource.PROJECT,
      action: PermissionAction.READ,
      resourceId: 'project-1',
      context: {
        userId: 'user-1',
        resourceOwnerId: 'user-2',
        projectId: 'project-1'
      }
    };

    expect(check.userId).toBe('user-1');
    expect(check.resource).toBe(PermissionResource.PROJECT);
    expect(check.action).toBe(PermissionAction.READ);
    expect(check.resourceId).toBe('project-1');
    expect(check.context?.projectId).toBe('project-1');
  });

  it('should handle optional properties', () => {
    const check: PermissionCheck = {
      userId: 'user-1',
      resource: PermissionResource.USER,
      action: PermissionAction.READ
    };

    expect(check.resourceId).toBeUndefined();
    expect(check.context).toBeUndefined();
  });
});

describe('PermissionContext Interface', () => {
  it('should create a valid PermissionContext', () => {
    const context: PermissionContext = {
      userId: 'user-1',
      resourceOwnerId: 'user-2',
      teamId: 'team-1',
      departmentId: 'dept-1',
      organizationId: 'org-1',
      projectId: 'project-1',
      contractId: 'contract-1',
      customField: 'custom-value'
    };

    expect(context.userId).toBe('user-1');
    expect(context.resourceOwnerId).toBe('user-2');
    expect(context.customField).toBe('custom-value');
  });
});

describe('PermissionResult Interface', () => {
  it('should create a successful PermissionResult', () => {
    const permissions: Permission[] = [
      {
        id: 'perm-1',
        name: 'read_project',
        description: 'Can read project',
        resource: PermissionResource.PROJECT,
        action: PermissionAction.READ
      }
    ];

    const result: PermissionResult = {
      granted: true,
      requiredPermissions: permissions,
      userPermissions: permissions,
      context: {
        userId: 'user-1',
        projectId: 'project-1'
      }
    };

    expect(result.granted).toBe(true);
    expect(result.reason).toBeUndefined();
    expect(result.requiredPermissions).toEqual(permissions);
  });

  it('should create a denied PermissionResult', () => {
    const result: PermissionResult = {
      granted: false,
      reason: PermissionDenialReason.INSUFFICIENT_PERMISSIONS,
      requiredPermissions: [],
      userPermissions: []
    };

    expect(result.granted).toBe(false);
    expect(result.reason).toBe(PermissionDenialReason.INSUFFICIENT_PERMISSIONS);
  });
});

describe('PermissionDenialReason Enum', () => {
  it('should have correct enum values', () => {
    expect(PermissionDenialReason.INSUFFICIENT_PERMISSIONS).toBe('insufficient_permissions');
    expect(PermissionDenialReason.RESOURCE_NOT_FOUND).toBe('resource_not_found');
    expect(PermissionDenialReason.RESOURCE_ACCESS_DENIED).toBe('resource_access_denied');
    expect(PermissionDenialReason.SCOPE_VIOLATION).toBe('scope_violation');
    expect(PermissionDenialReason.CONDITION_NOT_MET).toBe('condition_not_met');
    expect(PermissionDenialReason.PERMISSION_EXPIRED).toBe('permission_expired');
    expect(PermissionDenialReason.USER_INACTIVE).toBe('user_inactive');
    expect(PermissionDenialReason.SYSTEM_ERROR).toBe('system_error');
  });
});

describe('PermissionPolicy Interface', () => {
  it('should create a valid PermissionPolicy', () => {
    const rules: PermissionRule[] = [
      {
        resource: PermissionResource.PROJECT,
        action: PermissionAction.READ,
        conditions: [
          {
            field: 'status',
            operator: PermissionOperator.EQUALS,
            value: 'active'
          }
        ],
        effect: PermissionEffect.ALLOW
      }
    ];

    const policy: PermissionPolicy = {
      id: 'policy-1',
      name: 'Active Project Access',
      description: 'Allow access to active projects only',
      rules,
      isActive: true,
      priority: 10,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(policy.id).toBe('policy-1');
    expect(policy.name).toBe('Active Project Access');
    expect(policy.rules).toEqual(rules);
    expect(policy.isActive).toBe(true);
    expect(policy.priority).toBe(10);
  });
});

describe('PermissionRule Interface', () => {
  it('should create a valid PermissionRule', () => {
    const rule: PermissionRule = {
      resource: PermissionResource.CONTRACT,
      action: PermissionAction.UPDATE,
      conditions: [
        {
          field: 'ownerId',
          operator: PermissionOperator.EQUALS,
          value: 'user-1'
        }
      ],
      effect: PermissionEffect.ALLOW
    };

    expect(rule.resource).toBe(PermissionResource.CONTRACT);
    expect(rule.action).toBe(PermissionAction.UPDATE);
    expect(rule.conditions).toHaveLength(1);
    expect(rule.effect).toBe(PermissionEffect.ALLOW);
  });
});

describe('PermissionEffect Enum', () => {
  it('should have correct enum values', () => {
    expect(PermissionEffect.ALLOW).toBe('allow');
    expect(PermissionEffect.DENY).toBe('deny');
  });
});

describe('ACL Interface', () => {
  it('should create a valid ACL', () => {
    const permissions: ACLPermission[] = [
      {
        permission: {
          id: 'perm-1',
          name: 'read_project',
          description: 'Can read project',
          resource: PermissionResource.PROJECT,
          action: PermissionAction.READ
        },
        grantedBy: 'admin-1',
        grantedAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000)
      }
    ];

    const acl: ACL = {
      resourceId: 'project-1',
      resourceType: PermissionResource.PROJECT,
      permissions
    };

    expect(acl.resourceId).toBe('project-1');
    expect(acl.resourceType).toBe(PermissionResource.PROJECT);
    expect(acl.permissions).toEqual(permissions);
  });
});

describe('ACLPermission Interface', () => {
  it('should create a valid ACLPermission', () => {
    const permission: ACLPermission = {
      userId: 'user-1',
      roleId: 'role-1',
      permission: {
        id: 'perm-1',
        name: 'read_project',
        description: 'Can read project',
        resource: PermissionResource.PROJECT,
        action: PermissionAction.READ
      },
      grantedBy: 'admin-1',
      grantedAt: new Date(),
      expiresAt: new Date(Date.now() + 86400000)
    };

    expect(permission.userId).toBe('user-1');
    expect(permission.roleId).toBe('role-1');
    expect(permission.grantedBy).toBe('admin-1');
    expect(permission.expiresAt).toBeInstanceOf(Date);
  });

  it('should handle optional userId or roleId', () => {
    const permission: ACLPermission = {
      permission: {
        id: 'perm-1',
        name: 'read_project',
        description: 'Can read project',
        resource: PermissionResource.PROJECT,
        action: PermissionAction.READ
      },
      grantedBy: 'admin-1',
      grantedAt: new Date()
    };

    expect(permission.userId).toBeUndefined();
    expect(permission.roleId).toBeUndefined();
    expect(permission.expiresAt).toBeUndefined();
  });
});

describe('PermissionAuditLog Interface', () => {
  it('should create a valid PermissionAuditLog', () => {
    const auditLog: PermissionAuditLog = {
      id: 'audit-1',
      userId: 'user-1',
      action: PermissionAuditAction.PERMISSION_GRANTED,
      resource: PermissionResource.USER,
      resourceId: 'user-2',
      permission: {
        id: 'perm-1',
        name: 'read_user',
        description: 'Can read user',
        resource: PermissionResource.USER,
        action: PermissionAction.READ
      },
      oldValue: null,
      newValue: 'granted',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
      timestamp: new Date(),
      success: true
    };

    expect(auditLog.id).toBe('audit-1');
    expect(auditLog.userId).toBe('user-1');
    expect(auditLog.action).toBe(PermissionAuditAction.PERMISSION_GRANTED);
    expect(auditLog.success).toBe(true);
  });

  it('should handle optional properties', () => {
    const auditLog: PermissionAuditLog = {
      id: 'audit-1',
      userId: 'user-1',
      action: PermissionAuditAction.PERMISSION_GRANTED,
      resource: PermissionResource.USER,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
      timestamp: new Date(),
      success: false,
      errorMessage: 'Permission denied'
    };

    expect(auditLog.resourceId).toBeUndefined();
    expect(auditLog.permission).toBeUndefined();
    expect(auditLog.errorMessage).toBe('Permission denied');
  });
});

describe('PermissionAuditAction Enum', () => {
  it('should have correct enum values', () => {
    expect(PermissionAuditAction.PERMISSION_GRANTED).toBe('permission_granted');
    expect(PermissionAuditAction.PERMISSION_REVOKED).toBe('permission_revoked');
    expect(PermissionAuditAction.ROLE_ASSIGNED).toBe('role_assigned');
    expect(PermissionAuditAction.ROLE_REVOKED).toBe('role_revoked');
    expect(PermissionAuditAction.PERMISSION_CHECK).toBe('permission_check');
    expect(PermissionAuditAction.POLICY_CREATED).toBe('policy_created');
    expect(PermissionAuditAction.POLICY_UPDATED).toBe('policy_updated');
    expect(PermissionAuditAction.POLICY_DELETED).toBe('policy_deleted');
  });
});

describe('PERMISSION_CONSTANTS', () => {
  it('should have correct constant values', () => {
    expect(PERMISSION_CONSTANTS.CACHE_TTL).toBe(300000);
    expect(PERMISSION_CONSTANTS.MAX_PERMISSION_NAME_LENGTH).toBe(100);
    expect(PERMISSION_CONSTANTS.MAX_PERMISSION_DESCRIPTION_LENGTH).toBe(500);
    expect(PERMISSION_CONSTANTS.MAX_CONDITIONS_PER_RULE).toBe(10);
    expect(PERMISSION_CONSTANTS.MAX_PERMISSIONS_PER_ROLE).toBe(100);
    expect(PERMISSION_CONSTANTS.MAX_ROLES_PER_USER).toBe(5);
    expect(PERMISSION_CONSTANTS.DEFAULT_PERMISSION_SCOPE).toBe(PermissionScope.OWN);
  });
});

// Type aliases
describe('Type Aliases', () => {
  it('should work with PermissionId', () => {
    const id: PermissionId = 'perm-1';
    expect(id).toBe('perm-1');
  });

  it('should work with RoleId', () => {
    const id: RoleId = 'role-1';
    expect(id).toBe('role-1');
  });

  it('should work with UserId', () => {
    const id: UserId = 'user-1';
    expect(id).toBe('user-1');
  });

  it('should work with ResourceId', () => {
    const id: ResourceId = 'resource-1';
    expect(id).toBe('resource-1');
  });
});

describe('PermissionTypes Union', () => {
  it('should accept various permission types', () => {
    const permission: PermissionTypes = {
      id: 'perm-1',
      name: 'read_users',
      description: 'Can read user data',
      resource: PermissionResource.USER,
      action: PermissionAction.READ
    };

    const role: PermissionTypes = {
      id: 'role-1',
      name: 'User',
      description: 'Standard user role',
      permissions: [],
      isSystemRole: true,
      hierarchy: 40,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const userPermission: PermissionTypes = {
      userId: 'user-1',
      permissionId: 'perm-1',
      grantedBy: 'admin-1',
      grantedAt: new Date(),
      isActive: true
    };

    expect(permission).toBeDefined();
    expect(role).toBeDefined();
    expect(userPermission).toBeDefined();
  });
});

// Type guards for runtime type checking
describe('Type Guards', () => {
  it('should identify PermissionResource correctly', () => {
    const isPermissionResource = (value: string): value is PermissionResource => {
      return Object.values(PermissionResource).includes(value as PermissionResource);
    };

    expect(isPermissionResource('user')).toBe(true);
    expect(isPermissionResource('invalid')).toBe(false);
  });

  it('should identify PermissionAction correctly', () => {
    const isPermissionAction = (value: string): value is PermissionAction => {
      return Object.values(PermissionAction).includes(value as PermissionAction);
    };

    expect(isPermissionAction('read')).toBe(true);
    expect(isPermissionAction('invalid')).toBe(false);
  });

  it('should identify SystemRole correctly', () => {
    const isSystemRole = (value: string): value is SystemRole => {
      return Object.values(SystemRole).includes(value as SystemRole);
    };

    expect(isSystemRole('admin')).toBe(true);
    expect(isSystemRole('invalid')).toBe(false);
  });

  it('should identify PermissionScope correctly', () => {
    const isPermissionScope = (value: string): value is PermissionScope => {
      return Object.values(PermissionScope).includes(value as PermissionScope);
    };

    expect(isPermissionScope('own')).toBe(true);
    expect(isPermissionScope('invalid')).toBe(false);
  });
});