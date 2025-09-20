import {
  QualityScore,
  QualityMetrics,
  ModerationStatus,
  ModerationAction,
  ContentModerationResult,
  ModerationSeverity,
  QualityAssessmentConfig,
  QualityImprovementSuggestion,
  ModerationRule,
  ModerationCondition,
  QualityTrend,
  QualityAnalytics,
} from '@/types/review-quality.types';
import { Review } from '@/types/reviews.types';

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

export const assessReviewQuality = (
  review: Review,
  config: QualityAssessmentConfig = DEFAULT_CONFIG
): QualityScore => {
  const content = review.comment || '';

  const scores = {
    content: assessContentQuality(content),
    relevance: assessRelevanceQuality(content, review),
    professionalism: assessProfessionalismQuality(content),
    helpfulness: assessHelpfulnessQuality(content, review.rating),
    accuracy: assessAccuracyQuality(content, review),
  };

  const overall = calculateWeightedScore(scores, config.weights);

  return {
    overall,
    breakdown: scores,
  };
};

export const assessContentQuality = (content: string): number => {
  let score = 0;
  const length = content.length;

  if (length >= 50 && length <= 500) {
    score += 30;
  } else if (length >= 20 && length < 50) {
    score += 20;
  } else if (length > 500 && length <= 1000) {
    score += 25;
  } else if (length < 20) {
    score += 5;
  } else {
    score += 15;
  }

  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.length > 0);

  if (sentences.length > 0 && words.length > 0) {
    const avgWordsPerSentence = words.length / sentences.length;
    if (avgWordsPerSentence >= 8 && avgWordsPerSentence <= 20) {
      score += 20;
    } else if (avgWordsPerSentence >= 5 && avgWordsPerSentence < 8) {
      score += 15;
    } else {
      score += 10;
    }
  }

  if (content.charAt(0) === content.charAt(0).toUpperCase()) {
    score += 10;
  }

  if (content.endsWith('.') || content.endsWith('!') || content.endsWith('?')) {
    score += 10;
  }

  const grammarScore = assessBasicGrammar(content);
  score += grammarScore * 0.3;

  return Math.min(100, Math.max(0, score));
};

export const assessRelevanceQuality = (content: string, review: Review): number => {
  const lowerContent = content.toLowerCase();
  let score = 50;

  const relevantKeywords = [
    'project', 'work', 'experience', 'communication', 'quality',
    'delivery', 'timeline', 'feedback', 'improvement', 'service',
    'collaboration', 'expectations', 'requirements', 'outcome',
    'professional', 'skilled', 'knowledgeable', 'responsive',
  ];

  const foundKeywords = relevantKeywords.filter(keyword =>
    lowerContent.includes(keyword)
  );

  score += Math.min(foundKeywords.length * 8, 40);

  if (review.rating <= 2 && (
    lowerContent.includes('improve') ||
    lowerContent.includes('better') ||
    lowerContent.includes('issue')
  )) {
    score += 10;
  }

  if (review.rating >= 4 && (
    lowerContent.includes('excellent') ||
    lowerContent.includes('great') ||
    lowerContent.includes('satisfied')
  )) {
    score += 10;
  }

  return Math.min(100, Math.max(0, score));
};

export const assessProfessionalismQuality = (content: string): number => {
  const lowerContent = content.toLowerCase();
  let score = 50;

  const professionalWords = [
    'thank', 'appreciate', 'professional', 'improve', 'feedback',
    'understand', 'clarify', 'collaborate', 'enhance', 'develop',
    'respectful', 'courteous', 'constructive', 'valuable',
  ];

  const unprofessionalWords = [
    'hate', 'stupid', 'idiot', 'suck', 'terrible', 'awful',
    'pathetic', 'ridiculous', 'nonsense', 'bullshit', 'crap',
    'damn', 'shit', 'fuck', 'asshole', 'bitch',
  ];

  const professionalCount = professionalWords.filter(word =>
    lowerContent.includes(word)
  ).length;
  score += Math.min(professionalCount * 10, 30);

  const unprofessionalCount = unprofessionalWords.filter(word =>
    lowerContent.includes(word)
  ).length;
  score -= unprofessionalCount * 20;

  if (content.charAt(0) === content.charAt(0).toUpperCase()) {
    score += 5;
  }

  if (content.endsWith('.') || content.endsWith('!') || content.endsWith('?')) {
    score += 5;
  }

  const allCapsWords = content.match(/\b[A-Z]{3,}\b/g);
  if (allCapsWords && allCapsWords.length > 2) {
    score -= 10;
  }

  return Math.min(100, Math.max(0, score));
};

