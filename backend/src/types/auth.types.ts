import { Request, Response, NextFunction } from 'express';

// User Role Types (defined locally to avoid circular imports)
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
  FREELANCER = 'freelancer',
  CLIENT = 'client'
}

// Permission Types (defined locally to avoid circular imports)
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

// User Data Interface (defined locally to avoid circular imports)
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

// Auth Error Interface (defined locally to avoid circular imports)
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

// Database Model Types
export interface UserModel {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpiresAt?: Date;
  passwordResetToken?: string;
  passwordResetExpiresAt?: Date;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  twoFactorBackupCodes?: string[];
  lastLoginAt?: Date;
  loginAttempts: number;
  lockExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface SessionModel {
  id: string;
  userId: string;
  tokenHash: string;
  refreshTokenHash?: string;
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
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
  lastActivityAt: Date;
}

export interface RefreshTokenModel {
  id: string;
  userId: string;
  tokenHash: string;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
  revokedAt?: Date;
  replacedByToken?: string;
}

// Service Interface Types
export interface AuthService {
  // User authentication
  authenticateUser(email: string, password: string): Promise<UserModel>;
  createUser(userData: CreateUserData): Promise<UserModel>;
  updateUser(userId: string, updates: Partial<UserModel>): Promise<UserModel>;
  deleteUser(userId: string): Promise<void>;
  findUserById(userId: string): Promise<UserModel | null>;
  findUserByEmail(email: string): Promise<UserModel | null>;

  // Password management
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  changePassword(userId: string, newPassword: string): Promise<void>;
  initiatePasswordReset(email: string): Promise<string>; // returns reset token
  resetPassword(token: string, newPassword: string): Promise<void>;

  // Email verification
  initiateEmailVerification(userId: string): Promise<string>; // returns verification token
  verifyEmail(token: string): Promise<void>;

  // Two-factor authentication
  setupTwoFactor(userId: string): Promise<{ secret: string; qrCodeUrl: string }>;
  verifyTwoFactorSetup(userId: string, code: string): Promise<void>;
  verifyTwoFactorCode(userId: string, code: string): Promise<boolean>;
  disableTwoFactor(userId: string): Promise<void>;
  generateBackupCodes(userId: string): Promise<string[]>;

  // Session management
  createSession(userId: string, userAgent: string, ipAddress: string): Promise<SessionModel>;
  findSessionById(sessionId: string): Promise<SessionModel | null>;
  revokeSession(sessionId: string): Promise<void>;
  revokeAllUserSessions(userId: string): Promise<void>;
  getUserSessions(userId: string): Promise<SessionModel[]>;

  // Token management
  generateAccessToken(user: UserModel): Promise<string>;
  generateRefreshToken(user: UserModel): Promise<string>;
  verifyAccessToken(token: string): Promise<UserPayload>;
  verifyRefreshToken(token: string): Promise<{ userId: string }>;
  revokeRefreshToken(token: string): Promise<void>;
  rotateRefreshToken(oldToken: string): Promise<string>;

