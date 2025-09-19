/**
 * Tests for Authentication State Types
 *
 * This file tests the TypeScript types and interfaces defined in auth-state.types.ts
 * to ensure they work correctly and provide proper type safety.
 */

import {
  AuthState,
  AuthActionType,
  AuthActionPayloads,
  AuthAction,
  AuthSelectors,
  AuthThunks,
  AuthStateSlice,
  AuthActionUnion
} from './auth-state.types';
import { UserRole, UserData, AuthError, AuthErrorCode } from './auth.types';

describe('AuthState Interface', () => {
  it('should create a valid authenticated AuthState', () => {
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
      isInitializing: false,
      user,
      error: null,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      tokenExpiresAt: new Date(Date.now() + 3600000),
      sessionId: 'session-1',
      lastActivityAt: new Date(),
      loginAttempts: 0,
      isLocked: false,
      requiresTwoFactor: false,
      emailVerificationRequired: false
    };

    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.user).toEqual(user);
    expect(state.error).toBeNull();
    expect(state.accessToken).toBe('access-token');
    expect(state.loginAttempts).toBe(0);
  });

  it('should create a valid unauthenticated AuthState', () => {
    const state: AuthState = {
      isAuthenticated: false,
      isLoading: false,
      isInitializing: false,
      user: null,
      error: null,
      accessToken: null,
      refreshToken: null,
      loginAttempts: 3,
      lastLoginAttemptAt: new Date(),
      isLocked: true,
      lockExpiresAt: new Date(Date.now() + 900000),
      requiresTwoFactor: false,
      emailVerificationRequired: false
    };

    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.loginAttempts).toBe(3);
    expect(state.isLocked).toBe(true);
  });

  it('should handle loading state', () => {
    const state: AuthState = {
      isAuthenticated: false,
      isLoading: true,
      isInitializing: true,
      user: null,
      error: null,
      accessToken: null,
      refreshToken: null,
      loginAttempts: 0,
      isLocked: false,
      requiresTwoFactor: false,
      emailVerificationRequired: false
    };

    expect(state.isLoading).toBe(true);
    expect(state.isInitializing).toBe(true);
  });

  it('should handle error state', () => {
    const error: AuthError = {
      code: AuthErrorCode.INVALID_CREDENTIALS,
      message: 'Invalid email or password',
      timestamp: new Date()
    };

    const state: AuthState = {
      isAuthenticated: false,
      isLoading: false,
      isInitializing: false,
      user: null,
      error,
      accessToken: null,
      refreshToken: null,
      lastErrorAt: new Date(),
      loginAttempts: 0,
      isLocked: false,
      requiresTwoFactor: false,
      emailVerificationRequired: false
    };

    expect(state.error).toEqual(error);
    expect(state.lastErrorAt).toBeInstanceOf(Date);
  });
});

