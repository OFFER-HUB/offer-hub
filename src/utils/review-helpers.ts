/**
 * @fileoverview Helper utilities for review data processing and management
 * @author Offer Hub Team
 */

import {
  Review,
  CreateReviewDTO,
  UpdateReviewDTO,
  ReviewFilterOptions,
  ReviewStatistics,
  ReviewSearchResult,
} from '@/types/reviews.types';

/**
 * Validates if a string is a valid UUID.
 *
 * @param uuid - The string to validate
 * @returns True if the string is a valid UUID, false otherwise
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validates review input data for submission.
 *
 * @param input - The review data to validate
 * @returns Null if valid, error message if invalid
 */
export const validateReviewInput = (input: CreateReviewDTO): string | null => {
  if (!input.from_id || !isValidUUID(input.from_id)) {
    return 'Invalid reviewer ID';
  }
  if (!input.to_id || !isValidUUID(input.to_id)) {
    return 'Invalid reviewee ID';
  }
  if (!input.contract_id || !isValidUUID(input.contract_id)) {
    return 'Invalid contract ID';
  }
  if (
    !input.rating ||
    input.rating < 1 ||
    input.rating > 5 ||
    !Number.isInteger(input.rating)
  ) {
    return 'Rating must be a whole number between 1 and 5';
  }
  return null;
};

/**
 * Formats an ISO date string into a human-readable format.
 *
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "January 15, 2025")
 */
export const formatReviewDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Generates an array of booleans for star rendering.
 * Used to create rating star UI elements.
 *
 * @param rating - The rating value (1-5)
 * @returns Array of booleans where true means filled star
 */
export const generateStarsArray = (rating: number): boolean[] => {
  return Array.from({ length: 5 }, (_, i) => i < rating);
};

/**
 * Applies multiple filters to an array of reviews.
 * Supports filtering by rating range, date range, project type, and search text.
 *
 * @param reviews - Array of reviews to filter
 * @param filters - Filter criteria
 * @returns Filtered array of reviews
 */
export const applyFilters = (
  reviews: Review[],
  filters: ReviewFilterOptions
): Review[] => {
  if (!reviews || !filters) return reviews || [];

  return reviews.filter((review) => {
    // Rating filter
    if (filters.rating) {
      const { min, max } = filters.rating;
      if (min !== undefined && review.rating < min) return false;
      if (max !== undefined && review.rating > max) return false;
    }

    // Date range filter
    if (filters.dateRange) {
      const reviewDate = new Date(review.created_at);
      if (filters.dateRange.from && reviewDate < filters.dateRange.from)
        return false;
      if (filters.dateRange.to && reviewDate > filters.dateRange.to)
        return false;
    }

    // Project type filter
    if (filters.projectTypes?.length && review.project_type) {
      if (!filters.projectTypes.includes(review.project_type)) return false;
    }

    // Search text
    if (filters.search && filters.search.trim() !== '') {
      const search = filters.search.toLowerCase();
      const commentMatch = review.comment?.toLowerCase().includes(search);
      const projectTitleMatch = review.project_title
        ?.toLowerCase()
        .includes(search);
      const reviewerNameMatch = review.reviewer_name
        ?.toLowerCase()
        .includes(search);

      if (!commentMatch && !projectTitleMatch && !reviewerNameMatch) {
        return false;
      }
    }

    return true;
  });
};

// Sort reviews
export const sortReviews = (
  reviews: Review[],
  sortBy: string = 'created_at',
  sortDirection: 'asc' | 'desc' = 'desc'
): Review[] => {
  if (!reviews) return [];

  return [...reviews].sort((a, b) => {
    let valueA, valueB;

    switch (sortBy) {
      case 'rating':
        valueA = a.rating;
        valueB = b.rating;
        break;
      case 'project_value':
        valueA = a.project_value || 0;
        valueB = b.project_value || 0;
        break;
      case 'project_title':
        valueA = a.project_title || '';
        valueB = b.project_title || '';
        return sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      case 'created_at':
      default:
        valueA = new Date(a.created_at).getTime();
        valueB = new Date(b.created_at).getTime();
    }

    return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
  });
};

