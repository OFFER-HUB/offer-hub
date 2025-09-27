import { useState, useEffect, useCallback } from 'react';
import { configurationService } from '@/services/configuration.service';
import { 
  SystemConfiguration, 
  ConfigurationFilters, 
  ValidationResult,
  UseConfigurationOptions,
  UseConfigurationReturn 
} from '@/types/configuration.types';

export function useSystemConfiguration(options: UseConfigurationOptions = {}): UseConfigurationReturn {
  const {
    environment = 'production',
    category,
    autoRefresh = true,
    refreshInterval = 30000,
    onError,
    onUpdate,
  } = options;

  const [configurations, setConfigurations] = useState<SystemConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadConfigurations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: ConfigurationFilters = {
        environment,
        ...(category && { category }),
      };

      const response = await configurationService.getConfigurations(filters, 1, 1000);
      setConfigurations(response.configurations);
      
      if (onUpdate) {
        onUpdate(response.configurations);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load configurations');
      setError(error);
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [environment, category, onError, onUpdate]);

  const updateConfiguration = useCallback(async (id: string, value: unknown) => {
    try {
      await configurationService.updateConfiguration(id, { value });
      await loadConfigurations();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update configuration');
      setError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [loadConfigurations, onError]);

  const createConfiguration = useCallback(async (config: Omit<SystemConfiguration, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => {
    try {
      await configurationService.createConfiguration(config);
      await loadConfigurations();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create configuration');
      setError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [loadConfigurations, onError]);

  const deleteConfiguration = useCallback(async (id: string) => {
    try {
      await configurationService.deleteConfiguration(id);
      await loadConfigurations();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete configuration');
      setError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [loadConfigurations, onError]);

  const validateConfiguration = useCallback(async (id: string, value: unknown): Promise<ValidationResult> => {
    try {
      return await configurationService.validateConfiguration(id, value);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to validate configuration');
      setError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [onError]);

  const refetch = useCallback(() => {
    return loadConfigurations();
  }, [loadConfigurations]);

  useEffect(() => {
    loadConfigurations();
  }, [loadConfigurations]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(loadConfigurations, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, loadConfigurations]);

  return {
    configurations,
    loading,
    error,
    refetch,
    updateConfiguration,
    createConfiguration,
    deleteConfiguration,
    validateConfiguration,
  };
}
