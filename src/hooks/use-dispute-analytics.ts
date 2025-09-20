import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DisputeAnalytics,
  PerformanceMetrics,
  TrendData,
  DisputePattern,
  PredictiveModel,
  AnalyticsFilter,
  AnalyticsState,
  ChartData,
  TimeSeriesData,
  CustomReport,
  AnalyticsDashboard,
  ExportOptions,
  ExportFormat
} from '@/types/analytics.types';
import { AnalyticsService } from '@/services/analytics.service';

export interface UseDisputeAnalyticsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealtime?: boolean;
  enableCache?: boolean;
}

export interface UseDisputeAnalyticsReturn {
  // Data
  disputes: DisputeAnalytics[];
  performanceMetrics: PerformanceMetrics | null;
  trendData: TrendData[];
  disputePatterns: DisputePattern[];
  predictiveModel: PredictiveModel | null;
  chartData: ChartData[];
  timeSeriesData: TimeSeriesData[];
  customReports: CustomReport[];
  dashboard: AnalyticsDashboard | null;

  // State
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Filters
  filters: AnalyticsFilter | null;
  setFilters: (filters: AnalyticsFilter) => void;
  clearFilters: () => void;

  // Actions
  refreshData: () => Promise<void>;
  exportData: (options: ExportOptions) => Promise<void>;
  createReport: (report: Omit<CustomReport, 'id' | 'createdAt' | 'lastGenerated'>) => Promise<void>;
  updateDashboard: (dashboard: AnalyticsDashboard) => Promise<void>;

  // Real-time
  enableRealtimeUpdates: () => void;
  disableRealtimeUpdates: () => void;
  isRealtimeEnabled: boolean;
}

