import { z } from 'zod';

// Policy Data Types
export const PolicyCategorySchema = z.enum([
  'user_behavior',
  'content_moderation',
  'transaction',
  'security',
  'compliance',
  'performance',
  'feature_access',
  'data_protection',
  'communication',
  'system'
]);

export const PolicyTypeSchema = z.enum([
  'prevention',
  'detection',
  'response',
  'enforcement',
  'validation',
  'notification',
  'escalation',
  'audit'
]);

export const PolicyStatusSchema = z.enum([
  'draft',
  'active',
  'inactive',
  'deprecated',
  'testing',
  'suspended'
]);

export const PolicyPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'critical'
]);

export const PolicyScopeSchema = z.enum([
  'global',
  'user_group',
  'individual_user',
  'feature',
  'transaction_type',
  'content_type',
  'geographic',
  'time_based'
]);

export const EnvironmentSchema = z.enum([
  'development',
  'staging',
  'production',
  'testing'
]);

export const RuleTypeSchema = z.enum([
  'comparison',
  'pattern_match',
  'range_check',
  'existence_check',
  'custom_function',
  'api_call',
  'database_query'
]);

export const RuleOperatorSchema = z.enum([
  'equals',
  'not_equals',
  'greater_than',
  'less_than',
  'greater_than_or_equal',
  'less_than_or_equal',
  'contains',
  'not_contains',
  'starts_with',
  'ends_with',
  'regex_match',
  'in_list',
  'not_in_list',
  'is_null',
  'is_not_null',
  'is_empty',
  'is_not_empty'
]);

export const ConditionTypeSchema = z.enum([
  'user_attribute',
  'system_attribute',
  'time_based',
  'geographic',
  'device_based',
  'network_based',
  'content_based',
  'behavioral',
  'risk_score',
  'custom'
]);

export const ConditionOperatorSchema = z.enum([
  'equals',
  'not_equals',
  'greater_than',
  'less_than',
  'contains',
  'matches',
  'exists',
  'not_exists',
  'in_range',
  'out_of_range'
]);

export const LogicalOperatorSchema = z.enum(['AND', 'OR', 'NOT']);

export const ActionTypeSchema = z.enum([
  'allow',
  'deny',
  'block',
  'redirect',
  'notify',
  'log',
  'escalate',
  'quarantine',
  'rate_limit',
  'captcha',
  'mfa_required',
  'suspend',
  'ban',
  'flag',
  'auto_moderate',
  'custom_function',
  'webhook',
  'email',
  'sms',
  'push_notification'
]);

export const DependencyTypeSchema = z.enum([
  'prerequisite',
  'conflict',
  'override',
  'enhancement',
  'fallback'
]);

export const DependencyConditionSchema = z.enum([
  'must_be_active',
  'must_be_inactive',
  'must_be_triggered_first',
  'must_not_conflict',
  'must_be_compatible'
]);

export const ViolationTypeSchema = z.enum([
  'rule_breach',
  'threshold_exceeded',
  'suspicious_behavior',
  'unauthorized_access',
  'content_violation',
  'transaction_anomaly',
  'security_threat',
  'compliance_breach'
]);

export const ViolationSeveritySchema = z.enum([
  'low',
  'medium',
  'high',
  'critical'
]);

export const ViolationStatusSchema = z.enum([
  'detected',
  'investigating',
  'escalated',
  'resolved',
  'false_positive',
  'ignored',
  'pending_review'
]);

export const TestStatusSchema = z.enum([
  'pending',
  'running',
  'passed',
  'failed',
  'error'
]);

export const PolicyMetricSchema = z.enum([
  'violation_count',
  'violation_rate',
  'false_positive_rate',
  'detection_accuracy',
  'response_time',
  'action_success_rate',
  'user_impact_score',
  'system_performance_impact'
]);

export const BulkOperationTypeSchema = z.enum([
  'update',
  'delete',
  'export',
  'import',
  'test',
  'activate',
  'deactivate'
]);

export const BulkOperationSchema = z.enum([
  'set_status',
  'set_priority',
  'add_tag',
  'remove_tag',
  'change_category',
  'update_version'
]);

export const BulkOperationStatusSchema = z.enum([
  'pending',
  'running',
  'completed',
  'failed',
  'cancelled'
]);

export const PolicyValidationTypeSchema = z.enum([
  'rule_validation',
  'condition_validation',
  'action_validation',
  'dependency_validation',
  'conflict_validation',
  'performance_validation',
  'security_validation'
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
  'activate',
  'deactivate',
  'test',
  'violate',
  'resolve',
  'escalate'
]);

