// Policy Management Types
export interface Policy {
  id: string;
  name: string;
  description: string;
  category: PolicyCategory;
  type: PolicyType;
  status: PolicyStatus;
  priority: PolicyPriority;
  version: number;
  rules: PolicyRule[];
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  environment: Environment;
  isActive: boolean;
  isGlobal: boolean;
  scope: PolicyScope;
  tags: string[];
  metadata: Record<string, unknown>;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  effectiveFrom?: Date;
  effectiveUntil?: Date;
  dependencies?: PolicyDependency[];
}

export type PolicyCategory = 
  | 'user_behavior'
  | 'content_moderation'
  | 'transaction'
  | 'security'
  | 'compliance'
  | 'performance'
  | 'feature_access'
  | 'data_protection'
  | 'communication'
  | 'system';

export type PolicyType = 
  | 'prevention'
  | 'detection'
  | 'response'
  | 'enforcement'
  | 'validation'
  | 'notification'
  | 'escalation'
  | 'audit';

export type PolicyStatus = 
  | 'draft'
  | 'active'
  | 'inactive'
  | 'deprecated'
  | 'testing'
  | 'suspended';

export type PolicyPriority = 'low' | 'medium' | 'high' | 'critical';

export type Environment = 'development' | 'staging' | 'production' | 'testing';

export type PolicyScope = 
  | 'global'
  | 'user_group'
  | 'individual_user'
  | 'feature'
  | 'transaction_type'
  | 'content_type'
  | 'geographic'
  | 'time_based';

// Policy Rule Types
export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  type: RuleType;
  operator: RuleOperator;
  value: unknown;
  field: string;
  isActive: boolean;
  weight: number;
  conditions?: PolicyCondition[];
}

export type RuleType = 
  | 'comparison'
  | 'pattern_match'
  | 'range_check'
  | 'existence_check'
  | 'custom_function'
  | 'api_call'
  | 'database_query';

export type RuleOperator = 
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'regex_match'
  | 'in_list'
  | 'not_in_list'
  | 'is_null'
  | 'is_not_null'
  | 'is_empty'
  | 'is_not_empty';

// Policy Condition Types
export interface PolicyCondition {
  id: string;
  name: string;
  description: string;
  type: ConditionType;
  operator: ConditionOperator;
  value: unknown;
  field: string;
  isActive: boolean;
  logicalOperator?: LogicalOperator;
  subConditions?: PolicyCondition[];
}

export type ConditionType = 
  | 'user_attribute'
  | 'system_attribute'
  | 'time_based'
  | 'geographic'
  | 'device_based'
  | 'network_based'
  | 'content_based'
  | 'behavioral'
  | 'risk_score'
  | 'custom';

export type ConditionOperator = 
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'contains'
  | 'matches'
  | 'exists'
  | 'not_exists'
  | 'in_range'
  | 'out_of_range';

export type LogicalOperator = 'AND' | 'OR' | 'NOT';

// Policy Action Types
export interface PolicyAction {
  id: string;
  name: string;
  description: string;
  type: ActionType;
  parameters: Record<string, unknown>;
  isActive: boolean;
  order: number;
  conditions?: PolicyCondition[];
  fallbackAction?: PolicyAction;
}

export type ActionType = 
  | 'allow'
  | 'deny'
  | 'block'
  | 'redirect'
  | 'notify'
  | 'log'
  | 'escalate'
  | 'quarantine'
  | 'rate_limit'
  | 'captcha'
  | 'mfa_required'
  | 'suspend'
  | 'ban'
  | 'flag'
  | 'auto_moderate'
  | 'custom_function'
  | 'webhook'
  | 'email'
  | 'sms'
  | 'push_notification';

// Policy Dependency Types
export interface PolicyDependency {
  id: string;
  policyId: string;
  dependsOnPolicyId: string;
  type: DependencyType;
  condition: DependencyCondition;
  isRequired: boolean;
}

export type DependencyType = 
  | 'prerequisite'
  | 'conflict'
  | 'override'
  | 'enhancement'
  | 'fallback';

export type DependencyCondition = 
  | 'must_be_active'
  | 'must_be_inactive'
  | 'must_be_triggered_first'
  | 'must_not_conflict'
  | 'must_be_compatible';

// Policy Violation Types
export interface PolicyViolation {
  id: string;
  policyId: string;
  policyName: string;
  userId?: string;
  sessionId?: string;
  violationType: ViolationType;
  severity: ViolationSeverity;
  description: string;
  details: Record<string, unknown>;
  context: ViolationContext;
  actions: ViolationAction[];
  status: ViolationStatus;
  detectedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
  metadata: Record<string, unknown>;
}

