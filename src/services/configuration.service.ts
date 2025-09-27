import {
  SystemConfiguration,
  ConfigurationListResponse,
  ConfigurationFilters,
  ConfigurationChange,
  ConfigurationHistory,
  ConfigurationAnalytics,
  ConfigurationExport,
  ConfigurationImport,
  ConfigurationImportResult,
  ConfigurationBackup,
  ConfigurationValidation,
  ConfigurationPerformance,
  ConfigurationError,
  ValidationResult,
  DateRange,
  ConfigurationTemplate,
  ConfigurationSearchResult,
  ConfigurationBulkOperation,
  ConfigurationAudit,
  ConfigurationStatistics,
  ConfigurationCategoryCount,
  EnvironmentConfiguration
} from '@/types/configuration.types';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ConfigurationService {
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
      throw new Error(`Configuration API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Configuration CRUD Operations
  async getConfigurations(
    filters?: ConfigurationFilters,
    page = 1,
    limit = 20,
  ): Promise<ConfigurationListResponse> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.entries(filters || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            acc[key] = value.join(',');
          } else if (value instanceof Date) {
            acc[key] = value.toISOString();
          } else {
            acc[key] = String(value);
          }
        }
        return acc;
      }, {} as Record<string, string>),
    });

    return this.apiCall<ConfigurationListResponse>(
      `/admin/configuration?${queryParams}`,
    );
  }

  async getConfiguration(id: string): Promise<SystemConfiguration> {
    return this.apiCall<SystemConfiguration>(`/admin/configuration/${id}`);
  }

  async getConfigurationByKey(
    key: string,
    environment?: string,
  ): Promise<SystemConfiguration> {
    const queryParams = new URLSearchParams({ key });
    if (environment) {
      queryParams.append('environment', environment);
    }
    return this.apiCall<SystemConfiguration>(
      `/admin/configuration/by-key?${queryParams}`,
    );
  }

  async createConfiguration(
    config: Omit<
      SystemConfiguration,
      'id' | 'createdAt' | 'updatedAt' | 'version'
    >,
  ): Promise<SystemConfiguration> {
    return this.apiCall<SystemConfiguration>('/admin/configuration', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async updateConfiguration(
    id: string,
    updates: Partial<SystemConfiguration>,
  ): Promise<SystemConfiguration> {
    return this.apiCall<SystemConfiguration>(`/admin/configuration/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteConfiguration(id: string): Promise<void> {
    await this.apiCall<void>(`/admin/configuration/${id}`, {
      method: 'DELETE',
    });
  }

  // Configuration Validation
  async validateConfiguration(
    id: string,
    value: unknown,
  ): Promise<ValidationResult> {
    return this.apiCall<ValidationResult>(`/admin/configuration/${id}/validate`, {
      method: 'POST',
      body: JSON.stringify({ value }),
    });
  }

  async validateConfigurationByKey(
    key: string,
    value: unknown,
    environment?: string,
  ): Promise<ValidationResult> {
    const queryParams = new URLSearchParams({ key });
    if (environment) {
      queryParams.append('environment', environment);
    }
    return this.apiCall<ValidationResult>(
      `/admin/configuration/validate-by-key?${queryParams}`,
      {
        method: 'POST',
        body: JSON.stringify({ value }),
      },
    );
  }

  // Configuration History and Rollback
  async getConfigurationHistory(
    id: string,
    page = 1,
    limit = 20,
  ): Promise<ConfigurationHistory[]> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.apiCall<ConfigurationHistory[]>(
      `/admin/configuration/${id}/history?${queryParams}`,
    );
  }

  async rollbackConfiguration(
    id: string,
    version: number,
  ): Promise<SystemConfiguration> {
    return this.apiCall<SystemConfiguration>(
      `/admin/configuration/${id}/rollback`,
      {
        method: 'POST',
        body: JSON.stringify({ version }),
      },
    );
  }

  async getConfigurationChanges(
    page = 1,
    limit = 20,
    filters?: {
      configurationId?: string;
      changeType?: string;
      status?: string;
      createdBy?: string;
      dateFrom?: Date;
      dateTo?: Date;
    },
  ): Promise<{
    changes: ConfigurationChange[];
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
      changes: ConfigurationChange[];
      total: number;
      page: number;
      limit: number;
    }>(`/admin/configuration/changes?${queryParams}`);
  }

  // Configuration Analytics
  async getConfigurationAnalytics(
    id: string,
    metric?: string,
    dateRange?: DateRange,
  ): Promise<ConfigurationAnalytics[]> {
    const queryParams = new URLSearchParams();
    if (metric) queryParams.append('metric', metric);
    if (dateRange) {
      queryParams.append('from', dateRange.from.toISOString());
      queryParams.append('to', dateRange.to.toISOString());
    }

    return this.apiCall<ConfigurationAnalytics[]>(
      `/admin/configuration/${id}/analytics?${queryParams}`,
    );
  }

  async getConfigurationStatistics(): Promise<ConfigurationStatistics> {
    return this.apiCall<ConfigurationStatistics>(
      '/admin/configuration/statistics',
    );
  }

  async getConfigurationPerformance(
    id: string,
    dateRange?: DateRange,
  ): Promise<ConfigurationPerformance[]> {
    const queryParams = new URLSearchParams();
    if (dateRange) {
      queryParams.append('from', dateRange.from.toISOString());
      queryParams.append('to', dateRange.to.toISOString());
    }

    return this.apiCall<ConfigurationPerformance[]>(
      `/admin/configuration/${id}/performance?${queryParams}`,
    );
  }

  // Configuration Templates
  async getConfigurationTemplates(
    category?: string,
  ): Promise<ConfigurationTemplate[]> {
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);

    return this.apiCall<ConfigurationTemplate[]>(
      `/admin/configuration/templates?${queryParams}`,
    );
  }

  async createConfigurationTemplate(
    template: Omit<
      ConfigurationTemplate,
      'id' | 'createdAt' | 'updatedAt' | 'version'
    >,
  ): Promise<ConfigurationTemplate> {
    return this.apiCall<ConfigurationTemplate>(
      '/admin/configuration/templates',
      {
        method: 'POST',
        body: JSON.stringify(template),
      },
    );
  }

  async applyConfigurationTemplate(
    templateId: string,
    environment: string,
  ): Promise<SystemConfiguration[]> {
    return this.apiCall<SystemConfiguration[]>(
      `/admin/configuration/templates/${templateId}/apply`,
      {
        method: 'POST',
        body: JSON.stringify({ environment }),
      },
    );
  }

  // Configuration Import/Export
  async exportConfigurations(
    filters?: ConfigurationFilters,
  ): Promise<ConfigurationExport> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(','));
          } else if (value instanceof Date) {
            queryParams.append(key, value.toISOString());
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    return this.apiCall<ConfigurationExport>(
      `/admin/configuration/export?${queryParams}`,
    );
  }

  async importConfigurations(
    importData: ConfigurationImport,
  ): Promise<ConfigurationImportResult> {
    const formData = new FormData();
    formData.append('file', importData.file);
    formData.append('environment', importData.environment);
    formData.append('overwriteExisting', String(importData.overwriteExisting));
    formData.append('validateBeforeImport', String(importData.validateBeforeImport));
    formData.append('createBackup', String(importData.createBackup));

    const response = await fetch(`${API_BASE_URL}/admin/configuration/import`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Import failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Configuration Backups
  async createConfigurationBackup(
    name: string,
    description: string,
    environment?: string,
  ): Promise<ConfigurationBackup> {
    return this.apiCall<ConfigurationBackup>('/admin/configuration/backup', {
      method: 'POST',
      body: JSON.stringify({ name, description, environment }),
    });
  }

  async getConfigurationBackups(): Promise<ConfigurationBackup[]> {
    return this.apiCall<ConfigurationBackup[]>('/admin/configuration/backups');
  }

  async restoreConfigurationBackup(backupId: string): Promise<void> {
    await this.apiCall<void>(`/admin/configuration/backup/${backupId}/restore`, {
      method: 'POST',
    });
  }

  async deleteConfigurationBackup(backupId: string): Promise<void> {
    await this.apiCall<void>(`/admin/configuration/backup/${backupId}`, {
      method: 'DELETE',
    });
  }

  // Configuration Bulk Operations
  async createBulkOperation(
    operation: Omit<
      ConfigurationBulkOperation,
      'id' | 'status' | 'progress' | 'results' | 'createdAt' | 'completedAt'
    >,
  ): Promise<ConfigurationBulkOperation> {
    return this.apiCall<ConfigurationBulkOperation>(
      '/admin/configuration/bulk-operation',
      {
        method: 'POST',
        body: JSON.stringify(operation),
      },
    );
  }

  async getBulkOperation(id: string): Promise<ConfigurationBulkOperation> {
    return this.apiCall<ConfigurationBulkOperation>(
      `/admin/configuration/bulk-operation/${id}`,
    );
  }

  async cancelBulkOperation(id: string): Promise<void> {
    await this.apiCall<void>(
      `/admin/configuration/bulk-operation/${id}/cancel`,
      {
        method: 'POST',
      },
    );
  }

  // Configuration Search
  async searchConfigurations(
    query: string,
    filters?: ConfigurationFilters,
    page = 1,
    limit = 20,
  ): Promise<ConfigurationSearchResult> {
    const queryParams = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
      ...Object.entries(filters || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            acc[key] = value.join(',');
          } else if (value instanceof Date) {
            acc[key] = value.toISOString();
          } else {
            acc[key] = String(value);
          }
        }
        return acc;
      }, {} as Record<string, string>),
    });

    return this.apiCall<ConfigurationSearchResult>(
      `/admin/configuration/search?${queryParams}`,
    );
  }

  // Configuration Audit
  async getConfigurationAuditLogs(
    configurationId?: string,
    page = 1,
    limit = 20,
    filters?: {
      action?: string;
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
    }>(`/admin/configuration/audit-logs?${queryParams}`);
  }

  // Configuration Errors
  async getConfigurationErrors(
    configurationId?: string,
    page = 1,
    limit = 20,
  ): Promise<{
    errors: ConfigurationError[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(configurationId && { configurationId }),
    });

    return this.apiCall<{
      errors: ConfigurationError[];
      total: number;
      page: number;
      limit: number;
    }>(`/admin/configuration/errors?${queryParams}`);
  }

  async resolveConfigurationError(
    errorId: string,
    resolvedBy: string,
  ): Promise<void> {
    await this.apiCall<void>(`/admin/configuration/error/${errorId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolvedBy }),
    });
  }

  // Environment-specific Operations
  async getEnvironmentConfigurations(
    environment: string,
  ): Promise<EnvironmentConfiguration> {
    return this.apiCall<EnvironmentConfiguration>(
      `/admin/configuration/environment/${environment}`,
    );
  }

  async copyConfigurationToEnvironment(
    configurationId: string,
    targetEnvironment: string,
  ): Promise<SystemConfiguration> {
    return this.apiCall<SystemConfiguration>(
      `/admin/configuration/${configurationId}/copy`,
      {
        method: 'POST',
        body: JSON.stringify({ targetEnvironment }),
      },
    );
  }

  // Configuration Categories
  async getConfigurationCategories(): Promise<ConfigurationCategoryCount[]> {
    return this.apiCall<ConfigurationCategoryCount[]>(
      '/admin/configuration/categories',
    );
  }

  // Real-time Configuration Updates
  async subscribeToConfigurationUpdates(
    callback: (configuration: SystemConfiguration) => void,
    filters?: ConfigurationFilters,
  ): Promise<() => void> {
    // This would typically use WebSocket or Server-Sent Events
    // For now, we'll simulate with polling
    const interval = setInterval(async () => {
      try {
        const configs = await this.getConfigurations(filters, 1, 100);
        configs.configurations.forEach(callback);
      } catch (error) {
        console.error('Error in configuration update subscription:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }

  // Configuration Health Check
  async getConfigurationHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    lastChecked: Date;
  }> {
    return this.apiCall<{
      status: 'healthy' | 'warning' | 'critical';
      issues: string[];
      lastChecked: Date;
    }>('/admin/configuration/health');
  }
}

export const configurationService = new ConfigurationService();
