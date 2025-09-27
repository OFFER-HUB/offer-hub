import { Request, Response } from 'express';
import { MediationService } from '../services/mediation.service';
import { 
  CreateMediatorDTO,
  UpdateMediatorDTO,
  CreateMediationSessionDTO,
  UpdateMediationSessionDTO,
  CreateSettlementAgreementDTO,
  SignAgreementDTO,
  MediationFilters,
  MediatorFilters,
  PaginationParams,
  MediationOutcome,
  EscalationReason,
  MediationCategory
} from '../types/mediation.types';
import { ApiResponse } from '../types/api.type';

// Simple logger using console
const logger = {
  error: (message: string, error?: any) => {
    console.error(`[MEDIATION_CONTROLLER_ERROR] ${message}`, error);
  },
  info: (message: string, data?: any) => {
    console.log(`[MEDIATION_CONTROLLER_INFO] ${message}`, data);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[MEDIATION_CONTROLLER_WARN] ${message}`, data);
  }
};

export class MediationController {
  private mediationService: MediationService;

  constructor() {
    this.mediationService = new MediationService();
  }

  // Mediator Management Endpoints
  async createMediator(req: Request, res: Response): Promise<void> {
    try {
      const mediatorData: CreateMediatorDTO = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // Ensure the user is creating their own mediator profile
      mediatorData.userId = userId;

      const mediator = await this.mediationService.createMediator(mediatorData);

      res.status(201).json({
        success: true,
        message: 'Mediator profile created successfully',
        data: mediator,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error creating mediator:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create mediator profile'
      });
    }
  }

  async getMediator(req: Request, res: Response): Promise<void> {
    try {
      const { mediatorId } = req.params;
      const mediator = await this.mediationService.getMediator(mediatorId);

      if (!mediator) {
        res.status(404).json({
          success: false,
          error: 'Mediator not found'
        });
        return;
      }

      res.json({
        success: true,
        data: mediator,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error getting mediator:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get mediator'
      });
    }
  }

  async getMediatorByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const mediator = await this.mediationService.getMediatorByUserId(userId);

      if (!mediator) {
        res.status(404).json({
          success: false,
          error: 'Mediator not found'
        });
        return;
      }

      res.json({
        success: true,
        data: mediator,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error getting mediator by user ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get mediator'
      });
    }
  }

  async updateMediator(req: Request, res: Response): Promise<void> {
    try {
      const { mediatorId } = req.params;
      const updates: UpdateMediatorDTO = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const mediator = await this.mediationService.updateMediator(mediatorId, updates);

      res.json({
        success: true,
        message: 'Mediator profile updated successfully',
        data: mediator,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error updating mediator:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update mediator profile'
      });
    }
  }

  async getMediators(req: Request, res: Response): Promise<void> {
    try {
      const filters: MediatorFilters = {
        expertiseAreas: req.query.expertiseAreas ? (req.query.expertiseAreas as string).split(',') as MediationCategory[] : [],
        languages: req.query.languages ? (req.query.languages as string).split(',') : undefined,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        isVerified: req.query.isVerified ? req.query.isVerified === 'true' : undefined,
        rating: req.query.rating ? parseFloat(req.query.rating as string) : undefined,
        search: req.query.search as string
      };

      const pagination: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const result = await this.mediationService.getMediators(filters, pagination);

      res.json({
        success: true,
        data: result.mediators,
        pagination: result.pagination,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error getting mediators:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get mediators'
      });
    }
  }

  async assignMediator(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const { mediatorId } = req.body;
      const assignedBy = req.user?.id;

      if (!assignedBy) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const assignment = await this.mediationService.assignMediatorToDispute(disputeId, mediatorId, assignedBy);

      res.status(201).json({
        success: true,
        message: 'Mediator assigned successfully',
        data: assignment,
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

  // Mediation Session Management Endpoints
  async createMediationSession(req: Request, res: Response): Promise<void> {
    try {
      const sessionData: CreateMediationSessionDTO = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const session = await this.mediationService.createMediationSession(sessionData);

      res.status(201).json({
        success: true,
        message: 'Mediation session created successfully',
        data: session,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error creating mediation session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create mediation session'
      });
    }
  }

  async getMediationSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const session = await this.mediationService.getMediationSession(sessionId);

      if (!session) {
        res.status(404).json({
          success: false,
          error: 'Mediation session not found'
        });
        return;
      }

      res.json({
        success: true,
        data: session,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error getting mediation session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get mediation session'
      });
    }
  }

  async updateMediationSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const updates: UpdateMediationSessionDTO = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const session = await this.mediationService.updateMediationSession(sessionId, updates);

      res.json({
        success: true,
        message: 'Mediation session updated successfully',
        data: session,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error updating mediation session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update mediation session'
      });
    }
  }

  async getMediationSessions(req: Request, res: Response): Promise<void> {
    try {
      const filters: MediationFilters = {
        status: req.query.status ? (req.query.status as string).split(',') as any[] : undefined,
        category: req.query.category ? (req.query.category as string).split(',') as any[] : undefined,
        mediatorId: req.query.mediatorId as string,
        disputeId: req.query.disputeId as string,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        search: req.query.search as string
      };

      const pagination: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const result = await this.mediationService.getMediationSessions(filters, pagination);

      res.json({
        success: true,
        data: result.mediations,
        pagination: result.pagination,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error getting mediation sessions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get mediation sessions'
      });
    }
  }

  async startMediationSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const session = await this.mediationService.startMediationSession(sessionId);

      res.json({
        success: true,
        message: 'Mediation session started successfully',
        data: session,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error starting mediation session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start mediation session'
      });
    }
  }

  async endMediationSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { outcome } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      if (!outcome || !['settled', 'partially_settled', 'not_settled', 'escalated', 'cancelled'].includes(outcome)) {
        res.status(400).json({
          success: false,
          error: 'Valid outcome is required'
        });
        return;
      }

      const session = await this.mediationService.endMediationSession(sessionId, outcome as MediationOutcome);

      res.json({
        success: true,
        message: 'Mediation session ended successfully',
        data: session,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error ending mediation session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to end mediation session'
      });
    }
  }

  // Settlement Agreement Management Endpoints
  async createSettlementAgreement(req: Request, res: Response): Promise<void> {
    try {
      const agreementData: CreateSettlementAgreementDTO = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const agreement = await this.mediationService.createSettlementAgreement(agreementData);

      res.status(201).json({
        success: true,
        message: 'Settlement agreement created successfully',
        data: agreement,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error creating settlement agreement:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create settlement agreement'
      });
    }
  }

  async getSettlementAgreement(req: Request, res: Response): Promise<void> {
    try {
      const { agreementId } = req.params;
      const agreement = await this.mediationService.getSettlementAgreement(agreementId);

      if (!agreement) {
        res.status(404).json({
          success: false,
          error: 'Settlement agreement not found'
        });
        return;
      }

      res.json({
        success: true,
        data: agreement,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error getting settlement agreement:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get settlement agreement'
      });
    }
  }

  async signAgreement(req: Request, res: Response): Promise<void> {
    try {
      const { agreementId } = req.params;
      const signData: SignAgreementDTO = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const agreement = await this.mediationService.signAgreement(agreementId, signData, userId);

      res.json({
        success: true,
        message: 'Agreement signed successfully',
        data: agreement,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error signing agreement:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to sign agreement'
      });
    }
  }

  // Analytics Endpoints
  async getMediationAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const timeRange = req.query.timeRange as string || '30d';
      const analytics = await this.mediationService.getMediationAnalytics(timeRange);

      res.json({
        success: true,
        data: analytics,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error getting mediation analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get mediation analytics'
      });
    }
  }

  // Escalation Endpoints
  async escalateMediation(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { reason } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      if (!reason || !['mediation_failed', 'deadline_expired', 'participant_unresponsive', 'complex_issues', 'legal_requirements', 'participant_request', 'mediator_recommendation', 'other'].includes(reason)) {
        res.status(400).json({
          success: false,
          error: 'Valid escalation reason is required'
        });
        return;
      }

      const escalation = await this.mediationService.escalateMediation(sessionId, reason as EscalationReason, userId);

      res.json({
        success: true,
        message: 'Mediation escalated successfully',
        data: escalation,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error escalating mediation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to escalate mediation'
      });
    }
  }

  // Evidence Review Endpoints
  async reviewEvidence(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, evidenceId } = req.params;
      const reviewData = req.body;
      const reviewerId = req.user?.id;

      if (!reviewerId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      await this.mediationService.reviewEvidence(sessionId, evidenceId, reviewerId, reviewData);

      res.json({
        success: true,
        message: 'Evidence reviewed successfully',
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error reviewing evidence:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to review evidence'
      });
    }
  }

  async getEvidenceReviewSummary(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const summary = await this.mediationService.getEvidenceReviewSummary(sessionId);

      res.json({
        success: true,
        data: summary,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error getting evidence review summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get evidence review summary'
      });
    }
  }

  async bulkReviewEvidence(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { reviews } = req.body;
      const reviewerId = req.user?.id;

      if (!reviewerId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      await this.mediationService.bulkReviewEvidence(sessionId, reviewerId, reviews);

      res.json({
        success: true,
        message: 'Bulk evidence review completed successfully',
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error in bulk evidence review:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to complete bulk evidence review'
      });
    }
  }

  // Quality Assurance Endpoints
  async submitMediationFeedback(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const feedbackData = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // Ensure participantId matches authenticated user
      feedbackData.participantId = userId;

      await this.mediationService.submitMediationFeedback(sessionId, feedbackData);

      res.status(201).json({
        success: true,
        message: 'Mediation feedback submitted successfully',
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error submitting mediation feedback:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit mediation feedback'
      });
    }
  }

  async getMediationQualityMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const metrics = await this.mediationService.getMediationQualityMetrics(sessionId);

      res.json({
        success: true,
        data: metrics,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error getting mediation quality metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get mediation quality metrics'
      });
    }
  }

  async generateQualityReport(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const report = await this.mediationService.generateQualityReport(sessionId);

      res.json({
        success: true,
        data: report,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error generating quality report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate quality report'
      });
    }
  }

  async getPlatformQualityAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const timeRange = req.query.timeRange as string || '30d';
      const analytics = await this.mediationService.getPlatformQualityAnalytics(timeRange);

      res.json({
        success: true,
        data: analytics,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error getting platform quality analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get platform quality analytics'
      });
    }
  }

  // Health Check
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.mediationService.healthCheck();
      
      res.json({
        success: true,
        data: { status: isHealthy ? 'healthy' : 'unhealthy' },
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error checking mediation service health:', error);
      res.status(500).json({
        success: false,
        error: 'Health check failed'
      });
    }
  }
}
