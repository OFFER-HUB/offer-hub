import { Request, Response, NextFunction } from 'express';
import { MediationService } from '../services/mediation.service';
import { MediationCategory, MediationStatus, AssignmentStatus } from '../types/mediation.types';

// Simple logger using console
const logger = {
  error: (message: string, error?: any) => {
    console.error(`[MEDIATION_MIDDLEWARE_ERROR] ${message}`, error);
  },
  info: (message: string, data?: any) => {
    console.log(`[MEDIATION_MIDDLEWARE_INFO] ${message}`, data);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[MEDIATION_MIDDLEWARE_WARN] ${message}`, data);
  }
};

export class MediationMiddleware {
  private mediationService: MediationService;

  constructor() {
    this.mediationService = new MediationService();
  }

  // Check if user is a verified mediator
  async verifyMediator(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const mediator = await this.mediationService.getMediatorByUserId(userId);
      if (!mediator) {
        res.status(403).json({
          success: false,
          error: 'Mediator profile not found'
        });
        return;
      }

      if (!mediator.isActive) {
        res.status(403).json({
          success: false,
          error: 'Mediator account is inactive'
        });
        return;
      }

      if (!mediator.isVerified) {
        res.status(403).json({
          success: false,
          error: 'Mediator account is not verified'
        });
        return;
      }

      // Add mediator info to request
      req.mediator = mediator;
      next();
    } catch (error) {
      logger.error('Error verifying mediator:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify mediator status'
      });
    }
  }

  // Check if user can access mediation session
  async checkSessionAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const session = await this.mediationService.getMediationSession(sessionId);
      if (!session) {
        res.status(404).json({
          success: false,
          error: 'Mediation session not found'
        });
        return;
      }

      // Check if user is a participant in the session
      const isParticipant = session.participants.some(p => p.userId === userId);
      const isMediator = session.mediatorId === userId;
      const isAdmin = req.user?.role === 'admin' || req.user?.role === 'moderator';

      if (!isParticipant && !isMediator && !isAdmin) {
        res.status(403).json({
          success: false,
          error: 'Access denied to mediation session'
        });
        return;
      }

      // Add session info to request
      req.mediationSession = session;
      next();
    } catch (error) {
      logger.error('Error checking session access:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify session access'
      });
    }
  }

  // Check if mediation session can be modified
  async checkSessionModification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = req.mediationSession;
      if (!session) {
        res.status(400).json({
          success: false,
          error: 'Mediation session not found in request'
        });
        return;
      }

      // Only allow modifications for certain statuses
      const allowedStatuses: MediationStatus[] = ['scheduled', 'paused'];
      if (!allowedStatuses.includes(session.status)) {
        res.status(400).json({
          success: false,
          error: `Cannot modify session in ${session.status} status`
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Error checking session modification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify session modification permissions'
      });
    }
  }

  // Check if user can start mediation session
  async checkSessionStart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = req.mediationSession;
      if (!session) {
        res.status(400).json({
          success: false,
          error: 'Mediation session not found in request'
        });
        return;
      }

      // Only mediator can start the session
      const userId = req.user?.id;
      if (session.mediatorId !== userId) {
        res.status(403).json({
          success: false,
          error: 'Only the assigned mediator can start the session'
        });
        return;
      }

      // Session must be scheduled
      if (session.status !== 'scheduled') {
        res.status(400).json({
          success: false,
          error: 'Session must be scheduled to start'
        });
        return;
      }

      // Check if scheduled time has passed (with 15 minute grace period)
      if (session.scheduledAt && new Date() < new Date(session.scheduledAt.getTime() - 15 * 60 * 1000)) {
        res.status(400).json({
          success: false,
          error: 'Session cannot start before scheduled time'
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Error checking session start:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify session start permissions'
      });
    }
  }

  // Check if user can end mediation session
  async checkSessionEnd(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = req.mediationSession;
      if (!session) {
        res.status(400).json({
          success: false,
          error: 'Mediation session not found in request'
        });
        return;
      }

      // Only mediator can end the session
      const userId = req.user?.id;
      if (session.mediatorId !== userId) {
        res.status(403).json({
          success: false,
          error: 'Only the assigned mediator can end the session'
        });
        return;
      }

      // Session must be in progress
      if (session.status !== 'in_progress') {
        res.status(400).json({
          success: false,
          error: 'Session must be in progress to end'
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Error checking session end:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify session end permissions'
      });
    }
  }

  // Check if user can access settlement agreement
  async checkAgreementAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { agreementId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const agreement = await this.mediationService.getSettlementAgreement(agreementId);
      if (!agreement) {
        res.status(404).json({
          success: false,
          error: 'Settlement agreement not found'
        });
        return;
      }

      // Get the mediation session to check participants
      const session = await this.mediationService.getMediationSession(agreement.mediationSessionId);
      if (!session) {
        res.status(404).json({
          success: false,
          error: 'Related mediation session not found'
        });
        return;
      }

      // Check if user is a participant in the session
      const isParticipant = session.participants.some(p => p.userId === userId);
      const isMediator = session.mediatorId === userId;
      const isAdmin = req.user?.role === 'admin' || req.user?.role === 'moderator';

      if (!isParticipant && !isMediator && !isAdmin) {
        res.status(403).json({
          success: false,
          error: 'Access denied to settlement agreement'
        });
        return;
      }

      // Add agreement info to request
      req.settlementAgreement = agreement;
      next();
    } catch (error) {
      logger.error('Error checking agreement access:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify agreement access'
      });
    }
  }

  // Check if user can sign settlement agreement
  async checkAgreementSigning(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const agreement = req.settlementAgreement;
      if (!agreement) {
        res.status(400).json({
          success: false,
          error: 'Settlement agreement not found in request'
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // Check if agreement is in a signable state
      if (!['draft', 'pending_signatures'].includes(agreement.status)) {
        res.status(400).json({
          success: false,
          error: `Agreement cannot be signed in ${agreement.status} status`
        });
        return;
      }

      // Check if user has already signed
      const hasSigned = agreement.signedBy.some((signature: any) => signature.signatoryId === userId);
      if (hasSigned) {
        res.status(400).json({
          success: false,
          error: 'User has already signed this agreement'
        });
        return;
      }

      // Get the mediation session to check if user is a participant
      const session = await this.mediationService.getMediationSession(agreement.mediationSessionId);
      if (!session) {
        res.status(404).json({
          success: false,
          error: 'Related mediation session not found'
        });
        return;
      }

      // Check if user is a participant (client or freelancer)
      const isParticipant = session.participants.some(p => 
        p.userId === userId && (p.role === 'client' || p.role === 'freelancer')
      );

      if (!isParticipant) {
        res.status(403).json({
          success: false,
          error: 'Only dispute participants can sign the agreement'
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Error checking agreement signing:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify agreement signing permissions'
      });
    }
  }

  // Check if mediator can be assigned to dispute
  async checkMediatorAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { disputeId } = req.params;
      const { mediatorId } = req.body;

      if (!mediatorId) {
        res.status(400).json({
          success: false,
          error: 'Mediator ID is required'
        });
        return;
      }

      const mediator = await this.mediationService.getMediator(mediatorId);
      if (!mediator) {
        res.status(404).json({
          success: false,
          error: 'Mediator not found'
        });
        return;
      }

      if (!mediator.isActive) {
        res.status(400).json({
          success: false,
          error: 'Mediator is not active'
        });
        return;
      }

      if (!mediator.isVerified) {
        res.status(400).json({
          success: false,
          error: 'Mediator is not verified'
        });
        return;
      }

      // Check if mediator has availability
      // This is a simplified check - in production, you'd check actual availability
      if (mediator.availability.maxConcurrentMediations <= mediator.totalMediations) {
        res.status(400).json({
          success: false,
          error: 'Mediator has reached maximum concurrent mediations'
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Error checking mediator assignment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify mediator assignment'
      });
    }
  }

  // Check if mediation can be escalated
  async checkMediationEscalation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = req.mediationSession;
      if (!session) {
        res.status(400).json({
          success: false,
          error: 'Mediation session not found in request'
        });
        return;
      }

      // Only allow escalation for certain statuses
      const allowedStatuses: MediationStatus[] = ['in_progress', 'paused'];
      if (!allowedStatuses.includes(session.status)) {
        res.status(400).json({
          success: false,
          error: `Cannot escalate session in ${session.status} status`
        });
        return;
      }

      // Check if session has been running for minimum time (e.g., 1 hour)
      if (session.startedAt) {
        const sessionDuration = Date.now() - session.startedAt.getTime();
        const minimumDuration = 60 * 60 * 1000; // 1 hour in milliseconds
        
        if (sessionDuration < minimumDuration) {
          res.status(400).json({
            success: false,
            error: 'Session must run for at least 1 hour before escalation'
          });
          return;
        }
      }

      next();
    } catch (error) {
      logger.error('Error checking mediation escalation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify mediation escalation permissions'
      });
    }
  }

  // Rate limiting for mediation operations
  async rateLimitMediationOperations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // This is a simplified rate limiting implementation
      // In production, you'd use Redis or similar for proper rate limiting
      const rateLimitKey = `mediation_rate_limit_${userId}`;
      const now = Date.now();
      const windowMs = 60 * 60 * 1000; // 1 hour window
      const maxRequests = 10; // Max 10 mediation operations per hour

      // For now, just pass through - implement proper rate limiting in production
      next();
    } catch (error) {
      logger.error('Error in rate limiting middleware:', error);
      next(); // Don't block on rate limiting errors
    }
  }
}

// Extend Express Request interface to include mediation-specific properties
declare global {
  namespace Express {
    interface Request {
      mediator?: any;
      mediationSession?: any;
      settlementAgreement?: any;
    }
  }
}

export const mediationMiddleware = new MediationMiddleware();