export function useDisputeAnalytics(
  options: UseDisputeAnalyticsOptions = {}
): UseDisputeAnalyticsReturn {
  const {
    autoRefresh = true,
    refreshInterval = 300000, // 5 minutes
    enableRealtime = false,
    enableCache = true
  } = options;

  // State
  const [state, setState] = useState<AnalyticsState>({
    isLoading: false,
    error: undefined,
    lastUpdated: undefined,
    cache: enableCache ? new Map() : undefined
  });

  const [disputes, setDisputes] = useState<DisputeAnalytics[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [disputePatterns, setDisputePatterns] = useState<DisputePattern[]>([]);
  const [predictiveModel, setPredictiveModel] = useState<PredictiveModel | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [customReports, setCustomReports] = useState<CustomReport[]>([]);
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [filters, setFiltersState] = useState<AnalyticsFilter | null>(null);
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(enableRealtime);

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const realtimeUnsubscribeRef = useRef<(() => void) | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Error handling
  const handleError = useCallback((error: any, context: string) => {
    console.error(`Error in ${context}:`, error);
    setState(prev => ({
      ...prev,
      error: {
        code: 'ANALYTICS_ERROR',
        message: error.message || 'An unexpected error occurred',
        details: error,
        timestamp: new Date()
      },
      isLoading: false
    }));
  }, []);

  // Cache management
  const getCachedData = useCallback((key: string) => {
    if (!enableCache || !state.cache) return null;
    return state.cache.get(key) || null;
  }, [enableCache, state.cache]);

  const setCachedData = useCallback((key: string, data: any) => {
    if (!enableCache || !state.cache) return;
    state.cache.set(key, data);
  }, [enableCache, state.cache]);

  // Data fetching functions
  const fetchDisputes = useCallback(async (currentFilters?: AnalyticsFilter) => {
    try {
      const cacheKey = `disputes_${JSON.stringify(currentFilters)}`;
      const cached = getCachedData(cacheKey);

      if (cached) {
        setDisputes(cached);
        return cached;
      }

      const response = await AnalyticsService.getDisputeAnalytics(currentFilters);
      const disputesData = response.data;

      setDisputes(disputesData);
      setCachedData(cacheKey, disputesData);

      return disputesData;
    } catch (error) {
      handleError(error, 'fetchDisputes');
      return [];
    }
  }, [getCachedData, setCachedData, handleError]);

  const fetchPerformanceMetrics = useCallback(async (currentFilters?: AnalyticsFilter) => {
    try {
      const response = await AnalyticsService.getPerformanceMetrics(currentFilters);
      setPerformanceMetrics(response.data);
    } catch (error) {
      handleError(error, 'fetchPerformanceMetrics');
    }
  }, [handleError]);

  const fetchTrendData = useCallback(async (currentFilters?: AnalyticsFilter) => {
    try {
      const response = await AnalyticsService.getTrendData('count', 'daily', currentFilters);
      setTrendData(response.data);
    } catch (error) {
      handleError(error, 'fetchTrendData');
    }
  }, [handleError]);

  const fetchDisputePatterns = useCallback(async (currentFilters?: AnalyticsFilter) => {
    try {
      const response = await AnalyticsService.getDisputePatterns(currentFilters);
      setDisputePatterns(response.data);
    } catch (error) {
      handleError(error, 'fetchDisputePatterns');
    }
  }, [handleError]);

  const fetchPredictiveModel = useCallback(async (currentFilters?: AnalyticsFilter) => {
    try {
      const response = await AnalyticsService.getPredictiveModel(currentFilters);
      setPredictiveModel(response.data);
    } catch (error) {
      handleError(error, 'fetchPredictiveModel');
    }
  }, [handleError]);

  const fetchChartData = useCallback(async (type: 'status' | 'type' | 'category' | 'priority' = 'status', currentFilters?: AnalyticsFilter) => {
    try {
      const response = await AnalyticsService.getChartData(type, currentFilters);
      setChartData(response.data);
    } catch (error) {
      handleError(error, 'fetchChartData');
    }
  }, [handleError]);

  const fetchTimeSeriesData = useCallback(async (metric: string = 'count', currentFilters?: AnalyticsFilter) => {
    try {
      const response = await AnalyticsService.getTimeSeriesData(metric, currentFilters);
      setTimeSeriesData(response.data);
    } catch (error) {
      handleError(error, 'fetchTimeSeriesData');
    }
  }, [handleError]);

  const fetchCustomReports = useCallback(async () => {
    try {
      const response = await AnalyticsService.getCustomReports();
      setCustomReports(response.data);
    } catch (error) {
      handleError(error, 'fetchCustomReports');
    }
  }, [handleError]);

  const fetchDashboard = useCallback(async (dashboardId?: string) => {
    try {
      const response = await AnalyticsService.getDashboard(dashboardId);
      setDashboard(response.data);
    } catch (error) {
      handleError(error, 'fetchDashboard');
    }
  }, [handleError]);

  // Main refresh function
  const refreshData = useCallback(async () => {
    if (state.isLoading) return;

    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      await Promise.all([
        fetchDisputes(filters || undefined),
        fetchPerformanceMetrics(filters || undefined),
        fetchTrendData(filters || undefined),
        fetchDisputePatterns(filters || undefined),
        fetchPredictiveModel(filters || undefined),
        fetchChartData('status', filters || undefined),
        fetchTimeSeriesData('count', filters || undefined),
        fetchCustomReports(),
        fetchDashboard()
      ]);

      setState(prev => ({
        ...prev,
        isLoading: false,
        lastUpdated: new Date(),
        error: undefined
      }));
    } catch (error) {
      if (error.name !== 'AbortError') {
        handleError(error, 'refreshData');
      }
    }
  }, [
    state.isLoading,
    filters,
    fetchDisputes,
    fetchPerformanceMetrics,
    fetchTrendData,
    fetchDisputePatterns,
    fetchPredictiveModel,
    fetchChartData,
    fetchTimeSeriesData,
    fetchCustomReports,
    fetchDashboard,
    handleError
  ]);

  // Filter management
  const setFilters = useCallback((newFilters: AnalyticsFilter) => {
    setFiltersState(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(null);
  }, []);

  // Export functionality
  const exportData = useCallback(async (options: ExportOptions) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const blob = await AnalyticsService.exportData(options);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `dispute-analytics-${timestamp}`;

      await AnalyticsService.downloadExport(blob, filename, options.format);

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      handleError(error, 'exportData');
    }
  }, [handleError]);

  // Report management
  const createReport = useCallback(async (report: Omit<CustomReport, 'id' | 'createdAt' | 'lastGenerated'>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      await AnalyticsService.createCustomReport(report);
      await fetchCustomReports();

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      handleError(error, 'createReport');
    }
  }, [fetchCustomReports, handleError]);

  // Dashboard management
  const updateDashboard = useCallback(async (updatedDashboard: AnalyticsDashboard) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await AnalyticsService.updateDashboard(updatedDashboard);
      setDashboard(response.data);

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      handleError(error, 'updateDashboard');
    }
  }, [handleError]);

  // Real-time functionality
  const enableRealtimeUpdates = useCallback(() => {
    if (realtimeUnsubscribeRef.current) return;

    const unsubscribe = AnalyticsService.subscribeToRealtimeUpdates(
      (metrics: PerformanceMetrics) => {
        setPerformanceMetrics(metrics);
        setState(prev => ({ ...prev, lastUpdated: new Date() }));
      },
      30000 // 30 seconds
    );

    realtimeUnsubscribeRef.current = unsubscribe;
    setIsRealtimeEnabled(true);
  }, []);

  const disableRealtimeUpdates = useCallback(() => {
    if (realtimeUnsubscribeRef.current) {
      realtimeUnsubscribeRef.current();
      realtimeUnsubscribeRef.current = null;
    }
    setIsRealtimeEnabled(false);
  }, []);

  // Effects
  useEffect(() => {
    refreshData();
  }, [filters]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(refreshData, refreshInterval);
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, refreshData]);

  useEffect(() => {
    if (enableRealtime) {
      enableRealtimeUpdates();
    }

    return () => {
      disableRealtimeUpdates();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enableRealtime, enableRealtimeUpdates, disableRealtimeUpdates]);

  return {
    // Data
    disputes,
    performanceMetrics,
    trendData,
    disputePatterns,
    predictiveModel,
    chartData,
    timeSeriesData,
    customReports,
    dashboard,

    // State
    isLoading: state.isLoading,
    error: state.error?.message || null,
    lastUpdated: state.lastUpdated || null,

    // Filters
    filters,
    setFilters,
    clearFilters,

    // Actions
    refreshData,
    exportData,
    createReport,
    updateDashboard,

    // Real-time
    enableRealtimeUpdates,
    disableRealtimeUpdates,
    isRealtimeEnabled
  };
}

// Specialized hooks for specific use cases
export function usePerformanceMetrics(filters?: AnalyticsFilter) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AnalyticsService.getPerformanceMetrics(filters);
      setMetrics(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, isLoading, error, refresh: fetchMetrics };
}

export function useTrendAnalysis(
  metric: 'count' | 'resolution_time' | 'satisfaction',
  period: 'daily' | 'weekly' | 'monthly',
  filters?: AnalyticsFilter
) {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AnalyticsService.getTrendData(metric, period, filters);
      setTrends(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [metric, period, filters]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  return { trends, isLoading, error, refresh: fetchTrends };
}

export function useRealtimeMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = AnalyticsService.subscribeToRealtimeUpdates(
      (data: PerformanceMetrics) => {
        setMetrics(data);
        setIsConnected(true);
      },
      30000
    );

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, []);

  return { metrics, isConnected };
}