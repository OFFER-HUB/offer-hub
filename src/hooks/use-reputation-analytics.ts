/**
 * @fileoverview Custom hook for reputation analytics logic
 * @author OnlyDust Platform
 * @license MIT
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ReputationAnalytics,
  ReputationScore,
  PerformanceMetrics,
  ReputationEvent,
  ReputationTrend,
  BenchmarkData,
  ReputationCategory,
  ReputationInsight,
  ReputationPrediction,
  ReputationRecommendation,
  ExportFormat,
  ReputationFilters,
  MobileReputationView,
  ExternalPlatformIntegration,
  PrivacySettings,
  ReputationError,
  ReputationApiResponse,
  ReputationNotification
} from '@/types/reputation-analytics.types';
import { reputationCalculator } from '@/utils/reputation-calculations';

interface UseReputationAnalyticsParams {
  userId: string;
  refreshInterval?: number;
  enableRealTime?: boolean;
  includeHistorical?: boolean;
}

interface UseReputationAnalyticsReturn {
  analytics: ReputationAnalytics | null;
  loading: boolean;
  error: ReputationError | null;
  refreshData: () => Promise<void>;
  updateScore: (newScore: Partial<ReputationScore>) => void;
  exportData: (format: ExportFormat['format']) => Promise<string>;
  getInsights: () => ReputationInsight[];
  getPredictions: () => ReputationPrediction[];
  getRecommendations: () => ReputationRecommendation[];
  getBenchmarks: () => BenchmarkData[];
  getTrends: (timeframe?: number) => ReputationTrend[];
  filterData: (filters: ReputationFilters) => void;
  getMobileView: () => MobileReputationView;
  connectPlatform: (platform: ExternalPlatformIntegration['platform']) => Promise<boolean>;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => Promise<boolean>;
  markNotificationRead: (notificationId: string) => void;
  retryCalculation: () => Promise<void>;
}

export function useReputationAnalytics({
  userId,
  refreshInterval = 300000,
  enableRealTime = false,
  includeHistorical = true
}: UseReputationAnalyticsParams): UseReputationAnalyticsReturn {
  const [analytics, setAnalytics] = useState<ReputationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ReputationError | null>(null);
  const [filters, setFilters] = useState<ReputationFilters>({});
  const [notifications, setNotifications] = useState<ReputationNotification[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchReputationData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const [
        metricsResponse,
        eventsResponse,
        historicalResponse,
        platformDataResponse
      ] = await Promise.all([
        fetch(`/api/users/${userId}/reputation/metrics`),
        fetch(`/api/users/${userId}/reputation/events`),
        includeHistorical ? fetch(`/api/users/${userId}/reputation/historical`) : Promise.resolve(null),
        fetch('/api/reputation/platform-averages')
      ]);

      if (!metricsResponse.ok || !eventsResponse.ok || !platformDataResponse.ok) {
        throw new Error('Failed to fetch reputation data');
      }

      const metrics: PerformanceMetrics = await metricsResponse.json();
      const events: ReputationEvent[] = await eventsResponse.json();
      const historicalData = historicalResponse ? await historicalResponse.json() : [];
      const platformData = await platformDataResponse.json();

      const score = reputationCalculator.calculateOverallScore(metrics, events);
      const trends = reputationCalculator.calculateTrends(historicalData);
      const benchmarks = reputationCalculator.calculateBenchmarks(score, platformData);
      const insights = reputationCalculator.generateInsights(score, metrics, trends);
      const predictions = reputationCalculator.generatePredictions(score, trends, metrics);
      const recommendations = reputationCalculator.generateRecommendations(insights, score);

      const categories: ReputationCategory[] = [
        {
          id: 'communication',
          name: 'Communication',
          weight: 0.25,
          description: 'Response time and client interaction quality',
          skills: ['Project Updates', 'Client Calls', 'Documentation'],
          score: score.communication,
          trend: trends.find(t => t.category === 'communication')?.change || 0 > 0 ? 'up' : 'down',
          trendPercentage: Math.abs(trends.find(t => t.category === 'communication')?.change || 0)
        },
        {
          id: 'qualityOfWork',
          name: 'Quality of Work',
          weight: 0.30,
          description: 'Technical excellence and deliverable quality',
          skills: ['Code Quality', 'Testing', 'Documentation', 'Best Practices'],
          score: score.qualityOfWork,
          trend: trends.find(t => t.category === 'qualityOfWork')?.change || 0 > 0 ? 'up' : 'down',
          trendPercentage: Math.abs(trends.find(t => t.category === 'qualityOfWork')?.change || 0)
        },
        {
          id: 'timeliness',
          name: 'Timeliness',
          weight: 0.20,
          description: 'Meeting deadlines and delivery commitments',
          skills: ['Time Management', 'Planning', 'Estimation'],
          score: score.timeliness,
          trend: trends.find(t => t.category === 'timeliness')?.change || 0 > 0 ? 'up' : 'down',
          trendPercentage: Math.abs(trends.find(t => t.category === 'timeliness')?.change || 0)
        },
        {
          id: 'professionalism',
          name: 'Professionalism',
          weight: 0.15,
          description: 'Professional conduct and client satisfaction',
          skills: ['Client Relations', 'Conflict Resolution', 'Feedback'],
          score: score.professionalism,
          trend: trends.find(t => t.category === 'professionalism')?.change || 0 > 0 ? 'up' : 'down',
          trendPercentage: Math.abs(trends.find(t => t.category === 'professionalism')?.change || 0)
        },
        {
          id: 'reliability',
          name: 'Reliability',
          weight: 0.10,
          description: 'Consistency and dependability',
          skills: ['Consistency', 'Availability', 'Follow-through'],
          score: score.reliability,
          trend: trends.find(t => t.category === 'reliability')?.change || 0 > 0 ? 'up' : 'down',
          trendPercentage: Math.abs(trends.find(t => t.category === 'reliability')?.change || 0)
        }
      ];

      const newAnalytics: ReputationAnalytics = {
        userId,
        score,
        metrics,
        trends,
        benchmarks,
        categories,
        achievements: [],
        insights,
        predictions,
        recommendations
      };

      setAnalytics(newAnalytics);
      setLastUpdate(new Date());

      const newNotifications = await checkForNotifications(newAnalytics);
      setNotifications(prev => [...prev, ...newNotifications]);

    } catch (err) {
      const reputationError: ReputationError = {
        code: 'FETCH_ERROR',
        message: err instanceof Error ? err.message : 'Unknown error occurred',
        timestamp: new Date(),
        retryable: true
      };
      setError(reputationError);
    } finally {
      setLoading(false);
    }
  }, [userId, includeHistorical]);

  const checkForNotifications = async (analytics: ReputationAnalytics): Promise<ReputationNotification[]> => {
    const newNotifications: ReputationNotification[] = [];

    if (analytics.score.overall > 90) {
      newNotifications.push({
        id: `milestone-${Date.now()}`,
        type: 'milestone',
        title: 'Excellent Reputation!',
        message: 'You\'ve achieved an excellent reputation score. Keep up the great work!',
        timestamp: new Date(),
        read: false
      });
    }

    analytics.insights.forEach(insight => {
      if (insight.type === 'risk' && insight.impact === 'high') {
        newNotifications.push({
          id: `risk-${Date.now()}-${Math.random()}`,
          type: 'recommendation',
          title: 'Action Required',
          message: insight.title,
          timestamp: new Date(),
          read: false
        });
      }
    });

    return newNotifications;
  };

  const updateScore = useCallback((newScore: Partial<ReputationScore>) => {
    if (!analytics) return;

    setAnalytics(prev => {
      if (!prev) return null;
      return {
        ...prev,
        score: {
          ...prev.score,
          ...newScore,
          lastUpdated: new Date()
        }
      };
    });
  }, [analytics]);

  const exportData = useCallback(async (format: ExportFormat['format']): Promise<string> => {
    if (!analytics) throw new Error('No analytics data available');

    try {
      const response = await fetch(`/api/users/${userId}/reputation/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format, data: analytics })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `reputation-${format}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return url;
    } catch (error) {
      throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [analytics, userId]);

  const getInsights = useCallback((): ReputationInsight[] => {
    return analytics?.insights || [];
  }, [analytics]);

  const getPredictions = useCallback((): ReputationPrediction[] => {
    return analytics?.predictions || [];
  }, [analytics]);

  const getRecommendations = useCallback((): ReputationRecommendation[] => {
    return analytics?.recommendations || [];
  }, [analytics]);

  const getBenchmarks = useCallback((): BenchmarkData[] => {
    return analytics?.benchmarks || [];
  }, [analytics]);

  const getTrends = useCallback((timeframe?: number): ReputationTrend[] => {
    if (!analytics) return [];

    const cutoffDate = timeframe
      ? new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000)
      : new Date(0);

    return analytics.trends.filter(trend => trend.date >= cutoffDate);
  }, [analytics]);

  const filterData = useCallback((newFilters: ReputationFilters) => {
    setFilters(newFilters);
  }, []);

  const getMobileView = useCallback((): MobileReputationView => {
    if (!analytics) {
      return {
        isMobile: true,
        condensedMetrics: {},
        keyInsights: [],
        quickActions: [],
        notifications: []
      };
    }

    const keyInsights = analytics.insights
      .filter(insight => insight.impact === 'high')
      .slice(0, 3);

    const quickActions = [
      {
        id: 'view-score',
        title: 'View Score',
        description: 'Check your current reputation score',
        icon: 'star',
        action: () => console.log('Navigate to score'),
        priority: 1
      },
      {
        id: 'export-data',
        title: 'Export Report',
        description: 'Download your reputation report',
        icon: 'download',
        action: () => exportData('pdf'),
        priority: 2
      }
    ];

    return {
      isMobile: true,
      condensedMetrics: {
        completionRate: analytics.metrics.completionRate,
        clientSatisfactionScore: analytics.metrics.clientSatisfactionScore,
        onTimeDelivery: analytics.metrics.onTimeDelivery
      },
      keyInsights,
      quickActions,
      notifications: notifications.filter(n => !n.read).slice(0, 5)
    };
  }, [analytics, notifications, exportData]);

  const connectPlatform = useCallback(async (platform: ExternalPlatformIntegration['platform']): Promise<boolean> => {
    try {
      const response = await fetch(`/api/users/${userId}/reputation/integrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform })
      });

      return response.ok;
    } catch (error) {
      console.error(`Failed to connect ${platform}:`, error);
      return false;
    }
  }, [userId]);

  const updatePrivacySettings = useCallback(async (settings: Partial<PrivacySettings>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/users/${userId}/reputation/privacy`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
      return false;
    }
  }, [userId]);

  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const retryCalculation = useCallback(async (): Promise<void> => {
    await fetchReputationData();
  }, [fetchReputationData]);

  const refreshData = useCallback(async (): Promise<void> => {
    await fetchReputationData();
  }, [fetchReputationData]);

  const filteredAnalytics = useMemo(() => {
    if (!analytics || Object.keys(filters).length === 0) return analytics;

    let filteredTrends = analytics.trends;

    if (filters.dateRange) {
      filteredTrends = filteredTrends.filter(trend =>
        trend.date >= filters.dateRange!.start && trend.date <= filters.dateRange!.end
      );
    }

    if (filters.categories && filters.categories.length > 0) {
      filteredTrends = filteredTrends.filter(trend =>
        filters.categories!.includes(trend.category)
      );
    }

    if (filters.minScore !== undefined) {
      filteredTrends = filteredTrends.filter(trend => trend.score >= filters.minScore!);
    }

    if (filters.maxScore !== undefined) {
      filteredTrends = filteredTrends.filter(trend => trend.score <= filters.maxScore!);
    }

    if (filters.sortBy) {
      filteredTrends = [...filteredTrends].sort((a, b) => {
        const multiplier = filters.sortOrder === 'desc' ? -1 : 1;
        switch (filters.sortBy) {
          case 'score':
            return (a.score - b.score) * multiplier;
          case 'date':
            return (a.date.getTime() - b.date.getTime()) * multiplier;
          case 'impact':
            return (Math.abs(a.change) - Math.abs(b.change)) * multiplier;
          default:
            return 0;
        }
      });
    }

    if (filters.limit) {
      filteredTrends = filteredTrends.slice(filters.offset || 0, (filters.offset || 0) + filters.limit);
    }

    return {
      ...analytics,
      trends: filteredTrends
    };
  }, [analytics, filters]);

  useEffect(() => {
    fetchReputationData();
  }, [fetchReputationData]);

  useEffect(() => {
    if (!enableRealTime) return;

    const interval = setInterval(fetchReputationData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchReputationData, refreshInterval, enableRealTime]);

  return {
    analytics: filteredAnalytics,
    loading,
    error,
    refreshData,
    updateScore,
    exportData,
    getInsights,
    getPredictions,
    getRecommendations,
    getBenchmarks,
    getTrends,
    filterData,
    getMobileView,
    connectPlatform,
    updatePrivacySettings,
    markNotificationRead,
    retryCalculation
  };
}