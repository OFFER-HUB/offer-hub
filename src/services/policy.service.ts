import {
  Policy,
  PolicyListResponse,
  PolicyFilters,
  PolicyViolation,
  PolicyTest,
  PolicyAnalytics,
  PolicyExport,
  PolicyImport,
  PolicyImportResult,
  PolicyTemplate,
  PolicyValidation,
  PolicyPerformance,
  PolicyError,
  PolicyEvaluationResult,
  DateRange,
  TestData,
  TestResult,
  PolicySearchResult,
  PolicyBulkOperation,
  PolicyAudit,
  PolicyStatistics,
  PolicyCategoryCount
} from '@/types/policy.types';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class PolicyService {
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
      throw new Error(`Policy API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Policy CRUD Operations
  async getPolicies(
    filters?: PolicyFilters,
    page = 1,
    limit = 20,
  ): Promise<PolicyListResponse> {
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

    return this.apiCall<PolicyListResponse>(`/admin/policies?${queryParams}`);
  }

  async getPolicy(id: string): Promise<Policy> {
    return this.apiCall<Policy>(`/admin/policies/${id}`);
  }

  async createPolicy(
    policy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt' | 'version'>,
  ): Promise<Policy> {
    return this.apiCall<Policy>('/admin/policies', {
      method: 'POST',
      body: JSON.stringify(policy),
    });
  }

  async updatePolicy(
    id: string,
    updates: Partial<Policy>,
  ): Promise<Policy> {
    return this.apiCall<Policy>(`/admin/policies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePolicy(id: string): Promise<void> {
    await this.apiCall<void>(`/admin/policies/${id}`, {
      method: 'DELETE',
    });
  }

  // Policy Status Management
  async activatePolicy(id: string): Promise<void> {
    await this.apiCall<void>(`/admin/policies/${id}/activate`, {
      method: 'POST',
    });
  }

  async deactivatePolicy(id: string): Promise<void> {
    await this.apiCall<void>(`/admin/policies/${id}/deactivate`, {
      method: 'POST',
    });
  }

  // Policy Testing
  async testPolicy(id: string, testData: TestData): Promise<TestResult> {
    return this.apiCall<TestResult>(`/admin/policies/${id}/test`, {
      method: 'POST',
      body: JSON.stringify(testData),
    });
  }

  async runPolicyTests(
    policyIds: string[],
    testData: TestData,
  ): Promise<Record<string, TestResult>> {
    return this.apiCall<Record<string, TestResult>>(
      '/admin/policies/bulk-test',
      {
        method: 'POST',
        body: JSON.stringify({ policyIds, testData }),
      },
    );
  }

  async getPolicyTests(
    policyId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    tests: PolicyTest[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    return this.apiCall<{
      tests: PolicyTest[];
      total: number;
      page: number;
      limit: number;
    }>(`/admin/policies/${policyId}/tests?${queryParams}`);
  }

  // Policy Validation
  async validatePolicy(policy: Policy): Promise<PolicyValidation[]> {
    return this.apiCall<PolicyValidation[]>('/admin/policies/validate', {
      method: 'POST',
      body: JSON.stringify(policy),
    });
  }

  async validatePolicyRules(
    policyId: string,
  ): Promise<PolicyValidation[]> {
    return this.apiCall<PolicyValidation[]>(
      `/admin/policies/${policyId}/validate-rules`,
    );
  }

  // Policy Violations
  async getPolicyViolations(
    policyId?: string,
    page = 1,
    limit = 20,
    filters?: {
      violationType?: string;
      severity?: string;
      status?: string;
      userId?: string;
      dateFrom?: Date;
      dateTo?: Date;
    },
  ): Promise<{
    violations: PolicyViolation[];
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
      violations: PolicyViolation[];
      total: number;
      page: number;
      limit: number;
    }>(`/admin/policies/violations?${queryParams}`);
  }

  async resolveViolation(
    violationId: string,
    resolution: string,
    resolvedBy: string,
  ): Promise<void> {
    await this.apiCall<void>(`/admin/policies/violations/${violationId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution, resolvedBy }),
    });
  }

  async escalateViolation(
    violationId: string,
    escalatedBy: string,
    reason: string,
  ): Promise<void> {
    await this.apiCall<void>(
      `/admin/policies/violations/${violationId}/escalate`,
      {
        method: 'POST',
        body: JSON.stringify({ escalatedBy, reason }),
      },
    );
  }

  async markViolationAsFalsePositive(
    violationId: string,
    markedBy: string,
    reason: string,
  ): Promise<void> {
    await this.apiCall<void>(
      `/admin/policies/violations/${violationId}/false-positive`,
      {
        method: 'POST',
        body: JSON.stringify({ markedBy, reason }),
      },
    );
  }

  // Policy Analytics
  async getPolicyAnalytics(
    policyId: string,
    metric?: string,
    dateRange?: DateRange,
  ): Promise<PolicyAnalytics[]> {
    const queryParams = new URLSearchParams();
    if (metric) queryParams.append('metric', metric);
    if (dateRange) {
      queryParams.append('from', dateRange.from.toISOString());
      queryParams.append('to', dateRange.to.toISOString());
    }

    return this.apiCall<PolicyAnalytics[]>(
      `/admin/policies/${policyId}/analytics?${queryParams}`,
    );
  }

  async getPolicyStatistics(): Promise<PolicyStatistics> {
    return this.apiCall<PolicyStatistics>('/admin/policies/statistics');
  }

  async getPolicyPerformance(
    policyId: string,
    dateRange?: DateRange,
  ): Promise<PolicyPerformance[]> {
    const queryParams = new URLSearchParams();
    if (dateRange) {
      queryParams.append('from', dateRange.from.toISOString());
      queryParams.append('to', dateRange.to.toISOString());
    }

    return this.apiCall<PolicyPerformance[]>(
      `/admin/policies/${policyId}/performance?${queryParams}`,
    );
  }

  // Policy Templates
  async getPolicyTemplates(category?: string): Promise<PolicyTemplate[]> {
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);

    return this.apiCall<PolicyTemplate[]>(
      `/admin/policies/templates?${queryParams}`,
    );
  }

  async createPolicyTemplate(
    template: Omit<
      PolicyTemplate,
      'id' | 'createdAt' | 'updatedAt' | 'version' | 'usageCount'
    >,
  ): Promise<PolicyTemplate> {
    return this.apiCall<PolicyTemplate>('/admin/policies/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  async applyPolicyTemplate(
    templateId: string,
    environment: string,
  ): Promise<Policy> {
    return this.apiCall<Policy>(
      `/admin/policies/templates/${templateId}/apply`,
      {
        method: 'POST',
        body: JSON.stringify({ environment }),
      },
    );
  }

  async updateTemplateUsageCount(templateId: string): Promise<void> {
    await this.apiCall<void>(
      `/admin/policies/templates/${templateId}/usage`,
      {
        method: 'POST',
      },
    );
  }

  // Policy Import/Export
  async exportPolicies(filters?: PolicyFilters): Promise<PolicyExport> {
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

    return this.apiCall<PolicyExport>(`/admin/policies/export?${queryParams}`);
  }

  async importPolicies(importData: PolicyImport): Promise<PolicyImportResult> {
    const formData = new FormData();
    formData.append('file', importData.file);
    formData.append('environment', importData.environment);
    formData.append('overwriteExisting', String(importData.overwriteExisting));
    formData.append('validateBeforeImport', String(importData.validateBeforeImport));
    formData.append('createBackup', String(importData.createBackup));

    const response = await fetch(`${API_BASE_URL}/admin/policies/import`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Import failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Policy Bulk Operations
  async createBulkOperation(
    operation: Omit<
      PolicyBulkOperation,
      'id' | 'status' | 'progress' | 'results' | 'createdAt' | 'completedAt'
    >,
  ): Promise<PolicyBulkOperation> {
    return this.apiCall<PolicyBulkOperation>('/admin/policies/bulk-operation', {
      method: 'POST',
      body: JSON.stringify(operation),
    });
  }

  async getBulkOperation(id: string): Promise<PolicyBulkOperation> {
    return this.apiCall<PolicyBulkOperation>(
      `/admin/policies/bulk-operation/${id}`,
    );
  }

  async cancelBulkOperation(id: string): Promise<void> {
    await this.apiCall<void>(`/admin/policies/bulk-operation/${id}/cancel`, {
      method: 'POST',
    });
  }

  // Policy Search
  async searchPolicies(
    query: string,
    filters?: PolicyFilters,
    page = 1,
    limit = 20,
  ): Promise<PolicySearchResult> {
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

    return this.apiCall<PolicySearchResult>(
      `/admin/policies/search?${queryParams}`,
    );
  }

  // Policy Audit
  async getPolicyAuditLogs(
    policyId?: string,
    page = 1,
    limit = 20,
    filters?: {
      action?: string;
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
    }>(`/admin/policies/audit-logs?${queryParams}`);
  }

  // Policy Errors
  async getPolicyErrors(
    policyId?: string,
    page = 1,
    limit = 20,
  ): Promise<{
    errors: PolicyError[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(policyId && { policyId }),
    });

    return this.apiCall<{
      errors: PolicyError[];
      total: number;
      page: number;
      limit: number;
    }>(`/admin/policies/errors?${queryParams}`);
  }

  async resolvePolicyError(
    errorId: string,
    resolvedBy: string,
  ): Promise<void> {
    await this.apiCall<void>(`/admin/policies/error/${errorId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolvedBy }),
    });
  }

  // Policy Dependencies
  async getPolicyDependencies(policyId: string): Promise<Policy[]> {
    return this.apiCall<Policy[]>(`/admin/policies/${policyId}/dependencies`);
  }

  async getPolicyDependents(policyId: string): Promise<Policy[]> {
    return this.apiCall<Policy[]>(`/admin/policies/${policyId}/dependents`);
  }

  async validatePolicyDependencies(policyId: string): Promise<{
    isValid: boolean;
    conflicts: string[];
    missing: string[];
  }> {
    return this.apiCall<{
      isValid: boolean;
      conflicts: string[];
      missing: string[];
    }>(`/admin/policies/${policyId}/validate-dependencies`);
  }

  // Policy Categories
  async getPolicyCategories(): Promise<PolicyCategoryCount[]> {
    return this.apiCall<PolicyCategoryCount[]>('/admin/policies/categories');
  }

  // Policy Evaluation (for real-time enforcement)
  async evaluatePolicy(
    policyId: string,
    context: Record<string, unknown>,
  ): Promise<PolicyEvaluationResult> {
    return this.apiCall<PolicyEvaluationResult>(
      `/admin/policies/${policyId}/evaluate`,
      {
        method: 'POST',
        body: JSON.stringify({ context }),
      },
    );
  }

  async bulkEvaluatePolicies(
    policyIds: string[],
    context: Record<string, unknown>,
  ): Promise<Record<string, PolicyEvaluationResult>> {
    return this.apiCall<Record<string, PolicyEvaluationResult>>(
      '/admin/policies/bulk-evaluate',
      {
        method: 'POST',
        body: JSON.stringify({ policyIds, context }),
      },
    );
  }

  // Policy Health Check
  async getPolicyHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    lastChecked: Date;
  }> {
    return this.apiCall<{
      status: 'healthy' | 'warning' | 'critical';
      issues: string[];
      lastChecked: Date;
    }>('/admin/policies/health');
  }

  // Policy Version Management
  async getPolicyVersions(policyId: string): Promise<Policy[]> {
    return this.apiCall<Policy[]>(`/admin/policies/${policyId}/versions`);
  }

  async createPolicyVersion(
    policyId: string,
    changes: Partial<Policy>,
  ): Promise<Policy> {
    return this.apiCall<Policy>(`/admin/policies/${policyId}/version`, {
      method: 'POST',
      body: JSON.stringify(changes),
    });
  }

  async rollbackPolicyVersion(policyId: string, version: number): Promise<Policy> {
    return this.apiCall<Policy>(
      `/admin/policies/${policyId}/rollback/${version}`,
      {
        method: 'POST',
      },
    );
  }

  // Real-time Policy Updates
  async subscribeToPolicyUpdates(
    callback: (policy: Policy) => void,
    filters?: PolicyFilters,
  ): Promise<() => void> {
    // This would typically use WebSocket or Server-Sent Events
    // For now, we'll simulate with polling
    const interval = setInterval(async () => {
      try {
        const policies = await this.getPolicies(filters, 1, 100);
        policies.policies.forEach(callback);
      } catch (error) {
        console.error('Error in policy update subscription:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }
}

export const policyService = new PolicyService();
