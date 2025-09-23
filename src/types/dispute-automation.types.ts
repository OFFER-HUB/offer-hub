/**
 * @fileoverview TypeScript interfaces for automated dispute system
 * @author Offer Hub Team
 */

export interface DisputeAutomationData {
  id: string;
  projectId: string;
  clientId: string;
  freelancerId: string;
  disputeType: DisputeType;
  category: DisputeCategory;
  priority: DisputePriority;
  status: DisputeStatus;
  amount: number;
  currency: string;
  description: string;
  evidence: EvidenceItem[];
  timeline: TimelineEvent[];
  assignedMediatorId?: string;
  assignedArbitratorId?: string;
  resolutionRecommendation?: ResolutionRecommendation;
  createdAt: string;
  updatedAt: string;
}

export type DisputeType = 
  | 'payment_dispute'
  | 'quality_dispute'
  | 'timeline_dispute'
  | 'communication_dispute'
  | 'scope_dispute'
  | 'technical_dispute'
  | 'contract_violation';

export type DisputeCategory = 
  | 'payment_issues'
  | 'deliverable_quality'
  | 'project_timeline'
  | 'communication_breakdown'
  | 'scope_creep'
  | 'technical_requirements'
  | 'contract_terms'
  | 'intellectual_property'
  | 'refund_request'
  | 'milestone_disputes';

export type DisputePriority = 'low' | 'medium' | 'high' | 'critical';

export type DisputeStatus = 
  | 'initiated'
  | 'categorized'
  | 'assigned'
  | 'evidence_collection'
  | 'under_review'
  | 'mediation'
  | 'arbitration'
  | 'resolved'
  | 'closed'
  | 'escalated';

export interface DisputeInitiationForm {
  projectId: string;
  disputeType: DisputeType;
  category: DisputeCategory;
  description: string;
  evidence: File[];
  urgency: 'low' | 'medium' | 'high';
  requestedResolution: string;
  additionalDetails?: {
    timeline?: string;
    communicationHistory?: string;
    previousAttempts?: string;
  };
}

export interface EvidenceItem {
  id: string;
  type: 'document' | 'image' | 'video' | 'audio' | 'screenshot' | 'conversation' | 'contract';
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
  url: string;
  metadata?: {
    timestamp?: string;
    participants?: string[];
    platform?: string;
  };
}

export interface TimelineEvent {
  id: string;
  type: 'status_change' | 'evidence_submitted' | 'message_sent' | 'deadline_set' | 'escalation' | 'resolution';
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  metadata?: Record<string, any>;
}

export interface PriorityScoreFactors {
  amountWeight: number;
  urgencyWeight: number;
  userHistoryWeight: number;
  projectComplexityWeight: number;
  timelineSensitivityWeight: number;
  communicationQualityWeight: number;
}

export interface PriorityCalculationResult {
  score: number;
  priority: DisputePriority;
  factors: {
    amount: number;
    urgency: number;
    userHistory: number;
    projectComplexity: number;
    timelineSensitivity: number;
    communicationQuality: number;
  };
  reasoning: string[];
  recommendedTimeline: number; // hours
}

export interface MediatorProfile {
  id: string;
  name: string;
  email: string;
  expertise: DisputeCategory[];
  languages: string[];
  timezone: string;
  availability: 'available' | 'busy' | 'offline';
  rating: number;
  caseload: number;
  maxCaseload: number;
  successRate: number;
  avgResolutionTime: number; // hours
  specializations: string[];
  certifications: string[];
}

export interface CaseAssignmentResult {
  assignedMediatorId: string;
  assignmentScore: number;
  reasoning: string[];
  estimatedResolutionTime: number;
  alternativeMediators: {
    id: string;
    score: number;
    reason: string;
  }[];
}

export interface ResolutionRecommendation {
  id: string;
  type: 'automated' | 'ai_generated' | 'mediator_suggested' | 'precedent_based';
  confidence: number;
  recommendation: string;
  reasoning: string[];
  suggestedActions: {
    action: string;
    description: string;
    timeline: string;
    responsible: 'client' | 'freelancer' | 'mediator' | 'platform';
  }[];
  similarCases: {
    caseId: string;
    similarity: number;
    outcome: string;
  }[];
  estimatedTimeToResolution: number;
  fallbackOptions: string[];
}

