// Review filters hook

"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Review,
  ReviewFilterOptions,
  ReviewSortField,
  SortDirection,
  ReviewSearchResult,
} from "@/types/reviews.types";
import {
  applyFilters,
  haveFiltersChanged,
  searchReviews,
  sortReviews,
} from "@/utils/review-helpers";

/**
 * Configuration options for useReviewFilters hook
 */
interface UseReviewFiltersOptions {
  /** Initial filter settings */
  initialFilters?: ReviewFilterOptions;

  /** Array of reviews to filter */
  reviews: Review[];

  /** Enable relevance scoring for search results */
  enableSearchScoring?: boolean;
}

interface UseReviewFiltersReturn {
  // Filter state
  filters: ReviewFilterOptions;
  setFilters: (filters: ReviewFilterOptions) => void;
  setFilter: <K extends keyof ReviewFilterOptions>(key: K, value: ReviewFilterOptions[K]) => void;

  // Specific filter setters
  setRatingFilter: (min?: number, max?: number) => void;
  setDateRangeFilter: (from?: Date, to?: Date) => void;
  setProjectTypeFilter: (types: string[]) => void;
  setSearchQuery: (query: string) => void;
  setSortOptions: (field: ReviewSortField, direction: SortDirection) => void;
  resetFilters: () => void;

  // Results
  filteredReviews: Review[];
  searchResults: ReviewSearchResult[];

  // Metadata
  availableProjectTypes: string[];
  hasActiveFilters: boolean;
  activeFiltersSummary: string[];
  totalResults: number;
}

/**
 * Review filtering hook
 *
 * Basic filtering for reviews:
 * - Rating range filtering
 * - Date range filtering
 * - Project type filtering
 * - Text search
 * - Customizable sorting with multiple fields
 * - Filter state management
 */
export function useReviewFilters({
  initialFilters = {},
  reviews = [],
  enableSearchScoring = false,
}: UseReviewFiltersOptions): UseReviewFiltersReturn {
  const [filters, setFilters] = useState<ReviewFilterOptions>(initialFilters);

  // Set a specific filter with type-safe values
  const setFilter = useCallback(
    <K extends keyof ReviewFilterOptions>(
      key: K,
      value: ReviewFilterOptions[K]
    ) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setFilters]
  );

  // Set rating filter
  const setRatingFilter = useCallback(
    (min?: number, max?: number) => {
      setFilters((prev) => ({
        ...prev,
        rating: { min, max },
      }));
    },
    [setFilters]
  );

  // Set date range filter
  const setDateRangeFilter = useCallback(
    (from?: Date, to?: Date) => {
      setFilters((prev) => ({
        ...prev,
        dateRange: { from, to },
      }));
    },
    [setFilters]
  );

  // Set project type filter
  const setProjectTypeFilter = useCallback(
    (types: string[]) => {
      setFilters((prev) => ({
        ...prev,
        projectTypes: types,
      }));
    },
    [setFilters]
  );

  // Set search query
  const setSearchQuery = useCallback(
    (query: string) => {
      setFilters((prev) => ({
        ...prev,
        search: query,
      }));
    },
    [setFilters]
  );

  // Set sort options
  const setSortOptions = useCallback(
    (field: ReviewSortField, direction: SortDirection) => {
      setFilters((prev) => ({
        ...prev,
        sortBy: field,
        sortDirection: direction,
      }));
    },
    [setFilters]
  );

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({});
  }, [setFilters]);

  // Apply filters to reviews
  const filteredReviews = useMemo(() => {
    if (!reviews?.length) return [];

    // Apply filters
    const filtered = applyFilters(reviews, filters);

    // If search is enabled with relevance scoring
    if (enableSearchScoring && filters.search) {
      // Search with relevance scoring
      const searchResults = searchReviews(filtered, filters.search);

      // Return just the review objects in score order
      return searchResults.map((result) => result.review);
    }

    // Apply sorting
    if (filters.sortBy) {
      return sortReviews(
        filtered,
        filters.sortBy,
        filters.sortDirection || "desc"
      );
    }

    // Default sort by date
    return sortReviews(filtered, "created_at", "desc");
  }, [reviews, filters, enableSearchScoring]);

  // Get search results with scores
  const searchResults = useMemo((): ReviewSearchResult[] => {
    if (!enableSearchScoring || !filters.search || !reviews?.length) {
      return reviews.map((review) => ({ review, relevanceScore: 0 }));
    }

    // Apply filters first (except search)
    const filtered = applyFilters(reviews, {
      ...filters,
      search: undefined, // Remove search to apply separately
    });

    // Apply search with scoring
    return searchReviews(filtered, filters.search);
  }, [reviews, filters, enableSearchScoring]);

  // Extract available project types from reviews
  const availableProjectTypes = useMemo(() => {
    if (!reviews?.length) return [];

    const typesSet = new Set<string>();

    reviews.forEach((review) => {
      if (review.project_type) {
        typesSet.add(review.project_type);
      }
    });

    return Array.from(typesSet).sort();
  }, [reviews]);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.rating?.min !== undefined ||
      filters.rating?.max !== undefined ||
      filters.dateRange?.from !== undefined ||
      filters.dateRange?.to !== undefined ||
      (filters.projectTypes && filters.projectTypes.length > 0) ||
      (filters.search && filters.search.trim() !== "")
    );
  }, [filters]);

  // Generate summary of active filters
  const activeFiltersSummary = useMemo(() => {
    const summary: string[] = [];

    if (
      filters.rating?.min !== undefined ||
      filters.rating?.max !== undefined
    ) {
      const min = filters.rating.min ?? 1;
      const max = filters.rating.max ?? 5;
      summary.push(`Rating: ${min} - ${max} stars`);
    }

    if (filters.dateRange?.from || filters.dateRange?.to) {
      const from = filters.dateRange.from
        ? filters.dateRange.from.toLocaleDateString()
        : "Any";
      const to = filters.dateRange.to
        ? filters.dateRange.to.toLocaleDateString()
        : "Now";
      summary.push(`Date: ${from} to ${to}`);
    }

    if (filters.projectTypes && filters.projectTypes.length > 0) {
      if (filters.projectTypes.length === 1) {
        summary.push(`Project: ${filters.projectTypes[0]}`);
      } else {
        summary.push(`Projects: ${filters.projectTypes.length} types`);
      }
    }

    if (filters.search && filters.search.trim() !== "") {
      summary.push(`Search: "${filters.search}"`);
    }

    if (filters.sortBy) {
      const direction =
        filters.sortDirection === "asc" ? "ascending" : "descending";
      const fieldMap: Record<ReviewSortField, string> = {
        rating: "Rating",
        created_at: "Date",
        project_title: "Project Name",
        project_value: "Project Value",
      };

      summary.push(`Sort: ${fieldMap[filters.sortBy]} (${direction})`);
    }

    return summary;
  }, [filters]);

  return {
    // Filter state
    filters,
    setFilters,
    setFilter,

    // Specific filter setters
    setRatingFilter,
    setDateRangeFilter,
    setProjectTypeFilter,
    setSearchQuery,
    setSortOptions,
    resetFilters,

    // Results
    filteredReviews,
    searchResults,

    // Metadata
    availableProjectTypes,
    hasActiveFilters,
    activeFiltersSummary,
    totalResults: filteredReviews.length,
  };
}