export type ViolationType = 
  | 'rule_breach'
  | 'threshold_exceeded'
  | 'suspicious_behavior'
  | 'unauthorized_access'
  | 'content_violation'
  | 'transaction_anomaly'
  | 'security_threat'
  | 'compliance_breach';

export type ViolationSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ViolationContext {
  userAgent?: string;
  ipAddress?: string;
  location?: string;
  device?: string;
  browser?: string;
  referrer?: string;
  timestamp: Date;
  sessionData?: Record<string, unknown>;
  requestData?: Record<string, unknown>;
}

export interface ViolationAction {
  id: string;
  type: ActionType;
  executed: boolean;
  executedAt?: Date;
  result?: unknown;
  error?: string;
}

export type ViolationStatus = 
  | 'detected'
  | 'investigating'
  | 'escalated'
  | 'resolved'
  | 'false_positive'
  | 'ignored'
  | 'pending_review';

// Policy Testing Types
export interface PolicyTest {
  id: string;
  policyId: string;
  name: string;
  description: string;
  testData: TestData;
  expectedResult: ExpectedResult;
  actualResult?: TestResult;
  status: TestStatus;
  executedAt?: Date;
  executedBy?: string;
  notes?: string;
}

export interface TestData {
  userId?: string;
  sessionId?: string;
  context: Record<string, unknown>;
  input: Record<string, unknown>;
  environment: Environment;
}

export interface ExpectedResult {
  shouldTrigger: boolean;
  expectedActions: ActionType[];
  expectedViolationType?: ViolationType;
  expectedSeverity?: ViolationSeverity;
}

export interface TestResult {
  triggered: boolean;
  actions: ViolationAction[];
  violationType?: ViolationType;
  severity?: ViolationSeverity;
  executionTime: number;
  errors?: string[];
}

export type TestStatus = 'pending' | 'running' | 'passed' | 'failed' | 'error';

// Policy Analytics Types
export interface PolicyAnalytics {
  id: string;
  policyId: string;
  metric: PolicyMetric;
  value: number;
  timestamp: Date;
  environment: Environment;
  metadata?: Record<string, unknown>;
}

export type PolicyMetric = 
  | 'violation_count'
  | 'violation_rate'
  | 'false_positive_rate'
  | 'detection_accuracy'
  | 'response_time'
  | 'action_success_rate'
  | 'user_impact_score'
  | 'system_performance_impact';

// Policy Template Types
export interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  category: PolicyCategory;
  type: PolicyType;
  template: PolicyTemplateData;
  isPublic: boolean;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  usageCount: number;
}

export interface PolicyTemplateData {
  rules: Omit<PolicyRule, 'id'>[];
  conditions: Omit<PolicyCondition, 'id'>[];
  actions: Omit<PolicyAction, 'id'>[];
  metadata: Record<string, unknown>;
}

// Policy Import/Export Types
export interface PolicyExport {
  id: string;
  name: string;
  description: string;
  environment: Environment;
  policies: Policy[];
  templates: PolicyTemplate[];
  metadata: {
    exportedAt: Date;
    exportedBy: string;
    version: string;
    totalPolicies: number;
  };
}

export interface PolicyImport {
  file: File;
  environment: Environment;
  overwriteExisting: boolean;
  validateBeforeImport: boolean;
  createBackup: boolean;
}

// Policy Search and Filter Types
export interface PolicyFilters {
  category?: PolicyCategory;
  type?: PolicyType;
  status?: PolicyStatus;
  priority?: PolicyPriority;
  environment?: Environment;
  isActive?: boolean;
  isGlobal?: boolean;
  scope?: PolicyScope;
  tags?: string[];
  createdBy?: string;
  updatedAfter?: Date;
  updatedBefore?: Date;
  search?: string;
}

