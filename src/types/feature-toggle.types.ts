// Feature Toggle Types
export interface FeatureToggle {
  id: string;
  key: string;
  name: string;
  description: string;
  category: FeatureCategory;
  type: FeatureType;
  status: FeatureStatus;
  environment: Environment;
  isActive: boolean;
  rolloutStrategy: RolloutStrategy;
  rolloutPercentage: number;
  targetAudience: TargetAudience;
  conditions: FeatureCondition[];
  dependencies: FeatureDependency[];
  metrics: FeatureMetrics;
  metadata: Record<string, unknown>;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  effectiveFrom?: Date;
  effectiveUntil?: Date;
  tags: string[];
  version: number;
}

export type FeatureCategory = 
  | 'ui'
  | 'backend'
  | 'api'
  | 'payment'
  | 'notification'
  | 'analytics'
  | 'security'
  | 'performance'
  | 'integration'
  | 'experimental'
  | 'beta'
  | 'maintenance';

export type FeatureType = 
  | 'boolean'
  | 'percentage'
  | 'gradual'
  | 'canary'
  | 'blue_green'
  | 'a_b_test'
  | 'multivariate'
  | 'experimental'
  | 'kill_switch';

export type FeatureStatus = 
  | 'draft'
  | 'development'
  | 'testing'
  | 'staging'
  | 'production'
  | 'deprecated'
  | 'archived';

export type Environment = 'development' | 'staging' | 'production' | 'testing';

export type RolloutStrategy = 
  | 'immediate'
  | 'gradual'
  | 'canary'
  | 'blue_green'
  | 'percentage'
  | 'user_based'
  | 'time_based'
  | 'geographic'
  | 'device_based';

// Feature Condition Types
export interface FeatureCondition {
  id: string;
  name: string;
  description: string;
  type: ConditionType;
  operator: ConditionOperator;
  value: unknown;
  field: string;
  isActive: boolean;
  weight: number;
  logicalOperator?: LogicalOperator;
  subConditions?: FeatureCondition[];
}

export type ConditionType = 
  | 'user_attribute'
  | 'user_group'
  | 'user_role'
  | 'user_segment'
  | 'geographic'
  | 'device_type'
  | 'browser'
  | 'operating_system'
  | 'time_based'
  | 'date_range'
  | 'custom_attribute'
  | 'experiment_group'
  | 'cohort'
  | 'risk_score';

export type ConditionOperator = 
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'in_list'
  | 'not_in_list'
  | 'regex_match'
  | 'exists'
  | 'not_exists'
  | 'is_null'
  | 'is_not_null';

export type LogicalOperator = 'AND' | 'OR' | 'NOT';

// Feature Dependency Types
export interface FeatureDependency {
  id: string;
  featureId: string;
  dependsOnFeatureId: string;
  type: DependencyType;
  condition: DependencyCondition;
  isRequired: boolean;
  message: string;
}

export type DependencyType = 
  | 'prerequisite'
  | 'conflict'
  | 'enhancement'
  | 'override'
  | 'fallback'
  | 'mutual_exclusion';

export type DependencyCondition = 
  | 'must_be_active'
  | 'must_be_inactive'
  | 'must_be_enabled'
  | 'must_be_disabled'
  | 'must_be_compatible'
  | 'must_not_conflict';

