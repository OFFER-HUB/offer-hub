/**
 * @fileoverview Priority scoring algorithms and logic for automated dispute processing
 * @author Offer Hub Team
 */

import {
  DisputeAutomationData,
  DisputeCategory,
  DisputePriority,
  PriorityScoreFactors,
  PriorityCalculationResult,
  DisputeType
} from '@/types/dispute-automation.types';

// Default weights for priority calculation
const DEFAULT_PRIORITY_WEIGHTS: PriorityScoreFactors = {
  amountWeight: 0.25,
  urgencyWeight: 0.20,
  userHistoryWeight: 0.15,
  projectComplexityWeight: 0.15,
  timelineSensitivityWeight: 0.15,
  communicationQualityWeight: 0.10,
};

// Amount thresholds for scoring
const AMOUNT_THRESHOLDS = {
  low: 500,
  medium: 2000,
  high: 5000,
  critical: 10000,
};

// Category complexity scores
const CATEGORY_COMPLEXITY: Record<DisputeCategory, number> = {
  payment_issues: 0.8,
  deliverable_quality: 0.9,
  project_timeline: 0.6,
  communication_breakdown: 0.5,
  scope_creep: 0.7,
  technical_requirements: 0.8,
  contract_terms: 0.9,
  intellectual_property: 1.0,
  refund_request: 0.7,
  milestone_disputes: 0.6,
};

// Type urgency scores
const TYPE_URGENCY: Record<DisputeType, number> = {
  payment_dispute: 0.9,
  quality_dispute: 0.7,
  timeline_dispute: 0.8,
  communication_dispute: 0.5,
  scope_dispute: 0.6,
  technical_dispute: 0.7,
  contract_violation: 0.9,
};

interface UserHistoryData {
  totalProjects: number;
  successfulProjects: number;
  previousDisputes: number;
  averageRating: number;
  accountAge: number; // months
  verificationLevel: 'basic' | 'verified' | 'premium';
}

interface ProjectComplexityData {
  duration: number; // days
  budget: number;
  skillsRequired: string[];
  teamSize: number;
  projectType: 'simple' | 'moderate' | 'complex' | 'enterprise';
}

/**
 * Calculate amount score based on dispute value
 */
function calculateAmountScore(amount: number): number {
  if (amount >= AMOUNT_THRESHOLDS.critical) return 1.0;
  if (amount >= AMOUNT_THRESHOLDS.high) return 0.8;
  if (amount >= AMOUNT_THRESHOLDS.medium) return 0.6;
  if (amount >= AMOUNT_THRESHOLDS.low) return 0.4;
  return 0.2;
}

/**
 * Calculate urgency score based on dispute type and category
 */
function calculateUrgencyScore(
  disputeType: DisputeType,
  category: DisputeCategory,
  userUrgency: 'low' | 'medium' | 'high'
): number {
  const typeScore = TYPE_URGENCY[disputeType] || 0.5;
  const complexityScore = CATEGORY_COMPLEXITY[category] || 0.5;
  
  const urgencyMultiplier = {
    low: 0.5,
    medium: 0.75,
    high: 1.0,
  }[userUrgency];

  return (typeScore + complexityScore) / 2 * urgencyMultiplier;
}

/**
 * Calculate user history score
 */
function calculateUserHistoryScore(
  clientHistory: UserHistoryData,
  freelancerHistory: UserHistoryData
): number {
  const calculateIndividualScore = (history: UserHistoryData): number => {
    let score = 0.5; // Base score

    // Success rate factor
    const successRate = history.totalProjects > 0 
      ? history.successfulProjects / history.totalProjects 
      : 0.5;
    score += (1 - successRate) * 0.3; // Higher disputes for lower success rate

    // Previous disputes factor
    const disputeRate = history.totalProjects > 0 
      ? history.previousDisputes / history.totalProjects 
      : 0;
    score += disputeRate * 0.3;

    // Rating factor (inverse - lower rating = higher priority)
    score += (5 - history.averageRating) / 5 * 0.2;

    // Account age factor (newer accounts get higher priority)
    const ageScore = Math.min(history.accountAge / 12, 1); // Max 1 year
    score += (1 - ageScore) * 0.1;

    // Verification level
    const verificationScore = {
      basic: 0.1,
      verified: 0.05,
      premium: 0.0,
    }[history.verificationLevel];
    score += verificationScore;

    return Math.min(score, 1.0);
  };

  const clientScore = calculateIndividualScore(clientHistory);
  const freelancerScore = calculateIndividualScore(freelancerHistory);

  // Return the higher of the two scores (most problematic user)
  return Math.max(clientScore, freelancerScore);
}

