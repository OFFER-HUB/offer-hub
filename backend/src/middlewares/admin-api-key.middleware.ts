import { Request, Response, NextFunction } from "express";
import { adminIntegrationService } from "@/services/admin-integration.service";
import { AppError } from "@/utils/AppError";
import { AuthenticatedRequest } from "@/types/middleware.types";
import { AdminPermission } from "@/types/admin-integration.types";

/**
 * Admin API Key Authentication Middleware
 * Validates API key and checks permissions for external admin API access
 */
export const adminApiKeyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.headers["x-api-key"] as string;
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: {
          code: "MISSING_API_KEY",
          message: "API key is required",
        },
      });
    }

    // Extract resource and action from the request
    const resource = extractResourceFromPath(req.path);
    const action = extractActionFromMethod(req.method);

    // Validate API key and check permissions
    const validation = await adminIntegrationService.validateApiKey(
      apiKey,
      resource,
      action
    );

    if (!validation.isValid) {
      return res.status(403).json({
        success: false,
        error: {
          code: "INVALID_API_KEY_OR_PERMISSIONS",
          message: "Invalid API key or insufficient permissions",
        },
      });
    }

    // Add API key info to request for logging
    (req as any).apiKeyId = validation.keyId;
    (req as any).apiKeyPermissions = validation.permissions;

    next();
  } catch (error) {
    next(new AppError("API key validation failed", 500));
  }
};

/**
 * Admin Rate Limiting Middleware
 * Implements rate limiting based on API key configuration
 */
export const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKeyId = (req as any).apiKeyId;
    
    if (!apiKeyId) {
      return next(new AppError("API key ID not found", 500));
    }

    // Get API key rate limit configuration
    const { data: apiKey, error } = await supabase
      .from("admin_api_keys")
      .select("rate_limit")
      .eq("id", apiKeyId)
      .single();

    if (error || !apiKey) {
      return next(new AppError("API key not found", 404));
    }

    const rateLimit = apiKey.rate_limit;
    const now = new Date();
    const windowStart = new Date(now.getTime() - 60 * 1000); // 1 minute window

    // Check current usage
    const { data: currentUsage, error: usageError } = await supabase
      .from("admin_api_rate_limits")
      .select("request_count")
      .eq("api_key_id", apiKeyId)
      .eq("window_type", "minute")
      .gte("window_start", windowStart.toISOString())
      .single();

    if (usageError && usageError.code !== "PGRST116") { // PGRST116 = no rows found
      return next(new AppError("Failed to check rate limit", 500));
    }

    const currentCount = currentUsage?.request_count || 0;

    // Check if rate limit exceeded
    if (currentCount >= rateLimit.requests_per_minute) {
      return res.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Rate limit exceeded",
        },
        meta: {
          rate_limit: {
            limit: rateLimit.requests_per_minute,
            remaining: 0,
            reset_time: new Date(now.getTime() + 60 * 1000).toISOString(),
            retry_after: 60,
          },
        },
      });
    }

    // Update or create rate limit record
    if (currentUsage) {
      await supabase
        .from("admin_api_rate_limits")
        .update({ request_count: currentCount + 1 })
        .eq("api_key_id", apiKeyId)
        .eq("window_type", "minute")
        .gte("window_start", windowStart.toISOString());
    } else {
      await supabase
        .from("admin_api_rate_limits")
        .insert({
          id: uuidv4(),
          api_key_id: apiKeyId,
          window_start: windowStart.toISOString(),
          window_type: "minute",
          request_count: 1,
        });
    }

    // Add rate limit info to response headers
    res.set({
      "X-RateLimit-Limit": rateLimit.requests_per_minute.toString(),
      "X-RateLimit-Remaining": (rateLimit.requests_per_minute - currentCount - 1).toString(),
      "X-RateLimit-Reset": new Date(now.getTime() + 60 * 1000).toISOString(),
    });

    next();
  } catch (error) {
    next(new AppError("Rate limiting failed", 500));
  }
};

/**
 * Extract resource type from API path
 */
function extractResourceFromPath(path: string): string {
  const parts = path.split("/").filter(Boolean);
  const idx = parts.findIndex(p => p === "external"); // works for "/api/admin/external/*"
  const resource = idx >= 0 ? parts[idx + 1] : parts[0];
  // Normalize hyphens to underscores for consistency with backend types
  return resource?.replace(/-/g, '_') || "system";
}

/**
 * Extract action from HTTP method
 */
function extractActionFromMethod(method: string): string {
  switch (method.toUpperCase()) {
    case "GET":
      return "read";
    case "POST":
      return "create";
    case "PUT":
    case "PATCH":
      return "update";
    case "DELETE":
      return "delete";
    default:
      return "read";
  }
}

/**
 * Check if API key has specific permission
 */
export function hasApiKeyPermission(
  permissions: AdminPermission[],
  resource: string,
  action: string
): boolean {
  return permissions.some(permission => {
    // Check resource match
    if (permission.resource !== resource && permission.resource !== "*") {
      return false;
    }
    
    // Check action match
    if (!permission.actions.includes(action) && !permission.actions.includes("*")) {
      return false;
    }
    
    // Check conditions if any
    if (permission.conditions && permission.conditions.length > 0) {
      // TODO: Implement condition checking logic
      return false; // Fail closed until implemented
    }
    
    return true;
  });
}

/**
 * Log API request for monitoring and analytics
 */
export async function logApiRequest(
  req: Request,
  res: Response,
  startTime: number
): Promise<void> {
  try {
    const apiKeyId = (req as any).apiKeyId;
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (!apiKeyId) return;

    const logData = {
      id: uuidv4(),
      api_key_id: apiKeyId,
      endpoint: req.path,
      method: req.method,
      status_code: res.statusCode,
      response_time_ms: responseTime,
      ip_address: req.ip || req.connection.remoteAddress || "unknown",
      user_agent: req.get("User-Agent") || "unknown",
      timestamp: new Date().toISOString(),
      error_message: res.statusCode >= 400 ? "Request failed" : undefined,
    };

    await adminIntegrationService.logApiRequest(logData);
  } catch (error) {
    console.error("Failed to log API request:", error);
  }
}

/**
 * Middleware to log API requests
 */
export const apiRequestLoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  
  // Log request when response finishes
  res.on("finish", () => {
    logApiRequest(req, res, startTime);
  });
  
  next();
};

// Import required dependencies
import { supabase } from "@/lib/supabase/supabase";
import { v4 as uuidv4 } from "uuid";