describe('AuthActionType Enum', () => {
  it('should have all expected action types', () => {
    expect(AuthActionType.LOGIN_START).toBe('LOGIN_START');
    expect(AuthActionType.LOGIN_SUCCESS).toBe('LOGIN_SUCCESS');
    expect(AuthActionType.LOGIN_FAILURE).toBe('LOGIN_FAILURE');
    expect(AuthActionType.LOGOUT_START).toBe('LOGOUT_START');
    expect(AuthActionType.LOGOUT_SUCCESS).toBe('LOGOUT_SUCCESS');
    expect(AuthActionType.LOGOUT_FAILURE).toBe('LOGOUT_FAILURE');
    expect(AuthActionType.REFRESH_TOKEN_START).toBe('REFRESH_TOKEN_START');
    expect(AuthActionType.REFRESH_TOKEN_SUCCESS).toBe('REFRESH_TOKEN_SUCCESS');
    expect(AuthActionType.REFRESH_TOKEN_FAILURE).toBe('REFRESH_TOKEN_FAILURE');
    expect(AuthActionType.INITIALIZE_AUTH).toBe('INITIALIZE_AUTH');
    expect(AuthActionType.SET_LOADING).toBe('SET_LOADING');
    expect(AuthActionType.CLEAR_ERROR).toBe('CLEAR_ERROR');
    expect(AuthActionType.UPDATE_USER).toBe('UPDATE_USER');
    expect(AuthActionType.SET_TWO_FACTOR_REQUIRED).toBe('SET_TWO_FACTOR_REQUIRED');
    expect(AuthActionType.VERIFY_TWO_FACTOR_START).toBe('VERIFY_TWO_FACTOR_START');
    expect(AuthActionType.VERIFY_TWO_FACTOR_SUCCESS).toBe('VERIFY_TWO_FACTOR_SUCCESS');
    expect(AuthActionType.VERIFY_TWO_FACTOR_FAILURE).toBe('VERIFY_TWO_FACTOR_FAILURE');
    expect(AuthActionType.REQUEST_PASSWORD_RESET_START).toBe('REQUEST_PASSWORD_RESET_START');
    expect(AuthActionType.REQUEST_PASSWORD_RESET_SUCCESS).toBe('REQUEST_PASSWORD_RESET_SUCCESS');
    expect(AuthActionType.REQUEST_PASSWORD_RESET_FAILURE).toBe('REQUEST_PASSWORD_RESET_FAILURE');
    expect(AuthActionType.RESET_PASSWORD_START).toBe('RESET_PASSWORD_START');
    expect(AuthActionType.RESET_PASSWORD_SUCCESS).toBe('RESET_PASSWORD_SUCCESS');
    expect(AuthActionType.RESET_PASSWORD_FAILURE).toBe('RESET_PASSWORD_FAILURE');
    expect(AuthActionType.VERIFY_EMAIL_START).toBe('VERIFY_EMAIL_START');
    expect(AuthActionType.VERIFY_EMAIL_SUCCESS).toBe('VERIFY_EMAIL_SUCCESS');
    expect(AuthActionType.VERIFY_EMAIL_FAILURE).toBe('VERIFY_EMAIL_FAILURE');
    expect(AuthActionType.REGISTER_START).toBe('REGISTER_START');
    expect(AuthActionType.REGISTER_SUCCESS).toBe('REGISTER_SUCCESS');
    expect(AuthActionType.REGISTER_FAILURE).toBe('REGISTER_FAILURE');
    expect(AuthActionType.UPDATE_PROFILE_START).toBe('UPDATE_PROFILE_START');
    expect(AuthActionType.UPDATE_PROFILE_SUCCESS).toBe('UPDATE_PROFILE_SUCCESS');
    expect(AuthActionType.UPDATE_PROFILE_FAILURE).toBe('UPDATE_PROFILE_FAILURE');
    expect(AuthActionType.CHANGE_PASSWORD_START).toBe('CHANGE_PASSWORD_START');
    expect(AuthActionType.CHANGE_PASSWORD_SUCCESS).toBe('CHANGE_PASSWORD_SUCCESS');
    expect(AuthActionType.CHANGE_PASSWORD_FAILURE).toBe('CHANGE_PASSWORD_FAILURE');
    expect(AuthActionType.INCREMENT_LOGIN_ATTEMPTS).toBe('INCREMENT_LOGIN_ATTEMPTS');
    expect(AuthActionType.RESET_LOGIN_ATTEMPTS).toBe('RESET_LOGIN_ATTEMPTS');
    expect(AuthActionType.LOCK_ACCOUNT).toBe('LOCK_ACCOUNT');
    expect(AuthActionType.UNLOCK_ACCOUNT).toBe('UNLOCK_ACCOUNT');
  });
});

