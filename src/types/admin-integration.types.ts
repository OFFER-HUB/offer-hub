// ============================================================================
// ADMIN API TYPES
// ============================================================================

export type UserRole = "freelancer" | "client" | "admin" | "moderator";

export interface AdminApiKey {
  id: string;
  name: string;
  key_hash: string;
  permissions: AdminPermission[];
  rate_limit: RateLimitConfig;
  is_active: boolean;
  created_by: string;
  created_at: string;
  last_used_at?: string;
  expires_at?: string;
}

export interface AdminPermission {
  resource: string; // 'users', 'projects', 'contracts', 'system', etc.
  actions: string[]; // ['read', 'write', 'delete', 'admin']
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains';
  value: any;
}

export interface RateLimitConfig {
  requests_per_minute: number;
  requests_per_hour: number;
  requests_per_day: number;
  burst_limit: number;
}

// ============================================================================
// WEBHOOK TYPES
// ============================================================================

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  is_active: boolean;
  retry_policy: RetryPolicy;
  created_by: string;
  created_at: string;
  last_triggered_at?: string;
  failure_count: number;
}

export interface WebhookEvent {
  type: string; // 'user.created', 'project.completed', 'dispute.opened', etc.
  filters?: WebhookEventFilter[];
}

export interface WebhookEventFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in';
  value: any;
}

export interface RetryPolicy {
  max_retries: number;
  retry_delay_ms: number;
  backoff_multiplier: number;
  max_delay_ms: number;
}

export interface WebhookPayload {
  id: string;
  event_type: string;
  timestamp: string;
  data: any;
  webhook_id: string;
  attempt: number;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  payload_id: string;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  response_code?: number;
  response_body?: string;
  error_message?: string;
  delivered_at?: string;
  created_at: string;
}

// ============================================================================
// INTEGRATION FRAMEWORK TYPES
// ============================================================================

export interface IntegrationProvider {
  id: string;
  name: string;
  type: 'webhook' | 'api' | 'sdk' | 'plugin';
  config_schema: any;
  auth_method: 'api_key' | 'oauth' | 'jwt' | 'basic';
  supported_events: string[];
  documentation_url: string;
  is_active: boolean;
}

export interface IntegrationInstance {
  id: string;
  provider_id: string;
  name: string;
  config: any;
  credentials: any;
  is_active: boolean;
  created_by: string;
  created_at: string;
  last_sync_at?: string;
}

export interface IntegrationSync {
  id: string;
  instance_id: string;
  sync_type: 'full' | 'incremental' | 'event_driven';
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  records_processed: number;
  records_synced: number;
  error_message?: string;
}

// ============================================================================
// ADMIN API REQUEST/RESPONSE TYPES
// ============================================================================

export interface AdminApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  headers: Record<string, string>;
  body?: any;
  query?: Record<string, any>;
  timestamp: string;
  api_key_id: string;
  ip_address: string;
  user_agent: string;
}

export interface AdminApiResponse {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: PaginationMeta;
    rate_limit?: RateLimitStatus;
    request_id: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface RateLimitStatus {
  limit: number;
  remaining: number;
  reset_time: string;
  retry_after?: number;
}

// ============================================================================
// ADMIN OPERATIONS TYPES
// ============================================================================

export interface AdminUserOperation {
  action: 'create' | 'update' | 'delete' | 'suspend' | 'activate' | 'change_role';
  user_id: string;
  data?: any;
  reason?: string;
  performed_by: string;
  timestamp: string;
}

export interface AdminProjectOperation {
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'pause';
  project_id: string;
  data?: any;
  reason?: string;
  performed_by: string;
  timestamp: string;
}

export interface AdminContractOperation {
  action: 'create' | 'update' | 'terminate' | 'resolve_dispute' | 'release_funds';
  contract_id: string;
  data?: any;
  reason?: string;
  performed_by: string;
  timestamp: string;
}

export interface AdminSystemOperation {
  action: 'config_update' | 'maintenance_mode' | 'backup' | 'restore' | 'migrate';
  system_component: string;
  data?: any;
  reason?: string;
  performed_by: string;
  timestamp: string;
}

// ============================================================================
// MONITORING AND ANALYTICS TYPES
// ============================================================================

export interface AdminApiMetrics {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  average_response_time_ms: number;
  requests_by_endpoint: Record<string, number>;
  requests_by_api_key: Record<string, number>;
  error_rates: Record<string, number>;
  time_range: {
    start: string;
    end: string;
  };
}

export interface AdminSystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  components: {
    database: ComponentHealth;
    redis: ComponentHealth;
    blockchain: ComponentHealth;
    ai_service: ComponentHealth;
    webhook_service: ComponentHealth;
  };
  metrics: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    active_connections: number;
  };
  last_updated: string;
}

