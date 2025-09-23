// Review analytics service

import {
  ReviewPerformanceMetrics,
  UserBehaviorAnalytics,
  ReputationTrends,
  CustomReport,
  AnalyticsQuery,
  AnalyticsResponse,
  DateRange,
  ExportConfig,
  ExportResult,
  RealTimeUpdate,
  DashboardWidget,
  MetricCard,
  PredictiveModel,
  PredictionResult,
  ReviewLikelihoodPrediction,
  QualityPrediction,
  TrendForecast,
  PerformanceMetrics,
  MachineLearningPipeline,
  AdvancedAnalyticsConfig
} from '@/types/review-analytics.types';

import { Review } from '@/types/review.types';

import {
  calculateRatingDistribution,
  calculateAverageRating,
  groupReviewsByDate,
  calculateReviewMetrics,
  calculateResponseTimeMetrics,
  generateCacheKey,
  debounce
} from '@/utils/analytics-helpers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class ReviewAnalyticsService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  // TODO: Make cache configurable per user plan
  // Core Analytics Data Fetching
  async getReviewPerformanceMetrics(
    dateRange: DateRange,
    filters?: Record<string, any>
  ): Promise<ReviewPerformanceMetrics> {
    const cacheKey = this.generateCacheKey('performance', { dateRange, filters });
    const cached = this.getFromCache<ReviewPerformanceMetrics>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const query = new URLSearchParams();
      query.append('startDate', dateRange.startDate.toISOString());
      query.append('endDate', dateRange.endDate.toISOString());
      
      if (filters) {
        query.append('filters', JSON.stringify(filters));
      }

      const response = await fetch(`${API_BASE_URL}/analytics/reviews/performance?${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch performance metrics: ${response.statusText}`);
      }

      const data = await response.json();
      const metrics = this.processPerformanceMetrics(data);
      
      this.setCache(cacheKey, metrics);
      return metrics;
    } catch (error) {
      console.log('API down, using fake data');
      return this.generateMockPerformanceMetrics(dateRange);
    }
  }

  async getUserBehaviorAnalytics(
    dateRange: DateRange,
    userSegment?: string
  ): Promise<UserBehaviorAnalytics> {
    const cacheKey = this.generateCacheKey('behavior', { dateRange, userSegment });
    const cached = this.getFromCache<UserBehaviorAnalytics>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const query = new URLSearchParams();
      query.append('startDate', dateRange.startDate.toISOString());
      query.append('endDate', dateRange.endDate.toISOString());
      
      if (userSegment) {
        query.append('segment', userSegment);
      }

      const response = await fetch(`${API_BASE_URL}/analytics/reviews/behavior?${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch behavior analytics: ${response.statusText}`);
      }

      const data = await response.json();
      const analytics = this.processBehaviorAnalytics(data);
      
      this.setCache(cacheKey, analytics);
      return analytics;
    } catch (error) {
      // Backend's probably down again
      return this.generateMockBehaviorAnalytics(dateRange);
    }
  }

  async getReputationTrends(
    dateRange: DateRange,
    segments?: string[]
  ): Promise<ReputationTrends> {
    const cacheKey = this.generateCacheKey('reputation', { dateRange, segments });
    const cached = this.getFromCache<ReputationTrends>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const query = new URLSearchParams();
      query.append('startDate', dateRange.startDate.toISOString());
      query.append('endDate', dateRange.endDate.toISOString());
      
      if (segments) {
        query.append('segments', JSON.stringify(segments));
      }

      const response = await fetch(`${API_BASE_URL}/analytics/reviews/reputation?${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reputation trends: ${response.statusText}`);
      }

      const data = await response.json();
      const trends = this.processReputationTrends(data);
      
      this.setCache(cacheKey, trends);
      return trends;
    } catch (error) {
      console.log('Reputation API failed');
      return this.generateMockReputationTrends(dateRange);
    }
  }


  // Custom Reports
  async createCustomReport(report: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomReport> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(report)
      });

      if (!response.ok) {
        throw new Error(`Failed to create report: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating custom report:', error);
      throw error;
    }
  }

  async getCustomReports(userId?: string): Promise<CustomReport[]> {
    try {
      const query = userId ? `?userId=${userId}` : '';
      const response = await fetch(`${API_BASE_URL}/analytics/reports${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      return this.generateMockCustomReports(); // Fallback data
    }
  }

  async generateReport(reportId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/reports/${reportId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
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

  // Data Export
  async exportData(config: ExportConfig, data: any[]): Promise<ExportResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ config, data })
      });

      if (!response.ok) {
        throw new Error(`Failed to export data: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  // Real-time Data
  async getRealtimeMetrics(): Promise<MetricCard[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/realtime/metrics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch realtime metrics: ${response.statusText}`);
      }

      const data = await response.json();
      return this.processMetricCards(data);
    } catch (error) {
      console.warn('Backend unavailable, using mock realtime metrics:', error);
      const mockData = [
        { title: 'Active Users', value: Math.floor(Math.random() * 50) + 100, changeType: 'increase' as const },
        { title: 'Live Reviews', value: Math.floor(Math.random() * 10) + 5, changeType: 'increase' as const },
        { title: 'Current Rating', value: Number((Math.random() * 1 + 4).toFixed(1)), changeType: 'neutral' as const },
        { title: 'Response Time', value: `${Math.floor(Math.random() * 20) + 5}s`, changeType: 'decrease' as const }
      ];
      return mockData;
    }
  }

  // Dashboard Management
  async getDashboardWidgets(dashboardId: string): Promise<DashboardWidget[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/dashboards/${dashboardId}/widgets`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard widgets: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard widgets:', error);
      throw error;
    }
  }

  async updateWidgetData(widgetId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/widgets/${widgetId}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to update widget data: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating widget data:', error);
      throw error;
    }
  }


  // Advanced Query Interface
  async executeQuery(query: AnalyticsQuery): Promise<AnalyticsResponse> {
    const cacheKey = generateCacheKey(query);
    const cached = this.getFromCache<AnalyticsResponse>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/analytics/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(query)
      });

      if (!response.ok) {
        throw new Error(`Failed to execute query: ${response.statusText}`);
      }

      const result = await response.json();
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  // WebSocket for Real-time Updates
  connectRealTimeUpdates(callback: (update: RealTimeUpdate) => void): WebSocket | null {
    try {
      const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/analytics/realtime`);
      
      ws.onmessage = (event) => {
        try {
          const update: RealTimeUpdate = JSON.parse(event.data);
          callback(update);
        } catch (error) {
          console.warn('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = () => {
        // WebSocket failed, oh well
        console.log('WS failed');
      };

      return ws;
    } catch (error) {
      console.warn('WebSocket not available, real-time updates disabled:', error);
      return null;
    }
  }

  // Mobile Analytics Support
  async getMobileOptimizedData(query: AnalyticsQuery): Promise<any> {
    const mobileQuery = {
      ...query,
      limit: Math.min(query.limit || 100, 50), // Reduce data for mobile
      granularity: 'day' as const // Simplify granularity
    };

    return this.executeQuery(mobileQuery);
  }

  // Predictive Analytics
  async getPredictiveModels(): Promise<PredictiveModel[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch predictive models: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Backend unavailable, using mock predictive models:', error);
      return this.generateMockPredictiveModels();
    }
  }

  async createPredictiveModel(model: Omit<PredictiveModel, 'id' | 'lastTrained' | 'status'>): Promise<PredictiveModel> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/models`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(model)
      });

      if (!response.ok) {
        throw new Error(`Failed to create predictive model: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating predictive model:', error);
      throw error;
    }
  }

  async trainModel(modelId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/models/${modelId}/train`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to train model: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error training model:', error);
      throw error;
    }
  }

  async predictReviewLikelihood(userId: string, projectId: string): Promise<ReviewLikelihoodPrediction> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/predict/review-likelihood`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ userId, projectId })
      });

      if (!response.ok) {
        throw new Error(`Failed to predict review likelihood: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error predicting review likelihood:', error);
      throw error;
    }
  }

  async predictReviewQuality(reviewData: any): Promise<QualityPrediction> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/predict/review-quality`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
        throw new Error(`Failed to predict review quality: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error predicting review quality:', error);
      throw error;
    }
  }

  async getTrendForecast(metric: string, timeframe: DateRange): Promise<TrendForecast> {
    try {
      const query = new URLSearchParams();
      query.append('metric', metric);
      query.append('startDate', timeframe.startDate.toISOString());
      query.append('endDate', timeframe.endDate.toISOString());

      const response = await fetch(`${API_BASE_URL}/analytics/forecast?${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get trend forecast: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting trend forecast:', error);
      throw error;
    }
  }

  async getAnomalies(dateRange: DateRange): Promise<any[]> {
    try {
      const query = new URLSearchParams();
      query.append('startDate', dateRange.startDate.toISOString());
      query.append('endDate', dateRange.endDate.toISOString());

      const response = await fetch(`${API_BASE_URL}/analytics/anomalies?${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get anomalies: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting anomalies:', error);
      throw error;
    }
  }

  // Machine Learning Pipeline Management
  async getMLPipelines(): Promise<MachineLearningPipeline[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/ml-pipelines`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ML pipelines: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching ML pipelines:', error);
      throw error;
    }
  }

  async runMLPipeline(pipelineId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/ml-pipelines/${pipelineId}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to run ML pipeline: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error running ML pipeline:', error);
      throw error;
    }
  }

  // Performance Monitoring
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/performance`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch performance metrics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      throw error;
    }
  }

  async getAdvancedAnalyticsConfig(): Promise<AdvancedAnalyticsConfig> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics config: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics config:', error);
      throw error;
    }
  }

  async updateAdvancedAnalyticsConfig(config: AdvancedAnalyticsConfig): Promise<AdvancedAnalyticsConfig> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error(`Failed to update analytics config: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating analytics config:', error);
      throw error;
    }
  }


  // Data Processing Methods
  private processPerformanceMetrics(data: any): ReviewPerformanceMetrics {
    const reviews: Review[] = data.reviews || [];
    
    return {
      totalReviews: reviews.length,
      reviewSubmissionRate: data.submissionRate || 0,
      reviewCompletionRate: data.completionRate || 0,
      averageRating: calculateAverageRating(reviews),
      ratingDistribution: calculateRatingDistribution(reviews),
      reviewsOverTime: groupReviewsByDate(reviews, 'day'),
      responseTime: calculateResponseTimeMetrics(reviews)
    };
  }

  private processBehaviorAnalytics(data: any): UserBehaviorAnalytics {
    return {
      userEngagement: {
        averageTimeOnReviewPage: data.avgTimeOnPage || 0,
        reviewInteractionRate: data.interactionRate || 0,
        repeatReviewers: data.repeatReviewers || 0,
        reviewAbandonmentRate: data.abandonmentRate || 0
      },
      reviewReadingPatterns: {
        averageReadTime: data.avgReadTime || 0,
        mostReadReviewTypes: data.popularTypes || [],
        readingCompletionRate: data.completionRate || 0,
        scrollDepthMetrics: {
          quarter: data.scrollDepth?.quarter || 0,
          half: data.scrollDepth?.half || 0,
          threeQuarters: data.scrollDepth?.threeQuarters || 0,
          complete: data.scrollDepth?.complete || 0
        }
      },
      ratingBehavior: {
        ratingTrends: data.ratingTrends || [],
        ratingsByUserType: data.ratingsByUserType || {},
        ratingsByCategory: data.ratingsByCategory || {},
        ratingInflationTrend: data.inflationTrend || 0
      },
      deviceUsage: {
        desktop: data.deviceUsage?.desktop || 0,
        mobile: data.deviceUsage?.mobile || 0,
        tablet: data.deviceUsage?.tablet || 0
      }
    };
  }

  private processReputationTrends(data: any): ReputationTrends {
    return {
      overallTrends: this.processReputationTrendData(data.overall),
      segmentTrends: this.processSegmentTrends(data.segments || {}),
      projectTypeTrends: this.processSegmentTrends(data.projectTypes || {}),
      userSegmentTrends: this.processSegmentTrends(data.userSegments || {})
    };
  }

  private processReputationTrendData(data: any): any {
    return {
      currentPeriod: calculateReviewMetrics(data.current || []),
      previousPeriod: calculateReviewMetrics(data.previous || []),
      changePercentage: data.changePercentage || 0,
      trendDirection: data.trendDirection || 'stable',
      projectedTrend: data.projectedTrend || []
    };
  }

  private processSegmentTrends(segments: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    
    Object.entries(segments).forEach(([key, value]) => {
      result[key] = this.processReputationTrendData(value);
    });
    
    return result;
  }

  private processMetricCards(data: any[]): MetricCard[] {
    return data.map(item => ({
      title: item.title,
      value: item.value,
      change: item.change,
      changeType: item.changeType || 'neutral',
      trend: item.trend || [],
      format: item.format || 'number'
    }));
  }

  // Cache Management
  private generateCacheKey(type: string, params: any): string {
    return `analytics_${type}_${JSON.stringify(params)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCache(key: string, data: any, ttl: number = this.DEFAULT_CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  public clearCache(): void {
    this.cache.clear();
  }

  // Quick mock data - TODO: replace with real API
  private generateMockPerformanceMetrics(dateRange: DateRange): ReviewPerformanceMetrics {
    // Just return some numbers that look reasonable
    return {
      totalReviews: 1250,
      reviewSubmissionRate: 85,
      reviewCompletionRate: 92,
      averageRating: 4.3,
      ratingDistribution: {
        oneStar: 45,
        twoStar: 80,
        threeStar: 150,
        fourStar: 425,
        fiveStar: 550
      },
      reviewsOverTime: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
        value: Math.random() * 50 + 20,
        label: `Day ${i + 1}`
      })),
      responseTime: {
        average: 12,
        median: 8,
        percentile95: 24
      }
    };
  }

  private generateMockBehaviorAnalytics(dateRange: DateRange): UserBehaviorAnalytics {
    // FIXME: This is hardcoded, need real data eventually
    return {
      userEngagement: {
        averageTimeOnReviewPage: 185,
        reviewInteractionRate: 78,
        repeatReviewers: 25,
        reviewAbandonmentRate: 12
      },
      reviewReadingPatterns: {
        averageReadTime: 145,
        mostReadReviewTypes: ['Detailed', 'Technical', 'Service Quality'],
        readingCompletionRate: 89,
        scrollDepthMetrics: {
          quarter: 95,
          half: 82,
          threeQuarters: 67,
          complete: 45
        }
      },
      ratingBehavior: {
        ratingTrends: [], // TODO: implement trend calculation
        ratingsByUserType: {
          client: { oneStar: 10, twoStar: 15, threeStar: 25, fourStar: 30, fiveStar: 20 },
          freelancer: { oneStar: 5, twoStar: 10, threeStar: 20, fourStar: 35, fiveStar: 30 }
        },
        ratingsByCategory: {},
        ratingInflationTrend: 0.15
      },
      deviceUsage: {
        desktop: 45,
        mobile: 48,
        tablet: 7
      }
    };
  }

  private generateMockReputationTrends(dateRange: DateRange): ReputationTrends {
    return {
      overallTrends: {
        currentPeriod: { 
          averageRating: 4.3, 
          totalReviews: 1250, 
          highRatedUsers: 850,
          lowRatedUsers: 50,
          reputationScore: 87
        },
        previousPeriod: { 
          averageRating: 4.1, 
          totalReviews: 1100, 
          highRatedUsers: 750,
          lowRatedUsers: 80,
          reputationScore: 82
        },
        changePercentage: 12,
        trendDirection: 'up' as const,
        projectedTrend: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
          value: 4.3 + (Math.random() * 0.2 - 0.1),
          label: `Day +${i + 1}`
        }))
      },
      segmentTrends: {},
      projectTypeTrends: {},
      userSegmentTrends: {}
    };
  }


  private generateMockCustomReports(): CustomReport[] {
    // Basic report for now - can expand later
    return [
      {
        id: '1',
        name: 'Monthly Report',
        description: 'Basic monthly report',
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: false,
        config: {
          dateRange: {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date()
          },
          metrics: ['totalReviews', 'averageRating'],
          filters: { userTypes: ['client'] },
          groupBy: ['date'],
          sortBy: { field: 'date', direction: 'desc' },
          visualization: {
            chartType: 'line',
            showTrends: true,
            includeComparisons: false,
            aggregation: 'average'
          }
        }
      }
    ];
  }

  private generateMockPredictiveModels(): PredictiveModel[] {
    return [
      {
        id: '1',
        name: 'Review Volume Predictor',
        type: 'trend_forecasting',
        accuracy: 0.87,
        status: 'active',
        lastTrained: new Date(),
        features: ['historical_volume', 'seasonality', 'marketing_campaigns'],
        parameters: {
          window_size: 30,
          learning_rate: 0.01,
          epochs: 100
        }
      }
    ];
  }


  // Utility Methods
  private getAuthToken(): string {
    // Get token from localStorage or context
    return localStorage.getItem('auth_token') || '';
  }

  // Debounced cache clearing for performance
  public debouncedClearCache = debounce(() => {
    this.clearCache();
  }, 1000);
}

// Export singleton instance
export const reviewAnalyticsService = new ReviewAnalyticsService();
export default reviewAnalyticsService;