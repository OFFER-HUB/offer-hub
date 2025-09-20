export interface QualityScore {
  overall: number;
  breakdown: {
    content: number;
    relevance: number;
    professionalism: number;
    helpfulness: number;
    accuracy: number;
  };
}

export interface QualityMetrics {
  id: string;
  reviewId: string;
  qualityScore: QualityScore;
  moderationStatus: ModerationStatus;
  flaggedIssues: string[];
  suggestions: string[];
  aiConfidence: number;
  createdAt: string;
  updatedAt: string;
}

export type ModerationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'flagged'
  | 'escalated'
  | 'auto-approved'
  | 'auto-rejected';

export type ModerationAction =
  | 'approve'
  | 'reject'
  | 'flag'
  | 'escalate'
  | 'request_changes'
  | 'delete';

export interface ModerationDecision {
  id: string;
  reviewId: string;
  moderatorId: string;
  action: ModerationAction;
  reason: string;
  previousStatus: ModerationStatus;
  newStatus: ModerationStatus;
  confidence: number;
  timestamp: string;
  notes?: string;
}

export interface ModerationRule {
  id: string;
  name: string;
  description: string;
  category: ModerationCategory;
  severity: ModerationSeverity;
  autoAction: ModerationAction | null;
  enabled: boolean;
  conditions: ModerationCondition[];
  createdAt: string;
  updatedAt: string;
}

export type ModerationCategory =
  | 'content_quality'
  | 'inappropriate_content'
  | 'spam'
  | 'harassment'
  | 'false_information'
  | 'policy_violation';

export type ModerationSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ModerationCondition {
  field: string;
  operator: 'contains' | 'equals' | 'greater_than' | 'less_than' | 'matches_regex';
  value: string | number | boolean;
  caseSensitive?: boolean;
}

