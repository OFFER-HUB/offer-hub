// Workflow Service for Dispute Resolution System
// Based on PRD.md specifications

import {
  WorkflowState,
  WorkflowStage,
  WorkflowProgress,
  WorkflowNotification,
  WorkflowAuditTrail,
  WorkflowAnalytics,
  WorkflowConfiguration,
  WorkflowStageName,
  WorkflowStageStatus,
  NotificationType,
  DeliveryMethod,
  DisputeOutcome
} from '@/types/workflow.types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const WORKFLOW_ENDPOINT = `${API_BASE_URL}/workflow`;

// Default workflow configuration
export const DEFAULT_WORKFLOW_CONFIG: WorkflowConfiguration = {
  disputeType: 'standard',
  stages: [
    {
      stageName: 'dispute_initiation',
      duration: 2,
      requirements: ['Valid dispute reason', 'Project identification', 'Initial description'],
      actions: ['Submit dispute form', 'Receive confirmation', 'Await mediator assignment'],
      autoAdvance: false,
    },
    {
      stageName: 'mediator_assignment',
      duration: 24,
      requirements: ['Automatic mediator assignment', 'Manual assignment by admin', 'Mediator acceptance'],
      actions: ['Mediator receives notification', 'Mediator reviews details', 'Mediator accepts/declines'],
      autoAdvance: false,
      escalationAfter: 24,
    },
    {
      stageName: 'evidence_collection',
      duration: 72,
      requirements: ['Both parties submit evidence', 'Mediator reviews evidence', 'Evidence validation'],
      actions: ['Upload supporting documents', 'Request additional evidence', 'Review and categorize'],
      autoAdvance: false,
      escalationAfter: 72,
    },
    {
      stageName: 'mediation_process',
      duration: 168,
      requirements: ['Mediator facilitates communication', 'Settlement negotiation', 'Progress documentation'],
      actions: ['Conduct mediation sessions', 'Negotiate settlement terms', 'Document progress'],
      autoAdvance: false,
      escalationAfter: 168,
    },
    {
      stageName: 'resolution_or_escalation',
      duration: 24,
      requirements: ['Mediation outcome documentation', 'Escalation decision', 'Resolution implementation'],
      actions: ['Execute settlement agreement', 'Escalate to arbitration', 'Implement resolution'],
      autoAdvance: false,
    },
    {
      stageName: 'arbitration',
      duration: 336,
      requirements: ['Arbitrator assignment', 'Final evidence review', 'Binding decision'],
      actions: ['Assign arbitrator', 'Review evidence', 'Make final decision'],
      autoAdvance: false,
      escalationAfter: 336,
    },
    {
      stageName: 'resolution_implementation',
      duration: 48,
      requirements: ['Fund release execution', 'Resolution documentation', 'Final notifications'],
      actions: ['Release funds', 'Distribute according to decision', 'Close dispute'],
      autoAdvance: true,
    },
  ],
  timeouts: {
    dispute_initiation: 2,
    mediator_assignment: 24,
    evidence_collection: 72,
    mediation_process: 168,
    resolution_or_escalation: 24,
    arbitration: 336,
    resolution_implementation: 48,
  },
  escalationRules: [
    {
      fromStage: 'mediator_assignment',
      toStage: 'evidence_collection',
      trigger: 'timeout',
    },
    {
      fromStage: 'evidence_collection',
      toStage: 'mediation_process',
      trigger: 'timeout',
    },
    {
      fromStage: 'mediation_process',
      toStage: 'arbitration',
      trigger: 'condition',
      condition: 'mediation_failed',
    },
    {
      fromStage: 'arbitration',
      toStage: 'resolution_implementation',
      trigger: 'timeout',
    },
  ],
  notificationSettings: {
    enabled: true,
    channels: ['in_app', 'email', 'push'],
    timing: {
      immediate: ['stage_transition', 'action_required', 'deadline_alert'],
      daily: ['evidence_request', 'mediator_assignment'],
      weekly: ['resolution_update'],
    },
  },
};

// API Response interface
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

// Workflow Service Class
export class WorkflowService {
  private static instance: WorkflowService;
  private baseUrl: string;