// Calculate review statistics
export const calculateReviewStatistics = (
  reviews: Review[]
): ReviewStatistics => {
  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: {},
      reviewsByMonth: {},
      reviewsByProjectType: {},
      fiveStarReviews: 0,
      totalProjectValue: 0,
    };
  }

  // Initialize distribution
  const ratingDistribution: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  const reviewsByMonth: Record<string, number> = {};
  const reviewsByProjectType: Record<
    string,
    { count: number; totalRating: number }
  > = {};

  let totalRating = 0;
  let totalProjectValue = 0;
  let fiveStarReviews = 0;

  reviews.forEach((review) => {
    // Rating distribution
    ratingDistribution[review.rating] =
      (ratingDistribution[review.rating] || 0) + 1;

    // Five star reviews
    if (review.rating === 5) {
      fiveStarReviews++;
    }

    // Total rating
    totalRating += review.rating;

    // Total project value
    if (review.project_value) {
      totalProjectValue += review.project_value;
    }

    // Reviews by month
    const date = new Date(review.created_at);
    const monthYear = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`;
    reviewsByMonth[monthYear] = (reviewsByMonth[monthYear] || 0) + 1;

    // Reviews by project type
    if (review.project_type) {
      if (!reviewsByProjectType[review.project_type]) {
        reviewsByProjectType[review.project_type] = {
          count: 0,
          totalRating: 0,
        };
      }
      reviewsByProjectType[review.project_type].count += 1;
      reviewsByProjectType[review.project_type].totalRating += review.rating;
    }
  });

  // Calculate average rating
  const averageRating = Number((totalRating / reviews.length).toFixed(1));

  // Calculate average rating by project type
  const finalReviewsByProjectType: Record<
    string,
    { count: number; averageRating: number }
  > = {};

  Object.entries(reviewsByProjectType).forEach(([type, data]) => {
    finalReviewsByProjectType[type] = {
      count: data.count,
      averageRating: Number((data.totalRating / data.count).toFixed(1)),
    };
  });

  return {
    averageRating,
    totalReviews: reviews.length,
    ratingDistribution,
    reviewsByMonth,
    reviewsByProjectType: finalReviewsByProjectType,
    fiveStarReviews,
    totalProjectValue,
  };
};

// Perform full text search on reviews with relevance scoring
export const searchReviews = (
  reviews: Review[],
  query: string
): ReviewSearchResult[] => {
  if (!query || query.trim() === '' || !reviews?.length) {
    return reviews.map((review) => ({ review, relevanceScore: 0 }));
  }

  const keywords = query.toLowerCase().trim().split(/\s+/);

  return reviews
    .map((review) => {
      let relevanceScore = 0;

      // Check comment for matches
      if (review.comment) {
        const commentLower = review.comment.toLowerCase();

        keywords.forEach((keyword) => {
          // Count non-overlapping occurrences safely (no regex)
          let matches = 0;
          let idx = 0;
          while (keyword && (idx = commentLower.indexOf(keyword, idx)) !== -1) {
            matches++;
            idx = keyword.length;
          }
          relevanceScore += matches * 2; // Comment matches have higher weight

          // Exact phrase match bonus
          if (commentLower.includes(keyword)) {
            relevanceScore += 5;
          }
        });
      }

      // Check project title
      if (review.project_title) {
        const titleLower = review.project_title.toLowerCase();

        keywords.forEach((keyword) => {
          if (titleLower.includes(keyword)) {
            relevanceScore += 10; // Title matches have highest weight
          }
        });
      }

      // Check reviewer name
      if (review.reviewer_name) {
        const nameLower = review.reviewer_name.toLowerCase();

        keywords.forEach((keyword) => {
          if (nameLower.includes(keyword)) {
            relevanceScore += 3;
          }
        });
      }

      return { review, relevanceScore };
    })
    .filter((result) => result.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
};

// Export reviews to CSV
export const exportToCSV = (reviews: Review[]): string => {
  if (!reviews || reviews.length === 0) return '';

  // Define headers
  const headers = [
    'ID',
    'From ID',
    'To ID',
    'Contract ID',
    'Rating',
    'Comment',
    'Created At',
    'Project Title',
    'Project Type',
    'Project Value',
    'Reviewer Name',
    'Reviewee Name',
  ];

  // Create CSV rows
  const csvRows = [
    headers.join(','),
    ...reviews.map((review) => {
      return [
        review.id,
        review.from_id,
        review.to_id,
        review.contract_id,
        review.rating,
        review.comment ? `"${review.comment.replace(/"/g, '""')}"` : '',
        review.created_at,
        review.project_title
          ? `"${review.project_title.replace(/"/g, '""')}"`
          : '',
        review.project_type || '',
        review.project_value || '',
        review.reviewer_name
          ? `"${review.reviewer_name.replace(/"/g, '""')}"`
          : '',
        review.reviewee_name
          ? `"${review.reviewee_name.replace(/"/g, '""')}"`
          : '',
      ].join(',');
    }),
  ];

  return csvRows.join('\n');
};