export interface ModerationWorkflow {
  id: string;
  name: string;
  description: string;
  steps: ModerationWorkflowStep[];
  triggers: ModerationTrigger[];
  enabled: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface ModerationWorkflowStep {
  id: string;
  name: string;
  type: 'automated' | 'manual' | 'escalation';
  action: ModerationAction;
  conditions: ModerationCondition[];
  assigneeRole?: string;
  timeoutMinutes?: number;
  order: number;
}

export interface ModerationTrigger {
  id: string;
  event: 'review_created' | 'review_updated' | 'quality_scored' | 'manual_trigger';
  conditions: ModerationCondition[];
}

export interface QualityAssessmentConfig {
  aiProvider: 'openai' | 'custom' | 'rule_based';
  thresholds: {
    autoApprove: number;
    autoReject: number;
    flagForReview: number;
  };
  weights: {
    content: number;
    relevance: number;
    professionalism: number;
    helpfulness: number;
    accuracy: number;
  };
  enabledFeatures: {
    aiAssessment: boolean;
    contentModeration: boolean;
    duplicateDetection: boolean;
    sentimentAnalysis: boolean;
    spamDetection: boolean;
  };
}

export interface QualityTrend {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  averageScore: number;
  scoreDistribution: Record<string, number>;
  improvementPercentage: number;
  totalReviews: number;
  flaggedCount: number;
  rejectedCount: number;
}

export interface QualityAnalytics {
  overview: {
    totalReviews: number;
    averageQualityScore: number;
    approvalRate: number;
    flagRate: number;
    rejectionRate: number;
    autoModerationRate: number;
  };
  trends: QualityTrend[];
  topIssues: Array<{
    issue: string;
    count: number;
    percentage: number;
  }>;
  moderatorPerformance: Array<{
    moderatorId: string;
    decisionsCount: number;
    accuracy: number;
    averageResponseTime: number;
  }>;
  contentInsights: {
    averageLength: number;
    readabilityScore: number;
    sentimentDistribution: Record<string, number>;
    commonKeywords: Array<{
      word: string;
      frequency: number;
    }>;
  };
}

export interface ModerationHistory {
  id: string;
  reviewId: string;
  timeline: Array<{
    timestamp: string;
    action: string;
    actor: 'system' | 'moderator' | 'ai';
    actorId?: string;
    details: string;
    metadata?: Record<string, any>;
  }>;
  currentStatus: ModerationStatus;
  finalDecision?: ModerationDecision;
  escalationCount: number;
  totalProcessingTime: number;
}

export interface ContentModerationResult {
  passed: boolean;
  score: number;
  flags: Array<{
    type: string;
    severity: ModerationSeverity;
    description: string;
    confidence: number;
  }>;
  suggestedAction: ModerationAction;
  reasoning: string[];
}

export interface UserEducationContent {
  id: string;
  title: string;
  type: 'guideline' | 'best_practice' | 'example' | 'warning';
  content: string;
  category: string;
  relevantRules: string[];
  examples: Array<{
    type: 'good' | 'bad';
    text: string;
    explanation: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface QualityImprovementSuggestion {
  id: string;
  reviewId: string;
  category: 'content' | 'structure' | 'tone' | 'specificity' | 'relevance';
  severity: 'minor' | 'moderate' | 'major';
  suggestion: string;
  example?: string;
  impact: 'low' | 'medium' | 'high';
  automated: boolean;
  acknowledged: boolean;
  timestamp: string;
}

export interface ExternalModerationIntegration {
  id: string;
  name: string;
  provider: string;
  type: 'content_filter' | 'ai_assessment' | 'human_moderation';
  endpoint: string;
  credentials: Record<string, string>;
  enabled: boolean;
  fallbackBehavior: 'approve' | 'reject' | 'flag';
  timeout: number;
  retryAttempts: number;
  configuration: Record<string, any>;
}

export interface MobileOptimization {
  compactView: boolean;
  gestureControls: boolean;
  offlineCapabilities: boolean;
  pushNotifications: boolean;
  quickActions: string[];
}

export interface PerformanceMetrics {
  processingTime: number;
  throughput: number;
  errorRate: number;
  queueLength: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    storage: number;
  };
  bottlenecks: Array<{
    component: string;
    issue: string;
    impact: 'low' | 'medium' | 'high';
  }>;
}

export interface ComplianceReport {
  id: string;
  period: string;
  totalReviews: number;
  complianceRate: number;
  violations: Array<{
    type: string;
    count: number;
    resolved: number;
    pending: number;
  }>;
  auditTrail: Array<{
    timestamp: string;
    action: string;
    details: string;
    compliance: boolean;
  }>;
  recommendations: string[];
  generatedAt: string;
}

export interface QualityAssuranceState {
  config: QualityAssessmentConfig;
  metrics: QualityAnalytics;
  trends: QualityTrend[];
  activeWorkflows: ModerationWorkflow[];
  pendingReviews: string[];
  isProcessing: boolean;
  errors: string[];
  lastUpdated: string;
}

export interface UseQualityAssuranceOptions {
  enableRealTime: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  includeMetrics: boolean;
  includeTrends: boolean;
  includeWorkflows: boolean;
}

export interface QualityAssuranceHookReturn {
  state: QualityAssuranceState;
  actions: {
    assessReview: (reviewId: string) => Promise<QualityMetrics>;
    moderateContent: (content: string) => Promise<ContentModerationResult>;
    updateConfig: (config: Partial<QualityAssessmentConfig>) => Promise<void>;
    getAnalytics: (period?: string) => Promise<QualityAnalytics>;
    getTrends: (period: string) => Promise<QualityTrend[]>;
    createWorkflow: (workflow: Omit<ModerationWorkflow, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ModerationWorkflow>;
    updateWorkflow: (id: string, workflow: Partial<ModerationWorkflow>) => Promise<ModerationWorkflow>;
    deleteWorkflow: (id: string) => Promise<void>;
    makeDecision: (reviewId: string, decision: Omit<ModerationDecision, 'id' | 'timestamp'>) => Promise<ModerationDecision>;
    getHistory: (reviewId: string) => Promise<ModerationHistory>;
    generateReport: (period: string) => Promise<ComplianceReport>;
    refreshData: () => Promise<void>;
  };
  loading: {
    assessment: boolean;
    moderation: boolean;
    analytics: boolean;
    workflows: boolean;
    decisions: boolean;
  };
  errors: {
    assessment?: string;
    moderation?: string;
    analytics?: string;
    workflows?: string;
    decisions?: string;
  };
}