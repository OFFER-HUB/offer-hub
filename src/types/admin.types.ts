export interface AdminUser {
  id: string;
  wallet_address: string;
  username: string;
  name?: string;
  bio?: string;
  email?: string;
  is_freelancer?: boolean;
  created_at?: string;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  is_freelancer?: boolean;
}

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_users: number;
  per_page: number;
}

export interface AdminUsersResponse {
  success: boolean;
  message: string;
  data: AdminUser[];
  pagination: PaginationInfo;
}

export interface FinancialMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  platformFees: number;
  paymentProcessingFees: number;
  netRevenue: number;
  averageTransactionValue: number;
  transactionVolume: number;
  refundsTotal: number;
  disputesTotal: number;
  pendingPayouts: number;
  completedPayouts: number;
}

export interface SecurityEvent {
  id: string;
  type:
    | 'login_attempt'
    | 'failed_login'
    | 'suspicious_activity'
    | 'data_breach'
    | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  status: 'pending' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
}

export interface BulkUserAction {
  action:
    | 'activate'
    | 'deactivate'
    | 'verify'
    | 'suspend'
    | 'delete'
    | 'send_message';
  userIds: string[];
  reason?: string;
  message?: string;
  expiresAt?: Date;
}

export interface PlatformUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'client' | 'freelancer';
  isVerified: boolean;
  isActive: boolean;
  profileCompleteness: number;
  totalEarnings?: number;
  totalSpent?: number;
  projectsCompleted: number;
  rating: number;
  joinedAt: Date;
  lastActiveAt: Date;
  profilePicture?: string;
  location?: string;
  phoneNumber?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

export interface AdminUserResponse {
  success: boolean;
  message: string;
  data: AdminUser;
}

export interface UpdateUserRequest {
  name?: string;
  bio?: string;
  email?: string;
  username?: string;
}

export interface BackendUser {
  id: string;
  wallet_address: string;
  username: string;
  name?: string;
  bio?: string;
  email?: string;
  is_freelancer?: boolean;
  created_at?: string;
}

export interface PlatformStatistics {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalTransactions: number;
  averageProjectValue: number;
  userGrowthRate: number;
  projectGrowthRate: number;
  revenueGrowthRate: number;
}

export interface SystemHealthMetrics {
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeConnections: number;
  databaseStatus: 'healthy' | 'warning' | 'error';
  serverLoad: number;
  memoryUsage: number;
  diskUsage: number;
  lastUpdated: Date;
}

export interface AdminNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  isRead: boolean;
  isImportant: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface ContentModerationItem {
  id: string;
  type: 'project' | 'profile' | 'review' | 'message';
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  reportedBy?: string;
  reportReason?: string;
  moderatedBy?: string;
  moderatedAt?: Date;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'notification';
  title: string;
  position: { x: number; y: number; width: number; height: number };
  config: Record<string, string | number | boolean>;
  isVisible: boolean;
  refreshInterval?: number;
}

export interface AdminDashboardState {
  user: AdminUser | null;
  platformStats: PlatformStatistics | null;
  systemHealth: SystemHealthMetrics | null;
  notifications: AdminNotification[];
  unreadNotificationsCount: number;
  widgets: DashboardWidget[];
  isLoading: boolean;
  error: string | null;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  resource: string;
  resourceId?: string;
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
}

export interface AnalyticsReport {
  id: string;
  name: string;
  type:
    | 'user_analytics'
    | 'project_analytics'
    | 'financial_analytics'
    | 'performance_analytics';
  dateRange: {
    from: Date;
    to: Date;
  };
  filters: Record<string, string | number | boolean>;
  data: Record<string, unknown>;
  generatedBy: string;
  generatedAt: Date;
  format: 'json' | 'csv' | 'pdf';
}

export interface PlatformConfiguration {
  id: string;
  category: 'general' | 'security' | 'payments' | 'features' | 'notifications' | 'ui' | 'performance' | 'integration' | 'analytics' | 'maintenance';
  key: string;
  value: string | number | boolean | Record<string, unknown>;
  description: string;
  dataType: 'string' | 'number' | 'boolean' | 'json' | 'array' | 'object';
  isEditable: boolean;
  isRequired: boolean;
  defaultValue?: string | number | boolean | Record<string, unknown>;
  validationRules?: Array<{
    id: string;
    type: string;
    value?: unknown;
    message: string;
    isActive: boolean;
  }>;
  environment: 'development' | 'staging' | 'production' | 'testing';
  updatedBy: string;
  updatedAt: Date;
  createdAt: Date;
  version: number;
  tags?: string[];
  dependencies?: Array<{
    id: string;
    configurationKey: string;
    condition: string;
    message: string;
  }>;
}

export const mapBackendUserToAdmin = (backendUser: BackendUser): AdminUser => ({
  id: backendUser.id,
  wallet_address: backendUser.wallet_address,
  username: backendUser.username,
  name: backendUser.name,
  bio: backendUser.bio,
  email: backendUser.email,
  is_freelancer: backendUser.is_freelancer,
  created_at: backendUser.created_at,
});

export const getUserRole = (user: AdminUser): string => {
  if (user.is_freelancer === true) return 'Freelancer';
  if (user.is_freelancer === false) return 'Client';
  return 'Unknown';
};

export const formatUserForDisplay = (user: AdminUser) => ({
  ...user,
  role: getUserRole(user),
  displayName: user.name || user.username,
  joinDate: user.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : 'Unknown',
});
export interface UserManagementFilters {
  search?: string;
  userType?: 'client' | 'freelancer' | 'all';
  verificationStatus?: 'pending' | 'verified' | 'rejected' | 'all';
  isActive?: boolean;
  joinedDateFrom?: Date;
  joinedDateTo?: Date;
  lastActiveDateFrom?: Date;
  lastActiveDateTo?: Date;
  minRating?: number;
  maxRating?: number;
  location?: string;
}
// Error handling types
export interface ApiError {
  success: false;
  message: string;
  status?: number;
}

export type ApiResult<T> = T | ApiError;

export const isApiError = (result: unknown): result is ApiError => {
  return (
    typeof result === 'object' &&
    result !== null &&
    'success' in result &&
    result.success === false
  );
};
