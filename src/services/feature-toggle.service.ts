import {
  FeatureToggle,
  FeatureToggleListResponse,
  FeatureToggleFilters,
  FeatureEvaluation,
  FeatureToggleHistory,
  FeatureToggleAnalytics,
  FeatureToggleExport,
  FeatureToggleImport,
  FeatureToggleImportResult,
  FeatureToggleTemplate,
  FeatureToggleValidation,
  FeatureTogglePerformance,
  FeatureToggleError,
  EvaluationResult,
  DateRange,
  EvaluationContext,
  FeatureToggleSearchResult,
  FeatureToggleBulkOperation,
  FeatureToggleAudit,
  FeatureToggleStatistics,
  TargetAudience,
  FeatureMetrics,
  FeatureCondition,
  FeatureDependency
} from '@/types/feature-toggle.types';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class FeatureToggleService {
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
      throw new Error(`Feature Toggle API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Feature Toggle CRUD Operations
  async getFeatureToggles(
    filters?: FeatureToggleFilters,
    page = 1,
    limit = 20,
  ): Promise<FeatureToggleListResponse> {
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

    return this.apiCall<FeatureToggleListResponse>(
      `/admin/feature-toggles?${queryParams}`,
    );
  }

  async getFeatureToggle(id: string): Promise<FeatureToggle> {
    return this.apiCall<FeatureToggle>(`/admin/feature-toggles/${id}`);
  }

  async getFeatureToggleByKey(
    key: string,
    environment?: string,
  ): Promise<FeatureToggle> {
    const queryParams = new URLSearchParams({ key });
    if (environment) {
      queryParams.append('environment', environment);
    }
    return this.apiCall<FeatureToggle>(
      `/admin/feature-toggles/by-key?${queryParams}`,
    );
  }

  async createFeatureToggle(
    featureToggle: Omit<
      FeatureToggle,
      'id' | 'createdAt' | 'updatedAt' | 'version'
    >,
  ): Promise<FeatureToggle> {
    return this.apiCall<FeatureToggle>('/admin/feature-toggles', {
      method: 'POST',
      body: JSON.stringify(featureToggle),
    });
  }

  async updateFeatureToggle(
    id: string,
    updates: Partial<FeatureToggle>,
  ): Promise<FeatureToggle> {
    return this.apiCall<FeatureToggle>(`/admin/feature-toggles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteFeatureToggle(id: string): Promise<void> {
    await this.apiCall<void>(`/admin/feature-toggles/${id}`, {
      method: 'DELETE',
    });
  }

  // Feature Toggle Status Management
  async activateFeatureToggle(id: string): Promise<void> {
    await this.apiCall<void>(`/admin/feature-toggles/${id}/activate`, {
      method: 'POST',
    });
  }

  async deactivateFeatureToggle(id: string): Promise<void> {
    await this.apiCall<void>(`/admin/feature-toggles/${id}/deactivate`, {
      method: 'POST',
    });
  }

  // Feature Toggle Evaluation
  async evaluateFeatureToggle(
    key: string,
    context: EvaluationContext,
  ): Promise<EvaluationResult> {
    return this.apiCall<EvaluationResult>('/admin/feature-toggles/evaluate', {
      method: 'POST',
      body: JSON.stringify({ key, context }),
    });
  }

  async bulkEvaluateFeatureToggles(
    keys: string[],
    context: EvaluationContext,
  ): Promise<Record<string, EvaluationResult>> {
    return this.apiCall<Record<string, EvaluationResult>>(
      '/admin/feature-toggles/bulk-evaluate',
      {
        method: 'POST',
        body: JSON.stringify({ keys, context }),
      },
    );
  }

  // Rollout Management
  async updateRolloutPercentage(
    id: string,
    percentage: number,
  ): Promise<FeatureToggle> {
    return this.apiCall<FeatureToggle>(
      `/admin/feature-toggles/${id}/rollout`,
      {
        method: 'PUT',
        body: JSON.stringify({ percentage }),
      },
    );
  }

  async updateRolloutStrategy(
    id: string,
    strategy: string,
    parameters?: Record<string, unknown>,
  ): Promise<FeatureToggle> {
    return this.apiCall<FeatureToggle>(
      `/admin/feature-toggles/${id}/rollout-strategy`,
      {
        method: 'PUT',
        body: JSON.stringify({ strategy, parameters }),
      },
    );
  }

  async pauseRollout(id: string): Promise<void> {
    await this.apiCall<void>(`/admin/feature-toggles/${id}/pause-rollout`, {
      method: 'POST',
    });
  }

  async resumeRollout(id: string): Promise<void> {
    await this.apiCall<void>(`/admin/feature-toggles/${id}/resume-rollout`, {
      method: 'POST',
    });
  }

  // Target Audience Management
  async updateTargetAudience(
    id: string,
    audience: TargetAudience,
  ): Promise<FeatureToggle> {
    return this.apiCall<FeatureToggle>(
      `/admin/feature-toggles/${id}/audience`,
      {
        method: 'PUT',
        body: JSON.stringify(audience),
      },
    );
  }

  async getTargetAudiences(): Promise<TargetAudience[]> {
    return this.apiCall<TargetAudience[]>('/admin/feature-toggles/audiences');
  }

  async createTargetAudience(
    audience: Omit<TargetAudience, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>,
  ): Promise<TargetAudience> {
    return this.apiCall<TargetAudience>('/admin/feature-toggles/audiences', {
      method: 'POST',
      body: JSON.stringify(audience),
    });
  }

  // Feature Toggle Conditions
  async addCondition(
    id: string,
    condition: FeatureCondition,
  ): Promise<FeatureToggle> {
    return this.apiCall<FeatureToggle>(
      `/admin/feature-toggles/${id}/conditions`,
      {
        method: 'POST',
        body: JSON.stringify(condition),
      },
    );
  }

  async updateCondition(
    id: string,
    conditionId: string,
    updates: Partial<FeatureCondition>,
  ): Promise<FeatureToggle> {
    return this.apiCall<FeatureToggle>(
      `/admin/feature-toggles/${id}/conditions/${conditionId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      },
    );
  }

  async removeCondition(id: string, conditionId: string): Promise<FeatureToggle> {
    return this.apiCall<FeatureToggle>(
      `/admin/feature-toggles/${id}/conditions/${conditionId}`,
      {
        method: 'DELETE',
      },
    );
  }

  // Feature Toggle Dependencies
  async addDependency(
    id: string,
    dependency: FeatureDependency,
  ): Promise<FeatureToggle> {
    return this.apiCall<FeatureToggle>(
      `/admin/feature-toggles/${id}/dependencies`,
      {
        method: 'POST',
        body: JSON.stringify(dependency),
      },
    );
  }

  async updateDependency(
    id: string,
    dependencyId: string,
    updates: Partial<FeatureDependency>,
  ): Promise<FeatureToggle> {
    return this.apiCall<FeatureToggle>(
      `/admin/feature-toggles/${id}/dependencies/${dependencyId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      },
    );
  }

  async removeDependency(
    id: string,
    dependencyId: string,
  ): Promise<FeatureToggle> {
    return this.apiCall<FeatureToggle>(
      `/admin/feature-toggles/${id}/dependencies/${dependencyId}`,
      {
        method: 'DELETE',
      },
    );
  }

  async validateDependencies(id: string): Promise<{
    isValid: boolean;
    conflicts: string[];
    missing: string[];
  }> {
    return this.apiCall<{
      isValid: boolean;
      conflicts: string[];
      missing: string[];
    }>(`/admin/feature-toggles/${id}/validate-dependencies`);
  }

  // Feature Toggle History
  async getFeatureToggleHistory(
    id: string,
    page = 1,
    limit = 20,
  ): Promise<{
    history: FeatureToggleHistory[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    return this.apiCall<{
      history: FeatureToggleHistory[];
      total: number;
      page: number;
      limit: number;
    }>(`/admin/feature-toggles/${id}/history?${queryParams}`);
  }

  async rollbackFeatureToggle(
    id: string,
    version: number,
  ): Promise<FeatureToggle> {
    return this.apiCall<FeatureToggle>(
      `/admin/feature-toggles/${id}/rollback`,
      {
        method: 'POST',
        body: JSON.stringify({ version }),
      },
    );
  }

  // Feature Toggle Analytics
  async getFeatureToggleAnalytics(
    id: string,
    metric?: string,
    dateRange?: DateRange,
  ): Promise<FeatureToggleAnalytics[]> {
    const queryParams = new URLSearchParams();
    if (metric) queryParams.append('metric', metric);
    if (dateRange) {
      queryParams.append('from', dateRange.from.toISOString());
      queryParams.append('to', dateRange.to.toISOString());
    }

    return this.apiCall<FeatureToggleAnalytics[]>(
      `/admin/feature-toggles/${id}/analytics?${queryParams}`,
    );
  }

  async getFeatureToggleMetrics(
    id: string,
    dateRange?: DateRange,
  ): Promise<FeatureMetrics[]> {
    const queryParams = new URLSearchParams();
    if (dateRange) {
      queryParams.append('from', dateRange.from.toISOString());
      queryParams.append('to', dateRange.to.toISOString());
    }

    return this.apiCall<FeatureMetrics[]>(
      `/admin/feature-toggles/${id}/metrics?${queryParams}`,
    );
  }

  async getFeatureToggleStatistics(): Promise<FeatureToggleStatistics> {
    return this.apiCall<FeatureToggleStatistics>(
      '/admin/feature-toggles/statistics',
    );
  }

  async getFeatureTogglePerformance(
    id: string,
    dateRange?: DateRange,
  ): Promise<FeatureTogglePerformance[]> {
    const queryParams = new URLSearchParams();
    if (dateRange) {
      queryParams.append('from', dateRange.from.toISOString());
      queryParams.append('to', dateRange.to.toISOString());
    }

    return this.apiCall<FeatureTogglePerformance[]>(
      `/admin/feature-toggles/${id}/performance?${queryParams}`,
    );
  }

  // Feature Toggle Validation
  async validateFeatureToggle(
    featureToggle: FeatureToggle,
  ): Promise<FeatureToggleValidation[]> {
    return this.apiCall<FeatureToggleValidation[]>(
      '/admin/feature-toggles/validate',
      {
        method: 'POST',
        body: JSON.stringify(featureToggle),
      },
    );
  }

  async validateFeatureToggleRules(
    featureToggleId: string,
  ): Promise<FeatureToggleValidation[]> {
    return this.apiCall<FeatureToggleValidation[]>(
      `/admin/feature-toggles/${featureToggleId}/validate-rules`,
    );
  }

  // Feature Toggle Templates
  async getFeatureToggleTemplates(
    category?: string,
  ): Promise<FeatureToggleTemplate[]> {
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);

    return this.apiCall<FeatureToggleTemplate[]>(
      `/admin/feature-toggles/templates?${queryParams}`,
    );
  }

  async createFeatureToggleTemplate(
    template: Omit<
      FeatureToggleTemplate,
      'id' | 'createdAt' | 'updatedAt' | 'version' | 'usageCount'
    >,
  ): Promise<FeatureToggleTemplate> {
    return this.apiCall<FeatureToggleTemplate>(
      '/admin/feature-toggles/templates',
      {
        method: 'POST',
        body: JSON.stringify(template),
      },
    );
  }

  async applyFeatureToggleTemplate(
    templateId: string,
    environment: string,
  ): Promise<FeatureToggle> {
    return this.apiCall<FeatureToggle>(
      `/admin/feature-toggles/templates/${templateId}/apply`,
      {
        method: 'POST',
        body: JSON.stringify({ environment }),
      },
    );
  }

  async updateTemplateUsageCount(templateId: string): Promise<void> {
    await this.apiCall<void>(
      `/admin/feature-toggles/templates/${templateId}/usage`,
      {
        method: 'POST',
      },
    );
  }

  // Feature Toggle Import/Export
  async exportFeatureToggles(
    filters?: FeatureToggleFilters,
  ): Promise<FeatureToggleExport> {
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

    return this.apiCall<FeatureToggleExport>(
      `/admin/feature-toggles/export?${queryParams}`,
    );
  }

  async importFeatureToggles(
    importData: FeatureToggleImport,
  ): Promise<FeatureToggleImportResult> {
    const formData = new FormData();
    formData.append('file', importData.file);
    formData.append('environment', importData.environment);
    formData.append('overwriteExisting', String(importData.overwriteExisting));
    formData.append('validateBeforeImport', String(importData.validateBeforeImport));
    formData.append('createBackup', String(importData.createBackup));

    const response = await fetch(`${API_BASE_URL}/admin/feature-toggles/import`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Import failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Feature Toggle Bulk Operations
  async createBulkOperation(
    operation: Omit<
      FeatureToggleBulkOperation,
      'id' | 'status' | 'progress' | 'results' | 'createdAt' | 'completedAt'
    >,
  ): Promise<FeatureToggleBulkOperation> {
    return this.apiCall<FeatureToggleBulkOperation>(
      '/admin/feature-toggles/bulk-operation',
      {
        method: 'POST',
        body: JSON.stringify(operation),
      },
    );
  }

  async getBulkOperation(id: string): Promise<FeatureToggleBulkOperation> {
    return this.apiCall<FeatureToggleBulkOperation>(
      `/admin/feature-toggles/bulk-operation/${id}`,
    );
  }

  async cancelBulkOperation(id: string): Promise<void> {
    await this.apiCall<void>(
      `/admin/feature-toggles/bulk-operation/${id}/cancel`,
      {
        method: 'POST',
      },
    );
  }

  // Feature Toggle Search
  async searchFeatureToggles(
    query: string,
    filters?: FeatureToggleFilters,
    page = 1,
    limit = 20,
  ): Promise<FeatureToggleSearchResult> {
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

    return this.apiCall<FeatureToggleSearchResult>(
      `/admin/feature-toggles/search?${queryParams}`,
    );
  }

  // Feature Toggle Audit
  async getFeatureToggleAuditLogs(
    featureToggleId?: string,
    page = 1,
    limit = 20,
    filters?: {
      action?: string;
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
    }>(`/admin/feature-toggles/audit-logs?${queryParams}`);
  }

  // Feature Toggle Errors
  async getFeatureToggleErrors(
    featureToggleId?: string,
    page = 1,
    limit = 20,
  ): Promise<{
    errors: FeatureToggleError[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(featureToggleId && { featureToggleId }),
    });

    return this.apiCall<{
      errors: FeatureToggleError[];
      total: number;
      page: number;
      limit: number;
    }>(`/admin/feature-toggles/errors?${queryParams}`);
  }

  async resolveFeatureToggleError(
    errorId: string,
    resolvedBy: string,
  ): Promise<void> {
    await this.apiCall<void>(
      `/admin/feature-toggles/error/${errorId}/resolve`,
      {
        method: 'POST',
        body: JSON.stringify({ resolvedBy }),
      },
    );
  }

  // Feature Toggle Health Check
  async getFeatureToggleHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    lastChecked: Date;
  }> {
    return this.apiCall<{
      status: 'healthy' | 'warning' | 'critical';
      issues: string[];
      lastChecked: Date;
    }>('/admin/feature-toggles/health');
  }

  // Real-time Feature Toggle Updates
  async subscribeToFeatureToggleUpdates(
    callback: (featureToggle: FeatureToggle) => void,
    filters?: FeatureToggleFilters,
  ): Promise<() => void> {
    // This would typically use WebSocket or Server-Sent Events
    // For now, we'll simulate with polling
    const interval = setInterval(async () => {
      try {
        const featureToggles = await this.getFeatureToggles(filters, 1, 100);
        featureToggles.featureToggles.forEach(callback);
      } catch (error) {
        console.error('Error in feature toggle update subscription:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }

  // Feature Toggle Kill Switch
  async emergencyKillSwitch(featureToggleId: string): Promise<void> {
    await this.apiCall<void>(
      `/admin/feature-toggles/${featureToggleId}/kill-switch`,
      {
        method: 'POST',
      },
    );
  }

  async emergencyKillSwitchAll(category?: string): Promise<void> {
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);

    await this.apiCall<void>(
      `/admin/feature-toggles/kill-switch-all?${queryParams}`,
      {
        method: 'POST',
      },
    );
  }

  // Feature Toggle A/B Testing
  async createABTest(
    featureToggleId: string,
    variants: Array<{
      name: string;
      percentage: number;
      configuration: Record<string, unknown>;
    }>,
  ): Promise<FeatureToggle> {
    return this.apiCall<FeatureToggle>(
      `/admin/feature-toggles/${featureToggleId}/ab-test`,
      {
        method: 'POST',
        body: JSON.stringify({ variants }),
      },
    );
  }

  async getABTestResults(
    featureToggleId: string,
    dateRange?: DateRange,
  ): Promise<{
    variants: Array<{
      name: string;
      users: number;
      conversionRate: number;
      metrics: Record<string, number>;
    }>;
    statisticalSignificance: number;
    winner?: string;
  }> {
    const queryParams = new URLSearchParams();
    if (dateRange) {
      queryParams.append('from', dateRange.from.toISOString());
      queryParams.append('to', dateRange.to.toISOString());
    }

    return this.apiCall<{
      variants: Array<{
        name: string;
        users: number;
        conversionRate: number;
        metrics: Record<string, number>;
      }>;
      statisticalSignificance: number;
      winner?: string;
    }>(`/admin/feature-toggles/${featureToggleId}/ab-test-results?${queryParams}`);
  }
}

export const featureToggleService = new FeatureToggleService();
