/**
 * Tests for Backend Authentication Types
 *
 * This file tests the TypeScript types and interfaces defined in backend/src/types/auth.types.ts
 * to ensure they work correctly and provide proper type safety.
 */

import {
  UserRole,
  Permission,
  UserData,
  UserProfile,
  AuthError,
  AuthErrorCode,
  UserModel,
  SessionModel,
  RefreshTokenModel,
  AuthService,
  TokenService,
  SessionService,
  AuthenticatedRequest,
  AuthMiddleware,
  RateLimitMiddleware,
  AuthController,
  LoginValidation,
  RegisterValidation,
  ChangePasswordValidation,
  ResetPasswordValidation,
  UpdateProfileValidation,
  UserRepository,
  SessionRepository,
  RefreshTokenRepository,
  UserFilter,
  SessionFilter,
  CreateUserData,
  UpdateUserData,
  AuthEvent,
  AuthEventType,
  AuthConfig,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  UserPayload,
  AuthBackendTypes
} from './auth.types';

describe('UserRole Enum', () => {
  it('should have correct enum values', () => {
    expect(UserRole.ADMIN).toBe('admin');
    expect(UserRole.USER).toBe('user');
    expect(UserRole.MODERATOR).toBe('moderator');
    expect(UserRole.FREELANCER).toBe('freelancer');
    expect(UserRole.CLIENT).toBe('client');
  });
});

