import { supabase } from '@/lib/supabase/supabase';
import { 
  ReviewResponse, 
  CreateReviewResponseDTO, 
  UpdateReviewResponseDTO,
  ModerateReviewResponseDTO,
  VoteResponseDTO,
  ReviewResponseWithDetails,
  ResponseQualityAssessment,
  ResponseAnalyticsFilters,
  ReviewResponseErrorCodes,
  RESPONSE_VALIDATION,
  MODERATION_CRITERIA
} from '../types/review-responses.types';
import { AppError } from '../utils/AppError';

export class ReviewResponseService {
  /**
   * Create a new review response
   */
  async createResponse(data: CreateReviewResponseDTO, responderId: string): Promise<ReviewResponse> {
    const { review_id, content } = data;

    // Validate input
    this.validateResponseContent(content);

    // Check if user is authorized to respond to this review
    await this.validateResponseAuthorization(review_id, responderId);

    // Check if response already exists
    const existingResponse = await this.getResponseByReviewAndResponder(review_id, responderId);
    if (existingResponse) {
      throw new AppError(ReviewResponseErrorCodes.RESPONSE_ALREADY_EXISTS, 409);
    }

    // Assess response quality
    const qualityAssessment = await this.assessResponseQuality(content);
    
    // Determine initial status based on quality assessment
    const initialStatus = qualityAssessment.auto_approve ? 'approved' : 'pending';

    const { data: response, error } = await supabase
      .from('review_responses')
      .insert({
        review_id,
        responder_id: responderId,
        content,
        status: initialStatus,
        approved_at: initialStatus === 'approved' ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (error) this.handleDbError(error);

    return response;
  }

  /**
   * Get all responses for a specific review
   */
  async getResponsesByReview(reviewId: string): Promise<ReviewResponseWithDetails[]> {
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
      .eq('review_id', reviewId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true });

    if (error) this.handleDbError(error);

    return data || [];
  }

  /**
   * Get a specific response by ID
   */
  async getResponseById(responseId: string): Promise<ReviewResponseWithDetails | null> {
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
      .eq('id', responseId)
      .maybeSingle();

    if (error) this.handleDbError(error);

    return data || null;
  }

  /**
   * Update a response (only if pending)
   */
  async updateResponse(responseId: string, data: UpdateReviewResponseDTO, userId: string): Promise<ReviewResponse> {
    const { content } = data;

    // Validate input
    this.validateResponseContent(content);

    // Check if response exists and user owns it
    const existingResponse = await this.getResponseById(responseId);
    if (!existingResponse) {
      throw new AppError(ReviewResponseErrorCodes.RESPONSE_NOT_FOUND, 404);
    }

    if (existingResponse.responder_id !== userId) {
      throw new AppError(ReviewResponseErrorCodes.UNAUTHORIZED_TO_RESPOND, 403);
    }

    if (existingResponse.status !== 'pending') {
      throw new AppError(ReviewResponseErrorCodes.RESPONSE_NOT_PENDING, 400);
    }

    // Re-assess quality
    const qualityAssessment = await this.assessResponseQuality(content);

    const { data: response, error } = await supabase
      .from('review_responses')
      .update({
        content,
        status: qualityAssessment.auto_approve ? 'approved' : 'pending',
        approved_at: qualityAssessment.auto_approve ? new Date().toISOString() : null
      })
      .eq('id', responseId)
      .select()
      .single();

    if (error) this.handleDbError(error);

    return response;
  }

  /**
   * Delete a response (only if pending)
   */
  async deleteResponse(responseId: string, userId: string): Promise<void> {
    // Check if response exists and user owns it
    const existingResponse = await this.getResponseById(responseId);
    if (!existingResponse) {
      throw new AppError(ReviewResponseErrorCodes.RESPONSE_NOT_FOUND, 404);
    }

    if (existingResponse.responder_id !== userId) {
      throw new AppError(ReviewResponseErrorCodes.UNAUTHORIZED_TO_RESPOND, 403);
    }

    if (existingResponse.status !== 'pending') {
      throw new AppError(ReviewResponseErrorCodes.RESPONSE_NOT_PENDING, 400);
    }

    const { error } = await supabase
      .from('review_responses')
      .delete()
      .eq('id', responseId);

    if (error) this.handleDbError(error);
  }

  /**
   * Moderate a response (admin/moderator only)
   */
  async moderateResponse(responseId: string, data: ModerateReviewResponseDTO, moderatorId: string): Promise<ReviewResponse> {
    const { status, moderation_notes } = data;

    // Check if response exists
    const existingResponse = await this.getResponseById(responseId);
    if (!existingResponse) {
      throw new AppError(ReviewResponseErrorCodes.RESPONSE_NOT_FOUND, 404);
    }

    const updateData: any = {
      status,
      moderator_id: moderatorId,
      moderation_notes
    };

    if (status === 'approved') {
      updateData.approved_at = new Date().toISOString();
    }

    const { data: response, error } = await supabase
      .from('review_responses')
      .update(updateData)
      .eq('id', responseId)
      .select()
      .single();

    if (error) this.handleDbError(error);

    return response;
  }

  /**
   * Vote on a response helpfulness
   */
  async voteOnResponse(data: VoteResponseDTO, userId: string): Promise<{ total_helpful: number; total_unhelpful: number }> {
    const { response_id, vote_type } = data;

    // Check if response exists
    const existingResponse = await this.getResponseById(response_id);
    if (!existingResponse) {
      throw new AppError(ReviewResponseErrorCodes.RESPONSE_NOT_FOUND, 404);
    }

    // Check if user already voted
    const { data: existingVote, error: voteError } = await supabase
      .from('response_votes')
      .select('*')
      .eq('response_id', response_id)
      .eq('voter_id', userId)
      .maybeSingle();

    if (voteError) this.handleDbError(voteError);

    if (existingVote) {
      throw new AppError(ReviewResponseErrorCodes.VOTE_ALREADY_EXISTS, 409);
    }

    // Record the vote
    const { error: insertError } = await supabase
      .from('response_votes')
      .insert({
        response_id,
        voter_id: userId,
        vote_type
      });

    if (insertError) this.handleDbError(insertError);

    // Update analytics - simplified approach
    const incrementField = vote_type === 'helpful' ? 'helpful_votes' : 'unhelpful_votes';
    const { error: analyticsError } = await supabase
      .from('response_analytics')
      .update({
        [incrementField]: 1 // Simple increment for now
      })
      .eq('response_id', response_id);

    if (analyticsError) this.handleDbError(analyticsError);

    // Get updated totals
    const { data: analytics } = await supabase
      .from('response_analytics')
      .select('helpful_votes, unhelpful_votes')
      .eq('response_id', response_id)
      .single();

    return {
      total_helpful: analytics?.helpful_votes || 0,
      total_unhelpful: analytics?.unhelpful_votes || 0
    };
  }

  /**
   * Get pending responses for moderation
   */
  async getPendingResponses(limit: number = 50, offset: number = 0): Promise<ReviewResponseWithDetails[]> {
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
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) this.handleDbError(error);

    return data || [];
  }

