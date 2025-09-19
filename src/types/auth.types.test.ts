/**
 * Tests for Authentication Types
 *
 * This file tests the TypeScript types and interfaces defined in auth.types.ts
 * to ensure they work correctly and provide proper type safety.
 */

import {
  UserRole,
  Permission,
  LoginRequest,
  LoginResponse,
  UserPayload,
  RefreshTokenRequest,
  RefreshTokenResponse,
  AuthError,
  AuthErrorCode,
  AuthState,
  UserData,
  UserProfile,
  AccessToken,
  RefreshToken,
  ApiResponse,
  ValidationError,
  ValidationErrorResponse,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  EmailVerificationRequest,
  EmailVerificationConfirmRequest,
  TwoFactorSetupRequest,
  TwoFactorSetupResponse,
  TwoFactorVerifyRequest,
  LogoutRequest,
  LogoutResponse,
  RegisterRequest,
  RegisterResponse,
  ChangePasswordRequest,
  UpdateProfileRequest,
  AuthTypes
} from './auth.types';

describe('UserRole Enum', () => {
  it('should have correct enum values', () => {
    expect(UserRole.ADMIN).toBe('admin');
    expect(UserRole.USER).toBe('user');
    expect(UserRole.MODERATOR).toBe('moderator');
    expect(UserRole.GUEST).toBe('guest');
  });

  it('should be assignable to string', () => {
    const role: UserRole = UserRole.ADMIN;
    const roleString: string = role;
    expect(roleString).toBe('admin');
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

describe('LoginRequest Interface', () => {
  it('should create a valid LoginRequest', () => {
    const request: LoginRequest = {
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true
    };

    expect(request.email).toBe('test@example.com');
    expect(request.password).toBe('password123');
    expect(request.rememberMe).toBe(true);
  });

  it('should handle optional rememberMe', () => {
    const request: LoginRequest = {
      email: 'test@example.com',
      password: 'password123'
    };

    expect(request.email).toBe('test@example.com');
    expect(request.rememberMe).toBeUndefined();
  });
});

describe('LoginResponse Interface', () => {
  it('should create a valid LoginResponse', () => {
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

    const response: LoginResponse = {
      success: true,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user,
      expiresIn: 3600,
      tokenType: 'Bearer'
    };

    expect(response.success).toBe(true);
    expect(response.accessToken).toBe('access-token');
    expect(response.user).toEqual(user);
    expect(response.expiresIn).toBe(3600);
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

describe('AuthErrorCode Enum', () => {
  it('should have all expected error codes', () => {
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

describe('AuthState Interface', () => {
  it('should create a valid AuthState', () => {
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

    const state: AuthState = {
      isAuthenticated: true,
      isLoading: false,
      user,
      error: null
    };

    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.user).toEqual(user);
    expect(state.error).toBeNull();
  });

  it('should handle optional properties', () => {
    const state: AuthState = {
      isAuthenticated: false,
      isLoading: true,
      user: null,
      error: null,
      lastLoginAttempt: new Date()
    };

    expect(state.isAuthenticated).toBe(false);
    expect(state.lastLoginAttempt).toBeInstanceOf(Date);
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

describe('Token Interfaces', () => {
  it('should create valid AccessToken', () => {
    const token: AccessToken = {
      token: 'access-token',
      expiresAt: new Date(Date.now() + 3600000),
      userId: 'user-1'
    };

    expect(token.token).toBe('access-token');
    expect(token.expiresAt).toBeInstanceOf(Date);
    expect(token.userId).toBe('user-1');
  });

  it('should create valid RefreshToken', () => {
    const token: RefreshToken = {
      token: 'refresh-token',
      expiresAt: new Date(Date.now() + 86400000),
      userId: 'user-1',
      isRevoked: false
    };

    expect(token.token).toBe('refresh-token');
    expect(token.isRevoked).toBe(false);
  });
});

describe('ApiResponse Interface', () => {
  it('should create a successful ApiResponse', () => {
    const response: ApiResponse<string> = {
      success: true,
      data: 'test data',
      timestamp: new Date(),
      requestId: 'req-1'
    };

    expect(response.success).toBe(true);
    expect(response.data).toBe('test data');
    expect(response.error).toBeUndefined();
    expect(response.timestamp).toBeInstanceOf(Date);
  });

  it('should create an error ApiResponse', () => {
    const error: AuthError = {
      code: AuthErrorCode.INVALID_CREDENTIALS,
      message: 'Invalid credentials',
      timestamp: new Date()
    };

    const response: ApiResponse = {
      success: false,
      error,
      timestamp: new Date(),
      requestId: 'req-1'
    };

    expect(response.success).toBe(false);
    expect(response.data).toBeUndefined();
    expect(response.error).toEqual(error);
  });
});

describe('Validation Types', () => {
  it('should create ValidationError', () => {
    const error: ValidationError = {
      field: 'email',
      message: 'Email is required',
      code: 'REQUIRED',
      value: ''
    };

    expect(error.field).toBe('email');
    expect(error.message).toBe('Email is required');
    expect(error.code).toBe('REQUIRED');
  });

  it('should create ValidationErrorResponse', () => {
    const response: ValidationErrorResponse = {
      errors: [
        {
          field: 'email',
          message: 'Invalid email format',
          code: 'INVALID_FORMAT'
        }
      ],
      message: 'Validation failed'
    };

    expect(response.errors).toHaveLength(1);
    expect(response.message).toBe('Validation failed');
  });
});

describe('Password Reset Types', () => {
  it('should create PasswordResetRequest', () => {
    const request: PasswordResetRequest = {
      email: 'test@example.com'
    };

    expect(request.email).toBe('test@example.com');
  });

  it('should create PasswordResetConfirmRequest', () => {
    const request: PasswordResetConfirmRequest = {
      token: 'reset-token',
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123'
    };

    expect(request.token).toBe('reset-token');
    expect(request.newPassword).toBe('newpassword123');
  });
});

describe('Two-Factor Authentication Types', () => {
  it('should create TwoFactorSetupRequest', () => {
    const request: TwoFactorSetupRequest = {
      method: 'app',
      phoneNumber: '+1234567890'
    };

    expect(request.method).toBe('app');
    expect(request.phoneNumber).toBe('+1234567890');
  });

  it('should create TwoFactorSetupResponse', () => {
    const response: TwoFactorSetupResponse = {
      secret: 'JBSWY3DPEHPK3PXP',
      qrCodeUrl: 'otpauth://totp/...',
      backupCodes: ['123456', '789012']
    };

    expect(response.secret).toBe('JBSWY3DPEHPK3PXP');
    expect(response.backupCodes).toHaveLength(2);
  });

  it('should create TwoFactorVerifyRequest', () => {
    const request: TwoFactorVerifyRequest = {
      code: '123456',
      method: 'app'
    };

    expect(request.code).toBe('123456');
    expect(request.method).toBe('app');
  });
});

describe('Registration Types', () => {
  it('should create RegisterRequest', () => {
    const request: RegisterRequest = {
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      firstName: 'Test',
      lastName: 'User',
      acceptTerms: true,
      role: UserRole.USER
    };

    expect(request.email).toBe('test@example.com');
    expect(request.firstName).toBe('Test');
    expect(request.acceptTerms).toBe(true);
  });

  it('should create RegisterResponse', () => {
    const user: UserData = {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.USER,
      permissions: [],
      isActive: true,
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const response: RegisterResponse = {
      success: true,
      user,
      message: 'User registered successfully',
      requiresEmailVerification: true
    };

    expect(response.success).toBe(true);
    expect(response.user).toEqual(user);
    expect(response.requiresEmailVerification).toBe(true);
  });
});

describe('AuthTypes Union', () => {
  it('should accept various auth types', () => {
    const loginRequest: AuthTypes = {
      email: 'test@example.com',
      password: 'password123'
    };

    const userData: AuthTypes = {
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

    const authError: AuthTypes = {
      code: AuthErrorCode.INVALID_CREDENTIALS,
      message: 'Invalid credentials',
      timestamp: new Date()
    };

    expect(loginRequest).toBeDefined();
    expect(userData).toBeDefined();
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
});