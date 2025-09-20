import {
  DisputeAnalytics,
  PerformanceMetrics,
  TrendData,
  DisputePattern,
  PredictiveModel,
  CustomReport,
  AnalyticsDashboard,
  AnalyticsFilter,
  ExportOptions,
  AnalyticsAPIResponse,
  ChartData,
  TimeSeriesData,
  SegmentData,
  ExportFormat,
  DisputeStatus,
  DisputeType,
  DisputeCategory,
  DisputePriority
} from '@/types/analytics.types';
import { AnalyticsCalculator } from '@/utils/analytics-helpers';

export class AnalyticsService {
  private static baseUrl = '/api/analytics';
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static async getDisputeAnalytics(filters?: AnalyticsFilter): Promise<AnalyticsAPIResponse<DisputeAnalytics[]>> {
    const cacheKey = `disputes_${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const queryParams = filters ? `?${this.buildQueryParams(filters)}` : '';
      const response = await fetch(`${this.baseUrl}/disputes${queryParams}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch dispute analytics: ${response.statusText}`);
      }

      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching dispute analytics:', error);
      throw error;
    }
  }

  static async getPerformanceMetrics(filters?: AnalyticsFilter): Promise<AnalyticsAPIResponse<PerformanceMetrics>> {
    const cacheKey = `performance_${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const disputes = await this.getDisputeAnalytics(filters);
      const metrics = AnalyticsCalculator.calculatePerformanceMetrics(disputes.data);

      const result = {
        data: metrics,
        timestamp: new Date()
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error calculating performance metrics:', error);
      throw error;
    }
  }

  static async getTrendData(
    metric: 'count' | 'resolution_time' | 'satisfaction',
    period: 'daily' | 'weekly' | 'monthly',
    filters?: AnalyticsFilter
  ): Promise<AnalyticsAPIResponse<TrendData[]>> {
    const cacheKey = `trends_${metric}_${period}_${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const disputes = await this.getDisputeAnalytics(filters);
      const trends = AnalyticsCalculator.calculateTrendData(disputes.data, period, metric);

      const result = {
        data: trends,
        timestamp: new Date()
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error calculating trend data:', error);
      throw error;
    }
  }

  static async getDisputePatterns(filters?: AnalyticsFilter): Promise<AnalyticsAPIResponse<DisputePattern[]>> {
    const cacheKey = `patterns_${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const disputes = await this.getDisputeAnalytics(filters);
      const patterns = AnalyticsCalculator.identifyDisputePatterns(disputes.data);

      const result = {
        data: patterns,
        timestamp: new Date()
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error identifying dispute patterns:', error);
      throw error;
    }
  }

  static async getPredictiveModel(filters?: AnalyticsFilter): Promise<AnalyticsAPIResponse<PredictiveModel>> {
    const cacheKey = `predictions_${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const disputes = await this.getDisputeAnalytics(filters);
      const model = AnalyticsCalculator.generatePredictiveModel(disputes.data);

      const result = {
        data: model,
        timestamp: new Date()
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error generating predictive model:', error);
      throw error;
    }
  }

  static async getChartData(
    type: 'status' | 'type' | 'category' | 'priority',
    filters?: AnalyticsFilter
  ): Promise<AnalyticsAPIResponse<ChartData[]>> {
    const cacheKey = `chart_${type}_${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const disputes = await this.getDisputeAnalytics(filters);
      const segmentedData = AnalyticsCalculator.createSegmentedData(disputes.data, type);
      const chartData = segmentedData.map((segment, index) => ({
        name: segment.segment,
        value: segment.value,
        percentage: segment.percentage,
        color: this.getColorByIndex(index)
      }));

      const result = {
        data: chartData,
        timestamp: new Date()
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error generating chart data:', error);
      throw error;
    }
  }

  static async getTimeSeriesData(
    metric: string,
    filters?: AnalyticsFilter
  ): Promise<AnalyticsAPIResponse<TimeSeriesData[]>> {
    const cacheKey = `timeseries_${metric}_${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const disputes = await this.getDisputeAnalytics(filters);
      const timeSeriesData = AnalyticsCalculator.convertToTimeSeriesData(disputes.data, metric);

      const result = {
        data: timeSeriesData,
        timestamp: new Date()
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error generating time series data:', error);
      throw error;
    }
  }

  static async createCustomReport(report: Omit<CustomReport, 'id' | 'createdAt' | 'lastGenerated'>): Promise<AnalyticsAPIResponse<CustomReport>> {
    try {
      const response = await fetch(`${this.baseUrl}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        throw new Error(`Failed to create custom report: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating custom report:', error);
      throw error;
    }
  }

  static async getCustomReports(userId?: string): Promise<AnalyticsAPIResponse<CustomReport[]>> {
    const cacheKey = `reports_${userId || 'all'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const queryParams = userId ? `?userId=${userId}` : '';
      const response = await fetch(`${this.baseUrl}/reports${queryParams}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch custom reports: ${response.statusText}`);
      }

      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching custom reports:', error);
      throw error;
    }
  }

  static async generateReport(reportId: string): Promise<AnalyticsAPIResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/${reportId}/generate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  static async exportData(options: ExportOptions): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error(`Failed to export data: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  static async downloadExport(blob: Blob, filename: string, format: ExportFormat): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  static async getDashboard(dashboardId?: string): Promise<AnalyticsAPIResponse<AnalyticsDashboard>> {
    const cacheKey = `dashboard_${dashboardId || 'default'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = dashboardId
        ? `${this.baseUrl}/dashboards/${dashboardId}`
        : `${this.baseUrl}/dashboards/default`;

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
      }

      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw error;
    }
  }

  static async updateDashboard(dashboard: AnalyticsDashboard): Promise<AnalyticsAPIResponse<AnalyticsDashboard>> {
    try {
      const response = await fetch(`${this.baseUrl}/dashboards/${dashboard.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dashboard),
      });

      if (!response.ok) {
        throw new Error(`Failed to update dashboard: ${response.statusText}`);
      }

      const data = await response.json();
      this.clearCacheByPattern('dashboard_');
      return data;
    } catch (error) {
      console.error('Error updating dashboard:', error);
      throw error;
    }
  }

  static async getRealtimeMetrics(): Promise<AnalyticsAPIResponse<PerformanceMetrics>> {
    try {
      const response = await fetch(`${this.baseUrl}/realtime/metrics`);

      if (!response.ok) {
        throw new Error(`Failed to fetch realtime metrics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching realtime metrics:', error);
      throw error;
    }
  }

  static subscribeToRealtimeUpdates(
    callback: (data: PerformanceMetrics) => void,
    interval: number = 30000
  ): () => void {
    const intervalId = setInterval(async () => {
      try {
        const response = await this.getRealtimeMetrics();
        callback(response.data);
      } catch (error) {
        console.error('Error in realtime subscription:', error);
      }
    }, interval);

    return () => clearInterval(intervalId);
  }

  static generateMockData(): DisputeAnalytics[] {
    const mockData: DisputeAnalytics[] = [];
    const types = Object.values(DisputeType);
    const statuses = Object.values(DisputeStatus);
    const categories = Object.values(DisputeCategory);
    const priorities = Object.values(DisputePriority);

    for (let i = 0; i < 100; i++) {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 90));

      const resolvedAt = Math.random() > 0.3 ? new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined;
      const resolutionTime = resolvedAt ? (resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60) : undefined;

      mockData.push({
        id: `dispute_${i + 1}`,
        disputeId: `DISP_${String(i + 1).padStart(4, '0')}`,
        createdAt,
        resolvedAt,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        type: types[Math.floor(Math.random() * types.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        resolutionTime,
        userSatisfactionScore: Math.random() > 0.2 ? Math.floor(Math.random() * 5) + 1 : undefined,
        escalationLevel: Math.random() > 0.8 ? Math.floor(Math.random() * 3) + 1 : 0,
        assignedTo: Math.random() > 0.1 ? `agent_${Math.floor(Math.random() * 10) + 1}` : undefined,
        tags: this.generateRandomTags()
      });
    }

    return mockData;
  }

  private static buildQueryParams(filters: AnalyticsFilter): string {
    const params = new URLSearchParams();

    if (filters.dateRange) {
      params.append('from', filters.dateRange.from.toISOString());
      params.append('to', filters.dateRange.to.toISOString());
    }

    if (filters.status) {
      filters.status.forEach(status => params.append('status', status));
    }

    if (filters.type) {
      filters.type.forEach(type => params.append('type', type));
    }

    if (filters.category) {
      filters.category.forEach(category => params.append('category', category));
    }

    if (filters.priority) {
      filters.priority.forEach(priority => params.append('priority', priority));
    }

    if (filters.assignedTo) {
      filters.assignedTo.forEach(assignee => params.append('assignedTo', assignee));
    }

    if (filters.tags) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }

    if (filters.userType) {
      params.append('userType', filters.userType);
    }

    return params.toString();
  }

  private static getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private static setCache(key: string, data: any, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private static clearCacheByPattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  static clearCache(): void {
    this.cache.clear();
  }

  private static getColorByIndex(index: number): string {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];
    return colors[index % colors.length];
  }

  private static generateRandomTags(): string[] {
    const allTags = [
      'urgent', 'payment-related', 'quality-issue', 'communication',
      'deadline', 'scope-creep', 'technical', 'commercial', 'resolved'
    ];
    const numTags = Math.floor(Math.random() * 3) + 1;
    const selectedTags: string[] = [];

    for (let i = 0; i < numTags; i++) {
      const randomTag = allTags[Math.floor(Math.random() * allTags.length)];
      if (!selectedTags.includes(randomTag)) {
        selectedTags.push(randomTag);
      }
    }

    return selectedTags;
  }

  static validateFilters(filters: AnalyticsFilter): boolean {
    if (filters.dateRange) {
      if (filters.dateRange.from > filters.dateRange.to) {
        throw new Error('Invalid date range: start date must be before end date');
      }
    }

    return true;
  }

  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Analytics service health check failed:', error);
      return false;
    }
  }
}