"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  QualityAssuranceState,
  QualityAssessmentConfig,
  QualityMetrics,
  QualityAnalytics,
  QualityTrend,
  ModerationWorkflow,
  ModerationDecision,
  ModerationHistory,
  ComplianceReport,
  ContentModerationResult,
  UseQualityAssuranceOptions,
  QualityAssuranceHookReturn,
} from '@/types/review-quality.types';
import { Review } from '@/types/reviews.types';
import {
  assessReviewQuality,
  moderateContent,
  generateQualityAnalytics,
  calculateQualityTrends,
  generateQualityImprovementSuggestions,
  validateQualityAssessmentConfig,
} from '@/utils/quality-helpers';

const DEFAULT_CONFIG: QualityAssessmentConfig = {
  aiProvider: 'rule_based',
  thresholds: {
    autoApprove: 80,
    autoReject: 30,
    flagForReview: 60,
  },
  weights: {
    content: 25,
    relevance: 20,
    professionalism: 20,
    helpfulness: 20,
    accuracy: 15,
  },
  enabledFeatures: {
    aiAssessment: true,
    contentModeration: true,
    duplicateDetection: true,
    sentimentAnalysis: true,
    spamDetection: true,
  },
};

const DEFAULT_OPTIONS: UseQualityAssuranceOptions = {
  enableRealTime: true,
  autoRefresh: true,
  refreshInterval: 30000,
  includeMetrics: true,
  includeTrends: true,
  includeWorkflows: true,
};

const INITIAL_STATE: QualityAssuranceState = {
  config: DEFAULT_CONFIG,
  metrics: {
    overview: {
      totalReviews: 0,
      averageQualityScore: 0,
      approvalRate: 0,
      flagRate: 0,
      rejectionRate: 0,
      autoModerationRate: 0,
    },
    trends: [],
    topIssues: [],
    moderatorPerformance: [],
    contentInsights: {
      averageLength: 0,
      readabilityScore: 0,
      sentimentDistribution: {},
      commonKeywords: [],
    },
  },
  trends: [],
  activeWorkflows: [],
  pendingReviews: [],
  isProcessing: false,
  errors: [],
  lastUpdated: new Date().toISOString(),
};

