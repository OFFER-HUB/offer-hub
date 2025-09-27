import { z } from 'zod';

// Configuration Data Types
export const ConfigurationDataTypeSchema = z.enum([
  'string',
  'number',
  'boolean',
  'json',
  'array',
  'object'
]);

export const ConfigurationCategorySchema = z.enum([
  'general',
  'security',
  'payments',
  'features',
  'notifications',
  'ui',
  'performance',
  'integration',
  'analytics',
  'maintenance'
]);

export const EnvironmentSchema = z.enum([
  'development',
  'staging',
  'production',
  'testing'
]);

export const ValidationTypeSchema = z.enum([
  'required',
  'minLength',
  'maxLength',
  'minValue',
  'maxValue',
  'pattern',
  'email',
  'url',
  'uuid',
  'json',
  'array',
  'object',
  'custom'
]);

export const DependencyConditionSchema = z.enum([
  'equals',
  'notEquals',
  'greaterThan',
  'lessThan',
  'contains',
  'exists',
  'notExists'
]);

export const ChangeTypeSchema = z.enum([
  'create',
  'update',
  'delete',
  'rollback'
]);

export const ChangeStatusSchema = z.enum([
  'pending',
  'approved',
  'applied',
  'failed',
  'rolled_back'
]);

export const ChangeImpactSchema = z.enum([
  'low',
  'medium',
  'high',
  'critical'
]);

export const AnalyticsMetricSchema = z.enum([
  'usage_count',
  'error_rate',
  'performance_impact',
  'user_satisfaction',
  'system_load',
  'memory_usage',
  'response_time'
]);

export const BulkOperationTypeSchema = z.enum([
  'update',
  'delete',
  'export',
  'import',
  'validate'
]);

export const BulkOperationSchema = z.enum([
  'set_value',
  'toggle_editable',
  'add_tag',
  'remove_tag',
  'change_category'
]);

export const BulkOperationStatusSchema = z.enum([
  'pending',
  'running',
  'completed',
  'failed',
  'cancelled'
]);

export const ValidationStatusSchema = z.enum([
  'valid',
  'invalid',
  'warning',
  'pending'
]);

export const AuditActionSchema = z.enum([
  'create',
  'read',
  'update',
  'delete',
  'export',
  'import',
  'backup',
  'restore',
  'validate',
  'rollback'
]);

export const PerformanceMetricSchema = z.enum([
  'load_time',
  'memory_usage',
  'cpu_usage',
  'database_queries',
  'cache_hit_rate',
  'error_rate'
]);

export const PerformanceStatusSchema = z.enum([
  'good',
  'warning',
  'critical'
]);

export const ErrorTypeSchema = z.enum([
  'validation_error',
  'dependency_error',
  'performance_error',
  'security_error',
  'integration_error',
  'unknown_error'
]);

// Validation Rule Schema
export const ValidationRuleSchema = z.object({
  id: z.string().uuid(),
  type: ValidationTypeSchema,
  value: z.unknown().optional(),
  message: z.string().min(1).max(500),
  isActive: z.boolean().default(true)
});

// Configuration Dependency Schema
export const ConfigurationDependencySchema = z.object({
  id: z.string().uuid(),
  configurationKey: z.string().min(1).max(100),
  condition: DependencyConditionSchema,
  message: z.string().min(1).max(500)
});

// System Configuration Schema
export const SystemConfigurationSchema = z.object({
  id: z.string().uuid(),
  category: ConfigurationCategorySchema,
  key: z.string().min(1).max(100).regex(/^[a-zA-Z0-9._-]+$/, 'Key must contain only alphanumeric characters, dots, underscores, and hyphens'),
  value: z.unknown(),
  description: z.string().min(1).max(1000),
  dataType: ConfigurationDataTypeSchema,
  isEditable: z.boolean().default(true),
  isRequired: z.boolean().default(false),
  defaultValue: z.unknown().optional(),
  validationRules: z.array(ValidationRuleSchema).optional(),
  environment: EnvironmentSchema,
  updatedBy: z.string().email(),
  updatedAt: z.date(),
  createdAt: z.date(),
  version: z.number().int().positive(),
  tags: z.array(z.string().min(1).max(50)).optional(),
  dependencies: z.array(ConfigurationDependencySchema).optional()
});

// Configuration Change Schema
export const ConfigurationChangeSchema = z.object({
  id: z.string().uuid(),
  configurationId: z.string().uuid(),
  previousValue: z.unknown(),
  newValue: z.unknown(),
  changeType: ChangeTypeSchema,
  reason: z.string().max(1000).optional(),
  approvedBy: z.string().email().optional(),
  approvedAt: z.date().optional(),
  status: ChangeStatusSchema,
  impact: ChangeImpactSchema,
  createdBy: z.string().email(),
  createdAt: z.date(),
  appliedAt: z.date().optional(),
  rolledBackAt: z.date().optional(),
  rollbackReason: z.string().max(1000).optional()
});

