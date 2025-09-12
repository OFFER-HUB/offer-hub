import { Router } from "express";
import { adminIntegrationController } from "@/controllers/admin-integration.controller";
import { authenticateToken } from "@/middlewares/auth.middleware";
import { requireAdmin } from "@/middlewares/role.middleware";
import { adminApiKeyMiddleware } from "@/middlewares/admin-api-key.middleware";
import { adminRateLimitMiddleware } from "@/middlewares/admin-rate-limit.middleware";

const router = Router();

// ============================================================================
// ADMIN AUTHENTICATION MIDDLEWARE
// All admin routes require admin role authentication
// ============================================================================

router.use(authenticateToken());
router.use(requireAdmin());

// ============================================================================
// API KEY MANAGEMENT ROUTES
// ============================================================================

/**
 * @route   POST /api/admin/api-keys
 * @desc    Create a new admin API key
 * @access  Admin only
 */
router.post("/api-keys", adminIntegrationController.createApiKey);

/**
 * @route   GET /api/admin/api-keys
 * @desc    Get all admin API keys with filtering and pagination
 * @access  Admin only
 */
router.get("/api-keys", adminIntegrationController.getApiKeys);

/**
 * @route   GET /api/admin/api-keys/:id
 * @desc    Get a specific API key by ID
 * @access  Admin only
 */
router.get("/api-keys/:id", adminIntegrationController.getApiKeyById);

/**
 * @route   PUT /api/admin/api-keys/:id
 * @desc    Update an API key
 * @access  Admin only
 */
router.put("/api-keys/:id", adminIntegrationController.updateApiKey);

/**
 * @route   DELETE /api/admin/api-keys/:id
 * @desc    Revoke an API key
 * @access  Admin only
 */
router.delete("/api-keys/:id", adminIntegrationController.revokeApiKey);

// ============================================================================
// WEBHOOK MANAGEMENT ROUTES
// ============================================================================

/**
 * @route   POST /api/admin/webhooks
 * @desc    Create a new webhook
 * @access  Admin only
 */
router.post("/webhooks", adminIntegrationController.createWebhook);

/**
 * @route   GET /api/admin/webhooks
 * @desc    Get all webhooks with filtering and pagination
 * @access  Admin only
 */
router.get("/webhooks", adminIntegrationController.getWebhooks);

/**
 * @route   GET /api/admin/webhooks/:id
 * @desc    Get a specific webhook by ID
 * @access  Admin only
 */
router.get("/webhooks/:id", adminIntegrationController.getWebhookById);

/**
 * @route   PUT /api/admin/webhooks/:id
 * @desc    Update a webhook
 * @access  Admin only
 */
router.put("/webhooks/:id", adminIntegrationController.updateWebhook);

/**
 * @route   DELETE /api/admin/webhooks/:id
 * @desc    Delete a webhook
 * @access  Admin only
 */
router.delete("/webhooks/:id", adminIntegrationController.deleteWebhook);

/**
 * @route   POST /api/admin/webhooks/:id/test
 * @desc    Test a webhook
 * @access  Admin only
 */
router.post("/webhooks/:id/test", adminIntegrationController.testWebhook);

/**
 * @route   GET /api/admin/webhooks/:id/deliveries
 * @desc    Get webhook delivery logs
 * @access  Admin only
 */
router.get("/webhooks/:id/deliveries", adminIntegrationController.getWebhookDeliveries);

/**
 * @route   POST /api/admin/webhooks/trigger
 * @desc    Trigger webhook for an event
 * @access  Admin only
 */
router.post("/webhooks/trigger", adminIntegrationController.triggerWebhook);

// ============================================================================
// INTEGRATION FRAMEWORK ROUTES
// ============================================================================

/**
 * @route   GET /api/admin/integrations/providers
 * @desc    Get available integration providers
 * @access  Admin only
 */
router.get("/integrations/providers", adminIntegrationController.getIntegrationProviders);

/**
 * @route   GET /api/admin/integrations/instances
 * @desc    Get all integration instances with filtering and pagination
 * @access  Admin only
 */
router.get("/integrations/instances", adminIntegrationController.getIntegrationInstances);

/**
 * @route   POST /api/admin/integrations/instances
 * @desc    Create integration instance
 * @access  Admin only
 */
router.post("/integrations/instances", adminIntegrationController.createIntegrationInstance);

/**
 * @route   PUT /api/admin/integrations/instances/:id
 * @desc    Update integration instance
 * @access  Admin only
 */
