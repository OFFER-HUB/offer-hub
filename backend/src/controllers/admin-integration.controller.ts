import { Request, Response, NextFunction } from "express";
import { adminIntegrationService } from "@/services/admin-integration.service";
import { AppError } from "@/utils/AppError";
import { buildSuccessResponse, buildListResponse, buildErrorResponse } from "@/utils/responseBuilder";
import {
  CreateAdminApiKeyDTO,
  UpdateAdminApiKeyDTO,
  CreateWebhookDTO,
  UpdateWebhookDTO,
  CreateIntegrationInstanceDTO,
  UpdateIntegrationInstanceDTO,
  AdminApiKeyFilters,
  WebhookFilters,
  IntegrationInstanceFilters,
  AdminAuditLogFilters,
  AdminApiMetrics,
  AdminSystemHealth,
  WebhookEventType,
} from "@/types/admin-integration.types";
import { AuthenticatedRequest } from "@/types/middleware.types";
import { supabase } from "@/lib/supabase/supabase";

/**
 * Administrative API and Integration Controller
 * Handles all administrative API operations, webhook management, and integration frameworks
 */
export class AdminIntegrationController {
  // ============================================================================
  // API KEY MANAGEMENT ENDPOINTS
  // ============================================================================

  /**
   * Create a new admin API key
   * POST /api/admin/api-keys
   */
  async createApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data: CreateAdminApiKeyDTO = req.body;
      const createdBy = req.user!.id;

      const apiKey = await adminIntegrationService.createApiKey(data, createdBy);