export const assessHelpfulnessQuality = (content: string, rating: number): number => {
  const lowerContent = content.toLowerCase();
  let score = 40;

  const helpfulWords = [
    'recommend', 'suggest', 'advice', 'helpful', 'useful',
    'informative', 'detailed', 'specific', 'clear', 'thorough',
    'improvement', 'enhance', 'better', 'optimize',
  ];

  const helpfulCount = helpfulWords.filter(word =>
    lowerContent.includes(word)
  ).length;
  score += Math.min(helpfulCount * 12, 36);

  if (rating <= 2) {
    const constructiveWords = [
      'improve', 'better', 'suggest', 'recommend', 'enhance',
      'develop', 'consider', 'perhaps', 'maybe', 'could',
    ];
    const constructiveCount = constructiveWords.filter(word =>
      lowerContent.includes(word)
    ).length;
    score += Math.min(constructiveCount * 8, 24);
  }

  if (content.length > 100) {
    score += 10;
  }

  const questions = content.match(/\?/g);
  if (questions && questions.length > 0) {
    score += Math.min(questions.length * 5, 15);
  }

  return Math.min(100, Math.max(0, score));
};

export const assessAccuracyQuality = (content: string, review: Review): number => {
  let score = 70;

  const ratingWords = {
    1: ['terrible', 'awful', 'horrible', 'worst', 'disappointing'],
    2: ['poor', 'bad', 'unsatisfactory', 'below average', 'issues'],
    3: ['okay', 'average', 'acceptable', 'fair', 'decent'],
    4: ['good', 'solid', 'reliable', 'satisfactory', 'pleased'],
    5: ['excellent', 'outstanding', 'amazing', 'perfect', 'exceptional'],
  };

  const lowerContent = content.toLowerCase();
  const expectedWords = ratingWords[review.rating as keyof typeof ratingWords] || [];

  const matchingWords = expectedWords.filter(word =>
    lowerContent.includes(word)
  );

  if (matchingWords.length > 0) {
    score += 20;
  }

  const inconsistentWords = Object.entries(ratingWords)
    .filter(([rating]) => parseInt(rating) !== review.rating)
    .flatMap(([, words]) => words)
    .filter(word => lowerContent.includes(word));

  if (inconsistentWords.length > 0) {
    score -= 15;
  }

  if (review.rating === 5 && lowerContent.includes('issue')) {
    score -= 10;
  }

  if (review.rating === 1 && lowerContent.includes('recommend')) {
    score -= 15;
  }

  return Math.min(100, Math.max(0, score));
};

const assessBasicGrammar = (content: string): number => {
  let score = 80;

  const repeatedPunctuation = content.match(/[!?]{2,}|\.{2,}/g);
  if (repeatedPunctuation) {
    score -= repeatedPunctuation.length * 5;
  }

  const allCaps = content.match(/\b[A-Z]{4,}\b/g);
  if (allCaps && allCaps.length > 1) {
    score -= allCaps.length * 3;
  }

  const repeatedChars = content.match(/(.)\1{3,}/g);
  if (repeatedChars) {
    score -= repeatedChars.length * 10;
  }

  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const startsWithLowercase = sentences.filter(s =>
    s.trim().length > 0 && s.trim().charAt(0) === s.trim().charAt(0).toLowerCase()
  );

  if (startsWithLowercase.length > 1) {
    score -= startsWithLowercase.length * 5;
  }

  return Math.min(100, Math.max(0, score));
};