/**
 * Calculate project complexity score
 */
function calculateProjectComplexityScore(project: ProjectComplexityData): number {
  let score = 0;

  // Duration factor
  if (project.duration > 90) score += 0.3;
  else if (project.duration > 30) score += 0.2;
  else if (project.duration > 7) score += 0.1;

  // Budget factor
  score += calculateAmountScore(project.budget) * 0.3;

  // Skills complexity
  const skillComplexity = Math.min(project.skillsRequired.length / 10, 1);
  score += skillComplexity * 0.2;

  // Team size factor
  if (project.teamSize > 5) score += 0.1;
  else if (project.teamSize > 2) score += 0.05;

  // Project type factor
  const typeScore = {
    simple: 0.0,
    moderate: 0.1,
    complex: 0.2,
    enterprise: 0.3,
  }[project.projectType];
  score += typeScore;

  return Math.min(score, 1.0);
}

/**
 * Calculate timeline sensitivity score
 */
function calculateTimelineSensitivityScore(
  category: DisputeCategory,
  projectDeadline?: string,
  milestoneDeadlines?: string[]
): number {
  let score = CATEGORY_COMPLEXITY[category] * 0.5;

  // Check proximity to project deadline
  if (projectDeadline) {
    const deadline = new Date(projectDeadline);
    const now = new Date();
    const daysUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (daysUntilDeadline < 0) score += 0.4; // Past deadline
    else if (daysUntilDeadline < 3) score += 0.3; // Very close
    else if (daysUntilDeadline < 7) score += 0.2; // Close
    else if (daysUntilDeadline < 14) score += 0.1; // Approaching
  }

  // Check milestone deadlines
  if (milestoneDeadlines && milestoneDeadlines.length > 0) {
    const now = new Date();
    const hasUrgentMilestone = milestoneDeadlines.some(deadline => {
      const milestoneDate = new Date(deadline);
      const daysUntil = (milestoneDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntil < 7;
    });

    if (hasUrgentMilestone) score += 0.2;
  }

  return Math.min(score, 1.0);
}

/**
 * Calculate communication quality score
 */
function calculateCommunicationQualityScore(
  responseTime: number, // average response time in hours
  messageCount: number,
  lastCommunication: string
): number {
  let score = 0;

  // Response time factor
  if (responseTime > 48) score += 0.4;
  else if (responseTime > 24) score += 0.3;
  else if (responseTime > 12) score += 0.2;
  else if (responseTime > 6) score += 0.1;

  // Message frequency (too few or too many can indicate problems)
  if (messageCount < 5) score += 0.2; // Poor communication
  else if (messageCount > 50) score += 0.1; // Excessive communication

  // Time since last communication
  const lastComm = new Date(lastCommunication);
  const now = new Date();
  const hoursSinceLastComm = (now.getTime() - lastComm.getTime()) / (1000 * 60 * 60);

  if (hoursSinceLastComm > 72) score += 0.3;
  else if (hoursSinceLastComm > 48) score += 0.2;
  else if (hoursSinceLastComm > 24) score += 0.1;

  return Math.min(score, 1.0);
}

/**
 * Determine priority level from score
 */
function determinePriorityFromScore(score: number): DisputePriority {
  if (score >= 0.8) return 'critical';
  if (score >= 0.6) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
}

/**
 * Calculate recommended timeline based on priority
 */
function calculateRecommendedTimeline(priority: DisputePriority, category: DisputeCategory): number {
  const baseTimelines = {
    critical: 4,
    high: 12,
    medium: 24,
    low: 48,
  };

  const categoryMultipliers = {
    payment_issues: 0.8,
    deliverable_quality: 1.2,
    project_timeline: 1.0,
    communication_breakdown: 0.9,
    scope_creep: 1.1,
    technical_requirements: 1.3,
    contract_terms: 1.4,
    intellectual_property: 1.5,
    refund_request: 1.0,
    milestone_disputes: 0.9,
  };

  return Math.round(baseTimelines[priority] * categoryMultipliers[category]);
}

/**
 * Main priority calculation function
 */
export function calculateDisputePriority(
  dispute: DisputeAutomationData,
  clientHistory: UserHistoryData,
  freelancerHistory: UserHistoryData,
  projectComplexity: ProjectComplexityData,
  communicationData: {
    responseTime: number;
    messageCount: number;
    lastCommunication: string;
  },
  userUrgency: 'low' | 'medium' | 'high' = 'medium',
  customWeights?: Partial<PriorityScoreFactors>
): PriorityCalculationResult {
  const weights = { ...DEFAULT_PRIORITY_WEIGHTS, ...customWeights };

  // Calculate individual factor scores
  const amountScore = calculateAmountScore(dispute.amount);
  const urgencyScore = calculateUrgencyScore(dispute.disputeType, dispute.category, userUrgency);
  const userHistoryScore = calculateUserHistoryScore(clientHistory, freelancerHistory);
  const projectComplexityScore = calculateProjectComplexityScore(projectComplexity);
  const timelineSensitivityScore = calculateTimelineSensitivityScore(dispute.category);
  const communicationQualityScore = calculateCommunicationQualityScore(
    communicationData.responseTime,
    communicationData.messageCount,
    communicationData.lastCommunication
  );

  // Calculate weighted total score
  const totalScore = 
    (amountScore * weights.amountWeight) +
    (urgencyScore * weights.urgencyWeight) +
    (userHistoryScore * weights.userHistoryWeight) +
    (projectComplexityScore * weights.projectComplexityWeight) +
    (timelineSensitivityScore * weights.timelineSensitivityWeight) +
    (communicationQualityScore * weights.communicationQualityWeight);

  const priority = determinePriorityFromScore(totalScore);
  const recommendedTimeline = calculateRecommendedTimeline(priority, dispute.category);

  // Generate reasoning
  const reasoning: string[] = [];
  
  if (amountScore > 0.7) reasoning.push(`High financial impact ($${dispute.amount})`);
  if (urgencyScore > 0.7) reasoning.push(`Urgent dispute type (${dispute.disputeType})`);
  if (userHistoryScore > 0.6) reasoning.push('User history indicates potential for escalation');
  if (projectComplexityScore > 0.6) reasoning.push('Complex project with multiple stakeholders');
  if (timelineSensitivityScore > 0.6) reasoning.push('Time-sensitive due to approaching deadlines');
  if (communicationQualityScore > 0.6) reasoning.push('Poor communication patterns detected');

  if (reasoning.length === 0) {
    reasoning.push('Standard dispute with no elevated risk factors');
  }

  return {
    score: Math.round(totalScore * 100) / 100,
    priority,
    factors: {
      amount: Math.round(amountScore * 100) / 100,
      urgency: Math.round(urgencyScore * 100) / 100,
      userHistory: Math.round(userHistoryScore * 100) / 100,
      projectComplexity: Math.round(projectComplexityScore * 100) / 100,
      timelineSensitivity: Math.round(timelineSensitivityScore * 100) / 100,
      communicationQuality: Math.round(communicationQualityScore * 100) / 100,
    },
    reasoning,
    recommendedTimeline,
  };
}

/**
 * Batch calculate priorities for multiple disputes
 */
export function batchCalculatePriorities(
  disputes: DisputeAutomationData[],
  additionalData: Map<string, {
    clientHistory: UserHistoryData;
    freelancerHistory: UserHistoryData;
    projectComplexity: ProjectComplexityData;
    communicationData: {
      responseTime: number;
      messageCount: number;
      lastCommunication: string;
    };
  }>
): Map<string, PriorityCalculationResult> {
  const results = new Map<string, PriorityCalculationResult>();

  disputes.forEach(dispute => {
    const data = additionalData.get(dispute.id);
    if (data) {
      const result = calculateDisputePriority(
        dispute,
        data.clientHistory,
        data.freelancerHistory,
        data.projectComplexity,
        data.communicationData
      );
      results.set(dispute.id, result);
    }
  });

  return results;
}

/**
 * Get priority threshold recommendations
 */
export function getPriorityThresholds(): {
  critical: { maxResponseTime: number; escalationTime: number };
  high: { maxResponseTime: number; escalationTime: number };
  medium: { maxResponseTime: number; escalationTime: number };
  low: { maxResponseTime: number; escalationTime: number };
} {
  return {
    critical: { maxResponseTime: 2, escalationTime: 4 },
    high: { maxResponseTime: 6, escalationTime: 12 },
    medium: { maxResponseTime: 12, escalationTime: 24 },
    low: { maxResponseTime: 24, escalationTime: 48 },
  };
}

/**
 * Check if dispute should be escalated based on time and priority
 */
export function shouldEscalateDispute(
  dispute: DisputeAutomationData,
  priority: DisputePriority,
  hoursElapsed: number
): boolean {
  const thresholds = getPriorityThresholds();
  const threshold = thresholds[priority];
  
  return hoursElapsed >= threshold.escalationTime;
}