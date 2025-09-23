// Analytics hook

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  ReviewPerformanceMetrics,
  UserBehaviorAnalytics,
  ReputationTrends,
  CustomReport,
  DateRange,
  MetricCard,
  DashboardWidget,
  AnalyticsQuery,
  RealTimeUpdate,
  ExportConfig,
  ExportResult,
  PredictiveModel,
  ChartData,
  TimeSeriesDataPoint
} from '@/types/review-analytics.types';

import reviewAnalyticsService from '@/services/review-analytics.service';
import { 
  getDateRange, 
  validateDateRange, 
  debounce,
  prepareChartData,
  calculateTrendDirection 
} from '@/utils/analytics-helpers';

interface UseReviewAnalyticsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTime?: boolean;
  cacheTimeout?: number;
}

interface UseReviewAnalyticsState {
  performanceMetrics: ReviewPerformanceMetrics | null;
  behaviorAnalytics: UserBehaviorAnalytics | null;
  reputationTrends: ReputationTrends | null;
  realtimeMetrics: MetricCard[];
  customReports: CustomReport[];
  dashboardWidgets: DashboardWidget[];
  predictiveModels: PredictiveModel[];
  loading: {
    performance: boolean;
    behavior: boolean;
    reputation: boolean;
    realtime: boolean;
    reports: boolean;
    widgets: boolean;
    models: boolean;
  };
  errors: {
    performance: string | null;
    behavior: string | null;
    reputation: string | null;
    realtime: string | null;
    reports: string | null;
    widgets: string | null;
    models: string | null;
  };
}

