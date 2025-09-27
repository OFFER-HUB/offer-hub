import { useEffect, useState, useCallback, useRef } from 'react';

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  componentMounts: number;
  apiCallCount: number;
  apiCallDuration: number;
  lastUpdate: Date;
}

export interface PerformanceMonitoringOptions {
  enableMemoryTracking?: boolean;
  enableRenderTracking?: boolean;
  enableApiTracking?: boolean;
  reportInterval?: number; // in milliseconds
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export const usePerformanceMonitoring = (
  componentName: string,
  options: PerformanceMonitoringOptions = {}
) => {
  const {
    enableMemoryTracking = true,
    enableRenderTracking = true,
    enableApiTracking = true,
    reportInterval = 30000, // 30 seconds
    onMetricsUpdate,
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    componentMounts: 0,
    apiCallCount: 0,
    apiCallDuration: 0,
    lastUpdate: new Date(),
  });

  const renderStartTime = useRef<number>(0);
  const mountCount = useRef<number>(0);
  const apiCallCount = useRef<number>(0);
  const totalApiDuration = useRef<number>(0);
  const reportTimer = useRef<NodeJS.Timeout | null>(null);

  // Track component mount
  useEffect(() => {
    mountCount.current += 1;
    setMetrics(prev => ({
      ...prev,
      componentMounts: mountCount.current,
      lastUpdate: new Date(),
    }));
  }, []);

  // Track render time
  useEffect(() => {
    if (!enableRenderTracking) return;

    const startTime = performance.now();
    renderStartTime.current = startTime;

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setMetrics(prev => ({
        ...prev,
        renderTime,
        lastUpdate: new Date(),
      }));
    };
  });

  // Track memory usage
  useEffect(() => {
    if (!enableMemoryTracking || !('memory' in performance)) return;

    const updateMemoryUsage = () => {
      const memory = (performance as any).memory;
      if (memory) {
        const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
        
        setMetrics(prev => ({
          ...prev,
          memoryUsage,
          lastUpdate: new Date(),
        }));
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [enableMemoryTracking]);

  // Set up periodic reporting
  useEffect(() => {
    if (reportInterval > 0) {
      reportTimer.current = setInterval(() => {
        onMetricsUpdate?.(metrics);
      }, reportInterval);

      return () => {
        if (reportTimer.current) {
          clearInterval(reportTimer.current);
        }
      };
    }
  }, [metrics, reportInterval, onMetricsUpdate]);

  // Track API calls
  const trackApiCall = useCallback((duration: number) => {
    if (!enableApiTracking) return;

    apiCallCount.current += 1;
    totalApiDuration.current += duration;

    setMetrics(prev => ({
      ...prev,
      apiCallCount: apiCallCount.current,
      apiCallDuration: totalApiDuration.current,
      lastUpdate: new Date(),
    }));
  }, [enableApiTracking]);

  // Create a wrapped fetch function for API tracking
  const trackedFetch = useCallback(async (url: string, options?: RequestInit): Promise<Response> => {
    const startTime = performance.now();
    
    try {
      const response = await fetch(url, options);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      trackApiCall(duration);
      return response;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      trackApiCall(duration);
      throw error;
    }
  }, [trackApiCall]);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    const avgApiDuration = metrics.apiCallCount > 0 
      ? metrics.apiCallDuration / metrics.apiCallCount 
      : 0;

    return {
      ...metrics,
      averageApiCallDuration: avgApiDuration,
      memoryUsageMB: metrics.memoryUsage?.toFixed(2),
      renderTimeMS: metrics.renderTime.toFixed(2),
    };
  }, [metrics]);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    mountCount.current = 0;
    apiCallCount.current = 0;
    totalApiDuration.current = 0;
    
    setMetrics({
      renderTime: 0,
      memoryUsage: 0,
      componentMounts: 0,
      apiCallCount: 0,
      apiCallDuration: 0,
      lastUpdate: new Date(),
    });
  }, []);

  // Log performance warning if metrics exceed thresholds
  useEffect(() => {
    const warnings: string[] = [];

    if (metrics.renderTime > 100) {
      warnings.push(`Slow render time: ${metrics.renderTime.toFixed(2)}ms`);
    }

    if (metrics.memoryUsage && metrics.memoryUsage > 50) {
      warnings.push(`High memory usage: ${metrics.memoryUsage.toFixed(2)}MB`);
    }

    if (metrics.apiCallCount > 0) {
      const avgApiDuration = metrics.apiCallDuration / metrics.apiCallCount;
      if (avgApiDuration > 1000) {
        warnings.push(`Slow API calls: ${avgApiDuration.toFixed(2)}ms average`);
      }
    }

    if (warnings.length > 0) {
      console.warn(`Performance warnings for ${componentName}:`, warnings);
    }
  }, [metrics, componentName]);

  return {
    metrics,
    getPerformanceSummary,
    resetMetrics,
    trackApiCall,
    trackedFetch,
  };
};

/**
 * Hook for monitoring configuration-specific performance
 */
export const useConfigurationPerformanceMonitoring = () => {
  return usePerformanceMonitoring('ConfigurationManagement', {
    enableMemoryTracking: true,
    enableRenderTracking: true,
    enableApiTracking: true,
    reportInterval: 30000,
    onMetricsUpdate: (metrics) => {
      // Log performance metrics for configuration management
      console.log('Configuration Performance Metrics:', {
        renderTime: `${metrics.renderTime.toFixed(2)}ms`,
        memoryUsage: metrics.memoryUsage ? `${metrics.memoryUsage.toFixed(2)}MB` : 'N/A',
        componentMounts: metrics.componentMounts,
        apiCalls: metrics.apiCallCount,
        averageApiDuration: metrics.apiCallCount > 0 
          ? `${(metrics.apiCallDuration / metrics.apiCallCount).toFixed(2)}ms` 
          : 'N/A',
        lastUpdate: metrics.lastUpdate.toISOString(),
      });
    },
  });
};

/**
 * Hook for monitoring policy-specific performance
 */
export const usePolicyPerformanceMonitoring = () => {
  return usePerformanceMonitoring('PolicyManagement', {
    enableMemoryTracking: true,
    enableRenderTracking: true,
    enableApiTracking: true,
    reportInterval: 30000,
  });
};

/**
 * Hook for monitoring feature toggle-specific performance
 */
export const useFeatureTogglePerformanceMonitoring = () => {
  return usePerformanceMonitoring('FeatureToggleManagement', {
    enableMemoryTracking: true,
    enableRenderTracking: true,
    enableApiTracking: true,
    reportInterval: 30000,
  });
};
