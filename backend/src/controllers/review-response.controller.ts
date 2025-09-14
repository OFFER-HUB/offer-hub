import { Request, Response, NextFunction } from 'express';
import { reviewResponseService } from '../services/review-response.service';
import { AppError, MissingFieldsError, ValidationError } from '../utils/AppError';
import { buildSuccessResponse } from '../utils/responseBuilder';
import { supabase } from '@/lib/supabase/supabase';
import { 
  CreateReviewResponseDTO, 
  UpdateReviewResponseDTO,
  ModerateReviewResponseDTO,
  VoteResponseDTO,
  ResponseAnalyticsFilters,
  ReviewResponseErrorCodes
} from '../types/review-responses.types';

export class ReviewResponseController {
  /**
   * POST /api/reviews/:reviewId/responses - Create a response to a review
   */
  createResponse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { reviewId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const dto: CreateReviewResponseDTO = {
        review_id: reviewId,
        content: req.body.content
      };

      // Validate required fields
      if (!dto.content) {
        throw new MissingFieldsError('Content is required', ['content']);
      }

      const response = await reviewResponseService.createResponse(dto, userId);
      res.status(201).json(buildSuccessResponse(response, 'Review response created successfully'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/reviews/:reviewId/responses - Get all responses for a review
   */
  getResponsesByReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { reviewId } = req.params;
      
      const responses = await reviewResponseService.getResponsesByReview(reviewId);
      
      // Increment view count for each response
      await Promise.all(
        responses.map(response => 
          reviewResponseService.incrementViewCount(response.id)
        )
      );

      res.status(200).json(buildSuccessResponse({
        data: responses,
        count: responses.length
      }, 'Review responses fetched successfully'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/responses/:responseId - Get a specific response by ID
   */
  getResponseById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { responseId } = req.params;
      
      const response = await reviewResponseService.getResponseById(responseId);
      
      if (!response) {
        res.status(404).json({ success: false, message: 'Response not found' });
        return;
      }

      // Increment view count
      await reviewResponseService.incrementViewCount(responseId);

      res.status(200).json(buildSuccessResponse(response, 'Response fetched successfully'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/responses/:responseId - Update a response (if not approved)
   */
  updateResponse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { responseId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const dto: UpdateReviewResponseDTO = {
        content: req.body.content
      };

      // Validate required fields
      if (!dto.content) {
        throw new MissingFieldsError('Content is required', ['content']);
      }

      const response = await reviewResponseService.updateResponse(responseId, dto, userId);
      res.status(200).json(buildSuccessResponse(response, 'Response updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/responses/:responseId - Delete a response (if not approved)
   */
  deleteResponse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { responseId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      await reviewResponseService.deleteResponse(responseId, userId);
      res.status(200).json(buildSuccessResponse(null, 'Response deleted successfully'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/responses/:responseId/vote - Vote on response helpfulness
   */
  voteOnResponse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { responseId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const dto: VoteResponseDTO = {
        response_id: responseId,
        vote_type: req.body.vote_type
      };

      // Validate vote type
      if (!dto.vote_type || !['helpful', 'unhelpful'].includes(dto.vote_type)) {
        throw new ValidationError('Invalid vote type. Must be "helpful" or "unhelpful"');
      }

      const result = await reviewResponseService.voteOnResponse(dto, userId);
      
      res.status(200).json(buildSuccessResponse({
        response_id: responseId,
        vote_type: dto.vote_type,
        ...result
      }, 'Vote recorded successfully'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/admin/responses/pending - Get pending responses for moderation
   */
  getPendingResponses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || userRole !== 'moderator' && userRole !== 'admin') {
        res.status(403).json({ success: false, message: 'Insufficient permissions' });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const responses = await reviewResponseService.getPendingResponses(limit, offset);
      
      res.status(200).json(buildSuccessResponse({
        data: responses,
        count: responses.length,
        pagination: {
          limit,
          offset,
          has_more: responses.length === limit
        }
      }, 'Pending responses fetched successfully'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/admin/responses/:responseId/moderate - Moderate a response
   */
  moderateResponse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { responseId } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || userRole !== 'moderator' && userRole !== 'admin') {
        res.status(403).json({ success: false, message: 'Insufficient permissions' });
        return;
      }

      const dto: ModerateReviewResponseDTO = {
        status: req.body.status,
        moderation_notes: req.body.moderation_notes
      };

      // Validate status
      if (!dto.status || !['approved', 'rejected', 'flagged'].includes(dto.status)) {
        throw new ValidationError('Invalid status. Must be "approved", "rejected", or "flagged"');
      }

      const response = await reviewResponseService.moderateResponse(responseId, dto, userId);
      res.status(200).json(buildSuccessResponse(response, 'Response moderated successfully'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/admin/responses/analytics - Get response analytics dashboard
   */
  getResponseAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || userRole !== 'moderator' && userRole !== 'admin') {
        res.status(403).json({ success: false, message: 'Insufficient permissions' });
        return;
      }

      const filters: ResponseAnalyticsFilters = {
        date_from: req.query.date_from as string,
        date_to: req.query.date_to as string,
        status: req.query.status as any,
        responder_id: req.query.responder_id as string,
        review_id: req.query.review_id as string,
        min_engagement_score: req.query.min_engagement_score ? 
          parseFloat(req.query.min_engagement_score as string) : undefined
      };

      const analytics = await reviewResponseService.getResponseAnalytics(filters);
      res.status(200).json(buildSuccessResponse(analytics, 'Response analytics fetched successfully'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/users/:userId/responses - Get all responses by a user
   */
  getUserResponses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user?.id;

      // Users can only view their own responses unless they're moderators
      if (currentUserId !== userId && req.user?.role !== 'moderator' && req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Insufficient permissions' });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      // Get responses with pagination
      const { data, error } = await supabase
        .from('review_responses')
        .select(`
          *,
          responder:responder_id (
            id,
            name,
            avatar
          ),
          analytics:response_analytics!inner (
            *
          ),
          review:review_id (
            id,
            rating,
            comment,
            from_user_id,
            to_user_id
          )
        `)
        .eq('responder_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new AppError('Database_Error', 500);
      }

      res.status(200).json(buildSuccessResponse({
        data: data || [],
        count: data?.length || 0,
        pagination: {
          limit,
          offset,
          has_more: (data?.length || 0) === limit
        }
      }, 'User responses fetched successfully'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/responses/guidelines - Get response guidelines and best practices
   */
  getResponseGuidelines = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const guidelines = {
        professional_tone: 'Use professional and constructive language',
        specificity: 'Address specific points mentioned in the review',
        gratitude: 'Thank the reviewer for their feedback',
        action_items: 'Mention any improvements or clarifications',
        length_guidelines: 'Keep responses between 50-500 characters for optimal impact',
        examples: {
          good: 'Thank you for your feedback! I appreciate your honest review and will work on improving the communication aspect for future projects.',
          bad: 'This review is unfair and doesn\'t reflect my work quality.'
        },
        validation_rules: {
          min_length: 10,
          max_length: 2000,
          prohibited_content: ['spam', 'harassment', 'personal_info']
        }
      };

      res.status(200).json(buildSuccessResponse(guidelines, 'Response guidelines fetched successfully'));
    } catch (error) {
      next(error);
    }
  };
}

export const reviewResponseController = new ReviewResponseController();
