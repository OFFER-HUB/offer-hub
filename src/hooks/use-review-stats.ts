'use client';

import { useMemo } from 'react';
import { Review, ReviewStatistics } from '@/types/reviews.types';
import { calculateReviewStatistics } from '@/utils/review-helpers';

/**
 * Configuration options for the useReviewStats hook
 */
interface UseReviewStatsOptions {
  /** Array of reviews to analyze */
  reviews: Review[];

  /** Whether to include project value statistics */
  includeProjectValues?: boolean;

  /** Whether to include time-based trend analysis */
  includeTrends?: boolean;
}

interface UseReviewStatsReturn {
  statistics: ReviewStatistics;
  ratingTrends: Array<{ month: string; avgRating: number; reviewCount: number }> | null;
  projectValueStats: {
    totalValue: number;
    averageValue: number;
    minValue: number;
    maxValue: number;
    valueByRating?: Record<number, number>;
  } | null;
  insights: string[];
  
  // Common derived values for convenience
  averageRating: number;
  totalReviews: number;
  fiveStarReviews: number;
  fiveStarPercentage: number;
  ratingDistribution: Record<number, number>;
  totalProjectValue: number;
  
  // Helper for calculating time period statistics
  getStatsForPeriod: (startDate: Date, endDate: Date) => ReviewStatistics;
}

/**
 * Review Statistics and Analytics Hook
 *
 * This hook analyzes review data to generate comprehensive statistics,
 * trends, and insights that help understand review performance.
 *
 * Features:
 * - Overall rating analysis and distribution
 * - Time-series trend analysis with monthly breakdowns
 * - Project type performance comparison
 * - Automated insights generation
 * - Financial metrics for project values
 */
