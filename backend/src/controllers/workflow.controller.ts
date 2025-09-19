import { Request, Response } from 'express';
import { WorkflowService } from '../services/workflow.service.simple';
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
import { ApiResponse } from '../types/api.type';
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
// import expressValidator from 'express-validator';
// const { validationResult } = expressValidator;

export class WorkflowController {
  private workflowService: WorkflowService;

  constructor() {
    this.workflowService = new WorkflowService();
  }

  // Workflow State Management
  async getWorkflowState(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const userId = req.user?.id;

      // Temporarily disabled for testing
      // if (!userId) {
      //   res.status(401).json({
      //     success: false,
      //     error: 'Authentication required'
      //   });
      //   return;
      // }

      const workflowState = await this.workflowService.getWorkflowState(disputeId);
      
      if (!workflowState) {
        res.status(200).json({
          success: false,
          error: 'Workflow not found'
        });
        return;
      }

      res.json({
        success: true,
        data: workflowState,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error getting workflow state:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async initializeWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId, configuration } = req.body;
      const userId = req.user?.id;

      // Temporarily disabled for testing
      // if (!userId) {
      //   res.status(401).json({
      //     success: false,
      //     error: 'Authentication required'
      //   });
      //   return;
      // }

      const workflowState = await this.workflowService.initializeWorkflow(disputeId, configuration);

      // Log audit event
      await this.workflowService.logAuditEvent(
        disputeId,
        'workflow_initialized',
        userId,
        undefined,
        { configuration },
        { disputeId }
      );

      res.status(201).json({
        success: true,
        data: workflowState,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error initializing workflow:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to initialize workflow'
      });
    }
  }

