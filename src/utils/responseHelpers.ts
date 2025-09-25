// Utility functions for the Review Response System
// Based on PRD requirements for response management and quality assessment

import { 
  ReviewResponseWithDetails, 
  ResponseStatus, 
  ResponseAnalyticsFilters,
  RESPONSE_VALIDATION 
} from '@/types/review-responses.types';

/**
 * Format response date for display
 */
export const formatResponseDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

/**
 * Calculate response quality score based on content
 */
export const calculateQualityScore = (content: string): number => {
  let score = 50; // Base score
  
  // Length scoring
  const length = content.length;
  if (length >= RESPONSE_VALIDATION.OPTIMAL_MIN_LENGTH && length <= RESPONSE_VALIDATION.OPTIMAL_MAX_LENGTH) {
    score += 20; // Optimal length
  } else if (length >= RESPONSE_VALIDATION.MIN_LENGTH && length < RESPONSE_VALIDATION.OPTIMAL_MIN_LENGTH) {
    score += 10; // Acceptable but short
  } else if (length > RESPONSE_VALIDATION.OPTIMAL_MAX_LENGTH && length <= RESPONSE_VALIDATION.MAX_LENGTH) {
    score += 5; // Acceptable but long
  } else if (length < RESPONSE_VALIDATION.MIN_LENGTH) {
    score -= 20; // Too short
  } else {
    score -= 10; // Too long
  }
  
  // Professional language scoring
  const professionalWords = ['thank', 'appreciate', 'professional', 'improve', 'feedback', 'understand', 'clarify'];
  const unprofessionalWords = ['hate', 'stupid', 'idiot', 'suck', 'terrible', 'awful', 'worst'];
  
  const lowerContent = content.toLowerCase();
  professionalWords.forEach(word => {
    if (lowerContent.includes(word)) score += 5;
  });
  
  unprofessionalWords.forEach(word => {
    if (lowerContent.includes(word)) score -= 15;
  });
  
  // Gratitude scoring
  if (lowerContent.includes('thank') || lowerContent.includes('appreciate')) {
    score += 10;
  }
  
  // Specificity scoring
  const specificWords = ['project', 'work', 'experience', 'communication', 'quality', 'delivery', 'timeline'];
  const specificMatches = specificWords.filter(word => lowerContent.includes(word)).length;
  score += Math.min(specificMatches * 3, 15);
  
  // Tone scoring
  const positiveWords = ['positive', 'good', 'great', 'excellent', 'improve', 'better', 'enhance'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'disappointed', 'frustrated'];
  
  const positiveMatches = positiveWords.filter(word => lowerContent.includes(word)).length;
  const negativeMatches = negativeWords.filter(word => lowerContent.includes(word)).length;
  
  score += positiveMatches * 3;
  score -= negativeMatches * 5;
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Get quality assessment with suggestions
 */
export const getQualityAssessment = (content: string) => {
  const score = calculateQualityScore(content);
  const suggestions: string[] = [];
  
  if (content.length < RESPONSE_VALIDATION.OPTIMAL_MIN_LENGTH) {
    suggestions.push('Consider adding more detail to make your response more helpful');
  }
  
  if (content.length > RESPONSE_VALIDATION.OPTIMAL_MAX_LENGTH) {
    suggestions.push('Consider shortening your response for better readability');
  }
  
  if (!content.toLowerCase().includes('thank') && !content.toLowerCase().includes('appreciate')) {
    suggestions.push('Consider thanking the reviewer for their feedback');
  }
  
  if (!content.toLowerCase().includes('improve') && !content.toLowerCase().includes('better')) {
    suggestions.push('Mention any improvements you\'ll make based on the feedback');
  }
  
  const lowerContent = content.toLowerCase();
  const hasSpecificity = ['project', 'work', 'experience', 'communication', 'quality'].some(word => 
    lowerContent.includes(word)
  );
  
  if (!hasSpecificity) {
    suggestions.push('Address specific points mentioned in the review');
  }
  
  return {
    score,
    suggestions,
    auto_approve: score >= 80,
    factors: {
      length_score: content.length >= RESPONSE_VALIDATION.OPTIMAL_MIN_LENGTH && content.length <= RESPONSE_VALIDATION.OPTIMAL_MAX_LENGTH ? 90 : 60,
      professionalism_score: calculateProfessionalismScore(content),
      relevance_score: hasSpecificity ? 80 : 40,
      tone_score: calculateToneScore(content)
    }
  };
};

/**
 * Calculate professionalism score
 */
const calculateProfessionalismScore = (content: string): number => {
  const professionalWords = ['thank', 'appreciate', 'professional', 'improve', 'feedback', 'understand'];
  const unprofessionalWords = ['hate', 'stupid', 'idiot', 'suck', 'terrible', 'awful'];
  
  let score = 50; // Base score
  
  const lowerContent = content.toLowerCase();
  professionalWords.forEach(word => {
    if (lowerContent.includes(word)) score += 8;
  });
  
  unprofessionalWords.forEach(word => {
    if (lowerContent.includes(word)) score -= 20;
  });
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Calculate tone score
 */
const calculateToneScore = (content: string): number => {
  const positiveWords = ['thank', 'appreciate', 'positive', 'good', 'great', 'excellent', 'improve'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'disappointed', 'frustrated'];
  
  let score = 50; // Base score
  
  const lowerContent = content.toLowerCase();
  positiveWords.forEach(word => {
    if (lowerContent.includes(word)) score += 7;
  });
  
  negativeWords.forEach(word => {
    if (lowerContent.includes(word)) score -= 15;
  });
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Validate response content
 */
export const validateResponseContent = (content: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!content || content.trim().length === 0) {
    errors.push('Response content is required');
  } else {
    if (content.trim().length < RESPONSE_VALIDATION.MIN_LENGTH) {
      errors.push(`Response must be at least ${RESPONSE_VALIDATION.MIN_LENGTH} characters long`);
    }
    
    if (content.length > RESPONSE_VALIDATION.MAX_LENGTH) {
      errors.push(`Response must be less than ${RESPONSE_VALIDATION.MAX_LENGTH} characters`);
    }
    
    // Check for prohibited content
    const prohibitedWords = ['spam', 'fake', 'scam', 'harassment', 'personal_info'];
    const lowerContent = content.toLowerCase();
    const foundProhibited = prohibitedWords.find(word => lowerContent.includes(word));
    
    if (foundProhibited) {
      errors.push('Response contains prohibited content');
    }
    
    // Check for excessive repetition
    const words = content.toLowerCase().split(/\s+/);
    const wordCounts: { [key: string]: number } = {};
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    const maxRepetition = Math.max(...Object.values(wordCounts));
    if (maxRepetition > words.length * 0.3) {
      errors.push('Response contains excessive repetition');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get response status color
 */
export const getResponseStatusColor = (status: ResponseStatus): string => {
  const colors = {
    pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    approved: 'text-green-600 bg-green-50 border-green-200',
    rejected: 'text-red-600 bg-red-50 border-red-200',
    flagged: 'text-orange-600 bg-orange-50 border-orange-200'
  };
  
  return colors[status];
};

/**
 * Get engagement score color
 */
export const getEngagementScoreColor = (score: number): string => {
  if (score >= 4) return 'text-green-600';
  if (score >= 3) return 'text-yellow-600';
  if (score >= 2) return 'text-orange-600';
  return 'text-red-600';
};

/**
 * Sort responses by various criteria
 */
export const sortResponses = (
  responses: ReviewResponseWithDetails[], 
  sortBy: 'date' | 'engagement' | 'helpful' | 'views',
  order: 'asc' | 'desc' = 'desc'
): ReviewResponseWithDetails[] => {
  const sorted = [...responses].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'engagement':
        comparison = a.analytics.engagement_score - b.analytics.engagement_score;
        break;
      case 'helpful':
        comparison = a.analytics.helpful_votes - b.analytics.helpful_votes;
        break;
      case 'views':
        comparison = a.analytics.views_count - b.analytics.views_count;
        break;
    }
    
    return order === 'desc' ? -comparison : comparison;
  });
  
  return sorted;
};

/**
 * Filter responses based on criteria
 */
export const filterResponses = (
  responses: ReviewResponseWithDetails[],
  filters: ResponseAnalyticsFilters
): ReviewResponseWithDetails[] => {
  return responses.filter(response => {
    // Date filters
    if (filters.date_from) {
      const responseDate = new Date(response.created_at);
      const filterDate = new Date(filters.date_from);
      if (responseDate < filterDate) return false;
    }
    
    if (filters.date_to) {
      const responseDate = new Date(response.created_at);
      const filterDate = new Date(filters.date_to);
      if (responseDate > filterDate) return false;
    }
    
    // Status filter
    if (filters.status && response.status !== filters.status) {
      return false;
    }
    
    // Responder filter
    if (filters.responder_id && response.responder_id !== filters.responder_id) {
      return false;
    }
    
    // Review filter
    if (filters.review_id && response.review_id !== filters.review_id) {
      return false;
    }
    
    // Engagement score filter
    if (filters.min_engagement_score !== undefined && 
        response.analytics.engagement_score < filters.min_engagement_score) {
      return false;
    }
    
    return true;
  });
};

/**
 * Generate response statistics
 */
export const generateResponseStats = (responses: ReviewResponseWithDetails[]) => {
  const total = responses.length;
  const approved = responses.filter(r => r.status === 'approved').length;
  const pending = responses.filter(r => r.status === 'pending').length;
  const rejected = responses.filter(r => r.status === 'rejected').length;
  const flagged = responses.filter(r => r.status === 'flagged').length;
  
  const totalViews = responses.reduce((sum, r) => sum + r.analytics.views_count, 0);
  const totalHelpful = responses.reduce((sum, r) => sum + r.analytics.helpful_votes, 0);
  const totalUnhelpful = responses.reduce((sum, r) => sum + r.analytics.unhelpful_votes, 0);
  
  const avgEngagement = total > 0 
    ? responses.reduce((sum, r) => sum + r.analytics.engagement_score, 0) / total 
    : 0;
  
  const responseRate = total > 0 ? (approved / total) * 100 : 0;
  
  return {
    total,
    approved,
    pending,
    rejected,
    flagged,
    totalViews,
    totalHelpful,
    totalUnhelpful,
    avgEngagement,
    responseRate
  };
};

/**
 * Check if user can respond to review
 */
export const canUserRespondToReview = (
  reviewUserId: string,
  currentUserId: string,
  existingResponses: ReviewResponseWithDetails[]
): boolean => {
  // User must be the one who received the review
  if (reviewUserId !== currentUserId) {
    return false;
  }
  
  // User can only respond once per review
  const hasExistingResponse = existingResponses.some(r => r.responder_id === currentUserId);
  if (hasExistingResponse) {
    return false;
  }
  
  return true;
};

/**
 * Check if user can moderate responses
 */
export const canUserModerate = (userRole?: string): boolean => {
  return userRole === 'moderator' || userRole === 'admin';
};

/**
 * Get response template suggestions
 */
export const getResponseTemplates = (reviewRating: number): string[] => {
  const templates = {
    5: [
      'Thank you so much for the 5-star review! I\'m thrilled that you were completely satisfied with the project. It was a pleasure working with you, and I look forward to future collaborations.',
      'I really appreciate the excellent rating! Your clear communication and feedback throughout the project made it a great experience. Thank you for choosing me for this work.'
    ],
    4: [
      'Thank you for the positive review! I\'m glad you were satisfied with the project. I\'ll continue to work on improving my services based on your feedback.',
      'I appreciate the 4-star rating and your constructive feedback. It helps me understand what worked well and where I can improve for future projects.'
    ],
    3: [
      'Thank you for your honest review. I understand your concerns and I\'m committed to addressing them. I\'ll use this feedback to improve my services and ensure better outcomes in future projects.',
      'I appreciate you taking the time to provide feedback. While I\'m disappointed that the project didn\'t fully meet your expectations, I\'m committed to learning from this experience and improving.'
    ],
    2: [
      'Thank you for your honest feedback. I take full responsibility for the issues you\'ve raised and I\'m committed to addressing them. I\'ll use this as a learning opportunity to improve my services.',
      'I sincerely apologize that the project didn\'t meet your expectations. Your feedback is valuable and I\'m taking steps to improve my processes to prevent similar issues in the future.'
    ],
    1: [
      'I sincerely apologize for the poor experience you had with this project. I take full responsibility and I\'m committed to making significant improvements to my services. Thank you for your honest feedback.',
      'I\'m deeply sorry that the project fell short of your expectations. Your feedback is crucial for my improvement, and I\'m taking immediate steps to address the issues you\'ve raised.'
    ]
  };
  
  return templates[reviewRating as keyof typeof templates] || templates[3];
};

/**
 * Mobile-optimized text truncation
 */
export const truncateText = (text: string, maxLength: number, isMobile: boolean = false): string => {
  const length = isMobile ? Math.min(maxLength, 100) : maxLength;
  
  if (text.length <= length) {
    return text;
  }
  
  return text.substring(0, length).trim() + '...';
};

/**
 * Check if device is mobile
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

/**
 * Get responsive class names for mobile optimization
 */
export const getResponsiveClasses = (baseClasses: string, mobileClasses?: string): string => {
  const isMobile = isMobileDevice();
  return isMobile && mobileClasses ? `${baseClasses} ${mobileClasses}` : baseClasses;
};
