import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ApplicationAnalytics,
  ApplicationPerformanceMetrics,
  ApplicationTrends,
  UserBehaviorPattern,
  PredictiveAnalytics,
  ApplicationReport,
  ApplicationDashboard,
  ApplicationAnalyticsFilter,
  ExportOptions,
  ChartData,
  TimeSeriesData,
  AnalyticsState,
  ComplianceReport,
  MobileAnalytics,
  SecurityAnalytics,
  ExportFormat
} from '@/types/application-analytics.types';
import { ApplicationAnalyticsService } from '@/services/application-analytics.service';

interface UseApplicationAnalyticsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealtime?: boolean;
  cacheEnabled?: boolean;
}

interface UseApplicationAnalyticsReturn {
  // Data
  applications: ApplicationAnalytics[];
  performanceMetrics: ApplicationPerformanceMetrics | null;
  trends: ApplicationTrends[];
  userPatterns: UserBehaviorPattern[];
  predictiveAnalytics: PredictiveAnalytics | null;
  chartData: ChartData[];
  timeSeriesData: TimeSeriesData[];
  reports: ApplicationReport[];
  dashboards: ApplicationDashboard[];
  mobileAnalytics: MobileAnalytics[];
  securityAnalytics: SecurityAnalytics | null;
  insights: string[];

  // State
  loading: AnalyticsState;
  error: string | null;

  // Actions
  fetchApplications: (filters?: ApplicationAnalyticsFilter) => Promise<void>;
  fetchPerformanceMetrics: (filters?: ApplicationAnalyticsFilter) => Promise<void>;
  fetchTrends: (period: 'daily' | 'weekly' | 'monthly', metric: string, filters?: ApplicationAnalyticsFilter) => Promise<void>;
  fetchUserPatterns: (filters?: ApplicationAnalyticsFilter) => Promise<void>;
  fetchPredictiveAnalytics: (filters?: ApplicationAnalyticsFilter) => Promise<void>;
  fetchChartData: (type: string, filters?: ApplicationAnalyticsFilter) => Promise<void>;
  fetchTimeSeriesData: (metric: string, filters?: ApplicationAnalyticsFilter) => Promise<void>;
  fetchReports: (userId?: string) => Promise<void>;
  fetchDashboards: () => Promise<void>;
  fetchMobileAnalytics: (filters?: ApplicationAnalyticsFilter) => Promise<void>;
  fetchSecurityAnalytics: (filters?: ApplicationAnalyticsFilter) => Promise<void>;
  fetchInsights: (filters?: ApplicationAnalyticsFilter) => Promise<void>;

  // Report Management
  createReport: (report: Omit<ApplicationReport, 'id' | 'createdAt' | 'lastGenerated'>) => Promise<ApplicationReport>;
  updateReport: (reportId: string, updates: Partial<ApplicationReport>) => Promise<ApplicationReport>;
  deleteReport: (reportId: string) => Promise<void>;
  generateReport: (reportId: string) => Promise<any>;

  // Dashboard Management
  createDashboard: (dashboard: Omit<ApplicationDashboard, 'id' | 'lastUpdated'>) => Promise<ApplicationDashboard>;
  updateDashboard: (dashboard: ApplicationDashboard) => Promise<ApplicationDashboard>;
  deleteDashboard: (dashboardId: string) => Promise<void>;

  // Export Functions
  exportData: (options: ExportOptions) => Promise<void>;

  // Utility Functions
  applyFilters: (filters: ApplicationAnalyticsFilter) => void;
  clearFilters: () => void;
  refreshAllData: () => Promise<void>;
  subscribeToRealtime: (topic: string, callback: (data: any) => void) => () => void;

  // Current filters
  currentFilters: ApplicationAnalyticsFilter | null;
}