  // Permission and role management
  hasPermission(userId: string, permission: string): Promise<boolean>;
  hasRole(userId: string, role: UserRole): Promise<boolean>;
  getUserPermissions(userId: string): Promise<Permission[]>;
  assignRole(userId: string, role: UserRole): Promise<void>;
  revokeRole(userId: string, role: UserRole): Promise<void>;
  assignPermission(userId: string, permission: Permission): Promise<void>;
  revokePermission(userId: string, permissionId: string): Promise<void>;
}

export interface TokenService {
  generateAccessToken(payload: UserPayload): string;
  generateRefreshToken(userId: string): string;
  verifyAccessToken(token: string): UserPayload;
  verifyRefreshToken(token: string): { userId: string; tokenId: string };
  decodeToken(token: string): UserPayload | null;
  getTokenExpiration(token: string): Date | null;
  isTokenExpired(token: string): boolean;
}

export interface SessionService {
  createSession(userId: string, userAgent: string, ipAddress: string): Promise<SessionModel>;
  findSessionById(sessionId: string): Promise<SessionModel | null>;
  findSessionByToken(token: string): Promise<SessionModel | null>;
  updateSessionActivity(sessionId: string): Promise<void>;
  revokeSession(sessionId: string): Promise<void>;
  revokeAllUserSessions(userId: string): Promise<void>;
  cleanupExpiredSessions(): Promise<void>;
  getActiveSessionsCount(userId: string): Promise<number>;
}

// Middleware Types
export interface AuthenticatedRequest extends Omit<Request, 'user'> {
  user?: UserModel;
  session?: SessionModel;
  permissions?: Permission[];
  tokenPayload?: UserPayload;
}

export interface AuthMiddleware {
  authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  authorize: (permissions: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
  requireRole: (roles: UserRole[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
  optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  refreshAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

export interface RateLimitMiddleware {
  loginAttempts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  apiRequests: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  passwordReset: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

// Controller Types
export interface AuthController {
  login: (req: Request, res: Response) => Promise<void>;
  logout: (req: AuthenticatedRequest, res: Response) => Promise<void>;
  refreshToken: (req: Request, res: Response) => Promise<void>;
  register: (req: Request, res: Response) => Promise<void>;
  verifyEmail: (req: Request, res: Response) => Promise<void>;
  requestPasswordReset: (req: Request, res: Response) => Promise<void>;
  resetPassword: (req: Request, res: Response) => Promise<void>;
  changePassword: (req: AuthenticatedRequest, res: Response) => Promise<void>;
  getProfile: (req: AuthenticatedRequest, res: Response) => Promise<void>;
  updateProfile: (req: AuthenticatedRequest, res: Response) => Promise<void>;
  setupTwoFactor: (req: AuthenticatedRequest, res: Response) => Promise<void>;
  verifyTwoFactor: (req: AuthenticatedRequest, res: Response) => Promise<void>;
  disableTwoFactor: (req: AuthenticatedRequest, res: Response) => Promise<void>;
  getSessions: (req: AuthenticatedRequest, res: Response) => Promise<void>;
  revokeSession: (req: AuthenticatedRequest, res: Response) => Promise<void>;
  validateToken: (req: Request, res: Response) => Promise<void>;
}

// Validation Types
export interface LoginValidation {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterValidation {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  role?: UserRole;
}

export interface ChangePasswordValidation {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordValidation {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileValidation {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  skills?: string[];
  languages?: string[];
}

// Repository Types
export interface UserRepository {
  create(user: Omit<UserModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserModel>;
  findById(id: string): Promise<UserModel | null>;
  findByEmail(email: string): Promise<UserModel | null>;
  update(id: string, updates: Partial<UserModel>): Promise<UserModel>;
  delete(id: string): Promise<void>;
  findAll(filter?: UserFilter): Promise<UserModel[]>;
  count(filter?: UserFilter): Promise<number>;
}

export interface SessionRepository {
  create(session: Omit<SessionModel, 'id' | 'createdAt' | 'lastActivityAt'>): Promise<SessionModel>;
  findById(id: string): Promise<SessionModel | null>;
  findByUserId(userId: string): Promise<SessionModel[]>;
  update(id: string, updates: Partial<SessionModel>): Promise<SessionModel>;
  delete(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  cleanupExpired(): Promise<void>;
}

export interface RefreshTokenRepository {
  create(token: Omit<RefreshTokenModel, 'id' | 'createdAt'>): Promise<RefreshTokenModel>;
  findByTokenHash(tokenHash: string): Promise<RefreshTokenModel | null>;
  revoke(tokenHash: string): Promise<void>;
  revokeAllUserTokens(userId: string): Promise<void>;
  cleanupExpired(): Promise<void>;
}

// Filter Types
export interface UserFilter {
  role?: UserRole;
  isActive?: boolean;
  isEmailVerified?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SessionFilter {
  userId?: string;
  isRevoked?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  offset?: number;
}

// Data Transfer Types
export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  isEmailVerified?: boolean;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
  isEmailVerified?: boolean;
  permissions?: Permission[];
}

// Event Types
export interface AuthEvent {
  type: AuthEventType;
  userId: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export enum AuthEventType {
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_REGISTER = 'USER_REGISTER',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  TWO_FACTOR_SETUP = 'TWO_FACTOR_SETUP',
  TWO_FACTOR_DISABLE = 'TWO_FACTOR_DISABLE',
  SESSION_REVOKE = 'SESSION_REVOKE',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  LOGIN_ATTEMPT_FAILED = 'LOGIN_ATTEMPT_FAILED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED'
}

// Configuration Types
export interface AuthConfig {
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
    issuer: string;
    audience: string;
  };
  bcrypt: {
    rounds: number;
  };
  session: {
    maxAge: number; // milliseconds
    cleanupInterval: number; // milliseconds
  };
  rateLimit: {
    loginAttempts: {
      windowMs: number;
      maxAttempts: number;
      lockDuration: number; // milliseconds
    };
    apiRequests: {
      windowMs: number;
      maxRequests: number;
    };
  };
  email: {
    verificationTokenExpiresIn: number; // milliseconds
    passwordResetTokenExpiresIn: number; // milliseconds
  };
  twoFactor: {
    issuer: string;
    algorithm: 'SHA1' | 'SHA256' | 'SHA512';
    digits: number;
    period: number;
  };
}

// Error Types
export class AuthenticationError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code: string, statusCode: number = 401, details?: Record<string, unknown>) {
    super(message);
    this.name = 'AuthenticationError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class AuthorizationError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly requiredPermissions?: string[];
  public readonly requiredRoles?: UserRole[];

  constructor(
    message: string,
    code: string,
    statusCode: number = 403,
    requiredPermissions?: string[],
    requiredRoles?: UserRole[]
  ) {
    super(message);
    this.name = 'AuthorizationError';
    this.code = code;
    this.statusCode = statusCode;
    this.requiredPermissions = requiredPermissions;
    this.requiredRoles = requiredRoles;
  }
}

export class ValidationError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly field?: string;

  constructor(message: string, code: string, statusCode: number = 400, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.statusCode = statusCode;
    this.field = field;
  }
}

// Import UserPayload from frontend types
export interface UserPayload {
  sub: string;
  email: string;
  role: UserRole;
  permissions: string[];
  iat: number;
  exp: number;
  iss?: string;
  aud?: string;
}

// Additional missing types
export interface AuthUser {
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
  wallet_address?: string; // For backward compatibility
}

export interface LoginDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
  wallet_address?: string; // For backward compatibility
  signature?: string; // For backward compatibility
}

export interface EmailLoginDTO {
  email: string;
  password: string;
}

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
  revokedAt?: Date;
  replacedByToken?: string;
  user_id?: string; // For backward compatibility
  token_hash?: string; // For backward compatibility
  created_at?: Date; // For backward compatibility
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  version?: string;
  ip_address?: string; // For backward compatibility
  user_agent?: string; // For backward compatibility
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
  permissions: string[];
  user_id?: string; // For backward compatibility
  iat: number;
  exp: number;
  iss?: string;
  aud?: string;
}

// Export all types for convenience
export type AuthBackendTypes =
  | UserModel
  | SessionModel
  | RefreshTokenModel
  | AuthenticatedRequest
  | AuthEvent
  | AuthenticationError
  | AuthorizationError
  | ValidationError;