const calculateWeightedScore = (
  scores: Record<string, number>,
  weights: Record<string, number>
): number => {
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

  if (totalWeight === 0) return 0;

  const weightedSum = Object.entries(scores).reduce((sum, [key, score]) => {
    const weight = weights[key] || 0;
    return sum + (score * weight);
  }, 0);

  return Math.round((weightedSum / totalWeight) * 100) / 100;
};

export const moderateContent = (
  content: string,
  config: QualityAssessmentConfig = DEFAULT_CONFIG
): ContentModerationResult => {
  const flags: Array<{
    type: string;
    severity: ModerationSeverity;
    description: string;
    confidence: number;
  }> = [];

  if (config.enabledFeatures.spamDetection) {
    const spamFlags = detectSpam(content);
    flags.push(...spamFlags);
  }

  if (config.enabledFeatures.contentModeration) {
    const contentFlags = detectInappropriateContent(content);
    flags.push(...contentFlags);
  }

  const score = assessContentModerationScore(content, flags);
  const passed = flags.filter(f => f.severity === 'high' || f.severity === 'critical').length === 0;

  let suggestedAction: ModerationAction = 'approve';

  if (score < config.thresholds.autoReject) {
    suggestedAction = 'reject';
  } else if (score < config.thresholds.flagForReview) {
    suggestedAction = 'flag';
  } else if (score >= config.thresholds.autoApprove) {
    suggestedAction = 'approve';
  } else {
    suggestedAction = 'flag';
  }

  const reasoning = generateModerationReasoning(flags, score, config);

  return {
    passed,
    score,
    flags,
    suggestedAction,
    reasoning,
  };
};

const detectSpam = (content: string): Array<{
  type: string;
  severity: ModerationSeverity;
  description: string;
  confidence: number;
}> => {
  const flags = [];
  const lowerContent = content.toLowerCase();

  const urlPattern = /https?:\/\/[^\s]+/g;
  const urls = content.match(urlPattern);
  if (urls && urls.length > 2) {
    flags.push({
      type: 'excessive_links',
      severity: 'high' as ModerationSeverity,
      description: 'Contains excessive external links',
      confidence: 0.9,
    });
  }

  const repeatedPattern = /(.{3,})\1{2,}/gi;
  if (repeatedPattern.test(content)) {
    flags.push({
      type: 'repeated_content',
      severity: 'medium' as ModerationSeverity,
      description: 'Contains repeated patterns indicating spam',
      confidence: 0.8,
    });
  }

  const allCapsWords = content.match(/\b[A-Z]{4,}\b/g);
  if (allCapsWords && allCapsWords.length > 5) {
    flags.push({
      type: 'excessive_caps',
      severity: 'low' as ModerationSeverity,
      description: 'Excessive use of capital letters',
      confidence: 0.7,
    });
  }

  const spamKeywords = [
    'buy now', 'click here', 'limited time', 'act now', 'free money',
    'guaranteed', 'risk free', 'no obligation', 'call now', 'urgent',
  ];

  const spamMatches = spamKeywords.filter(keyword =>
    lowerContent.includes(keyword)
  );

  if (spamMatches.length > 2) {
    flags.push({
      type: 'spam_keywords',
      severity: 'high' as ModerationSeverity,
      description: 'Contains multiple spam-like keywords',
      confidence: 0.85,
    });
  }

  return flags;
};

const detectInappropriateContent = (content: string): Array<{
  type: string;
  severity: ModerationSeverity;
  description: string;
  confidence: number;
}> => {
  const flags = [];
  const lowerContent = content.toLowerCase();

  const profanity = [
    'fuck', 'shit', 'damn', 'hell', 'bitch', 'asshole', 'bastard',
    'crap', 'piss', 'bloody', 'freaking', 'fucking', 'shitty',
  ];

  const profanityMatches = profanity.filter(word =>
    lowerContent.includes(word)
  );

  if (profanityMatches.length > 0) {
    flags.push({
      type: 'profanity',
      severity: 'high' as ModerationSeverity,
      description: 'Contains profane language',
      confidence: 0.95,
    });
  }

  const harassment = [
    'kill', 'die', 'threat', 'harm', 'hurt', 'attack', 'violence',
    'hate', 'despise', 'loathe', 'destroy', 'ruin', 'sabotage',
  ];

  const harassmentMatches = harassment.filter(word =>
    lowerContent.includes(word)
  );

  if (harassmentMatches.length > 0) {
    flags.push({
      type: 'harassment',
      severity: 'critical' as ModerationSeverity,
      description: 'Contains threatening or harassing language',
      confidence: 0.9,
    });
  }

  const personalInfo = [
    /\b\d{3}-\d{3}-\d{4}\b/g,
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    /(skype|discord|telegram|whatsapp):\s*[^\s]+/gi,
  ];

  personalInfo.forEach((pattern, index) => {
    if (pattern.test(content)) {
      flags.push({
        type: 'personal_information',
        severity: 'medium' as ModerationSeverity,
        description: 'Contains personal contact information',
        confidence: 0.8,
      });
    }
  });

  return flags;
};

