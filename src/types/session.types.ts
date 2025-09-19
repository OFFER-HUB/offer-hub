// Session Types
export interface UserSession {
  id: string;
  userId: string;
  tokenHash: string;
  refreshTokenHash?: string;
  deviceInfo: DeviceInfo;
  location?: LocationInfo;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  isCurrentSession: boolean;
  lastActivityAt: Date;
  expiresAt: Date;
  createdAt: Date;
  terminatedAt?: Date;
  terminationReason?: SessionTerminationReason;
}

// Device Information Types
export interface DeviceInfo {
  id: string;
  type: DeviceType;
  os: OperatingSystem;
  browser: BrowserInfo;
  hardwareId?: string;
  fingerprint?: string;
  isTrusted: boolean;
  trustScore: number; // 0-100
  firstSeenAt: Date;
  lastSeenAt: Date;
}

export enum DeviceType {
  DESKTOP = 'desktop',
  LAPTOP = 'laptop',
  TABLET = 'tablet',
  MOBILE = 'mobile',
  SMART_TV = 'smart_tv',
  WEARABLE = 'wearable',
  GAMING_CONSOLE = 'gaming_console',
  OTHER = 'other'
}

export interface OperatingSystem {
  name: OSName;
  version: string;
  platform: OSPlatform;
  architecture: OSArchitecture;
}

export enum OSName {
  WINDOWS = 'windows',
  MACOS = 'macos',
  LINUX = 'linux',
  ANDROID = 'android',
  IOS = 'ios',
  CHROMEOS = 'chromeos',
  OTHER = 'other'
}

export enum OSPlatform {
  WINDOWS = 'windows',
  DARWIN = 'darwin',
  LINUX = 'linux',
  ANDROID = 'android',
  IOS = 'ios',
  OTHER = 'other'
}

export enum OSArchitecture {
  X86 = 'x86',
  X64 = 'x64',
  ARM = 'arm',
  ARM64 = 'arm64',
  OTHER = 'other'
}

export interface BrowserInfo {
  name: BrowserName;
  version: string;
  engine: BrowserEngine;
  isMobile: boolean;
  isBot: boolean;
  userAgent: string;
}

export enum BrowserName {
  CHROME = 'chrome',
  FIREFOX = 'firefox',
  SAFARI = 'safari',
  EDGE = 'edge',
  OPERA = 'opera',
  BRAVE = 'brave',
  VIVALDI = 'vivaldi',
  INTERNET_EXPLORER = 'internet_explorer',
  OTHER = 'other'
}

export enum BrowserEngine {
  WEBKIT = 'webkit',
  GECKO = 'gecko',
  BLINK = 'blink',
  EDGE_HTML = 'edge_html',
  OTHER = 'other'
}

// Location Information Types
export interface LocationInfo {
  country: string;
  countryCode: string;
  region: string;
  regionCode: string;
  city: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  timezone: string;
  isp?: string;
  organization?: string;
  accuracy: LocationAccuracy;
}

export enum LocationAccuracy {
  EXACT = 'exact',
  CITY = 'city',
  REGION = 'region',
  COUNTRY = 'country',
  UNKNOWN = 'unknown'
}

// Session Management Types
export interface SessionConfig {
  maxSessionsPerUser: number;
  sessionTimeout: number; // minutes
  refreshTokenTimeout: number; // days
  deviceTrackingEnabled: boolean;
  locationTrackingEnabled: boolean;
  suspiciousActivityDetection: boolean;
  autoTerminateInactiveSessions: boolean;
  inactiveSessionTimeout: number; // minutes
}

export enum SessionTerminationReason {
  USER_LOGOUT = 'user_logout',
  ADMIN_TERMINATION = 'admin_termination',
  SECURITY_VIOLATION = 'security_violation',
  SESSION_EXPIRED = 'session_expired',
  DEVICE_CHANGE = 'device_change',
  LOCATION_CHANGE = 'location_change',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  PASSWORD_CHANGE = 'password_change',
  ACCOUNT_DEACTIVATED = 'account_deactivated',
  SYSTEM_MAINTENANCE = 'system_maintenance'
}