export const PerformanceMetricSchema = z.enum([
  'evaluation_time',
  'memory_usage',
  'cpu_usage',
  'violation_detection_time',
  'action_execution_time',
  'false_positive_rate'
]);

export const PerformanceStatusSchema = z.enum([
  'good',
  'warning',
  'critical'
]);

export const PolicyErrorTypeSchema = z.enum([
  'rule_evaluation_error',
  'action_execution_error',
  'dependency_error',
  'validation_error',
  'performance_error',
  'integration_error',
  'unknown_error'
]);

// Policy Rule Schema
export const PolicyRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  type: RuleTypeSchema,
  operator: RuleOperatorSchema,
  value: z.unknown(),
  field: z.string().min(1).max(100),
  isActive: z.boolean().default(true),
  weight: z.number().min(0).max(100).default(1),
  conditions: z.lazy(() => z.array(PolicyConditionSchema)).optional()
});

// Policy Condition Schema
export const PolicyConditionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  type: ConditionTypeSchema,
  operator: ConditionOperatorSchema,
  value: z.unknown(),
  field: z.string().min(1).max(100),
  isActive: z.boolean().default(true),
  logicalOperator: LogicalOperatorSchema.optional(),
  subConditions: z.lazy(() => z.array(PolicyConditionSchema)).optional()
});

// Policy Action Schema
export const PolicyActionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  type: ActionTypeSchema,
  parameters: z.record(z.unknown()),
  isActive: z.boolean().default(true),
  order: z.number().int().positive(),
  conditions: z.lazy(() => z.array(PolicyConditionSchema)).optional(),
  fallbackAction: z.lazy(() => PolicyActionSchema).optional()
});

// Policy Dependency Schema
export const PolicyDependencySchema = z.object({
  id: z.string().uuid(),
  policyId: z.string().uuid(),
  dependsOnPolicyId: z.string().uuid(),
  type: DependencyTypeSchema,
  condition: DependencyConditionSchema,
  isRequired: z.boolean().default(true)
});

// Policy Schema
export const PolicySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  category: PolicyCategorySchema,
  type: PolicyTypeSchema,
  status: PolicyStatusSchema,
  priority: PolicyPrioritySchema,
  version: z.number().int().positive(),
  rules: z.array(PolicyRuleSchema),
  conditions: z.array(PolicyConditionSchema),
  actions: z.array(PolicyActionSchema),
  environment: EnvironmentSchema,
  isActive: z.boolean().default(true),
  isGlobal: z.boolean().default(false),
  scope: PolicyScopeSchema,
  tags: z.array(z.string().min(1).max(50)),
  metadata: z.record(z.unknown()),
  createdBy: z.string().email(),
  createdAt: z.date(),
  updatedBy: z.string().email(),
  updatedAt: z.date(),
  effectiveFrom: z.date().optional(),
  effectiveUntil: z.date().optional(),
  dependencies: z.array(PolicyDependencySchema).optional()
});

// Policy Violation Schema
export const PolicyViolationSchema = z.object({
  id: z.string().uuid(),
  policyId: z.string().uuid(),
  policyName: z.string().min(1).max(100),
  userId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  violationType: ViolationTypeSchema,
  severity: ViolationSeveritySchema,
  description: z.string().min(1).max(1000),
  details: z.record(z.unknown()),
  context: z.object({
    userAgent: z.string().optional(),
    ipAddress: z.string().ip().optional(),
    location: z.string().optional(),
    device: z.string().optional(),
    browser: z.string().optional(),
    referrer: z.string().optional(),
    timestamp: z.date(),
    sessionData: z.record(z.unknown()).optional(),
    requestData: z.record(z.unknown()).optional()
  }),
  actions: z.array(z.object({
    id: z.string().uuid(),
    type: ActionTypeSchema,
    executed: z.boolean().default(false),
    executedAt: z.date().optional(),
    result: z.unknown().optional(),
    error: z.string().optional()
  })),
  status: ViolationStatusSchema,
  detectedAt: z.date(),
  resolvedAt: z.date().optional(),
  resolvedBy: z.string().email().optional(),
  resolution: z.string().max(1000).optional(),
  metadata: z.record(z.unknown())
});

