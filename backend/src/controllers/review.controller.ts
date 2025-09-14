
import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/review.service';
import { AppError, MissingFieldsError, ValidationError } from '../utils/AppError';
import { buildSuccessResponse } from '../utils/responseBuilder';
import { CreateReviewDTO, UpdateReviewDTO } from '../types/review.types';

export class ReviewController {
  /**
   * POST /api/reviews - Submit a review
   */
  createReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {

      const dto: CreateReviewDTO = req.body;
      const review = await reviewService.createReview(dto);
      res.status(201).json(buildSuccessResponse(review, 'Review created successfully'));

  };

  /**
   * GET /api/reviews/:id - Get a single review by ID
   */
  getReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { id } = req.params;
    const review = await reviewService.getReviewById(id);
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }
    res.status(200).json(buildSuccessResponse(review, 'Review fetched successfully'));
  };

  /**
   * GET /api/users/:userId/reviews - Get all reviews for a user
   */
  getReviewsByUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { userId } = req.params;
    if (!userId) throw new MissingFieldsError('User ID is required');
    const reviews = await reviewService.getReviewsByUser(userId);
    res.status(200).json(buildSuccessResponse(reviews, 'Reviews fetched successfully'));
  };

  // TODO: Implement updateReview and deleteReview endpoints
}

export const reviewController = new ReviewController();
