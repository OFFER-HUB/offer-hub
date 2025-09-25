export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface IntegrationProvider {
  id: string;
  name: string;
  description?: string;
  category: 'project_management' | 'crm' | 'communication' | 'custom' | 'other';
  logoUrl?: string;
  websiteUrl?: string;
  supportsWebhooks: boolean;
  supportsDataSync: boolean;
}

export interface IntegrationConfigField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'secret' | 'select' | 'json' | 'url';
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  helpText?: string;
}

export interface IntegrationDefinition {
  providerId: string;
  version: string;
  authType: 'api_key' | 'oauth2' | 'webhook_only' | 'none';
  configSchema: IntegrationConfigField[];
  capabilities: Array<
    | 'create_dispute'
    | 'update_status'
    | 'sync_data'
    | 'webhook_events'
    | 'list_disputes'
    | 'mobile_ready'
  >;
}

export interface IntegrationInstance {
  id: string;
  providerId: string;
  name: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  config: Record<string, string | number | boolean | null>;
  metadata?: Record<string, unknown>;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  secret?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  events: DisputeEventType[];
}

export type DisputeEventType =
  | 'dispute.created'
  | 'dispute.updated'
  | 'dispute.resolved'
  | 'dispute.escalated'
  | 'evidence.added'
  | 'mediation.started'
  | 'arbitration.started';

export interface WebhookDeliveryAttempt {
  id: string;
  webhookId: string;
  eventType: DisputeEventType;
  payload: Record<string, unknown>;
  statusCode?: number;
  errorMessage?: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface RateLimitPolicy {
  requestsPerMinute: number;
  burst?: number;
  perApiKey?: boolean;
}

export interface IntegrationUsageMetrics {
  requests: number;
  errors: number;
  averageLatencyMs: number;
  last24h: {
    requests: number;
    errors: number;
  };
}

export interface CreateIntegrationInstanceDTO {
  providerId: string;
  name: string;
  config: Record<string, string | number | boolean | null>;
}

export interface UpdateIntegrationInstanceDTO {
  name?: string;
  enabled?: boolean;
  config?: Record<string, string | number | boolean | null>;
}

export interface CreateWebhookDTO {
  url: string;
  secret?: string;
  description?: string;
  events: DisputeEventType[];
}

export interface UpdateWebhookDTO extends Partial<CreateWebhookDTO> {
  isActive?: boolean;
}

export interface OutboundApiRequest {
  id: string;
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
}

export interface OutboundApiResponse<T = unknown> {
  status: number;
  headers: Record<string, string>;
  data: T;
  durationMs: number;
}

export interface MobileClientConfig {
  baseUrl: string;
  apiKey?: string;
  oauth?: {
    clientId: string;
    scopes: string[];
  };
}