  async updateWorkflowState(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const updates = req.body;
      const userId = req.user?.id;

      // Temporarily disabled for testing
      // if (!userId) {
      //   res.status(401).json({
      //     success: false,
      //     error: 'Authentication required'
      //   });
      //   return;
      // }

      const workflowState = await this.workflowService.updateWorkflowState(disputeId, updates);

      // Log audit event
      await this.workflowService.logAuditEvent(
        disputeId,
        'workflow_state_updated',
        userId,
        undefined,
        updates,
        { disputeId }
      );

      res.json({
        success: true,
        data: workflowState,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error updating workflow state:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update workflow state'
      });
    }
  }

  // Workflow Stages
  async getWorkflowStages(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const stages = await this.workflowService.getWorkflowStages(disputeId);

      res.json({
        success: true,
        data: stages,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error getting workflow stages:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get workflow stages'
      });
    }
  }

  async transitionStage(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const { stage, data } = req.body;
      const userId = req.user?.id;

      // Temporarily disabled for testing
      // if (!userId) {
      //   res.status(401).json({
      //     success: false,
      //     error: 'Authentication required'
      //   });
      //   return;
      // }

      const workflowState = await this.workflowService.transitionStage(disputeId, stage, data);

      // Log audit event
      await this.workflowService.logAuditEvent(
        disputeId,
        'stage_transition',
        userId,
        { previousStage: workflowState.currentStage },
        { newStage: stage, ...data },
        { disputeId, stage }
      );

      res.json({
        success: true,
        data: workflowState,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error transitioning stage:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to transition stage'
      });
    }
  }

  async updateStageStatus(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId, stageId } = req.params;
      const { status, metadata } = req.body;
      const userId = req.user?.id;

      // Temporarily disabled for testing
      // if (!userId) {
      //   res.status(401).json({
      //     success: false,
      //     error: 'Authentication required'
      //   });
      //   return;
      // }

      const stage = await this.workflowService.updateStageStatus(disputeId, stageId, status, metadata);

      // Log audit event
      await this.workflowService.logAuditEvent(
        disputeId,
        'stage_status_updated',
        userId,
        { stageId, previousStatus: 'unknown' },
        { stageId, newStatus: status, metadata },
        { stageId }
      );

      res.json({
        success: true,
        data: stage,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error updating stage status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update stage status'
      });
    }
  }

  // Workflow Progress
  async getWorkflowProgress(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const progress = await this.workflowService.getWorkflowProgress(disputeId);

      res.json({
        success: true,
        data: progress,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error getting workflow progress:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get workflow progress'
      });
    }
  }

  async updateProgress(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const progress = req.body;
      const userId = req.user?.id;

      // Temporarily disabled for testing
      // if (!userId) {
      //   res.status(401).json({
      //     success: false,
      //     error: 'Authentication required'
      //   });
      //   return;
      // }

      const updatedProgress = await this.workflowService.updateProgress(disputeId, {
        ...progress,
        updatedBy: userId
      });

      // Log audit event
      await this.workflowService.logAuditEvent(
        disputeId,
        'progress_updated',
        userId,
        { previousProgress: progress.progressPercentage || 0 },
        { newProgress: updatedProgress.progressPercentage, milestone: updatedProgress.milestone },
        { progressId: updatedProgress.id }
      );

      res.json({
        success: true,
        data: updatedProgress,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error updating progress:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update progress'
      });
    }
  }

  async addMilestone(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const { stageId, milestone, notes, progressPercentage } = req.body;
      const userId = req.user?.id;

      // Temporarily disabled for testing
      // if (!userId) {
      //   res.status(401).json({
      //     success: false,
      //     error: 'Authentication required'
      //   });
      //   return;
      // }

      const newMilestone = await this.workflowService.addMilestone(
        disputeId,
        stageId,
        milestone,
        notes,
        progressPercentage
      );

      // Log audit event
      await this.workflowService.logAuditEvent(
        disputeId,
        'milestone_added',
        userId,
        undefined,
        { milestone, stageId, progressPercentage },
        { milestoneId: newMilestone.id }
      );

      res.status(201).json({
        success: true,
        data: newMilestone,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error adding milestone:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add milestone'
      });
    }
  }

  // Notifications
  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const userId = req.user?.id;

      // Temporarily disabled for testing
      // if (!userId) {
      //   res.status(401).json({
      //     success: false,
      //     error: 'Authentication required'
      //   });
      //   return;
      // }

      const notifications = await this.workflowService.getNotifications(disputeId);

      res.json({
        success: true,
        data: notifications,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error getting notifications:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get notifications'
      });
    }
  }

  async sendNotification(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const notification = req.body;
      const userId = req.user?.id;

      // Temporarily disabled for testing
      // if (!userId) {
      //   res.status(401).json({
      //     success: false,
      //     error: 'Authentication required'
      //   });
      //   return;
      // }

      const sentNotification = await this.workflowService.sendNotification(disputeId, {
        ...notification,
        userId: notification.userId || userId
      });

      // Log audit event
      await this.workflowService.logAuditEvent(
        disputeId,
        'notification_sent',
        userId,
        undefined,
        { notificationType: notification.notificationType, recipient: notification.userId },
        { notificationId: sentNotification.id }
      );

      res.status(201).json({
        success: true,
        data: sentNotification,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error sending notification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send notification'
      });
    }
  }

  async markNotificationAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { notificationId } = req.params;
      const userId = req.user?.id;

      // Temporarily disabled for testing
      // if (!userId) {
      //   res.status(401).json({
      //     success: false,
      //     error: 'Authentication required'
      //   });
      //   return;
      // }

      await this.workflowService.markNotificationAsRead(notificationId);

      res.json({
        success: true,
        message: 'Notification marked as read',
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark notification as read'
      });
    }
  }

  async updateNotificationPreferences(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const preferences = req.body;
      const userId = req.user?.id;

      // Temporarily disabled for testing
      // if (!userId) {
      //   res.status(401).json({
      //     success: false,
      //     error: 'Authentication required'
      //   });
      //   return;
      // }

      await this.workflowService.updateNotificationPreferences(disputeId, preferences);

      // Log audit event
      await this.workflowService.logAuditEvent(
        disputeId,
        'notification_preferences_updated',
        userId,
        undefined,
        preferences,
        { userId }
      );

      res.json({
        success: true,
        message: 'Notification preferences updated',
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error updating notification preferences:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update notification preferences'
      });
    }
  }

  // Deadlines
  async getDeadlines(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const deadlines = await this.workflowService.getDeadlines(disputeId);

      res.json({
        success: true,
        data: deadlines,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error getting deadlines:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get deadlines'
      });
    }
  }

  async extendDeadline(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const { stageId, extensionHours, reason } = req.body;
      const userId = req.user?.id;

      // Temporarily disabled for testing
      // if (!userId) {
      //   res.status(401).json({
      //     success: false,
      //     error: 'Authentication required'
      //   });
      //   return;
      // }

      await this.workflowService.extendDeadline(disputeId, stageId, extensionHours, reason);

      // Log audit event
      await this.workflowService.logAuditEvent(
        disputeId,
        'deadline_extended',
        userId,
        undefined,
        { stageId, extensionHours, reason },
        { stageId }
      );

      res.json({
        success: true,
        message: 'Deadline extended successfully',
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error extending deadline:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to extend deadline'
      });
    }
  }

  async triggerEscalation(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const { stageId, reason } = req.body;
      const userId = req.user?.id;

      // Temporarily disabled for testing
      // if (!userId) {
      //   res.status(401).json({
      //     success: false,
      //     error: 'Authentication required'
      //   });
      //   return;
      // }

      await this.workflowService.triggerEscalation(disputeId, stageId, reason);

      // Log audit event
      await this.workflowService.logAuditEvent(
        disputeId,
        'escalation_triggered',
        userId,
        undefined,
        { stageId, reason },
        { stageId }
      );

      res.json({
        success: true,
        message: 'Escalation triggered successfully',
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error triggering escalation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to trigger escalation'
      });
    }
  }

  // Audit Trail
  async getAuditTrail(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const auditTrail = await this.workflowService.getAuditTrail(disputeId);

      res.json({
        success: true,
        data: auditTrail,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error getting audit trail:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get audit trail'
      });
    }
  }

  async logAuditEvent(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const { action, performedBy, oldState, newState, metadata } = req.body;
      const userId = req.user?.id;

      // Temporarily disabled for testing
      // if (!userId) {
      //   res.status(401).json({
      //     success: false,
      //     error: 'Authentication required'
      //   });
      //   return;
      // }

      const auditEntry = await this.workflowService.logAuditEvent(
        disputeId,
        action,
        performedBy || userId,
        oldState,
        newState,
        metadata
      );

      res.status(201).json({
        success: true,
        data: auditEntry,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error logging audit event:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to log audit event'
      });
    }
  }

  // Analytics
  async getWorkflowAnalytics(req: Request, res: Response): Promise<void> {
    try {
      console.log('=== getWorkflowAnalytics called ===');
      console.log('Query params:', req.query);
      const { disputeId, timeRange } = req.query;
      const analytics = await this.workflowService.getWorkflowAnalytics(
        disputeId as string,
        timeRange as string
      );

      console.log('Analytics data:', analytics);
      res.json({
        success: true,
        data: analytics,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error getting workflow analytics:', error);
      logger.error('Error getting workflow analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get workflow analytics'
      });
    }
  }

  async exportAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId, format = 'json' } = req.query;
      const blob = await this.workflowService.exportAnalytics(
        disputeId as string,
        format as 'json' | 'csv'
      );

      const contentType = format === 'json' ? 'application/json' : 'text/csv';
      const filename = `workflow-analytics-${disputeId || 'platform'}-${new Date().toISOString().split('T')[0]}.${format}`;

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(blob);
    } catch (error) {
      logger.error('Error exporting analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export analytics'
      });
    }
  }

  // Configuration
  async getWorkflowConfiguration(req: Request, res: Response): Promise<void> {
    try {
      const { disputeType } = req.params;
      const configuration = await this.workflowService.getWorkflowConfiguration(disputeType);

      res.json({
        success: true,
        data: configuration,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error getting workflow configuration:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get workflow configuration'
      });
    }
  }

  async updateWorkflowConfiguration(req: Request, res: Response): Promise<void> {
    try {
      const { disputeType } = req.params;
      const configuration = req.body;
      const userId = req.user?.id;

      // Temporarily disabled for testing
      // if (!userId) {
      //   res.status(401).json({
      //     success: false,
      //     error: 'Authentication required'
      //   });
      //   return;
      // }

      const updatedConfiguration = await this.workflowService.updateWorkflowConfiguration(
        disputeType,
        configuration
      );

      // Log audit event
      await this.workflowService.logAuditEvent(
        'system',
        'configuration_updated',
        userId,
        undefined,
        { disputeType, configuration },
        { disputeType }
      );

      res.json({
        success: true,
        data: updatedConfiguration,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error updating workflow configuration:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update workflow configuration'
      });
    }
  }

  // Dispute-specific Operations
  async initiateDispute(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const disputeData = req.body;
      const userId = req.user?.id;

      // Temporarily disabled for testing
      // if (!userId) {
      //   res.status(401).json({
      //     success: false,
      //     error: 'Authentication required'
      //   });
      //   return;
      // }

      const workflowState = await this.workflowService.initiateDispute(disputeId, disputeData);

      res.status(201).json({
        success: true,
        data: workflowState,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error initiating dispute:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to initiate dispute'
      });
    }
  }

  async assignMediator(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const { mediatorId } = req.body;
      const userId = req.user?.id;

      // Temporarily disabled for testing
      // if (!userId) {
      //   res.status(401).json({
      //     success: false,
      //     error: 'Authentication required'
      //   });
      //   return;
      // }

      const workflowState = await this.workflowService.assignMediator(disputeId, mediatorId, userId);

      res.json({
        success: true,
        data: workflowState,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error assigning mediator:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to assign mediator'
      });
    }
  }

  async collectEvidence(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const evidenceData = req.body;
      const userId = req.user?.id;

      // Temporarily disabled for testing
      // if (!userId) {
      //   res.status(401).json({
      //     success: false,
      //     error: 'Authentication required'
      //   });
      //   return;
      // }

      const workflowState = await this.workflowService.collectEvidence(disputeId, evidenceData);

      res.json({
        success: true,
        data: workflowState,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error collecting evidence:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to collect evidence'
      });
    }
  }

  async conductMediation(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const mediationData = req.body;
      const userId = req.user?.id;

      // Temporarily disabled for testing
      // if (!userId) {
      //   res.status(401).json({
      //     success: false,
      //     error: 'Authentication required'
      //   });
      //   return;
      // }

      const workflowState = await this.workflowService.conductMediation(disputeId, mediationData);

      res.json({
        success: true,
        data: workflowState,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error conducting mediation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to conduct mediation'
      });
    }
  }

  async resolveDispute(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const { outcome, ...resolutionData } = req.body;
      const userId = req.user?.id;

      // Temporarily disabled for testing
      // if (!userId) {
      //   res.status(401).json({
      //     success: false,
      //     error: 'Authentication required'
      //   });
      //   return;
      // }

      const workflowState = await this.workflowService.resolveDispute(disputeId, outcome, resolutionData);

      res.json({
        success: true,
        data: workflowState,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error resolving dispute:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to resolve dispute'
      });
    }
  }

  async conductArbitration(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const arbitrationData = req.body;
      const userId = req.user?.id;

      // Temporarily disabled for testing
      // if (!userId) {
      //   res.status(401).json({
      //     success: false,
      //     error: 'Authentication required'
      //   });
      //   return;
      // }

      const workflowState = await this.workflowService.conductArbitration(disputeId, arbitrationData);

      res.json({
        success: true,
        data: workflowState,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error conducting arbitration:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to conduct arbitration'
      });
    }
  }

  async implementResolution(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const implementationData = req.body;
      const userId = req.user?.id;

      // Temporarily disabled for testing
      // if (!userId) {
      //   res.status(401).json({
      //     success: false,
      //     error: 'Authentication required'
      //   });
      //   return;
      // }

      const workflowState = await this.workflowService.implementResolution(disputeId, implementationData);

      res.json({
        success: true,
        data: workflowState,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error implementing resolution:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to implement resolution'
      });
    }
  }

  // Utility Methods
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.workflowService.healthCheck();
      
      res.json({
        success: true,
        data: { status: isHealthy ? 'healthy' : 'unhealthy' },
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error checking health:', error);
      res.status(500).json({
        success: false,
        error: 'Health check failed'
      });
    }
  }

  async retryFailedOperations(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const userId = req.user?.id;

      // Temporarily disabled for testing
      // if (!userId) {
      //   res.status(401).json({
      //     success: false,
      //     error: 'Authentication required'
      //   });
      //   return;
      // }

      await this.workflowService.retryFailedOperations(disputeId);

      // Log audit event
      await this.workflowService.logAuditEvent(
        disputeId,
        'retry_failed_operations',
        userId,
        undefined,
        { retryInitiated: true },
        { disputeId }
      );

      res.json({
        success: true,
        message: 'Failed operations retry initiated',
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error retrying failed operations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retry operations'
      });
    }
  }

  async cleanupExpiredWorkflows(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      // Temporarily disabled for testing
      // if (!userId) {
      //   res.status(401).json({
      //     success: false,
      //     error: 'Authentication required'
      //   });
      //   return;
      // }

      const cleanedCount = await this.workflowService.cleanupExpiredWorkflows();

      // Log audit event
      await this.workflowService.logAuditEvent(
        'system',
        'cleanup_expired_workflows',
        userId,
        undefined,
        { cleanedCount },
        { operation: 'cleanup' }
      );

      res.json({
        success: true,
        data: { cleaned: cleanedCount },
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error cleaning up expired workflows:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cleanup expired workflows'
      });
    }
  }
}
