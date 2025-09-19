import { UserData, AuthError, UserRole, Permission } from './auth.types';

// Authentication State Interface
export interface AuthState {
  // Core authentication state
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;

  // User data
  user: UserData | null;

  // Error handling
  error: AuthError | null;
  lastErrorAt?: Date;

  // Token management
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt?: Date;

  // Session management
  sessionId?: string;
  lastActivityAt?: Date;

  // Login attempts
  loginAttempts: number;
  lastLoginAttemptAt?: Date;
  isLocked: boolean;
  lockExpiresAt?: Date;

  // Two-factor authentication
  requiresTwoFactor: boolean;
  twoFactorMethod?: 'sms' | 'email' | 'app';

  // Password reset
  passwordResetToken?: string;
  passwordResetExpiresAt?: Date;

  // Email verification
  emailVerificationRequired: boolean;
  emailVerificationToken?: string;
}

// Authentication Actions
export enum AuthActionType {
  LOGIN_START = 'LOGIN_START',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT_START = 'LOGOUT_START',
  LOGOUT_SUCCESS = 'LOGOUT_SUCCESS',
  LOGOUT_FAILURE = 'LOGOUT_FAILURE',
  REFRESH_TOKEN_START = 'REFRESH_TOKEN_START',
  REFRESH_TOKEN_SUCCESS = 'REFRESH_TOKEN_SUCCESS',
  REFRESH_TOKEN_FAILURE = 'REFRESH_TOKEN_FAILURE',
  INITIALIZE_AUTH = 'INITIALIZE_AUTH',
  SET_LOADING = 'SET_LOADING',
  CLEAR_ERROR = 'CLEAR_ERROR',
  UPDATE_USER = 'UPDATE_USER',
  SET_TWO_FACTOR_REQUIRED = 'SET_TWO_FACTOR_REQUIRED',
  VERIFY_TWO_FACTOR_START = 'VERIFY_TWO_FACTOR_START',
  VERIFY_TWO_FACTOR_SUCCESS = 'VERIFY_TWO_FACTOR_SUCCESS',
  VERIFY_TWO_FACTOR_FAILURE = 'VERIFY_TWO_FACTOR_FAILURE',
  REQUEST_PASSWORD_RESET_START = 'REQUEST_PASSWORD_RESET_START',
  REQUEST_PASSWORD_RESET_SUCCESS = 'REQUEST_PASSWORD_RESET_SUCCESS',
  REQUEST_PASSWORD_RESET_FAILURE = 'REQUEST_PASSWORD_RESET_FAILURE',
  RESET_PASSWORD_START = 'RESET_PASSWORD_START',
  RESET_PASSWORD_SUCCESS = 'RESET_PASSWORD_SUCCESS',
  RESET_PASSWORD_FAILURE = 'RESET_PASSWORD_FAILURE',
  VERIFY_EMAIL_START = 'VERIFY_EMAIL_START',
  VERIFY_EMAIL_SUCCESS = 'VERIFY_EMAIL_SUCCESS',
  VERIFY_EMAIL_FAILURE = 'VERIFY_EMAIL_FAILURE',
  REGISTER_START = 'REGISTER_START',
  REGISTER_SUCCESS = 'REGISTER_SUCCESS',
  REGISTER_FAILURE = 'REGISTER_FAILURE',
  UPDATE_PROFILE_START = 'UPDATE_PROFILE_START',
  UPDATE_PROFILE_SUCCESS = 'UPDATE_PROFILE_SUCCESS',
  UPDATE_PROFILE_FAILURE = 'UPDATE_PROFILE_FAILURE',
  CHANGE_PASSWORD_START = 'CHANGE_PASSWORD_START',
  CHANGE_PASSWORD_SUCCESS = 'CHANGE_PASSWORD_SUCCESS',
  CHANGE_PASSWORD_FAILURE = 'CHANGE_PASSWORD_FAILURE',
  INCREMENT_LOGIN_ATTEMPTS = 'INCREMENT_LOGIN_ATTEMPTS',
  RESET_LOGIN_ATTEMPTS = 'RESET_LOGIN_ATTEMPTS',
  LOCK_ACCOUNT = 'LOCK_ACCOUNT',
  UNLOCK_ACCOUNT = 'UNLOCK_ACCOUNT'
}