describe('AuthActionPayloads Interface', () => {
  it('should create LOGIN_SUCCESS payload', () => {
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

    const payload: AuthActionPayloads[AuthActionType.LOGIN_SUCCESS] = {
      user,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: 3600
    };

    expect(payload.user).toEqual(user);
    expect(payload.accessToken).toBe('access-token');
    expect(payload.expiresIn).toBe(3600);
  });

  it('should create LOGIN_FAILURE payload', () => {
    const error: AuthError = {
      code: AuthErrorCode.INVALID_CREDENTIALS,
      message: 'Invalid credentials',
      timestamp: new Date()
    };

    const payload: AuthActionPayloads[AuthActionType.LOGIN_FAILURE] = {
      error
    };

    expect(payload.error).toEqual(error);
  });

  it('should create REGISTER_START payload', () => {
    const payload: AuthActionPayloads[AuthActionType.REGISTER_START] = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User'
    };

    expect(payload.email).toBe('test@example.com');
    expect(payload.firstName).toBe('Test');
  });

  it('should create LOCK_ACCOUNT payload', () => {
    const payload: AuthActionPayloads[AuthActionType.LOCK_ACCOUNT] = {
      lockDuration: 900000
    };

    expect(payload.lockDuration).toBe(900000);
  });
});

describe('AuthAction Interface', () => {
  it('should create a typed AuthAction', () => {
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

    const action: AuthAction<AuthActionType.LOGIN_SUCCESS> = {
      type: AuthActionType.LOGIN_SUCCESS,
      payload: {
        user,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600
      },
      meta: {
        timestamp: new Date(),
        requestId: 'req-1'
      }
    };

    expect(action.type).toBe(AuthActionType.LOGIN_SUCCESS);
    expect(action.payload!.user).toEqual(user);
    expect(action.meta?.requestId).toBe('req-1');
  });

  it('should create an action without payload', () => {
    const action: AuthAction<AuthActionType.CLEAR_ERROR> = {
      type: AuthActionType.CLEAR_ERROR
    };

    expect(action.type).toBe(AuthActionType.CLEAR_ERROR);
    expect(action.payload).toBeUndefined();
  });
});

describe('AuthSelectors Interface', () => {
  it('should define selector functions', () => {
    const mockState: AuthState = {
      isAuthenticated: true,
      isLoading: false,
      isInitializing: false,
      user: {
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
      },
      error: null,
      accessToken: 'token',
      refreshToken: 'refresh',
      loginAttempts: 0,
      isLocked: false,
      requiresTwoFactor: false,
      emailVerificationRequired: false
    };

    const selectors: AuthSelectors = {
      selectIsAuthenticated: (state) => state.isAuthenticated,
      selectIsLoading: (state) => state.isLoading,
      selectIsInitializing: (state) => state.isInitializing,
      selectUser: (state) => state.user,
      selectUserRole: (state) => state.user?.role || null,
      selectUserPermissions: (state) => state.user?.permissions || [],
      selectError: (state) => state.error,
      selectAccessToken: (state) => state.accessToken || null,
      selectRefreshToken: (state) => state.refreshToken || null,
      selectTokenExpiresAt: (state) => state.tokenExpiresAt || undefined,
      selectIsTokenExpired: (state) => {
        if (!state.tokenExpiresAt) return false;
        return state.tokenExpiresAt < new Date();
      },
      selectSessionId: (state) => state.sessionId || undefined,
      selectLastActivityAt: (state) => state.lastActivityAt || undefined,
      selectLoginAttempts: (state) => state.loginAttempts,
      selectIsLocked: (state) => state.isLocked || false,
      selectLockExpiresAt: (state) => state.lockExpiresAt || undefined,
      selectRequiresTwoFactor: (state) => state.requiresTwoFactor,
      selectTwoFactorMethod: (state) => state.twoFactorMethod || undefined,
      selectEmailVerificationRequired: (state) => state.emailVerificationRequired,
      selectHasPermission: (state, permission) => {
        return state.user?.permissions.some(p => p.name === permission) || false;
      },
      selectHasRole: (state, role) => state.user?.role === role || false,
      selectCanAccess: (state, requiredPermissions) => {
        if (!state.user) return false;
        return requiredPermissions.every(perm =>
          state.user!.permissions.some(p => p.name === perm)
        );
      }
    };

    expect(selectors.selectIsAuthenticated(mockState)).toBe(true);
    expect(selectors.selectUserRole(mockState)).toBe(UserRole.USER);
    expect(selectors.selectLoginAttempts(mockState)).toBe(0);
    expect(selectors.selectHasRole(mockState, UserRole.USER)).toBe(true);
    expect(selectors.selectHasRole(mockState, UserRole.ADMIN)).toBe(false);
  });
});

