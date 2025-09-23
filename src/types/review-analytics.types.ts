// Analytics types

import { Review } from './review.types';

// Base Analytics Types
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface MetricCard {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  trend?: TimeSeriesDataPoint[];
  format?: 'number' | 'percentage' | 'currency' | 'duration';
}

// Review Performance Metrics
export interface ReviewPerformanceMetrics {
  totalReviews: number;
  reviewSubmissionRate: number;
  reviewCompletionRate: number;
  averageRating: number;
  ratingDistribution: RatingDistribution;
  reviewsOverTime: TimeSeriesDataPoint[];
  responseTime: {
    average: number;
    median: number;
    percentile95: number;
  };
}

export interface RatingDistribution {
  oneStar: number;
  twoStar: number;
  threeStar: number;
  fourStar: number;
  fiveStar: number;
}

// User Behavior Analytics
export interface UserBehaviorAnalytics {
  userEngagement: UserEngagementMetrics;
  reviewReadingPatterns: ReviewReadingPatterns;
  ratingBehavior: RatingBehaviorMetrics;
  deviceUsage: DeviceUsageMetrics;
}

export interface UserEngagementMetrics {
  averageTimeOnReviewPage: number;
  reviewInteractionRate: number;
  repeatReviewers: number;
  reviewAbandonmentRate: number;
}

export interface ReviewReadingPatterns {
  averageReadTime: number;
  mostReadReviewTypes: string[];
  readingCompletionRate: number;
  scrollDepthMetrics: ScrollDepthMetrics;
}

export interface ScrollDepthMetrics {
  quarter: number;
  half: number;
  threeQuarters: number;
  complete: number;
}

export interface RatingBehaviorMetrics {
  ratingTrends: TimeSeriesDataPoint[];
  ratingsByUserType: Record<string, RatingDistribution>;
  ratingsByCategory: Record<string, RatingDistribution>;
  ratingInflationTrend: number;
}

export interface DeviceUsageMetrics {
  desktop: number;
  mobile: number;
  tablet: number;
}

// Reputation Trends
export interface ReputationTrends {
  overallTrends: ReputationTrendData;
  segmentTrends: Record<string, ReputationTrendData>;
  projectTypeTrends: Record<string, ReputationTrendData>;
  userSegmentTrends: Record<string, ReputationTrendData>;
}

export interface ReputationTrendData {
  currentPeriod: ReputationMetrics;
  previousPeriod: ReputationMetrics;
  changePercentage: number;
  trendDirection: 'up' | 'down' | 'stable';
  projectedTrend: TimeSeriesDataPoint[];
}

export interface ReputationMetrics {
  averageRating: number;
  totalReviews: number;
  highRatedUsers: number;
  lowRatedUsers: number;
  reputationScore: number;
}

// Custom Reports
export interface CustomReport {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  config: ReportConfig;
  lastRunAt?: Date;
  schedule?: ReportSchedule;
}

export interface ReportConfig {
  dateRange: DateRange;
  metrics: string[];
  filters: ReportFilters;
  groupBy: string[];
  sortBy: SortConfig;
  visualization: VisualizationConfig;
}

export interface ReportFilters {
  userTypes?: string[];
  projectCategories?: string[];
  ratingRange?: [number, number];
  reviewLength?: 'short' | 'medium' | 'long' | 'all';
  userSegments?: string[];
  deviceTypes?: string[];
  customFilters?: Record<string, any>;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface VisualizationConfig {
  chartType: ChartType;
  showTrends: boolean;
  includeComparisons: boolean;
  aggregation: 'sum' | 'average' | 'count' | 'median';
}

export type ChartType = 
  | 'line' 
  | 'bar' 
  | 'pie' 
  | 'area' 
  | 'scatter' 
  | 'heatmap' 
  | 'funnel' 
  | 'gauge';

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  format: 'pdf' | 'csv' | 'excel' | 'json';
  isActive: boolean;
}

// Dashboard Types
export interface DashboardConfig {
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: GlobalFilters;
  refreshInterval: number;
  theme: 'light' | 'dark' | 'auto';
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  gaps: number;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  config: WidgetConfig;
  data?: any;
  loading?: boolean;
  error?: string;
}

export type WidgetType = 
  | 'metric-card' 
  | 'chart' 
  | 'table' 
  | 'heatmap' 
  | 'progress' 
  | 'trend' 
  | 'comparison';

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface WidgetConfig {
  metric?: string;
  chartType?: ChartType;
  dataSource: string;
  filters?: Record<string, any>;
  refreshInterval?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  colors?: string[];
}

export interface GlobalFilters {
  dateRange: DateRange;
  userTypes: string[];
  projectCategories: string[];
  regions: string[];
}

// Data Visualization Types
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

// Advanced Chart Controls
export interface ChartAnnotation {
  type: 'line' | 'area' | 'point' | 'text';
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  value: number | string;
  label?: string;
  color?: string;
  style?: React.CSSProperties;
}

export interface ChartThreshold {
  value: number;
  label: string;
  color: string;
  lineStyle: 'solid' | 'dashed' | 'dotted';
}

export interface ChartZoomConfig {
  enabled: boolean;
  type: 'x' | 'y' | 'xy';
  rangeX?: [number, number];
  rangeY?: [number, number];
}

export interface ChartBrushConfig {
  enabled: boolean;
  height: number;
  startIndex?: number;
  endIndex?: number;
}