// Session Analytics Types
export interface SessionAnalytics {
  sessionId: string;
  userId: string;
  duration: number; // minutes
  pageViews: number;
  actionsPerformed: number;
  events: SessionEvent[];
  performanceMetrics: SessionPerformanceMetrics;
  securityEvents: SessionSecurityEvent[];
  createdAt: Date;
}

export interface SessionEvent {
  id: string;
  type: SessionEventType;
  timestamp: Date;
  data?: Record<string, unknown>;
  page?: string;
  action?: string;
}

export enum SessionEventType {
  PAGE_VIEW = 'page_view',
  BUTTON_CLICK = 'button_click',
  FORM_SUBMIT = 'form_submit',
  API_CALL = 'api_call',
  FILE_DOWNLOAD = 'file_download',
  FILE_UPLOAD = 'file_upload',
  SEARCH = 'search',
  NAVIGATION = 'navigation',
  ERROR = 'error',
  CUSTOM = 'custom'
}

export interface SessionPerformanceMetrics {
  averageResponseTime: number; // milliseconds
  totalRequests: number;
  failedRequests: number;
  bandwidthUsed: number; // bytes
  memoryUsage?: number; // bytes
  cpuUsage?: number; // percentage
}

// Session Security Types
export interface SessionSecurityEvent {
  id: string;
  type: SessionSecurityEventType;
  severity: SecuritySeverity;
  timestamp: Date;
  description: string;
  details?: Record<string, unknown>;
  resolved: boolean;
  resolvedAt?: Date;
  resolution?: string;
}

export enum SessionSecurityEventType {
  UNUSUAL_LOCATION = 'unusual_location',
  UNUSUAL_DEVICE = 'unusual_device',
  UNUSUAL_TIME = 'unusual_time',
  MULTIPLE_FAILED_ATTEMPTS = 'multiple_failed_attempts',
  SUSPICIOUS_IP = 'suspicious_ip',
  VPN_USAGE = 'vpn_usage',
  TOR_USAGE = 'tor_usage',
  AUTOMATED_ACTIVITY = 'automated_activity',
  SESSION_HIJACKING_ATTEMPT = 'session_hijacking_attempt',
  BRUTE_FORCE_ATTACK = 'brute_force_attack'
}

export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Session Service Interface Types
export interface SessionService {
  // Session lifecycle
  createSession(userId: string, deviceInfo: DeviceInfo, ipAddress: string, userAgent: string): Promise<UserSession>;
  findSessionById(sessionId: string): Promise<UserSession | null>;
  findSessionByToken(token: string): Promise<UserSession | null>;
  findUserSessions(userId: string): Promise<UserSession[]>;
  updateSessionActivity(sessionId: string): Promise<void>;
  extendSession(sessionId: string, newExpiry: Date): Promise<void>;
  terminateSession(sessionId: string, reason: SessionTerminationReason): Promise<void>;
  terminateAllUserSessions(userId: string, reason: SessionTerminationReason): Promise<void>;

  // Device management
  registerDevice(userId: string, deviceInfo: DeviceInfo): Promise<DeviceInfo>;
  updateDeviceTrust(deviceId: string, trustScore: number): Promise<void>;
  getUserDevices(userId: string): Promise<DeviceInfo[]>;
  revokeDevice(deviceId: string): Promise<void>;

  // Security monitoring
  detectSuspiciousActivity(sessionId: string, activity: SessionActivity): Promise<SessionSecurityEvent | null>;
  reportSecurityEvent(sessionId: string, event: Omit<SessionSecurityEvent, 'id' | 'timestamp'>): Promise<void>;
  getSecurityEvents(sessionId: string): Promise<SessionSecurityEvent[]>;

  // Analytics
  recordSessionEvent(sessionId: string, event: Omit<SessionEvent, 'id' | 'timestamp'>): Promise<void>;
  getSessionAnalytics(sessionId: string): Promise<SessionAnalytics>;
  getUserSessionHistory(userId: string, limit?: number): Promise<SessionAnalytics[]>;