      res.status(201).json(
        buildSuccessResponse(apiKey, "API key created successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all admin API keys with filtering and pagination
   * GET /api/admin/api-keys
   */
  async getApiKeys(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const filters: AdminApiKeyFilters = {
        is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined,
        created_by: req.query.created_by as string,
        expires_before: req.query.expires_before as string,
        expires_after: req.query.expires_after as string,
        search: req.query.search as string,
      };

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await adminIntegrationService.getApiKeys(filters, page, limit);

      res.json(
        buildSuccessResponse(result, "API keys retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific API key by ID
   * GET /api/admin/api-keys/:id
   */
  async getApiKeyById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const { data: apiKey, error } = await supabase
        .from("admin_api_keys")
        .select(
          "id, name, key_prefix, permissions, rate_limit, is_active, created_by, created_at, updated_at, expires_at, last_used_at"
        )
        .eq("id", id)
        .single();

      if (error || !apiKey) {
        throw new AppError("API key not found", 404);
      }

      res.json(
        buildSuccessResponse(apiKey, "API key retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an API key
   * PUT /api/admin/api-keys/:id
   */
  async updateApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: UpdateAdminApiKeyDTO = req.body;
      const updatedBy = req.user!.id;

      const apiKey = await adminIntegrationService.updateApiKey(id, data, updatedBy);

      res.json(
        buildSuccessResponse(apiKey, "API key updated successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Revoke an API key
   * DELETE /api/admin/api-keys/:id
   */
  async revokeApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const revokedBy = req.user!.id;

      await adminIntegrationService.revokeApiKey(id, revokedBy);

      res.json(
        buildSuccessResponse(null, "API key revoked successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // WEBHOOK MANAGEMENT ENDPOINTS
  // ============================================================================

  /**
   * Create a new webhook
   * POST /api/admin/webhooks
   */
  async createWebhook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data: CreateWebhookDTO = req.body;
      const createdBy = req.user!.id;

      const webhook = await adminIntegrationService.createWebhook(data, createdBy);
      const { secret, ...safeWebhook } = webhook as any;

      res.status(201).json(
        buildSuccessResponse(safeWebhook, "Webhook created successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all webhooks with filtering and pagination
   * GET /api/admin/webhooks
   */
  async getWebhooks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const filters: WebhookFilters = {
        is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined,
        event_type: req.query.event_type as string,
        created_by: req.query.created_by as string,
        failure_count_min: req.query.failure_count_min ? parseInt(req.query.failure_count_min as string) : undefined,
        search: req.query.search as string,
      };

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await adminIntegrationService.getWebhooks(filters, page, limit);

      res.json(
        buildSuccessResponse(result, "Webhooks retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific webhook by ID
   * GET /api/admin/webhooks/:id
   */
  async getWebhookById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const { data: webhook, error } = await supabase
        .from("webhooks")
        .select("id, name, url, events, is_active, retry_policy, created_by, created_at, updated_at, last_triggered_at, failure_count")
        .eq("id", id)
        .single();

      if (error || !webhook) {
        throw new AppError("Webhook not found", 404);
      }

      res.json(
        buildSuccessResponse(webhook, "Webhook retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a webhook
   * PUT /api/admin/webhooks/:id
   */
  async updateWebhook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: UpdateWebhookDTO = req.body;

      const { data: webhook, error } = await supabase
        .from("webhooks")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("id, name, url, events, is_active, retry_policy, created_by, created_at, updated_at, last_triggered_at, failure_count")
        .single();

      if (error) {
        // PGRST116: No rows found for single()
        if ((error as any).code === "PGRST116") {
          throw new AppError("Webhook not found", 404);
        }
        throw new AppError(`Failed to update webhook: ${error.message}`, 500);
      }

      res.json(
        buildSuccessResponse(webhook, "Webhook updated successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a webhook
   * DELETE /api/admin/webhooks/:id
   */
  async deleteWebhook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const { data: deleted, error } = await supabase
        .from("webhooks")
        .delete()
        .eq("id", id)
        .select("id")
        .single();

      if (error) {
        if ((error as any).code === "PGRST116") {
          throw new AppError("Webhook not found", 404);
        }
        throw new AppError(`Failed to delete webhook: ${error.message}`, 500);
      }

      res.json(
        buildSuccessResponse(null, "Webhook deleted successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test a webhook
   * POST /api/admin/webhooks/:id/test
   */
  async testWebhook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { event_type, data } = req.body;

      await adminIntegrationService.triggerWebhook(event_type as WebhookEventType, data, id);

      res.json(
        buildSuccessResponse(null, "Webhook test triggered successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // INTEGRATION FRAMEWORK ENDPOINTS
  // ============================================================================

  /**
   * Get available integration providers
   * GET /api/admin/integrations/providers
   */
  async getIntegrationProviders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const providers = await adminIntegrationService.getIntegrationProviders();

      res.json(
        buildSuccessResponse(providers, "Integration providers retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all integration instances with filtering and pagination
   * GET /api/admin/integrations/instances
   */
  async getIntegrationInstances(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const filters: IntegrationInstanceFilters = {
        provider_id: req.query.provider_id as string,
        is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined,
        created_by: req.query.created_by as string,
        search: req.query.search as string,
      };

      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100); // Cap at 100

      let query = supabase
        .from("integration_instances")
        .select(
          "id, provider_id, name, config, is_active, created_by, created_at, updated_at, last_sync_at",
          { count: "exact" }
        );
      
      if (filters.provider_id) query = query.eq("provider_id", filters.provider_id);
      if (filters.is_active !== undefined) query = query.eq("is_active", filters.is_active);
      if (filters.created_by) query = query.eq("created_by", filters.created_by);
      if (filters.search) query = query.ilike("name", `%${filters.search}%`);
      
      const { data: instances, error, count } = await query
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        throw new AppError(`Failed to fetch integration instances: ${error.message}`, 500);
      }

      const totalPages = Math.ceil((count || 0) / limit);

      res.json(
        buildSuccessResponse({
          instances: instances || [],
          meta: {
            page,
            limit,
            total: count || 0,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1,
          },
        }, "Integration instances retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create integration instance
   * POST /api/admin/integrations/instances
   */
  async createIntegrationInstance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data: CreateIntegrationInstanceDTO = req.body;
      const createdBy = req.user!.id;

      const instance = await adminIntegrationService.createIntegrationInstance(data, createdBy);

      res.status(201).json(
        buildSuccessResponse(instance, "Integration instance created successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update integration instance
   * PUT /api/admin/integrations/instances/:id
   */
  async updateIntegrationInstance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: UpdateIntegrationInstanceDTO = req.body;

      const { data: instance, error } = await supabase
        .from("integration_instances")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("id, provider_id, name, config, is_active, created_by, created_at, updated_at, last_sync_at")
        .single();

      if (error) {
        if ((error as any).code === "PGRST116") {
          throw new AppError("Integration instance not found", 404);
        }
        throw new AppError(`Failed to update integration instance: ${error.message}`, 500);
      }

      res.json(
        buildSuccessResponse(instance, "Integration instance updated successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete integration instance
   * DELETE /api/admin/integrations/instances/:id
   */
  async deleteIntegrationInstance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const { data: deleted, error } = await supabase
        .from("integration_instances")
        .delete()
        .eq("id", id)
        .select("id")
        .single();

      if (error) {
        if ((error as any).code === "PGRST116") {
          throw new AppError("Integration instance not found", 404);
        }
        throw new AppError(`Failed to delete integration instance: ${error.message}`, 500);
      }

      res.json(
        buildSuccessResponse(null, "Integration instance deleted successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // MONITORING AND ANALYTICS ENDPOINTS
  // ============================================================================

  /**
   * Get API metrics
   * GET /api/admin/metrics/api
   */
  async getApiMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const startDate = req.query.start_date as string || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const endDate = req.query.end_date as string || new Date().toISOString();
      const apiKeyId = req.query.api_key_id as string;

      const timeRange = { start: startDate, end: endDate };
      const metrics = await adminIntegrationService.getApiMetrics(timeRange, apiKeyId);

      res.json(
        buildSuccessResponse(metrics, "API metrics retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get system health status
   * GET /api/admin/health
   */
  async getSystemHealth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const health = await adminIntegrationService.getSystemHealth();

      res.json(
        buildSuccessResponse(health, "System health retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get audit logs with filtering and pagination
   * GET /api/admin/audit-logs
   */
  async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const filters: AdminAuditLogFilters = {
        action: req.query.action as string,
        resource_type: req.query.resource_type as string,
        performed_by: req.query.performed_by as string,
        performed_after: req.query.performed_after as string,
        performed_before: req.query.performed_before as string,
        search: req.query.search as string,
      };

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await adminIntegrationService.getAuditLogs(filters, page, limit);

      res.json(
        buildSuccessResponse(result, "Audit logs retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // ADMIN OPERATIONS ENDPOINTS
  // ============================================================================

  /**
   * Trigger webhook for an event
   * POST /api/admin/webhooks/trigger
   */
  async triggerWebhook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { event_type, data, webhook_id } = req.body;

      await adminIntegrationService.triggerWebhook(event_type as WebhookEventType, data, webhook_id);

      res.json(
        buildSuccessResponse(null, "Webhook triggered successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get webhook delivery logs
   * GET /api/admin/webhooks/:id/deliveries
   */
  async getWebhookDeliveries(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { data: deliveries, error, count } = await supabase
        .from("webhook_deliveries")
        .select(
          "id, webhook_id, attempt, status, response_status, duration_ms, error_message, created_at",
          { count: "exact" }
        )
        .eq("webhook_id", id)
        .range((page - 1) * limit, page * limit - 1)
        .order("created_at", { ascending: false });

      if (error) {
        throw new AppError(`Failed to fetch webhook deliveries: ${error.message}`, 500);
      }

      const totalPages = Math.ceil((count || 0) / limit);

      res.json(
        buildSuccessResponse({
          deliveries: deliveries || [],
          meta: {
            page,
            limit,
            total: count || 0,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1,
          },
        }, "Webhook deliveries retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get integration sync logs
   * GET /api/admin/integrations/instances/:id/syncs
   */
  async getIntegrationSyncs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { data: syncs, error, count } = await supabase
        .from("integration_syncs")
        .select(
          "id, instance_id, status, started_at, finished_at, items_processed, error_message",
          { count: "exact" }
        )
        .eq("instance_id", id)
        .range((page - 1) * limit, page * limit - 1)
        .order("started_at", { ascending: false });

      if (error) {
        throw new AppError(`Failed to fetch integration syncs: ${error.message}`, 500);
      }

      const totalPages = Math.ceil((count || 0) / limit);

      res.json(
        buildSuccessResponse({
          syncs: syncs || [],
          meta: {
            page,
            limit,
            total: count || 0,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1,
          },
        }, "Integration syncs retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get admin notifications
   * GET /api/admin/notifications
   */
  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const is_read = req.query.is_read === 'true' ? true : req.query.is_read === 'false' ? false : undefined;

      let query = supabase
        .from("admin_notifications")
        .select("*", { count: "exact" });

      if (is_read !== undefined) {
        query = query.eq("is_read", is_read);
      }

      const { data: notifications, error, count } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order("created_at", { ascending: false });

      if (error) {
        throw new AppError(`Failed to fetch notifications: ${error.message}`, 500);
      }

      const totalPages = Math.ceil((count || 0) / limit);

      res.json(
        buildSuccessResponse({
          notifications: notifications || [],
          meta: {
            page,
            limit,
            total: count || 0,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1,
          },
        }, "Notifications retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark notification as read
   * PUT /api/admin/notifications/:id/read
   */
  async markNotificationAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const { data: notification, error } = await supabase
        .from("admin_notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if ((error as any).code === "PGRST116") {
          throw new AppError("Notification not found", 404);
        }
        throw new AppError(`Failed to mark notification as read: ${error.message}`, 500);
      }

      res.json(
        buildSuccessResponse(notification, "Notification marked as read")
      );
    } catch (error) {
      next(error);
    }
  }
}

export const adminIntegrationController = new AdminIntegrationController();