export interface DisputeMetrics {
  totalDisputes: number;
  activeDisputes: number;
  averageResolutionTime: number;
  resolutionRate: number;
  escalationRate: number;
  userSatisfactionScore: number;
  mediatorEfficiency: number;
  categoryBreakdown: {
    category: DisputeCategory;
    count: number;
    percentage: number;
    avgResolutionTime: number;
  }[];
  priorityDistribution: {
    priority: DisputePriority;
    count: number;
    percentage: number;
  }[];
  timeToFirstResponse: number;
  timeToResolution: number;
}

export interface DisputeAnalytics {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  startDate: string;
  endDate: string;
  metrics: DisputeMetrics;
  trends: {
    metric: string;
    value: number;
    change: number;
    direction: 'up' | 'down' | 'stable';
  }[];
  bottlenecks: {
    stage: string;
    avgTime: number;
    impactScore: number;
    recommendations: string[];
  }[];
  topPerformers: {
    mediators: MediatorProfile[];
    categories: DisputeCategory[];
  };
}

export interface AutomationConfig {
  enableAutoCategorization: boolean;
  enableAutoAssignment: boolean;
  enablePriorityScoring: boolean;
  enableAIRecommendations: boolean;
  escalationThresholds: {
    timeWithoutResponse: number; // hours
    mediatorUnavailable: number; // hours
    highPriorityTimeout: number; // hours
    criticalPriorityTimeout: number; // hours
  };
  notificationSettings: {
    sendToClient: boolean;
    sendToFreelancer: boolean;
    sendToMediator: boolean;
    frequency: 'immediate' | 'hourly' | 'daily';
  };
  aiModelConfig: {
    categorizationModel: string;
    recommendationModel: string;
    confidenceThreshold: number;
    maxTokens: number;
  };
}

export interface UseDisputeAutomationReturn {
  disputes: DisputeAutomationData[];
  isLoading: boolean;
  error: string | null;
  analytics: DisputeAnalytics | null;
  actions: {
    createDispute: (form: DisputeInitiationForm) => Promise<DisputeAutomationData>;
    categorizeDispute: (disputeId: string) => Promise<DisputeAutomationData>;
    calculatePriority: (disputeId: string) => Promise<PriorityCalculationResult>;
    assignMediator: (disputeId: string, mediatorId?: string) => Promise<CaseAssignmentResult>;
    submitEvidence: (disputeId: string, evidence: EvidenceItem) => Promise<void>;
    generateRecommendation: (disputeId: string) => Promise<ResolutionRecommendation>;
    updateStatus: (disputeId: string, status: DisputeStatus) => Promise<void>;
    escalateDispute: (disputeId: string, reason: string) => Promise<void>;
    closeDispute: (disputeId: string, resolution: string) => Promise<void>;
    getAnalytics: (period?: string) => Promise<DisputeAnalytics>;
  };
}

export interface DisputeNotification {
  id: string;
  disputeId: string;
  recipientId: string;
  type: 'new_dispute' | 'status_update' | 'evidence_required' | 'deadline_approaching' | 'resolution_ready';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  createdAt: string;
  actionRequired: boolean;
  actionUrl?: string;
}

export interface DisputeFilter {
  status?: DisputeStatus[];
  category?: DisputeCategory[];
  priority?: DisputePriority[];
  dateRange?: {
    start: string;
    end: string;
  };
  assignedMediator?: string;
  projectId?: string;
  sortBy?: 'createdAt' | 'priority' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface DisputeMobileState {
  isPortrait: boolean;
  screenSize: 'small' | 'medium' | 'large';
  touchOptimized: boolean;
  useCompactLayout: boolean;
  enableSwipeGestures: boolean;
  showBottomNavigation: boolean;
}

export interface DisputeAccessibility {
  screenReaderEnabled: boolean;
  highContrastMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  reduceMotion: boolean;
  keyboardNavigation: boolean;
}