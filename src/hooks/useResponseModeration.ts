import { useState, useEffect, useCallback } from 'react';
import { 
  ReviewResponseWithDetails, 
  ResponseStatus,
  UseResponseModerationReturn,
  ReviewResponseAPIResponse,
  ResponseAnalyticsFilters
} from '@/types/review-responses.types';

// API base URL - adjust based on your environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

// Helper function to make API requests
const apiRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const useResponseModeration = (): UseResponseModerationReturn => {
  const [pendingResponses, setPendingResponses] = useState<ReviewResponseWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch pending responses for moderation
  const fetchPendingResponses = useCallback(async (limit: number = 50, offset: number = 0) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiRequest<ReviewResponseAPIResponse>(`/api/admin/responses/pending?limit=${limit}&offset=${offset}`);
      if (data.success && 'data' in data) {
        setPendingResponses((data as any).data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending responses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Moderate a response (approve, reject, or flag)
  const moderateResponse = useCallback(async (responseId: string, status: ResponseStatus, notes?: string) => {
    setError(null);
    
    try {
      const response = await apiRequest<ReviewResponseAPIResponse>(`/api/admin/responses/${responseId}/moderate`, {
        method: 'PUT',
        body: JSON.stringify({
          status,
          moderation_notes: notes,
        }),
      });
      
      if (response.success && 'data' in response) {
        // Update the response in local state
        setPendingResponses(prev => prev.map(r => 
          r.id === responseId 
            ? { ...r, ...response.data, updated_at: new Date().toISOString() }
            : r
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to moderate response');
      throw err;
    }
  }, []);

  // Refetch pending responses
  const refetch = useCallback(async () => {
    await fetchPendingResponses();
  }, [fetchPendingResponses]);

  // Load pending responses on mount
  useEffect(() => {
    fetchPendingResponses();
  }, [fetchPendingResponses]);

  return {
    pendingResponses,
    isLoading,
    error,
    moderateResponse,
    refetch,
  };
};

// Hook for response analytics
export const useResponseAnalytics = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (filters: ResponseAnalyticsFilters = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.date_from) queryParams.append('date_from', filters.date_from);
      if (filters.date_to) queryParams.append('date_to', filters.date_to);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.responder_id) queryParams.append('responder_id', filters.responder_id);
      if (filters.review_id) queryParams.append('review_id', filters.review_id);
      if (filters.min_engagement_score !== undefined) {
        queryParams.append('min_engagement_score', filters.min_engagement_score.toString());
      }
      
      const queryString = queryParams.toString();
      const endpoint = `/api/admin/responses/analytics${queryString ? `?${queryString}` : ''}`;
      
      const data = await apiRequest<ReviewResponseAPIResponse>(endpoint);
      if (data.success && 'data' in data) {
        setAnalytics(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    analytics,
    isLoading,
    error,
    fetchAnalytics,
  };
};

// Hook for user-specific response management
export const useUserResponses = (userId: string) => {
  const [userResponses, setUserResponses] = useState<ReviewResponseWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    has_more: false,
    total: 0,
  });

  const fetchUserResponses = useCallback(async (limit: number = 20, offset: number = 0) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiRequest<ReviewResponseAPIResponse>(`/api/users/${userId}/responses?limit=${limit}&offset=${offset}`);
      if (data.success && 'data' in data) {
        setUserResponses((data as any).data.data);
        setPagination({
          limit: (data as any).data.pagination.limit,
          offset: (data as any).data.pagination.offset,
          has_more: (data as any).data.pagination.has_more,
          total: (data as any).data.count,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user responses');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const loadMore = useCallback(async () => {
    if (!pagination.has_more || isLoading) return;
    
    const newOffset = pagination.offset + pagination.limit;
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiRequest<ReviewResponseAPIResponse>(`/api/users/${userId}/responses?limit=${pagination.limit}&offset=${newOffset}`);
      if (data.success && 'data' in data) {
        setUserResponses(prev => [...prev, ...(data as any).data.data]);
        setPagination(prev => ({
          ...prev,
          offset: newOffset,
          has_more: (data as any).data.pagination.has_more,
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more responses');
    } finally {
      setIsLoading(false);
    }
  }, [userId, pagination, isLoading]);

  useEffect(() => {
    if (userId) {
      fetchUserResponses();
    }
  }, [userId, fetchUserResponses]);

  return {
    userResponses,
    isLoading,
    error,
    pagination,
    loadMore,
    refetch: () => fetchUserResponses(),
  };
};

// Hook for response quality assessment
export const useResponseQualityAssessment = () => {
  const assessQuality = useCallback((content: string) => {
    const factors = {
      length_score: calculateLengthScore(content),
      professionalism_score: calculateProfessionalismScore(content),
      relevance_score: calculateRelevanceScore(content),
      tone_score: calculateToneScore(content),
    };

    const overallScore = (factors.length_score + factors.professionalism_score + factors.relevance_score + factors.tone_score) / 4;
    
    const suggestions: string[] = [];
    if (factors.length_score < 70) suggestions.push('Consider adding more detail to your response');
    if (factors.professionalism_score < 70) suggestions.push('Use more professional language');
    if (factors.relevance_score < 70) suggestions.push('Address specific points from the review');
    if (factors.tone_score < 70) suggestions.push('Maintain a constructive and positive tone');

    return {
      score: overallScore,
      factors,
      suggestions,
      auto_approve: overallScore >= 80,
    };
  }, []);

  return { assessQuality };
};

// Helper functions for quality assessment
const calculateLengthScore = (content: string): number => {
  const length = content.length;
  if (length < 50) return 30;
  if (length < 100) return 60;
  if (length < 500) return 90;
  if (length < 1000) return 80;
  return 70; // Too long
};

const calculateProfessionalismScore = (content: string): number => {
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
};

const calculateRelevanceScore = (content: string): number => {
  const relevanceKeywords = ['project', 'work', 'experience', 'communication', 'quality', 'delivery'];
  const lowerContent = content.toLowerCase();
  
  const matches = relevanceKeywords.filter(keyword => lowerContent.includes(keyword)).length;
  return Math.min(100, matches * 20);
};

const calculateToneScore = (content: string): number => {
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
};
