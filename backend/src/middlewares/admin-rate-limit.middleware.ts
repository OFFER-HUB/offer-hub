import { Request, Response, NextFunction } from "express";
import { supabase } from "@/lib/supabase/supabase";
import { AppError } from "@/utils/AppError";
import { v4 as uuidv4 } from "uuid";

/**
 * Floor date to window start boundary
 */
function floorToWindowStart(d: Date, type: "ten_seconds" | "minute" | "hour" | "day"): Date {
  const t = new Date(d);
  if (type === "ten_seconds") t.setSeconds(Math.floor(t.getSeconds() / 10) * 10, 0);
  else if (type === "minute") t.setSeconds(0, 0);
  else if (type === "hour") { t.setMinutes(0, 0, 0); }
  else if (type === "day") { t.setHours(0, 0, 0, 0); }
  return t;
}

/**
 * Get next reset time for window
 */
function nextResetForWindow(now: Date, type: "ten_seconds" | "minute" | "hour" | "day"): Date {
  const start = floorToWindowStart(now, type);
  if (type === "ten_seconds") return new Date(start.getTime() + 10_000);
  if (type === "minute") return new Date(start.getTime() + 60_000);
  if (type === "hour") return new Date(start.getTime() + 3_600_000);
  return new Date(start.getTime() + 86_400_000);
}

/**
 * Admin Rate Limiting Middleware
 * Implements comprehensive rate limiting for admin API endpoints
 */
export const adminRateLimitMiddleware = async (
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

    // Normalize windows to fixed boundaries (prevents row churn)
    const minuteStart = floorToWindowStart(now, "minute");
    const hourStart = floorToWindowStart(now, "hour");
    const dayStart = floorToWindowStart(now, "day");

    // Check minute rate limit
    const minuteUsage = await checkRateLimitUsage(apiKeyId, "minute", minuteStart);
    if (minuteUsage >= rateLimit.requests_per_minute) {
      return res.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Minute rate limit exceeded",
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

    // Check hour rate limit
    const hourUsage = await checkRateLimitUsage(apiKeyId, "hour", hourStart);
    if (hourUsage >= rateLimit.requests_per_hour) {
      return res.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Hour rate limit exceeded",
        },
        meta: {
          rate_limit: {
            limit: rateLimit.requests_per_hour,
            remaining: 0,
            reset_time: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
            retry_after: 3600,
          },
        },
      });
    }

    // Check day rate limit
    const dayUsage = await checkRateLimitUsage(apiKeyId, "day", dayStart);
    if (dayUsage >= rateLimit.requests_per_day) {
      const reset = nextResetForWindow(now, "day");
      const retryAfter = Math.ceil((reset.getTime() - now.getTime()) / 1000);
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Daily rate limit exceeded",
        },
        meta: {
          rate_limit: {
            limit: rateLimit.requests_per_day,
            remaining: 0,
            reset_time: reset.toISOString(),
            retry_after: retryAfter,
          },
        },
      });
    }

    // Update rate limit counters
    await updateRateLimitCounters(apiKeyId, minuteStart, hourStart, dayStart, minuteUsage, hourUsage, dayUsage);

    // Add rate limit info to response headers
    res.set({
      "X-RateLimit-Limit-Minute": rateLimit.requests_per_minute.toString(),
      "X-RateLimit-Remaining-Minute": Math.max(0, rateLimit.requests_per_minute - minuteUsage - 1).toString(),
      "X-RateLimit-Limit-Hour": rateLimit.requests_per_hour.toString(),
      "X-RateLimit-Remaining-Hour": Math.max(0, rateLimit.requests_per_hour - hourUsage - 1).toString(),
      "X-RateLimit-Limit-Day": rateLimit.requests_per_day.toString(),
      "X-RateLimit-Remaining-Day": Math.max(0, rateLimit.requests_per_day - dayUsage - 1).toString(),
      "X-RateLimit-Reset-Minute": nextResetForWindow(now, "minute").toISOString(),
      "X-RateLimit-Reset-Hour": nextResetForWindow(now, "hour").toISOString(),
      "X-RateLimit-Reset-Day": nextResetForWindow(now, "day").toISOString(),
    });

    next();
  } catch (error) {
    next(new AppError("Rate limiting failed", 500));
  }
};

/**
 * Check rate limit usage for a specific window
 */
async function checkRateLimitUsage(
  apiKeyId: string,
  windowType: "ten_seconds" | "minute" | "hour" | "day",
  windowStart: Date
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("admin_api_rate_limits")
      .select("request_count")
      .eq("api_key_id", apiKeyId)
      .eq("window_type", windowType)
      .eq("window_start", windowStart.toISOString())
      .single();

    if (error && error.code !== "PGRST116") { // PGRST116 = no rows found
      throw error;
    }

    return data?.request_count || 0;
  } catch (error) {
    console.error(`Failed to check ${windowType} rate limit usage:`, error);
    // Signal failure to caller
    throw error;
  }
}

/**
 * Update rate limit counters for all windows
 */
async function updateRateLimitCounters(
  apiKeyId: string,
  minuteWindow: Date,
  hourWindow: Date,
  dayWindow: Date,
  minuteUsage: number,
  hourUsage: number,
  dayUsage: number
): Promise<void> {
  try {
    // Update minute counter
    await updateRateLimitCounter(apiKeyId, "minute", minuteWindow, minuteUsage);
    
    // Update hour counter
    await updateRateLimitCounter(apiKeyId, "hour", hourWindow, hourUsage);
    
    // Update day counter
    await updateRateLimitCounter(apiKeyId, "day", dayWindow, dayUsage);
  } catch (error) {
    console.error("Failed to update rate limit counters:", error);
  }
}