// Export reviews to JSON
export const exportToJSON = (reviews: Review[]): string => {
  return JSON.stringify(reviews, null, 2);
};

// Generate pagination data
export const generatePaginationData = (
  totalItems: number,
  pageSize: number,
  currentPage: number
) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    totalItems,
    totalPages,
    currentPage: Math.min(currentPage, totalPages),
    pageSize,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

// Check if filter options have changed
export const haveFiltersChanged = (
  prevFilters: ReviewFilterOptions | undefined,
  currentFilters: ReviewFilterOptions | undefined
): boolean => {
  if (!prevFilters && !currentFilters) return false;
  if (!prevFilters || !currentFilters) return true;

  // Check rating
  if (
    prevFilters.rating?.min !== currentFilters.rating?.min ||
    prevFilters.rating?.max !== currentFilters.rating?.max
  ) {
    return true;
  }

  // Check date range
  if (
    prevFilters.dateRange?.from?.getTime() !==
      currentFilters.dateRange?.from?.getTime() ||
    prevFilters.dateRange?.to?.getTime() !==
      currentFilters.dateRange?.to?.getTime()
  ) {
    return true;
  }

  // Check project types
  const prevTypes = prevFilters.projectTypes || [];
  const currTypes = currentFilters.projectTypes || [];

  if (prevTypes.length !== currTypes.length) {
    return true;
  }

  for (let i = 0; i < prevTypes.length; i++) {
    if (prevTypes[i] !== currTypes[i]) {
      return true;
    }
  }

  // Check search
  if (prevFilters.search !== currentFilters.search) {
    return true;
  }

  // Check sort
  if (
    prevFilters.sortBy !== currentFilters.sortBy ||
    prevFilters.sortDirection !== currentFilters.sortDirection
  ) {
    return true;
  }

  return false;
};

// Normalize error message
export const normalizeErrorMessage = (message: string): string => {
  const errorMap: Record<string, string> = {
    Missing_required_fields: 'All required fields must be filled out',
    Rating_must_be_a_number: 'Rating must be a valid number between 1 and 5',
    User_ID_is_required: 'User ID is required',
    Invalid_user_ID_format: 'Invalid user ID format',
    'Contract not found': 'Contract not found',
    'Contract not completed':
      'Reviews can only be submitted for completed contracts',
    'Not authorized': 'You are not authorized to review this contract',
    'Duplicate review': 'You have already reviewed this contract',
  };

  return errorMap[message] || message || 'An error occurred';
};