export interface PolicySearchResult {
  policies: Policy[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: PolicyFilters;
}

// Policy Bulk Operations
export interface PolicyBulkOperation {
  id: string;
  type: BulkOperationType;
  policies: string[];
  operation: BulkOperation;
  parameters: Record<string, unknown>;
  status: BulkOperationStatus;
  progress: number;
  results: BulkOperationResult[];
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
}

export type BulkOperationType = 'update' | 'delete' | 'export' | 'import' | 'test' | 'activate' | 'deactivate';
export type BulkOperation = 'set_status' | 'set_priority' | 'add_tag' | 'remove_tag' | 'change_category' | 'update_version';
export type BulkOperationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface BulkOperationResult {
  policyId: string;
  success: boolean;
  message?: string;
  error?: string;
}

// Policy Validation Types
export interface PolicyValidation {
  id: string;
  policyId: string;
  validationType: PolicyValidationType;
  status: ValidationStatus;
  message: string;
  details: Record<string, unknown>;
  timestamp: Date;
}

export type PolicyValidationType = 
  | 'rule_validation'
  | 'condition_validation'
  | 'action_validation'
  | 'dependency_validation'
  | 'conflict_validation'
  | 'performance_validation'
  | 'security_validation';

export type ValidationStatus = 'valid' | 'invalid' | 'warning' | 'pending';

// Policy Audit Types
export interface PolicyAudit {
  id: string;
  policyId: string;
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
  | 'test'
  | 'violate'
  | 'resolve'
  | 'escalate';

// Policy Performance Types
export interface PolicyPerformance {
  id: string;
  policyId: string;
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
  | 'violation_detection_time'
  | 'action_execution_time'
  | 'false_positive_rate';

export type PerformanceStatus = 'good' | 'warning' | 'critical';

// Policy Error Types
export interface PolicyError {
  id: string;
  policyId: string;
  errorType: PolicyErrorType;
  message: string;
  stack?: string;
  context: Record<string, unknown>;
  timestamp: Date;
  environment: Environment;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export type PolicyErrorType = 
  | 'rule_evaluation_error'
  | 'action_execution_error'
  | 'dependency_error'
  | 'validation_error'
  | 'performance_error'
  | 'integration_error'
  | 'unknown_error';

// Policy API Response Types
export interface PolicyApiResponse<T = unknown> {
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

export interface PolicyListResponse {
  policies: Policy[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: PolicyFilters;
}

// Policy Hook Types
export interface UsePolicyOptions {
  environment?: Environment;
  category?: PolicyCategory;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onError?: (error: Error) => void;
  onUpdate?: (policies: Policy[]) => void;
}

export interface UsePolicyReturn {
  policies: Policy[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createPolicy: (policy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<void>;
  updatePolicy: (id: string, updates: Partial<Policy>) => Promise<void>;
  deletePolicy: (id: string) => Promise<void>;
  activatePolicy: (id: string) => Promise<void>;
  deactivatePolicy: (id: string) => Promise<void>;
  testPolicy: (id: string, testData: TestData) => Promise<TestResult>;
  getPolicyViolations: (id: string, page?: number, limit?: number) => Promise<PolicyViolation[]>;
}

// Policy Context Types
export interface PolicyContextType {
  policies: Policy[];
  violations: PolicyViolation[];
  loading: boolean;
  error: Error | null;
  environment: Environment;
  setEnvironment: (env: Environment) => void;
  refreshPolicies: () => Promise<void>;
  createPolicy: (policy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<void>;
  updatePolicy: (id: string, updates: Partial<Policy>) => Promise<void>;
  deletePolicy: (id: string) => Promise<void>;
  getPolicy: (id: string) => Policy | undefined;
  getPoliciesByCategory: (category: PolicyCategory) => Policy[];
  getActivePolicies: () => Policy[];
  evaluatePolicy: (policyId: string, context: Record<string, unknown>) => Promise<PolicyEvaluationResult>;
}

export interface PolicyEvaluationResult {
  triggered: boolean;
  actions: PolicyAction[];
  violation?: PolicyViolation;
  executionTime: number;
  errors?: string[];
}

// Policy Service Types
export interface PolicyService {
  getPolicies: (filters?: PolicyFilters, page?: number, limit?: number) => Promise<PolicyListResponse>;
  getPolicy: (id: string) => Promise<Policy>;
  createPolicy: (policy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<Policy>;
  updatePolicy: (id: string, updates: Partial<Policy>) => Promise<Policy>;
  deletePolicy: (id: string) => Promise<void>;
  activatePolicy: (id: string) => Promise<void>;
  deactivatePolicy: (id: string) => Promise<void>;
  testPolicy: (id: string, testData: TestData) => Promise<TestResult>;
  validatePolicy: (policy: Policy) => Promise<PolicyValidation[]>;
  getPolicyViolations: (policyId: string, page?: number, limit?: number) => Promise<PolicyViolation[]>;
  resolveViolation: (violationId: string, resolution: string, resolvedBy: string) => Promise<void>;
  getPolicyAnalytics: (policyId: string, metric?: PolicyMetric, dateRange?: DateRange) => Promise<PolicyAnalytics[]>;
  exportPolicies: (filters?: PolicyFilters) => Promise<PolicyExport>;
  importPolicies: (importData: PolicyImport) => Promise<PolicyImportResult>;
  createPolicyTemplate: (template: Omit<PolicyTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'usageCount'>) => Promise<PolicyTemplate>;
  getPolicyTemplates: (category?: PolicyCategory) => Promise<PolicyTemplate[]>;
}

export interface PolicyImportResult {
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
