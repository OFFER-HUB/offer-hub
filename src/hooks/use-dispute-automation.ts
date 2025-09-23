/**
 * @fileoverview Custom hook for automated dispute processing
 * @author Offer Hub Team
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  DisputeAutomationData,
  DisputeInitiationForm,
  DisputeStatus,
  EvidenceItem,
  CaseAssignmentResult,
  ResolutionRecommendation,
  DisputeAnalytics,
  DisputeFilter,
  PriorityCalculationResult,
  UseDisputeAutomationReturn,
  MediatorProfile
} from '@/types/dispute-automation.types';
import {
  createAutomatedDispute,
  categorizeDispute,
  assignBestMediator,
  generateResolutionRecommendation,
  submitEvidence,
  updateDisputeStatus,
  getDisputeAnalytics,
  searchDisputes,
  getAvailableMediators,
  escalateDispute,
  closeDispute,
  getDisputeById,
  uploadEvidenceFiles
} from '@/services/dispute-automation.service';
import { calculateDisputePriority } from '@/utils/dispute-priority-calculator';

interface UseDisputeAutomationOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTimeUpdates?: boolean;
}

export function useDisputeAutomation(
  initialFilter?: DisputeFilter,
  options: UseDisputeAutomationOptions = {}
): UseDisputeAutomationReturn {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableRealTimeUpdates = true
  } = options;

  // State management
  const [disputes, setDisputes] = useState<DisputeAutomationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<DisputeAnalytics | null>(null);
  const [mediators, setMediators] = useState<MediatorProfile[]>([]);

  // Load initial data
  useEffect(() => {
    loadDisputes();
    loadAnalytics();
    loadMediators();
  }, []);

  // Auto-refresh data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadDisputes();
      loadAnalytics();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  /**
   * Load disputes with optional filtering
   */
  const loadDisputes = useCallback(async (filter?: DisputeFilter) => {
    try {
      setIsLoading(true);
      const filterToUse = filter || initialFilter || {};
      const disputeData = await searchDisputes(filterToUse);
      setDisputes(disputeData);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load disputes';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [initialFilter]);

  /**
   * Load analytics data
   */
  const loadAnalytics = useCallback(async (period = 'monthly') => {
    try {
      const analyticsData = await getDisputeAnalytics(period);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  }, []);

  /**
   * Load available mediators
   */
  const loadMediators = useCallback(async () => {
    try {
      const mediatorData = await getAvailableMediators();
      setMediators(mediatorData);
    } catch (err) {
      console.error('Failed to load mediators:', err);
    }
  }, []);

  /**
   * Create new dispute with automation
   */
  const createDispute = useCallback(async (form: DisputeInitiationForm): Promise<DisputeAutomationData> => {
    try {
      setIsLoading(true);
      
      // Upload evidence files first
      let evidenceItems: EvidenceItem[] = [];
      if (form.evidence && form.evidence.length > 0) {
        evidenceItems = await uploadEvidenceFiles(form.evidence);
        toast.success(`Uploaded ${evidenceItems.length} evidence files`);
      }

      // Create the dispute
      const dispute = await createAutomatedDispute(form);
      
      // Add evidence to dispute
      for (const evidence of evidenceItems) {
        await submitEvidence(dispute.id, evidence);
      }

      // Update local state
      setDisputes(prev => [dispute, ...prev]);
      
      toast.success('Dispute created successfully');
      setError(null);
      
      return dispute;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create dispute';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Categorize dispute automatically
   */
  const categorizeDisputeAction = useCallback(async (disputeId: string): Promise<DisputeAutomationData> => {
    try {
      const dispute = disputes.find(d => d.id === disputeId);
      if (!dispute) {
        throw new Error('Dispute not found');
      }

      const categorization = await categorizeDispute(dispute.description, { projectId: dispute.projectId });
      
      // Update dispute with new category
      const updatedDispute = {
        ...dispute,
        category: categorization.category,
        updatedAt: new Date().toISOString(),
      };

      setDisputes(prev => prev.map(d => d.id === disputeId ? updatedDispute : d));
      
      toast.success(`Dispute categorized as: ${categorization.category}`);
      return updatedDispute;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to categorize dispute';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [disputes]);

  /**
   * Calculate priority score for dispute
   */
  const calculatePriorityAction = useCallback(async (disputeId: string): Promise<PriorityCalculationResult> => {
    try {
      const dispute = disputes.find(d => d.id === disputeId);
      if (!dispute) {
        throw new Error('Dispute not found');
      }

      // Mock data for priority calculation (in real app, this would come from APIs)
      const clientHistory = {
        totalProjects: 10,
        successfulProjects: 8,
        previousDisputes: 1,
        averageRating: 4.2,
        accountAge: 12,
        verificationLevel: 'verified' as const,
      };

      const freelancerHistory = {
        totalProjects: 15,
        successfulProjects: 13,
        previousDisputes: 0,
        averageRating: 4.5,
        accountAge: 18,
        verificationLevel: 'premium' as const,
      };

      const projectComplexity = {
        duration: 30,
        budget: dispute.amount,
        skillsRequired: ['JavaScript', 'React', 'Node.js'],
        teamSize: 1,
        projectType: 'moderate' as const,
      };

      const communicationData = {
        responseTime: 12,
        messageCount: 25,
        lastCommunication: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      };

      const result = calculateDisputePriority(
        dispute,
        clientHistory,
        freelancerHistory,
        projectComplexity,
        communicationData
      );

      // Update dispute with calculated priority
      const updatedDispute = {
        ...dispute,
        priority: result.priority,
        updatedAt: new Date().toISOString(),
      };

      setDisputes(prev => prev.map(d => d.id === disputeId ? updatedDispute : d));
      
      toast.success(`Priority calculated: ${result.priority} (${result.score})`);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate priority';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [disputes]);

  /**
   * Assign mediator to dispute
   */
  const assignMediatorAction = useCallback(async (
    disputeId: string, 
    mediatorId?: string
  ): Promise<CaseAssignmentResult> => {
    try {
      const dispute = disputes.find(d => d.id === disputeId);
      if (!dispute) {
        throw new Error('Dispute not found');
      }

      let assignment: CaseAssignmentResult;
      
      if (mediatorId) {
        // Manual assignment
        const mediator = mediators.find(m => m.id === mediatorId);
        if (!mediator) {
          throw new Error('Mediator not found');
        }
        
        assignment = {
          assignedMediatorId: mediatorId,
          assignmentScore: 100,
          reasoning: ['Manually assigned by admin'],
          estimatedResolutionTime: mediator.avgResolutionTime,
          alternativeMediators: [],
        };
      } else {
        // Automatic assignment
        assignment = await assignBestMediator(dispute, mediators);
      }

      // Update dispute with assigned mediator
      const updatedDispute = {
        ...dispute,
        assignedMediatorId: assignment.assignedMediatorId,
        status: 'assigned' as DisputeStatus,
        updatedAt: new Date().toISOString(),
      };

      setDisputes(prev => prev.map(d => d.id === disputeId ? updatedDispute : d));
      
      const mediator = mediators.find(m => m.id === assignment.assignedMediatorId);
      toast.success(`Assigned to mediator: ${mediator?.name || 'Unknown'}`);
      
      return assignment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign mediator';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [disputes, mediators]);

  /**
   * Submit evidence for dispute
   */
  const submitEvidenceAction = useCallback(async (disputeId: string, evidence: EvidenceItem): Promise<void> => {
    try {
      await submitEvidence(disputeId, evidence);
      
      // Update local state
      setDisputes(prev => prev.map(dispute => 
        dispute.id === disputeId 
          ? { ...dispute, evidence: [...dispute.evidence, evidence] }
          : dispute
      ));
      
      toast.success('Evidence submitted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit evidence';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Generate resolution recommendation
   */
  const generateRecommendationAction = useCallback(async (disputeId: string): Promise<ResolutionRecommendation> => {
    try {
      const dispute = disputes.find(d => d.id === disputeId);
      if (!dispute) {
        throw new Error('Dispute not found');
      }

      const recommendation = await generateResolutionRecommendation(dispute);
      
      // Update dispute with recommendation
      const updatedDispute = {
        ...dispute,
        resolutionRecommendation: recommendation,
        updatedAt: new Date().toISOString(),
      };

      setDisputes(prev => prev.map(d => d.id === disputeId ? updatedDispute : d));
      
      toast.success('Resolution recommendation generated');
      return recommendation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate recommendation';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [disputes]);

  /**
   * Update dispute status
   */
  const updateStatusAction = useCallback(async (disputeId: string, status: DisputeStatus): Promise<void> => {
    try {
      await updateDisputeStatus(disputeId, status);
      
      // Update local state
      setDisputes(prev => prev.map(dispute => 
        dispute.id === disputeId 
          ? { ...dispute, status, updatedAt: new Date().toISOString() }
          : dispute
      ));
      
      toast.success(`Dispute status updated to: ${status}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Escalate dispute
   */
  const escalateDisputeAction = useCallback(async (disputeId: string, reason: string): Promise<void> => {
    try {
      await escalateDispute(disputeId, reason);
      
      // Update local state
      setDisputes(prev => prev.map(dispute => 
        dispute.id === disputeId 
          ? { 
              ...dispute, 
              status: 'escalated' as DisputeStatus,
              priority: dispute.priority === 'critical' ? 'critical' : 'high',
              updatedAt: new Date().toISOString()
            }
          : dispute
      ));
      
      toast.success('Dispute escalated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to escalate dispute';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Close dispute
   */
  const closeDisputeAction = useCallback(async (disputeId: string, resolution: string): Promise<void> => {
    try {
      await closeDispute(disputeId, resolution);
      
      // Update local state
      setDisputes(prev => prev.map(dispute => 
        dispute.id === disputeId 
          ? { ...dispute, status: 'closed' as DisputeStatus, updatedAt: new Date().toISOString() }
          : dispute
      ));
      
      toast.success('Dispute closed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to close dispute';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Get analytics data
   */
  const getAnalyticsAction = useCallback(async (period = 'monthly'): Promise<DisputeAnalytics> => {
    try {
      const analyticsData = await getDisputeAnalytics(period);
      setAnalytics(analyticsData);
      return analyticsData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get analytics';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  return {
    disputes,
    isLoading,
    error,
    analytics,
    actions: {
      createDispute,
      categorizeDispute: categorizeDisputeAction,
      calculatePriority: calculatePriorityAction,
      assignMediator: assignMediatorAction,
      submitEvidence: submitEvidenceAction,
      generateRecommendation: generateRecommendationAction,
      updateStatus: updateStatusAction,
      escalateDispute: escalateDisputeAction,
      closeDispute: closeDisputeAction,
      getAnalytics: getAnalyticsAction,
    },
  };
}

/**
 * Hook for single dispute management
 */
export function useDisputeDetails(disputeId: string) {
  const [dispute, setDispute] = useState<DisputeAutomationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDispute = async () => {
      try {
        setIsLoading(true);
        const disputeData = await getDisputeById(disputeId);
        setDispute(disputeData);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dispute';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (disputeId) {
      loadDispute();
    }
  }, [disputeId]);

  return { dispute, isLoading, error };
}

/**
 * Hook for mediator management
 */
export function useMediators() {
  const [mediators, setMediators] = useState<MediatorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMediators = async () => {
      try {
        setIsLoading(true);
        const mediatorData = await getAvailableMediators();
        setMediators(mediatorData);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load mediators';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadMediators();
  }, []);

  return { mediators, isLoading, error };
}