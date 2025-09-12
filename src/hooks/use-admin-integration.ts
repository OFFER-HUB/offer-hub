"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  AdminApiKey,
  CreateAdminApiKeyDTO,
  UpdateAdminApiKeyDTO,
  Webhook,
  CreateWebhookDTO,
  UpdateWebhookDTO,
  IntegrationProvider,
  IntegrationInstance,
  CreateIntegrationInstanceDTO,
  UpdateIntegrationInstanceDTO,
  AdminApiMetrics,
  AdminSystemHealth,
  AdminAuditLog,
  AdminApiKeyFilters,
  WebhookFilters,
  IntegrationInstanceFilters,
  AdminAuditLogFilters,
  PaginationMeta,
  WebhookEventType,
} from "@/types/admin-integration.types";

interface UseAdminIntegrationReturn {
  // API Keys
  apiKeys: AdminApiKey[];
  isLoadingApiKeys: boolean;
  errorApiKeys: string | null;
  createApiKey: (data: CreateAdminApiKeyDTO) => Promise<void>;
  updateApiKey: (id: string, data: UpdateAdminApiKeyDTO) => Promise<void>;
  revokeApiKey: (id: string) => Promise<void>;
  refreshApiKeys: () => Promise<void>;

  // Webhooks
  webhooks: Webhook[];
  isLoadingWebhooks: boolean;
  errorWebhooks: string | null;
  createWebhook: (data: CreateWebhookDTO) => Promise<void>;
  updateWebhook: (id: string, data: UpdateWebhookDTO) => Promise<void>;
  deleteWebhook: (id: string) => Promise<void>;
  testWebhook: (webhookId: string, eventType: string, testData: any) => Promise<void>;
  refreshWebhooks: () => Promise<void>;

  // Integration Providers
  integrationProviders: IntegrationProvider[];
  isLoadingProviders: boolean;
  errorProviders: string | null;
  refreshIntegrationProviders: () => Promise<void>;

  // Integration Instances
  integrationInstances: IntegrationInstance[];
  isLoadingInstances: boolean;
  errorInstances: string | null;
  createIntegrationInstance: (data: CreateIntegrationInstanceDTO) => Promise<void>;
  updateIntegrationInstance: (id: string, data: UpdateIntegrationInstanceDTO) => Promise<void>;
  deleteIntegrationInstance: (id: string) => Promise<void>;
  refreshIntegrationInstances: () => Promise<void>;

  // Metrics and Health
  apiMetrics: AdminApiMetrics | null;
  systemHealth: AdminSystemHealth | null;
  isLoadingMetrics: boolean;
  isLoadingHealth: boolean;
  errorMetrics: string | null;
  errorHealth: string | null;
  refreshMetrics: () => Promise<void>;
  refreshHealth: () => Promise<void>;

  // Audit Logs
  auditLogs: AdminAuditLog[];
  isLoadingAuditLogs: boolean;
  errorAuditLogs: string | null;
  refreshAuditLogs: () => Promise<void>;

  // General loading and error states
  isLoading: boolean;
  error: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function useAdminIntegration(): UseAdminIntegrationReturn {
  const authHeaders = (): Record<string, string> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  // State for API Keys
  const [apiKeys, setApiKeys] = useState<AdminApiKey[]>([]);
  const [isLoadingApiKeys, setIsLoadingApiKeys] = useState(false);
  const [errorApiKeys, setErrorApiKeys] = useState<string | null>(null);

  // State for Webhooks
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState(false);
  const [errorWebhooks, setErrorWebhooks] = useState<string | null>(null);

  // State for Integration Providers
  const [integrationProviders, setIntegrationProviders] = useState<IntegrationProvider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [errorProviders, setErrorProviders] = useState<string | null>(null);

  // State for Integration Instances
  const [integrationInstances, setIntegrationInstances] = useState<IntegrationInstance[]>([]);
  const [isLoadingInstances, setIsLoadingInstances] = useState(false);
  const [errorInstances, setErrorInstances] = useState<string | null>(null);

  // State for Metrics and Health
  const [apiMetrics, setApiMetrics] = useState<AdminApiMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<AdminSystemHealth | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [errorMetrics, setErrorMetrics] = useState<string | null>(null);
  const [errorHealth, setErrorHealth] = useState<string | null>(null);

  // State for Audit Logs
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(false);
  const [errorAuditLogs, setErrorAuditLogs] = useState<string | null>(null);

  // Computed loading and error states
  const isLoading = isLoadingApiKeys || isLoadingWebhooks || isLoadingProviders || isLoadingInstances || isLoadingMetrics || isLoadingHealth || isLoadingAuditLogs;
  const error = errorApiKeys || errorWebhooks || errorProviders || errorInstances || errorMetrics || errorHealth || errorAuditLogs;

  // ============================================================================
  // API KEY MANAGEMENT
  // ============================================================================

  const fetchApiKeys = useCallback(async (filters: AdminApiKeyFilters = {}) => {
    setIsLoadingApiKeys(true);
    setErrorApiKeys(null);

    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/admin/api-keys?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch API keys: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setApiKeys(data.data.apiKeys || []);
      } else {
        throw new Error(data.message || "Failed to fetch API keys");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch API keys";
      setErrorApiKeys(errorMessage);
      console.error("Error fetching API keys:", err);
    } finally {
      setIsLoadingApiKeys(false);
    }
  }, []);