// Policy Test Schema
export const PolicyTestSchema = z.object({
  id: z.string().uuid(),
  policyId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  testData: z.object({
    userId: z.string().uuid().optional(),
    sessionId: z.string().uuid().optional(),
    context: z.record(z.unknown()),
    input: z.record(z.unknown()),
    environment: EnvironmentSchema
  }),
  expectedResult: z.object({
    shouldTrigger: z.boolean(),
    expectedActions: z.array(ActionTypeSchema),
    expectedViolationType: ViolationTypeSchema.optional(),
    expectedSeverity: ViolationSeveritySchema.optional()
  }),
  actualResult: z.object({
    triggered: z.boolean(),
    actions: z.array(z.object({
      id: z.string().uuid(),
      type: ActionTypeSchema,
      executed: z.boolean(),
      executedAt: z.date().optional(),
      result: z.unknown().optional(),
      error: z.string().optional()
    })),
    violationType: ViolationTypeSchema.optional(),
    severity: ViolationSeveritySchema.optional(),
    executionTime: z.number().positive(),
    errors: z.array(z.string()).optional()
  }).optional(),
  status: TestStatusSchema,
  executedAt: z.date().optional(),
  executedBy: z.string().email().optional(),
  notes: z.string().max(1000).optional()
});

// Policy Analytics Schema
export const PolicyAnalyticsSchema = z.object({
  id: z.string().uuid(),
  policyId: z.string().uuid(),
  metric: PolicyMetricSchema,
  value: z.number(),
  timestamp: z.date(),
  environment: EnvironmentSchema,
  metadata: z.record(z.unknown()).optional()
});

// Policy Template Data Schema
export const PolicyTemplateDataSchema = z.object({
  rules: z.array(PolicyRuleSchema.omit({ id: true })),
  conditions: z.array(PolicyConditionSchema.omit({ id: true })),
  actions: z.array(PolicyActionSchema.omit({ id: true })),
  metadata: z.record(z.unknown())
});

// Policy Template Schema
export const PolicyTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  category: PolicyCategorySchema,
  type: PolicyTypeSchema,
  template: PolicyTemplateDataSchema,
  isPublic: z.boolean().default(false),
  tags: z.array(z.string().min(1).max(50)),
  createdBy: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.number().int().positive(),
  usageCount: z.number().int().nonnegative().default(0)
});

// Policy Export Schema
export const PolicyExportSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  environment: EnvironmentSchema,
  policies: z.array(PolicySchema),
  templates: z.array(PolicyTemplateSchema),
  metadata: z.object({
    exportedAt: z.date(),
    exportedBy: z.string().email(),
    version: z.string(),
    totalPolicies: z.number().int().positive()
  })
});

// Policy Import Schema
export const PolicyImportSchema = z.object({
  file: z.instanceof(File),
  environment: EnvironmentSchema,
  overwriteExisting: z.boolean().default(false),
  validateBeforeImport: z.boolean().default(true),
  createBackup: z.boolean().default(true)
});

// Policy Filters Schema
export const PolicyFiltersSchema = z.object({
  category: PolicyCategorySchema.optional(),
  type: PolicyTypeSchema.optional(),
  status: PolicyStatusSchema.optional(),
  priority: PolicyPrioritySchema.optional(),
  environment: EnvironmentSchema.optional(),
  isActive: z.boolean().optional(),
  isGlobal: z.boolean().optional(),
  scope: PolicyScopeSchema.optional(),
  tags: z.array(z.string()).optional(),
  createdBy: z.string().email().optional(),
  updatedAfter: z.date().optional(),
  updatedBefore: z.date().optional(),
  search: z.string().max(100).optional()
});

