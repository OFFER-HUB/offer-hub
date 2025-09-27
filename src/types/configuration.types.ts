// System Configuration Types
export interface SystemConfiguration {
  id: string;
  category: ConfigurationCategory;
  key: string;
  value: ConfigurationValue;
  description: string;
  dataType: ConfigurationDataType;
  isEditable: boolean;
  isRequired: boolean;
  defaultValue?: ConfigurationValue;
  validationRules?: ValidationRule[];
  environment: Environment;
  updatedBy: string;
  updatedAt: Date;
  createdAt: Date;
  version: number;
  tags?: string[];
  dependencies?: ConfigurationDependency[];
}

export type ConfigurationCategory = 
  | 'general' 
  | 'security' 
  | 'payments' 
  | 'features' 
  | 'notifications'
  | 'ui'
  | 'performance'
  | 'integration'
  | 'analytics'
  | 'maintenance';

export type ConfigurationDataType = 'string' | 'number' | 'boolean' | 'json' | 'array' | 'object';

export type ConfigurationValue = string | number | boolean | Record<string, unknown> | unknown[];

export type Environment = 'development' | 'staging' | 'production' | 'testing';

export interface ValidationRule {
  id: string;
  type: ValidationType;
  value?: unknown;
  message: string;
  isActive: boolean;
}

export type ValidationType = 
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'minValue'
  | 'maxValue'
  | 'pattern'
  | 'email'
  | 'url'
  | 'uuid'
  | 'json'
  | 'array'
  | 'object'
  | 'custom';

export interface ConfigurationDependency {
  id: string;
  configurationKey: string;
  condition: DependencyCondition;
  message: string;
}

export type DependencyCondition = 
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'lessThan'
  | 'contains'
  | 'exists'
  | 'notExists';

// Configuration Change Types
export interface ConfigurationChange {
  id: string;
  configurationId: string;
  previousValue: ConfigurationValue;
  newValue: ConfigurationValue;
  changeType: ChangeType;
  reason?: string;
  approvedBy?: string;
  approvedAt?: Date;
  status: ChangeStatus;
  impact: ChangeImpact;
  createdBy: string;
  createdAt: Date;
  appliedAt?: Date;
  rolledBackAt?: Date;
  rollbackReason?: string;
}

export type ChangeType = 'create' | 'update' | 'delete' | 'rollback';
export type ChangeStatus = 'pending' | 'approved' | 'applied' | 'failed' | 'rolled_back';
export type ChangeImpact = 'low' | 'medium' | 'high' | 'critical';

// Configuration History Types
export interface ConfigurationHistory {
  id: string;
  configurationId: string;
  changeId: string;
  version: number;
  value: ConfigurationValue;
  metadata: Record<string, unknown>;
  createdAt: Date;
  createdBy: string;
}

// Configuration Analytics Types
export interface ConfigurationAnalytics {
  id: string;
  configurationId: string;
  metric: AnalyticsMetric;
  value: number;
  timestamp: Date;
  environment: Environment;
  metadata?: Record<string, unknown>;
}

export type AnalyticsMetric = 
  | 'usage_count'
  | 'error_rate'
  | 'performance_impact'
  | 'user_satisfaction'
  | 'system_load'
  | 'memory_usage'
  | 'response_time';

