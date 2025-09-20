export interface DisputeAnalytics {
  id: string;
  disputeId: string;
  createdAt: Date;
  resolvedAt?: Date;
  status: DisputeStatus;
  type: DisputeType;
  category: DisputeCategory;
  priority: DisputePriority;
  resolutionTime?: number;
  userSatisfactionScore?: number;
  escalationLevel: number;
  assignedTo?: string;
  tags: string[];
}

export interface PerformanceMetrics {
  totalDisputes: number;
  resolvedDisputes: number;
  pendingDisputes: number;
  averageResolutionTime: number;
  resolutionRate: number;
  userSatisfactionRate: number;
  escalationRate: number;
  recurringDisputeRate: number;
}

export interface TrendData {
  period: string;
  value: number;
  change: number;
  changePercentage: number;
}

export interface DisputePattern {
  type: string;
  frequency: number;
  averageResolutionTime: number;
  successRate: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface PredictiveModel {
  riskScore: number;
  likelihood: number;
  factors: PredictionFactor[];
  confidence: number;
  recommendations: string[];
}

export interface PredictionFactor {
  name: string;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface AnalyticsFilter {
  dateRange: DateRange;
  status?: DisputeStatus[];
  type?: DisputeType[];
  category?: DisputeCategory[];
  priority?: DisputePriority[];
  assignedTo?: string[];
  tags?: string[];
  userType?: 'client' | 'freelancer';
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface CustomReport {
  id: string;
  name: string;
  description: string;
  filters: AnalyticsFilter;
  metrics: ReportMetric[];
  visualizations: VisualizationType[];
  schedule?: ReportSchedule;
  createdBy: string;
  createdAt: Date;
  lastGenerated?: Date;
}

export interface ReportMetric {
  id: string;
  name: string;
  type: MetricType;
  calculation: CalculationType;
  format: DisplayFormat;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string;
  recipients: string[];
  enabled: boolean;
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  layout: WidgetLayout[];
  isDefault: boolean;
  userId: string;
  lastUpdated: Date;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  data: any;
  config: WidgetConfig;
  position: WidgetPosition;
}

export interface WidgetConfig {
  refreshInterval?: number;
  filters?: AnalyticsFilter;
  displayOptions?: DisplayOptions;
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WidgetLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
}

export interface DisplayOptions {
  showLegend?: boolean;
  showTooltip?: boolean;
  colorScheme?: string;
  animation?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export interface ExportOptions {
  format: ExportFormat;
  includeCharts: boolean;
  includeData: boolean;
  dateRange?: DateRange;
  filters?: AnalyticsFilter;
}

export interface AnalyticsError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export interface AnalyticsState {
  isLoading: boolean;
  error?: AnalyticsError;
  lastUpdated?: Date;
  cache?: Map<string, any>;
}

export enum DisputeStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  INVESTIGATING = 'investigating',
  AWAITING_RESPONSE = 'awaiting_response',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  ESCALATED = 'escalated'
}

export enum DisputeType {
  PAYMENT = 'payment',
  QUALITY = 'quality',
  DELIVERY = 'delivery',
  COMMUNICATION = 'communication',
  SCOPE = 'scope',
  REFUND = 'refund',
  OTHER = 'other'
}

export enum DisputeCategory {
  TECHNICAL = 'technical',
  COMMERCIAL = 'commercial',
  BEHAVIORAL = 'behavioral',
  PROCEDURAL = 'procedural'
}

export enum DisputePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum MetricType {
  COUNT = 'count',
  PERCENTAGE = 'percentage',
  AVERAGE = 'average',
  SUM = 'sum',
  RATIO = 'ratio',
  TREND = 'trend'
}

export enum CalculationType {
  SUM = 'sum',
  AVERAGE = 'average',
  COUNT = 'count',
  PERCENTAGE = 'percentage',
  GROWTH_RATE = 'growth_rate',
  MOVING_AVERAGE = 'moving_average'
}

export enum DisplayFormat {
  NUMBER = 'number',
  PERCENTAGE = 'percentage',
  CURRENCY = 'currency',
  DURATION = 'duration',
  DATE = 'date'
}

export enum VisualizationType {
  LINE_CHART = 'line_chart',
  BAR_CHART = 'bar_chart',
  PIE_CHART = 'pie_chart',
  DONUT_CHART = 'donut_chart',
  AREA_CHART = 'area_chart',
  SCATTER_PLOT = 'scatter_plot',
  HEATMAP = 'heatmap',
  GAUGE = 'gauge',
  TABLE = 'table',
  METRIC_CARD = 'metric_card'
}

export enum WidgetType {
  METRIC = 'metric',
  CHART = 'chart',
  TABLE = 'table',
  LIST = 'list',
  PROGRESS = 'progress',
  STATUS = 'status'
}

export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
  PNG = 'png'
}

export interface AnalyticsAPIResponse<T = any> {
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
  timestamp: Date;
}

export interface ChartData {
  name: string;
  value: number;
  percentage?: number;
  color?: string;
  trend?: number;
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  label?: string;
}

export interface SegmentData {
  segment: string;
  value: number;
  percentage: number;
  trend: number;
}