// Policy Search Result Schema
export const PolicySearchResultSchema = z.object({
  policies: z.array(PolicySchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
  filters: PolicyFiltersSchema
});

// Bulk Operation Result Schema
export const BulkOperationResultSchema = z.object({
  policyId: z.string().uuid(),
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional()
});

// Policy Bulk Operation Schema
export const PolicyBulkOperationSchema = z.object({
  id: z.string().uuid(),
  type: BulkOperationTypeSchema,
  policies: z.array(z.string().uuid()),
  operation: BulkOperationSchema,
  parameters: z.record(z.unknown()),
  status: BulkOperationStatusSchema,
  progress: z.number().min(0).max(100),
  results: z.array(BulkOperationResultSchema),
  createdBy: z.string().email(),
  createdAt: z.date(),
  completedAt: z.date().optional()
});

// Policy Validation Schema
export const PolicyValidationSchema = z.object({
  id: z.string().uuid(),
  policyId: z.string().uuid(),
  validationType: PolicyValidationTypeSchema,
  status: ValidationStatusSchema,
  message: z.string().min(1).max(1000),
  details: z.record(z.unknown()),
  timestamp: z.date()
});

// Policy Audit Schema
export const PolicyAuditSchema = z.object({
  id: z.string().uuid(),
  policyId: z.string().uuid(),
  action: AuditActionSchema,
  details: z.record(z.unknown()),
  userId: z.string().email(),
  userEmail: z.string().email(),
  ipAddress: z.string().ip(),
  userAgent: z.string().max(500),
  timestamp: z.date(),
  environment: EnvironmentSchema
});

// Policy Performance Schema
export const PolicyPerformanceSchema = z.object({
  id: z.string().uuid(),
  policyId: z.string().uuid(),
  metric: PerformanceMetricSchema,
  value: z.number(),
  threshold: z.number().optional(),
  status: PerformanceStatusSchema,
  timestamp: z.date(),
  environment: EnvironmentSchema
});

// Policy Error Schema
export const PolicyErrorSchema = z.object({
  id: z.string().uuid(),
  policyId: z.string().uuid(),
  errorType: PolicyErrorTypeSchema,
  message: z.string().min(1).max(1000),
  stack: z.string().optional(),
  context: z.record(z.unknown()),
  timestamp: z.date(),
  environment: EnvironmentSchema,
  resolved: z.boolean().default(false),
  resolvedAt: z.date().optional(),
  resolvedBy: z.string().email().optional()
});

// Policy API Response Schema
export const PolicyApiResponseSchema = z.object({
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

// Policy List Response Schema
export const PolicyListResponseSchema = z.object({
  policies: z.array(PolicySchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative()
  }),
  filters: PolicyFiltersSchema
});

// Policy Evaluation Result Schema
export const PolicyEvaluationResultSchema = z.object({
  triggered: z.boolean(),
  actions: z.array(PolicyActionSchema),
  violation: PolicyViolationSchema.optional(),
  executionTime: z.number().positive(),
  errors: z.array(z.string()).optional()
});

// Use Policy Options Schema
export const UsePolicyOptionsSchema = z.object({
  environment: EnvironmentSchema.optional(),
  category: PolicyCategorySchema.optional(),
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

// Policy Import Result Schema
export const PolicyImportResultSchema = z.object({
  success: z.boolean(),
  imported: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  errors: z.array(ImportErrorSchema),
  warnings: z.array(ImportWarningSchema)
});

// Create Policy Schema (for API requests)
export const CreatePolicySchema = PolicySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true
});

// Update Policy Schema (for API requests)
export const UpdatePolicySchema = PolicySchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true
});

// Policy Name Schema (for validation)
export const PolicyNameSchema = z.string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9\s._-]+$/, 'Policy name must contain only alphanumeric characters, spaces, dots, underscores, and hyphens');

// Policy Key Schema (for validation)
export const PolicyKeySchema = z.string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9._-]+$/, 'Policy key must contain only alphanumeric characters, dots, underscores, and hyphens');

// Policy Statistics Schema
export const PolicyStatisticsSchema = z.object({
  totalPolicies: z.number().int().nonnegative(),
  activePolicies: z.number().int().nonnegative(),
  draftPolicies: z.number().int().nonnegative(),
  categoriesByCount: z.array(z.object({
    category: PolicyCategorySchema,
    count: z.number().int().nonnegative()
  })),
  violationsByType: z.array(z.object({
    type: ViolationTypeSchema,
    count: z.number().int().nonnegative()
  })),
  recentViolations: z.number().int().nonnegative(),
  averageResponseTime: z.number().nonnegative(),
  falsePositiveRate: z.number().min(0).max(1)
});

// Export all schemas
export {
  PolicyCategorySchema as PolicyCategory,
  PolicyTypeSchema as PolicyType,
  PolicyStatusSchema as PolicyStatus,
  PolicyPrioritySchema as PolicyPriority,
  PolicyScopeSchema as PolicyScope,
  EnvironmentSchema as Environment,
  RuleTypeSchema as RuleType,
  RuleOperatorSchema as RuleOperator,
  ConditionTypeSchema as ConditionType,
  ConditionOperatorSchema as ConditionOperator,
  LogicalOperatorSchema as LogicalOperator,
  ActionTypeSchema as ActionType,
  DependencyTypeSchema as DependencyType,
  DependencyConditionSchema as DependencyCondition,
  ViolationTypeSchema as ViolationType,
  ViolationSeveritySchema as ViolationSeverity,
  ViolationStatusSchema as ViolationStatus,
  TestStatusSchema as TestStatus,
  PolicyMetricSchema as PolicyMetric,
  BulkOperationTypeSchema as BulkOperationType,
  BulkOperationSchema as BulkOperation,
  BulkOperationStatusSchema as BulkOperationStatus,
  PolicyValidationTypeSchema as PolicyValidationType,
  ValidationStatusSchema as ValidationStatus,
  AuditActionSchema as AuditAction,
  PerformanceMetricSchema as PerformanceMetric,
  PerformanceStatusSchema as PerformanceStatus,
  PolicyErrorTypeSchema as PolicyErrorType
};