describe('AuthThunks Interface', () => {
  it('should define thunk functions', () => {
    const thunks: AuthThunks = {
      login: async (credentials) => {
        void credentials;
        return Promise.resolve();
      },
      logout: async () => {
        return Promise.resolve();
      },
      refreshToken: async () => {
        return Promise.resolve();
      },
      initializeAuth: async () => {
        return Promise.resolve();
      },
      register: async (userData) => {
        void userData;
        return Promise.resolve();
      },
      verifyEmail: async (token) => {
        void token;
        return Promise.resolve();
      },
      requestPasswordReset: async (email) => {
        void email;
        return Promise.resolve();
      },
      resetPassword: async (token, newPassword) => {
        void token;
        void newPassword;
        return Promise.resolve();
      },
      updateProfile: async (updates) => {
        void updates;
        return Promise.resolve();
      },
      changePassword: async (currentPassword, newPassword) => {
        void currentPassword;
        void newPassword;
        return Promise.resolve();
      },
      setupTwoFactor: async () => {
        return Promise.resolve();
      },
      verifyTwoFactor: async (code) => {
        void code;
        return Promise.resolve();
      },
      clearError: async () => {
        return Promise.resolve();
      }
    };

    expect(typeof thunks.login).toBe('function');
    expect(typeof thunks.logout).toBe('function');
    expect(typeof thunks.refreshToken).toBe('function');
    expect(typeof thunks.register).toBe('function');
  });
});

describe('Type Unions', () => {
  it('should work with AuthStateSlice', () => {
    const state: AuthStateSlice = {
      isAuthenticated: true,
      isLoading: false,
      isInitializing: false,
      user: {
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
      },
      error: null,
      accessToken: 'token',
      refreshToken: 'refresh',
      loginAttempts: 0,
      isLocked: false,
      requiresTwoFactor: false,
      emailVerificationRequired: false
    };

    expect(state).toBeDefined();
    expect(state.isAuthenticated).toBe(true);
  });

  it('should work with AuthActionUnion', () => {
    const loginStartAction: AuthAction<AuthActionType.LOGIN_START> = {
      type: AuthActionType.LOGIN_START,
      payload: {
        email: 'test@example.com',
        rememberMe: true
      }
    };

    expect(loginStartAction.type).toBe(AuthActionType.LOGIN_START);
    expect(loginStartAction.payload!.email).toBe('test@example.com');
  });
});

// Type guards for runtime type checking
describe('Type Guards', () => {
  it('should identify AuthActionType correctly', () => {
    const isAuthActionType = (value: string): value is AuthActionType => {
      return Object.values(AuthActionType).includes(value as AuthActionType);
    };

    expect(isAuthActionType('LOGIN_START')).toBe(true);
    expect(isAuthActionType('INVALID_ACTION')).toBe(false);
  });

  it('should validate AuthState structure', () => {
    const isValidAuthState = (state: unknown): state is AuthState => {
      const s = state as Record<string, unknown>;
      return (
        typeof s.isAuthenticated === 'boolean' &&
        typeof s.isLoading === 'boolean' &&
        typeof s.isInitializing === 'boolean' &&
        (s.user === null || typeof s.user === 'object') &&
        (s.error === null || typeof s.error === 'object')
      );
    };

    const validState: AuthState = {
      isAuthenticated: false,
      isLoading: false,
      isInitializing: false,
      user: null,
      error: null,
      accessToken: null,
      refreshToken: null,
      loginAttempts: 0,
      isLocked: false,
      requiresTwoFactor: false,
      emailVerificationRequired: false
    };

    expect(isValidAuthState(validState)).toBe(true);
    expect(isValidAuthState({})).toBe(false);
  });
});