import { useState, useEffect, useCallback } from 'react';
import { policyService } from '@/services/policy.service';
import { 
  Policy, 
  PolicyFilters, 
  PolicyViolation,
  PolicyTest,
  TestData,
  TestResult,
  UsePolicyOptions,
  UsePolicyReturn 
} from '@/types/policy.types';

export function usePolicyManagement(options: UsePolicyOptions = {}): UsePolicyReturn {
  const {
    environment = 'production',
    category,
    autoRefresh = true,
    refreshInterval = 30000,
    onError,
    onUpdate,
  } = options;

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPolicies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: PolicyFilters = {
        environment,
        ...(category && { category }),
      };

      const response = await policyService.getPolicies(filters, 1, 1000);
      setPolicies(response.policies as Policy[]);
      
      if (onUpdate) {
        onUpdate(response.policies as Policy[]);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load policies');
      setError(error);
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [environment, category, onError, onUpdate]);

  const createPolicy = useCallback(async (policy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => {
    try {
      await policyService.createPolicy(policy);
      await loadPolicies();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create policy');
      setError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [loadPolicies, onError]);

  const updatePolicy = useCallback(async (id: string, updates: Partial<Policy>) => {
    try {
      await policyService.updatePolicy(id, updates);
      await loadPolicies();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update policy');
      setError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [loadPolicies, onError]);

  const deletePolicy = useCallback(async (id: string) => {
    try {
      await policyService.deletePolicy(id);
      await loadPolicies();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete policy');
      setError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [loadPolicies, onError]);

  const activatePolicy = useCallback(async (id: string) => {
    try {
      await policyService.activatePolicy(id);
      await loadPolicies();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to activate policy');
      setError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [loadPolicies, onError]);

  const deactivatePolicy = useCallback(async (id: string) => {
    try {
      await policyService.deactivatePolicy(id);
      await loadPolicies();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to deactivate policy');
      setError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [loadPolicies, onError]);

  const testPolicy = useCallback(async (id: string, testData: TestData): Promise<TestResult> => {
    try {
      return await policyService.testPolicy(id, testData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to test policy');
      setError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [onError]);

  const getPolicyViolations = useCallback(async (id: string, page = 1, limit = 20): Promise<PolicyViolation[]> => {
    try {
      const response = await policyService.getPolicyViolations(id, page, limit);
      return response.violations;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get policy violations');
      setError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [onError]);

  const refetch = useCallback(() => {
    return loadPolicies();
  }, [loadPolicies]);

  useEffect(() => {
    loadPolicies();
  }, [loadPolicies]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(loadPolicies, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, loadPolicies]);

  return {
    policies,
    loading,
    error,
    refetch,
    createPolicy,
    updatePolicy,
    deletePolicy,
    activatePolicy,
    deactivatePolicy,
    testPolicy,
    getPolicyViolations,
  };
}