  const createApiKey = useCallback(async (data: CreateAdminApiKeyDTO) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/api-keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to create API key: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        await fetchApiKeys(); // Refresh the list
      } else {
        throw new Error(result.message || "Failed to create API key");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create API key";
      throw new Error(errorMessage);
    }
  }, [fetchApiKeys]);

  const updateApiKey = useCallback(async (id: string, data: UpdateAdminApiKeyDTO) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/api-keys/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update API key: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        await fetchApiKeys(); // Refresh the list
      } else {
        throw new Error(result.message || "Failed to update API key");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update API key";
      throw new Error(errorMessage);
    }
  }, [fetchApiKeys]);

  const revokeApiKey = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/api-keys/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to revoke API key: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        await fetchApiKeys(); // Refresh the list
      } else {
        throw new Error(result.message || "Failed to revoke API key");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to revoke API key";
      throw new Error(errorMessage);
    }
  }, [fetchApiKeys]);

  const refreshApiKeys = useCallback(async () => {
    await fetchApiKeys();
  }, [fetchApiKeys]);

  // ============================================================================
  // WEBHOOK MANAGEMENT
  // ============================================================================

  const fetchWebhooks = useCallback(async (filters: WebhookFilters = {}) => {
    setIsLoadingWebhooks(true);
    setErrorWebhooks(null);

    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/admin/webhooks?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch webhooks: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setWebhooks(data.data.webhooks || []);
      } else {
        throw new Error(data.message || "Failed to fetch webhooks");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch webhooks";
      setErrorWebhooks(errorMessage);
      console.error("Error fetching webhooks:", err);
    } finally {
      setIsLoadingWebhooks(false);
    }
  }, []);

  const createWebhook = useCallback(async (data: CreateWebhookDTO) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/webhooks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to create webhook: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        await fetchWebhooks(); // Refresh the list
      } else {
        throw new Error(result.message || "Failed to create webhook");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create webhook";
      throw new Error(errorMessage);
    }
  }, [fetchWebhooks]);

  const updateWebhook = useCallback(async (id: string, data: UpdateWebhookDTO) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/webhooks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update webhook: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        await fetchWebhooks(); // Refresh the list
      } else {
        throw new Error(result.message || "Failed to update webhook");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update webhook";
      throw new Error(errorMessage);
    }
  }, [fetchWebhooks]);

  const deleteWebhook = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/webhooks/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete webhook: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        await fetchWebhooks(); // Refresh the list
      } else {
        throw new Error(result.message || "Failed to delete webhook");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete webhook";
      throw new Error(errorMessage);
    }
  }, [fetchWebhooks]);

  const testWebhook = useCallback(async (webhookId: string, eventType: string, testData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/webhooks/${webhookId}/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ event_type: eventType, data: testData }),
      });

      if (!response.ok) {
        throw new Error(`Failed to test webhook: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to test webhook");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to test webhook";
      throw new Error(errorMessage);
    }
  }, []);

  const refreshWebhooks = useCallback(async () => {
    await fetchWebhooks();
  }, [fetchWebhooks]);

  // ============================================================================
  // INTEGRATION PROVIDERS
  // ============================================================================

  const fetchIntegrationProviders = useCallback(async () => {
    setIsLoadingProviders(true);
    setErrorProviders(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/integrations/providers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch integration providers: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setIntegrationProviders(data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch integration providers");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch integration providers";
      setErrorProviders(errorMessage);
      console.error("Error fetching integration providers:", err);
    } finally {
      setIsLoadingProviders(false);
    }
  }, []);

  const refreshIntegrationProviders = useCallback(async () => {
    await fetchIntegrationProviders();
  }, [fetchIntegrationProviders]);

  // ============================================================================
  // INTEGRATION INSTANCES
  // ============================================================================

  const fetchIntegrationInstances = useCallback(async (filters: IntegrationInstanceFilters = {}) => {
    setIsLoadingInstances(true);
    setErrorInstances(null);

    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/admin/integrations/instances?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch integration instances: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setIntegrationInstances(data.data.instances || []);
      } else {
        throw new Error(data.message || "Failed to fetch integration instances");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch integration instances";
      setErrorInstances(errorMessage);
      console.error("Error fetching integration instances:", err);
    } finally {
      setIsLoadingInstances(false);
    }
  }, []);

  const createIntegrationInstance = useCallback(async (data: CreateIntegrationInstanceDTO) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/integrations/instances`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to create integration instance: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        await fetchIntegrationInstances(); // Refresh the list
      } else {
        throw new Error(result.message || "Failed to create integration instance");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create integration instance";
      throw new Error(errorMessage);
    }
  }, [fetchIntegrationInstances]);

  const updateIntegrationInstance = useCallback(async (id: string, data: UpdateIntegrationInstanceDTO) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/integrations/instances/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update integration instance: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        await fetchIntegrationInstances(); // Refresh the list
      } else {
        throw new Error(result.message || "Failed to update integration instance");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update integration instance";
      throw new Error(errorMessage);
    }
  }, [fetchIntegrationInstances]);

  const deleteIntegrationInstance = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/integrations/instances/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete integration instance: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        await fetchIntegrationInstances(); // Refresh the list
      } else {
        throw new Error(result.message || "Failed to delete integration instance");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete integration instance";
      throw new Error(errorMessage);
    }
  }, [fetchIntegrationInstances]);

  const refreshIntegrationInstances = useCallback(async () => {
    await fetchIntegrationInstances();
  }, [fetchIntegrationInstances]);

  // ============================================================================
  // METRICS AND HEALTH
  // ============================================================================

  const fetchApiMetrics = useCallback(async (timeRange?: { start: string; end: string }) => {
    setIsLoadingMetrics(true);
    setErrorMetrics(null);

    try {
      const queryParams = new URLSearchParams();
      if (timeRange) {
        queryParams.append("start_date", timeRange.start);
        queryParams.append("end_date", timeRange.end);
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/metrics/api?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch API metrics: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setApiMetrics(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch API metrics");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch API metrics";
      setErrorMetrics(errorMessage);
      console.error("Error fetching API metrics:", err);
    } finally {
      setIsLoadingMetrics(false);
    }
  }, []);

  const fetchSystemHealth = useCallback(async () => {
    setIsLoadingHealth(true);
    setErrorHealth(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch system health: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setSystemHealth(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch system health");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch system health";
      setErrorHealth(errorMessage);
      console.error("Error fetching system health:", err);
    } finally {
      setIsLoadingHealth(false);
    }
  }, []);

  const refreshMetrics = useCallback(async () => {
    await fetchApiMetrics();
  }, [fetchApiMetrics]);

  const refreshHealth = useCallback(async () => {
    await fetchSystemHealth();
  }, [fetchSystemHealth]);

  // ============================================================================
  // AUDIT LOGS
  // ============================================================================

  const fetchAuditLogs = useCallback(async (filters: AdminAuditLogFilters = {}) => {
    setIsLoadingAuditLogs(true);
    setErrorAuditLogs(null);

    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/admin/audit-logs?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch audit logs: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setAuditLogs(data.data.logs || []);
      } else {
        throw new Error(data.message || "Failed to fetch audit logs");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch audit logs";
      setErrorAuditLogs(errorMessage);
      console.error("Error fetching audit logs:", err);
    } finally {
      setIsLoadingAuditLogs(false);
    }
  }, []);

  const refreshAuditLogs = useCallback(async () => {
    await fetchAuditLogs();
  }, [fetchAuditLogs]);

  // ============================================================================
  // INITIAL DATA LOADING
  // ============================================================================

  useEffect(() => {
    // Load initial data
    fetchApiKeys();
    fetchWebhooks();
    fetchIntegrationProviders();
    fetchIntegrationInstances();
    fetchApiMetrics();
    fetchSystemHealth();
    fetchAuditLogs();
  }, [
    fetchApiKeys,
    fetchWebhooks,
    fetchIntegrationProviders,
    fetchIntegrationInstances,
    fetchApiMetrics,
    fetchSystemHealth,
    fetchAuditLogs,
  ]);

  return {
    // API Keys
    apiKeys,
    isLoadingApiKeys,
    errorApiKeys,
    createApiKey,
    updateApiKey,
    revokeApiKey,
    refreshApiKeys,

    // Webhooks
    webhooks,
    isLoadingWebhooks,
    errorWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
    refreshWebhooks,

    // Integration Providers
    integrationProviders,
    isLoadingProviders,
    errorProviders,
    refreshIntegrationProviders,

    // Integration Instances
    integrationInstances,
    isLoadingInstances,
    errorInstances,
    createIntegrationInstance,
    updateIntegrationInstance,
    deleteIntegrationInstance,
    refreshIntegrationInstances,

    // Metrics and Health
    apiMetrics,
    systemHealth,
    isLoadingMetrics,
    isLoadingHealth,
    errorMetrics,
    errorHealth,
    refreshMetrics,
    refreshHealth,

    // Audit Logs
    auditLogs,
    isLoadingAuditLogs,
    errorAuditLogs,
    refreshAuditLogs,

    // General states
    isLoading,
    error,
  };
}
