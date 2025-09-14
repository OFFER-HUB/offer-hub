// Review Response System Types
// Based on PRD requirements for comprehensive review response functionality

export type ResponseStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

// Database Model for Review Response (matches DB schema)
export interface ReviewResponse {
  id: string;
  review_id: string;
  responder_id: string;
  content: string;
  status: ResponseStatus;
  moderation_notes?: string;
  moderator_id?: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
}

// Database Model for Response Analytics (matches DB schema)
export interface ResponseAnalytics {
  id: string;
  response_id: string;
  helpful_votes: number;
  unhelpful_votes: number;
  views_count: number;
  engagement_score: number;
  created_at: string;
  updated_at: string;
}

// Extended Review Response with analytics and user info
export interface ReviewResponseWithDetails extends ReviewResponse {
  responder: {
    id: string;
    name: string;
    avatar?: string;
  };
  analytics: ResponseAnalytics;
  review: {
    id: string;
    rating: number;
    comment?: string;
    from_user_id: string;
    to_user_id: string;
  };
}

// DTO for creating a review response
export interface CreateReviewResponseDTO {
  review_id: string;
  content: string;
}

// DTO for updating a review response
export interface UpdateReviewResponseDTO {
  content: string;
}

// DTO for moderating a review response
export interface ModerateReviewResponseDTO {
  status: ResponseStatus;
  moderation_notes?: string;
}

// DTO for voting on a response
export interface VoteResponseDTO {
  response_id: string;
  vote_type: 'helpful' | 'unhelpful';
}

// Response creation validation rules
export interface ResponseValidationRules {
  min_length: number;
  max_length: number;
  required_fields: string[];
  prohibited_content: string[];
  quality_threshold: number;
}

// Moderation criteria
export interface ModerationCriteria {
  auto_approve_threshold: number;
  flag_keywords: string[];
  spam_patterns: string[];
  quality_checks: string[];
}

// Analytics filters
export interface ResponseAnalyticsFilters {
  date_from?: string;
  date_to?: string;
  status?: ResponseStatus;
  responder_id?: string;
  review_id?: string;
  min_engagement_score?: number;
}

// Response quality assessment
export interface ResponseQualityAssessment {
  score: number; // 0-100
  factors: {
    length_score: number;
    professionalism_score: number;
    relevance_score: number;
    tone_score: number;
  };
  suggestions: string[];
  auto_approve: boolean;
}

// API Response Types
export type ReviewResponseCreateResponse = {
  success: true;
  message: 'Review response created successfully';
  data: ReviewResponse;
};

export type ReviewResponseUpdateResponse = {
  success: true;
  message: 'Review response updated successfully';
  data: ReviewResponse;
};

export type ReviewResponseDeleteResponse = {
  success: true;
  message: 'Review response deleted successfully';
};

export type ReviewResponseFetchResponse = {
  success: true;
  message: 'Review responses fetched successfully';
  data: ReviewResponseWithDetails[];
  count: number;
};

export type ReviewResponseModerateResponse = {
  success: true;
  message: 'Review response moderated successfully';
  data: ReviewResponse;
};

export type ResponseVoteResponse = {
  success: true;
  message: 'Vote recorded successfully';
  data: {
    response_id: string;
    vote_type: 'helpful' | 'unhelpful';
    total_helpful: number;
    total_unhelpful: number;
  };
};

export type ResponseAnalyticsResponse = {
  success: true;
  message: 'Response analytics fetched successfully';
  data: {
    total_responses: number;
    response_rate: number;
    average_response_time: number;
    quality_score: number;
    engagement_metrics: {
      total_views: number;
      total_helpful_votes: number;
      total_unhelpful_votes: number;
      average_engagement_score: number;
    };
    trends: {
      daily_responses: Array<{ date: string; count: number }>;
      quality_trends: Array<{ date: string; score: number }>;
    };
  };
};

export type ReviewResponseErrorResponse = {
  success: false;
  message: string;
  data?: unknown;
  error_code?: string;
};

// Union type for all response types
export type ReviewResponseAPIResponse = 
  | ReviewResponseCreateResponse
  | ReviewResponseUpdateResponse
  | ReviewResponseDeleteResponse
  | ReviewResponseFetchResponse
  | ReviewResponseModerateResponse
  | ResponseVoteResponse
  | ResponseAnalyticsResponse
  | ReviewResponseErrorResponse;

// Constants for validation
export const RESPONSE_VALIDATION: ResponseValidationRules = {
  min_length: 10,
  max_length: 2000,
  required_fields: ['content'],
  prohibited_content: ['spam', 'harassment', 'personal_info'],
  quality_threshold: 70
};

export const MODERATION_CRITERIA: ModerationCriteria = {
  auto_approve_threshold: 80,
  flag_keywords: ['spam', 'fake', 'scam', 'harassment'],
  spam_patterns: ['repeated_characters', 'excessive_links', 'promotional_content'],
  quality_checks: ['professional_tone', 'relevance', 'constructive_feedback']
};

// Response guidelines for users
export const RESPONSE_GUIDELINES = {
  professional_tone: 'Use professional and constructive language',
  specificity: 'Address specific points mentioned in the review',
  gratitude: 'Thank the reviewer for their feedback',
  action_items: 'Mention any improvements or clarifications',
  length_guidelines: 'Keep responses between 50-500 characters for optimal impact',
  examples: {
    good: 'Thank you for your feedback! I appreciate your honest review and will work on improving the communication aspect for future projects.',
    bad: 'This review is unfair and doesn\'t reflect my work quality.'
  }
};

// Error codes for response system
export enum ReviewResponseErrorCodes {
  RESPONSE_NOT_FOUND = 'RESPONSE_NOT_FOUND',
  RESPONSE_ALREADY_EXISTS = 'RESPONSE_ALREADY_EXISTS',
  RESPONSE_TOO_SHORT = 'RESPONSE_TOO_SHORT',
  RESPONSE_TOO_LONG = 'RESPONSE_TOO_LONG',
  RESPONSE_CONTAINS_PROHIBITED_CONTENT = 'RESPONSE_CONTAINS_PROHIBITED_CONTENT',
  RESPONSE_NOT_PENDING = 'RESPONSE_NOT_PENDING',
  UNAUTHORIZED_TO_RESPOND = 'UNAUTHORIZED_TO_RESPOND',
  UNAUTHORIZED_TO_MODERATE = 'UNAUTHORIZED_TO_MODERATE',
  MODERATION_FAILED = 'MODERATION_FAILED',
  ANALYTICS_UNAVAILABLE = 'ANALYTICS_UNAVAILABLE',
  VOTE_ALREADY_EXISTS = 'VOTE_ALREADY_EXISTS',
  INVALID_VOTE_TYPE = 'INVALID_VOTE_TYPE'
}
