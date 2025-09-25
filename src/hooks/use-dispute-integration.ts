'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { integrationService } from '@/services/integration.service';
import type {
  CreateIntegrationInstanceDTO,
  CreateWebhookDTO,
  IntegrationDefinition,
  IntegrationInstance,
  IntegrationProvider,
  IntegrationUsageMetrics,
  UpdateIntegrationInstanceDTO,
  UpdateWebhookDTO,
  WebhookDeliveryAttempt,
  WebhookEndpoint,
} from '@/types/integration.types';
import { getErrorMessage } from '@/utils/api-helpers';

export interface UseDisputeIntegrationReturn {
  providers: IntegrationProvider[];
  instances: IntegrationInstance[];
  webhooks: WebhookEndpoint[];
  metrics: IntegrationUsageMetrics | null;
  loading: boolean;
  error: string | null;
  actions: {
    refresh: () => Promise<void>;
    loadMetrics: (instanceId?: string) => Promise<void>;
    createInstance: (
      dto: CreateIntegrationInstanceDTO
    ) => Promise<IntegrationInstance>;
    updateInstance: (
      id: string,
      dto: UpdateIntegrationInstanceDTO
    ) => Promise<IntegrationInstance>;
    deleteInstance: (id: string) => Promise<void>;
    toggleInstance: (
      id: string,
      enabled: boolean
    ) => Promise<IntegrationInstance>;
    createWebhook: (dto: CreateWebhookDTO) => Promise<WebhookEndpoint>;
    updateWebhook: (
      id: string,
      dto: UpdateWebhookDTO
    ) => Promise<WebhookEndpoint>;
    deleteWebhook: (id: string) => Promise<void>;
    listDeliveries: (webhookId: string) => Promise<WebhookDeliveryAttempt[]>;
    resendDelivery: (
      webhookId: string,
      deliveryId: string
    ) => Promise<WebhookDeliveryAttempt>;
  };
}

export function useDisputeIntegration(): UseDisputeIntegrationReturn {
  const [providers, setProviders] = useState<IntegrationProvider[]>([]);
  const [instances, setInstances] = useState<IntegrationInstance[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [metrics, setMetrics] = useState<IntegrationUsageMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [prov, inst, wh] = await Promise.all([
        integrationService.listProviders(),
        integrationService.listInstances(),
        integrationService.listWebhooks(),
      ]);
      setProviders(prov);
      setInstances(inst);
      setWebhooks(wh);
      setError(null);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const loadMetrics = useCallback(async (instanceId?: string) => {
    try {
      const data = await integrationService.getUsageMetrics({ instanceId });
      setMetrics(data);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    }
  }, []);

  const createInstance = useCallback(
    async (dto: CreateIntegrationInstanceDTO) => {
      try {
        const created = await integrationService.createInstance(dto);
        setInstances((prev) => [created, ...prev]);
        toast.success('Integration created');
        return created;
      } catch (err) {
        const msg = getErrorMessage(err);
        setError(msg);
        toast.error(msg);
        throw err;
      }
    },
    []
  );

  const updateInstance = useCallback(
    async (id: string, dto: UpdateIntegrationInstanceDTO) => {
      try {
        const updated = await integrationService.updateInstance(id, dto);
        setInstances((prev) => prev.map((i) => (i.id === id ? updated : i)));
        toast.success('Integration updated');
        return updated;
      } catch (err) {
        const msg = getErrorMessage(err);
        setError(msg);
        toast.error(msg);
        throw err;
      }
    },
    []
  );

  const deleteInstance = useCallback(async (id: string) => {
    try {
      await integrationService.deleteInstance(id);
      setInstances((prev) => prev.filter((i) => i.id !== id));
      toast.success('Integration deleted');
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
      throw err;
    }
  }, []);

  const toggleInstance = useCallback(
    async (id: string, enabled: boolean) => {
      const updated = await updateInstance(id, { enabled });
      return updated;
    },
    [updateInstance]
  );

  const createWebhook = useCallback(async (dto: CreateWebhookDTO) => {
    try {
      const created = await integrationService.createWebhook(dto);
      setWebhooks((prev) => [created, ...prev]);
      toast.success('Webhook created');
      return created;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
      throw err;
    }
  }, []);

  const updateWebhook = useCallback(
    async (id: string, dto: UpdateWebhookDTO) => {
      try {
        const updated = await integrationService.updateWebhook(id, dto);
        setWebhooks((prev) => prev.map((w) => (w.id === id ? updated : w)));
        toast.success('Webhook updated');
        return updated;
      } catch (err) {
        const msg = getErrorMessage(err);
        setError(msg);
        toast.error(msg);
        throw err;
      }
    },
    []
  );

  const deleteWebhook = useCallback(async (id: string) => {
    try {
      await integrationService.deleteWebhook(id);
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
      toast.success('Webhook deleted');
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
      throw err;
    }
  }, []);

  const listDeliveries = useCallback(async (webhookId: string) => {
    try {
      const deliveries = await integrationService.listWebhookDeliveries(
        webhookId
      );
      return deliveries;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
      throw err;
    }
  }, []);

  const resendDelivery = useCallback(
    async (webhookId: string, deliveryId: string) => {
      try {
        const delivery = await integrationService.resendDelivery(
          webhookId,
          deliveryId
        );
        toast.success('Delivery resent');
        return delivery;
      } catch (err) {
        const msg = getErrorMessage(err);
        setError(msg);
        toast.error(msg);
        throw err;
      }
    },
    []
  );

  const actions = useMemo(
    () => ({
      refresh: loadAll,
      loadMetrics,
      createInstance,
      updateInstance,
      deleteInstance,
      toggleInstance,
      createWebhook,
      updateWebhook,
      deleteWebhook,
      listDeliveries,
      resendDelivery,
    }),
    [
      loadAll,
      loadMetrics,
      createInstance,
      updateInstance,
      deleteInstance,
      toggleInstance,
      createWebhook,
      updateWebhook,
      deleteWebhook,
      listDeliveries,
      resendDelivery,
    ]
  );

  return {
    providers,
    instances,
    webhooks,
    metrics,
    loading,
    error,
    actions,
  };
}
