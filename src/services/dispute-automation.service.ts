/**
 * @fileoverview Backend service for automated dispute handling
 * @author Offer Hub Team
 */

import {
  DisputeAutomationData,
  DisputeInitiationForm,
  DisputeCategory,
  DisputeType,
  DisputeStatus,
  EvidenceItem,
  MediatorProfile,
  CaseAssignmentResult,
  ResolutionRecommendation,
  DisputeAnalytics,
  DisputeFilter,
  PriorityCalculationResult,
  AutomationConfig
} from '@/types/dispute-automation.types';
import { calculateDisputePriority } from '@/utils/dispute-priority-calculator';

// API configuration
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
const DISPUTE_ENDPOINT = `${API_BASE}/disputes/automation`;

// Demo mode flag
const DEMO_MODE = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL;

// Default automation configuration
const DEFAULT_CONFIG: AutomationConfig = {
  enableAutoCategorization: true,
  enableAutoAssignment: true,
  enablePriorityScoring: true,
  enableAIRecommendations: true,
  escalationThresholds: {
    timeWithoutResponse: 24,
    mediatorUnavailable: 12,
    highPriorityTimeout: 8,
    criticalPriorityTimeout: 4,
  },
  notificationSettings: {
    sendToClient: true,
    sendToFreelancer: true,
    sendToMediator: true,
    frequency: 'immediate',
  },
  aiModelConfig: {
    categorizationModel: 'gpt-4-turbo',
    recommendationModel: 'gpt-4',
    confidenceThreshold: 0.8,
    maxTokens: 1000,
  },
};

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * Enhanced fetch wrapper with error handling and retry logic
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 3
): Promise<T> {
  // In demo mode, return mock data instead of making API calls
  if (DEMO_MODE) {
    return getMockData<T>(endpoint);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${DISPUTE_ENDPOINT}${endpoint}`;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<T> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }

      return result.data!;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  throw new Error('Max retries exceeded');
}

/**
 * Mock data for demo mode
 */
function getMockData<T>(endpoint: string): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (endpoint.includes('/search')) {
        resolve([] as any);
      } else if (endpoint.includes('/analytics')) {
        resolve({
          period: 'monthly',
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          metrics: {
            totalDisputes: 42,
            activeDisputes: 8,
            averageResolutionTime: 72,
            resolutionRate: 94.5,
            escalationRate: 12,
            userSatisfactionScore: 4.3,
            mediatorEfficiency: 87,
            categoryBreakdown: [],
            priorityDistribution: [],
            timeToFirstResponse: 4,
            timeToResolution: 68,
          },
          trends: [],
          bottlenecks: [],
          topPerformers: { mediators: [], categories: [] },
        } as any);
      } else if (endpoint.includes('/mediators/available')) {
        resolve([
          {
            id: 'mediator_001',
            name: 'Sarah Johnson',
            email: 'sarah@example.com',
            expertise: ['payment_issues', 'contract_terms'],
            languages: ['English', 'Spanish'],
            timezone: 'UTC-5',
            availability: 'available',
            rating: 4.8,
            caseload: 3,
            maxCaseload: 8,
            successRate: 0.92,
            avgResolutionTime: 48,
            specializations: ['Payment Disputes'],
            certifications: ['Certified Mediator'],
          }
        ] as any);
      } else {
        resolve({} as any);
      }
    }, 800); // Simulate API delay
  });
}

/**
 * Dispute categorization using AI/ML models
 */
export async function categorizeDispute(description: string, projectData: any): Promise<{
  category: DisputeCategory;
  confidence: number;
  reasoning: string[];
}> {
  try {
    return await apiRequest('/categorize', {
      method: 'POST',
      body: JSON.stringify({
        description,
        projectData,
        model: DEFAULT_CONFIG.aiModelConfig.categorizationModel,
      }),
    });
  } catch (error) {
    // Fallback to rule-based categorization
    return fallbackCategorization(description);
  }
}

/**
 * Rule-based fallback categorization
 */
function fallbackCategorization(description: string): {
  category: DisputeCategory;
  confidence: number;
  reasoning: string[];
} {
  const keywords = description.toLowerCase();
  
  // Payment-related keywords
  if (keywords.includes('payment') || keywords.includes('pay') || keywords.includes('invoice') || keywords.includes('money')) {
    return {
      category: 'payment_issues',
      confidence: 0.8,
      reasoning: ['Keywords indicate payment-related dispute'],
    };
  }
  
  // Quality-related keywords
  if (keywords.includes('quality') || keywords.includes('work') || keywords.includes('deliverable') || keywords.includes('standard')) {
    return {
      category: 'deliverable_quality',
      confidence: 0.75,
      reasoning: ['Keywords indicate quality-related concerns'],
    };
  }
  
  // Timeline-related keywords
  if (keywords.includes('deadline') || keywords.includes('time') || keywords.includes('delay') || keywords.includes('late')) {
    return {
      category: 'project_timeline',
      confidence: 0.7,
      reasoning: ['Keywords indicate timeline-related issues'],
    };
  }
  
  // Communication-related keywords
  if (keywords.includes('communication') || keywords.includes('response') || keywords.includes('contact') || keywords.includes('message')) {
    return {
      category: 'communication_breakdown',
      confidence: 0.7,
      reasoning: ['Keywords indicate communication issues'],
    };
  }
  
  // Scope-related keywords
  if (keywords.includes('scope') || keywords.includes('requirement') || keywords.includes('change') || keywords.includes('additional')) {
    return {
      category: 'scope_creep',
      confidence: 0.65,
      reasoning: ['Keywords indicate scope-related disputes'],
    };
  }
  
  // Default category
  return {
    category: 'project_timeline',
    confidence: 0.5,
    reasoning: ['Unable to determine specific category, using default'],
  };
}

/**
 * Intelligent mediator assignment
 */
export async function assignBestMediator(
  dispute: DisputeAutomationData,
  availableMediators: MediatorProfile[]
): Promise<CaseAssignmentResult> {
  try {
    return await apiRequest('/assign-mediator', {
      method: 'POST',
      body: JSON.stringify({
        dispute,
        availableMediators,
      }),
    });
  } catch (error) {
    // Fallback to rule-based assignment
    return fallbackMediatorAssignment(dispute, availableMediators);
  }
}

/**
 * Rule-based fallback mediator assignment
 */
function fallbackMediatorAssignment(
  dispute: DisputeAutomationData,
  mediators: MediatorProfile[]
): CaseAssignmentResult {
  const availableMediators = mediators.filter(m => 
    m.availability === 'available' && 
    m.caseload < m.maxCaseload
  );

  if (availableMediators.length === 0) {
    throw new Error('No available mediators found');
  }

  // Score mediators based on expertise, availability, and performance
  const scoredMediators = availableMediators.map(mediator => {
    let score = 0;

    // Expertise match
    if (mediator.expertise.includes(dispute.category)) {
      score += 40;
    }

    // Performance factors
    score += mediator.rating * 10; // Max 50 points
    score += Math.min(mediator.successRate * 30, 30); // Max 30 points
    
    // Availability factors
    const caseloadRatio = mediator.caseload / mediator.maxCaseload;
    score += (1 - caseloadRatio) * 20; // Max 20 points
    
    // Experience factor (inverse of resolution time)
    const timeScore = Math.max(10 - (mediator.avgResolutionTime / 24), 0);
    score += timeScore;

    return {
      mediator,
      score: Math.round(score),
    };
  });

  // Sort by score and select the best
  scoredMediators.sort((a, b) => b.score - a.score);
  const bestMediator = scoredMediators[0];

  return {
    assignedMediatorId: bestMediator.mediator.id,
    assignmentScore: bestMediator.score,
    reasoning: [
      'Selected based on expertise match and performance metrics',
      `Mediator has ${bestMediator.mediator.rating}/5 rating`,
      `Success rate: ${Math.round(bestMediator.mediator.successRate * 100)}%`,
      `Current caseload: ${bestMediator.mediator.caseload}/${bestMediator.mediator.maxCaseload}`,
    ],
    estimatedResolutionTime: bestMediator.mediator.avgResolutionTime,
    alternativeMediators: scoredMediators.slice(1, 4).map(sm => ({
      id: sm.mediator.id,
      score: sm.score,
      reason: `Alternative with ${sm.mediator.rating}/5 rating`,
    })),
  };
}

/**
 * Generate AI-powered resolution recommendations
 */
export async function generateResolutionRecommendation(
  dispute: DisputeAutomationData,
  similarCases: DisputeAutomationData[] = []
): Promise<ResolutionRecommendation> {
  try {
    return await apiRequest('/generate-recommendation', {
      method: 'POST',
      body: JSON.stringify({
        dispute,
        similarCases,
        model: DEFAULT_CONFIG.aiModelConfig.recommendationModel,
      }),
    });
  } catch (error) {
    // Fallback to template-based recommendations
    return fallbackResolutionRecommendation(dispute);
  }
}

/**
 * Template-based fallback recommendations
 */
function fallbackResolutionRecommendation(dispute: DisputeAutomationData): ResolutionRecommendation {
  const templates: Record<DisputeCategory, Partial<ResolutionRecommendation>> = {
    payment_issues: {
      recommendation: 'Review payment terms and establish clear milestone schedule',
      suggestedActions: [
        {
          action: 'Review original contract terms',
          description: 'Examine payment schedule and milestones',
          timeline: '1 day',
          responsible: 'mediator',
        },
        {
          action: 'Provide payment proof or justification',
          description: 'Submit evidence of payment or reasons for withholding',
          timeline: '2 days',
          responsible: 'client',
        },
      ],
    },
    deliverable_quality: {
      recommendation: 'Establish quality criteria and revision process',
      suggestedActions: [
        {
          action: 'Define quality standards',
          description: 'Clarify expectations and acceptance criteria',
          timeline: '1 day',
          responsible: 'mediator',
        },
        {
          action: 'Provide revision opportunity',
          description: 'Allow freelancer to address quality concerns',
          timeline: '3-5 days',
          responsible: 'freelancer',
        },
      ],
    },
    project_timeline: {
      recommendation: 'Reassess timeline and establish realistic milestones',
      suggestedActions: [
        {
          action: 'Review timeline constraints',
          description: 'Identify factors causing delays',
          timeline: '1 day',
          responsible: 'mediator',
        },
        {
          action: 'Propose revised schedule',
          description: 'Create realistic timeline with buffer periods',
          timeline: '2 days',
          responsible: 'freelancer',
        },
      ],
    },
    communication_breakdown: {
      recommendation: 'Establish communication protocols and schedule',
      suggestedActions: [
        {
          action: 'Set communication schedule',
          description: 'Agree on regular check-in times and methods',
          timeline: 'Immediate',
          responsible: 'mediator',
        },
        {
          action: 'Resume regular updates',
          description: 'Provide weekly progress reports',
          timeline: 'Ongoing',
          responsible: 'freelancer',
        },
      ],
    },
    scope_creep: {
      recommendation: 'Clarify scope boundaries and change request process',
      suggestedActions: [
        {
          action: 'Document original scope',
          description: 'Review and confirm initial project requirements',
          timeline: '1 day',
          responsible: 'mediator',
        },
        {
          action: 'Evaluate scope changes',
          description: 'Assess additional work and fair compensation',
          timeline: '2 days',
          responsible: 'mediator',
        },
      ],
    },
    technical_requirements: {
      recommendation: 'Technical review and requirement clarification',
      suggestedActions: [
        {
          action: 'Technical assessment',
          description: 'Review technical requirements and feasibility',
          timeline: '2 days',
          responsible: 'mediator',
        },
        {
          action: 'Provide technical solution',
          description: 'Propose alternative approach or timeline',
          timeline: '3 days',
          responsible: 'freelancer',
        },
      ],
    },
    contract_terms: {
      recommendation: 'Legal review and contract clarification',
      suggestedActions: [
        {
          action: 'Contract review',
          description: 'Examine disputed contract terms',
          timeline: '2 days',
          responsible: 'mediator',
        },
        {
          action: 'Propose amendment',
          description: 'Suggest fair contract modifications',
          timeline: '3 days',
          responsible: 'mediator',
        },
      ],
    },
    intellectual_property: {
      recommendation: 'IP rights clarification and protection measures',
      suggestedActions: [
        {
          action: 'IP rights review',
          description: 'Clarify ownership and usage rights',
          timeline: '3 days',
          responsible: 'mediator',
        },
        {
          action: 'Implement IP protection',
          description: 'Establish clear IP ownership terms',
          timeline: '5 days',
          responsible: 'platform',
        },
      ],
    },
    refund_request: {
      recommendation: 'Assess refund eligibility and partial solutions',
      suggestedActions: [
        {
          action: 'Review refund policy',
          description: 'Examine terms for refund eligibility',
          timeline: '1 day',
          responsible: 'mediator',
        },
        {
          action: 'Evaluate partial refund',
          description: 'Consider proportional refund based on work completed',
          timeline: '2 days',
          responsible: 'mediator',
        },
      ],
    },
    milestone_disputes: {
      recommendation: 'Milestone review and adjusted payment schedule',
      suggestedActions: [
        {
          action: 'Milestone assessment',
          description: 'Review completed work against milestone criteria',
          timeline: '2 days',
          responsible: 'mediator',
        },
        {
          action: 'Adjust milestone terms',
          description: 'Modify milestone requirements if necessary',
          timeline: '3 days',
          responsible: 'mediator',
        },
      ],
    },
  };

  const template = templates[dispute.category] || templates.project_timeline;

  return {
    id: `rec_${Date.now()}`,
    type: 'precedent_based',
    confidence: 0.7,
    recommendation: template.recommendation || 'Review case details and establish resolution plan',
    reasoning: [
      `Template-based recommendation for ${dispute.category}`,
      'Based on common resolution patterns',
      'Customizable based on specific case details',
    ],
    suggestedActions: template.suggestedActions || [],
    similarCases: [],
    estimatedTimeToResolution: 72, // 3 days default
    fallbackOptions: [
      'Escalate to arbitration if mediation fails',
      'Involve platform support for complex cases',
      'Consider partial resolution with ongoing monitoring',
    ],
  };
}

/**
 * Create new dispute with automation
 */
export async function createAutomatedDispute(form: DisputeInitiationForm): Promise<DisputeAutomationData> {
  // Auto-categorize the dispute
  const categorization = await categorizeDispute(form.description, { projectId: form.projectId });
  
  const dispute: DisputeAutomationData = {
    id: `dispute_${Date.now()}`,
    projectId: form.projectId,
    clientId: 'current_user', // This should come from auth context
    freelancerId: 'project_freelancer', // This should come from project data
    disputeType: form.disputeType,
    category: categorization.category,
    priority: 'medium', // Will be calculated
    status: 'initiated',
    amount: 0, // Should come from project data
    currency: 'USD',
    description: form.description,
    evidence: [],
    timeline: [{
      id: `event_${Date.now()}`,
      type: 'status_change',
      timestamp: new Date().toISOString(),
      actor: 'current_user',
      action: 'Dispute initiated',
      details: 'User submitted dispute form',
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return await apiRequest('/create', {
    method: 'POST',
    body: JSON.stringify(dispute),
  });
}

/**
 * Submit evidence for dispute
 */
export async function submitEvidence(disputeId: string, evidence: EvidenceItem): Promise<void> {
  await apiRequest(`/${disputeId}/evidence`, {
    method: 'POST',
    body: JSON.stringify(evidence),
  });
}

/**
 * Update dispute status
 */
export async function updateDisputeStatus(disputeId: string, status: DisputeStatus): Promise<void> {
  await apiRequest(`/${disputeId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

/**
 * Get dispute analytics
 */
export async function getDisputeAnalytics(period = 'monthly'): Promise<DisputeAnalytics> {
  return await apiRequest(`/analytics?period=${period}`);
}

/**
 * Search and filter disputes
 */
export async function searchDisputes(filter: DisputeFilter): Promise<DisputeAutomationData[]> {
  const params = new URLSearchParams();
  
  if (filter.status) params.append('status', filter.status.join(','));
  if (filter.category) params.append('category', filter.category.join(','));
  if (filter.priority) params.append('priority', filter.priority.join(','));
  if (filter.sortBy) params.append('sortBy', filter.sortBy);
  if (filter.sortOrder) params.append('sortOrder', filter.sortOrder);
  if (filter.limit) params.append('limit', filter.limit.toString());
  if (filter.offset) params.append('offset', filter.offset.toString());

  return await apiRequest(`/search?${params.toString()}`);
}

/**
 * Get available mediators
 */
export async function getAvailableMediators(): Promise<MediatorProfile[]> {
  return await apiRequest('/mediators/available');
}

/**
 * Escalate dispute
 */
export async function escalateDispute(disputeId: string, reason: string): Promise<void> {
  await apiRequest(`/${disputeId}/escalate`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

/**
 * Close dispute
 */
export async function closeDispute(disputeId: string, resolution: string): Promise<void> {
  await apiRequest(`/${disputeId}/close`, {
    method: 'POST',
    body: JSON.stringify({ resolution }),
  });
}

/**
 * Get dispute by ID
 */
export async function getDisputeById(disputeId: string): Promise<DisputeAutomationData> {
  return await apiRequest(`/${disputeId}`);
}

/**
 * Upload evidence files
 */
export async function uploadEvidenceFiles(files: File[]): Promise<EvidenceItem[]> {
  // In demo mode, create mock evidence items without actual upload
  if (DEMO_MODE) {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate upload time
    
    return files.map((file, index) => ({
      id: `evidence_${Date.now()}_${index}`,
      type: getFileType(file.type),
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'current_user',
      url: `mock://upload/${file.name}`,
      description: `Mock upload of ${file.name}`,
    }));
  }

  const evidenceItems: EvidenceItem[] = [];
  
  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${DISPUTE_ENDPOINT}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to upload ${file.name}`);
    }
    
    const result = await response.json();
    evidenceItems.push({
      id: result.id,
      type: getFileType(file.type),
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'current_user',
      url: result.url,
    });
  }
  
  return evidenceItems;
}

/**
 * Determine file type from MIME type
 */
function getFileType(mimeType: string): EvidenceItem['type'] {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document';
  return 'document';
}