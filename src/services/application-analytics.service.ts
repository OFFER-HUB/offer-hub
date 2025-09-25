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
  ApplicationAPIResponse,
  ChartData,
  TimeSeriesData,
  SegmentData,
  ExportFormat,
  ApplicationStatus,
  ApplicationSource,
  ComplianceReport,
  ComplianceData,
  MobileAnalytics,
  SecurityAnalytics
} from '@/types/application-analytics.types';
import { ApplicationAnalyticsCalculator } from '@/utils/analytics-helpers';

export class ApplicationAnalyticsService {
  private static baseUrl = '/api/application-analytics';
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static subscribers = new Map<string, Set<(data: any) => void>>();

  static async getApplicationAnalytics(filters?: ApplicationAnalyticsFilter): Promise<ApplicationAPIResponse<ApplicationAnalytics[]>> {
    const cacheKey = `applications_${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const queryParams = filters ? `?${this.buildQueryParams(filters)}` : '';
      const response = await fetch(`${this.baseUrl}/applications${queryParams}`, {
        headers: this.getDefaultHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch application analytics: ${response.statusText}`);
      }

      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching application analytics:', error);
      throw error;
    }
  }

  static async getPerformanceMetrics(filters?: ApplicationAnalyticsFilter): Promise<ApplicationAPIResponse<ApplicationPerformanceMetrics>> {
    const cacheKey = `performance_${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const applications = await this.getApplicationAnalytics(filters);
      const metrics = ApplicationAnalyticsCalculator.calculatePerformanceMetrics(applications.data);

      const result = {
        data: metrics,
        timestamp: new Date(),
        version: '1.0.0'
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error calculating performance metrics:', error);
      throw error;
    }
  }

  static async getApplicationTrends(
    period: 'daily' | 'weekly' | 'monthly',
    metric: 'count' | 'success_rate' | 'average_value',
    filters?: ApplicationAnalyticsFilter
  ): Promise<ApplicationAPIResponse<ApplicationTrends[]>> {
    const cacheKey = `trends_${period}_${metric}_${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const applications = await this.getApplicationAnalytics(filters);
      const trends = ApplicationAnalyticsCalculator.calculateApplicationTrends(applications.data, period, metric);

      const result = {
        data: trends,
        timestamp: new Date(),
        meta: {
          total: trends.length,
          page: 1,
          limit: trends.length,
          hasMore: false
        }
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error calculating application trends:', error);
      throw error;
    }
  }

  static async getUserBehaviorPatterns(filters?: ApplicationAnalyticsFilter): Promise<ApplicationAPIResponse<UserBehaviorPattern[]>> {
    const cacheKey = `behavior_patterns_${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const applications = await this.getApplicationAnalytics(filters);
      const patterns = ApplicationAnalyticsCalculator.analyzeUserBehaviorPatterns(applications.data);

      const result = {
        data: patterns,
        timestamp: new Date(),
        meta: {
          total: patterns.length,
          page: 1,
          limit: patterns.length,
          hasMore: false
        }
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error analyzing user behavior patterns:', error);
      throw error;
    }
  }

  static async getPredictiveAnalytics(filters?: ApplicationAnalyticsFilter): Promise<ApplicationAPIResponse<PredictiveAnalytics>> {
    const cacheKey = `predictive_analytics_${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const applications = await this.getApplicationAnalytics(filters);
      const analytics = ApplicationAnalyticsCalculator.generatePredictiveAnalytics(applications.data);

      const result = {
        data: analytics,
        timestamp: new Date(),
        version: '1.0.0'
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error generating predictive analytics:', error);
      throw error;
    }
  }

  static async getChartData(
    type: 'status' | 'source' | 'projectType' | 'skills',
    filters?: ApplicationAnalyticsFilter
  ): Promise<ApplicationAPIResponse<ChartData[]>> {
    const cacheKey = `chart_${type}_${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const applications = await this.getApplicationAnalytics(filters);
      const segmentedData = ApplicationAnalyticsCalculator.createSegmentedData(applications.data, type as keyof ApplicationAnalytics);
      const chartData = ApplicationAnalyticsCalculator.convertToChartData(segmentedData, 'segment', 'value');

      const result = {
        data: chartData,
        timestamp: new Date(),
        meta: {
          total: chartData.length,
          page: 1,
          limit: chartData.length,
          hasMore: false
        }
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
    filters?: ApplicationAnalyticsFilter
  ): Promise<ApplicationAPIResponse<TimeSeriesData[]>> {
    const cacheKey = `timeseries_${metric}_${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const applications = await this.getApplicationAnalytics(filters);
      const timeSeriesData = ApplicationAnalyticsCalculator.convertToTimeSeriesData(applications.data, metric);

      const result = {
        data: timeSeriesData,
        timestamp: new Date(),
        meta: {
          total: timeSeriesData.length,
          page: 1,
          limit: timeSeriesData.length,
          hasMore: false
        }
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error generating time series data:', error);
      throw error;
    }
  }

  static async createApplicationReport(report: Omit<ApplicationReport, 'id' | 'createdAt' | 'lastGenerated'>): Promise<ApplicationAPIResponse<ApplicationReport>> {
    try {
      const response = await fetch(`${this.baseUrl}/reports`, {
        method: 'POST',
        headers: this.getDefaultHeaders(),
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        throw new Error(`Failed to create application report: ${response.statusText}`);
      }

      const data = await response.json();
      this.clearCacheByPattern('reports_');
      return data;
    } catch (error) {
      console.error('Error creating application report:', error);
      throw error;
    }
  }

  static async getApplicationReports(userId?: string): Promise<ApplicationAPIResponse<ApplicationReport[]>> {
    const cacheKey = `reports_${userId || 'all'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const queryParams = userId ? `?userId=${userId}` : '';
      const response = await fetch(`${this.baseUrl}/reports${queryParams}`, {
        headers: this.getDefaultHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch application reports: ${response.statusText}`);
      }

      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching application reports:', error);
      throw error;
    }
  }

  static async generateReport(reportId: string): Promise<ApplicationAPIResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/${reportId}/generate`, {
        method: 'POST',
        headers: this.getDefaultHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.statusText}`);
      }

      const data = await response.json();
      this.clearCacheByPattern(`reports_${reportId}`);
      return data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  static async updateReport(reportId: string, updates: Partial<ApplicationReport>): Promise<ApplicationAPIResponse<ApplicationReport>> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/${reportId}`, {
        method: 'PUT',
        headers: this.getDefaultHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update report: ${response.statusText}`);
      }

      const data = await response.json();
      this.clearCacheByPattern('reports_');
      return data;
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  }

  static async deleteReport(reportId: string): Promise<ApplicationAPIResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/${reportId}`, {
        method: 'DELETE',
        headers: this.getDefaultHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to delete report: ${response.statusText}`);
      }

      this.clearCacheByPattern('reports_');
      return {
        data: undefined,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  }

  static async exportData(options: ExportOptions): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/export`, {
        method: 'POST',
        headers: this.getDefaultHeaders(),
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

  static async downloadExport(blob: Blob, filename: string, format: ExportFormat): Promise<void> {
    try {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading export:', error);
      throw error;
    }
  }

  static async getDashboard(dashboardId?: string): Promise<ApplicationAPIResponse<ApplicationDashboard>> {
    const cacheKey = `dashboard_${dashboardId || 'default'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = dashboardId
        ? `${this.baseUrl}/dashboards/${dashboardId}`
        : `${this.baseUrl}/dashboards/default`;

      const response = await fetch(endpoint, {
        headers: this.getDefaultHeaders()
      });

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

  static async createDashboard(dashboard: Omit<ApplicationDashboard, 'id' | 'lastUpdated'>): Promise<ApplicationAPIResponse<ApplicationDashboard>> {
    try {
      const response = await fetch(`${this.baseUrl}/dashboards`, {
        method: 'POST',
        headers: this.getDefaultHeaders(),
        body: JSON.stringify(dashboard),
      });

      if (!response.ok) {
        throw new Error(`Failed to create dashboard: ${response.statusText}`);
      }

      const data = await response.json();
      this.clearCacheByPattern('dashboard_');
      return data;
    } catch (error) {
      console.error('Error creating dashboard:', error);
      throw error;
    }
  }

  static async updateDashboard(dashboard: ApplicationDashboard): Promise<ApplicationAPIResponse<ApplicationDashboard>> {
    try {
      const response = await fetch(`${this.baseUrl}/dashboards/${dashboard.id}`, {
        method: 'PUT',
        headers: this.getDefaultHeaders(),
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

  static async deleteDashboard(dashboardId: string): Promise<ApplicationAPIResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/dashboards/${dashboardId}`, {
        method: 'DELETE',
        headers: this.getDefaultHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to delete dashboard: ${response.statusText}`);
      }

      this.clearCacheByPattern('dashboard_');
      return {
        data: undefined,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      throw error;
    }
  }

  static async getRealtimeMetrics(): Promise<ApplicationAPIResponse<ApplicationPerformanceMetrics>> {
    try {
      const response = await fetch(`${this.baseUrl}/realtime/metrics`, {
        headers: this.getDefaultHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch realtime metrics: ${response.statusText}`);
      }

      const data = await response.json();
      this.notifySubscribers('realtime_metrics', data);
      return data;
    } catch (error) {
      console.error('Error fetching realtime metrics:', error);
      throw error;
    }
  }

  static subscribeToRealtimeUpdates(
    topic: string,
    callback: (data: any) => void,
    interval: number = 30000
  ): () => void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic)!.add(callback);

    const intervalId = setInterval(async () => {
      try {
        switch (topic) {
          case 'performance_metrics':
            const metricsResponse = await this.getRealtimeMetrics();
            callback(metricsResponse.data);
            break;
          case 'application_updates':
            const applicationsResponse = await this.getApplicationAnalytics();
            callback(applicationsResponse.data);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error(`Error in realtime subscription for ${topic}:`, error);
      }
    }, interval);

    return () => {
      clearInterval(intervalId);
      const subscribers = this.subscribers.get(topic);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(topic);
        }
      }
    };
  }

  static async getComplianceReport(
    reportType: string,
    dateRange: { from: Date; to: Date }
  ): Promise<ApplicationAPIResponse<ComplianceReport>> {
    const cacheKey = `compliance_${reportType}_${dateRange.from.toISOString()}_${dateRange.to.toISOString()}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrl}/compliance/${reportType}`, {
        method: 'POST',
        headers: this.getDefaultHeaders(),
        body: JSON.stringify({ dateRange }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate compliance report: ${response.statusText}`);
      }

      const data = await response.json();
      this.setCache(cacheKey, data, 10 * 60 * 1000); // Cache for 10 minutes
      return data;
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }

  static async getMobileAnalytics(filters?: ApplicationAnalyticsFilter): Promise<ApplicationAPIResponse<MobileAnalytics[]>> {
    const cacheKey = `mobile_analytics_${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const applications = await this.getApplicationAnalytics(filters);
      const mobileAnalytics = ApplicationAnalyticsCalculator.analyzeMobilePerformance(applications.data);

      const result = {
        data: mobileAnalytics,
        timestamp: new Date(),
        meta: {
          total: mobileAnalytics.length,
          page: 1,
          limit: mobileAnalytics.length,
          hasMore: false
        }
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error analyzing mobile performance:', error);
      throw error;
    }
  }

  static async getSecurityAnalytics(filters?: ApplicationAnalyticsFilter): Promise<ApplicationAPIResponse<SecurityAnalytics>> {
    const cacheKey = `security_analytics_${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const applications = await this.getApplicationAnalytics(filters);
      const securityAnalytics = ApplicationAnalyticsCalculator.analyzeSecurityMetrics(applications.data);

      const result = {
        data: securityAnalytics,
        timestamp: new Date(),
        version: '1.0.0'
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error analyzing security metrics:', error);
      throw error;
    }
  }

  static generateMockData(count: number = 100): ApplicationAnalytics[] {
    const mockData: ApplicationAnalytics[] = [];
    const statuses = Object.values(ApplicationStatus);
    const sources = Object.values(ApplicationSource);
    const projectTypes = ['Web Development', 'Mobile App', 'AI/ML', 'Blockchain', 'Data Analysis', 'UI/UX Design'];
    const skills = ['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'AWS', 'Docker', 'MongoDB', 'PostgreSQL', 'GraphQL'];

    for (let i = 0; i < count; i++) {
      const submittedAt = new Date();
      submittedAt.setDate(submittedAt.getDate() - Math.floor(Math.random() * 90));

      const decisionAt = Math.random() > 0.3 ? new Date(submittedAt.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000) : undefined;
      const decisionTime = decisionAt ? (decisionAt.getTime() - submittedAt.getTime()) / (1000 * 60) : undefined;

      mockData.push({
        id: `app_analytics_${i + 1}`,
        applicationId: `APP_${String(i + 1).padStart(4, '0')}`,
        userId: `user_${Math.floor(Math.random() * 50) + 1}`,
        submittedAt,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        decisionAt,
        decisionTime,
        source: sources[Math.floor(Math.random() * sources.length)],
        projectType: projectTypes[Math.floor(Math.random() * projectTypes.length)],
        projectValue: Math.random() > 0.2 ? Math.floor(Math.random() * 10000) + 500 : undefined,
        skillsRequired: this.generateRandomSkills(skills),
        successRate: Math.random() > 0.3 ? Math.floor(Math.random() * 100) : undefined,
        userEngagement: {
          profileViews: Math.floor(Math.random() * 200),
          messagesSent: Math.floor(Math.random() * 20),
          lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          sessionDuration: Math.floor(Math.random() * 7200),
          pagesVisited: Math.floor(Math.random() * 30),
          documentsUploaded: Math.floor(Math.random() * 5),
          portfolioViews: Math.floor(Math.random() * 100)
        },
        behaviorMetrics: {
          submissionTime: submittedAt,
          timeSpentOnApplication: Math.floor(Math.random() * 3600),
          revisionsCount: Math.floor(Math.random() * 5),
          attachmentCount: Math.floor(Math.random() * 8),
          customFieldsCompleted: Math.floor(Math.random() * 15),
          averageResponseTime: Math.floor(Math.random() * 5000) + 200,
          mobilePlatform: Math.random() > 0.6
        }
      });
    }

    return mockData;
  }

  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        headers: this.getDefaultHeaders()
      });
      return response.ok;
    } catch (error) {
      console.error('Application analytics service health check failed:', error);
      return false;
    }
  }

  static validateFilters(filters: ApplicationAnalyticsFilter): boolean {
    try {
      if (filters.dateRange) {
        if (filters.dateRange.from > filters.dateRange.to) {
          throw new Error('Invalid date range: start date must be before end date');
        }

        const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year
        if (filters.dateRange.to.getTime() - filters.dateRange.from.getTime() > maxRange) {
          throw new Error('Date range cannot exceed 1 year');
        }
      }

      if (filters.projectValueRange) {
        if (filters.projectValueRange.min < 0 || filters.projectValueRange.max < 0) {
          throw new Error('Project value range cannot be negative');
        }
        if (filters.projectValueRange.min > filters.projectValueRange.max) {
          throw new Error('Invalid project value range: minimum cannot be greater than maximum');
        }
      }

      if (filters.successRate && (filters.successRate < 0 || filters.successRate > 100)) {
        throw new Error('Success rate must be between 0 and 100');
      }

      return true;
    } catch (error) {
      console.error('Filter validation error:', error);
      throw error;
    }
  }

  private static buildQueryParams(filters: ApplicationAnalyticsFilter): string {
    const params = new URLSearchParams();

    if (filters.dateRange) {
      params.append('from', filters.dateRange.from.toISOString());
      params.append('to', filters.dateRange.to.toISOString());
    }

    if (filters.status) {
      filters.status.forEach(status => params.append('status', status));
    }

    if (filters.source) {
      filters.source.forEach(source => params.append('source', source));
    }

    if (filters.projectType) {
      filters.projectType.forEach(type => params.append('projectType', type));
    }

    if (filters.skillsRequired) {
      filters.skillsRequired.forEach(skill => params.append('skillsRequired', skill));
    }

    if (filters.userId) {
      filters.userId.forEach(userId => params.append('userId', userId));
    }

    if (filters.projectValueRange) {
      params.append('minValue', filters.projectValueRange.min.toString());
      params.append('maxValue', filters.projectValueRange.max.toString());
    }

    if (filters.successRate) {
      params.append('successRate', filters.successRate.toString());
    }

    if (filters.engagementLevel) {
      filters.engagementLevel.forEach(level => params.append('engagementLevel', level));
    }

    return params.toString();
  }

  private static getDefaultHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Client-Version': '1.0.0',
      'Cache-Control': 'no-cache'
    };
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
    // Implement cache size limit
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

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

  private static notifySubscribers(topic: string, data: any): void {
    const subscribers = this.subscribers.get(topic);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error notifying subscriber for topic ${topic}:`, error);
        }
      });
    }
  }

  private static generateRandomSkills(skills: string[]): string[] {
    const numSkills = Math.floor(Math.random() * 5) + 1;
    const selectedSkills: string[] = [];

    for (let i = 0; i < numSkills; i++) {
      const randomSkill = skills[Math.floor(Math.random() * skills.length)];
      if (!selectedSkills.includes(randomSkill)) {
        selectedSkills.push(randomSkill);
      }
    }

    return selectedSkills;
  }

  static async bulkUpdateApplications(updates: { applicationId: string; data: Partial<ApplicationAnalytics> }[]): Promise<ApplicationAPIResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/applications/bulk-update`, {
        method: 'PUT',
        headers: this.getDefaultHeaders(),
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        throw new Error(`Failed to bulk update applications: ${response.statusText}`);
      }

      this.clearCache();
      return {
        data: undefined,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error bulk updating applications:', error);
      throw error;
    }
  }

  static async getAnalyticsInsights(filters?: ApplicationAnalyticsFilter): Promise<ApplicationAPIResponse<string[]>> {
    try {
      const [performance, trends, patterns] = await Promise.all([
        this.getPerformanceMetrics(filters),
        this.getApplicationTrends('monthly', 'success_rate', filters),
        this.getUserBehaviorPatterns(filters)
      ]);

      const insights: string[] = [];

      // Generate insights based on data
      if (performance.data.successRate < 50) {
        insights.push('Application success rate is below average. Consider improving application matching algorithms.');
      }

      if (performance.data.averageDecisionTime > 7 * 24 * 60) {
        insights.push('Application decision time is longer than industry standards. Consider streamlining the review process.');
      }

      if (trends.data.length > 1) {
        const latestTrend = trends.data[trends.data.length - 1];
        if (latestTrend.changePercentage > 20) {
          insights.push(`Significant ${latestTrend.changePercentage > 0 ? 'increase' : 'decrease'} in application success rate detected.`);
        }
      }

      const mobileUsers = patterns.data.filter(p => p.devicePreference.mobile > 50);
      if (mobileUsers.length > patterns.data.length * 0.6) {
        insights.push('Majority of users prefer mobile platform. Consider optimizing mobile experience.');
      }

      return {
        data: insights,
        timestamp: new Date(),
        meta: {
          total: insights.length,
          page: 1,
          limit: insights.length,
          hasMore: false
        }
      };
    } catch (error) {
      console.error('Error generating analytics insights:', error);
      throw error;
    }
  }
}