// Configuration History Schema
export const ConfigurationHistorySchema = z.object({
  id: z.string().uuid(),
  configurationId: z.string().uuid(),
  changeId: z.string().uuid(),
  version: z.number().int().positive(),
  value: z.unknown(),
  metadata: z.record(z.unknown()),
  createdAt: z.date(),
  createdBy: z.string().email()
});

// Configuration Analytics Schema
export const ConfigurationAnalyticsSchema = z.object({
  id: z.string().uuid(),
  configurationId: z.string().uuid(),
  metric: AnalyticsMetricSchema,
  value: z.number(),
  timestamp: z.date(),
  environment: EnvironmentSchema,
  metadata: z.record(z.unknown()).optional()
});

// Configuration Template Item Schema
export const ConfigurationTemplateItemSchema = z.object({
  key: z.string().min(1).max(100).regex(/^[a-zA-Z0-9._-]+$/),
  value: z.unknown(),
  description: z.string().min(1).max(1000),
  dataType: ConfigurationDataTypeSchema,
  isRequired: z.boolean().default(false),
  validationRules: z.array(ValidationRuleSchema).optional()
});

// Configuration Template Schema
export const ConfigurationTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  category: ConfigurationCategorySchema,
  configurations: z.array(ConfigurationTemplateItemSchema),
  environment: EnvironmentSchema,
  isDefault: z.boolean().default(false),
  createdBy: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.number().int().positive()
});

// Configuration Export Schema
export const ConfigurationExportSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  environment: EnvironmentSchema,
  configurations: z.array(SystemConfigurationSchema),
  templates: z.array(ConfigurationTemplateSchema),
  metadata: z.object({
    exportedAt: z.date(),
    exportedBy: z.string().email(),
    version: z.string(),
    totalConfigurations: z.number().int().positive()
  })
});

// Configuration Import Schema
export const ConfigurationImportSchema = z.object({
  file: z.instanceof(File),
  environment: EnvironmentSchema,
  overwriteExisting: z.boolean().default(false),
  validateBeforeImport: z.boolean().default(true),
  createBackup: z.boolean().default(true)
});

// Configuration Filters Schema
export const ConfigurationFiltersSchema = z.object({
  category: ConfigurationCategorySchema.optional(),
  environment: EnvironmentSchema.optional(),
  dataType: ConfigurationDataTypeSchema.optional(),
  isEditable: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  updatedBy: z.string().email().optional(),
  updatedAfter: z.date().optional(),
  updatedBefore: z.date().optional(),
  search: z.string().max(100).optional()
});

// Configuration Search Result Schema
export const ConfigurationSearchResultSchema = z.object({
  configurations: z.array(SystemConfigurationSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
  filters: ConfigurationFiltersSchema
});

// Bulk Operation Result Schema
export const BulkOperationResultSchema = z.object({
  configurationId: z.string().uuid(),
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional()
});

// Configuration Bulk Operation Schema
export const ConfigurationBulkOperationSchema = z.object({
  id: z.string().uuid(),
  type: BulkOperationTypeSchema,
  configurations: z.array(z.string().uuid()),
  operation: BulkOperationSchema,
  parameters: z.record(z.unknown()),
  status: BulkOperationStatusSchema,
  progress: z.number().min(0).max(100),
  results: z.array(BulkOperationResultSchema),
  createdBy: z.string().email(),
  createdAt: z.date(),
  completedAt: z.date().optional()
});

// Configuration Validation Schema
export const ConfigurationValidationSchema = z.object({
  id: z.string().uuid(),
  configurationId: z.string().uuid(),
  validationRuleId: z.string().uuid(),
  status: ValidationStatusSchema,
  message: z.string().min(1).max(1000),
  value: z.unknown(),
  timestamp: z.date()
});

// Configuration Backup Schema
export const ConfigurationBackupSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  environment: EnvironmentSchema,
  configurations: z.array(SystemConfigurationSchema),
  createdAt: z.date(),
  createdBy: z.string().email(),
  size: z.number().int().positive(),
  checksum: z.string().min(32).max(64),
  isEncrypted: z.boolean().default(false)
});

// Configuration Audit Schema
export const ConfigurationAuditSchema = z.object({
  id: z.string().uuid(),
  configurationId: z.string().uuid(),
  action: AuditActionSchema,
  details: z.record(z.unknown()),
  userId: z.string().email(),
  userEmail: z.string().email(),
  ipAddress: z.string().ip(),
  userAgent: z.string().max(500),
  timestamp: z.date(),
  environment: EnvironmentSchema
});

// Configuration Performance Schema
export const ConfigurationPerformanceSchema = z.object({
  id: z.string().uuid(),
  configurationId: z.string().uuid(),
  metric: PerformanceMetricSchema,
  value: z.number(),
  threshold: z.number().optional(),
  status: PerformanceStatusSchema,
  timestamp: z.date(),
  environment: EnvironmentSchema
});

