import { supabase } from "@/lib/supabase/supabase";
import { AppError } from "@/utils/AppError";
import { buildSuccessResponse } from "@/utils/responseBuilder";
import {
  AdminApiKey,
  CreateAdminApiKeyDTO,
  UpdateAdminApiKeyDTO,
  AdminPermission,
  RateLimitConfig,
  Webhook,
  CreateWebhookDTO,
  UpdateWebhookDTO,
  WebhookEvent,
  RetryPolicy,
  IntegrationProvider,
  IntegrationInstance,
  CreateIntegrationInstanceDTO,
  UpdateIntegrationInstanceDTO,
  AdminApiMetrics,
  AdminSystemHealth,
  AdminAuditLog,
  AdminApiLog,
  AdminApiKeyFilters,
  WebhookFilters,
  IntegrationInstanceFilters,
  AdminAuditLogFilters,
  PaginationMeta,
  AdminApiResponse,
  WebhookPayload,
  WebhookDelivery,
  ComponentHealth,
  AdminOperation,
  WebhookEventType,
} from "@/types/admin-integration.types";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import axios from "axios";

/**
 * Administrative API and Integration Service
 * Handles all administrative API operations, webhook management, and integration frameworks
 */
class AdminIntegrationService {
  private readonly DEFAULT_RATE_LIMIT: RateLimitConfig = {
    requests_per_minute: 60,
    requests_per_hour: 1000,
    requests_per_day: 10000,
    burst_limit: 10,
  };

  private readonly DEFAULT_RETRY_POLICY: RetryPolicy = {
    max_retries: 3,
    retry_delay_ms: 1000,
    backoff_multiplier: 2,
    max_delay_ms: 30000,
  };

  // ============================================================================
  // API KEY MANAGEMENT
  // ============================================================================

  /**
   * Create a new admin API key
   */
  async createApiKey(
    data: CreateAdminApiKeyDTO,
    createdBy: string
  ): Promise<AdminApiKey> {
    try {
      const apiKey = this.generateApiKey();
      const keyHash = this.hashApiKey(apiKey);

      const apiKeyData = {
        id: uuidv4(),
        name: data.name,
        key_hash: keyHash,
        permissions: data.permissions,
        rate_limit: data.rate_limit || this.DEFAULT_RATE_LIMIT,
        is_active: true,
        created_by: createdBy,
        created_at: new Date().toISOString(),
        expires_at: data.expires_at,
      };

      const { data: result, error } = await supabase
        .from("admin_api_keys")
        .insert(apiKeyData)
        .select()
        .single();

      if (error) {
        throw new AppError(`Failed to create API key: ${error.message}`, 500);
      }

      // Log the creation
      await this.logAdminOperation({
        action: "create",
        resource_type: "api_keys",
        resource_id: result.id,
        performed_by: createdBy,
        performed_at: new Date().toISOString(),
        ip_address: "system",
        user_agent: "admin-service",
        request_id: uuidv4(),
        changes: { api_key_name: data.name },
      });

      return { ...result, key: apiKey };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to create API key", 500);
    }
  }

