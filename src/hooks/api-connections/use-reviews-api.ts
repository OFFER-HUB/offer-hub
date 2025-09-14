'use client';

import { useCallback, useState } from 'react';
import {
  Review,
  CreateReviewDTO,
  ReviewsFetchResponse,
  ReviewCreateResponse,
  ReviewErrorResponse,
} from '@/types/review.types';

type UseReviewsApiReturn = {
  fetchUserReviews: (userId: string) => Promise<Review[]>;
  createReview: (input: CreateReviewDTO) => Promise<Review>;
  useUserReviews: (userId: string) => { data: Review[] | undefined; isLoading: boolean; error?: string };
  useCreateReview: () => { mutate: (input: CreateReviewDTO) => Promise<Review>; isLoading: boolean; error?: string };
  computeAverage: (reviews: Review[]) => number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Helper function to normalize backend error messages to user-friendly text
const normalizeErrorMessage = (message: string): string => {
  const errorMap: Record<string, string> = {
    Missing_required_fields: 'All required fields must be filled out',
    Rating_must_be_a_number: 'Rating must be a valid number between 1 and 5',
    User_ID_is_required: 'User ID is required',
    Invalid_user_ID_format: 'Invalid user ID format',
    'Contract not found': 'Contract not found',
    'Contract not completed': 'Reviews can only be submitted for completed contracts',
    'Not authorized': 'You are not authorized to review this contract',
    'Duplicate review': 'You have already reviewed this contract',
  };

  return errorMap[message] || message || 'An error occurred';
};

// Helper function to validate review input
const validateReviewInput = (input: CreateReviewDTO): string | null => {
  if (!input.from_id || !uuidRegex.test(input.from_id)) {
    return 'Invalid reviewer ID';
  }
  if (!input.to_id || !uuidRegex.test(input.to_id)) {
    return 'Invalid reviewee ID';
  }
  if (!input.contract_id || !uuidRegex.test(input.contract_id)) {
    return 'Invalid contract ID';
  }
  if (!input.rating || input.rating < 1 || input.rating > 5 || !Number.isInteger(input.rating)) {
    return 'Rating must be a whole number between 1 and 5';
  }
  return null;
};

export function useReviewsApi(): UseReviewsApiReturn {
  const [userReviewsCache, setUserReviewsCache] = useState<Record<string, { data: Review[]; timestamp: number }>>({});
  
  const fetchUserReviews = useCallback(async (userId: string): Promise<Review[]> => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!uuidRegex.test(userId)) {
      throw new Error('Invalid user ID format');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}/reviews`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data: ReviewsFetchResponse | ReviewErrorResponse = await response.json().catch(() => ({
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));

      if (!response.ok || !data.success) {
        const message = data.success === false ? data.message : `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(normalizeErrorMessage(message));
      }

      if (data.success && 'data' in data) {
        // Cache the results for 5 minutes
        setUserReviewsCache(prev => ({
          ...prev,
          [userId]: { data: data.data, timestamp: Date.now() }
        }));
        return data.data;
      }

      return [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch reviews';
      throw new Error(normalizeErrorMessage(message));
    }
  }, []);

  const createReview = useCallback(async (input: CreateReviewDTO): Promise<Review> => {
    // Client-side validation
    const validationError = validateReviewInput(input);
    if (validationError) {
      throw new Error(validationError);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data: ReviewCreateResponse | ReviewErrorResponse = await response.json().catch(() => ({
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));

      if (!response.ok || !data.success) {
        const message = data.success === false ? data.message : `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(normalizeErrorMessage(message));
      }

      if (data.success && 'data' in data) {
        // Invalidate cache for the reviewee to ensure fresh data on next fetch
        setUserReviewsCache(prev => {
          const updated = { ...prev };
          delete updated[input.to_id];
          return updated;
        });
        return data.data;
      }

      throw new Error('Unexpected response format');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create review';
      throw new Error(normalizeErrorMessage(message));
    }
  }, []);

  const useUserReviews = (userId: string) => {
    const [data, setData] = useState<Review[] | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

  
    const cached = userReviewsCache[userId];
    const isCacheValid = cached && (Date.now() - cached.timestamp) < 5 * 60 * 1000; // 5 minutes

    const fetchData = useCallback(async () => {
      if (isCacheValid) {
        setData(cached.data);
        return;
      }

      setIsLoading(true);
      setError(undefined);
      
      try {
        const reviews = await fetchUserReviews(userId);
        setData(reviews);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
        setData([]);
      } finally {
        setIsLoading(false);
      }
    }, [userId, isCacheValid, cached]);

  
    if (!isCacheValid && !isLoading && data === undefined) {
      fetchData();
    }

    return { data, isLoading, error };
  };

  const useCreateReview = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const mutate = useCallback(async (input: CreateReviewDTO): Promise<Review> => {
      setIsLoading(true);
      setError(undefined);
      
      try {
        const review = await createReview(input);
        return review;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create review';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    }, []);

    return { mutate, isLoading, error };
  };

  const computeAverage = useCallback((reviews: Review[]): number => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal place
  }, []);

  return {
    fetchUserReviews,
    createReview,
    useUserReviews,
    useCreateReview,
    computeAverage,
  };
}