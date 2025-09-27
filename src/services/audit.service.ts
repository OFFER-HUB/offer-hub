import {
  ConfigurationAudit,
  PolicyAudit,
  FeatureToggleAudit,
  AuditAction,
  DateRange
} from '@/types/configuration.types';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class AuditService {
  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Audit API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Configuration Audit Logs
  async getConfigurationAuditLogs(
    configurationId?: string,
    page = 1,
    limit = 20,
    filters?: {
      action?: AuditAction;
      userId?: string;
      dateFrom?: Date;
      dateTo?: Date;
    },
  ): Promise<{
    logs: ConfigurationAudit[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(configurationId && { configurationId }),
      ...Object.entries(filters || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          acc[key] =
            value instanceof Date ? value.toISOString() : String(value);
        }
        return acc;
      }, {} as Record<string, string>),
    });

    return this.apiCall<{
      logs: ConfigurationAudit[];
      total: number;
      page: number;
      limit: number;
    }>(`/admin/audit/configuration?${queryParams}`);
  }

  // Policy Audit Logs
  async getPolicyAuditLogs(
    policyId?: string,
    page = 1,
    limit = 20,
    filters?: {
      action?: AuditAction;
      userId?: string;
      dateFrom?: Date;
      dateTo?: Date;
    },
  ): Promise<{
    logs: PolicyAudit[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(policyId && { policyId }),
      ...Object.entries(filters || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          acc[key] =
            value instanceof Date ? value.toISOString() : String(value);
        }
        return acc;
      }, {} as Record<string, string>),
    });

    return this.apiCall<{
      logs: PolicyAudit[];
      total: number;
      page: number;
      limit: number;
    }>(`/admin/audit/policies?${queryParams}`);
  }

  // Feature Toggle Audit Logs
  async getFeatureToggleAuditLogs(
    featureToggleId?: string,
    page = 1,
    limit = 20,
    filters?: {
      action?: AuditAction;
      userId?: string;
      dateFrom?: Date;
      dateTo?: Date;
    },
  ): Promise<{
    logs: FeatureToggleAudit[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(featureToggleId && { featureToggleId }),
      ...Object.entries(filters || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          acc[key] =
            value instanceof Date ? value.toISOString() : String(value);
        }
        return acc;
      }, {} as Record<string, string>),
    });

    return this.apiCall<{
      logs: FeatureToggleAudit[];
      total: number;
      page: number;
      limit: number;
    }>(`/admin/audit/feature-toggles?${queryParams}`);
  }

  // Combined Audit Logs
  async getAllAuditLogs(
    page = 1,
    limit = 20,
    filters?: {
      resourceType?: 'configuration' | 'policy' | 'feature-toggle' | 'all';
      action?: AuditAction;
      userId?: string;
      dateFrom?: Date;
      dateTo?: Date;
    },
  ): Promise<{
    logs: Array<ConfigurationAudit | PolicyAudit | FeatureToggleAudit>;
    total: number;
    page: number;
    limit: number;
  }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.entries(filters || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          acc[key] =
            value instanceof Date ? value.toISOString() : String(value);
        }
        return acc;
      }, {} as Record<string, string>),
    });

    return this.apiCall<{
      logs: Array<ConfigurationAudit | PolicyAudit | FeatureToggleAudit>;
      total: number;
      page: number;
      limit: number;
    }>(`/admin/audit/all?${queryParams}`);
  }

  // Audit Statistics
  async getAuditStatistics(dateRange?: DateRange): Promise<{
    totalActions: number;
    actionsByType: Record<AuditAction, number>;
    actionsByResource: {
      configuration: number;
      policy: number;
      featureToggle: number;
    };
    topUsers: Array<{
      userId: string;
      userEmail: string;
      actionCount: number;
    }>;
    actionsByDate: Array<{
      date: string;
      count: number;
    }>;
  }> {
    const queryParams = new URLSearchParams();
    if (dateRange) {
      queryParams.append('from', dateRange.from.toISOString());
      queryParams.append('to', dateRange.to.toISOString());
    }

    return this.apiCall<{
      totalActions: number;
      actionsByType: Record<AuditAction, number>;
      actionsByResource: {
        configuration: number;
        policy: number;
        featureToggle: number;
      };
      topUsers: Array<{
        userId: string;
        userEmail: string;
        actionCount: number;
      }>;
      actionsByDate: Array<{
        date: string;
        count: number;
      }>;
    }>(`/admin/audit/statistics?${queryParams}`);
  }

  // Audit Export
  async exportAuditLogs(
    filters?: {
      resourceType?: 'configuration' | 'policy' | 'feature-toggle' | 'all';
      action?: AuditAction;
      userId?: string;
      dateFrom?: Date;
      dateTo?: Date;
    },
    format: 'json' | 'csv' | 'pdf' = 'json',
  ): Promise<Blob> {
    const queryParams = new URLSearchParams({
      format,
      ...Object.entries(filters || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          acc[key] =
            value instanceof Date ? value.toISOString() : String(value);
        }
        return acc;
      }, {} as Record<string, string>),
    });

    const response = await fetch(
      `${API_BASE_URL}/admin/audit/export?${queryParams}`,
    );

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }

  // Audit Search
  async searchAuditLogs(
    query: string,
    page = 1,
    limit = 20,
    filters?: {
      resourceType?: 'configuration' | 'policy' | 'feature-toggle' | 'all';
      action?: AuditAction;
      userId?: string;
      dateFrom?: Date;
      dateTo?: Date;
    },
  ): Promise<{
    logs: Array<ConfigurationAudit | PolicyAudit | FeatureToggleAudit>;
    total: number;
    page: number;
    limit: number;
  }> {
    const queryParams = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
      ...Object.entries(filters || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          acc[key] =
            value instanceof Date ? value.toISOString() : String(value);
        }
        return acc;
      }, {} as Record<string, string>),
    });

    return this.apiCall<{
      logs: Array<ConfigurationAudit | PolicyAudit | FeatureToggleAudit>;
      total: number;
      page: number;
      limit: number;
    }>(`/admin/audit/search?${queryParams}`);
  }

  // Audit Health Check
  async getAuditHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    lastChecked: Date;
    retentionPeriod: number;
    storageUsed: number;
    storageLimit: number;
  }> {
    return this.apiCall<{
      status: 'healthy' | 'warning' | 'critical';
      issues: string[];
      lastChecked: Date;
      retentionPeriod: number;
      storageUsed: number;
      storageLimit: number;
    }>('/admin/audit/health');
  }

  // Audit Retention Management
  async getAuditRetentionPolicy(): Promise<{
    retentionPeriod: number;
    autoArchive: boolean;
    archiveLocation: string;
    compressionEnabled: boolean;
  }> {
    return this.apiCall<{
      retentionPeriod: number;
      autoArchive: boolean;
      archiveLocation: string;
      compressionEnabled: boolean;
    }>('/admin/audit/retention-policy');
  }

  async updateAuditRetentionPolicy(
    policy: {
      retentionPeriod: number;
      autoArchive: boolean;
      archiveLocation: string;
      compressionEnabled: boolean;
    },
  ): Promise<void> {
    await this.apiCall<void>('/admin/audit/retention-policy', {
      method: 'PUT',
      body: JSON.stringify(policy),
    });
  }

  async archiveOldAuditLogs(
    olderThan: Date,
    dryRun = false,
  ): Promise<{
    archived: number;
    size: number;
    location: string;
  }> {
    return this.apiCall<{
      archived: number;
      size: number;
      location: string;
    }>('/admin/audit/archive', {
      method: 'POST',
      body: JSON.stringify({ olderThan, dryRun }),
    });
  }

  // Real-time Audit Updates
  async subscribeToAuditUpdates(
    callback: (log: ConfigurationAudit | PolicyAudit | FeatureToggleAudit) => void,
    filters?: {
      resourceType?: 'configuration' | 'policy' | 'feature-toggle' | 'all';
      action?: AuditAction;
      userId?: string;
    },
  ): Promise<() => void> {
    // This would typically use WebSocket or Server-Sent Events
    // For now, we'll simulate with polling
    const interval = setInterval(async () => {
      try {
        const logs = await this.getAllAuditLogs(1, 100, filters);
        logs.logs.forEach(callback);
      } catch (error) {
        console.error('Error in audit update subscription:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }
}

export const auditService = new AuditService();