  /**
   * Get response analytics with filters
   */
  async getResponseAnalytics(filters: ResponseAnalyticsFilters = {}): Promise<any> {
    let query = supabase
      .from('review_responses')
      .select(`
        id,
        status,
        created_at,
        analytics:response_analytics!inner (
          helpful_votes,
          unhelpful_votes,
          views_count,
          engagement_score
        )
      `);

    // Apply filters
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.responder_id) {
      query = query.eq('responder_id', filters.responder_id);
    }
    if (filters.review_id) {
      query = query.eq('review_id', filters.review_id);
    }

    const { data, error } = await query;

    if (error) this.handleDbError(error);

    // Calculate analytics
    const responses = data || [];
    const totalResponses = responses.length;
    const approvedResponses = responses.filter(r => r.status === 'approved').length;
    const responseRate = totalResponses > 0 ? (approvedResponses / totalResponses) * 100 : 0;

    const totalViews = responses.reduce((sum, r) => sum + ((r.analytics as any)?.views_count || 0), 0);
    const totalHelpful = responses.reduce((sum, r) => sum + ((r.analytics as any)?.helpful_votes || 0), 0);
    const totalUnhelpful = responses.reduce((sum, r) => sum + ((r.analytics as any)?.unhelpful_votes || 0), 0);
    const avgEngagementScore = responses.length > 0
      ? responses.reduce((sum, r) => sum + ((r.analytics as any)?.engagement_score || 0), 0) / responses.length
      : 0;