router.put("/integrations/instances/:id", adminIntegrationController.updateIntegrationInstance);

/**
 * @route   DELETE /api/admin/integrations/instances/:id
 * @desc    Delete integration instance
 * @access  Admin only
 */
router.delete("/integrations/instances/:id", adminIntegrationController.deleteIntegrationInstance);

/**
 * @route   GET /api/admin/integrations/instances/:id/syncs
 * @desc    Get integration sync logs
 * @access  Admin only
 */
router.get("/integrations/instances/:id/syncs", adminIntegrationController.getIntegrationSyncs);

// ============================================================================
// MONITORING AND ANALYTICS ROUTES
// ============================================================================

/**
 * @route   GET /api/admin/metrics/api
 * @desc    Get API metrics
 * @access  Admin only
 */
router.get("/metrics/api", adminIntegrationController.getApiMetrics);

/**
 * @route   GET /api/admin/health
 * @desc    Get system health status
 * @access  Admin only
 */
router.get("/health", adminIntegrationController.getSystemHealth);

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get audit logs with filtering and pagination
 * @access  Admin only
 */
router.get("/audit-logs", adminIntegrationController.getAuditLogs);

// ============================================================================
// NOTIFICATION ROUTES
// ============================================================================

/**
 * @route   GET /api/admin/notifications
 * @desc    Get admin notifications
 * @access  Admin only
 */
router.get("/notifications", adminIntegrationController.getNotifications);

/**
 * @route   PUT /api/admin/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Admin only
 */
router.put("/notifications/:id/read", adminIntegrationController.markNotificationAsRead);

// ============================================================================
// EXTERNAL ADMIN API ROUTES (API Key Authentication)
// These routes use API key authentication instead of JWT
// ============================================================================

const externalRouter = Router();

// Apply API key authentication and rate limiting to external routes
externalRouter.use(adminApiKeyMiddleware);
externalRouter.use(adminRateLimitMiddleware);

/**
 * @route   GET /api/admin/external/users
 * @desc    Get users (external API)
 * @access  API Key with users:read permission
 */
externalRouter.get("/users", async (req, res, next) => {
  try {
    // TODO: Implement external user management API
    res.json({
      success: true,
      message: "External user API endpoint",
      data: [],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/external/projects
 * @desc    Get projects (external API)
 * @access  API Key with projects:read permission
 */
externalRouter.get("/projects", async (req, res, next) => {
  try {
    // TODO: Implement external project management API
    res.json({
      success: true,
      message: "External project API endpoint",
      data: [],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/external/contracts
 * @desc    Get contracts (external API)
 * @access  API Key with contracts:read permission
 */
externalRouter.get("/contracts", async (req, res, next) => {
  try {
    // TODO: Implement external contract management API
    res.json({
      success: true,
      message: "External contract API endpoint",
      data: [],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/external/system/health
 * @desc    Get system health (external API)
 * @access  API Key with system:read permission
 */
externalRouter.get("/system/health", async (req, res, next) => {
  try {
    const health = await adminIntegrationController.getSystemHealth(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/external/metrics
 * @desc    Get API metrics (external API)
 * @access  API Key with metrics:read permission
 */
externalRouter.get("/metrics", async (req, res, next) => {
  try {
    const metrics = await adminIntegrationController.getApiMetrics(req, res, next);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// WEBHOOK RECEIVER ROUTES (Public endpoints for webhook delivery)
// ============================================================================

const webhookRouter = Router();

/**
 * @route   POST /api/admin/webhooks/receive/:webhook_id
 * @desc    Receive webhook delivery status updates
 * @access  Public (with webhook signature validation)
 */
webhookRouter.post("/receive/:webhook_id", async (req, res, next) => {
  try {
    const { webhook_id } = req.params;
    const { status, response_code, response_body, error_message } = req.body;
    const signature = req.get("x-webhook-signature");
    
    if (!signature) {
      return res.status(401).json({
        success: false,
        error: { code: "MISSING_SIGNATURE", message: "Missing webhook signature" },
      });
    }
    
    // TODO: Verify signature against stored secret for webhook_id
    // await adminIntegrationService.verifyWebhookSignature(webhook_id, req.rawBody || req.body, signature);

    // TODO: Implement webhook delivery status update
    res.json({
      success: true,
      message: "Webhook delivery status updated",
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// EXPORT ROUTERS
// ============================================================================

export { router as adminIntegrationRoutes };
export { externalRouter as adminExternalApiRoutes };
export { webhookRouter as adminWebhookRoutes };
