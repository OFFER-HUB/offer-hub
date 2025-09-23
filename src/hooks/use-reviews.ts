"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Review,
  CreateReviewDTO,
  UpdateReviewDTO,
  ReviewFilterOptions,
  PaginationOptions,
  ReviewLoadingState,
  ReviewErrorState,
  ExportFormat,
  ReviewMutationEvent,
} from "@/types/reviews.types";
import { useReviewsApi } from "@/hooks/api-connections/use-reviews-api";
import { useReviewCache } from "@/hooks/use-review-cache";
import { useReviewFilters } from "@/hooks/use-review-filters";
import { useReviewStats } from "@/hooks/use-review-stats";
import {
  validateReviewInput,
  exportToCSV,
  exportToJSON,
  generatePaginationData,
  haveFiltersChanged,
  normalizeErrorMessage,
} from "@/utils/review-helpers";

/**
 * Configuration options for the useReviews hook
 */
interface UseReviewsOptions {
  /** User ID to fetch reviews for */
  userId?: string;

  /** Initial filter settings */
  initialFilters?: ReviewFilterOptions;

  /** Initial page number for pagination */
  initialPage?: number;

  /** Number of items per page */
  pageSize?: number;

  /** Whether to enable caching (default: true) */
  enableCaching?: boolean;

  /** Whether to enable debug logging (default: false) */
  enableLogging?: boolean;

  /** Whether to sync data across browser tabs (default: true) */
  syncAcrossTabs?: boolean;
}

/**
 * useReviews - Advanced Review Management Hook
 *
 * Hook for review management,
 * implementing CRUD operations, filtering, pagination, caching, and analytics.
 *
 * Key features:
 * - Complete CRUD operations with validation
 * - Advanced filtering by rating, date, and project type
 * - Full-text search with relevance scoring
 * - Efficient pagination with configurable page sizes
 * - Intelligent caching with TTL and cross-tab synchronization
 * - Comprehensive statistics and analytics
 * - Export capabilities in multiple formats
 * - Detailed loading and error states
 */