// Authentication Action Payloads
export interface AuthActionPayloads {
  [AuthActionType.LOGIN_START]: {
    email: string;
    rememberMe?: boolean;
  };
  [AuthActionType.LOGIN_SUCCESS]: {
    user: UserData;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  [AuthActionType.LOGIN_FAILURE]: {
    error: AuthError;
  };
  [AuthActionType.LOGOUT_START]: undefined;
  [AuthActionType.LOGOUT_SUCCESS]: undefined;
  [AuthActionType.LOGOUT_FAILURE]: {
    error: AuthError;
  };
  [AuthActionType.REFRESH_TOKEN_START]: undefined;
  [AuthActionType.REFRESH_TOKEN_SUCCESS]: {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
  };
  [AuthActionType.REFRESH_TOKEN_FAILURE]: {
    error: AuthError;
  };
  [AuthActionType.INITIALIZE_AUTH]: {
    user?: UserData;
    accessToken?: string;
    refreshToken?: string;
  };
  [AuthActionType.SET_LOADING]: {
    isLoading: boolean;
  };
  [AuthActionType.CLEAR_ERROR]: undefined;
  [AuthActionType.UPDATE_USER]: {
    user: Partial<UserData>;
  };
  [AuthActionType.SET_TWO_FACTOR_REQUIRED]: {
    method: 'sms' | 'email' | 'app';
  };
  [AuthActionType.VERIFY_TWO_FACTOR_START]: {
    code: string;
  };
  [AuthActionType.VERIFY_TWO_FACTOR_SUCCESS]: undefined;
  [AuthActionType.VERIFY_TWO_FACTOR_FAILURE]: {
    error: AuthError;
  };
  [AuthActionType.REQUEST_PASSWORD_RESET_START]: {
    email: string;
  };
  [AuthActionType.REQUEST_PASSWORD_RESET_SUCCESS]: undefined;
  [AuthActionType.REQUEST_PASSWORD_RESET_FAILURE]: {
    error: AuthError;
  };
  [AuthActionType.RESET_PASSWORD_START]: {
    token: string;
    newPassword: string;
  };
  [AuthActionType.RESET_PASSWORD_SUCCESS]: undefined;
  [AuthActionType.RESET_PASSWORD_FAILURE]: {
    error: AuthError;
  };
  [AuthActionType.VERIFY_EMAIL_START]: {
    token: string;
  };
  [AuthActionType.VERIFY_EMAIL_SUCCESS]: undefined;
  [AuthActionType.VERIFY_EMAIL_FAILURE]: {
    error: AuthError;
  };
  [AuthActionType.REGISTER_START]: {
    email: string;
    firstName: string;
    lastName: string;
  };
  [AuthActionType.REGISTER_SUCCESS]: {
    user: UserData;
    requiresEmailVerification: boolean;
  };
  [AuthActionType.REGISTER_FAILURE]: {
    error: AuthError;
  };
  [AuthActionType.UPDATE_PROFILE_START]: {
    updates: Partial<UserData>;
  };
  [AuthActionType.UPDATE_PROFILE_SUCCESS]: {
    user: UserData;
  };
  [AuthActionType.UPDATE_PROFILE_FAILURE]: {
    error: AuthError;
  };
  [AuthActionType.CHANGE_PASSWORD_START]: undefined;
  [AuthActionType.CHANGE_PASSWORD_SUCCESS]: undefined;
  [AuthActionType.CHANGE_PASSWORD_FAILURE]: {
    error: AuthError;
  };
  [AuthActionType.INCREMENT_LOGIN_ATTEMPTS]: undefined;
  [AuthActionType.RESET_LOGIN_ATTEMPTS]: undefined;
  [AuthActionType.LOCK_ACCOUNT]: {
    lockDuration: number; // minutes
  };
  [AuthActionType.UNLOCK_ACCOUNT]: undefined;
}

// Generic Authentication Action
export interface AuthAction<T extends AuthActionType = AuthActionType> {
  type: T;
  payload?: AuthActionPayloads[T];
  meta?: {
    timestamp: Date;
    requestId?: string;
  };
}

// Authentication Selectors
export interface AuthSelectors {
  selectIsAuthenticated: (state: AuthState) => boolean;
  selectIsLoading: (state: AuthState) => boolean;
  selectIsInitializing: (state: AuthState) => boolean;
  selectUser: (state: AuthState) => UserData | null;
  selectUserRole: (state: AuthState) => UserRole | null;
  selectUserPermissions: (state: AuthState) => Permission[];
  selectError: (state: AuthState) => AuthError | null;
  selectAccessToken: (state: AuthState) => string | null;
  selectRefreshToken: (state: AuthState) => string | null;
  selectTokenExpiresAt: (state: AuthState) => Date | undefined;
  selectIsTokenExpired: (state: AuthState) => boolean;
  selectSessionId: (state: AuthState) => string | undefined;
  selectLastActivityAt: (state: AuthState) => Date | undefined;
  selectLoginAttempts: (state: AuthState) => number;
  selectIsLocked: (state: AuthState) => boolean;
  selectLockExpiresAt: (state: AuthState) => Date | undefined;
  selectRequiresTwoFactor: (state: AuthState) => boolean;
  selectTwoFactorMethod: (state: AuthState) => 'sms' | 'email' | 'app' | undefined;
  selectEmailVerificationRequired: (state: AuthState) => boolean;
  selectHasPermission: (state: AuthState, permission: string) => boolean;
  selectHasRole: (state: AuthState, role: UserRole) => boolean;
  selectCanAccess: (state: AuthState, requiredPermissions: string[]) => boolean;
}

// Authentication Thunks/Actions Creators
export interface AuthThunks {
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    acceptTerms: boolean;
  }) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (updates: Partial<UserData>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  setupTwoFactor: (method: 'sms' | 'email' | 'app', phoneNumber?: string) => Promise<void>;
  verifyTwoFactor: (code: string) => Promise<void>;
  clearError: () => void;
}

// Authentication Middleware Types
export interface AuthMiddlewareConfig {
  refreshThreshold: number; // minutes before expiry to refresh
  maxRetries: number;
  retryDelay: number; // milliseconds
  excludedPaths: string[];
}

// Authentication Storage Types
export interface AuthStorageData {
  accessToken: string;
  refreshToken: string;
  user: UserData;
  expiresAt: Date;
  lastActivityAt: Date;
}

// Authentication Context Types (for React Context)
export interface AuthContextValue {
  state: AuthState;
  actions: AuthThunks;
  selectors: AuthSelectors;
}

// Authentication Hook Types
export interface UseAuthReturn {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  user: UserData | null;
  error: AuthError | null;

  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    acceptTerms: boolean;
  }) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;

  // Selectors
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  canAccess: (requiredPermissions: string[]) => boolean;
  isTokenExpired: boolean;
  requiresTwoFactor: boolean;
}

// Export types for convenience
export type AuthStateSlice = AuthState;
export type AuthActionUnion = AuthAction<AuthActionType>;