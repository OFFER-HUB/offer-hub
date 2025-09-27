import { Router } from 'express';
import { MediationController } from '../controllers/mediation.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validateRequestLegacy } from '../middlewares/validation.middleware';
import { body, param, query } from 'express-validator';

const router = Router();
const mediationController = new MediationController();

// Validation schemas
const createMediatorValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('expertiseAreas').isArray().withMessage('Expertise areas must be an array'),
  body('languages').isArray().withMessage('Languages must be an array'),
  body('currency').notEmpty().withMessage('Currency is required')
];

const updateMediatorValidation = [
  param('mediatorId').isUUID().withMessage('Valid mediator ID is required'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required')
];

const createMediationSessionValidation = [
  body('disputeId').isUUID().withMessage('Valid dispute ID is required'),
  body('mediatorId').isUUID().withMessage('Valid mediator ID is required'),
  body('type').isIn(['individual', 'group', 'shuttle', 'caucus', 'hybrid']).withMessage('Valid mediation type is required'),
  body('meetingType').isIn(['in_person', 'video_call', 'phone_call', 'chat', 'hybrid']).withMessage('Valid meeting type is required'),
  body('participants').isArray().withMessage('Participants must be an array'),
  body('agenda').isArray().withMessage('Agenda must be an array')
];

const updateMediationSessionValidation = [
  param('sessionId').isUUID().withMessage('Valid session ID is required')
];

const createSettlementAgreementValidation = [
  body('mediationSessionId').isUUID().withMessage('Valid mediation session ID is required'),
  body('disputeId').isUUID().withMessage('Valid dispute ID is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('terms').isObject().withMessage('Terms must be an object')
];

const signAgreementValidation = [
  param('agreementId').isUUID().withMessage('Valid agreement ID is required'),
  body('signatureType').isIn(['digital', 'electronic', 'wet_signature']).withMessage('Valid signature type is required'),
  body('signatureData').notEmpty().withMessage('Signature data is required')
];

const assignMediatorValidation = [
  param('disputeId').isUUID().withMessage('Valid dispute ID is required'),
  body('mediatorId').isUUID().withMessage('Valid mediator ID is required')
];

const endMediationSessionValidation = [
  param('sessionId').isUUID().withMessage('Valid session ID is required'),
  body('outcome').isIn(['settled', 'partially_settled', 'not_settled', 'escalated', 'cancelled']).withMessage('Valid outcome is required')
];

const escalateMediationValidation = [
  param('sessionId').isUUID().withMessage('Valid session ID is required'),
  body('reason').isIn(['mediation_failed', 'deadline_expired', 'participant_unresponsive', 'complex_issues', 'legal_requirements', 'participant_request', 'mediator_recommendation', 'other']).withMessage('Valid escalation reason is required')
];

// Mediator Management Routes
router.post('/mediators', 
  authenticateToken(),
  createMediatorValidation,
  validateRequestLegacy,
  mediationController.createMediator.bind(mediationController)
);

router.get('/mediators/:mediatorId', 
  authenticateToken(),
  param('mediatorId').isUUID().withMessage('Valid mediator ID is required'),
  validateRequestLegacy,
  mediationController.getMediator.bind(mediationController)
);

router.get('/mediators/user/:userId', 
  authenticateToken(),
  param('userId').isUUID().withMessage('Valid user ID is required'),
  validateRequestLegacy,
  mediationController.getMediatorByUserId.bind(mediationController)
);

router.put('/mediators/:mediatorId', 
  authenticateToken(),
  updateMediatorValidation,
  validateRequestLegacy,
  mediationController.updateMediator.bind(mediationController)
);

router.get('/mediators', 
  authenticateToken(),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['name', 'rating', 'total_mediations', 'created_at']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  validateRequestLegacy,
  mediationController.getMediators.bind(mediationController)
);

// Mediation Assignment Routes
router.post('/assignments/:disputeId', 
  authenticateToken(),
  requireRole({ requiredRoles: ['admin', 'moderator'] }),
  assignMediatorValidation,
  validateRequestLegacy,
  mediationController.assignMediator.bind(mediationController)
);

// Mediation Session Management Routes
router.post('/sessions', 
  authenticateToken(),
  createMediationSessionValidation,
  validateRequestLegacy,
  mediationController.createMediationSession.bind(mediationController)
);

router.get('/sessions/:sessionId', 
  authenticateToken(),
  param('sessionId').isUUID().withMessage('Valid session ID is required'),
  validateRequestLegacy,
  mediationController.getMediationSession.bind(mediationController)
);

router.put('/sessions/:sessionId', 
  authenticateToken(),
  updateMediationSessionValidation,
  validateRequestLegacy,
  mediationController.updateMediationSession.bind(mediationController)
);

router.get('/sessions', 
  authenticateToken(),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['scheduled', 'in_progress', 'paused', 'completed', 'cancelled', 'escalated', 'failed']).withMessage('Invalid status'),
  query('sortBy').optional().isIn(['scheduled_at', 'created_at', 'status']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  validateRequestLegacy,
  mediationController.getMediationSessions.bind(mediationController)
);

router.post('/sessions/:sessionId/start', 
authenticateToken(),
  param('sessionId').isUUID().withMessage('Valid session ID is required'),
  validateRequestLegacy,
  mediationController.startMediationSession.bind(mediationController)
);

router.post('/sessions/:sessionId/end', 
  authenticateToken(),
  endMediationSessionValidation,
  validateRequestLegacy,
  mediationController.endMediationSession.bind(mediationController)
);

// Settlement Agreement Management Routes
router.post('/agreements', 
  authenticateToken(),
  createSettlementAgreementValidation,
  validateRequestLegacy,
  mediationController.createSettlementAgreement.bind(mediationController)
);

router.get('/agreements/:agreementId', 
  authenticateToken(),
  param('agreementId').isUUID().withMessage('Valid agreement ID is required'),
  validateRequestLegacy,
  mediationController.getSettlementAgreement.bind(mediationController)
);

router.post('/agreements/:agreementId/sign', 
  authenticateToken(),
  signAgreementValidation,
  validateRequestLegacy,
  mediationController.signAgreement.bind(mediationController)
);

// Analytics Routes
router.get('/analytics', 
  authenticateToken(),
  requireRole({ requiredRoles: ['admin', 'moderator'] }),
  query('timeRange').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid time range'),
  validateRequestLegacy,
  mediationController.getMediationAnalytics.bind(mediationController)
);

// Escalation Routes
router.post('/sessions/:sessionId/escalate', 
  authenticateToken(),
  escalateMediationValidation,
  validateRequestLegacy,
  mediationController.escalateMediation.bind(mediationController)
);

// Evidence Review Routes
router.post('/sessions/:sessionId/evidence/:evidenceId/review', 
  authenticateToken(),
  body('isAccepted').isBoolean().withMessage('isAccepted must be a boolean'),
  body('reviewNotes').optional().isString().withMessage('reviewNotes must be a string'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('rating must be between 1 and 5'),
  body('categories').optional().isArray().withMessage('categories must be an array'),
  validateRequestLegacy,
  mediationController.reviewEvidence.bind(mediationController)
);

router.get('/sessions/:sessionId/evidence/review-summary', 
  authenticateToken(),
  param('sessionId').isUUID().withMessage('Valid session ID is required'),
  validateRequestLegacy,
  mediationController.getEvidenceReviewSummary.bind(mediationController)
);

router.post('/sessions/:sessionId/evidence/bulk-review', 
  authenticateToken(),
  body('reviews').isArray({ min: 1 }).withMessage('reviews must be a non-empty array'),
  body('reviews.*.evidenceId').isUUID().withMessage('Each evidence ID must be a valid UUID'),
  body('reviews.*.isAccepted').isBoolean().withMessage('Each isAccepted must be a boolean'),
  validateRequestLegacy,
  mediationController.bulkReviewEvidence.bind(mediationController)
);

// Quality Assurance Routes
router.post('/sessions/:sessionId/feedback', 
  authenticateToken(),
  body('mediatorRating').isInt({ min: 1, max: 5 }).withMessage('mediatorRating must be between 1 and 5'),
  body('processRating').isInt({ min: 1, max: 5 }).withMessage('processRating must be between 1 and 5'),
  body('outcomeRating').isInt({ min: 1, max: 5 }).withMessage('outcomeRating must be between 1 and 5'),
  body('communicationRating').isInt({ min: 1, max: 5 }).withMessage('communicationRating must be between 1 and 5'),
  body('fairnessRating').isInt({ min: 1, max: 5 }).withMessage('fairnessRating must be between 1 and 5'),
  body('overallSatisfaction').isInt({ min: 1, max: 5 }).withMessage('overallSatisfaction must be between 1 and 5'),
  body('wouldRecommend').isBoolean().withMessage('wouldRecommend must be a boolean'),
  body('categories').isArray().withMessage('categories must be an array'),
  body('comments').optional().isString().withMessage('comments must be a string'),
  body('suggestions').optional().isString().withMessage('suggestions must be a string'),
  validateRequestLegacy,
  mediationController.submitMediationFeedback.bind(mediationController)
);

router.get('/sessions/:sessionId/quality-metrics', 
  authenticateToken(),
  param('sessionId').isUUID().withMessage('Valid session ID is required'),
  validateRequestLegacy,
  mediationController.getMediationQualityMetrics.bind(mediationController)
);

router.post('/sessions/:sessionId/quality-report', 
  authenticateToken(),
  param('sessionId').isUUID().withMessage('Valid session ID is required'),
  validateRequestLegacy,
  mediationController.generateQualityReport.bind(mediationController)
);

router.get('/quality-analytics', 
  authenticateToken(),
  requireRole({ requiredRoles: ['admin', 'moderator'] }),
  query('timeRange').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid time range'),
  validateRequestLegacy,
  mediationController.getPlatformQualityAnalytics.bind(mediationController)
);

// Health Check Route
router.get('/health', 
  mediationController.healthCheck.bind(mediationController)
);

export default router;