const assessContentModerationScore = (
  content: string,
  flags: Array<{ severity: ModerationSeverity; confidence: number }>
): number => {
  let score = 100;

  flags.forEach(flag => {
    const penalty = {
      low: 5,
      medium: 15,
      high: 30,
      critical: 50,
    };

    score -= penalty[flag.severity] * flag.confidence;
  });

  return Math.max(0, Math.min(100, score));
};

const generateModerationReasoning = (
  flags: Array<{ type: string; description: string; severity: ModerationSeverity }>,
  score: number,
  config: QualityAssessmentConfig
): string[] => {
  const reasoning = [];

  if (flags.length === 0) {
    reasoning.push('Content passed all moderation checks');
  } else {
    reasoning.push(`Found ${flags.length} potential issue(s):`);
    flags.forEach(flag => {
      reasoning.push(`- ${flag.description} (${flag.severity} severity)`);
    });
  }

  if (score >= config.thresholds.autoApprove) {
    reasoning.push('Score meets auto-approval threshold');
  } else if (score < config.thresholds.autoReject) {
    reasoning.push('Score below auto-rejection threshold');
  } else {
    reasoning.push('Score requires manual review');
  }

  return reasoning;
};

export const generateQualityImprovementSuggestions = (
  qualityScore: QualityScore,
  content: string
): QualityImprovementSuggestion[] => {
  const suggestions: Omit<QualityImprovementSuggestion, 'id' | 'reviewId' | 'timestamp'>[] = [];

  if (qualityScore.breakdown.content < 70) {
    if (content.length < 50) {
      suggestions.push({
        category: 'content',
        severity: 'moderate',
        suggestion: 'Consider adding more detail to make your review more helpful and informative',
        example: 'Instead of "Good work", try "The developer delivered high-quality code on time and communicated effectively throughout the project"',
        impact: 'medium',
        automated: true,
        acknowledged: false,
      });
    } else if (content.length > 1000) {
      suggestions.push({
        category: 'content',
        severity: 'minor',
        suggestion: 'Consider making your review more concise while keeping the key points',
        impact: 'low',
        automated: true,
        acknowledged: false,
      });
    }
  }

  if (qualityScore.breakdown.professionalism < 70) {
    suggestions.push({
      category: 'tone',
      severity: 'moderate',
      suggestion: 'Use more professional language and avoid informal expressions',
      example: 'Replace casual terms with professional alternatives like "excellent" instead of "awesome"',
      impact: 'medium',
      automated: true,
      acknowledged: false,
    });
  }

  if (qualityScore.breakdown.relevance < 70) {
    suggestions.push({
      category: 'relevance',
      severity: 'moderate',
      suggestion: 'Focus more on project-specific details and work-related aspects',
      example: 'Mention specific deliverables, communication quality, or technical skills demonstrated',
      impact: 'high',
      automated: true,
      acknowledged: false,
    });
  }

  if (qualityScore.breakdown.helpfulness < 70) {
    suggestions.push({
      category: 'specificity',
      severity: 'moderate',
      suggestion: 'Provide more specific examples and actionable feedback',
      example: 'Instead of "Could be better", try "Consider improving response time to client messages"',
      impact: 'high',
      automated: true,
      acknowledged: false,
    });
  }

  return suggestions.map((suggestion, index) => ({
    ...suggestion,
    id: `suggestion_${Date.now()}_${index}`,
    reviewId: '',
    timestamp: new Date().toISOString(),
  }));
};

