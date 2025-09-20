import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import serviceRequestRoutes from "@/routes/service-request.routes";
import { reviewRoutes } from "./routes/review.routes";
import serviceRoutes from "@/routes/service.routes";
import applicationRoutes from "@/routes/application.routes";
import nftRoutes from "@/routes/nft.routes";
import contractRoutes from "@/routes/contract.routes";
import projectRoutes from "@/routes/project.routes";
import userRoutes from "@/routes/user.routes";
import authRoutes from "@/routes/auth.routes";
import { errorHandlerMiddleware, setupGlobalErrorHandlers } from "./middlewares/errorHandler.middleware";
import { generalLimiter, authLimiter } from "./middlewares/ratelimit.middleware";
import { authenticateToken } from "./middlewares/auth.middleware";
import { loggerMiddleware } from "./middlewares/logger.middleware";
import { logger } from "./utils/logger";
import conversationRoutes from "@/routes/conversation.routes";
import messageRoutes from "@/routes/message.routes";
import { adminIntegrationRoutes, adminExternalApiRoutes, adminWebhookRoutes } from "@/routes/admin-integration.routes";
import { apiRequestLoggingMiddleware } from "@/middlewares/sensitive-data-redaction.middleware";
import { requireAdminRole } from "@/middlewares/admin-rbac.middleware";
import { adminRateLimitMiddleware, burstRateLimitMiddleware } from "@/middlewares/admin-rate-limit.middleware";
import { adminApiKeyMiddleware } from "@/middlewares/admin-api-key.middleware";
import { rawBodyParser, verifyWebhookSignature } from "@/middlewares/webhook-signature.middleware";
import { redactSensitiveHeaders } from "@/middlewares/sensitive-data-redaction.middleware";
import reviewResponseRoutes from "@/routes/review-response.routes";
import { workflowRoutes } from "@/routes/workflow.routes";


// Setup global error handlers for uncaught exceptions and unhandled rejections
setupGlobalErrorHandlers();

const app = express();
const port = process.env.PORT || 4000;

// Middleware setup
logger.debug("Setting up CORS and JSON middleware");
app.use(cors());
app.use(express.json());

// Request logging middleware
logger.debug("Setting up logger middleware");
app.use(loggerMiddleware);

// Apply general rate limiting to all routes
logger.debug("Setting up rate limiting");
app.use(generalLimiter);

// Route setup
logger.debug("Setting up routes");

// Workflow routes (no authentication required for testing)
app.use("/api/workflow", workflowRoutes);

// Public routes (no authentication required)
app.use("/api/auth", authLimiter, authRoutes);

// Protected routes (authentication required)
app.use("/api/service-requests", authenticateToken(), serviceRequestRoutes);
app.use("/api/reviews", authenticateToken(), reviewRoutes);
app.use("/api/services", authenticateToken(), serviceRoutes);
app.use("/api/applications", authenticateToken(), applicationRoutes);
app.use("/api/nfts-awarded", authenticateToken(), nftRoutes);
app.use("/api/contracts", authenticateToken(), contractRoutes);
app.use("/api/projects", authenticateToken(), projectRoutes);
app.use("/api/users", authenticateToken(), userRoutes);
app.use("/api/conversations", authenticateToken(), conversationRoutes);
app.use("/api/messages", authenticateToken(), messageRoutes);
app.use("/api", reviewResponseRoutes);

// Simple test endpoint to verify server is working
app.get("/test", (req, res) => {
  logger.debug("Test endpoint accessed");
  res.json({ message: "Server is working", timestamp: new Date() });
});

// Admin Integration API routes with comprehensive security
app.use("/api/admin", 
  redactSensitiveHeaders,
  authenticateToken(),
  requireAdminRole,
  adminRateLimitMiddleware,
  adminIntegrationRoutes
);

app.use("/api/admin/external", 
  redactSensitiveHeaders,
  adminApiKeyMiddleware,
  burstRateLimitMiddleware,
  adminRateLimitMiddleware,
  apiRequestLoggingMiddleware,
  adminExternalApiRoutes
);

app.use("/api/admin/webhooks", 
  redactSensitiveHeaders,
  rawBodyParser,
  adminWebhookRoutes
);

app.get("/", (_req, res) => {
  logger.debug("Root endpoint accessed");
  res.send("💼 OFFER-HUB backend is up and running!");
});

// Use the new error handling middleware
app.use(errorHandlerMiddleware);

// Start server
app.listen(port, () => {
  logger.info(`🚀 OFFER-HUB server is live at http://localhost:${port}`);
  logger.info("🌐 Connecting freelancers and clients around the world...");
  logger.info("✅ Working...");
  logger.debug(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.debug("All routes and middleware configured successfully");
});