// Configuration Template Types
export interface ConfigurationTemplate {
  id: string;
  name: string;
  description: string;
  category: ConfigurationCategory;
  configurations: ConfigurationTemplateItem[];
  environment: Environment;
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface ConfigurationTemplateItem {
  key: string;
  value: ConfigurationValue;
  description: string;
  dataType: ConfigurationDataType;
  isRequired: boolean;
  validationRules?: ValidationRule[];
}

// Configuration Import/Export Types
export interface ConfigurationExport {
  id: string;
  name: string;
  description: string;
  environment: Environment;
  configurations: SystemConfiguration[];
  templates: ConfigurationTemplate[];
  metadata: {
    exportedAt: Date;
    exportedBy: string;
    version: string;
    totalConfigurations: number;
  };
}

export interface ConfigurationImport {
  file: File;
  environment: Environment;
  overwriteExisting: boolean;
  validateBeforeImport: boolean;
  createBackup: boolean;
}

// Configuration Search and Filter Types
export interface ConfigurationFilters {
  category?: ConfigurationCategory;
  environment?: Environment;
  dataType?: ConfigurationDataType;
  isEditable?: boolean;
  isRequired?: boolean;
  tags?: string[];
  updatedBy?: string;
  updatedAfter?: Date;
  updatedBefore?: Date;
  search?: string;
}

export interface ConfigurationSearchResult {
  configurations: SystemConfiguration[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: ConfigurationFilters;
}

// Configuration Bulk Operations
export interface ConfigurationBulkOperation {
  id: string;
  type: BulkOperationType;
  configurations: string[];
  operation: BulkOperation;
  parameters: Record<string, unknown>;
  status: BulkOperationStatus;
  progress: number;
  results: BulkOperationResult[];
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
}

export type BulkOperationType = 'update' | 'delete' | 'export' | 'import' | 'validate';
export type BulkOperation = 'set_value' | 'toggle_editable' | 'add_tag' | 'remove_tag' | 'change_category';
export type BulkOperationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface BulkOperationResult {
  configurationId: string;
  success: boolean;
  message?: string;
  error?: string;
}

// Configuration Validation Types
export interface ConfigurationValidation {
  id: string;
  configurationId: string;
  validationRuleId: string;
  status: ValidationStatus;
  message: string;
  value: unknown;
  timestamp: Date;
}

export type ValidationStatus = 'valid' | 'invalid' | 'warning' | 'pending';

// Configuration Backup Types
export interface ConfigurationBackup {
  id: string;
  name: string;
  description: string;
  environment: Environment;
  configurations: SystemConfiguration[];
  createdAt: Date;
  createdBy: string;
  size: number;
  checksum: string;
  isEncrypted: boolean;
}

// Configuration Audit Types
export interface ConfigurationAudit {
  id: string;
  configurationId: string;
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
  | 'export'
  | 'import'
  | 'backup'
  | 'restore'
  | 'validate'
  | 'rollback';

// Configuration Performance Types
export interface ConfigurationPerformance {
  id: string;
  configurationId: string;
  metric: PerformanceMetric;
  value: number;
  threshold?: number;
  status: PerformanceStatus;
  timestamp: Date;
  environment: Environment;
}

export type PerformanceMetric = 
  | 'load_time'
  | 'memory_usage'
  | 'cpu_usage'
  | 'database_queries'
  | 'cache_hit_rate'
  | 'error_rate';

export type PerformanceStatus = 'good' | 'warning' | 'critical';

// Configuration Error Types
export interface ConfigurationError {
  id: string;
  configurationId: string;
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
  | 'validation_error'
  | 'dependency_error'
  | 'performance_error'
  | 'security_error'
  | 'integration_error'
  | 'unknown_error';

// Configuration API Response Types
export interface ConfigurationApiResponse<T = unknown> {
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

export interface ConfigurationListResponse {
  configurations: SystemConfiguration[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: ConfigurationFilters;
}

// Configuration Hook Types
export interface UseConfigurationOptions {
  environment?: Environment;
  category?: ConfigurationCategory;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onError?: (error: Error) => void;
  onUpdate?: (configurations: SystemConfiguration[]) => void;
}

export interface UseConfigurationReturn {
  configurations: SystemConfiguration[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateConfiguration: (id: string, value: ConfigurationValue) => Promise<void>;
  createConfiguration: (config: Omit<SystemConfiguration, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<void>;
  deleteConfiguration: (id: string) => Promise<void>;
  validateConfiguration: (id: string, value: ConfigurationValue) => Promise<ValidationResult>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

// Configuration Context Types
export interface ConfigurationContextType {
  configurations: SystemConfiguration[];
  loading: boolean;
  error: Error | null;
  environment: Environment;
  setEnvironment: (env: Environment) => void;
  refreshConfigurations: () => Promise<void>;
  updateConfiguration: (id: string, value: ConfigurationValue) => Promise<void>;
  createConfiguration: (config: Omit<SystemConfiguration, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<void>;
  deleteConfiguration: (id: string) => Promise<void>;
  getConfiguration: (key: string, category?: ConfigurationCategory) => SystemConfiguration | undefined;
  getConfigurationValue: <T = ConfigurationValue>(key: string, category?: ConfigurationCategory) => T | undefined;
}

// Configuration Service Types
export interface ConfigurationService {
  getConfigurations: (filters?: ConfigurationFilters, page?: number, limit?: number) => Promise<ConfigurationListResponse>;
  getConfiguration: (id: string) => Promise<SystemConfiguration>;
  createConfiguration: (config: Omit<SystemConfiguration, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<SystemConfiguration>;
  updateConfiguration: (id: string, updates: Partial<SystemConfiguration>) => Promise<SystemConfiguration>;
  deleteConfiguration: (id: string) => Promise<void>;
  validateConfiguration: (id: string, value: ConfigurationValue) => Promise<ValidationResult>;
  getConfigurationHistory: (id: string, page?: number, limit?: number) => Promise<ConfigurationHistory[]>;
  rollbackConfiguration: (id: string, version: number) => Promise<void>;
  exportConfigurations: (filters?: ConfigurationFilters) => Promise<ConfigurationExport>;
  importConfigurations: (importData: ConfigurationImport) => Promise<ConfigurationImportResult>;
  getConfigurationAnalytics: (id: string, metric?: AnalyticsMetric, dateRange?: DateRange) => Promise<ConfigurationAnalytics[]>;
  createConfigurationBackup: (name: string, description: string) => Promise<ConfigurationBackup>;
  restoreConfigurationBackup: (backupId: string) => Promise<void>;
}

export interface ConfigurationImportResult {
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
