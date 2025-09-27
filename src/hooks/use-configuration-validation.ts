import { useState, useCallback } from 'react';
import { ConfigurationService } from '../services/configuration.service';
import { toast } from 'sonner';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface ConfigurationValidationHook {
  validateConfiguration: (id: string, value: unknown) => Promise<ValidationResult>;
  validateMultipleConfigurations: (configurations: Array<{ id: string; value: unknown }>) => Promise<Record<string, ValidationResult>>;
  loading: boolean;
  error: string | null;
}

export const useConfigurationValidation = (): ConfigurationValidationHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateConfiguration = useCallback(async (id: string, value: unknown): Promise<ValidationResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await ConfigurationService.validateConfiguration(id, value);
      return result;
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to validate configuration';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error validating configuration:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const validateMultipleConfigurations = useCallback(async (
    configurations: Array<{ id: string; value: unknown }>
  ): Promise<Record<string, ValidationResult>> => {
    setLoading(true);
    setError(null);
    
    try {
      const results: Record<string, ValidationResult> = {};
      
      // Validate configurations in parallel
      const validationPromises = configurations.map(async (config) => {
        try {
          const result = await ConfigurationService.validateConfiguration(config.id, config.value);
          results[config.id] = result;
        } catch (err) {
          results[config.id] = {
            isValid: false,
            errors: [(err as Error).message || 'Validation failed'],
            warnings: [],
          };
        }
      });
      
      await Promise.all(validationPromises);
      
      const hasErrors = Object.values(results).some(result => !result.isValid);
      if (hasErrors) {
        toast.warning('Some configurations failed validation.');
      } else {
        toast.success('All configurations passed validation.');
      }
      
      return results;
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to validate configurations';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error validating configurations:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    validateConfiguration,
    validateMultipleConfigurations,
    loading,
    error,
  };
};
