import {
  Review as BaseReview,
  CreateReviewDTO as BaseCreateReviewDTO,
} from '@/types/review.types';

/**
 * Enhanced Review with extended properties for the management system.
 * Extends the base Review type with additional metadata.
 */
export interface Review extends BaseReview {
  reviewee_name?: string;
  reviewer_name?: string;
  reviewer_avatar?: string;
  project_title?: string;
  project_value?: number;
  project_type?: string;
}

/**
 * Data transfer object for creating a review.
 * Extends the base DTO with project-specific information.
 */
export interface CreateReviewDTO extends BaseCreateReviewDTO {
  project_type?: string;
  project_title?: string;
  project_value?: number;
}

/**
 * Data transfer object for updating an existing review.
 * Only includes fields that can be modified.
 */
export interface UpdateReviewDTO {
  id: string;
  rating?: number;
  comment?: string;
  project_type?: string;
  project_title?: string;
  project_value?: number;
}

/**
 * Options for filtering reviews with support for multiple criteria.
 */
export interface ReviewFilterOptions {
  rating?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  projectTypes?: string[];
  search?: string;
  sortBy?: ReviewSortField;
  sortDirection?: SortDirection;
}

/**
 * Pagination configuration and metadata.
 */
export interface PaginationOptions {
  page: number;
  pageSize: number;
  totalItems?: number;
  totalPages?: number;
}

/**
 * Comprehensive statistics about reviews.
 */
export interface ReviewStatistics {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number; // Rating -> count
  };
  reviewsByMonth: {
    [key: string]: number; // YYYY-MM -> count
  };
  reviewsByProjectType: {
    [key: string]: {
      count: number;
      averageRating: number;
    };
  };
  fiveStarReviews: number;
  totalProjectValue: number;
}

/**
 * Cache item structure with TTL support.
 */
export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Configuration for the review cache system.
 */
export interface CacheConfig {
  defaultTTL: number; // Time to live in milliseconds
  cleanupInterval: number; // Cleanup interval in milliseconds
}

/**
 * Loading states for different review operations.
 */
export interface ReviewLoadingState {
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetching: boolean;
}

/**
 * Error states for different review operations.
 */
export interface ReviewErrorState {
  fetchError?: string;
  createError?: string;
  updateError?: string;
  deleteError?: string;
}

/**
 * Supported export formats for review data.
 */
export type ExportFormat = 'csv' | 'json' | 'pdf';

/**
 * Available fields for sorting reviews.
 */
export type ReviewSortField =
  | 'rating'
  | 'created_at'
  | 'project_title'
  | 'project_value';

/**
 * Sort direction options.
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Event structure for review mutations across tabs.
 */
export interface ReviewMutationEvent {
  type: 'create' | 'update' | 'delete';
  payload: Review;
  timestamp: number;
}

/**
 * Key structure for review cache entries.
 */
export type ReviewQueryKey =
  | ['review', string] // single review by id
  | ['reviews', string] // reviews by user id
  | ['reviews', string, ReviewFilterOptions] // filtered reviews
  | ['reviews', string, ReviewFilterOptions, PaginationOptions]; // paginated filtered reviews

/**
 * Search result with relevance scoring.
 */
export interface ReviewSearchResult {
  review: Review;
  relevanceScore: number;
}
