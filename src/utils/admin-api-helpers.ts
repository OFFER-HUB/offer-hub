/**
 * Administrative API Utility Functions and Helpers
 * Provides utility functions for administrative API operations, validation, and formatting
 */

import { AdminApiKey, Webhook, IntegrationInstance, AdminApiMetrics, AdminSystemHealth } from "@/types/admin-integration.types";

// ============================================================================
// API KEY UTILITIES
// ============================================================================

/**
 * Generate a secure API key
 */
export function generateApiKey(): string {
  const prefix = "oh_admin_";
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const key = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${prefix}${key}`;
}

/**
 * Mask API key for display (show only first 8 and last 4 characters)
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 12) return "••••••••••••";
  return `${apiKey.substring(0, 8)}••••${apiKey.substring(apiKey.length - 4)}`;
}

/**
 * Validate API key format
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  const apiKeyRegex = /^oh_admin_[a-f0-9]{64}$/;
  return apiKeyRegex.test(apiKey);
}

/**
 * Check if API key is expired
 */
export function isApiKeyExpired(apiKey: AdminApiKey): boolean {
  if (!apiKey.expires_at) return false;
  return new Date(apiKey.expires_at) < new Date();
}

/**
 * Get API key status
 */
export function getApiKeyStatus(apiKey: AdminApiKey): "active" | "inactive" | "expired" {
  if (!apiKey.is_active) return "inactive";
  if (isApiKeyExpired(apiKey)) return "expired";
  return "active";
}

/**
 * Format API key permissions for display
 */
export function formatApiKeyPermissions(permissions: any[]): string[] {
  return permissions.map(permission => {
    const actions = permission.actions.join(", ");
    return `${permission.resource}: ${actions}`;
  });
}

// ============================================================================
// WEBHOOK UTILITIES
// ============================================================================

/**
 * Validate webhook URL
 */
export function validateWebhookUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const isLocal = ['localhost', '127.0.0.1', '::1'].includes(urlObj.hostname);
    if (isLocal) return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    return urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Generate webhook signature
 */
export async function generateWebhookSignature(payload: string, secret: string): Promise<string> {
  if (!(globalThis.crypto && 'subtle' in globalThis.crypto)) {
    throw new Error('Web Crypto API not available; cannot generate HMAC signature in this environment.');
  }
  
  // Convert strings to ArrayBuffer for Web Crypto API
  const encoder = new TextEncoder();
  const secretBuffer = new Uint8Array(encoder.encode(secret));
  const payloadBuffer = new Uint8Array(encoder.encode(payload));
  
  const key = await crypto.subtle.importKey(
    'raw',
    secretBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, payloadBuffer);
  const signatureArray = new Uint8Array(signature);
  
  return Array.from(signatureArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Check if webhook is healthy based on failure count
 */
export function isWebhookHealthy(webhook: Webhook): boolean {
  return webhook.is_active && webhook.failure_count < 5;
}

/**
 * Get webhook health status
 */
export function getWebhookHealthStatus(webhook: Webhook): "healthy" | "degraded" | "failed" {
  if (!webhook.is_active) return "failed";
  if (webhook.failure_count === 0) return "healthy";
  if (webhook.failure_count < 5) return "degraded";
  return "failed";
}

/**
 * Format webhook events for display
 */
export function formatWebhookEvents(events: any[]): string[] {
  return events.map(event => event.type);
}

/**
 * Calculate next retry delay based on retry policy
 */
export function calculateRetryDelay(
  attempt: number,
  retryPolicy: any
): number {
  const baseDelay = retryPolicy.retry_delay_ms || 1000;
  const multiplier = retryPolicy.backoff_multiplier || 2;
  const maxDelay = retryPolicy.max_delay_ms || 30000;
  
  const delay = baseDelay * Math.pow(multiplier, attempt - 1);
  return Math.min(delay, maxDelay);
}

// ============================================================================
// INTEGRATION UTILITIES
// ============================================================================

/**
 * Validate integration configuration
 */
export function validateIntegrationConfig(config: any, schema: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!schema) return { isValid: true, errors };
  
  Object.entries(schema).forEach(([key, fieldSchema]: [string, any]) => {
    const value = config[key];
    
    if (fieldSchema.required && (!value || value === "")) {
      errors.push(`${key} is required`);
    }
    
    if (value && fieldSchema.type === "number" && isNaN(Number(value))) {
      errors.push(`${key} must be a number`);
    }
    
    if (value && fieldSchema.type === "boolean" && typeof value !== "boolean") {
      errors.push(`${key} must be a boolean`);
    }
  });
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Encrypt sensitive credentials
 */
export function encryptCredentials(credentials: any): string {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('encryptCredentials must not be used in production. Perform encryption server-side.');
  }
  return btoa(JSON.stringify(credentials)); // dev-only placeholder
}

/**
 * Decrypt sensitive credentials
 */
export function decryptCredentials(encryptedCredentials: string): any {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('decryptCredentials must not be used in production. Perform decryption server-side.');
  }
  try {
    return JSON.parse(atob(encryptedCredentials));
  } catch {
    return {};
  }
}

/**
 * Get integration provider icon
 */
export function getIntegrationProviderIcon(type: string): string {
  const icons: Record<string, string> = {
    webhook: "zap",
    api: "database",
    sdk: "settings",
    plugin: "plug",
  };
  return icons[type] || "cloud";
}

/**
 * Get integration provider color
 */
export function getIntegrationProviderColor(type: string): string {
  const colors: Record<string, string> = {
    webhook: "blue",
    api: "green",
    sdk: "purple",
    plugin: "orange",
  };
  return colors[type] || "gray";
}

// ============================================================================
// METRICS AND ANALYTICS UTILITIES
// ============================================================================

/**
 * Format API metrics for display
 */
export function formatApiMetrics(metrics: AdminApiMetrics): {
  totalRequests: string;
  successRate: string;
  averageResponseTime: string;
  errorRate: string;
} {
  const successRate = metrics.total_requests > 0 
    ? ((metrics.successful_requests / metrics.total_requests) * 100).toFixed(1)
    : "0.0";
    
  const errorRate = metrics.total_requests > 0
    ? ((metrics.failed_requests / metrics.total_requests) * 100).toFixed(1)
    : "0.0";

  return {
    totalRequests: metrics.total_requests.toLocaleString(),
    successRate: `${successRate}%`,
    averageResponseTime: `${metrics.average_response_time_ms}ms`,
    errorRate: `${errorRate}%`,
  };
}

/**
 * Get system health status color
 */
export function getSystemHealthStatusColor(status: string): string {
  const colors: Record<string, string> = {
    healthy: "green",
    degraded: "yellow",
    critical: "red",
  };
  return colors[status] || "gray";
}

/**
 * Format system health metrics
 */
export function formatSystemHealthMetrics(health: AdminSystemHealth): {
  status: string;
  statusColor: string;
  components: Array<{ name: string; status: string; statusColor: string }>;
  metrics: Array<{ name: string; value: string; unit: string }>;
} {
  const components = Object.entries(health.components).map(([name, component]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    status: component.status,
    statusColor: getSystemHealthStatusColor(component.status),
  }));

  const metrics = [
    { name: "CPU Usage", value: health.metrics.cpu_usage.toFixed(1), unit: "%" },
    { name: "Memory Usage", value: health.metrics.memory_usage.toFixed(1), unit: "%" },
    { name: "Disk Usage", value: health.metrics.disk_usage.toFixed(1), unit: "%" },
    { name: "Active Connections", value: health.metrics.active_connections.toString(), unit: "" },
  ];

  return {
    status: health.status,
    statusColor: getSystemHealthStatusColor(health.status),
    components,
    metrics,
  };
}

// ============================================================================
// DATE AND TIME UTILITIES
// ============================================================================

/**
 * Format date for display
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return date.toLocaleString("en-US", { ...defaultOptions, ...options });
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(dateString);
}

/**
 * Check if date is recent (within last 24 hours)
 */
export function isRecentDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  return diffInHours < 24;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate JSON string
 */
export function validateJson(jsonString: string): { isValid: boolean; data?: any; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    return { isValid: true, data };
  } catch (error) {
    return { isValid: false, error: error instanceof Error ? error.message : "Invalid JSON" };
  }
}

/**
 * Sanitize input string
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/['"]/g, "") // Remove quotes
    .trim();
}

// ============================================================================
// RATE LIMITING UTILITIES
// ============================================================================

/**
 * Calculate rate limit usage percentage
 */
export function calculateRateLimitUsage(current: number, limit: number): number {
  if (!Number.isFinite(limit) || limit <= 0) return 100;
  return Math.min((current / limit) * 100, 100);
}

/**
 * Get rate limit status
 */
export function getRateLimitStatus(current: number, limit: number): "low" | "medium" | "high" | "exceeded" {
  const usage = calculateRateLimitUsage(current, limit);
  
  if (usage >= 100) return "exceeded";
  if (usage >= 80) return "high";
  if (usage >= 50) return "medium";
  return "low";
}

/**
 * Format rate limit for display
 */
export function formatRateLimit(current: number, limit: number): string {
  return `${current.toLocaleString()} / ${limit.toLocaleString()}`;
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Extract error message from API response
 */
export function extractErrorMessage(error: any): string {
  if (typeof error === "string") return error;
  if (error?.message) return error.message;
  if (error?.error?.message) return error.error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  return "An unknown error occurred";
}

/**
 * Get error severity level
 */
export function getErrorSeverity(error: any): "low" | "medium" | "high" | "critical" {
  const message = extractErrorMessage(error).toLowerCase();
  
  if (message.includes("critical") || message.includes("fatal")) return "critical";
  if (message.includes("error") || message.includes("failed")) return "high";
  if (message.includes("warning") || message.includes("caution")) return "medium";
  return "low";
}

/**
 * Format error for display
 */
export function formatError(error: any): {
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
} {
  return {
    message: extractErrorMessage(error),
    severity: getErrorSeverity(error),
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Export data as JSON
 */
export function exportAsJson(data: any, filename: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.warn('exportAsJson is only available in the browser.');
    return;
  }
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export data as CSV
 */
export function exportAsCsv(data: any[], filename: string): void {
  if (data.length === 0) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.warn('exportAsCsv is only available in the browser.');
    return;
  }

  const headers = Array.from(new Set(data.flatMap(row => Object.keys(row))));
  const escapeCell = (v: any) => String(v ?? '').replace(/"/g, '""');
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => `"${escapeCell(row[h])}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// ============================================================================
// NOTIFICATION UTILITIES
// ============================================================================

/**
 * Generate notification message for admin operations
 */
export function generateNotificationMessage(
  operation: string,
  resource: string,
  success: boolean
): string {
  const action = success ? "successfully" : "failed to";
  return `${operation} ${resource} ${action}`;
}

/**
 * Get notification type based on operation
 */
export function getNotificationType(operation: string): "info" | "success" | "warning" | "error" {
  const operationLower = operation.toLowerCase();
  
  if (operationLower.includes("create") || operationLower.includes("add")) return "success";
  if (operationLower.includes("update") || operationLower.includes("modify")) return "info";
  if (operationLower.includes("delete") || operationLower.includes("remove")) return "warning";
  if (operationLower.includes("error") || operationLower.includes("fail")) return "error";
  
  return "info";
}