  /**
   * Get all API keys with filtering and pagination
   */
  async getApiKeys(
    filters: AdminApiKeyFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ apiKeys: AdminApiKey[]; meta: PaginationMeta }> {
    try {
      let query = supabase.from("admin_api_keys").select("*", { count: "exact" });

      // Apply filters
      if (filters.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }
      if (filters.created_by) {
        query = query.eq("created_by", filters.created_by);
      }
      if (filters.expires_before) {
        query = query.lt("expires_at", filters.expires_before);
      }
      if (filters.expires_after) {
        query = query.gt("expires_at", filters.expires_after);
      }
      if (filters.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1).order("created_at", { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        throw new AppError(`Failed to fetch API keys: ${error.message}`, 500);
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        apiKeys: data || [],
        meta: {
          page,
          limit,
          total: count || 0,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to fetch API keys", 500);
    }
  }

  /**
   * Update an API key
   */
  async updateApiKey(
    id: string,
    data: UpdateAdminApiKeyDTO,
    updatedBy: string
  ): Promise<AdminApiKey> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (data.name) updateData.name = data.name;
      if (data.permissions) updateData.permissions = data.permissions;
      if (data.rate_limit) updateData.rate_limit = data.rate_limit;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;
      if (data.expires_at) updateData.expires_at = data.expires_at;

      const { data: result, error } = await supabase
        .from("admin_api_keys")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new AppError(`Failed to update API key: ${error.message}`, 500);
      }

      // Log the update
      await this.logAdminOperation({
        action: "update",
        resource_type: "api_keys",
        resource_id: id,
        performed_by: updatedBy,
        performed_at: new Date().toISOString(),
        ip_address: "system",
        user_agent: "admin-service",
        request_id: uuidv4(),
        changes: data,
      });

      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to update API key", 500);
    }
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(id: string, revokedBy: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("admin_api_keys")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        throw new AppError(`Failed to revoke API key: ${error.message}`, 500);
      }

      // Log the revocation
      await this.logAdminOperation({
        action: "revoke",
        resource_type: "api_keys",
        resource_id: id,
        performed_by: revokedBy,
        performed_at: new Date().toISOString(),
        ip_address: "system",
        user_agent: "admin-service",
        request_id: uuidv4(),
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to revoke API key", 500);
    }
  }

  /**
   * Validate API key and check permissions
   */
  async validateApiKey(
    apiKey: string,
    resource: string,
    action: string
  ): Promise<{ isValid: boolean; permissions?: AdminPermission[]; keyId?: string }> {
    try {
      const keyHash = this.hashApiKey(apiKey);

      const { data, error } = await supabase
        .from("admin_api_keys")
        .select("*")
        .eq("key_hash", keyHash)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        return { isValid: false };
      }

      // Check if key is expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return { isValid: false };
      }

      // Check permissions
      const hasPermission = data.permissions.some((permission: AdminPermission) => {
        if (permission.resource !== resource && permission.resource !== "*") {
          return false;
        }
        return permission.actions.includes(action) || permission.actions.includes("*");
      });

      if (!hasPermission) {
        return { isValid: false };
      }

      // Update last used timestamp
      await supabase
        .from("admin_api_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", data.id);

      return { isValid: true, permissions: data.permissions, keyId: data.id };
    } catch (error) {
      return { isValid: false };
    }
  }

  // ============================================================================
  // WEBHOOK MANAGEMENT
  // ============================================================================

  /**
   * Create a new webhook
   */
  async createWebhook(
    data: CreateWebhookDTO,
    createdBy: string
  ): Promise<Webhook> {
    try {
      const secret = this.generateWebhookSecret();
      const secretHash = this.hashSecret(secret);

      const webhookData = {
        id: uuidv4(),
        name: data.name,
        url: data.url,
        events: data.events,
        secret: secretHash,
        is_active: true,
        retry_policy: data.retry_policy || this.DEFAULT_RETRY_POLICY,
        created_by: createdBy,
        created_at: new Date().toISOString(),
        failure_count: 0,
      };

      const { data: result, error } = await supabase
        .from("webhooks")
        .insert(webhookData)
        .select()
        .single();

      if (error) {
        throw new AppError(`Failed to create webhook: ${error.message}`, 500);
      }

      // Log the creation
      await this.logAdminOperation({
        action: "create",
        resource_type: "webhooks",
        resource_id: result.id,
        performed_by: createdBy,
        performed_at: new Date().toISOString(),
        ip_address: "system",
        user_agent: "admin-service",
        request_id: uuidv4(),
        changes: { webhook_name: data.name, webhook_url: data.url },
      });

      // Return the hashed value as the signing key to clients for consistency
      return { ...result, secret: secretHash };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to create webhook", 500);
    }
  }

  /**
   * Get all webhooks with filtering and pagination
   */
  async getWebhooks(
    filters: WebhookFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ webhooks: Webhook[]; meta: PaginationMeta }> {
    try {
      let query = supabase.from("webhooks").select("*", { count: "exact" });

      // Apply filters
      if (filters.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }
      if (filters.event_type) {
        query = query.contains("events", [{ type: filters.event_type }]);
      }
      if (filters.created_by) {
        query = query.eq("created_by", filters.created_by);
      }
      if (filters.failure_count_min !== undefined) {
        query = query.gte("failure_count", filters.failure_count_min);
      }
      if (filters.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1).order("created_at", { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        throw new AppError(`Failed to fetch webhooks: ${error.message}`, 500);
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        webhooks: data || [],
        meta: {
          page,
          limit,
          total: count || 0,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to fetch webhooks", 500);
    }
  }

  /**
   * Trigger webhook for an event
   */
  async triggerWebhook(
    eventType: WebhookEventType,
    data: any,
    webhookId?: string
  ): Promise<void> {
    try {
      let query = supabase
        .from("webhooks")
        .select("*")
        .eq("is_active", true);

      if (webhookId) {
        query = query.eq("id", webhookId);
      } else {
        // Find webhooks that listen to this event type
        query = query.contains("events", [{ type: eventType }]);
      }

      const { data: webhooks, error } = await query;

      if (error) {
        throw new AppError(`Failed to fetch webhooks: ${error.message}`, 500);
      }

      if (!webhooks || webhooks.length === 0) {
        return;
      }

      // Create webhook payload
      const payload: WebhookPayload = {
        id: uuidv4(),
        event_type: eventType,
        timestamp: new Date().toISOString(),
        data,
        webhook_id: "",
        attempt: 1,
      };

      // Process each webhook
      for (const webhook of webhooks) {
        payload.webhook_id = webhook.id;
        await this.deliverWebhook(webhook, payload);
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to trigger webhook", 500);
    }
  }

  /**
   * Deliver webhook payload
   */
  private async deliverWebhook(webhook: Webhook, payload: WebhookPayload): Promise<void> {
    try {
      const signature = await this.generateWebhookSignature(payload, webhook.secret);

      const delivery: WebhookDelivery = {
        id: uuidv4(),
        webhook_id: webhook.id,
        payload_id: payload.id,
        status: "pending",
        created_at: new Date().toISOString(),
      };

      // Store delivery record
      const { error: insertErr } = await supabase.from("webhook_deliveries").insert(delivery);
      if (insertErr) throw new AppError(`Failed to record webhook delivery: ${insertErr.message}`, 500);

      // Send webhook
      const response = await axios.post(webhook.url, payload, {
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
          "X-Webhook-Event": payload.event_type,
          "X-Webhook-Delivery": delivery.id,
        },
        timeout: 30000,
      });

      // Update delivery status
      await supabase
        .from("webhook_deliveries")
        .update({
          status: "delivered",
          response_code: response.status,
          response_body: JSON.stringify(response.data),
          delivered_at: new Date().toISOString(),
        })
        .eq("id", delivery.id);

      // Update webhook last triggered
      await supabase
        .from("webhooks")
        .update({ last_triggered_at: new Date().toISOString() })
        .eq("id", webhook.id);

    } catch (error) {
      // Handle delivery failure
      await this.handleWebhookDeliveryFailure(webhook, payload, error);
    }
  }

  /**
   * Handle webhook delivery failure
   */
  private async handleWebhookDeliveryFailure(
    webhook: Webhook,
    payload: WebhookPayload,
    error: any
  ): Promise<void> {
    try {
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
      const responseCode = error.response?.status || 0;

      // Update delivery status
      await supabase
        .from("webhook_deliveries")
        .update({
          status: payload.attempt < webhook.retry_policy.max_retries ? "retrying" : "failed",
          response_code: responseCode,
          error_message: errorMessage,
        })
        .eq("webhook_id", webhook.id)
        .eq("payload_id", payload.id);

      // Increment failure count
      await supabase
        .from("webhooks")
        .update({ failure_count: webhook.failure_count + 1 })
        .eq("id", webhook.id);

      // Schedule retry if within retry limit
      if (payload.attempt < webhook.retry_policy.max_retries) {
        const retryDelay = Math.min(
          webhook.retry_policy.retry_delay_ms * Math.pow(webhook.retry_policy.backoff_multiplier, payload.attempt - 1),
          webhook.retry_policy.max_delay_ms
        );

        setTimeout(() => {
          this.deliverWebhook(webhook, { ...payload, attempt: payload.attempt + 1 });
        }, retryDelay);
      }
    } catch (retryError) {
      console.error("Failed to handle webhook delivery failure:", retryError);
    }
  }

  // ============================================================================
  // INTEGRATION FRAMEWORK
  // ============================================================================

  /**
   * Get available integration providers
   */
  async getIntegrationProviders(): Promise<IntegrationProvider[]> {
    try {
      const { data, error } = await supabase
        .from("integration_providers")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) {
        throw new AppError(`Failed to fetch integration providers: ${error.message}`, 500);
      }

      return data || [];
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to fetch integration providers", 500);
    }
  }

  /**
   * Create integration instance
   */
  async createIntegrationInstance(
    data: CreateIntegrationInstanceDTO,
    createdBy: string
  ): Promise<IntegrationInstance> {
    try {
      const instanceData = {
        id: uuidv4(),
        provider_id: data.provider_id,
        name: data.name,
        config: data.config,
        credentials: await this.encryptCredentials(data.credentials),
        is_active: true,
        created_by: createdBy,
        created_at: new Date().toISOString(),
      };

      const { data: result, error } = await supabase
        .from("integration_instances")
        .insert(instanceData)
        .select()
        .single();

      if (error) {
        throw new AppError(`Failed to create integration instance: ${error.message}`, 500);
      }

      // Log the creation
      await this.logAdminOperation({
        action: "create",
        resource_type: "integrations",
        resource_id: result.id,
        performed_by: createdBy,
        performed_at: new Date().toISOString(),
        ip_address: "system",
        user_agent: "admin-service",
        request_id: uuidv4(),
        changes: { integration_name: data.name, provider_id: data.provider_id },
      });

      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to create integration instance", 500);
    }
  }

  // ============================================================================
  // MONITORING AND ANALYTICS
  // ============================================================================

  /**
   * Get API metrics
   */
  async getApiMetrics(
    timeRange: { start: string; end: string },
    apiKeyId?: string
  ): Promise<AdminApiMetrics> {
    try {
      let query = supabase
        .from("admin_api_logs")
        .select("*")
        .gte("timestamp", timeRange.start)
        .lte("timestamp", timeRange.end);

      if (apiKeyId) {
        query = query.eq("api_key_id", apiKeyId);
      }

      const { data, error } = await query;

      if (error) {
        throw new AppError(`Failed to fetch API metrics: ${error.message}`, 500);
      }

      const logs = data || [];
      const totalRequests = logs.length;
      const successfulRequests = logs.filter(log => log.status_code >= 200 && log.status_code < 300).length;
      const failedRequests = totalRequests - successfulRequests;
      const averageResponseTime = logs.reduce((sum, log) => sum + log.response_time_ms, 0) / totalRequests || 0;

      const requestsByEndpoint = logs.reduce((acc, log) => {
        acc[log.endpoint] = (acc[log.endpoint] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const requestsByApiKey = logs.reduce((acc, log) => {
        acc[log.api_key_id] = (acc[log.api_key_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const errorRates = logs.reduce((acc, log) => {
        if (log.status_code >= 400) {
          const errorType = `${Math.floor(log.status_code / 100)}xx`;
          acc[errorType] = (acc[errorType] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      return {
        total_requests: totalRequests,
        successful_requests: successfulRequests,
        failed_requests: failedRequests,
        average_response_time_ms: Math.round(averageResponseTime),
        requests_by_endpoint: requestsByEndpoint,
        requests_by_api_key: requestsByApiKey,
        error_rates: errorRates,
        time_range: timeRange,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to fetch API metrics", 500);
    }
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<AdminSystemHealth> {
    try {
      const components = await this.checkSystemComponents();
      const metrics = await this.getSystemMetrics();

      const overallStatus = this.determineOverallStatus(components);

      return {
        status: overallStatus,
        components,
        metrics,
        last_updated: new Date().toISOString(),
      };
    } catch (error) {
      throw new AppError("Failed to get system health", 500);
    }
  }

  /**
   * Check system components health
   */
  private async checkSystemComponents(): Promise<AdminSystemHealth["components"]> {
    const components: AdminSystemHealth["components"] = {
      database: await this.checkDatabaseHealth(),
      redis: await this.checkRedisHealth(),
      blockchain: await this.checkBlockchainHealth(),
      ai_service: await this.checkAiServiceHealth(),
      webhook_service: await this.checkWebhookServiceHealth(),
    };

    return components;
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<ComponentHealth> {
    try {
      const startTime = Date.now();
      const { error } = await supabase.from("users").select("id").limit(1);
      const responseTime = Date.now() - startTime;

      return {
        status: error ? "critical" : "healthy",
        response_time_ms: responseTime,
        last_check: new Date().toISOString(),
        error_rate: error ? 1 : 0,
      };
    } catch (error) {
      return {
        status: "critical",
        last_check: new Date().toISOString(),
        error_rate: 1,
      };
    }
  }

  /**
   * Check Redis health (placeholder - implement based on your Redis setup)
   */
  private async checkRedisHealth(): Promise<ComponentHealth> {
    // TODO: Implement Redis health check
    return {
      status: "unknown",
      last_check: new Date().toISOString(),
    };
  }

  /**
   * Check blockchain health (placeholder - implement based on your blockchain setup)
   */
  private async checkBlockchainHealth(): Promise<ComponentHealth> {
    // TODO: Implement blockchain health check
    return {
      status: "unknown",
      last_check: new Date().toISOString(),
    };
  }

  /**
   * Check AI service health
   */
  private async checkAiServiceHealth(): Promise<ComponentHealth> {
    try {
      const startTime = Date.now();
      // TODO: Implement actual AI service health check
      const responseTime = Date.now() - startTime;

      return {
        status: "healthy",
        response_time_ms: responseTime,
        last_check: new Date().toISOString(),
        error_rate: 0,
      };
    } catch (error) {
      return {
        status: "critical",
        last_check: new Date().toISOString(),
        error_rate: 1,
      };
    }
  }

  /**
   * Check webhook service health
   */
  private async checkWebhookServiceHealth(): Promise<ComponentHealth> {
    try {
      const { data, error } = await supabase
        .from("webhooks")
        .select("id")
        .eq("is_active", true)
        .limit(1);

      return {
        status: error ? "degraded" : "healthy",
        last_check: new Date().toISOString(),
        error_rate: error ? 0.1 : 0,
      };
    } catch (error) {
      return {
        status: "critical",
        last_check: new Date().toISOString(),
        error_rate: 1,
      };
    }
  }

  /**
   * Get system metrics
   */
  private async getSystemMetrics(): Promise<AdminSystemHealth["metrics"]> {
    // TODO: Implement actual system metrics collection
    return {
      cpu_usage: 0,
      memory_usage: 0,
      disk_usage: 0,
      active_connections: 0,
    };
  }

  /**
   * Determine overall system status
   */
  private determineOverallStatus(components: AdminSystemHealth["components"]): "healthy" | "degraded" | "critical" {
    const statuses = Object.values(components).map(comp => comp.status);
    
    if (statuses.includes("critical")) return "critical";
    if (statuses.includes("degraded")) return "degraded";
    if (statuses.includes("unknown")) return "degraded";
    return "healthy";
  }

  // ============================================================================
  // AUDIT LOGGING
  // ============================================================================

  /**
   * Log admin operation
   */
  async logAdminOperation(operation: AdminAuditLog): Promise<void> {
    try {
      await supabase.from("admin_audit_logs").insert(operation);
    } catch (error) {
      console.error("Failed to log admin operation:", error);
    }
  }

  /**
   * Log API request
   */
  async logApiRequest(log: AdminApiLog): Promise<void> {
    try {
      await supabase.from("admin_api_logs").insert(log);
    } catch (error) {
      console.error("Failed to log API request:", error);
    }
  }

  /**
   * Get audit logs with filtering and pagination
   */
  async getAuditLogs(
    filters: AdminAuditLogFilters = {},
    page: number = 1,
    limit: number = 50
  ): Promise<{ logs: AdminAuditLog[]; meta: PaginationMeta }> {
    try {
      let query = supabase.from("admin_audit_logs").select("*", { count: "exact" });

      // Apply filters
      if (filters.action) {
        query = query.eq("action", filters.action);
      }
      if (filters.resource_type) {
        query = query.eq("resource_type", filters.resource_type);
      }
      if (filters.performed_by) {
        query = query.eq("performed_by", filters.performed_by);
      }
      if (filters.performed_after) {
        query = query.gte("performed_at", filters.performed_after);
      }
      if (filters.performed_before) {
        query = query.lte("performed_at", filters.performed_before);
      }
      if (filters.search) {
        query = query.or(`action.ilike.%${filters.search}%,resource_type.ilike.%${filters.search}%`);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1).order("performed_at", { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        throw new AppError(`Failed to fetch audit logs: ${error.message}`, 500);
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        logs: data || [],
        meta: {
          page,
          limit,
          total: count || 0,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to fetch audit logs", 500);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Generate API key
   */
  private generateApiKey(): string {
    const prefix = "oh_admin_";
    const randomBytes = crypto.randomBytes(32);
    const key = randomBytes.toString("hex");
    return `${prefix}${key}`;
  }

  /**
   * Hash API key
   */
  private hashApiKey(apiKey: string): string {
    return crypto.createHash("sha256").update(apiKey).digest("hex");
  }

  /**
   * Generate webhook secret
   */
  private generateWebhookSecret(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Hash webhook secret
   */
  private hashSecret(secret: string): string {
    return crypto.createHash("sha256").update(secret).digest("hex");
  }

  /**
   * Generate webhook signature
   */
  private async generateWebhookSignature(payload: WebhookPayload, secret: string): Promise<string> {
    const payloadString = JSON.stringify(payload);
    return crypto
      .createHmac("sha256", secret)
      .update(payloadString)
      .digest("hex");
  }

  /**
   * Encrypt credentials using AES-256-GCM
   */
  private async encryptCredentials(credentials: any): Promise<string> {
    const crypto = require('crypto');
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ADMIN_ENC_KEY || 'default-key-32-chars-long-12345', 'utf8');
    
    if (key.length !== 32) {
      throw new Error('ADMIN_ENC_KEY must be exactly 32 characters for AES-256');
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from('admin-integration', 'utf8'));
    
    let encrypted = cipher.update(JSON.stringify(credentials), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combine IV + AuthTag + Encrypted data
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt credentials using AES-256-GCM
   */
  private async decryptCredentials(encryptedCredentials: string): Promise<any> {
    const crypto = require('crypto');
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ADMIN_ENC_KEY || 'default-key-32-chars-long-12345', 'utf8');
    
    if (key.length !== 32) {
      throw new Error('ADMIN_ENC_KEY must be exactly 32 characters for AES-256');
    }

    const parts = encryptedCredentials.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted credentials format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAAD(Buffer.from('admin-integration', 'utf8'));
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }
}

export const adminIntegrationService = new AdminIntegrationService();