/**
 * Update rate limit counter for a specific window
 */
async function updateRateLimitCounter(
  apiKeyId: string,
  windowType: "ten_seconds" | "minute" | "hour" | "day",
  windowStart: Date,
  currentCount: number
): Promise<void> {
  try {
    // Upsert by exact window row (minimizes duplicates; consider atomic RPC, see note below)
    const { data, error } = await supabase
      .from("admin_api_rate_limits")
      .upsert(
        [{
          id: uuidv4(),
          api_key_id: apiKeyId,
          window_start: windowStart.toISOString(),
          window_type: windowType,
          request_count: currentCount + 1,
        }],
        { onConflict: "api_key_id,window_type,window_start" }
      )
      .select();
  } catch (error) {
    console.error(`Failed to update ${windowType} rate limit counter:`, error);
  }
}

/**
 * Burst Rate Limiting Middleware
 * Implements burst protection to prevent sudden spikes in requests
 */
export const burstRateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKeyId = (req as any).apiKeyId;
    
    if (!apiKeyId) {
      return next(new AppError("API key ID not found", 500));
    }

    // Get API key burst limit configuration
    const { data: apiKey, error } = await supabase
      .from("admin_api_keys")
      .select("rate_limit")
      .eq("id", apiKeyId)
      .single();

    if (error || !apiKey) {
      return next(new AppError("API key not found", 404));
    }

    const burstLimit = apiKey.rate_limit.burst_limit ?? 10;
    const now = new Date();
    const tenSecondStart = floorToWindowStart(now, "ten_seconds");

    // Check burst usage
    const burstUsage = await checkRateLimitUsage(apiKeyId, "ten_seconds", tenSecondStart);
    
    if (burstUsage >= burstLimit) {
      return res.status(429).json({
        success: false,
        error: {
          code: "BURST_RATE_LIMIT_EXCEEDED",
          message: "Burst rate limit exceeded",
        },
        meta: {
          rate_limit: {
            limit: burstLimit,
            remaining: 0,
            reset_time: nextResetForWindow(now, "ten_seconds").toISOString(),
            retry_after: 10,
          },
        },
      });
    }

    // Record this request in the 10s window
    await updateRateLimitCounter(apiKeyId, "ten_seconds", tenSecondStart, burstUsage);

    next();
  } catch (error) {
    next(new AppError("Burst rate limiting failed", 500));
  }
};

/**
 * Quota Management Middleware
 * Implements quota-based rate limiting for API keys
 */
export const quotaManagementMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKeyId = (req as any).apiKeyId;
    
    if (!apiKeyId) {
      return next(new AppError("API key ID not found", 500));
    }

    // Check quota usage
    const { data: quotas, error } = await supabase
      .from("admin_api_quotas")
      .select("*")
      .eq("api_key_id", apiKeyId)
      .gt("reset_time", new Date().toISOString());

    if (error) {
      return next(new AppError("Failed to check quota usage", 500));
    }

    // Check if any quota is exceeded
    for (const quota of quotas || []) {
      if (quota.current_usage >= quota.limit_value) {
        return res.status(429).json({
          success: false,
          error: {
            code: "QUOTA_EXCEEDED",
            message: `${quota.quota_type} quota exceeded`,
          },
          meta: {
            quota: {
              type: quota.quota_type,
              limit: quota.limit_value,
              used: quota.current_usage,
              reset_time: quota.reset_time,
            },
          },
        });
      }
    }

    // Update quota usage
    await updateQuotaUsage(apiKeyId);

    next();
  } catch (error) {
    next(new AppError("Quota management failed", 500));
  }
};

/**
 * Update quota usage for API key
 */
async function updateQuotaUsage(apiKeyId: string): Promise<void> {
  try {
    const now = new Date();
    const resetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Update or create daily quota
    const { data: existingQuota, error } = await supabase
      .from("admin_api_quotas")
      .select("*")
      .eq("api_key_id", apiKeyId)
      .eq("quota_type", "requests_per_day")
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (existingQuota) {
      const expired = new Date(existingQuota.reset_time) <= now;
      await supabase
        .from("admin_api_quotas")
        .update({
          current_usage: expired ? 1 : existingQuota.current_usage + 1,
          reset_time: expired ? resetTime.toISOString() : existingQuota.reset_time,
        })
        .eq("id", existingQuota.id);
    } else {
      await supabase
        .from("admin_api_quotas")
        .insert({
          id: uuidv4(),
          api_key_id: apiKeyId,
          quota_type: "requests_per_day",
          limit_value: 10000, // Default daily limit
          current_usage: 1,
          reset_time: resetTime.toISOString(),
        });
    }
  } catch (error) {
    console.error("Failed to update quota usage:", error);
  }
}

/**
 * Rate Limit Status Middleware
 * Provides rate limit status information in response headers
 */
export const rateLimitStatusMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Add rate limit status to response
  res.set({
    "X-RateLimit-Policy": "admin-api-v1",
    "X-RateLimit-Version": "1.0",
  });

  next();
};