export function useReviewQuality(
  options: Partial<UseQualityAssuranceOptions> = {}
): QualityAssuranceHookReturn {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };

  const [state, setState] = useState<QualityAssuranceState>(INITIAL_STATE);
  const [qualityMetricsCache, setQualityMetricsCache] = useState<QualityMetrics[]>([]);

  const [loading, setLoading] = useState({
    assessment: false,
    moderation: false,
    analytics: false,
    workflows: false,
    decisions: false,
  });

  const [errors, setErrors] = useState<{
    assessment?: string;
    moderation?: string;
    analytics?: string;
    workflows?: string;
    decisions?: string;
  }>({});

  const updateLoadingState = useCallback((key: keyof typeof loading, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateErrorState = useCallback((key: keyof typeof errors, value?: string) => {
    setErrors(prev => ({ ...prev, [key]: value }));
  }, []);

  const simulateApiCall = useCallback(async <T>(
    data: T,
    delay: number = 500,
    shouldFail: boolean = false
  ): Promise<T> => {
    await new Promise(resolve => setTimeout(resolve, delay));
    if (shouldFail) {
      throw new Error('Simulated API error');
    }
    return data;
  }, []);

  const assessReview = useCallback(async (reviewId: string): Promise<QualityMetrics> => {
    updateLoadingState('assessment', true);
    updateErrorState('assessment', undefined);

    try {
      const review: Review = {
        id: reviewId,
        from_id: 'user1',
        to_id: 'user2',
        contract_id: 'contract1',
        rating: 5,
        comment: 'Excellent work! The developer delivered high-quality code on time and communicated effectively throughout the project.',
        created_at: new Date().toISOString(),
      };

      const qualityScore = assessReviewQuality(review, state.config);
      const moderationResult = moderateContent(review.comment || '', state.config);

      let moderationStatus: QualityMetrics['moderationStatus'] = 'pending';

      if (moderationResult.suggestedAction === 'approve') {
        if (qualityScore.overall >= state.config.thresholds.autoApprove) {
          moderationStatus = 'auto-approved';
        } else {
          moderationStatus = 'approved';
        }
      } else if (moderationResult.suggestedAction === 'reject') {
        moderationStatus = 'auto-rejected';
      } else if (moderationResult.suggestedAction === 'flag') {
        moderationStatus = 'flagged';
      }

      const suggestions = generateQualityImprovementSuggestions(qualityScore, review.comment || '');

      const qualityMetric: QualityMetrics = {
        id: `qm_${Date.now()}`,
        reviewId,
        qualityScore,
        moderationStatus,
        flaggedIssues: moderationResult.flags.map(f => f.type),
        suggestions: suggestions.map(s => s.suggestion),
        aiConfidence: moderationResult.score,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await simulateApiCall(qualityMetric, 1000);

      setQualityMetricsCache(prev => {
        const updated = [...prev, result];
        return updated.slice(-100);
      });

      setState(prev => ({
        ...prev,
        lastUpdated: new Date().toISOString(),
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to assess review';
      updateErrorState('assessment', errorMessage);
      throw error;
    } finally {
      updateLoadingState('assessment', false);
    }
  }, [state.config, simulateApiCall, updateLoadingState, updateErrorState]);

  const moderateContentAction = useCallback(async (content: string): Promise<ContentModerationResult> => {
    updateLoadingState('moderation', true);
    updateErrorState('moderation', undefined);

    try {
      const result = moderateContent(content, state.config);
      return await simulateApiCall(result, 800);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to moderate content';
      updateErrorState('moderation', errorMessage);
      throw error;
    } finally {
      updateLoadingState('moderation', false);
    }
  }, [state.config, simulateApiCall, updateLoadingState, updateErrorState]);

  const updateConfig = useCallback(async (newConfig: Partial<QualityAssessmentConfig>): Promise<void> => {
    const mergedConfig = { ...state.config, ...newConfig };
    const validation = validateQualityAssessmentConfig(mergedConfig);

    if (!validation.isValid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    setState(prev => ({
      ...prev,
      config: mergedConfig,
      lastUpdated: new Date().toISOString(),
    }));

    await simulateApiCall(undefined, 300);
  }, [state.config, simulateApiCall]);

  const getAnalytics = useCallback(async (period?: string): Promise<QualityAnalytics> => {
    updateLoadingState('analytics', true);
    updateErrorState('analytics', undefined);

    try {
      const analytics = generateQualityAnalytics(qualityMetricsCache);
      const result = await simulateApiCall(analytics, 1500);

      setState(prev => ({
        ...prev,
        metrics: result,
        lastUpdated: new Date().toISOString(),
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get analytics';
      updateErrorState('analytics', errorMessage);
      throw error;
    } finally {
      updateLoadingState('analytics', false);
    }
  }, [qualityMetricsCache, simulateApiCall, updateLoadingState, updateErrorState]);

  const getTrends = useCallback(async (period: string): Promise<QualityTrend[]> => {
    updateLoadingState('analytics', true);
    updateErrorState('analytics', undefined);

    try {
      const trends = calculateQualityTrends(
        qualityMetricsCache,
        period as 'daily' | 'weekly' | 'monthly'
      );
      const result = await simulateApiCall(trends, 1000);

      setState(prev => ({
        ...prev,
        trends: result,
        lastUpdated: new Date().toISOString(),
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get trends';
      updateErrorState('analytics', errorMessage);
      throw error;
    } finally {
      updateLoadingState('analytics', false);
    }
  }, [qualityMetricsCache, simulateApiCall, updateLoadingState, updateErrorState]);

  const createWorkflow = useCallback(async (
    workflow: Omit<ModerationWorkflow, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ModerationWorkflow> => {
    updateLoadingState('workflows', true);
    updateErrorState('workflows', undefined);

    try {
      const newWorkflow: ModerationWorkflow = {
        ...workflow,
        id: `wf_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await simulateApiCall(newWorkflow, 800);

      setState(prev => ({
        ...prev,
        activeWorkflows: [...prev.activeWorkflows, result],
        lastUpdated: new Date().toISOString(),
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create workflow';
      updateErrorState('workflows', errorMessage);
      throw error;
    } finally {
      updateLoadingState('workflows', false);
    }
  }, [simulateApiCall, updateLoadingState, updateErrorState]);

  const updateWorkflow = useCallback(async (
    id: string,
    workflow: Partial<ModerationWorkflow>
  ): Promise<ModerationWorkflow> => {
    updateLoadingState('workflows', true);
    updateErrorState('workflows', undefined);

    try {
      const existingWorkflow = state.activeWorkflows.find(w => w.id === id);
      if (!existingWorkflow) {
        throw new Error('Workflow not found');
      }

      const updatedWorkflow: ModerationWorkflow = {
        ...existingWorkflow,
        ...workflow,
        updatedAt: new Date().toISOString(),
      };

      const result = await simulateApiCall(updatedWorkflow, 600);

      setState(prev => ({
        ...prev,
        activeWorkflows: prev.activeWorkflows.map(w => w.id === id ? result : w),
        lastUpdated: new Date().toISOString(),
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update workflow';
      updateErrorState('workflows', errorMessage);
      throw error;
    } finally {
      updateLoadingState('workflows', false);
    }
  }, [state.activeWorkflows, simulateApiCall, updateLoadingState, updateErrorState]);

  const deleteWorkflow = useCallback(async (id: string): Promise<void> => {
    updateLoadingState('workflows', true);
    updateErrorState('workflows', undefined);

    try {
      await simulateApiCall(undefined, 400);

      setState(prev => ({
        ...prev,
        activeWorkflows: prev.activeWorkflows.filter(w => w.id !== id),
        lastUpdated: new Date().toISOString(),
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete workflow';
      updateErrorState('workflows', errorMessage);
      throw error;
    } finally {
      updateLoadingState('workflows', false);
    }
  }, [simulateApiCall, updateLoadingState, updateErrorState]);

  const makeDecision = useCallback(async (
    reviewId: string,
    decision: Omit<ModerationDecision, 'id' | 'timestamp'>
  ): Promise<ModerationDecision> => {
    updateLoadingState('decisions', true);
    updateErrorState('decisions', undefined);

    try {
      const newDecision: ModerationDecision = {
        ...decision,
        id: `md_${Date.now()}`,
        timestamp: new Date().toISOString(),
      };

      const result = await simulateApiCall(newDecision, 700);

      setQualityMetricsCache(prev =>
        prev.map(metric =>
          metric.reviewId === reviewId
            ? { ...metric, moderationStatus: decision.newStatus, updatedAt: new Date().toISOString() }
            : metric
        )
      );

      setState(prev => ({
        ...prev,
        pendingReviews: prev.pendingReviews.filter(id => id !== reviewId),
        lastUpdated: new Date().toISOString(),
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to make decision';
      updateErrorState('decisions', errorMessage);
      throw error;
    } finally {
      updateLoadingState('decisions', false);
    }
  }, [simulateApiCall, updateLoadingState, updateErrorState]);

  const getHistory = useCallback(async (reviewId: string): Promise<ModerationHistory> => {
    const mockHistory: ModerationHistory = {
      id: `mh_${reviewId}`,
      reviewId,
      timeline: [
        {
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          action: 'Review submitted',
          actor: 'system',
          details: 'Review submitted for quality assessment',
        },
        {
          timestamp: new Date(Date.now() - 3000000).toISOString(),
          action: 'Quality assessment completed',
          actor: 'ai',
          details: 'Automated quality assessment completed with score 85',
        },
        {
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          action: 'Moderation review',
          actor: 'moderator',
          actorId: 'mod_123',
          details: 'Manual review flagged for minor language issue',
        },
        {
          timestamp: new Date().toISOString(),
          action: 'Approved',
          actor: 'moderator',
          actorId: 'mod_123',
          details: 'Review approved after minor edits',
        },
      ],
      currentStatus: 'approved',
      escalationCount: 0,
      totalProcessingTime: 3600,
    };

    return simulateApiCall(mockHistory, 500);
  }, [simulateApiCall]);

  const generateReport = useCallback(async (period: string): Promise<ComplianceReport> => {
    const mockReport: ComplianceReport = {
      id: `cr_${Date.now()}`,
      period,
      totalReviews: qualityMetricsCache.length,
      complianceRate: 95.5,
      violations: [
        { type: 'Language Policy', count: 5, resolved: 4, pending: 1 },
        { type: 'Content Quality', count: 12, resolved: 10, pending: 2 },
        { type: 'Spam Detection', count: 3, resolved: 3, pending: 0 },
      ],
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          action: 'Policy Update',
          details: 'Updated content moderation rules',
          compliance: true,
        },
      ],
      recommendations: [
        'Implement stricter language filtering',
        'Increase manual review for edge cases',
        'Update AI model training data',
      ],
      generatedAt: new Date().toISOString(),
    };

    return simulateApiCall(mockReport, 2000);
  }, [qualityMetricsCache.length, simulateApiCall]);

  const refreshData = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      if (finalOptions.includeMetrics) {
        await getAnalytics();
      }

      if (finalOptions.includeTrends) {
        await getTrends('weekly');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [finalOptions.includeMetrics, finalOptions.includeTrends, getAnalytics, getTrends]);

  useEffect(() => {
    if (finalOptions.autoRefresh && finalOptions.refreshInterval > 0) {
      const interval = setInterval(refreshData, finalOptions.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [finalOptions.autoRefresh, finalOptions.refreshInterval, refreshData]);

  useEffect(() => {
    if (qualityMetricsCache.length > 0) {
      const analytics = generateQualityAnalytics(qualityMetricsCache);
      const trends = calculateQualityTrends(qualityMetricsCache, 'weekly');

      setState(prev => ({
        ...prev,
        metrics: analytics,
        trends,
        lastUpdated: new Date().toISOString(),
      }));
    }
  }, [qualityMetricsCache]);

  const actions = useMemo(() => ({
    assessReview,
    moderateContent: moderateContentAction,
    updateConfig,
    getAnalytics,
    getTrends,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    makeDecision,
    getHistory,
    generateReport,
    refreshData,
  }), [
    assessReview,
    moderateContentAction,
    updateConfig,
    getAnalytics,
    getTrends,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    makeDecision,
    getHistory,
    generateReport,
    refreshData,
  ]);

  return {
    state,
    actions,
    loading,
    errors,
  };
}