    return {
      total_responses: totalResponses,
      response_rate: responseRate,
      quality_score: avgEngagementScore,
      engagement_metrics: {
        totalViews,
        total_helpful_votes: totalHelpful,
        total_unhelpful_votes: totalUnhelpful,
        average_engagement_score: avgEngagementScore
      }
    };
  }

  /**
   * Increment view count for a response
   */
  async incrementViewCount(responseId: string): Promise<void> {
    const { error } = await supabase
      .from('response_analytics')
      .update({
        views_count: 1 // Simple increment for now
      })
      .eq('response_id', responseId);

    if (error) this.handleDbError(error);
  }

  /**
   * Private helper methods
   */

  private validateResponseContent(content: string): void {
    if (!content || content.trim().length < RESPONSE_VALIDATION.min_length) {
      throw new AppError(ReviewResponseErrorCodes.RESPONSE_TOO_SHORT, 400);
    }

    if (content.length > RESPONSE_VALIDATION.max_length) {
      throw new AppError(ReviewResponseErrorCodes.RESPONSE_TOO_LONG, 400);
    }

    // Check for prohibited content
    const lowerContent = content.toLowerCase();
    for (const prohibited of RESPONSE_VALIDATION.prohibited_content) {
      if (lowerContent.includes(prohibited)) {
        throw new AppError(ReviewResponseErrorCodes.RESPONSE_CONTAINS_PROHIBITED_CONTENT, 400);
      }
    }
  }

  private async validateResponseAuthorization(reviewId: string, responderId: string): Promise<void> {
    const { data: review, error } = await supabase
      .from('reviews')
      .select('to_user_id')
      .eq('id', reviewId)
      .single();

    if (error) this.handleDbError(error);

    if (!review) {
      throw new AppError(ReviewResponseErrorCodes.RESPONSE_NOT_FOUND, 404);
    }

    if (review.to_user_id !== responderId) {
      throw new AppError(ReviewResponseErrorCodes.UNAUTHORIZED_TO_RESPOND, 403);
    }
  }

  private async getResponseByReviewAndResponder(reviewId: string, responderId: string): Promise<ReviewResponse | null> {
    const { data, error } = await supabase
      .from('review_responses')
      .select('*')
      .eq('review_id', reviewId)
      .eq('responder_id', responderId)
      .maybeSingle();

    if (error) this.handleDbError(error);

    return data || null;
  }

  private async assessResponseQuality(content: string): Promise<ResponseQualityAssessment> {
    // Basic quality assessment algorithm
    const factors = {
      length_score: this.calculateLengthScore(content),
      professionalism_score: this.calculateProfessionalismScore(content),
      relevance_score: this.calculateRelevanceScore(content),
      tone_score: this.calculateToneScore(content)
    };

    const score = (factors.length_score + factors.professionalism_score + factors.relevance_score + factors.tone_score) / 4;
    const auto_approve = score >= MODERATION_CRITERIA.auto_approve_threshold;

    const suggestions: string[] = [];
    if (factors.length_score < 70) suggestions.push('Consider adding more detail to your response');
    if (factors.professionalism_score < 70) suggestions.push('Use more professional language');
    if (factors.relevance_score < 70) suggestions.push('Address specific points from the review');
    if (factors.tone_score < 70) suggestions.push('Maintain a constructive and positive tone');

    return {
      score,
      factors,
      suggestions,
      auto_approve
    };
  }

  private calculateLengthScore(content: string): number {
    const length = content.length;
    if (length < 50) return 30;
    if (length < 100) return 60;
    if (length < 500) return 90;
    if (length < 1000) return 80;
    return 70; // Too long
  }

  private calculateProfessionalismScore(content: string): number {
    const professionalWords = ['thank', 'appreciate', 'professional', 'improve', 'feedback'];
    const unprofessionalWords = ['hate', 'stupid', 'idiot', 'suck', 'terrible'];
    
    let score = 50; // Base score
    
    const lowerContent = content.toLowerCase();
    professionalWords.forEach(word => {
      if (lowerContent.includes(word)) score += 10;
    });
    
    unprofessionalWords.forEach(word => {
      if (lowerContent.includes(word)) score -= 20;
    });
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateRelevanceScore(content: string): number {
    // Simple relevance check - could be enhanced with NLP
    const relevanceKeywords = ['project', 'work', 'experience', 'communication', 'quality', 'delivery'];
    const lowerContent = content.toLowerCase();
    
    const matches = relevanceKeywords.filter(keyword => lowerContent.includes(keyword)).length;
    return Math.min(100, matches * 20);
  }

  private calculateToneScore(content: string): number {
    const positiveWords = ['thank', 'appreciate', 'positive', 'good', 'great', 'excellent'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'disappointed'];
    
    let score = 50; // Base score
    
    const lowerContent = content.toLowerCase();
    positiveWords.forEach(word => {
      if (lowerContent.includes(word)) score += 10;
    });
    
    negativeWords.forEach(word => {
      if (lowerContent.includes(word)) score -= 15;
    });
    
    return Math.max(0, Math.min(100, score));
  }

  private handleDbError(error: any): never {
    console.error('Database error:', error);
    throw new AppError('Database_Error', 500);
  }
}

export const reviewResponseService = new ReviewResponseService();