export function useReviews({
  userId,
  initialFilters = {},
  initialPage = 1,
  pageSize = 10,
  enableCaching = true,
  enableLogging = false,
  syncAcrossTabs = true,
}: UseReviewsOptions = {}) {
  // Main review data state
  const [reviews, setReviews] = useState<Review[]>([]);

  // Pagination configuration
  const [pagination, setPagination] = useState<PaginationOptions>({
    page: initialPage,
    pageSize: pageSize,
  });

  // Granular loading states for better UI feedback
  const [loadingState, setLoadingState] = useState<ReviewLoadingState>({
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isFetching: false,
  });

  // Operation-specific error states
  const [errorState, setErrorState] = useState<ReviewErrorState>({});

  // Debounced filters to prevent excessive API calls
  const [debouncedFilters, setDebouncedFilters] =
    useState<ReviewFilterOptions>(initialFilters);

  // API hooks
  const {
    fetchUserReviews,
    createReview,
    updateReview: updateReviewApi,
    deleteReview: deleteReviewApi,
    computeAverage,
  } = useReviewsApi();

  // Cache hook
  const {
    cacheReviews,
    getCachedReviews,
    hasCache,
    invalidateUserCache,
    broadcastMutation,
  } = useReviewCache({
    syncAcrossTabs,
    debugMode: enableLogging,
  });

  // Logging utility
  const log = useCallback(
    (message: string, data?: any) => {
      if (enableLogging) {
        console.log(`[Reviews Hook] ${message}`, data);
      }
    },
    [enableLogging]
  );

  // Generate cache key for reviews
  const generateCacheKey = useCallback(
    (targetUserId: string, filterOptions?: ReviewFilterOptions) => {
      if (filterOptions && Object.keys(filterOptions).length > 0) {
        return `reviews:${targetUserId}:${JSON.stringify(filterOptions)}`;
      }
      return `reviews:${targetUserId}`;
    },
    []
  );

  // Fetch reviews from API
  const fetchReviews = useCallback(
    async (targetUserId?: string, filterOptions?: ReviewFilterOptions) => {
      if (!targetUserId) {
        log("No user ID provided for fetching reviews");
        return [];
      }

      const finalUserId = targetUserId;
      const cacheKey = generateCacheKey(finalUserId, filterOptions);

      // Set loading state
      setLoadingState((prev) => ({ ...prev, isFetching: true }));
      setErrorState((prev) => ({ ...prev, fetchError: undefined }));

      try {
        // Check cache first if enabled
        if (enableCaching && hasCache(cacheKey)) {
          const cachedData = getCachedReviews<Review[]>(cacheKey);
          if (cachedData) {
            log(`Retrieved ${cachedData.length} reviews from cache`, {
              cacheKey,
            });
            return cachedData;
          }
        }

        // Fetch from API
        log(`Fetching reviews for user ${finalUserId}`);
        const data = await fetchUserReviews(finalUserId);
        log(`Fetched ${data.length} reviews`);

        // Cache the results if enabled
        if (enableCaching) {
          cacheReviews(cacheKey, data);
        }

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch reviews";
        log(`Error fetching reviews: ${errorMessage}`, err);
        setErrorState((prev) => ({
          ...prev,
          fetchError: normalizeErrorMessage(errorMessage),
        }));
        return [];
      } finally {
        setLoadingState((prev) => ({ ...prev, isFetching: false }));
      }
    },
    [
      fetchUserReviews,
      enableCaching,
      hasCache,
      getCachedReviews,
      cacheReviews,
      generateCacheKey,
      log,
    ]
  );

  // Load reviews
  const loadReviews = useCallback(async () => {
    if (!userId) return;

    setLoadingState((prev) => ({ ...prev, isLoading: true }));
    log("Loading reviews", { userId, filters: debouncedFilters });

    try {
      const reviewsData = await fetchReviews(userId, debouncedFilters);
      setReviews(reviewsData);

      // Update pagination
      setPagination((prev) => ({
        ...prev,
        totalItems: reviewsData.length,
        totalPages: Math.ceil(reviewsData.length / prev.pageSize),
      }));

      log(`Loaded ${reviewsData.length} reviews`);
    } catch (err) {
      log("Error loading reviews", err);
    } finally {
      setLoadingState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [userId, debouncedFilters, fetchReviews, log]);

  // This effect will be replaced with a new one after useReviewFilters

  // Load reviews when userId or filters change
  useEffect(() => {
    if (userId) {
      loadReviews();
    }
  }, [userId, debouncedFilters, loadReviews]);

  // Initialize pagination when reviews change
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      totalItems: reviews.length,
      totalPages: Math.ceil(reviews.length / prev.pageSize),
      page: Math.min(prev.page, Math.ceil(reviews.length / prev.pageSize) || 1),
    }));
  }, [reviews]);

  // Review filtering system
  const {
    filters,
    setFilters,
    setFilter,
    setRatingFilter,
    setDateRangeFilter,
    setProjectTypeFilter,
    setSearchQuery,
    setSortOptions,
    resetFilters,
    filteredReviews,
    searchResults,
    availableProjectTypes,
    hasActiveFilters,
    activeFiltersSummary,
  } = useReviewFilters({
    initialFilters: debouncedFilters,
    reviews,
    enableSearchScoring: true,
  });

  // Handle filter changes with debounce - update debouncedFilters when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (haveFiltersChanged(debouncedFilters, filters)) {
        setDebouncedFilters(filters);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, debouncedFilters]);

  // Update main filters and refresh
  const applyFilters = useCallback(
    (newFilters: ReviewFilterOptions) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  // Paginated reviews
  const paginatedReviews = useMemo(() => {
    const startIdx = (pagination.page - 1) * pagination.pageSize;
    const endIdx = startIdx + pagination.pageSize;
    return filteredReviews.slice(startIdx, endIdx);
  }, [filteredReviews, pagination.page, pagination.pageSize]);

  // Set page
  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({
      ...prev,
      page: Math.max(1, Math.min(page, prev.totalPages || 1)),
    }));
  }, []);

  // Set page size
  const setPageSize = useCallback((size: number) => {
    setPagination((prev) => {
      const newTotalPages = Math.ceil((prev.totalItems || 0) / size);
      return {
        ...prev,
        pageSize: size,
        totalPages: newTotalPages,
        page: Math.min(prev.page, newTotalPages || 1),
      };
    });
  }, []);

  // Get pagination data
  const paginationData = useMemo(() => {
    return generatePaginationData(
      filteredReviews.length,
      pagination.pageSize,
      pagination.page
    );
  }, [filteredReviews.length, pagination.pageSize, pagination.page]);

  // Create a new review
  const createNewReview = useCallback(
    async (input: CreateReviewDTO): Promise<Review> => {
      // Validate input
      const validationError = validateReviewInput(input);
      if (validationError) {
        log("Validation error", validationError);
        setErrorState((prev) => ({ ...prev, createError: validationError }));
        throw new Error(validationError);
      }

      setLoadingState((prev) => ({ ...prev, isCreating: true }));
      setErrorState((prev) => ({ ...prev, createError: undefined }));

      try {
        log("Creating review", input);
        const review = await createReview(input);
        log("Review created", review);

        // Handle cache updates and state changes
        if (enableCaching) {
          // If the review is for the current viewed user, update their cache
          if (input.to_id === userId) {
            log("Updating current user's cache and state");

            // Update local state only for the current user
            setReviews((prev) => {
              const updated = [review, ...prev];

              // Update cache for the current user
              const cacheKey = generateCacheKey(userId);
              cacheReviews(cacheKey, updated);

              return updated;
            });
          } else {
            // For other users, just invalidate their cache without updating local state
            log("Invalidating target user's cache", input.to_id);
            invalidateUserCache(input.to_id);
          }
        } else if (input.to_id === userId) {
          // If caching is disabled but the review is for the current user, still update local state
          setReviews((prev) => [review, ...prev]);
        }

        // Broadcast mutation to other tabs if enabled
        broadcastMutation({
          type: "create",
          payload: review,
          timestamp: Date.now(),
        });

        return review;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create review";
        log("Error creating review", errorMessage);
        setErrorState((prev) => ({
          ...prev,
          createError: normalizeErrorMessage(errorMessage),
        }));
        throw err;
      } finally {
        setLoadingState((prev) => ({ ...prev, isCreating: false }));
      }
    },
    [
      createReview,
      userId,
      enableCaching,
      generateCacheKey,
      cacheReviews,
      invalidateUserCache,
      broadcastMutation,
      log,
    ]
  );

  // Update an existing review
  const updateReview = useCallback(
    async (input: UpdateReviewDTO): Promise<Review> => {
      if (!input.id) {
        const errorMsg = "Review ID is required for updates";
        setErrorState((prev) => ({ ...prev, updateError: errorMsg }));
        throw new Error(errorMsg);
      }

      setLoadingState((prev) => ({ ...prev, isUpdating: true }));
      setErrorState((prev) => ({ ...prev, updateError: undefined }));

      try {
        log("Updating review", input);

        // Optimistically update the UI while the API request is in progress
        let optimisticUpdatedReview: Review | undefined;
        let originalReviews: Review[] = [];

        setReviews((prev) => {
          originalReviews = [...prev];
          const updated = prev.map((review) => {
            if (review.id === input.id) {
              optimisticUpdatedReview = {
                ...review,
                ...(input.rating !== undefined && { rating: input.rating }),
                ...(input.comment !== undefined && { comment: input.comment }),
                ...(input.project_title !== undefined && {
                  project_title: input.project_title,
                }),
                ...(input.project_type !== undefined && {
                  project_type: input.project_type,
                }),
                ...(input.project_value !== undefined && {
                  project_value: input.project_value,
                }),
              };
              return optimisticUpdatedReview;
            }
            return review;
          });

          return updated;
        });

        if (!optimisticUpdatedReview) {
          throw new Error("Review not found");
        }

        try {
          // Call the API to persist the update
          const updatedReview = await updateReviewApi(input);

          // Update state with the authoritative API response
          setReviews((prev) => {
            const updated = prev.map((review) => {
              if (review.id === updatedReview.id) {
                return updatedReview;
              }
              return review;
            });

            // Update cache with the authoritative API data
            if (enableCaching && userId) {
              const cacheKey = generateCacheKey(userId);
              cacheReviews(cacheKey, updated);

              if (updatedReview.to_id !== userId) {
                // Also invalidate cache for the reviewee
                invalidateUserCache(updatedReview.to_id);
              }
            }

            return updated;
          });

          // Broadcast mutation with the authoritative API data
          broadcastMutation({
            type: "update",
            payload: updatedReview,
            timestamp: Date.now(),
          });

          log("Review updated", updatedReview);
          return updatedReview;
        } catch (error) {
          // Rollback the optimistic update on error
          setReviews(originalReviews);
          log("Update failed, rolling back", error);
          throw error;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update review";
        log("Error updating review", errorMessage);
        setErrorState((prev) => ({
          ...prev,
          updateError: normalizeErrorMessage(errorMessage),
        }));
        throw err;
      } finally {
        setLoadingState((prev) => ({ ...prev, isUpdating: false }));
      }
    },
    [
      userId,
      enableCaching,
      generateCacheKey,
      cacheReviews,
      invalidateUserCache,
      broadcastMutation,
      log,
    ]
  );

  // Delete a review
  const deleteReview = useCallback(
    async (reviewId: string): Promise<void> => {
      if (!reviewId) {
        const errorMsg = "Review ID is required for deletion";
        setErrorState((prev) => ({ ...prev, deleteError: errorMsg }));
        throw new Error(errorMsg);
      }

      setLoadingState((prev) => ({ ...prev, isDeleting: true }));
      setErrorState((prev) => ({ ...prev, deleteError: undefined }));

      try {
        log("Deleting review", { reviewId });

        // Find the review to be deleted (for cache invalidation)
        const reviewToDelete = reviews.find((r) => r.id === reviewId);
        if (!reviewToDelete) {
          throw new Error("Review not found");
        }

        // Store original reviews for rollback in case of API failure
        const originalReviews = [...reviews];

        // Optimistic UI update
        setReviews((prev) => prev.filter((review) => review.id !== reviewId));

        try {
          // Call API to delete the review
          await deleteReviewApi(reviewId);

          // After successful API call, update cache
          if (enableCaching && userId) {
            const updatedReviews = reviews.filter(
              (review) => review.id !== reviewId
            );
            const cacheKey = generateCacheKey(userId);
            cacheReviews(cacheKey, updatedReviews);

            if (reviewToDelete.to_id !== userId) {
              // Also invalidate cache for the reviewee
              invalidateUserCache(reviewToDelete.to_id);
            }
          }

          // Broadcast mutation after successful API call
          broadcastMutation({
            type: "delete",
            payload: reviewToDelete,
            timestamp: Date.now(),
          });

          log("Review deleted", { reviewId });
        } catch (err) {
          // Rollback optimistic update on API failure
          log("Delete API failed, rolling back", err);
          setReviews(originalReviews);
          throw err;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete review";
        log("Error deleting review", errorMessage);
        setErrorState((prev) => ({
          ...prev,
          deleteError: normalizeErrorMessage(errorMessage),
        }));
        throw err;
      } finally {
        setLoadingState((prev) => ({ ...prev, isDeleting: false }));
      }
    },
    [
      reviews,
      userId,
      enableCaching,
      generateCacheKey,
      cacheReviews,
      invalidateUserCache,
      broadcastMutation,
      log,
    ]
  );

  // Get a review by ID
  const getReviewById = useCallback(
    (reviewId: string): Review | undefined => {
      return reviews.find((review) => review.id === reviewId);
    },
    [reviews]
  );

  // Export reviews in different formats
  const exportReviews = useCallback(
    (format: ExportFormat = "csv", includeFilters = true): string => {
      const dataToExport = includeFilters ? filteredReviews : reviews;

      switch (format) {
        case "json":
          return exportToJSON(dataToExport);
        case "csv":
          return exportToCSV(dataToExport);
        default:
          return exportToCSV(dataToExport);
      }
    },
    [reviews, filteredReviews]
  );

  // Download exported reviews
  const downloadReviews = useCallback(
    (format: ExportFormat = "csv", filename?: string) => {
      const dataToExport = exportReviews(format, true);

      // Create file download
      const element = document.createElement("a");
      let mimeType: string;
      let extension: string;

      switch (format) {
        case "json":
          mimeType = "application/json";
          extension = "json";
          break;
        case "pdf":
          mimeType = "application/pdf";
          extension = "pdf";
          break;
        case "csv":
        default:
          mimeType = "text/csv";
          extension = "csv";
      }

      const finalFilename =
        filename ||
        `reviews-export-${new Date().toISOString().split("T")[0]}.${extension}`;

      const blob = new Blob([dataToExport], { type: mimeType });
      const url = URL.createObjectURL(blob);

      element.href = url;
      element.download = finalFilename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      log("Reviews downloaded", { format, filename: finalFilename });
    },
    [exportReviews, log]
  );

  // Review statistics
  const reviewStats = useReviewStats({
    reviews: filteredReviews,
    includeProjectValues: true,
    includeTrends: true,
  });

  // Manual refresh
  const refreshReviews = useCallback(() => {
    if (userId) {
      // Clear cache for this user
      if (enableCaching) {
        invalidateUserCache(userId);
      }

      // Reload reviews
      loadReviews();
    }
  }, [userId, enableCaching, invalidateUserCache, loadReviews]);

  // Return review management functions
  return {
    // Review data
    reviews,
    filteredReviews,
    paginatedReviews,
    searchResults,

    // CRUD operations
    createReview: createNewReview,
    updateReview,
    deleteReview,
    getReviewById,
    refreshReviews,

    // Filter system
    filters,
    setFilters,
    setFilter,
    setRatingFilter,
    setDateRangeFilter,
    setProjectTypeFilter,
    setSearchQuery,
    setSortOptions,
    resetFilters,
    applyFilters,
    availableProjectTypes,
    hasActiveFilters,
    activeFiltersSummary,

    // Pagination
    pagination: paginationData,
    setPage,
    setPageSize,

    // Loading and error states
    isLoading: loadingState.isLoading,
    isCreating: loadingState.isCreating,
    isUpdating: loadingState.isUpdating,
    isDeleting: loadingState.isDeleting,
    isFetching: loadingState.isFetching,

    errors: errorState,

    // Statistics
    averageRating: reviewStats.averageRating,
    totalReviews: reviewStats.totalReviews,
    fiveStarReviews: reviewStats.fiveStarReviews,
    fiveStarPercentage: reviewStats.fiveStarPercentage,
    ratingDistribution: reviewStats.ratingDistribution,
    reviewStats,
    computeAverage,

    // Export capabilities
    exportReviews,
    downloadReviews,
  };
}
