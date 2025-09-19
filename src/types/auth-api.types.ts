import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  EmailVerificationConfirmRequest,
  TwoFactorSetupRequest,
  TwoFactorSetupResponse,
  TwoFactorVerifyRequest,
  LogoutRequest,
  LogoutResponse,
  ChangePasswordRequest,
  UpdateProfileRequest,
  ApiResponse,
  ValidationErrorResponse,
  UserData,
  AuthError
} from './auth.types';

// HTTP Method Types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API Endpoint Definitions
export enum AuthEndpoint {
  LOGIN = '/auth/login',
  LOGOUT = '/auth/logout',
  REFRESH_TOKEN = '/auth/refresh',
  REGISTER = '/auth/register',
  VERIFY_EMAIL = '/auth/verify-email',
  REQUEST_PASSWORD_RESET = '/auth/forgot-password',
  RESET_PASSWORD = '/auth/reset-password',
  CHANGE_PASSWORD = '/auth/change-password',
  UPDATE_PROFILE = '/auth/profile',
  GET_USER_PROFILE = '/auth/profile/me',
  SETUP_TWO_FACTOR = '/auth/2fa/setup',
  VERIFY_TWO_FACTOR = '/auth/2fa/verify',
  DISABLE_TWO_FACTOR = '/auth/2fa/disable',
  GET_SESSIONS = '/auth/sessions',
  REVOKE_SESSION = '/auth/sessions/:id',
  VALIDATE_TOKEN = '/auth/validate'
}

// API Request Types by Endpoint
export interface AuthApiRequests {
  [AuthEndpoint.LOGIN]: LoginRequest;
  [AuthEndpoint.LOGOUT]: LogoutRequest;
  [AuthEndpoint.REFRESH_TOKEN]: RefreshTokenRequest;
  [AuthEndpoint.REGISTER]: RegisterRequest;
  [AuthEndpoint.VERIFY_EMAIL]: EmailVerificationConfirmRequest;
  [AuthEndpoint.REQUEST_PASSWORD_RESET]: PasswordResetRequest;
  [AuthEndpoint.RESET_PASSWORD]: PasswordResetConfirmRequest;
  [AuthEndpoint.CHANGE_PASSWORD]: ChangePasswordRequest;
  [AuthEndpoint.UPDATE_PROFILE]: UpdateProfileRequest;
  [AuthEndpoint.SETUP_TWO_FACTOR]: TwoFactorSetupRequest;
  [AuthEndpoint.VERIFY_TWO_FACTOR]: TwoFactorVerifyRequest;
  [AuthEndpoint.DISABLE_TWO_FACTOR]: { password: string };
  [AuthEndpoint.GET_USER_PROFILE]: undefined;
  [AuthEndpoint.GET_SESSIONS]: undefined;
  [AuthEndpoint.REVOKE_SESSION]: undefined;
  [AuthEndpoint.VALIDATE_TOKEN]: undefined;
}

// API Response Types by Endpoint
export interface AuthApiResponses {
  [AuthEndpoint.LOGIN]: ApiResponse<LoginResponse>;
  [AuthEndpoint.LOGOUT]: ApiResponse<LogoutResponse>;
  [AuthEndpoint.REFRESH_TOKEN]: ApiResponse<RefreshTokenResponse>;
  [AuthEndpoint.REGISTER]: ApiResponse<RegisterResponse>;
  [AuthEndpoint.VERIFY_EMAIL]: ApiResponse<{ success: boolean; message: string }>;
  [AuthEndpoint.REQUEST_PASSWORD_RESET]: ApiResponse<{ success: boolean; message: string }>;
  [AuthEndpoint.RESET_PASSWORD]: ApiResponse<{ success: boolean; message: string }>;
  [AuthEndpoint.CHANGE_PASSWORD]: ApiResponse<{ success: boolean; message: string }>;
  [AuthEndpoint.UPDATE_PROFILE]: ApiResponse<UserData>;
  [AuthEndpoint.SETUP_TWO_FACTOR]: ApiResponse<TwoFactorSetupResponse>;
  [AuthEndpoint.VERIFY_TWO_FACTOR]: ApiResponse<{ success: boolean; message: string }>;
  [AuthEndpoint.DISABLE_TWO_FACTOR]: ApiResponse<{ success: boolean; message: string }>;
  [AuthEndpoint.GET_USER_PROFILE]: ApiResponse<UserData>;
  [AuthEndpoint.GET_SESSIONS]: ApiResponse<SessionData[]>;
  [AuthEndpoint.REVOKE_SESSION]: ApiResponse<{ success: boolean; message: string }>;
  [AuthEndpoint.VALIDATE_TOKEN]: ApiResponse<{ valid: boolean; user?: UserData }>;
}