export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'critical' | 'unknown';
  response_time_ms?: number;
  error_rate?: number;
  last_check: string;
  details?: any;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface AdminApiConfig {
  base_url: string;
  version: string;
  default_rate_limit: RateLimitConfig;
  webhook_timeout_ms: number;
  max_webhook_retries: number;
  api_key_expiry_days: number;
  audit_log_retention_days: number;
  enable_metrics: boolean;
  enable_webhooks: boolean;
  enable_integrations: boolean;
}

export interface AdminSecurityConfig {
  require_https: boolean;
  allowed_origins: string[];
  jwt_expiry_hours: number;
  api_key_length: number;
  password_policy: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_symbols: boolean;
  };
  brute_force_protection: {
    max_attempts: number;
    lockout_duration_minutes: number;
  };
}

// ============================================================================
// AUDIT AND LOGGING TYPES
// ============================================================================

export interface AdminAuditLog {
  id?: string;
  action: string;
  resource_type: string;
  resource_id: string;
  performed_by: string;
  performed_at: string;
  ip_address: string;
  user_agent: string;
  request_id: string;
  changes?: any;
  metadata?: any;
}

export interface AdminApiLog {
  id: string;
  api_key_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  error_message?: string;
}

// ============================================================================
// DTO TYPES FOR API REQUESTS
// ============================================================================

export interface CreateAdminApiKeyDTO {
  name: string;
  permissions: AdminPermission[];
  rate_limit?: RateLimitConfig;
  expires_at?: string;
}

export interface UpdateAdminApiKeyDTO {
  name?: string;
  permissions?: AdminPermission[];
  rate_limit?: RateLimitConfig;
  is_active?: boolean;
  expires_at?: string;
}

export interface CreateWebhookDTO {
  name: string;
  url: string;
  events: WebhookEvent[];
  retry_policy?: RetryPolicy;
}

export interface UpdateWebhookDTO {
  name?: string;
  url?: string;
  events?: WebhookEvent[];
  is_active?: boolean;
  retry_policy?: RetryPolicy;
}

export interface CreateIntegrationInstanceDTO {
  provider_id: string;
  name: string;
  config: any;
  credentials: any;
}

export interface UpdateIntegrationInstanceDTO {
  name?: string;
  config?: any;
  credentials?: any;
  is_active?: boolean;
}

// ============================================================================
// QUERY AND FILTER TYPES
// ============================================================================

export interface AdminApiKeyFilters {
  is_active?: boolean;
  created_by?: string;
  expires_before?: string;
  expires_after?: string;
  search?: string;
}

export interface WebhookFilters {
  is_active?: boolean;
  event_type?: string;
  created_by?: string;
  failure_count_min?: number;
  search?: string;
}

export interface IntegrationInstanceFilters {
  provider_id?: string;
  is_active?: boolean;
  created_by?: string;
  search?: string;
}

export interface AdminAuditLogFilters {
  action?: string;
  resource_type?: string;
  performed_by?: string;
  performed_after?: string;
  performed_before?: string;
  search?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type AdminOperation = AdminUserOperation | AdminProjectOperation | AdminContractOperation | AdminSystemOperation;

export type WebhookEventType = 
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.suspended'
  | 'user.activated'
  | 'project.created'
  | 'project.updated'
  | 'project.completed'
  | 'project.cancelled'
  | 'contract.created'
  | 'contract.updated'
  | 'contract.completed'
  | 'contract.terminated'
  | 'dispute.opened'
  | 'dispute.resolved'
  | 'payment.released'
  | 'payment.refunded'
  | 'system.maintenance'
  | 'system.error'
  | 'api.key_created'
  | 'api.key_revoked'
  | 'webhook.created'
  | 'webhook.updated'
  | 'webhook.failed';

export type AdminResourceType = 
  | 'users'
  | 'projects'
  | 'contracts'
  | 'services'
  | 'reviews'
  | 'disputes'
  | 'payments'
  | 'system'
  | 'api_keys'
  | 'webhooks'
  | 'integrations'
  | 'audit_logs';

export type AdminActionType = 
  | 'read'
  | 'write'
  | 'delete'
  | 'admin'
  | 'create'
  | 'update'
  | 'suspend'
  | 'activate'
  | 'approve'
  | 'reject'
  | 'terminate'
  | 'resolve';
