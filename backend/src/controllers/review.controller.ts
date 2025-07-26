import { Request, Response, NextFunction } from "express";
import { reviewService } from "../services/review.service";
import { AppError } from "../utils/AppError";

export class ReviewController {
  /**
   * POST /api/reviews - Submit a review
   */
  createReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { from_id, to_id, contract_id, rating, comment } = req.body;

      // Validate required fields
      if (!from_id || !to_id || !contract_id || rating === undefined) {
        throw new AppError("Missing_required_fields", 400);
      }

      // Validate rating is a number
      if (typeof rating !== "number" || isNaN(rating)) {
        throw new AppError("Rating_must_be_a_number", 400);
      }

      const review = await reviewService.createReview({
        from_id,
        to_id,
        contract_id,
        rating,
        comment: comment || "",
      });

      res.status(201).json({
        success: true,
        message: "Review_created_successfully",
        data: {
          id: review.id,
          from_id: review.from_id,
          to_id: review.to_id,
          contract_id: review.contract_id,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/users/:id/reviews - Get all reviews for a user
   */
  getReviewsByUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError("User_ID_is_required", 400);
      }

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        throw new AppError("Invalid_user_ID_format", 400);
      }

      const reviews = await reviewService.getReviewsByUser(id);

      res.status(200).json({
        success: true,
        message: "Reviews_fetched_successfully",
        data: reviews,
        count: reviews.length,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const reviewController = new ReviewController();