  // Cleanup
  cleanupExpiredSessions(): Promise<void>;
  cleanupInactiveSessions(inactiveThreshold: number): Promise<void>;
  archiveOldSessions(archiveThreshold: number): Promise<void>;
}

export interface SessionActivity {
  type: SessionEventType;
  ipAddress: string;
  userAgent: string;
  location?: LocationInfo;
  timestamp: Date;
  data?: Record<string, unknown>;
}

// Session Storage Types
export interface SessionStorage {
  // Session storage
  store(session: UserSession): Promise<void>;
  retrieve(sessionId: string): Promise<UserSession | null>;
  update(sessionId: string, updates: Partial<UserSession>): Promise<void>;
  delete(sessionId: string): Promise<void>;
  exists(sessionId: string): Promise<boolean>;

  // Bulk operations
  findByUserId(userId: string): Promise<UserSession[]>;
  findByDeviceId(deviceId: string): Promise<UserSession[]>;
  findExpired(): Promise<UserSession[]>;
  deleteExpired(): Promise<void>;

  // Analytics storage
  storeAnalytics(analytics: SessionAnalytics): Promise<void>;
  getAnalytics(sessionId: string): Promise<SessionAnalytics | null>;
  getUserAnalytics(userId: string, limit?: number): Promise<SessionAnalytics[]>;

  // Security storage
  storeSecurityEvent(event: SessionSecurityEvent): Promise<void>;
  getSecurityEvents(sessionId: string): Promise<SessionSecurityEvent[]>;
  getSecurityEventsByType(type: SessionSecurityEventType, limit?: number): Promise<SessionSecurityEvent[]>;
}

// Session Validation Types
export interface SessionValidation {
  validateSession(session: UserSession): ValidationResult;
  validateDevice(device: DeviceInfo): ValidationResult;
  validateLocation(location: LocationInfo): ValidationResult;
  checkSessionSecurity(session: UserSession): SecurityCheckResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

export interface SecurityCheckResult {
  isSecure: boolean;
  riskLevel: SecuritySeverity;
  issues: SecurityIssue[];
  recommendations: string[];
}

export interface SecurityIssue {
  type: SessionSecurityEventType;
  description: string;
  severity: SecuritySeverity;
  evidence: Record<string, unknown>;
}

// Session Monitoring Types
export interface SessionMonitor {
  // Real-time monitoring
  monitorSession(sessionId: string): Promise<void>;
  stopMonitoring(sessionId: string): Promise<void>;
  getActiveMonitors(): Promise<string[]>;

  // Alert system
  setupAlerts(userId: string, config: AlertConfig): Promise<void>;
  sendAlert(alert: SessionAlert): Promise<void>;
  getAlerts(userId: string, limit?: number): Promise<SessionAlert[]>;
}

export interface AlertConfig {
  suspiciousLocationEnabled: boolean;
  newDeviceEnabled: boolean;
  unusualTimeEnabled: boolean;
  multipleFailuresEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}

export interface SessionAlert {
  id: string;
  userId: string;
  sessionId: string;
  type: SessionSecurityEventType;
  severity: SecuritySeverity;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
}

// Session Constants
export const SESSION_CONSTANTS = {
  DEFAULT_SESSION_TIMEOUT: 1440, // 24 hours in minutes
  DEFAULT_REFRESH_TOKEN_TIMEOUT: 30, // 30 days
  MAX_SESSIONS_PER_USER: 10,
  DEVICE_TRUST_THRESHOLD: 70,
  SECURITY_CHECK_INTERVAL: 300000, // 5 minutes
  ANALYTICS_RETENTION_DAYS: 90,
  ALERT_RETENTION_DAYS: 30,
  CLEANUP_INTERVAL: 3600000 // 1 hour
} as const;

// Export convenience types
export type SessionId = string;
export type DeviceId = string;
export type UserId = string;

// Export all session-related types
export type SessionTypes =
  | UserSession
  | DeviceInfo
  | LocationInfo
  | SessionAnalytics
  | SessionSecurityEvent
  | SessionAlert;