describe('AuthErrorCode Enum', () => {
  it('should have correct enum values', () => {
    expect(AuthErrorCode.INVALID_CREDENTIALS).toBe('INVALID_CREDENTIALS');
    expect(AuthErrorCode.USER_NOT_FOUND).toBe('USER_NOT_FOUND');
    expect(AuthErrorCode.ACCOUNT_LOCKED).toBe('ACCOUNT_LOCKED');
    expect(AuthErrorCode.ACCOUNT_DISABLED).toBe('ACCOUNT_DISABLED');
    expect(AuthErrorCode.INVALID_TOKEN).toBe('INVALID_TOKEN');
    expect(AuthErrorCode.TOKEN_EXPIRED).toBe('TOKEN_EXPIRED');
    expect(AuthErrorCode.INSUFFICIENT_PERMISSIONS).toBe('INSUFFICIENT_PERMISSIONS');
    expect(AuthErrorCode.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED');
    expect(AuthErrorCode.NETWORK_ERROR).toBe('NETWORK_ERROR');
    expect(AuthErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    expect(AuthErrorCode.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
  });
});

describe('Permission Interface', () => {
  it('should create a valid Permission object', () => {
    const permission: Permission = {
      id: 'perm-1',
      name: 'read_users',
      description: 'Can read user data',
      resource: 'user',
      action: 'read'
    };

    expect(permission.id).toBe('perm-1');
    expect(permission.name).toBe('read_users');
    expect(permission.resource).toBe('user');
    expect(permission.action).toBe('read');
  });
});

describe('UserData Interface', () => {
  it('should create a valid UserData object', () => {
    const user: UserData = {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.USER,
      permissions: [
        { id: 'perm-1', name: 'read', description: 'Can read', resource: 'user', action: 'read' }
      ],
      isActive: true,
      isEmailVerified: true,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        bio: 'Test user',
        location: 'Test City',
        skills: ['JavaScript', 'TypeScript']
      }
    };

    expect(user.id).toBe('user-1');
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe(UserRole.USER);
    expect(user.permissions).toHaveLength(1);
    expect(user.isActive).toBe(true);
    expect(user.profile?.bio).toBe('Test user');
  });

  it('should handle optional profile', () => {
    const user: UserData = {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.USER,
      permissions: [],
      isActive: true,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(user.profile).toBeUndefined();
  });
});

describe('UserProfile Interface', () => {
  it('should create a valid UserProfile', () => {
    const profile: UserProfile = {
      avatar: 'avatar.jpg',
      bio: 'Software developer',
      location: 'San Francisco',
      website: 'https://example.com',
      skills: ['React', 'Node.js'],
      languages: ['English', 'Spanish']
    };

    expect(profile.avatar).toBe('avatar.jpg');
    expect(profile.bio).toBe('Software developer');
    expect(profile.skills).toEqual(['React', 'Node.js']);
  });

  it('should handle all optional properties', () => {
    const profile: UserProfile = {};

    expect(profile.avatar).toBeUndefined();
    expect(profile.bio).toBeUndefined();
    expect(profile.location).toBeUndefined();
    expect(profile.website).toBeUndefined();
    expect(profile.skills).toBeUndefined();
    expect(profile.languages).toBeUndefined();
  });
});

describe('AuthError Interface', () => {
  it('should create a valid AuthError', () => {
    const error: AuthError = {
      code: AuthErrorCode.INVALID_CREDENTIALS,
      message: 'Invalid email or password',
      timestamp: new Date(),
      details: { attemptCount: 3 }
    };

    expect(error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
    expect(error.message).toBe('Invalid email or password');
    expect(error.timestamp).toBeInstanceOf(Date);
    expect(error.details).toEqual({ attemptCount: 3 });
  });

  it('should handle optional details', () => {
    const error: AuthError = {
      code: AuthErrorCode.USER_NOT_FOUND,
      message: 'User not found',
      timestamp: new Date()
    };

    expect(error.details).toBeUndefined();
  });
});

describe('UserModel Interface', () => {
  it('should create a valid UserModel object', () => {
    const user: UserModel = {
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: '$2a$10$hashedpassword',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.USER,
      permissions: [
        { id: 'perm-1', name: 'read', description: 'Can read', resource: 'user', action: 'read' }
      ],
      isActive: true,
      isEmailVerified: true,
      emailVerificationToken: 'token123',
      emailVerificationExpiresAt: new Date(Date.now() + 86400000),
      passwordResetToken: 'reset123',
      passwordResetExpiresAt: new Date(Date.now() + 3600000),
      twoFactorSecret: 'JBSWY3DPEHPK3PXP',
      twoFactorEnabled: true,
      twoFactorBackupCodes: ['123456', '789012'],
      lastLoginAt: new Date(),
      loginAttempts: 0,
      lockExpiresAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(user.id).toBe('user-1');
    expect(user.email).toBe('test@example.com');
    expect(user.passwordHash).toBe('$2a$10$hashedpassword');
    expect(user.twoFactorEnabled).toBe(true);
    expect(user.twoFactorBackupCodes).toHaveLength(2);
    expect(user.loginAttempts).toBe(0);
  });

  it('should handle optional properties', () => {
    const user: UserModel = {
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: '$2a$10$hashedpassword',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.USER,
      permissions: [],
      isActive: true,
      isEmailVerified: false,
      twoFactorEnabled: false,
      loginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(user.emailVerificationToken).toBeUndefined();
    expect(user.passwordResetToken).toBeUndefined();
    expect(user.twoFactorSecret).toBeUndefined();
    expect(user.twoFactorBackupCodes).toBeUndefined();
    expect(user.lastLoginAt).toBeUndefined();
    expect(user.lockExpiresAt).toBeUndefined();
    expect(user.deletedAt).toBeUndefined();
  });
});

describe('SessionModel Interface', () => {
  it('should create a valid SessionModel object', () => {
    const session: SessionModel = {
      id: 'session-1',
      userId: 'user-1',
      tokenHash: 'hash123',
      refreshTokenHash: 'refreshHash123',
      userAgent: 'Mozilla/5.0...',
      ipAddress: '192.168.1.1',
      location: {
        country: 'United States',
        city: 'San Francisco',
        region: 'California'
      },
      deviceInfo: {
        type: 'desktop',
        os: 'macos',
        browser: 'chrome'
      },
      isRevoked: false,
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
      lastActivityAt: new Date()
    };

    expect(session.id).toBe('session-1');
    expect(session.userId).toBe('user-1');
    expect(session.tokenHash).toBe('hash123');
    expect(session.isRevoked).toBe(false);
    expect(session.location?.country).toBe('United States');
  });

  it('should handle optional properties', () => {
    const session: SessionModel = {
      id: 'session-1',
      userId: 'user-1',
      tokenHash: 'hash123',
      userAgent: 'Mozilla/5.0...',
      ipAddress: '192.168.1.1',
      deviceInfo: {
        type: 'mobile',
        os: 'android',
        browser: 'chrome'
      },
      isRevoked: false,
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
      lastActivityAt: new Date()
    };

    expect(session.refreshTokenHash).toBeUndefined();
    expect(session.location).toBeUndefined();
  });
});

describe('RefreshTokenModel Interface', () => {
  it('should create a valid RefreshTokenModel object', () => {
    const refreshToken: RefreshTokenModel = {
      id: 'refresh-1',
      userId: 'user-1',
      tokenHash: 'hash123',
      isRevoked: false,
      expiresAt: new Date(Date.now() + 2592000000), // 30 days
      createdAt: new Date(),
      replacedByToken: 'newToken123'
    };

    expect(refreshToken.id).toBe('refresh-1');
    expect(refreshToken.userId).toBe('user-1');
    expect(refreshToken.isRevoked).toBe(false);
    expect(refreshToken.replacedByToken).toBe('newToken123');
  });

  it('should handle optional properties', () => {
    const refreshToken: RefreshTokenModel = {
      id: 'refresh-1',
      userId: 'user-1',
      tokenHash: 'hash123',
      isRevoked: true,
      expiresAt: new Date(Date.now() + 2592000000),
      createdAt: new Date(),
      revokedAt: new Date()
    };

    expect(refreshToken.replacedByToken).toBeUndefined();
  });
});

describe('UserPayload Interface', () => {
  it('should create a valid JWT payload', () => {
    const payload: UserPayload = {
      sub: 'user-1',
      email: 'test@example.com',
      role: UserRole.USER,
      permissions: ['read', 'write'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    };

    expect(payload.sub).toBe('user-1');
    expect(payload.email).toBe('test@example.com');
    expect(payload.role).toBe(UserRole.USER);
    expect(payload.permissions).toEqual(['read', 'write']);
    expect(typeof payload.iat).toBe('number');
    expect(typeof payload.exp).toBe('number');
  });

  it('should handle optional issuer and audience', () => {
    const payload: UserPayload = {
      sub: 'user-1',
      email: 'test@example.com',
      role: UserRole.USER,
      permissions: [],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      iss: 'my-app',
      aud: 'my-audience'
    };

    expect(payload.iss).toBe('my-app');
    expect(payload.aud).toBe('my-audience');
  });
});

describe('CreateUserData Interface', () => {
  it('should create a valid CreateUserData object', () => {
    const createData: CreateUserData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.USER,
      isEmailVerified: false
    };

    expect(createData.email).toBe('test@example.com');
    expect(createData.password).toBe('password123');
    expect(createData.firstName).toBe('Test');
    expect(createData.role).toBe(UserRole.USER);
    expect(createData.isEmailVerified).toBe(false);
  });

  it('should handle optional properties', () => {
    const createData: CreateUserData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    expect(createData.role).toBeUndefined();
    expect(createData.isEmailVerified).toBeUndefined();
  });
});

describe('UpdateUserData Interface', () => {
  it('should create a valid UpdateUserData object', () => {
    const updateData: UpdateUserData = {
      firstName: 'Updated Test',
      lastName: 'Updated User',
      isActive: false,
      role: UserRole.MODERATOR,
      permissions: [
        { id: 'perm-1', name: 'read', description: 'Can read', resource: 'user', action: 'read' },
        { id: 'perm-2', name: 'write', description: 'Can write', resource: 'user', action: 'write' }
      ]
    };

    expect(updateData.firstName).toBe('Updated Test');
    expect(updateData.lastName).toBe('Updated User');
    expect(updateData.isActive).toBe(false);
    expect(updateData.role).toBe(UserRole.MODERATOR);
    expect(updateData.permissions).toHaveLength(2);
  });

  it('should handle partial updates', () => {
    const updateData: UpdateUserData = {
      isActive: true
    };

    expect(updateData.isActive).toBe(true);
    expect(updateData.firstName).toBeUndefined();
    expect(updateData.lastName).toBeUndefined();
    expect(updateData.role).toBeUndefined();
    expect(updateData.permissions).toBeUndefined();
  });
});

describe('AuthEvent Interface', () => {
  it('should create a valid AuthEvent object', () => {
    const event: AuthEvent = {
      type: AuthEventType.USER_LOGIN,
      userId: 'user-1',
      sessionId: 'session-1',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
      timestamp: new Date(),
      metadata: { success: true, method: 'password' }
    };

    expect(event.type).toBe(AuthEventType.USER_LOGIN);
    expect(event.userId).toBe('user-1');
    expect(event.sessionId).toBe('session-1');
    expect(event.timestamp).toBeInstanceOf(Date);
    expect(event.metadata?.success).toBe(true);
  });

  it('should handle optional properties', () => {
    const event: AuthEvent = {
      type: AuthEventType.USER_LOGOUT,
      userId: 'user-1',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
      timestamp: new Date()
    };

    expect(event.sessionId).toBeUndefined();
    expect(event.metadata).toBeUndefined();
  });
});

describe('AuthEventType Enum', () => {
  it('should have correct enum values', () => {
    expect(AuthEventType.USER_LOGIN).toBe('USER_LOGIN');
    expect(AuthEventType.USER_LOGOUT).toBe('USER_LOGOUT');
    expect(AuthEventType.USER_REGISTER).toBe('USER_REGISTER');
    expect(AuthEventType.PASSWORD_CHANGE).toBe('PASSWORD_CHANGE');
    expect(AuthEventType.PASSWORD_RESET).toBe('PASSWORD_RESET');
    expect(AuthEventType.EMAIL_VERIFICATION).toBe('EMAIL_VERIFICATION');
    expect(AuthEventType.TWO_FACTOR_SETUP).toBe('TWO_FACTOR_SETUP');
    expect(AuthEventType.TWO_FACTOR_DISABLE).toBe('TWO_FACTOR_DISABLE');
    expect(AuthEventType.SESSION_REVOKE).toBe('SESSION_REVOKE');
    expect(AuthEventType.TOKEN_REFRESH).toBe('TOKEN_REFRESH');
    expect(AuthEventType.LOGIN_ATTEMPT_FAILED).toBe('LOGIN_ATTEMPT_FAILED');
    expect(AuthEventType.ACCOUNT_LOCKED).toBe('ACCOUNT_LOCKED');
    expect(AuthEventType.ACCOUNT_UNLOCKED).toBe('ACCOUNT_UNLOCKED');
  });
});

describe('Error Classes', () => {
  it('should create AuthenticationError', () => {
    const error = new AuthenticationError(
      'Invalid credentials',
      AuthErrorCode.INVALID_CREDENTIALS,
      401,
      { attemptCount: 3 }
    );

    expect(error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
    expect(error.message).toBe('Invalid credentials');
    expect(error.statusCode).toBe(401);
    expect(error.details).toEqual({ attemptCount: 3 });
  });

  it('should create AuthorizationError', () => {
    const error = new AuthorizationError(
      'Insufficient permissions',
      AuthErrorCode.INSUFFICIENT_PERMISSIONS,
      403,
      ['read_admin'],
      [UserRole.USER]
    );

    expect(error.code).toBe(AuthErrorCode.INSUFFICIENT_PERMISSIONS);
    expect(error.message).toBe('Insufficient permissions');
    expect(error.statusCode).toBe(403);
    expect(error.requiredPermissions).toEqual(['read_admin']);
    expect(error.requiredRoles).toEqual([UserRole.USER]);
  });

  it('should create ValidationError', () => {
    const error = new ValidationError(
      'Validation failed',
      AuthErrorCode.VALIDATION_ERROR,
      400,
      'email'
    );

    expect(error.code).toBe(AuthErrorCode.VALIDATION_ERROR);
    expect(error.message).toBe('Validation failed');
    expect(error.statusCode).toBe(400);
    expect(error.field).toBe('email');
  });
});

describe('UserFilter Interface', () => {
  it('should create a valid UserFilter object', () => {
    const filter: UserFilter = {
      role: UserRole.ADMIN,
      isActive: true,
      isEmailVerified: true,
      createdAfter: new Date('2023-01-01'),
      createdBefore: new Date(),
      search: 'test user',
      limit: 10,
      offset: 0,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    expect(filter.role).toBe(UserRole.ADMIN);
    expect(filter.isActive).toBe(true);
    expect(filter.isEmailVerified).toBe(true);
    expect(filter.createdAfter).toBeInstanceOf(Date);
    expect(filter.createdBefore).toBeInstanceOf(Date);
    expect(filter.search).toBe('test user');
    expect(filter.limit).toBe(10);
    expect(filter.offset).toBe(0);
    expect(filter.sortBy).toBe('createdAt');
    expect(filter.sortOrder).toBe('desc');
  });

  it('should handle optional properties', () => {
    const filter: UserFilter = {
      role: UserRole.USER
    };

    expect(filter.role).toBe(UserRole.USER);
    expect(filter.isActive).toBeUndefined();
    expect(filter.isEmailVerified).toBeUndefined();
    expect(filter.createdAfter).toBeUndefined();
    expect(filter.createdBefore).toBeUndefined();
    expect(filter.search).toBeUndefined();
    expect(filter.limit).toBeUndefined();
    expect(filter.offset).toBeUndefined();
    expect(filter.sortBy).toBeUndefined();
    expect(filter.sortOrder).toBeUndefined();
  });
});

describe('SessionFilter Interface', () => {
  it('should create a valid SessionFilter object', () => {
    const filter: SessionFilter = {
      userId: 'user-1',
      isRevoked: false,
      createdAfter: new Date(Date.now() - 86400000),
      createdBefore: new Date(),
      limit: 10,
      offset: 0
    };

    expect(filter.userId).toBe('user-1');
    expect(filter.isRevoked).toBe(false);
    expect(filter.createdAfter).toBeInstanceOf(Date);
    expect(filter.createdBefore).toBeInstanceOf(Date);
    expect(filter.limit).toBe(10);
    expect(filter.offset).toBe(0);
  });

  it('should handle partial filters', () => {
    const filter: SessionFilter = {
      isRevoked: true
    };

    expect(filter.isRevoked).toBe(true);
    expect(filter.userId).toBeUndefined();
    expect(filter.createdAfter).toBeUndefined();
  });
});

describe('AuthBackendTypes Union', () => {
  it('should accept various backend auth types', () => {
    const userModel: AuthBackendTypes = {
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: '$2a$10$hashedpassword',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.USER,
      permissions: [],
      isActive: true,
      isEmailVerified: true,
      twoFactorEnabled: false,
      loginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const sessionModel: AuthBackendTypes = {
      id: 'session-1',
      userId: 'user-1',
      tokenHash: 'hash123',
      userAgent: 'Mozilla/5.0...',
      ipAddress: '192.168.1.1',
      deviceInfo: {
        type: 'desktop',
        os: 'macos',
        browser: 'chrome'
      },
      isRevoked: false,
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
      lastActivityAt: new Date()
    };

    const authError: AuthBackendTypes = new AuthenticationError(
      AuthErrorCode.INVALID_CREDENTIALS,
      'Invalid credentials'
    );

    expect(userModel).toBeDefined();
    expect(sessionModel).toBeDefined();
    expect(authError).toBeDefined();
  });
});

// Type guards for runtime type checking
describe('Type Guards', () => {
  it('should identify UserRole correctly', () => {
    const isUserRole = (value: string): value is UserRole => {
      return Object.values(UserRole).includes(value as UserRole);
    };

    expect(isUserRole('admin')).toBe(true);
    expect(isUserRole('invalid')).toBe(false);
  });

  it('should identify AuthErrorCode correctly', () => {
    const isAuthErrorCode = (value: string): value is AuthErrorCode => {
      return Object.values(AuthErrorCode).includes(value as AuthErrorCode);
    };

    expect(isAuthErrorCode('INVALID_CREDENTIALS')).toBe(true);
    expect(isAuthErrorCode('INVALID_CODE')).toBe(false);
  });

  it('should identify AuthEventType correctly', () => {
    const isAuthEventType = (value: string): value is AuthEventType => {
      return Object.values(AuthEventType).includes(value as AuthEventType);
    };

    expect(isAuthEventType('USER_LOGIN')).toBe(true);
    expect(isAuthEventType('INVALID_EVENT')).toBe(false);
  });
});