import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/supabase';
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
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = supabase;
  }

  // Basic workflow state management
  async getWorkflowState(disputeId: string): Promise<WorkflowState | null> {
    try {
      const { data, error } = await this.supabase
        .from('workflow_stages')
        .select('*')
        .eq('dispute_id', disputeId)
        .maybeSingle(); // Use maybeSingle() instead of single()

      if (error) {
        logger.error('Error fetching workflow state:', error);
        return null;
      }

      // If no data found, return null (this is expected for non-existent workflows)
      if (!data) {
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Error in getWorkflowState:', error);
      return null;
    }
  }

  async initializeWorkflow(disputeId: string, configuration?: any): Promise<WorkflowState> {
    const workflowState: WorkflowState = {
      id: `wf_${disputeId}_${Date.now()}`,
      disputeId,
      currentStage: 'dispute_initiation',
      status: 'active',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      const { error } = await this.supabase
        .from('workflow_stages')
        .insert([{
          id: workflowState.id,
          dispute_id: workflowState.disputeId,
          current_stage: workflowState.currentStage,
          status: workflowState.status,
          progress: workflowState.progress,
          created_at: workflowState.createdAt.toISOString(),
          updated_at: workflowState.updatedAt.toISOString()
        }]);

      if (error) {
        logger.error('Error initializing workflow:', error);
        throw error;
      }

      return workflowState;
    } catch (error) {
      logger.error('Error in initializeWorkflow:', error);
      throw error;
    }
  }

  async updateWorkflowState(disputeId: string, updates: Partial<WorkflowState>): Promise<WorkflowState> {
    const currentState = await this.getWorkflowState(disputeId);
    if (!currentState) {
      throw new Error('Workflow not found');
    }

    const updatedState = {
      ...currentState,
      ...updates,
      updatedAt: new Date()
    };

    try {
      const { error } = await this.supabase
        .from('workflow_stages')
        .update({
          current_stage: updatedState.currentStage,
          status: updatedState.status,
          progress: updatedState.progress,
          updated_at: updatedState.updatedAt.toISOString()
        })
        .eq('dispute_id', disputeId);

      if (error) {
        logger.error('Error updating workflow state:', error);
        throw error;
      }

      return updatedState;
    } catch (error) {
      logger.error('Error in updateWorkflowState:', error);
      throw error;
    }
  }

  async getWorkflowStages(disputeId: string): Promise<WorkflowStage[]> {
    try {
      const { data, error } = await this.supabase
        .from('workflow_stages')
        .select('*')
        .eq('dispute_id', disputeId)
        .order('stage_order');

      if (error) {
        logger.error('Error fetching workflow stages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getWorkflowStages:', error);
      return [];
    }
  }

  async transitionStage(disputeId: string, stage: WorkflowStageName, data?: any): Promise<WorkflowState> {
    const currentState = await this.getWorkflowState(disputeId);
    if (!currentState) {
      throw new Error('Workflow not found');
    }

    const updatedState = await this.updateWorkflowState(disputeId, {
      currentStage: stage,
      progress: this.calculateProgress(stage)
    });

    // Log audit event
    await this.logAuditEvent(disputeId, 'stage_transition', 'system', 
      { previousStage: currentState.currentStage }, 
      { newStage: stage, ...data }
    );

    return updatedState;
  }

  async getWorkflowProgress(disputeId: string): Promise<WorkflowProgress | null> {
    try {
      const { data, error } = await this.supabase
        .from('workflow_progress')
        .select('*')
        .eq('dispute_id', disputeId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        logger.error('Error fetching workflow progress:', error);
        return null;
      }

      // If no data found, return null (this is expected for non-existent workflows)
      if (!data) {
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Error in getWorkflowProgress:', error);
      return null;
    }
  }

  async updateProgress(disputeId: string, progress: Partial<WorkflowProgress>): Promise<WorkflowProgress> {
    const progressData: WorkflowProgress = {
      id: `prog_${disputeId}_${Date.now()}`,
      disputeId,
      progressPercentage: progress.progressPercentage || 0,
      milestone: progress.milestone || 'Progress updated',
      notes: progress.notes,
      updatedBy: progress.updatedBy || 'system',
      updatedAt: new Date()
    };

    try {
      const { error } = await this.supabase
        .from('workflow_progress')
        .insert([{
          id: progressData.id,
          dispute_id: progressData.disputeId,
          progress_percentage: progressData.progressPercentage,
          milestone: progressData.milestone,
          notes: progressData.notes,
          updated_by: progressData.updatedBy,
          updated_at: progressData.updatedAt.toISOString()
        }]);

      if (error) {
        logger.error('Error updating progress:', error);
        throw error;
      }

      return progressData;
    } catch (error) {
      logger.error('Error in updateProgress:', error);
      throw error;
    }
  }

  async getNotifications(disputeId: string): Promise<WorkflowNotification[]> {
    try {
      const { data, error } = await this.supabase
        .from('workflow_notifications')
        .select('*')
        .eq('dispute_id', disputeId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getNotifications:', error);
      return [];
    }
  }

  async sendNotification(disputeId: string, notification: Partial<WorkflowNotification>): Promise<WorkflowNotification> {
    const notificationData: WorkflowNotification = {
      id: `notif_${disputeId}_${Date.now()}`,
      disputeId,
      userId: notification.userId || 'system',
      notificationType: notification.notificationType || 'general',
      message: notification.message || 'Workflow notification',
      isRead: false,
      createdAt: new Date()
    };

    try {
      const { error } = await this.supabase
        .from('workflow_notifications')
        .insert([{
          id: notificationData.id,
          dispute_id: notificationData.disputeId,
          user_id: notificationData.userId,
          notification_type: notificationData.notificationType,
          message: notificationData.message,
          is_read: notificationData.isRead,
          created_at: notificationData.createdAt.toISOString()
        }]);

      if (error) {
        logger.error('Error sending notification:', error);
        throw error;
      }

      return notificationData;
    } catch (error) {
      logger.error('Error in sendNotification:', error);
      throw error;
    }
  }

  async getAuditTrail(disputeId: string): Promise<WorkflowAuditTrail[]> {
    try {
      const { data, error } = await this.supabase
        .from('workflow_audit_trail')
        .select('*')
        .eq('dispute_id', disputeId)
        .order('timestamp', { ascending: false });

      if (error) {
        logger.error('Error fetching audit trail:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getAuditTrail:', error);
      return [];
    }
  }

  async logAuditEvent(
    disputeId: string,
    action: string,
    performedBy: string,
    oldState?: any,
    newState?: any,
    metadata?: any
  ): Promise<WorkflowAuditTrail> {
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

    try {
      const { error } = await this.supabase
        .from('workflow_audit_trail')
        .insert([{
          id: auditEntry.id,
          dispute_id: auditEntry.disputeId,
          action: auditEntry.action,
          performed_by: auditEntry.performedBy,
          old_state: auditEntry.oldState,
          new_state: auditEntry.newState,
          metadata: auditEntry.metadata,
          timestamp: auditEntry.timestamp.toISOString()
        }]);

      if (error) {
        logger.error('Error logging audit event:', error);
        throw error;
      }

      return auditEntry;
    } catch (error) {
      logger.error('Error in logAuditEvent:', error);
      throw error;
    }
  }

  async getWorkflowAnalytics(disputeId?: string, timeRange?: string): Promise<WorkflowAnalytics> {
    // Mock analytics data
    return {
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
    };
  }

  async exportAnalytics(disputeId?: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    const analytics = await this.getWorkflowAnalytics(disputeId);
    
    if (format === 'csv') {
      return `Total Disputes,Resolved Disputes,Average Resolution Time\n${analytics.totalDisputes},${analytics.resolvedDisputes},"${analytics.averageResolutionTime}"`;
    }
    
    return JSON.stringify(analytics, null, 2);
  }

  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('workflow_stages')
        .select('count')
        .limit(1);
      
      return !error;
    } catch (error) {
      logger.error('Health check failed:', error);
      return false;
    }
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

  // Dispute-specific operations
  async initiateDispute(disputeId: string, disputeData: any): Promise<WorkflowState> {
    return this.initializeWorkflow(disputeId, disputeData);
  }

  async assignMediator(disputeId: string, mediatorId: string, userId: string): Promise<WorkflowState> {
    return this.transitionStage(disputeId, 'mediator_assignment', { mediatorId, assignedBy: userId });
  }

  async collectEvidence(disputeId: string, evidenceData: any): Promise<WorkflowState> {
    return this.transitionStage(disputeId, 'evidence_collection', evidenceData);
  }

  async conductMediation(disputeId: string, mediationData: any): Promise<WorkflowState> {
    return this.transitionStage(disputeId, 'mediation', mediationData);
  }

  async resolveDispute(disputeId: string, outcome: DisputeOutcome, resolutionData: any): Promise<WorkflowState> {
    return this.transitionStage(disputeId, 'resolution', { outcome, ...resolutionData });
  }

  async conductArbitration(disputeId: string, arbitrationData: any): Promise<WorkflowState> {
    return this.transitionStage(disputeId, 'arbitration', arbitrationData);
  }

  async implementResolution(disputeId: string, implementationData: any): Promise<WorkflowState> {
    return this.transitionStage(disputeId, 'resolution_implementation', implementationData);
  }

  async retryFailedOperations(disputeId: string): Promise<void> {
    logger.info('Retrying failed operations for dispute:', disputeId);
    // Implementation would go here
  }

  async cleanupExpiredWorkflows(): Promise<number> {
    logger.info('Cleaning up expired workflows');
    // Implementation would go here
    return 0;
  }

  // Additional methods needed by controller
  async updateStageStatus(disputeId: string, stageId: string, status: WorkflowStageStatus, metadata?: any): Promise<WorkflowStage> {
    try {
      const { error } = await this.supabase
        .from('workflow_stages')
        .update({
          status,
          metadata: metadata || {},
          updated_at: new Date().toISOString()
        })
        .eq('id', stageId)
        .eq('dispute_id', disputeId);

      if (error) {
        logger.error('Error updating stage status:', error);
        throw error;
      }

      // Return mock stage
      return {
        id: stageId,
        name: 'dispute_initiation',
        status,
        metadata
      };
    } catch (error) {
      logger.error('Error in updateStageStatus:', error);
      throw error;
    }
  }

  async addMilestone(disputeId: string, stageId: string, milestone: string, notes?: string, progressPercentage?: number): Promise<any> {
    const milestoneData = {
      id: `milestone_${disputeId}_${Date.now()}`,
      disputeId,
      stageId,
      milestone,
      notes,
      progressPercentage: progressPercentage || 0,
      createdAt: new Date()
    };

    // Log as audit event
    await this.logAuditEvent(disputeId, 'milestone_added', 'system', undefined, milestoneData);
    
    return milestoneData;
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('workflow_notifications')
        .update({
          is_read: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) {
        logger.error('Error marking notification as read:', error);
        throw error;
      }
    } catch (error) {
      logger.error('Error in markNotificationAsRead:', error);
      throw error;
    }
  }

  async updateNotificationPreferences(disputeId: string, preferences: any): Promise<void> {
    logger.info('Updating notification preferences:', { disputeId, preferences });
    // Implementation would go here
  }

  async getDeadlines(disputeId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('workflow_stages')
        .select('deadline, stage_name')
        .eq('dispute_id', disputeId)
        .not('deadline', 'is', null);

      if (error) {
        logger.error('Error fetching deadlines:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getDeadlines:', error);
      return [];
    }
  }

  async extendDeadline(disputeId: string, stageId: string, extensionHours: number, reason: string): Promise<void> {
    logger.info('Extending deadline:', { disputeId, stageId, extensionHours, reason });
    // Implementation would go here
  }

  async triggerEscalation(disputeId: string, stageId: string, reason: string): Promise<void> {
    logger.info('Triggering escalation:', { disputeId, stageId, reason });
    // Implementation would go here
  }

  async getWorkflowConfiguration(disputeType: string): Promise<WorkflowConfiguration> {
    // Return default configuration
    return {
      disputeType,
      stages: [],
      timeouts: {},
      notifications: {}
    };
  }

  async updateWorkflowConfiguration(disputeType: string, configuration: WorkflowConfiguration): Promise<WorkflowConfiguration> {
    logger.info('Updating workflow configuration:', { disputeType, configuration });
    return configuration;
  }
}
