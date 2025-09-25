import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { verifyToken } from '@/middlewares/auth.middleware';

import { validateReviewCreate } from '../middlewares/review.middleware';
import { authorizeReviewAction } from '../middlewares/review-auth.middleware';
import { generalLimiter } from '../middlewares/ratelimit.middleware';
import { ErrorHandlerMiddleware } from '../middlewares/errorHandler.middleware';

const router = Router();

// Create a review (rate limited)
router.post(
	'/',
	generalLimiter,
	verifyToken,
	validateReviewCreate,
	authorizeReviewAction,
	reviewController.createReview
);

// Get a single review by ID (rate limited)
router.get('/:id', generalLimiter, reviewController.getReview);

// Get all reviews for a user (rate limited)
router.get('/user/:userId', generalLimiter, reviewController.getReviewsByUser);

// Global error handler for review routes
router.use(ErrorHandlerMiddleware.getInstance().handle);

// TODO: Add update and delete endpoints

export { router as reviewRoutes };