// HTTP Request Configuration
export interface AuthApiRequestConfig {
  endpoint: AuthEndpoint;
  method: HttpMethod;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  timeout?: number;
  retries?: number;
}

// API Client Configuration
export interface AuthApiClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  headers: Record<string, string>;
  withCredentials?: boolean;
}

// API Error Response
export interface AuthApiErrorResponse {
  success: false;
  error: AuthError;
  message: string;
  timestamp: Date;
  requestId?: string;
  statusCode: number;
}

// Validation Error Response
export interface AuthValidationErrorResponse extends ValidationErrorResponse {
  success: false;
  timestamp: Date;
  requestId?: string;
  statusCode: number;
}

// Rate Limit Response
export interface AuthRateLimitResponse {
  success: false;
  error: {
    code: 'RATE_LIMIT_EXCEEDED';
    message: string;
    retryAfter: number; // seconds
  };
  timestamp: Date;
  requestId?: string;
  statusCode: number;
}

// Network Error Response
export interface AuthNetworkErrorResponse {
  success: false;
  error: {
    code: 'NETWORK_ERROR';
    message: string;
    isOffline: boolean;
  };
  timestamp: Date;
  requestId?: string;
}

// Generic API Response Union
export type AuthApiResponseUnion<T = unknown> =
  | ApiResponse<T>
  | AuthApiErrorResponse
  | AuthValidationErrorResponse
  | AuthRateLimitResponse
  | AuthNetworkErrorResponse;

// Request Interceptor Types
export interface AuthRequestInterceptor {
  (config: AuthApiRequestConfig): Promise<AuthApiRequestConfig> | AuthApiRequestConfig;
}

export interface AuthRequestInterceptorError {
  (error: AuthApiErrorResponse): Promise<AuthApiErrorResponse> | AuthApiErrorResponse;
}

// Response Interceptor Types
export interface AuthResponseInterceptor {
  (response: AuthApiResponseUnion): Promise<AuthApiResponseUnion> | AuthApiResponseUnion;
}

export interface AuthResponseInterceptorError {
  (error: AuthApiErrorResponse): Promise<AuthApiErrorResponse> | AuthApiErrorResponse;
}

// API Client Interface
export interface AuthApiClient {
  request<T = unknown>(
    endpoint: AuthEndpoint,
    method: HttpMethod,
    data?: unknown,
    config?: Partial<AuthApiRequestConfig>
  ): Promise<AuthApiResponseUnion<T>>;

  get<T = unknown>(
    endpoint: AuthEndpoint,
    config?: Partial<AuthApiRequestConfig>
  ): Promise<AuthApiResponseUnion<T>>;

  post<T = unknown>(
    endpoint: AuthEndpoint,
    data?: unknown,
    config?: Partial<AuthApiRequestConfig>
  ): Promise<AuthApiResponseUnion<T>>;

  put<T = unknown>(
    endpoint: AuthEndpoint,
    data?: unknown,
    config?: Partial<AuthApiRequestConfig>
  ): Promise<AuthApiResponseUnion<T>>;

  patch<T = unknown>(
    endpoint: AuthEndpoint,
    data?: unknown,
    config?: Partial<AuthApiRequestConfig>
  ): Promise<AuthApiResponseUnion<T>>;

  delete<T = unknown>(
    endpoint: AuthEndpoint,
    config?: Partial<AuthApiRequestConfig>
  ): Promise<AuthApiResponseUnion<T>>;

  setAuthToken(token: string | null): void;
  setRefreshToken(token: string | null): void;
  clearTokens(): void;
  isAuthenticated(): boolean;
}

// Session Data Types
export interface SessionData {
  id: string;
  userId: string;
  userAgent: string;
  ipAddress: string;
  location?: {
    country: string;
    city: string;
    region: string;
  };
  deviceInfo: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
  };
  isCurrentSession: boolean;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
}

// API Pagination Types
export interface AuthApiPaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuthApiPaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API Filter Types
export interface AuthApiFilterParams {
  search?: string;
  status?: 'active' | 'inactive' | 'suspended';
  role?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  lastLoginAfter?: Date;
  lastLoginBefore?: Date;
}

// WebSocket Authentication Types
export interface AuthWebSocketMessage {
  type: 'auth' | 'subscribe' | 'unsubscribe' | 'ping' | 'pong';
  payload?: unknown;
  timestamp: Date;
}

export interface AuthWebSocketAuthMessage extends AuthWebSocketMessage {
  type: 'auth';
  payload: {
    token: string;
  };
}

export interface AuthWebSocketSubscribeMessage extends AuthWebSocketMessage {
  type: 'subscribe';
  payload: {
    channel: string;
  };
}

// Export convenience types
export type AuthApiRequest<T extends AuthEndpoint> = AuthApiRequests[T];
export type AuthApiResponse<T extends AuthEndpoint> = AuthApiResponses[T];