// Feature Target Audience Types
export interface TargetAudience {
  id: string;
  name: string;
  description: string;
  type: AudienceType;
  criteria: AudienceCriteria[];
  size: number;
  percentage: number;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AudienceType = 
  | 'all_users'
  | 'user_segment'
  | 'user_group'
  | 'user_role'
  | 'beta_users'
  | 'premium_users'
  | 'new_users'
  | 'returning_users'
  | 'geographic'
  | 'device_based'
  | 'custom';

export interface AudienceCriteria {
  field: string;
  operator: ConditionOperator;
  value: unknown;
  weight: number;
}

// Feature Metrics Types
export interface FeatureMetrics {
  id: string;
  featureId: string;
  metric: MetricType;
  value: number;
  baseline?: number;
  target?: number;
  threshold?: number;
  status: MetricStatus;
  timestamp: Date;
  environment: Environment;
  metadata?: Record<string, unknown>;
}

export type MetricType = 
  | 'adoption_rate'
  | 'usage_frequency'
  | 'user_satisfaction'
  | 'performance_impact'
  | 'error_rate'
  | 'conversion_rate'
  | 'retention_rate'
  | 'revenue_impact'
  | 'system_load'
  | 'memory_usage'
  | 'response_time'
  | 'bounce_rate'
  | 'engagement_rate'
  | 'feature_completion_rate';

export type MetricStatus = 'good' | 'warning' | 'critical' | 'unknown';

// Feature Toggle Evaluation Types
export interface FeatureEvaluation {
  id: string;
  featureId: string;
  userId: string;
  sessionId?: string;
  context: EvaluationContext;
  result: EvaluationResult;
  timestamp: Date;
  environment: Environment;
  metadata: Record<string, unknown>;
}

export interface EvaluationContext {
  userAgent?: string;
  ipAddress?: string;
  location?: string;
  device?: string;
  browser?: string;
  referrer?: string;
  userAttributes?: Record<string, unknown>;
  sessionData?: Record<string, unknown>;
  requestData?: Record<string, unknown>;
}

export interface EvaluationResult {
  enabled: boolean;
  variant?: string;
  reason: string;
  conditions?: string[];
  dependencies?: string[];
  rolloutPercentage?: number;
  evaluationTime: number;
}

// Feature Toggle History Types
export interface FeatureToggleHistory {
  id: string;
  featureId: string;
  changeType: ChangeType;
  previousValue?: unknown;
  newValue: unknown;
  reason?: string;
  changedBy: string;
  changedAt: Date;
  environment: Environment;
  metadata: Record<string, unknown>;
}

export type ChangeType = 
  | 'created'
  | 'updated'
  | 'activated'
  | 'deactivated'
  | 'rollout_changed'
  | 'audience_changed'
  | 'condition_added'
  | 'condition_removed'
  | 'dependency_added'
  | 'dependency_removed'
  | 'deleted';

// Feature Toggle Analytics Types
export interface FeatureToggleAnalytics {
  id: string;
  featureId: string;
  metric: AnalyticsMetric;
  value: number;
  timestamp: Date;
  environment: Environment;
  breakdown?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export type AnalyticsMetric = 
  | 'toggle_evaluations'
  | 'toggle_enabled_count'
  | 'toggle_disabled_count'
  | 'user_adoption'
  | 'performance_impact'
  | 'error_rate'
  | 'conversion_rate'
  | 'user_satisfaction'
  | 'system_performance'
  | 'rollout_progress';

// Feature Toggle Template Types
export interface FeatureToggleTemplate {
  id: string;
  name: string;
  description: string;
  category: FeatureCategory;
  type: FeatureType;
  template: FeatureToggleTemplateData;
  isPublic: boolean;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  usageCount: number;
}

export interface FeatureToggleTemplateData {
  conditions: Omit<FeatureCondition, 'id'>[];
  dependencies: Omit<FeatureDependency, 'id'>[];
  rolloutStrategy: RolloutStrategy;
  targetAudience: Omit<TargetAudience, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>;
  metadata: Record<string, unknown>;
}

// Feature Toggle Import/Export Types
export interface FeatureToggleExport {
  id: string;
  name: string;
  description: string;
  environment: Environment;
  featureToggles: FeatureToggle[];
  templates: FeatureToggleTemplate[];
  metadata: {
    exportedAt: Date;
    exportedBy: string;
    version: string;
    totalFeatures: number;
  };
}

export interface FeatureToggleImport {
  file: File;
  environment: Environment;
  overwriteExisting: boolean;
  validateBeforeImport: boolean;
  createBackup: boolean;
}

// Feature Toggle Search and Filter Types
export interface FeatureToggleFilters {
  category?: FeatureCategory;
  type?: FeatureType;
  status?: FeatureStatus;
  environment?: Environment;
  isActive?: boolean;
  rolloutStrategy?: RolloutStrategy;
  tags?: string[];
  createdBy?: string;
  updatedAfter?: Date;
  updatedBefore?: Date;
  search?: string;
}

export interface FeatureToggleSearchResult {
  featureToggles: FeatureToggle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: FeatureToggleFilters;
}

// Feature Toggle Bulk Operations
export interface FeatureToggleBulkOperation {
  id: string;
  type: BulkOperationType;
  featureToggles: string[];
  operation: BulkOperation;
  parameters: Record<string, unknown>;
  status: BulkOperationStatus;
  progress: number;
  results: BulkOperationResult[];
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
}

export type BulkOperationType = 'update' | 'delete' | 'export' | 'import' | 'activate' | 'deactivate' | 'rollout';
export type BulkOperation = 'set_status' | 'set_rollout_percentage' | 'set_audience' | 'add_condition' | 'remove_condition' | 'change_rollout_strategy';
export type BulkOperationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface BulkOperationResult {
  featureToggleId: string;
  success: boolean;
  message?: string;
  error?: string;
}

// Feature Toggle Validation Types
export interface FeatureToggleValidation {
  id: string;
  featureToggleId: string;
  validationType: ValidationType;
  status: ValidationStatus;
  message: string;
  details: Record<string, unknown>;
  timestamp: Date;
}

export type ValidationType = 
  | 'condition_validation'
  | 'dependency_validation'
  | 'audience_validation'
  | 'rollout_validation'
  | 'conflict_validation'
  | 'performance_validation'
  | 'security_validation';

export type ValidationStatus = 'valid' | 'invalid' | 'warning' | 'pending';

// Feature Toggle Audit Types
export interface FeatureToggleAudit {
  id: string;
  featureToggleId: string;
  action: AuditAction;
  details: Record<string, unknown>;
  userId: string;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  environment: Environment;
}

export type AuditAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'activate'
  | 'deactivate'
  | 'evaluate'
  | 'rollout'
  | 'rollback'
  | 'export'
  | 'import';

// Feature Toggle Performance Types
export interface FeatureTogglePerformance {
  id: string;
  featureToggleId: string;
  metric: PerformanceMetric;
  value: number;
  threshold?: number;
  status: PerformanceStatus;
  timestamp: Date;
  environment: Environment;
}

export type PerformanceMetric = 
  | 'evaluation_time'
  | 'memory_usage'
  | 'cpu_usage'
  | 'cache_hit_rate'
  | 'api_response_time'
  | 'database_query_time'
  | 'error_rate';

export type PerformanceStatus = 'good' | 'warning' | 'critical';

// Feature Toggle Error Types
export interface FeatureToggleError {
  id: string;
  featureToggleId: string;
  errorType: ErrorType;
  message: string;
  stack?: string;
  context: Record<string, unknown>;
  timestamp: Date;
  environment: Environment;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export type ErrorType = 
  | 'evaluation_error'
  | 'condition_error'
  | 'dependency_error'
  | 'validation_error'
  | 'performance_error'
  | 'integration_error'
  | 'unknown_error';

// Feature Toggle API Response Types
export interface FeatureToggleApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  metadata?: {
    timestamp: Date;
    requestId: string;
    version: string;
  };
}

export interface FeatureToggleListResponse {
  featureToggles: FeatureToggle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: FeatureToggleFilters;
}

// Feature Toggle Hook Types
export interface UseFeatureToggleOptions {
  environment?: Environment;
  category?: FeatureCategory;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onError?: (error: Error) => void;
  onUpdate?: (featureToggles: FeatureToggle[]) => void;
}

export interface UseFeatureToggleReturn {
  featureToggles: FeatureToggle[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createFeatureToggle: (featureToggle: Omit<FeatureToggle, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<void>;
  updateFeatureToggle: (id: string, updates: Partial<FeatureToggle>) => Promise<void>;
  deleteFeatureToggle: (id: string) => Promise<void>;
  activateFeatureToggle: (id: string) => Promise<void>;
  deactivateFeatureToggle: (id: string) => Promise<void>;
  evaluateFeatureToggle: (key: string, context: EvaluationContext) => Promise<EvaluationResult>;
  updateRolloutPercentage: (id: string, percentage: number) => Promise<void>;
  getFeatureToggleMetrics: (id: string, metric?: AnalyticsMetric, dateRange?: DateRange) => Promise<FeatureToggleAnalytics[]>;
}

// Feature Toggle Context Types
export interface FeatureToggleContextType {
  featureToggles: FeatureToggle[];
  evaluations: FeatureEvaluation[];
  loading: boolean;
  error: Error | null;
  environment: Environment;
  setEnvironment: (env: Environment) => void;
  refreshFeatureToggles: () => Promise<void>;
  createFeatureToggle: (featureToggle: Omit<FeatureToggle, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<void>;
  updateFeatureToggle: (id: string, updates: Partial<FeatureToggle>) => Promise<void>;
  deleteFeatureToggle: (id: string) => Promise<void>;
  getFeatureToggle: (key: string) => FeatureToggle | undefined;
  getFeatureTogglesByCategory: (category: FeatureCategory) => FeatureToggle[];
  getActiveFeatureToggles: () => FeatureToggle[];
  evaluateFeatureToggle: (key: string, context: EvaluationContext) => Promise<EvaluationResult>;
  isFeatureEnabled: (key: string, context?: EvaluationContext) => boolean;
  getFeatureVariant: (key: string, context?: EvaluationContext) => string | null;
}

// Feature Toggle Service Types
export interface FeatureToggleService {
  getFeatureToggles: (filters?: FeatureToggleFilters, page?: number, limit?: number) => Promise<FeatureToggleListResponse>;
  getFeatureToggle: (id: string) => Promise<FeatureToggle>;
  getFeatureToggleByKey: (key: string, environment?: Environment) => Promise<FeatureToggle>;
  createFeatureToggle: (featureToggle: Omit<FeatureToggle, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<FeatureToggle>;
  updateFeatureToggle: (id: string, updates: Partial<FeatureToggle>) => Promise<FeatureToggle>;
  deleteFeatureToggle: (id: string) => Promise<void>;
  activateFeatureToggle: (id: string) => Promise<void>;
  deactivateFeatureToggle: (id: string) => Promise<void>;
  evaluateFeatureToggle: (key: string, context: EvaluationContext) => Promise<EvaluationResult>;
  updateRolloutPercentage: (id: string, percentage: number) => Promise<void>;
  validateFeatureToggle: (featureToggle: FeatureToggle) => Promise<FeatureToggleValidation[]>;
  getFeatureToggleHistory: (id: string, page?: number, limit?: number) => Promise<FeatureToggleHistory[]>;
  getFeatureToggleAnalytics: (id: string, metric?: AnalyticsMetric, dateRange?: DateRange) => Promise<FeatureToggleAnalytics[]>;
  exportFeatureToggles: (filters?: FeatureToggleFilters) => Promise<FeatureToggleExport>;
  importFeatureToggles: (importData: FeatureToggleImport) => Promise<FeatureToggleImportResult>;
  createFeatureToggleTemplate: (template: Omit<FeatureToggleTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'usageCount'>) => Promise<FeatureToggleTemplate>;
  getFeatureToggleTemplates: (category?: FeatureCategory) => Promise<FeatureToggleTemplate[]>;
  bulkEvaluateFeatureToggles: (keys: string[], context: EvaluationContext) => Promise<Record<string, EvaluationResult>>;
}

export interface FeatureToggleImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: ImportError[];
  warnings: ImportWarning[];
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  code: string;
}

export interface ImportWarning {
  row: number;
  field: string;
  message: string;
  code: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}