export function useReviewStats({
  reviews,
  includeProjectValues = true,
  includeTrends = true,
}: UseReviewStatsOptions): UseReviewStatsReturn {
  // Calculate basic statistics
  const statistics = useMemo<ReviewStatistics>(() => {
    return calculateReviewStatistics(reviews);
  }, [reviews]);

  // Calculate rating trends over time
  const ratingTrends = useMemo(() => {
    if (!reviews || !includeTrends) return null;

    const reviewsByMonth: Record<string, { sum: number; count: number }> = {};

    // Group reviews by month and calculate average rating
    reviews.forEach((review) => {
      const date = new Date(review.created_at);
      const monthYear = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`;

      if (!reviewsByMonth[monthYear]) {
        reviewsByMonth[monthYear] = { sum: 0, count: 0 };
      }

      reviewsByMonth[monthYear].sum += review.rating;
      reviewsByMonth[monthYear].count += 1;
    });

    // Convert to array and sort by date
    const trendData = Object.entries(reviewsByMonth)
      .map(([monthYear, data]) => ({
        month: monthYear,
        avgRating: Number((data.sum / data.count).toFixed(1)),
        reviewCount: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return trendData;
  }, [reviews, includeTrends]);

  // Calculate project value statistics if requested
  const projectValueStats = useMemo(() => {
    if (!reviews || !includeProjectValues) return null;

    const reviewsWithValue = reviews.filter(
      (r) => r.project_value && r.project_value > 0
    );

    if (reviewsWithValue.length === 0) {
      return {
        totalValue: 0,
        averageValue: 0,
        minValue: 0,
        maxValue: 0,
      };
    }

    const values = reviewsWithValue.map((r) => r.project_value!);
    const totalValue = values.reduce((sum, val) => sum + val, 0);
    const averageValue = totalValue / values.length;
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const valueByRating: Record<number, { total: number; count: number }> = {};

    reviewsWithValue.forEach((review) => {
      if (!valueByRating[review.rating]) {
        valueByRating[review.rating] = { total: 0, count: 0 };
      }

      valueByRating[review.rating].total += review.project_value!;
      valueByRating[review.rating].count += 1;
    });

    const avgValueByRating: Record<number, number> = {};

    Object.entries(valueByRating).forEach(([rating, { total, count }]) => {
      avgValueByRating[Number(rating)] = Number((total / count).toFixed(2));
    });

    return {
      totalValue,
      averageValue,
      minValue,
      maxValue,
      valueByRating: avgValueByRating,
    };
  }, [reviews, includeProjectValues]);

  // Generate key insights
  const insights = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return ['No reviews available for analysis.'];
    }

    const result: string[] = [];

    // Overall rating insight
    if (statistics.averageRating >= 4.5) {
      result.push('Excellent overall rating - consistently high reviews.');
    } else if (statistics.averageRating >= 4) {
      result.push('Very good overall rating - strong performance.');
    } else if (statistics.averageRating >= 3.5) {
      result.push(
        'Good overall rating - positive reviews with room for improvement.'
      );
    } else if (statistics.averageRating >= 3) {
      result.push(
        'Average overall rating - consider addressing areas for improvement.'
      );
    } else {
      result.push(
        'Below average rating - focused improvement efforts recommended.'
      );
    }

    // Distribution insights
    const fiveStarPercentage =
      ((statistics.ratingDistribution[5] || 0) / statistics.totalReviews) * 100;
    if (fiveStarPercentage >= 70) {
      result.push(
        `Exceptional customer satisfaction - ${Math.round(
          fiveStarPercentage
        )}% of reviews are 5-star.`
      );
    } else if (fiveStarPercentage >= 50) {
      result.push(
        `Strong customer satisfaction - ${Math.round(
          fiveStarPercentage
        )}% of reviews are 5-star.`
      );
    }

    const lowRatingCount =
      (statistics.ratingDistribution[1] || 0) +
      (statistics.ratingDistribution[2] || 0);
    if (lowRatingCount > 0) {
      const lowRatingPercentage =
        (lowRatingCount / statistics.totalReviews) * 100;
      if (lowRatingPercentage > 20) {
        result.push(
          `Attention needed: ${Math.round(
            lowRatingPercentage
          )}% of reviews are 2-star or below.`
        );
      }
    }

    // Project type insights
    if (Object.keys(statistics.reviewsByProjectType).length > 0) {
      // Find best and worst performing project types
      let bestType = '';
      let bestRating = 0;
      let worstType = '';
      let worstRating = 5;

      Object.entries(statistics.reviewsByProjectType).forEach(
        ([type, data]) => {
          if (data.count >= 3) {
            // Only consider types with enough reviews
            if (data.averageRating > bestRating) {
              bestRating = data.averageRating;
              bestType = type;
            }
            if (data.averageRating < worstRating) {
              worstRating = data.averageRating;
              worstType = type;
            }
          }
        }
      );

      if (bestType && worstType && bestType !== worstType) {
        result.push(
          `Best performance in "${bestType}" projects (${bestRating} avg).`
        );
        if (worstRating < 3.5) {
          result.push(
            `Improvement opportunity in "${worstType}" projects (${worstRating} avg).`
          );
        }
      }
    }

    // Trend insights
    if (ratingTrends && ratingTrends.length > 1) {
      const lastThreeMonths = ratingTrends.slice(-3);
      const olderMonths = ratingTrends.slice(0, -3);

      if (lastThreeMonths.length > 0 && olderMonths.length > 0) {
        const recentAvg =
          lastThreeMonths.reduce((sum, m) => sum + m.avgRating, 0) /
          lastThreeMonths.length;
        const olderAvg =
          olderMonths.reduce((sum, m) => sum + m.avgRating, 0) /
          olderMonths.length;

        const diff = recentAvg - olderAvg;
        if (diff >= 0.3) {
          result.push(
            `Positive trend: Ratings have improved by ${diff.toFixed(
              1
            )} stars in recent months.`
          );
        } else if (diff <= -0.3) {
          result.push(
            `Declining trend: Ratings have dropped by ${Math.abs(diff).toFixed(
              1
            )} stars in recent months.`
          );
        }
      }
    }

    return result;
  }, [reviews, statistics, ratingTrends]);

  return {
    statistics,
    ratingTrends,
    projectValueStats,
    insights,

    // Common derived values for convenience
    averageRating: statistics.averageRating,
    totalReviews: statistics.totalReviews,
    fiveStarReviews: statistics.fiveStarReviews,
    fiveStarPercentage: statistics.totalReviews
      ? (statistics.fiveStarReviews / statistics.totalReviews) * 100
      : 0,
    ratingDistribution: statistics.ratingDistribution,
    totalProjectValue: statistics.totalProjectValue,

    // Helper for calculating time period statistics
    getStatsForPeriod: (startDate: Date, endDate: Date) => {
      const filteredReviews = reviews.filter((review) => {
        const reviewDate = new Date(review.created_at);
        return reviewDate >= startDate && reviewDate <= endDate;
      });

      return calculateReviewStatistics(filteredReviews);
    },
  };
}
