import { useState, useEffect, useCallback } from 'react';
import { featureToggleService } from '@/services/feature-toggle.service';
import { 
  FeatureToggle, 
  FeatureToggleFilters, 
  EvaluationContext,
  EvaluationResult,
  UseFeatureToggleOptions,
  UseFeatureToggleReturn 
} from '@/types/feature-toggle.types';

export function useFeatureToggles(options: UseFeatureToggleOptions = {}): UseFeatureToggleReturn {
  const {
    environment = 'production',
    category,
    autoRefresh = true,
    refreshInterval = 30000,
    onError,
    onUpdate,
  } = options;

  const [featureToggles, setFeatureToggles] = useState<FeatureToggle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadFeatureToggles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: FeatureToggleFilters = {
        environment,
        ...(category && { category }),
      };

      const response = await featureToggleService.getFeatureToggles(filters, 1, 1000);
      setFeatureToggles(response.featureToggles as FeatureToggle[]);
      
      if (onUpdate) {
        onUpdate(response.featureToggles as FeatureToggle[]);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load feature toggles');
      setError(error);
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [environment, category, onError, onUpdate]);

  const createFeatureToggle = useCallback(async (featureToggle: Omit<FeatureToggle, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => {
    try {
      await featureToggleService.createFeatureToggle(featureToggle);
      await loadFeatureToggles();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create feature toggle');
      setError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [loadFeatureToggles, onError]);

  const updateFeatureToggle = useCallback(async (id: string, updates: Partial<FeatureToggle>) => {
    try {
      await featureToggleService.updateFeatureToggle(id, updates);
      await loadFeatureToggles();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update feature toggle');
      setError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [loadFeatureToggles, onError]);

  const deleteFeatureToggle = useCallback(async (id: string) => {
    try {
      await featureToggleService.deleteFeatureToggle(id);
      await loadFeatureToggles();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete feature toggle');
      setError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [loadFeatureToggles, onError]);

  const activateFeatureToggle = useCallback(async (id: string) => {
    try {
      await featureToggleService.activateFeatureToggle(id);
      await loadFeatureToggles();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to activate feature toggle');
      setError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [loadFeatureToggles, onError]);

  const deactivateFeatureToggle = useCallback(async (id: string) => {
    try {
      await featureToggleService.deactivateFeatureToggle(id);
      await loadFeatureToggles();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to deactivate feature toggle');
      setError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [loadFeatureToggles, onError]);

  const evaluateFeatureToggle = useCallback(async (key: string, context: EvaluationContext): Promise<EvaluationResult> => {
    try {
      return await featureToggleService.evaluateFeatureToggle(key, context);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to evaluate feature toggle');
      setError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [onError]);

  const updateRolloutPercentage = useCallback(async (id: string, percentage: number) => {
    try {
      await featureToggleService.updateRolloutPercentage(id, percentage);
      await loadFeatureToggles();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update rollout percentage');
      setError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [loadFeatureToggles, onError]);

  const getFeatureToggleMetrics = useCallback(async (id: string, metric?: string, dateRange?: { from: Date; to: Date }) => {
    try {
      return await featureToggleService.getFeatureToggleAnalytics(id, metric, dateRange);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get feature toggle metrics');
      setError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [onError]);

  const refetch = useCallback(() => {
    return loadFeatureToggles();
  }, [loadFeatureToggles]);

  useEffect(() => {
    loadFeatureToggles();
  }, [loadFeatureToggles]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(loadFeatureToggles, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, loadFeatureToggles]);

  return {
    featureToggles,
    loading,
    error,
    refetch,
    createFeatureToggle,
    updateFeatureToggle,
    deleteFeatureToggle,
    activateFeatureToggle,
    deactivateFeatureToggle,
    evaluateFeatureToggle,
    updateRolloutPercentage,
    getFeatureToggleMetrics,
  };
}