export const calculateQualityTrends = (
  qualityMetrics: QualityMetrics[],
  period: 'daily' | 'weekly' | 'monthly'
): QualityTrend[] => {
  const trends: QualityTrend[] = [];
  const now = new Date();
  const periods: { [key: string]: number } = {
    daily: 30,
    weekly: 12,
    monthly: 12,
  };

  const periodCount = periods[period];
  const msPerPeriod = {
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
    monthly: 30 * 24 * 60 * 60 * 1000,
  };

  for (let i = 0; i < periodCount; i++) {
    const endDate = new Date(now.getTime() - (i * msPerPeriod[period]));
    const startDate = new Date(endDate.getTime() - msPerPeriod[period]);

    const periodMetrics = qualityMetrics.filter(metric => {
      const metricDate = new Date(metric.createdAt);
      return metricDate >= startDate && metricDate < endDate;
    });

    if (periodMetrics.length > 0) {
      const averageScore = periodMetrics.reduce((sum, metric) =>
        sum + metric.qualityScore.overall, 0
      ) / periodMetrics.length;

      const scoreDistribution: Record<string, number> = {};
      periodMetrics.forEach(metric => {
        const scoreRange = Math.floor(metric.qualityScore.overall / 10) * 10;
        const key = `${scoreRange}-${scoreRange + 9}`;
        scoreDistribution[key] = (scoreDistribution[key] || 0) + 1;
      });

      const flaggedCount = periodMetrics.filter(metric =>
        metric.moderationStatus === 'flagged'
      ).length;

      const rejectedCount = periodMetrics.filter(metric =>
        metric.moderationStatus === 'rejected'
      ).length;

      const previousPeriod = trends[trends.length - 1];
      const improvementPercentage = previousPeriod
        ? ((averageScore - previousPeriod.averageScore) / previousPeriod.averageScore) * 100
        : 0;

      trends.push({
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        averageScore: Math.round(averageScore * 100) / 100,
        scoreDistribution,
        improvementPercentage: Math.round(improvementPercentage * 100) / 100,
        totalReviews: periodMetrics.length,
        flaggedCount,
        rejectedCount,
      });
    }
  }

  return trends.reverse();
};

