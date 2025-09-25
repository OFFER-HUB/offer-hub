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
  DisputeOutcome
} from '../types/workflow.types';

// Simple logger using console
const logger = {
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  },
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  }
};

export class WorkflowService {
  private mockData: Map<string, any> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock workflow state
    this.mockData.set('demo-dispute-001', {
      id: 'wf_demo_001',
      disputeId: 'demo-dispute-001',
      currentStage: 'mediator_assignment',
      status: 'active',
      progress: 40,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Mock stages
    this.mockData.set('demo-dispute-001-stages', [
      { id: '1', name: 'dispute_initiation', status: 'completed', progress: 100 },
      { id: '2', name: 'mediator_assignment', status: 'in_progress', progress: 60 },
      { id: '3', name: 'evidence_collection', status: 'pending', progress: 0 },
      { id: '4', name: 'mediation', status: 'pending', progress: 0 },
      { id: '5', name: 'resolution', status: 'pending', progress: 0 }
    ]);

    // Mock progress
    this.mockData.set('demo-dispute-001-progress', {
      id: 'prog_demo_001',
      disputeId: 'demo-dispute-001',
      progressPercentage: 40,
      milestone: 'Mediator Assignment in Progress',
      notes: 'Waiting for mediator response',
      updatedBy: 'system',
      updatedAt: new Date()
    });

    // Mock notifications
    this.mockData.set('demo-dispute-001-notifications', [
      {
        id: 'notif_1',
        disputeId: 'demo-dispute-001',
        userId: 'user_1',
        notificationType: 'stage_transition',
        message: 'Dispute has moved to Mediator Assignment stage',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'notif_2',
        disputeId: 'demo-dispute-001',
        userId: 'user_1',
        notificationType: 'deadline_warning',
        message: 'Mediator assignment deadline in 24 hours',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ]);

    // Mock analytics
    this.mockData.set('analytics', {
      totalDisputes: 10,
      resolvedDisputes: 7,
      averageResolutionTime: '5.2 days',
      stageDistribution: {
        dispute_initiation: 10,
        mediator_assignment: 8,
        evidence_collection: 6,
        mediation: 4,
        resolution: 7
      }
    });
  }

  // Basic workflow state management
  async getWorkflowState(disputeId: string): Promise<WorkflowState | null> {
    console.log(`[MOCK] Getting workflow state for ${disputeId}`);
    const state = this.mockData.get(disputeId);
    return state || null;
  }

  async initializeWorkflow(disputeId: string, configuration?: any): Promise<WorkflowState> {
    console.log(`[MOCK] Initializing workflow for ${disputeId}`);
    const workflowState: WorkflowState = {
      id: `wf_${disputeId}_${Date.now()}`,
      disputeId,
      currentStage: 'dispute_initiation',
      status: 'active',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mockData.set(disputeId, workflowState);
    return workflowState;
  }

  async updateWorkflowState(disputeId: string, updates: Partial<WorkflowState>): Promise<WorkflowState> {
    console.log(`[MOCK] Updating workflow state for ${disputeId}`);
    const currentState = this.mockData.get(disputeId);
    if (!currentState) {
      throw new Error('Workflow not found');
    }

    const updatedState = {
      ...currentState,
      ...updates,
      updatedAt: new Date()
    };

    this.mockData.set(disputeId, updatedState);
    return updatedState;
  }

  async getWorkflowStages(disputeId: string): Promise<WorkflowStage[]> {
    console.log(`[MOCK] Getting workflow stages for ${disputeId}`);
    const stages = this.mockData.get(`${disputeId}-stages`);
    return stages || [];
  }

  async transitionStage(disputeId: string, stage: WorkflowStageName, data?: any): Promise<WorkflowState> {
    console.log(`[MOCK] Transitioning stage for ${disputeId} to ${stage}`);
    const currentState = this.mockData.get(disputeId);
    if (!currentState) {
      throw new Error('Workflow not found');
    }

    const updatedState = await this.updateWorkflowState(disputeId, {
      currentStage: stage,
      progress: this.calculateProgress(stage)
    });

    return updatedState;
  }

  async getWorkflowProgress(disputeId: string): Promise<WorkflowProgress | null> {
    console.log(`[MOCK] Getting workflow progress for ${disputeId}`);
    const progress = this.mockData.get(`${disputeId}-progress`);
    return progress || null;
  }

  async updateProgress(disputeId: string, progress: Partial<WorkflowProgress>): Promise<WorkflowProgress> {
    console.log(`[MOCK] Updating progress for ${disputeId}`);
    const progressData: WorkflowProgress = {
      id: `prog_${disputeId}_${Date.now()}`,
      disputeId,
      progressPercentage: progress.progressPercentage || 0,
      milestone: progress.milestone || 'Progress updated',
      notes: progress.notes,
      updatedBy: progress.updatedBy || 'system',
      updatedAt: new Date()
    };

    this.mockData.set(`${disputeId}-progress`, progressData);
    return progressData;
  }

  async getNotifications(disputeId: string): Promise<WorkflowNotification[]> {
    console.log(`[MOCK] Getting notifications for ${disputeId}`);
    const notifications = this.mockData.get(`${disputeId}-notifications`);
    return notifications || [];
  }

  async sendNotification(disputeId: string, notification: Partial<WorkflowNotification>): Promise<WorkflowNotification> {
    console.log(`[MOCK] Sending notification for ${disputeId}`);
    const notificationData: WorkflowNotification = {
      id: `notif_${disputeId}_${Date.now()}`,
      disputeId,
      userId: notification.userId || 'system',
      notificationType: notification.notificationType || 'general',
      message: notification.message || 'Workflow notification',
      isRead: false,
      createdAt: new Date()
    };

    const notifications = this.mockData.get(`${disputeId}-notifications`) || [];
    notifications.push(notificationData);
    this.mockData.set(`${disputeId}-notifications`, notifications);

    return notificationData;
  }

  async getAuditTrail(disputeId: string): Promise<WorkflowAuditTrail[]> {
    console.log(`[MOCK] Getting audit trail for ${disputeId}`);
    return [];
  }

  async logAuditEvent(
    disputeId: string,
    action: string,
    performedBy: string,
    oldState?: any,
    newState?: any,
    metadata?: any
  ): Promise<WorkflowAuditTrail> {
    console.log(`[MOCK] Logging audit event for ${disputeId}: ${action}`);
    const auditEntry: WorkflowAuditTrail = {
      id: `audit_${disputeId}_${Date.now()}`,
      disputeId,
      action,
      performedBy,
      oldState,
      newState,
      metadata,
      timestamp: new Date()
    };

    return auditEntry;
  }

  async getWorkflowAnalytics(disputeId?: string, timeRange?: string): Promise<WorkflowAnalytics> {
    console.log(`[MOCK] Getting workflow analytics for ${disputeId}`);
    const analytics = this.mockData.get('analytics');
    return analytics;
  }

  async exportAnalytics(disputeId?: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    console.log(`[MOCK] Exporting analytics for ${disputeId}`);
    const analytics = await this.getWorkflowAnalytics(disputeId);
    
    if (format === 'csv') {
      return `Total Disputes,Resolved Disputes,Average Resolution Time\n${analytics.totalDisputes},${analytics.resolvedDisputes},"${analytics.averageResolutionTime}"`;
    }
    
    return JSON.stringify(analytics, null, 2);
  }

  async healthCheck(): Promise<boolean> {
    console.log('[MOCK] Health check - always healthy');
    return true;
  }

  // Utility methods
  private calculateProgress(stage: WorkflowStageName): number {
    const stageProgress: Record<WorkflowStageName, number> = {
      dispute_initiation: 20,
      mediator_assignment: 40,
      evidence_collection: 60,
      mediation: 80,
      resolution: 100,
      arbitration: 90,
      resolution_implementation: 100
    };
    
    return stageProgress[stage] || 0;
  }

  // Additional methods needed by controller
  async updateStageStatus(disputeId: string, stageId: string, status: WorkflowStageStatus, metadata?: any): Promise<WorkflowStage> {
    console.log(`[MOCK] Updating stage status for ${disputeId}, stage ${stageId}`);
    return {
      id: stageId,
      name: 'dispute_initiation',
      status,
      metadata
    };
  }

  async addMilestone(disputeId: string, stageId: string, milestone: string, notes?: string, progressPercentage?: number): Promise<any> {
    console.log(`[MOCK] Adding milestone for ${disputeId}`);
    return {
      id: `milestone_${disputeId}_${Date.now()}`,
      disputeId,
      stageId,
      milestone,
      notes,
      progressPercentage: progressPercentage || 0,
      createdAt: new Date()
    };
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    console.log(`[MOCK] Marking notification ${notificationId} as read`);
  }

  async updateNotificationPreferences(disputeId: string, preferences: any): Promise<void> {
    console.log(`[MOCK] Updating notification preferences for ${disputeId}`);
  }

  async getDeadlines(disputeId: string): Promise<any[]> {
    console.log(`[MOCK] Getting deadlines for ${disputeId}`);
    return [];
  }

  async extendDeadline(disputeId: string, stageId: string, extensionHours: number, reason: string): Promise<void> {
    console.log(`[MOCK] Extending deadline for ${disputeId}`);
  }

  async triggerEscalation(disputeId: string, stageId: string, reason: string): Promise<void> {
    console.log(`[MOCK] Triggering escalation for ${disputeId}`);
  }

  async getWorkflowConfiguration(disputeType: string): Promise<WorkflowConfiguration> {
    console.log(`[MOCK] Getting workflow configuration for ${disputeType}`);
    return {
      disputeType,
      stages: [],
      timeouts: {},
      notifications: {}
    };
  }

  async updateWorkflowConfiguration(disputeType: string, configuration: WorkflowConfiguration): Promise<WorkflowConfiguration> {
    console.log(`[MOCK] Updating workflow configuration for ${disputeType}`);
    return configuration;
  }

  // Dispute-specific operations
  async initiateDispute(disputeId: string, disputeData: any): Promise<WorkflowState> {
    console.log(`[MOCK] Initiating dispute ${disputeId}`);
    return this.initializeWorkflow(disputeId, disputeData);
  }

  async assignMediator(disputeId: string, mediatorId: string, userId: string): Promise<WorkflowState> {
    console.log(`[MOCK] Assigning mediator ${mediatorId} to dispute ${disputeId}`);
    return this.transitionStage(disputeId, 'mediator_assignment', { mediatorId, assignedBy: userId });
  }

  async collectEvidence(disputeId: string, evidenceData: any): Promise<WorkflowState> {
    console.log(`[MOCK] Collecting evidence for dispute ${disputeId}`);
    return this.transitionStage(disputeId, 'evidence_collection', evidenceData);
  }

  async conductMediation(disputeId: string, mediationData: any): Promise<WorkflowState> {
    console.log(`[MOCK] Conducting mediation for dispute ${disputeId}`);
    return this.transitionStage(disputeId, 'mediation', mediationData);
  }

  async resolveDispute(disputeId: string, outcome: DisputeOutcome, resolutionData: any): Promise<WorkflowState> {
    console.log(`[MOCK] Resolving dispute ${disputeId}`);
    return this.transitionStage(disputeId, 'resolution', { outcome, ...resolutionData });
  }

  async conductArbitration(disputeId: string, arbitrationData: any): Promise<WorkflowState> {
    console.log(`[MOCK] Conducting arbitration for dispute ${disputeId}`);
    return this.transitionStage(disputeId, 'arbitration', arbitrationData);
  }

  async implementResolution(disputeId: string, implementationData: any): Promise<WorkflowState> {
    console.log(`[MOCK] Implementing resolution for dispute ${disputeId}`);
    return this.transitionStage(disputeId, 'resolution_implementation', implementationData);
  }

  async retryFailedOperations(disputeId: string): Promise<void> {
    console.log(`[MOCK] Retrying failed operations for ${disputeId}`);
  }

  async cleanupExpiredWorkflows(): Promise<number> {
    console.log('[MOCK] Cleaning up expired workflows');
    return 0;
  }
}
