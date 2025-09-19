/**
 * Authentication Types and Interfaces
 *
 * This file contains comprehensive TypeScript types and interfaces for the authentication system,
 * including login payloads, API responses, user states, and JWT payloads.
 */

// User Role Types
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
  GUEST = 'guest'
}

// Permission Types
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface RolePermissions {
  [UserRole.ADMIN]: Permission[];
  [UserRole.USER]: Permission[];
  [UserRole.MODERATOR]: Permission[];
  [UserRole.GUEST]: Permission[];
}

// Login Request Interface
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Login Response Interface
export interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: UserData;
  expiresIn: number; // seconds
  tokenType: string;
}

// User Payload Interface (JWT Payload)
export interface UserPayload {
  sub: string; // user ID
  email: string;
  role: UserRole;
  permissions: string[]; // permission IDs
  iat: number; // issued at timestamp
  exp: number; // expiration timestamp
  iss?: string; // issuer
  aud?: string; // audience
}

// Refresh Token Request Interface
export interface RefreshTokenRequest {
  refreshToken: string;
}

// Refresh Token Response Interface
export interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
  refreshToken?: string; // optional new refresh token
  expiresIn: number;
  tokenType: string;
}

// Auth Error Interface
export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

// Auth Error Codes
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Auth State Interface
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserData | null;
  error: AuthError | null;
  lastLoginAttempt?: Date;
}

// User Data Interface
export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
}

// User Profile Interface
export interface UserProfile {
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  skills?: string[];
  languages?: string[];
}

// Token Types
export interface AccessToken {
  token: string;
  expiresAt: Date;
  userId: string;
}

export interface RefreshToken {
  token: string;
  expiresAt: Date;
  userId: string;
  isRevoked: boolean;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: AuthError;
  message?: string;
  timestamp: Date;
  requestId?: string;
}

// Validation Error Types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface ValidationErrorResponse {
  errors: ValidationError[];
  message: string;
}

// Password Reset Types
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Email Verification Types
export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationConfirmRequest {
  token: string;
}

// Two-Factor Authentication Types
export interface TwoFactorSetupRequest {
  method: 'sms' | 'email' | 'app';
  phoneNumber?: string;
}

export interface TwoFactorSetupResponse {
  secret?: string;
  qrCodeUrl?: string;
  backupCodes?: string[];
}

export interface TwoFactorVerifyRequest {
  code: string;
  method: 'sms' | 'email' | 'app';
}

// Logout Types
export interface LogoutRequest {
  refreshToken?: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// Registration Types
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  role?: UserRole;
}

export interface RegisterResponse {
  success: boolean;
  user: UserData;
  message: string;
  requiresEmailVerification: boolean;
}

// Account Management Types
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  skills?: string[];
  languages?: string[];
}

// Export all types for convenience
export type AuthTypes =
  | LoginRequest
  | LoginResponse
  | UserPayload
  | RefreshTokenRequest
  | RefreshTokenResponse
  | AuthError
  | AuthState
  | UserData
  | AccessToken
  | RefreshToken
  | ApiResponse
  | ValidationError
  | PasswordResetRequest
  | PasswordResetConfirmRequest
  | EmailVerificationRequest
  | EmailVerificationConfirmRequest
  | TwoFactorSetupRequest
  | TwoFactorSetupResponse
  | TwoFactorVerifyRequest
  | LogoutRequest
  | LogoutResponse
  | RegisterRequest
  | RegisterResponse
  | ChangePasswordRequest
  | UpdateProfileRequest;