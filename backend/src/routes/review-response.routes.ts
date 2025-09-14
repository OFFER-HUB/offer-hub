import { Router } from 'express';
import { reviewResponseController } from '../controllers/review-response.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { validateFields, validateUUID } from '../middlewares/validation.middleware';

const router = Router();

// Routes are simplified to use existing middlewares

// Public routes (no authentication required)
router.get('/guidelines', reviewResponseController.getResponseGuidelines);

// Protected routes (authentication required)
router.use(authenticateToken);

// Review Response CRUD operations
router.post(
  '/reviews/:reviewId/responses',
  validateUUID('reviewId'),
  validateFields(['content']),
  reviewResponseController.createResponse
);

router.get(
  '/reviews/:reviewId/responses',
  validateUUID('reviewId'),
  reviewResponseController.getResponsesByReview
);

router.get(
  '/responses/:responseId',
  validateUUID('responseId'),
  reviewResponseController.getResponseById
);

router.put(
  '/responses/:responseId',
  validateUUID('responseId'),
  validateFields(['content']),
  reviewResponseController.updateResponse
);

router.delete(
  '/responses/:responseId',
  validateUUID('responseId'),
  reviewResponseController.deleteResponse
);

// Voting on responses
router.post(
  '/responses/:responseId/vote',
  validateUUID('responseId'),
  validateFields(['vote_type']),
  reviewResponseController.voteOnResponse
);

// User-specific routes
router.get(
  '/users/:userId/responses',
  validateUUID('userId'),
  reviewResponseController.getUserResponses
);

// Admin/Moderator routes
router.get(
  '/admin/responses/pending',
  authorizeRoles('admin', 'moderator'),
  reviewResponseController.getPendingResponses
);

router.put(
  '/admin/responses/:responseId/moderate',
  authorizeRoles('admin', 'moderator'),
  validateUUID('responseId'),
  validateFields(['status']),
  reviewResponseController.moderateResponse
);

router.get(
  '/admin/responses/analytics',
  authorizeRoles('admin', 'moderator'),
  reviewResponseController.getResponseAnalytics
);

export default router;
