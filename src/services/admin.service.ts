import {
  PlatformUser,
  PlatformStatistics,
  SystemHealthMetrics,
  SecurityEvent,
  FinancialMetrics,
  ContentModerationItem,
  AuditLog,
  AdminNotification,
  UserManagementFilters,
  BulkUserAction,
  AnalyticsReport,
  PlatformConfiguration,
} from "@/types/admin.types";

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

class AdminService {
  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Platform Statistics
  async getPlatformStatistics(): Promise<PlatformStatistics> {
    return this.apiCall<PlatformStatistics>("/admin/statistics");
  }

  async getSystemHealth(): Promise<SystemHealthMetrics> {
    return this.apiCall<SystemHealthMetrics>("/admin/system-health");
  }

  // User Management
  async getUsers(
    filters: UserManagementFilters = {},
    page = 1,
    limit = 20,
  ): Promise<{
    users: PlatformUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== "") {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>),
    });

    return this.apiCall<{
      users: PlatformUser[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/admin/users?${queryParams}`);
  }

  async getUserById(id: string): Promise<PlatformUser> {
    return this.apiCall<PlatformUser>(`/admin/users/${id}`);
  }

  async updateUser(
    id: string,
    updates: Partial<PlatformUser>,
  ): Promise<PlatformUser> {
    return this.apiCall<PlatformUser>(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async bulkUserAction(
    action: BulkUserAction,
  ): Promise<{ success: boolean; message: string }> {
    return this.apiCall<{ success: boolean; message: string }>(
      "/admin/users/bulk-action",
      {
        method: "POST",
        body: JSON.stringify(action),
      },
    );
  }

  async suspendUser(
    id: string,
    reason: string,
    duration?: Date,
  ): Promise<{ success: boolean }> {
    return this.apiCall<{ success: boolean }>(`/admin/users/${id}/suspend`, {
      method: "POST",
      body: JSON.stringify({ reason, duration }),
    });
  }

  async activateUser(id: string): Promise<{ success: boolean }> {
    return this.apiCall<{ success: boolean }>(`/admin/users/${id}/activate`, {
      method: "POST",
    });
  }

  // Security Management
  async getSecurityEvents(
    page = 1,
    limit = 20,
  ): Promise<{
    events: SecurityEvent[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.apiCall<{
      events: SecurityEvent[];
      total: number;
      page: number;
      limit: number;
    }>(`/admin/security/events?page=${page}&limit=${limit}`);
  }

  async updateSecurityEvent(
    id: string,
    updates: Partial<SecurityEvent>,
  ): Promise<SecurityEvent> {
    return this.apiCall<SecurityEvent>(`/admin/security/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  // Financial Management
  async getFinancialMetrics(dateRange?: {
    from: Date;
    to: Date;
  }): Promise<FinancialMetrics> {
    const queryParams = dateRange
      ? `?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`
      : "";
    return this.apiCall<FinancialMetrics>(
      `/admin/financial/metrics${queryParams}`,
    );
  }

  async getTransactions(
    page = 1,
    limit = 20,
  ): Promise<{
    transactions: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.apiCall<{
      transactions: Record<string, unknown>[];
      total: number;
      page: number;
      limit: number;
    }>(`/admin/financial/transactions?page=${page}&limit=${limit}`);
  }

  // Content Moderation
  async getModerationQueue(
    status?: string,
    page = 1,
    limit = 20,
  ): Promise<{
    items: ContentModerationItem[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });

    return this.apiCall<{
      items: ContentModerationItem[];
      total: number;
      page: number;
      limit: number;
    }>(`/admin/moderation/queue?${queryParams}`);
  }

  async moderateContent(
    id: string,
    action: "approve" | "reject",
    reason?: string,
  ): Promise<{ success: boolean }> {
    return this.apiCall<{ success: boolean }>(`/admin/moderation/items/${id}`, {
      method: "PUT",
      body: JSON.stringify({ action, reason }),
    });
  }

  // Audit Logs
  async getAuditLogs(
    page = 1,
    limit = 20,
    filters: {
      adminId?: string;
      action?: string;
      resource?: string;
      dateFrom?: Date;
      dateTo?: Date;
    } = {},
  ): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] =
            value instanceof Date ? value.toISOString() : String(value);
        }
        return acc;
      }, {} as Record<string, string>),
    });

    return this.apiCall<{
      logs: AuditLog[];
      total: number;
      page: number;
      limit: number;
    }>(`/admin/audit-logs?${queryParams}`);
  }

  // Notifications
  async getNotifications(
    page = 1,
    limit = 20,
  ): Promise<{
    notifications: AdminNotification[];
    total: number;
    unreadCount: number;
  }> {
    return this.apiCall<{
      notifications: AdminNotification[];
      total: number;
      unreadCount: number;
    }>(`/admin/notifications?page=${page}&limit=${limit}`);
  }

  async markNotificationAsRead(id: string): Promise<{ success: boolean }> {
    return this.apiCall<{ success: boolean }>(
      `/admin/notifications/${id}/read`,
      {
        method: "PUT",
      },
    );
  }

  async markAllNotificationsAsRead(): Promise<{ success: boolean }> {
    return this.apiCall<{ success: boolean }>("/admin/notifications/read-all", {
      method: "PUT",
    });
  }

  // Analytics and Reporting
  async generateReport(config: {
    type: AnalyticsReport["type"];
    dateRange: { from: Date; to: Date };
    filters: Record<string, string | number | boolean>;
    format: "json" | "csv" | "pdf";
  }): Promise<AnalyticsReport> {
    return this.apiCall<AnalyticsReport>("/admin/analytics/generate-report", {
      method: "POST",
      body: JSON.stringify(config),
    });
  }

  async getReports(
    page = 1,
    limit = 20,
  ): Promise<{
    reports: AnalyticsReport[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.apiCall<{
      reports: AnalyticsReport[];
      total: number;
      page: number;
      limit: number;
    }>(`/admin/analytics/reports?page=${page}&limit=${limit}`);
  }

  async downloadReport(id: string): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/admin/analytics/reports/${id}/download`,
    );
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }
    return response.blob();
  }

  // Configuration Management
  async getConfigurations(): Promise<PlatformConfiguration[]> {
    return this.apiCall<PlatformConfiguration[]>("/admin/configuration");
  }

  async updateConfiguration(
    id: string,
    value: string | number | boolean | Record<string, unknown>,
  ): Promise<PlatformConfiguration> {
    return this.apiCall<PlatformConfiguration>(`/admin/configuration/${id}`, {
      method: "PUT",
      body: JSON.stringify({ value }),
    });
  }

  // Enhanced Configuration Management
  async getConfigurationById(id: string): Promise<PlatformConfiguration> {
    return this.apiCall<PlatformConfiguration>(`/admin/configuration/${id}`);
  }

  async createConfiguration(
    config: Omit<PlatformConfiguration, 'id' | 'createdAt' | 'updatedAt' | 'version'>
  ): Promise<PlatformConfiguration> {
    return this.apiCall<PlatformConfiguration>("/admin/configuration", {
      method: "POST",
      body: JSON.stringify(config),
    });
  }

  async deleteConfiguration(id: string): Promise<void> {
    await this.apiCall<void>(`/admin/configuration/${id}`, {
      method: "DELETE",
    });
  }

  async validateConfiguration(
    id: string,
    value: unknown
  ): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    return this.apiCall<{ isValid: boolean; errors: string[]; warnings: string[] }>(
      `/admin/configuration/${id}/validate`,
      {
        method: "POST",
        body: JSON.stringify({ value }),
      }
    );
  }

  async getConfigurationHistory(
    id: string,
    page = 1,
    limit = 20
  ): Promise<{
    history: Array<{
      id: string;
      version: number;
      value: unknown;
      changedBy: string;
      changedAt: Date;
      changeType: string;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.apiCall<{
      history: Array<{
        id: string;
        version: number;
        value: unknown;
        changedBy: string;
        changedAt: Date;
        changeType: string;
      }>;
      total: number;
      page: number;
      limit: number;
    }>(`/admin/configuration/${id}/history?${queryParams}`);
  }

  async rollbackConfiguration(
    id: string,
    version: number
  ): Promise<PlatformConfiguration> {
    return this.apiCall<PlatformConfiguration>(`/admin/configuration/${id}/rollback`, {
      method: "POST",
      body: JSON.stringify({ version }),
    });
  }

  // Policy Management
  async getPolicies(
    page = 1,
    limit = 20,
    filters?: {
      category?: string;
      status?: string;
      environment?: string;
      search?: string;
    }
  ): Promise<{
    policies: Array<{
      id: string;
      name: string;
      description: string;
      category: string;
      status: string;
      priority: string;
      isActive: boolean;
      createdBy: string;
      createdAt: Date;
      updatedAt: Date;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.entries(filters || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>),
    });

    return this.apiCall<{
      policies: Array<{
        id: string;
        name: string;
        description: string;
        category: string;
        status: string;
        priority: string;
        isActive: boolean;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
      }>;
      total: number;
      page: number;
      limit: number;
    }>(`/admin/policies?${queryParams}`);
  }

  async createPolicy(
    policy: {
      name: string;
      description: string;
      category: string;
      type: string;
      priority: string;
      rules: Array<{
        name: string;
        type: string;
        operator: string;
        value: unknown;
        field: string;
      }>;
      actions: Array<{
        name: string;
        type: string;
        parameters: Record<string, unknown>;
      }>;
      environment: string;
    }
  ): Promise<{
    id: string;
    name: string;
    description: string;
    category: string;
    status: string;
    priority: string;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  }> {
    return this.apiCall<{
      id: string;
      name: string;
      description: string;
      category: string;
      status: string;
      priority: string;
      isActive: boolean;
      createdBy: string;
      createdAt: Date;
      updatedAt: Date;
    }>("/admin/policies", {
      method: "POST",
      body: JSON.stringify(policy),
    });
  }

  // Feature Toggle Management
  async getFeatureToggles(
    page = 1,
    limit = 20,
    filters?: {
      category?: string;
      status?: string;
      environment?: string;
      isActive?: boolean;
      search?: string;
    }
  ): Promise<{
    featureToggles: Array<{
      id: string;
      key: string;
      name: string;
      description: string;
      category: string;
      status: string;
      isActive: boolean;
      rolloutStrategy: string;
      rolloutPercentage: number;
      createdBy: string;
      createdAt: Date;
      updatedAt: Date;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.entries(filters || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>),
    });

    return this.apiCall<{
      featureToggles: Array<{
        id: string;
        key: string;
        name: string;
        description: string;
        category: string;
        status: string;
        isActive: boolean;
        rolloutStrategy: string;
        rolloutPercentage: number;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
      }>;
      total: number;
      page: number;
      limit: number;
    }>(`/admin/feature-toggles?${queryParams}`);
  }

  async createFeatureToggle(
    featureToggle: {
      key: string;
      name: string;
      description: string;
      category: string;
      type: string;
      environment: string;
      rolloutStrategy: string;
      rolloutPercentage: number;
      targetAudience: {
        name: string;
        type: string;
        criteria: Array<{
          field: string;
          operator: string;
          value: unknown;
        }>;
      };
    }
  ): Promise<{
    id: string;
    key: string;
    name: string;
    description: string;
    category: string;
    status: string;
    isActive: boolean;
    rolloutStrategy: string;
    rolloutPercentage: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  }> {
    return this.apiCall<{
      id: string;
      key: string;
      name: string;
      description: string;
      category: string;
      status: string;
      isActive: boolean;
      rolloutStrategy: string;
      rolloutPercentage: number;
      createdBy: string;
      createdAt: Date;
      updatedAt: Date;
    }>("/admin/feature-toggles", {
      method: "POST",
      body: JSON.stringify(featureToggle),
    });
  }

  // Dashboard Data
  async getDashboardData(): Promise<{
    statistics: PlatformStatistics;
    systemHealth: SystemHealthMetrics;
    recentActivities: AuditLog[];
    pendingModerations: number;
    unreadNotifications: number;
  }> {
    return this.apiCall<{
      statistics: PlatformStatistics;
      systemHealth: SystemHealthMetrics;
      recentActivities: AuditLog[];
      pendingModerations: number;
      unreadNotifications: number;
    }>("/admin/dashboard");
  }

  // Search functionality
  async searchUsers(query: string): Promise<PlatformUser[]> {
    return this.apiCall<PlatformUser[]>(
      `/admin/search/users?q=${encodeURIComponent(query)}`,
    );
  }

  async searchContent(
    query: string,
    type?: string,
  ): Promise<ContentModerationItem[]> {
    const queryParams = new URLSearchParams({
      q: query,
      ...(type && { type }),
    });
    return this.apiCall<ContentModerationItem[]>(
      `/admin/search/content?${queryParams}`,
    );
  }
}

export const adminService = new AdminService();
