import {
  ApiResponse,
  CreateIntegrationInstanceDTO,
  CreateWebhookDTO,
  IntegrationDefinition,
  IntegrationInstance,
  IntegrationProvider,
  IntegrationUsageMetrics,
  RateLimitPolicy,
  UpdateIntegrationInstanceDTO,
  UpdateWebhookDTO,
  WebhookDeliveryAttempt,
  WebhookEndpoint,
} from '@/types/integration.types';
import {
  buildQuery,
  getErrorMessage,
  httpDelete,
  httpGet,
  httpPatch,
  httpPost,
  httpPut,
  retry,
} from '@/utils/api-helpers';

const BASE = '/integrations';

class IntegrationService {
  async listProviders(): Promise<IntegrationProvider[]> {
    return retry(() =>
      httpGet<ApiResponse<IntegrationProvider[]>>(`${BASE}/providers`).then(
        (r) => r.data!
      )
    );
  }

  async getProviderDefinition(
    providerId: string
  ): Promise<IntegrationDefinition> {
    return retry(() =>
      httpGet<ApiResponse<IntegrationDefinition>>(
        `${BASE}/providers/${providerId}`
      ).then((r) => r.data!)
    );
  }

  async listInstances(params?: {
    providerId?: string;
    enabled?: boolean;
    q?: string;
  }): Promise<IntegrationInstance[]> {
    const qs = buildQuery({
      providerId: params?.providerId,
      enabled: params?.enabled,
      q: params?.q,
    });
    return retry(() =>
      httpGet<ApiResponse<IntegrationInstance[]>>(
        `${BASE}/instances${qs}`
      ).then((r) => r.data!)
    );
  }

  async getInstance(id: string): Promise<IntegrationInstance> {
    return retry(() =>
      httpGet<ApiResponse<IntegrationInstance>>(`${BASE}/instances/${id}`).then(
        (r) => r.data!
      )
    );
  }

  async createInstance(
    dto: CreateIntegrationInstanceDTO
  ): Promise<IntegrationInstance> {
    return retry(() =>
      httpPost<ApiResponse<IntegrationInstance>>(`${BASE}/instances`, dto).then(
        (r) => r.data!
      )
    );
  }

  async updateInstance(
    id: string,
    dto: UpdateIntegrationInstanceDTO
  ): Promise<IntegrationInstance> {
    return retry(() =>
      httpPut<ApiResponse<IntegrationInstance>>(
        `${BASE}/instances/${id}`,
        dto
      ).then((r) => r.data!)
    );
  }

  async toggleInstance(
    id: string,
    enabled: boolean
  ): Promise<IntegrationInstance> {
    return this.updateInstance(id, { enabled });
  }

  async deleteInstance(id: string): Promise<{ success: boolean }> {
    return retry(() =>
      httpDelete<ApiResponse<{ success: boolean }>>(
        `${BASE}/instances/${id}`
      ).then((r) => r.data!)
    );
  }

  async getRateLimitPolicy(): Promise<RateLimitPolicy> {
    return retry(() =>
      httpGet<ApiResponse<RateLimitPolicy>>(`${BASE}/rate-limit`).then(
        (r) => r.data!
      )
    );
  }

  async setRateLimitPolicy(policy: RateLimitPolicy): Promise<RateLimitPolicy> {
    return retry(() =>
      httpPut<ApiResponse<RateLimitPolicy>>(`${BASE}/rate-limit`, policy).then(
        (r) => r.data!
      )
    );
  }

  async listWebhooks(): Promise<WebhookEndpoint[]> {
    return retry(() =>
      httpGet<ApiResponse<WebhookEndpoint[]>>(`${BASE}/webhooks`).then(
        (r) => r.data!
      )
    );
  }

  async createWebhook(dto: CreateWebhookDTO): Promise<WebhookEndpoint> {
    return retry(() =>
      httpPost<ApiResponse<WebhookEndpoint>>(`${BASE}/webhooks`, dto).then(
        (r) => r.data!
      )
    );
  }

  async updateWebhook(
    id: string,
    dto: UpdateWebhookDTO
  ): Promise<WebhookEndpoint> {
    return retry(() =>
      httpPatch<ApiResponse<WebhookEndpoint>>(
        `${BASE}/webhooks/${id}`,
        dto
      ).then((r) => r.data!)
    );
  }

  async deleteWebhook(id: string): Promise<{ success: boolean }> {
    return retry(() =>
      httpDelete<ApiResponse<{ success: boolean }>>(
        `${BASE}/webhooks/${id}`
      ).then((r) => r.data!)
    );
  }

  async listWebhookDeliveries(
    webhookId: string
  ): Promise<WebhookDeliveryAttempt[]> {
    return retry(() =>
      httpGet<ApiResponse<WebhookDeliveryAttempt[]>>(
        `${BASE}/webhooks/${webhookId}/deliveries`
      ).then((r) => r.data!)
    );
  }

  async resendDelivery(
    webhookId: string,
    deliveryId: string
  ): Promise<WebhookDeliveryAttempt> {
    return retry(() =>
      httpPost<ApiResponse<WebhookDeliveryAttempt>>(
        `${BASE}/webhooks/${webhookId}/deliveries/${deliveryId}/resend`
      ).then((r) => r.data!)
    );
  }

  async getUsageMetrics(params?: {
    instanceId?: string;
  }): Promise<IntegrationUsageMetrics> {
    const qs = buildQuery({ instanceId: params?.instanceId });
    return retry(() =>
      httpGet<ApiResponse<IntegrationUsageMetrics>>(
        `${BASE}/metrics${qs}`
      ).then((r) => r.data!)
    );
  }
}

export const integrationService = new IntegrationService();