export function useReviewAnalytics(options: UseReviewAnalyticsOptions = {}) {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    enableRealTime = false,
    cacheTimeout = 300000 // 5 minutes
  } = options;

  // State Management
  const [state, setState] = useState<UseReviewAnalyticsState>({
    performanceMetrics: null,
    behaviorAnalytics: null,
    reputationTrends: null,
    realtimeMetrics: [],
    customReports: [],
    dashboardWidgets: [],
    predictiveModels: [],
    loading: {
      performance: false,
      behavior: false,
      reputation: false,
      realtime: false,
      reports: false,
      widgets: false,
      models: false
    },
    errors: {
      performance: null,
      behavior: null,
      reputation: null,
      realtime: null,
      reports: null,
      widgets: null,
      models: null
    }
  });

  const [dateRange, setDateRange] = useState<DateRange>(() => getDateRange('30d'));
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);

  // Refs for cleanup and real-time connections
  const wsRef = useRef<WebSocket | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<Record<string, number>>({});

  // Helper function to update specific loading state
  const setLoading = useCallback((key: keyof UseReviewAnalyticsState['loading'], value: boolean) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, [key]: value }
    }));
  }, []);

  // Helper function to update specific error state
  const setError = useCallback((key: keyof UseReviewAnalyticsState['errors'], value: string | null) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [key]: value }
    }));
  }, []);

  // Check if data needs refresh based on cache timeout
  const needsRefresh = useCallback((key: string): boolean => {
    const lastFetch = lastFetchRef.current[key];
    return !lastFetch || (Date.now() - lastFetch) > cacheTimeout;
  }, [cacheTimeout]);

  // Performance Metrics
  const fetchPerformanceMetrics = useCallback(async (force = false) => {
    if (!force && !needsRefresh('performance')) return;

    setLoading('performance', true);
    setError('performance', null);

    try {
      const metrics = await reviewAnalyticsService.getReviewPerformanceMetrics(dateRange, filters);
      setState(prev => ({ ...prev, performanceMetrics: metrics }));
      lastFetchRef.current.performance = Date.now();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch performance metrics';
      setError('performance', errorMessage);
      console.error('Error fetching performance metrics:', error);
    } finally {
      setLoading('performance', false);
    }
  }, [dateRange, filters, needsRefresh, setLoading, setError]);

  // Behavior Analytics
  const fetchBehaviorAnalytics = useCallback(async (force = false) => {
    if (!force && !needsRefresh('behavior')) return;

    setLoading('behavior', true);
    setError('behavior', null);

    try {
      const analytics = await reviewAnalyticsService.getUserBehaviorAnalytics(
        dateRange,
        selectedSegments[0] // Use first selected segment
      );
      setState(prev => ({ ...prev, behaviorAnalytics: analytics }));
      lastFetchRef.current.behavior = Date.now();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch behavior analytics';
      setError('behavior', errorMessage);
      console.error('Error fetching behavior analytics:', error);
    } finally {
      setLoading('behavior', false);
    }
  }, [dateRange, selectedSegments, needsRefresh, setLoading, setError]);

  // Reputation Trends
  const fetchReputationTrends = useCallback(async (force = false) => {
    if (!force && !needsRefresh('reputation')) return;

    setLoading('reputation', true);
    setError('reputation', null);

    try {
      const trends = await reviewAnalyticsService.getReputationTrends(dateRange, selectedSegments);
      setState(prev => ({ ...prev, reputationTrends: trends }));
      lastFetchRef.current.reputation = Date.now();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reputation trends';
      setError('reputation', errorMessage);
      console.error('Error fetching reputation trends:', error);
    } finally {
      setLoading('reputation', false);
    }
  }, [dateRange, selectedSegments, needsRefresh, setLoading, setError]);

  // Real-time Metrics
  const fetchRealtimeMetrics = useCallback(async () => {
    setLoading('realtime', true);
    setError('realtime', null);

    try {
      const metrics = await reviewAnalyticsService.getRealtimeMetrics();
      setState(prev => ({ ...prev, realtimeMetrics: metrics }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch realtime metrics';
      setError('realtime', errorMessage);
      console.error('Error fetching realtime metrics:', error);
    } finally {
      setLoading('realtime', false);
    }
  }, [setLoading, setError]);

  // Custom Reports
  const fetchCustomReports = useCallback(async () => {
    setLoading('reports', true);
    setError('reports', null);

    try {
      const reports = await reviewAnalyticsService.getCustomReports();
      setState(prev => ({ ...prev, customReports: reports }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch custom reports';
      setError('reports', errorMessage);
      console.error('Error fetching custom reports:', error);
    } finally {
      setLoading('reports', false);
    }
  }, [setLoading, setError]);

  // Dashboard Widgets
  const fetchDashboardWidgets = useCallback(async (dashboardId: string) => {
    setLoading('widgets', true);
    setError('widgets', null);

    try {
      const widgets = await reviewAnalyticsService.getDashboardWidgets(dashboardId);
      setState(prev => ({ ...prev, dashboardWidgets: widgets }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard widgets';
      setError('widgets', errorMessage);
      console.error('Error fetching dashboard widgets:', error);
    } finally {
      setLoading('widgets', false);
    }
  }, [setLoading, setError]);

  // Predictive Models
  const fetchPredictiveModels = useCallback(async () => {
    setLoading('models', true);
    setError('models', null);

    try {
      const models = await reviewAnalyticsService.getPredictiveModels();
      setState(prev => ({ ...prev, predictiveModels: models }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch predictive models';
      setError('models', errorMessage);
      console.error('Error fetching predictive models:', error);
    } finally {
      setLoading('models', false);
    }
  }, [setLoading, setError]);

  // Fetch All Data
  const fetchAllData = useCallback(async (force = false) => {
    await Promise.all([
      fetchPerformanceMetrics(force),
      fetchBehaviorAnalytics(force),
      fetchReputationTrends(force),
      fetchRealtimeMetrics(),
      fetchCustomReports(),
      fetchPredictiveModels()
    ]);
  }, [
    fetchPerformanceMetrics,
    fetchBehaviorAnalytics,
    fetchReputationTrends,
    fetchRealtimeMetrics,
    fetchCustomReports,
    fetchPredictiveModels
  ]);

  // Debounced refresh function
  const debouncedRefresh = useMemo(
    () => debounce(() => fetchAllData(true), 500),
    [fetchAllData]
  );

  // Report Management
  const createReport = useCallback(async (report: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newReport = await reviewAnalyticsService.createCustomReport(report);
      setState(prev => ({
        ...prev,
        customReports: [...prev.customReports, newReport]
      }));
      return newReport;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }, []);

  const generateReport = useCallback(async (reportId: string) => {
    try {
      return await reviewAnalyticsService.generateReport(reportId);
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }, []);

  // Data Export
  const exportData = useCallback(async (config: ExportConfig, data: any[]): Promise<ExportResult> => {
    try {
      return await reviewAnalyticsService.exportData(config, data);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }, []);

  // Advanced Query
  const executeQuery = useCallback(async (query: AnalyticsQuery) => {
    try {
      return await reviewAnalyticsService.executeQuery(query);
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }, []);

  // Predictive Analytics
  const getPredictions = useCallback(async (modelId: string, entityId: string) => {
    try {
      return await reviewAnalyticsService.getPredictions(modelId, entityId);
    } catch (error) {
      console.error('Error getting predictions:', error);
      throw error;
    }
  }, []);

  // Date Range Management
  const updateDateRange = useCallback((newDateRange: DateRange) => {
    if (validateDateRange(newDateRange)) {
      setDateRange(newDateRange);
    } else {
      console.error('Invalid date range provided');
    }
  }, []);

  const setDateRangePeriod = useCallback((period: '7d' | '30d' | '90d' | '1y') => {
    const newDateRange = getDateRange(period);
    setDateRange(newDateRange);
  }, []);

  // Filter Management
  const updateFilters = useCallback((newFilters: Record<string, any>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Real-time Updates
  useEffect(() => {
    if (!enableRealTime) return;

    wsRef.current = reviewAnalyticsService.connectRealTimeUpdates((update: RealTimeUpdate) => {
      switch (update.type) {
        case 'metric-update':
          debouncedRefresh();
          break;
        case 'new-review':
          fetchRealtimeMetrics();
          break;
        default:
          break;
      }
    });

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [enableRealTime, debouncedRefresh, fetchRealtimeMetrics]);

  // Auto Refresh
  useEffect(() => {
    if (!autoRefresh) return;

    refreshIntervalRef.current = setInterval(() => {
      fetchAllData(true);
    }, refreshInterval);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, fetchAllData]);

  // Initial Data Fetch
  useEffect(() => {
    fetchAllData();
  }, [dateRange, filters, selectedSegments]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      reviewAnalyticsService.debouncedClearCache();
    };
  }, []);

  // Computed Values
  const hasData = useMemo(() => {
    return Boolean(
      state.performanceMetrics ||
      state.behaviorAnalytics ||
      state.reputationTrends ||
      state.realtimeMetrics.length > 0
    );
  }, [state]);

  const isLoading = useMemo(() => {
    return Object.values(state.loading).some(loading => loading);
  }, [state.loading]);

  const hasErrors = useMemo(() => {
    return Object.values(state.errors).some(error => error !== null);
  }, [state.errors]);

  // Chart data - keeping it simple for now
  const chartData = useMemo(() => {
    if (!state.performanceMetrics) return null;

    return {
      reviewsOverTime: prepareChartData(
        state.performanceMetrics.reviewsOverTime,
        'Reviews Over Time',
        '#3b82f6'
      ),
      ratingDistribution: state.performanceMetrics.ratingDistribution
    };
  }, [state.performanceMetrics]);

  return {
    // Core business data
    ...state,
    dateRange,
    filters,
    selectedSegments,
    
    // Status indicators
    hasData,
    isLoading,
    hasErrors,
    chartData,
    
    // Business operations
    fetchAllData,
    fetchPerformanceMetrics,
    fetchBehaviorAnalytics,
    fetchReputationTrends,
    fetchRealtimeMetrics,
    fetchCustomReports,
    fetchDashboardWidgets,
    fetchPredictiveModels,
    
    // Date management
    updateDateRange,
    setDateRangePeriod,
    
    // Filtering
    updateFilters,
    clearFilters,
    setSelectedSegments,
    
    // Business reports
    createReport,
    generateReport,
    
    // Data export
    exportData,
    
    // Advanced
    executeQuery,
    getPredictions,
    
    // Utility
    refresh: () => fetchAllData(true),
    clearCache: reviewAnalyticsService.clearCache
  };
}