export const generateQualityAnalytics = (
  qualityMetrics: QualityMetrics[]
): QualityAnalytics => {
  const totalReviews = qualityMetrics.length;

  if (totalReviews === 0) {
    return {
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
    };
  }

  const averageQualityScore = qualityMetrics.reduce((sum, metric) =>
    sum + metric.qualityScore.overall, 0
  ) / totalReviews;

  const approvedCount = qualityMetrics.filter(m => m.moderationStatus === 'approved').length;
  const flaggedCount = qualityMetrics.filter(m => m.moderationStatus === 'flagged').length;
  const rejectedCount = qualityMetrics.filter(m => m.moderationStatus === 'rejected').length;
  const autoCount = qualityMetrics.filter(m =>
    m.moderationStatus === 'auto-approved' || m.moderationStatus === 'auto-rejected'
  ).length;

  const allIssues = qualityMetrics.flatMap(m => m.flaggedIssues);
  const issueCount: Record<string, number> = {};
  allIssues.forEach(issue => {
    issueCount[issue] = (issueCount[issue] || 0) + 1;
  });

  const topIssues = Object.entries(issueCount)
    .map(([issue, count]) => ({
      issue,
      count,
      percentage: Math.round((count / totalReviews) * 100 * 100) / 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const trends = calculateQualityTrends(qualityMetrics, 'weekly');

  return {
    overview: {
      totalReviews,
      averageQualityScore: Math.round(averageQualityScore * 100) / 100,
      approvalRate: Math.round((approvedCount / totalReviews) * 100 * 100) / 100,
      flagRate: Math.round((flaggedCount / totalReviews) * 100 * 100) / 100,
      rejectionRate: Math.round((rejectedCount / totalReviews) * 100 * 100) / 100,
      autoModerationRate: Math.round((autoCount / totalReviews) * 100 * 100) / 100,
    },
    trends,
    topIssues,
    moderatorPerformance: [],
    contentInsights: {
      averageLength: 0,
      readabilityScore: 0,
      sentimentDistribution: {},
      commonKeywords: [],
    },
  };
};

export const evaluateCondition = (
  condition: ModerationCondition,
  value: any
): boolean => {
  const { field, operator, value: conditionValue, caseSensitive = false } = condition;

  let compareValue = value;
  let targetValue = conditionValue;

  if (typeof value === 'string' && !caseSensitive) {
    compareValue = value.toLowerCase();
    targetValue = typeof conditionValue === 'string' ? conditionValue.toLowerCase() : conditionValue;
  }

  switch (operator) {
    case 'contains':
      return typeof compareValue === 'string' && compareValue.includes(targetValue);
    case 'equals':
      return compareValue === targetValue;
    case 'greater_than':
      return typeof compareValue === 'number' && typeof targetValue === 'number' && compareValue > targetValue;
    case 'less_than':
      return typeof compareValue === 'number' && typeof targetValue === 'number' && compareValue < targetValue;
    case 'matches_regex':
      if (typeof compareValue === 'string' && typeof targetValue === 'string') {
        try {
          const regex = new RegExp(targetValue, caseSensitive ? 'g' : 'gi');
          return regex.test(compareValue);
        } catch {
          return false;
        }
      }
      return false;
    default:
      return false;
  }
};

export const checkModerationRules = (
  content: string,
  rules: ModerationRule[]
): { violatedRules: ModerationRule[]; suggestedAction: ModerationAction } => {
  const violatedRules: ModerationRule[] = [];

  rules.forEach(rule => {
    if (!rule.enabled) return;

    const allConditionsMet = rule.conditions.every(condition => {
      switch (condition.field) {
        case 'content':
          return evaluateCondition(condition, content);
        case 'length':
          return evaluateCondition(condition, content.length);
        default:
          return false;
      }
    });

    if (allConditionsMet) {
      violatedRules.push(rule);
    }
  });

  let suggestedAction: ModerationAction = 'approve';

  if (violatedRules.length > 0) {
    const criticalRules = violatedRules.filter(r => r.severity === 'critical');
    const highRules = violatedRules.filter(r => r.severity === 'high');
    const mediumRules = violatedRules.filter(r => r.severity === 'medium');

    if (criticalRules.length > 0) {
      suggestedAction = criticalRules[0].autoAction || 'reject';
    } else if (highRules.length > 0) {
      suggestedAction = highRules[0].autoAction || 'reject';
    } else if (mediumRules.length > 0) {
      suggestedAction = mediumRules[0].autoAction || 'flag';
    }
  }

  return { violatedRules, suggestedAction };
};

export const formatQualityScore = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 50) return 'Poor';
  return 'Very Poor';
};

export const getQualityScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 70) return 'text-blue-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 50) return 'text-orange-600';
  return 'text-red-600';
};

export const getModerationStatusColor = (status: ModerationStatus): string => {
  const colors = {
    pending: 'text-yellow-600',
    approved: 'text-green-600',
    rejected: 'text-red-600',
    flagged: 'text-orange-600',
    escalated: 'text-purple-600',
    'auto-approved': 'text-green-500',
    'auto-rejected': 'text-red-500',
  };

  return colors[status] || 'text-gray-600';
};

export const validateQualityAssessmentConfig = (
  config: Partial<QualityAssessmentConfig>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (config.thresholds) {
    const { autoApprove, autoReject, flagForReview } = config.thresholds;

    if (autoReject >= autoApprove) {
      errors.push('Auto-reject threshold must be lower than auto-approve threshold');
    }

    if (flagForReview >= autoApprove || flagForReview <= autoReject) {
      errors.push('Flag for review threshold must be between auto-reject and auto-approve thresholds');
    }
  }

  if (config.weights) {
    const totalWeight = Object.values(config.weights).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight <= 0) {
      errors.push('Total weight must be greater than 0');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};