export const useApplicationAnalytics = (
  options: UseApplicationAnalyticsOptions = {}
): UseApplicationAnalyticsReturn => {
  const {
    autoRefresh = false,
    refreshInterval = 30000,
    enableRealtime = false,
    cacheEnabled = true
  } = options;

  // State
  const [applications, setApplications] = useState<ApplicationAnalytics[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<ApplicationPerformanceMetrics | null>(null);
  const [trends, setTrends] = useState<ApplicationTrends[]>([]);
  const [userPatterns, setUserPatterns] = useState<UserBehaviorPattern[]>([]);
  const [predictiveAnalytics, setPredictiveAnalytics] = useState<PredictiveAnalytics | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [reports, setReports] = useState<ApplicationReport[]>([]);
  const [dashboards, setDashboards] = useState<ApplicationDashboard[]>([]);
  const [mobileAnalytics, setMobileAnalytics] = useState<MobileAnalytics[]>([]);
  const [securityAnalytics, setSecurityAnalytics] = useState<SecurityAnalytics | null>(null);
  const [insights, setInsights] = useState<string[]>([]);

  const [loading, setLoading] = useState<AnalyticsState>({
    isLoading: false,
    cache: new Map()
  });
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<ApplicationAnalyticsFilter | null>(null);

  // Memoized error handler
  const handleError = useCallback((error: any, operation: string) => {
    console.error(`Error in ${operation}:`, error);
    setError(error instanceof Error ? error.message : `Failed to ${operation}`);
    setLoading(prev => ({ ...prev, isLoading: false }));
  }, []);

  // Memoized loading state updater
  const updateLoadingState = useCallback((isLoading: boolean) => {
    setLoading(prev => ({
      ...prev,
      isLoading,
      lastUpdated: isLoading ? undefined : new Date()
    }));
  }, []);

  // Data fetching functions
  const fetchApplications = useCallback(async (filters?: ApplicationAnalyticsFilter) => {
    try {
      updateLoadingState(true);
      setError(null);

      if (filters) {
        ApplicationAnalyticsService.validateFilters(filters);
        setCurrentFilters(filters);
      }

      const response = await ApplicationAnalyticsService.getApplicationAnalytics(filters);
      setApplications(response.data);
    } catch (err) {
      handleError(err, 'fetch applications');
    } finally {
      updateLoadingState(false);
    }
  }, [handleError, updateLoadingState]);

  const fetchPerformanceMetrics = useCallback(async (filters?: ApplicationAnalyticsFilter) => {
    try {
      updateLoadingState(true);
      setError(null);

      const response = await ApplicationAnalyticsService.getPerformanceMetrics(filters);
      setPerformanceMetrics(response.data);
    } catch (err) {
      handleError(err, 'fetch performance metrics');
    } finally {
      updateLoadingState(false);
    }
  }, [handleError, updateLoadingState]);

  const fetchTrends = useCallback(async (
    period: 'daily' | 'weekly' | 'monthly',
    metric: string,
    filters?: ApplicationAnalyticsFilter
  ) => {
    try {
      updateLoadingState(true);
      setError(null);

      const response = await ApplicationAnalyticsService.getApplicationTrends(
        period,
        metric as 'count' | 'success_rate' | 'average_value',
        filters
      );
      setTrends(response.data);
    } catch (err) {
      handleError(err, 'fetch trends');
    } finally {
      updateLoadingState(false);
    }
  }, [handleError, updateLoadingState]);

  const fetchUserPatterns = useCallback(async (filters?: ApplicationAnalyticsFilter) => {
    try {
      updateLoadingState(true);
      setError(null);

      const response = await ApplicationAnalyticsService.getUserBehaviorPatterns(filters);
      setUserPatterns(response.data);
    } catch (err) {
      handleError(err, 'fetch user patterns');
    } finally {
      updateLoadingState(false);
    }
  }, [handleError, updateLoadingState]);

  const fetchPredictiveAnalytics = useCallback(async (filters?: ApplicationAnalyticsFilter) => {
    try {
      updateLoadingState(true);
      setError(null);

      const response = await ApplicationAnalyticsService.getPredictiveAnalytics(filters);
      setPredictiveAnalytics(response.data);
    } catch (err) {
      handleError(err, 'fetch predictive analytics');
    } finally {
      updateLoadingState(false);
    }
  }, [handleError, updateLoadingState]);

  const fetchChartData = useCallback(async (type: string, filters?: ApplicationAnalyticsFilter) => {
    try {
      updateLoadingState(true);
      setError(null);

      const response = await ApplicationAnalyticsService.getChartData(
        type as 'status' | 'source' | 'projectType' | 'skills',
        filters
      );
      setChartData(response.data);
    } catch (err) {
      handleError(err, 'fetch chart data');
    } finally {
      updateLoadingState(false);
    }
  }, [handleError, updateLoadingState]);

  const fetchTimeSeriesData = useCallback(async (metric: string, filters?: ApplicationAnalyticsFilter) => {
    try {
      updateLoadingState(true);
      setError(null);

      const response = await ApplicationAnalyticsService.getTimeSeriesData(metric, filters);
      setTimeSeriesData(response.data);
    } catch (err) {
      handleError(err, 'fetch time series data');
    } finally {
      updateLoadingState(false);
    }
  }, [handleError, updateLoadingState]);

  const fetchReports = useCallback(async (userId?: string) => {
    try {
      updateLoadingState(true);
      setError(null);

      const response = await ApplicationAnalyticsService.getApplicationReports(userId);
      setReports(response.data);
    } catch (err) {
      handleError(err, 'fetch reports');
    } finally {
      updateLoadingState(false);
    }
  }, [handleError, updateLoadingState]);

  const fetchDashboards = useCallback(async () => {
    try {
      updateLoadingState(true);
      setError(null);

      const response = await ApplicationAnalyticsService.getDashboard();
      setDashboards([response.data]);
    } catch (err) {
      handleError(err, 'fetch dashboards');
    } finally {
      updateLoadingState(false);
    }
  }, [handleError, updateLoadingState]);

  const fetchMobileAnalytics = useCallback(async (filters?: ApplicationAnalyticsFilter) => {
    try {
      updateLoadingState(true);
      setError(null);

      const response = await ApplicationAnalyticsService.getMobileAnalytics(filters);
      setMobileAnalytics(response.data);
    } catch (err) {
      handleError(err, 'fetch mobile analytics');
    } finally {
      updateLoadingState(false);
    }
  }, [handleError, updateLoadingState]);

  const fetchSecurityAnalytics = useCallback(async (filters?: ApplicationAnalyticsFilter) => {
    try {
      updateLoadingState(true);
      setError(null);

      const response = await ApplicationAnalyticsService.getSecurityAnalytics(filters);
      setSecurityAnalytics(response.data);
    } catch (err) {
      handleError(err, 'fetch security analytics');
    } finally {
      updateLoadingState(false);
    }
  }, [handleError, updateLoadingState]);

  const fetchInsights = useCallback(async (filters?: ApplicationAnalyticsFilter) => {
    try {
      updateLoadingState(true);
      setError(null);

      const response = await ApplicationAnalyticsService.getAnalyticsInsights(filters);
      setInsights(response.data);
    } catch (err) {
      handleError(err, 'fetch insights');
    } finally {
      updateLoadingState(false);
    }
  }, [handleError, updateLoadingState]);

  // Report management functions
  const createReport = useCallback(async (
    report: Omit<ApplicationReport, 'id' | 'createdAt' | 'lastGenerated'>
  ): Promise<ApplicationReport> => {
    try {
      updateLoadingState(true);
      setError(null);

      const response = await ApplicationAnalyticsService.createApplicationReport(report);
      setReports(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      handleError(err, 'create report');
      throw err;
    } finally {
      updateLoadingState(false);
    }
  }, [handleError, updateLoadingState]);

  const updateReport = useCallback(async (
    reportId: string,
    updates: Partial<ApplicationReport>
  ): Promise<ApplicationReport> => {
    try {
      updateLoadingState(true);
      setError(null);

      const response = await ApplicationAnalyticsService.updateReport(reportId, updates);
      setReports(prev => prev.map(report =>
        report.id === reportId ? response.data : report
      ));
      return response.data;
    } catch (err) {
      handleError(err, 'update report');
      throw err;
    } finally {
      updateLoadingState(false);
    }
  }, [handleError, updateLoadingState]);

  const deleteReport = useCallback(async (reportId: string): Promise<void> => {
    try {
      updateLoadingState(true);
      setError(null);

      await ApplicationAnalyticsService.deleteReport(reportId);
      setReports(prev => prev.filter(report => report.id !== reportId));
    } catch (err) {
      handleError(err, 'delete report');
      throw err;
    } finally {
      updateLoadingState(false);
    }
  }, [handleError, updateLoadingState]);

  const generateReport = useCallback(async (reportId: string): Promise<any> => {
    try {
      updateLoadingState(true);
      setError(null);

      const response = await ApplicationAnalyticsService.generateReport(reportId);

      // Update the report's lastGenerated timestamp
      setReports(prev => prev.map(report =>
        report.id === reportId
          ? { ...report, lastGenerated: new Date() }
          : report
      ));

      return response.data;
    } catch (err) {
      handleError(err, 'generate report');
      throw err;
    } finally {
      updateLoadingState(false);
    }
  }, [handleError, updateLoadingState]);

  // Dashboard management functions
  const createDashboard = useCallback(async (
    dashboard: Omit<ApplicationDashboard, 'id' | 'lastUpdated'>
  ): Promise<ApplicationDashboard> => {
    try {
      updateLoadingState(true);
      setError(null);

      const response = await ApplicationAnalyticsService.createDashboard(dashboard);
      setDashboards(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      handleError(err, 'create dashboard');
      throw err;
    } finally {
      updateLoadingState(false);
    }
  }, [handleError, updateLoadingState]);

  const updateDashboard = useCallback(async (
    dashboard: ApplicationDashboard
  ): Promise<ApplicationDashboard> => {
    try {
      updateLoadingState(true);
      setError(null);

      const response = await ApplicationAnalyticsService.updateDashboard(dashboard);
      setDashboards(prev => prev.map(d =>
        d.id === dashboard.id ? response.data : d
      ));
      return response.data;
    } catch (err) {
      handleError(err, 'update dashboard');
      throw err;
    } finally {
      updateLoadingState(false);
    }
  }, [handleError, updateLoadingState]);

  const deleteDashboard = useCallback(async (dashboardId: string): Promise<void> => {
    try {
      updateLoadingState(true);
      setError(null);

      await ApplicationAnalyticsService.deleteDashboard(dashboardId);
      setDashboards(prev => prev.filter(d => d.id !== dashboardId));
    } catch (err) {
      handleError(err, 'delete dashboard');
      throw err;
    } finally {
      updateLoadingState(false);
    }
  }, [handleError, updateLoadingState]);

  // Export function
  const exportData = useCallback(async (options: ExportOptions): Promise<void> => {
    try {
      updateLoadingState(true);
      setError(null);

      const blob = await ApplicationAnalyticsService.exportData(options);
      await ApplicationAnalyticsService.downloadExport(
        blob,
        'application_analytics_export',
        options.format
      );
    } catch (err) {
      handleError(err, 'export data');
      throw err;
    } finally {
      updateLoadingState(false);
    }
  }, [handleError, updateLoadingState]);

  // Utility functions
  const applyFilters = useCallback((filters: ApplicationAnalyticsFilter) => {
    try {
      ApplicationAnalyticsService.validateFilters(filters);
      setCurrentFilters(filters);

      // Refresh all data with new filters
      refreshAllData();
    } catch (err) {
      handleError(err, 'apply filters');
    }
  }, [handleError]);

  const clearFilters = useCallback(() => {
    setCurrentFilters(null);
    refreshAllData();
  }, []);

  const refreshAllData = useCallback(async () => {
    try {
      updateLoadingState(true);
      setError(null);

      await Promise.all([
        fetchApplications(currentFilters || undefined),
        fetchPerformanceMetrics(currentFilters || undefined),
        fetchInsights(currentFilters || undefined)
      ]);
    } catch (err) {
      handleError(err, 'refresh all data');
    } finally {
      updateLoadingState(false);
    }
  }, [currentFilters, fetchApplications, fetchPerformanceMetrics, fetchInsights, handleError, updateLoadingState]);

  const subscribeToRealtime = useCallback((
    topic: string,
    callback: (data: any) => void
  ): (() => void) => {
    return ApplicationAnalyticsService.subscribeToRealtimeUpdates(topic, callback, refreshInterval);
  }, [refreshInterval]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && !loading.isLoading) {
      const interval = setInterval(() => {
        refreshAllData();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, loading.isLoading, refreshAllData]);

  // Real-time subscription effect
  useEffect(() => {
    if (enableRealtime) {
      const unsubscribeMetrics = subscribeToRealtime('performance_metrics', (data) => {
        setPerformanceMetrics(data);
      });

      const unsubscribeApplications = subscribeToRealtime('application_updates', (data) => {
        setApplications(data);
      });

      return () => {
        unsubscribeMetrics();
        unsubscribeApplications();
      };
    }
  }, [enableRealtime, subscribeToRealtime]);

  // Cleanup cache on unmount
  useEffect(() => {
    return () => {
      if (!cacheEnabled) {
        ApplicationAnalyticsService.clearCache();
      }
    };
  }, [cacheEnabled]);

  // Initial data load
  useEffect(() => {
    refreshAllData();
  }, []);

  // Memoized return value
  return useMemo(() => ({
    // Data
    applications,
    performanceMetrics,
    trends,
    userPatterns,
    predictiveAnalytics,
    chartData,
    timeSeriesData,
    reports,
    dashboards,
    mobileAnalytics,
    securityAnalytics,
    insights,

    // State
    loading,
    error,

    // Actions
    fetchApplications,
    fetchPerformanceMetrics,
    fetchTrends,
    fetchUserPatterns,
    fetchPredictiveAnalytics,
    fetchChartData,
    fetchTimeSeriesData,
    fetchReports,
    fetchDashboards,
    fetchMobileAnalytics,
    fetchSecurityAnalytics,
    fetchInsights,

    // Report Management
    createReport,
    updateReport,
    deleteReport,
    generateReport,

    // Dashboard Management
    createDashboard,
    updateDashboard,
    deleteDashboard,

    // Export Functions
    exportData,

    // Utility Functions
    applyFilters,
    clearFilters,
    refreshAllData,
    subscribeToRealtime,

    // Current filters
    currentFilters
  }), [
    applications,
    performanceMetrics,
    trends,
    userPatterns,
    predictiveAnalytics,
    chartData,
    timeSeriesData,
    reports,
    dashboards,
    mobileAnalytics,
    securityAnalytics,
    insights,
    loading,
    error,
    fetchApplications,
    fetchPerformanceMetrics,
    fetchTrends,
    fetchUserPatterns,
    fetchPredictiveAnalytics,
    fetchChartData,
    fetchTimeSeriesData,
    fetchReports,
    fetchDashboards,
    fetchMobileAnalytics,
    fetchSecurityAnalytics,
    fetchInsights,
    createReport,
    updateReport,
    deleteReport,
    generateReport,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    exportData,
    applyFilters,
    clearFilters,
    refreshAllData,
    subscribeToRealtime,
    currentFilters
  ]);
};