  constructor(baseUrl: string = WORKFLOW_ENDPOINT) {
    this.baseUrl = baseUrl;
  }

  static getInstance(): WorkflowService {
    if (!WorkflowService.instance) {
      WorkflowService.instance = new WorkflowService();
    }
    return WorkflowService.instance;
  }

  // Private helper method for API calls
  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('API call failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date(),
      };
    }
  }

  // Workflow State Management
  async getWorkflowState(disputeId: string): Promise<WorkflowState | null> {
    const response = await this.apiCall<WorkflowState>(`/disputes/${disputeId}/workflow`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch workflow state');
    }

    return response.data;
  }

  async initializeWorkflow(disputeId: string, configuration?: Partial<WorkflowConfiguration>): Promise<WorkflowState> {
    const config = { ...DEFAULT_WORKFLOW_CONFIG, ...configuration };
    
    const response = await this.apiCall<WorkflowState>('/workflows', {
      method: 'POST',
      body: JSON.stringify({
        disputeId,
        configuration: config,
      }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to initialize workflow');
    }

    return response.data;
  }

  async updateWorkflowState(disputeId: string, updates: Partial<WorkflowState>): Promise<WorkflowState> {
    const response = await this.apiCall<WorkflowState>(`/disputes/${disputeId}/workflow`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update workflow state');
    }

    return response.data;
  }

  // Stage Management
  async getWorkflowStages(disputeId: string): Promise<WorkflowStage[]> {
    const response = await this.apiCall<WorkflowStage[]>(`/disputes/${disputeId}/stages`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch workflow stages');
    }

    return response.data;
  }

  async transitionStage(
    disputeId: string,
    stage: WorkflowStageName,
    data?: Record<string, any>
  ): Promise<WorkflowState> {
    const response = await this.apiCall<WorkflowState>(`/disputes/${disputeId}/stages`, {
      method: 'POST',
      body: JSON.stringify({
        stage,
        data,
      }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to transition stage');
    }

    return response.data;
  }

  async updateStageStatus(
    disputeId: string,
    stageId: string,
    status: WorkflowStageStatus,
    metadata?: Record<string, any>
  ): Promise<WorkflowStage> {
    const response = await this.apiCall<WorkflowStage>(`/disputes/${disputeId}/stages/${stageId}`, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        metadata,
      }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update stage status');
    }

    return response.data;
  }

  // Progress Tracking
  async getWorkflowProgress(disputeId: string): Promise<WorkflowProgress[]> {
    const response = await this.apiCall<WorkflowProgress[]>(`/disputes/${disputeId}/progress`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch workflow progress');
    }

    return response.data;
  }

  async updateProgress(
    disputeId: string,
    progress: Partial<WorkflowProgress>
  ): Promise<WorkflowProgress> {
    const response = await this.apiCall<WorkflowProgress>(`/disputes/${disputeId}/progress`, {
      method: 'PUT',
      body: JSON.stringify(progress),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update progress');
    }

    return response.data;
  }

  async addMilestone(
    disputeId: string,
    stageId: string,
    milestone: string,
    notes?: string,
    progressPercentage?: number
  ): Promise<WorkflowProgress> {
    const response = await this.apiCall<WorkflowProgress>(`/disputes/${disputeId}/milestones`, {
      method: 'POST',
      body: JSON.stringify({
        stageId,
        milestone,
        notes,
        progressPercentage,
      }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to add milestone');
    }

    return response.data;
  }

  // Notification Management
  async getNotifications(disputeId: string): Promise<WorkflowNotification[]> {
    const response = await this.apiCall<WorkflowNotification[]>(`/disputes/${disputeId}/notifications`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch notifications');
    }

    return response.data;
  }

  async sendNotification(
    disputeId: string,
    notification: Omit<WorkflowNotification, 'id' | 'sentAt'>
  ): Promise<WorkflowNotification> {
    const response = await this.apiCall<WorkflowNotification>(`/disputes/${disputeId}/notifications`, {
      method: 'POST',
      body: JSON.stringify(notification),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to send notification');
    }

    return response.data;
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const response = await this.apiCall<void>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to mark notification as read');
    }
  }

  async updateNotificationPreferences(
    disputeId: string,
    preferences: Record<string, any>
  ): Promise<void> {
    const response = await this.apiCall<void>(`/disputes/${disputeId}/notification-preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to update notification preferences');
    }
  }

  // Deadline Management
  async getDeadlines(disputeId: string): Promise<any[]> {
    const response = await this.apiCall<any[]>(`/disputes/${disputeId}/deadlines`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch deadlines');
    }

    return response.data;
  }

  async extendDeadline(
    disputeId: string,
    stageId: string,
    extensionHours: number,
    reason: string
  ): Promise<void> {
    const response = await this.apiCall<void>(`/disputes/${disputeId}/deadlines/extend`, {
      method: 'POST',
      body: JSON.stringify({
        stageId,
        extensionHours,
        reason,
      }),
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to extend deadline');
    }
  }

  async triggerEscalation(
    disputeId: string,
    stageId: string,
    reason: string
  ): Promise<void> {
    const response = await this.apiCall<void>(`/disputes/${disputeId}/escalate`, {
      method: 'POST',
      body: JSON.stringify({
        stageId,
        reason,
      }),
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to trigger escalation');
    }
  }

  // Audit Trail
  async getAuditTrail(disputeId: string): Promise<WorkflowAuditTrail[]> {
    const response = await this.apiCall<WorkflowAuditTrail[]>(`/disputes/${disputeId}/audit`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch audit trail');
    }

    return response.data;
  }

  async logAuditEvent(
    disputeId: string,
    action: string,
    performedBy: string,
    oldState?: Record<string, any>,
    newState?: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<WorkflowAuditTrail> {
    const response = await this.apiCall<WorkflowAuditTrail>(`/disputes/${disputeId}/audit`, {
      method: 'POST',
      body: JSON.stringify({
        action,
        performedBy,
        oldState,
        newState,
        metadata,
      }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to log audit event');
    }

    return response.data;
  }

  // Analytics
  async getWorkflowAnalytics(disputeId?: string, timeRange?: string): Promise<WorkflowAnalytics> {
    const params = new URLSearchParams();
    if (disputeId) params.append('disputeId', disputeId);
    if (timeRange) params.append('timeRange', timeRange);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/analytics/workflow?${queryString}` : '/analytics/workflow';
    
    const response = await this.apiCall<WorkflowAnalytics>(endpoint);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch analytics');
    }

    return response.data;
  }

  async exportAnalytics(disputeId?: string, format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const params = new URLSearchParams();
    if (disputeId) params.append('disputeId', disputeId);
    params.append('format', format);
    
    const response = await fetch(`${this.baseUrl}/analytics/export?${params.toString()}`, {
      method: 'GET',
      headers: {
        Accept: format === 'json' ? 'application/json' : 'text/csv',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to export analytics: ${response.statusText}`);
    }

    return response.blob();
  }

  // Dispute-specific Operations
  async initiateDispute(disputeId: string, disputeData: Record<string, any>): Promise<WorkflowState> {
    return this.transitionStage(disputeId, 'dispute_initiation', disputeData);
  }

  async assignMediator(disputeId: string, mediatorId: string, adminId: string): Promise<WorkflowState> {
    return this.transitionStage(disputeId, 'mediator_assignment', {
      mediatorId,
      assignedBy: adminId,
    });
  }

  async collectEvidence(disputeId: string, evidenceData: Record<string, any>): Promise<WorkflowState> {
    return this.transitionStage(disputeId, 'evidence_collection', evidenceData);
  }

  async conductMediation(disputeId: string, mediationData: Record<string, any>): Promise<WorkflowState> {
    return this.transitionStage(disputeId, 'mediation_process', mediationData);
  }

  async resolveDispute(disputeId: string, outcome: DisputeOutcome, resolutionData: Record<string, any>): Promise<WorkflowState> {
    return this.transitionStage(disputeId, 'resolution_or_escalation', {
      outcome,
      ...resolutionData,
    });
  }

  async conductArbitration(disputeId: string, arbitrationData: Record<string, any>): Promise<WorkflowState> {
    return this.transitionStage(disputeId, 'arbitration', arbitrationData);
  }

  async implementResolution(disputeId: string, implementationData: Record<string, any>): Promise<WorkflowState> {
    return this.transitionStage(disputeId, 'resolution_implementation', implementationData);
  }

  // Configuration Management
  async getWorkflowConfiguration(disputeType: string): Promise<WorkflowConfiguration> {
    const response = await this.apiCall<WorkflowConfiguration>(`/configurations/${disputeType}`);
    
    if (!response.success || !response.data) {
      // Return default configuration if not found
      return DEFAULT_WORKFLOW_CONFIG;
    }

    return response.data;
  }

  async updateWorkflowConfiguration(
    disputeType: string,
    configuration: Partial<WorkflowConfiguration>
  ): Promise<WorkflowConfiguration> {
    const response = await this.apiCall<WorkflowConfiguration>(`/configurations/${disputeType}`, {
      method: 'PUT',
      body: JSON.stringify(configuration),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update workflow configuration');
    }

    return response.data;
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.apiCall<{ status: string }>('/health');
      return response.success && response.data?.status === 'healthy';
    } catch (error) {
      return false;
    }
  }

  // Utility Methods
  async retryFailedOperations(disputeId: string): Promise<void> {
    const response = await this.apiCall<void>(`/disputes/${disputeId}/retry`, {
      method: 'POST',
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to retry failed operations');
    }
  }

  async cleanupExpiredWorkflows(): Promise<number> {
    const response = await this.apiCall<{ cleaned: number }>('/cleanup', {
      method: 'POST',
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to cleanup expired workflows');
    }

    return response.data.cleaned;
  }
}

// Export singleton instance
export const workflowService = WorkflowService.getInstance();

// Export utility functions
export const createWorkflowNotification = (
  disputeId: string,
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  deliveryMethod: DeliveryMethod = 'in_app'
): Omit<WorkflowNotification, 'id' | 'sentAt'> => ({
  disputeId,
  userId,
  notificationType: type,
  title,
  message,
  deliveryMethod,
});

export const createAuditTrailEntry = (
  disputeId: string,
  action: string,
  performedBy: string,
  oldState?: Record<string, any>,
  newState?: Record<string, any>,
  metadata?: Record<string, any>
): Omit<WorkflowAuditTrail, 'id' | 'performedAt'> => ({
  disputeId,
  action,
  performedBy,
  oldState,
  newState,
  metadata,
});

export const calculateStageProgress = (
  stage: WorkflowStage,
  milestones: WorkflowProgress[]
): number => {
  const stageMilestones = milestones.filter(m => m.stageId === stage.id);
  if (stageMilestones.length === 0) return 0;
  
  const totalProgress = stageMilestones.reduce((sum, m) => sum + m.progressPercentage, 0);
  return Math.round(totalProgress / stageMilestones.length);
};

export const getNextDeadline = (stages: WorkflowStage[]): Date | null => {
  const upcomingStages = stages.filter(s => 
    s.status === 'in_progress' || s.status === 'pending'
  );
  
  if (upcomingStages.length === 0) return null;
  
  return new Date(Math.min(...upcomingStages.map(s => s.deadline?.getTime() || Infinity)));
};

export const isStageOverdue = (stage: WorkflowStage): boolean => {
  if (!stage.deadline || stage.status === 'completed') return false;
  return new Date() > stage.deadline;
};

export const getWorkflowHealthScore = (workflowState: WorkflowState): number => {
  const stages = workflowState.configuration.stages;
  const completedStages = stages.filter(s => s.stageName === workflowState.currentStage).length;
  const overdueStages = stages.filter(s => isStageOverdue({
    id: s.stageName,
    disputeId: workflowState.disputeId,
    stageName: s.stageName,
    stageOrder: 0,
    status: 'in_progress',
    deadline: new Date(Date.now() + s.duration * 60 * 60 * 1000)
  })).length;
  
  const baseScore = (completedStages / stages.length) * 100;
  const penalty = overdueStages * 10;
  
  return Math.max(0, Math.min(100, baseScore - penalty));
};