export interface ChartInteractionConfig {
  enableClick: boolean;
  enableHover: boolean;
  enableSelection: boolean;
  enableCrosshair: boolean;
  clickHandler?: (data: any, index: number) => void;
  hoverHandler?: (data: any, index: number) => void;
  selectionHandler?: (selection: any[]) => void;
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: LegendConfig;
    tooltip: TooltipConfig;
    title?: TitleConfig;
  };
  scales?: ScalesConfig;
}

export interface LegendConfig {
  display: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface TooltipConfig {
  enabled: boolean;
  mode: 'index' | 'dataset' | 'point' | 'nearest';
  intersect: boolean;
}

export interface TitleConfig {
  display: boolean;
  text: string;
}

export interface ScalesConfig {
  x?: AxisConfig;
  y?: AxisConfig;
}

export interface AxisConfig {
  display: boolean;
  title?: {
    display: boolean;
    text: string;
  };
  grid?: {
    display: boolean;
  };
}

// Export Types
export interface ExportConfig {
  format: ExportFormat;
  filename?: string;
  includeCharts: boolean;
  includeRawData: boolean;
  compression?: boolean;
}

export type ExportFormat = 'pdf' | 'csv' | 'excel' | 'json' | 'png' | 'svg';

export interface ExportResult {
  success: boolean;
  url?: string;
  filename?: string;
  size?: number;
  error?: string;
}


// Real-time Updates
export interface RealTimeUpdate {
  type: UpdateType;
  data: any;
  timestamp: Date;
}

export type UpdateType = 
  | 'new-review' 
  | 'metric-update' 
  | 'trend-change' 
  | 'alert' 
  | 'system-status';

// Analytics API Types
export interface AnalyticsQuery {
  metrics: string[];
  dimensions: string[];
  filters: QueryFilter[];
  dateRange: DateRange;
  granularity: 'hour' | 'day' | 'week' | 'month';
  limit?: number;
  offset?: number;
}

export interface QueryFilter {
  field: string;
  operator: FilterOperator;
  value: any;
}

export type FilterOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'greater_than' 
  | 'less_than' 
  | 'in' 
  | 'not_in' 
  | 'contains' 
  | 'starts_with' 
  | 'ends_with';

export interface AnalyticsResponse {
  data: any[];
  metadata: {
    totalCount: number;
    queryTime: number;
    cached: boolean;
    lastUpdated: Date;
  };
}

// Mobile Analytics
export interface MobileAnalyticsConfig {
  offlineMode: boolean;
  syncInterval: number;
  compressionLevel: number;
  maxCacheSize: number;
}

export interface MobileMetrics {
  loadTime: number;
  renderTime: number;
  interactionLatency: number;
  crashRate: number;
  memoryUsage: number;
}

// Security and Privacy
export interface AnalyticsAuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  result: 'success' | 'failure';
  details?: Record<string, any>;
}

export interface DataPrivacyConfig {
  anonymizePersonalData: boolean;
  retentionPeriod: number;
  allowDataExport: boolean;
  requireConsent: boolean;
  maskSensitiveFields: string[];
}

// Predictive Analytics
export interface PredictiveModel {
  id: string;
  name: string;
  type: 'review_likelihood' | 'quality_prediction' | 'sentiment_analysis' | 'trend_forecasting';
  accuracy: number;
  lastTrained: Date;
  features: string[];
  parameters: Record<string, any>;
  status: 'active' | 'training' | 'inactive';
}

export interface PredictionResult {
  modelId: string;
  prediction: number | string;
  confidence: number;
  factors: PredictionFactor[];
  timestamp: Date;
}

export interface PredictionFactor {
  feature: string;
  impact: number;
  description: string;
}

export interface ReviewLikelihoodPrediction extends PredictionResult {
  userId: string;
  projectId: string;
  likelihood: number;
  suggestedActions: string[];
}

export interface QualityPrediction extends PredictionResult {
  reviewId?: string;
  expectedRating: number;
  qualityScore: number;
  riskFactors: string[];
}

export interface TrendForecast {
  metric: string;
  timeframe: DateRange;
  predictions: TimeSeriesDataPoint[];
  confidenceInterval: {
    upper: TimeSeriesDataPoint[];
    lower: TimeSeriesDataPoint[];
  };
  seasonality: SeasonalPattern[];
  anomalies: AnomalyDetection[];
}

export interface SeasonalPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  strength: number;
  peaks: number[];
  troughs: number[];
}

export interface AnomalyDetection {
  timestamp: Date;
  value: number;
  expectedValue: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

// Advanced Analytics
export interface AdvancedAnalyticsConfig {
  enablePredictiveModels: boolean;
  enableAnomalyDetection: boolean;
  enableSentimentAnalysis: boolean;
  enableTrendForecasting: boolean;
  modelRefreshInterval: number;
  predictionHorizon: number;
}

export interface MachineLearningPipeline {
  id: string;
  name: string;
  stages: MLPipelineStage[];
  schedule: string;
  lastRun: Date;
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  metrics: MLMetrics;
}

export interface MLPipelineStage {
  id: string;
  name: string;
  type: 'data_ingestion' | 'preprocessing' | 'feature_engineering' | 'model_training' | 'evaluation' | 'deployment';
  config: Record<string, any>;
  duration?: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface MLMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingLoss: number;
  validationLoss: number;
  convergenceRate: number;
}

// Performance Optimization
export interface CacheConfig {
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'fifo' | 'lfu';
  compression: boolean;
}

export interface PerformanceMetrics {
  queryLatency: number;
  cacheHitRate: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  throughput: number;
  errorRate: number;
}

// Error Handling
export interface AnalyticsError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  recoverable: boolean;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}