// Configuration Error Schema
export const ConfigurationErrorSchema = z.object({
  id: z.string().uuid(),
  configurationId: z.string().uuid(),
  errorType: ErrorTypeSchema,
  message: z.string().min(1).max(1000),
  stack: z.string().optional(),
  context: z.record(z.unknown()),
  timestamp: z.date(),
  environment: EnvironmentSchema,
  resolved: z.boolean().default(false),
  resolvedAt: z.date().optional(),
  resolvedBy: z.string().email().optional()
});

// Configuration API Response Schema
export const ConfigurationApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional()
  }).optional(),
  metadata: z.object({
    timestamp: z.date(),
    requestId: z.string(),
    version: z.string()
  }).optional()
});

// Configuration List Response Schema
export const ConfigurationListResponseSchema = z.object({
  configurations: z.array(SystemConfigurationSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative()
  }),
  filters: ConfigurationFiltersSchema
});

// Validation Result Schema
export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.object({
    field: z.string(),
    message: z.string(),
    code: z.string()
  })),
  warnings: z.array(z.object({
    field: z.string(),
    message: z.string(),
    code: z.string()
  }))
});

// Use Configuration Options Schema
export const UseConfigurationOptionsSchema = z.object({
  environment: EnvironmentSchema.optional(),
  category: ConfigurationCategorySchema.optional(),
  autoRefresh: z.boolean().default(true),
  refreshInterval: z.number().int().positive().default(30000),
  onError: z.function().optional(),
  onUpdate: z.function().optional()
});

// Date Range Schema
export const DateRangeSchema = z.object({
  from: z.date(),
  to: z.date()
});

// Import/Export Error/Warning Schemas
export const ImportErrorSchema = z.object({
  row: z.number().int().positive(),
  field: z.string(),
  message: z.string(),
  code: z.string()
});

export const ImportWarningSchema = z.object({
  row: z.number().int().positive(),
  field: z.string(),
  message: z.string(),
  code: z.string()
});

// Configuration Import Result Schema
export const ConfigurationImportResultSchema = z.object({
  success: z.boolean(),
  imported: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  errors: z.array(ImportErrorSchema),
  warnings: z.array(ImportWarningSchema)
});

// Create Configuration Schema (for API requests)
export const CreateConfigurationSchema = SystemConfigurationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true
});

// Update Configuration Schema (for API requests)
export const UpdateConfigurationSchema = SystemConfigurationSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true
});

// Configuration Key Schema (for validation)
export const ConfigurationKeySchema = z.string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9._-]+$/, 'Configuration key must contain only alphanumeric characters, dots, underscores, and hyphens');

// Configuration Value Schema (for validation)
export const ConfigurationValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.record(z.unknown()),
  z.array(z.unknown())
]);

// Environment-specific Configuration Schema
export const EnvironmentConfigurationSchema = z.object({
  environment: EnvironmentSchema,
  configurations: z.array(SystemConfigurationSchema)
});

// Configuration Category Count Schema
export const ConfigurationCategoryCountSchema = z.object({
  category: ConfigurationCategorySchema,
  count: z.number().int().nonnegative(),
  activeCount: z.number().int().nonnegative(),
  editableCount: z.number().int().nonnegative()
});

// Configuration Statistics Schema
export const ConfigurationStatisticsSchema = z.object({
  totalConfigurations: z.number().int().nonnegative(),
  activeConfigurations: z.number().int().nonnegative(),
  editableConfigurations: z.number().int().nonnegative(),
  categoriesByCount: z.array(ConfigurationCategoryCountSchema),
  environmentsByCount: z.array(z.object({
    environment: EnvironmentSchema,
    count: z.number().int().nonnegative()
  })),
  recentChanges: z.number().int().nonnegative(),
  validationErrors: z.number().int().nonnegative()
});

// Export all schemas
export {
  ConfigurationDataTypeSchema as ConfigurationDataType,
  ConfigurationCategorySchema as ConfigurationCategory,
  EnvironmentSchema as Environment,
  ValidationTypeSchema as ValidationType,
  DependencyConditionSchema as DependencyCondition,
  ChangeTypeSchema as ChangeType,
  ChangeStatusSchema as ChangeStatus,
  ChangeImpactSchema as ChangeImpact,
  AnalyticsMetricSchema as AnalyticsMetric,
  BulkOperationTypeSchema as BulkOperationType,
  BulkOperationSchema as BulkOperation,
  BulkOperationStatusSchema as BulkOperationStatus,
  ValidationStatusSchema as ValidationStatus,
  AuditActionSchema as AuditAction,
  PerformanceMetricSchema as PerformanceMetric,
  PerformanceStatusSchema as PerformanceStatus,
  ErrorTypeSchema as ErrorType
};
