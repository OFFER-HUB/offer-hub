/**
 * @fileoverview Reputation scoring algorithms and calculations
 * @author OnlyDust Platform
 * @license MIT
 */

import {
  ReputationScore,
  PerformanceMetrics,
  ReputationEvent,
  ReputationTrend,
  BenchmarkData,
  ReputationCategory,
  ReputationConfig,
  ReputationInsight,
  ReputationPrediction,
  PredictionFactor,
  ReputationRecommendation
} from '@/types/reputation-analytics.types';

const DEFAULT_CONFIG: ReputationConfig = {
  weightings: {
    communication: 0.25,
    qualityOfWork: 0.30,
    timeliness: 0.20,
    professionalism: 0.15,
    reliability: 0.10
  },
  thresholds: {
    excellent: 90,
    good: 75,
    average: 60,
    poor: 40
  },
  decayFactors: {
    timeDecay: 0.95,
    activityBonus: 1.1,
    consistencyBonus: 1.05
  },
  gamification: {
    enabled: true,
    achievementPoints: 100,
    levelThresholds: [100, 250, 500, 1000, 2000, 5000],
    badges: []
  }
};

export class ReputationCalculator {
  private config: ReputationConfig;

  constructor(config: ReputationConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  calculateOverallScore(metrics: PerformanceMetrics, events: ReputationEvent[]): ReputationScore {
    const baseScores = this.calculateBaseScores(metrics);
    const eventAdjustedScores = this.applyEventAdjustments(baseScores, events);
    const timeAdjustedScores = this.applyTimeDecay(eventAdjustedScores, events);

    const overall = this.calculateWeightedOverall(timeAdjustedScores);

    return {
      ...timeAdjustedScores,
      overall,
      lastUpdated: new Date()
    };
  }

  private calculateBaseScores(metrics: PerformanceMetrics): Omit<ReputationScore, 'overall' | 'lastUpdated'> {
    return {
      communication: this.calculateCommunicationScore(metrics),
      qualityOfWork: this.calculateQualityScore(metrics),
      timeliness: this.calculateTimelinessScore(metrics),
      professionalism: this.calculateProfessionalismScore(metrics),
      reliability: this.calculateReliabilityScore(metrics)
    };
  }

  private calculateCommunicationScore(metrics: PerformanceMetrics): number {
    const responseTimeScore = Math.max(0, 100 - (metrics.averageResponseTime / 60) * 2);
    const satisfactionScore = metrics.clientSatisfactionScore * 20;
    const projectRatingScore = metrics.averageProjectRating * 20;

    return this.normalizeScore((responseTimeScore + satisfactionScore + projectRatingScore) / 3);
  }

  private calculateQualityScore(metrics: PerformanceMetrics): number {
    const qualityBase = metrics.qualityScore * 20;
    const ratingBonus = metrics.averageProjectRating * 15;
    const completionBonus = metrics.completionRate * 0.3;
    const disputePenalty = metrics.disputeRate * -30;

    return this.normalizeScore(qualityBase + ratingBonus + completionBonus + disputePenalty);
  }

  private calculateTimelinessScore(metrics: PerformanceMetrics): number {
    const onTimeScore = metrics.onTimeDelivery * 1.2;
    const completionScore = metrics.completionRate * 0.8;

    return this.normalizeScore(onTimeScore + completionScore);
  }

  private calculateProfessionalismScore(metrics: PerformanceMetrics): number {
    const satisfactionBase = metrics.clientSatisfactionScore * 20;
    const repeatClientBonus = metrics.repeatClientRate * 0.5;
    const disputePenalty = metrics.disputeRate * -25;
    const refundPenalty = metrics.refundRate * -20;

    return this.normalizeScore(satisfactionBase + repeatClientBonus + disputePenalty + refundPenalty);
  }

  private calculateReliabilityScore(metrics: PerformanceMetrics): number {
    const completionBase = metrics.completionRate * 1.1;
    const projectsBonus = Math.min(metrics.projectsCompleted * 0.5, 15);
    const disputePenalty = metrics.disputeRate * -40;

    return this.normalizeScore(completionBase + projectsBonus + disputePenalty);
  }

  private applyEventAdjustments(scores: Omit<ReputationScore, 'overall' | 'lastUpdated'>, events: ReputationEvent[]): Omit<ReputationScore, 'overall' | 'lastUpdated'> {
    const recentEvents = events.filter(event =>
      Date.now() - event.timestamp.getTime() < 90 * 24 * 60 * 60 * 1000
    );

    const adjustments = {
      communication: 0,
      qualityOfWork: 0,
      timeliness: 0,
      professionalism: 0,
      reliability: 0
    };

    recentEvents.forEach(event => {
      switch (event.type) {
        case 'project_completion':
          adjustments.reliability += event.impact;
          adjustments.timeliness += event.impact * 0.8;
          break;
        case 'client_review':
          adjustments.professionalism += event.impact;
          adjustments.qualityOfWork += event.impact * 0.9;
          break;
        case 'dispute':
          adjustments.professionalism += event.impact;
          adjustments.reliability += event.impact * 0.7;
          break;
        case 'communication':
          adjustments.communication += event.impact;
          break;
        case 'milestone':
          adjustments.timeliness += event.impact;
          adjustments.reliability += event.impact * 0.6;
          break;
      }
    });

    return {
      communication: this.normalizeScore(scores.communication + adjustments.communication),
      qualityOfWork: this.normalizeScore(scores.qualityOfWork + adjustments.qualityOfWork),
      timeliness: this.normalizeScore(scores.timeliness + adjustments.timeliness),
      professionalism: this.normalizeScore(scores.professionalism + adjustments.professionalism),
      reliability: this.normalizeScore(scores.reliability + adjustments.reliability)
    };
  }

  private applyTimeDecay(scores: Omit<ReputationScore, 'overall' | 'lastUpdated'>, events: ReputationEvent[]): Omit<ReputationScore, 'overall' | 'lastUpdated'> {
    const daysSinceLastActivity = this.getDaysSinceLastActivity(events);
    const decayFactor = Math.pow(this.config.decayFactors.timeDecay, Math.max(0, daysSinceLastActivity - 30));

    return {
      communication: scores.communication * decayFactor,
      qualityOfWork: scores.qualityOfWork * decayFactor,
      timeliness: scores.timeliness * decayFactor,
      professionalism: scores.professionalism * decayFactor,
      reliability: scores.reliability * decayFactor
    };
  }

  private calculateWeightedOverall(scores: Omit<ReputationScore, 'overall' | 'lastUpdated'>): number {
    const weighted =
      scores.communication * this.config.weightings.communication +
      scores.qualityOfWork * this.config.weightings.qualityOfWork +
      scores.timeliness * this.config.weightings.timeliness +
      scores.professionalism * this.config.weightings.professionalism +
      scores.reliability * this.config.weightings.reliability;

    return this.normalizeScore(weighted);
  }

  calculateTrends(historicalScores: Array<{date: Date, scores: ReputationScore}>): ReputationTrend[] {
    const trends: ReputationTrend[] = [];

    if (historicalScores.length < 2) return trends;

    const categories: Array<keyof Omit<ReputationScore, 'lastUpdated'>> = [
      'overall', 'communication', 'qualityOfWork', 'timeliness', 'professionalism', 'reliability'
    ];

    categories.forEach(category => {
      const categoryTrends = this.calculateCategoryTrend(historicalScores, category);
      trends.push(...categoryTrends);
    });

    return trends;
  }

  private calculateCategoryTrend(
    historicalScores: Array<{date: Date, scores: ReputationScore}>,
    category: keyof Omit<ReputationScore, 'lastUpdated'>
  ): ReputationTrend[] {
    const trends: ReputationTrend[] = [];

    for (let i = 1; i < historicalScores.length; i++) {
      const current = historicalScores[i];
      const previous = historicalScores[i - 1];
      const change = current.scores[category] - previous.scores[category];

      trends.push({
        date: current.date,
        score: current.scores[category],
        category,
        change,
        events: []
      });
    }

    return trends;
  }

  calculateBenchmarks(userScore: ReputationScore, platformData: ReputationScore[]): BenchmarkData[] {
    const benchmarks: BenchmarkData[] = [];
    const categories: Array<keyof Omit<ReputationScore, 'lastUpdated'>> = [
      'overall', 'communication', 'qualityOfWork', 'timeliness', 'professionalism', 'reliability'
    ];

    categories.forEach(category => {
      const scores = platformData.map(data => data[category]).sort((a, b) => a - b);
      const userCategoryScore = userScore[category];

      const platformAverage = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const industryAverage = platformAverage * 1.05;
      const topPercentile = scores[Math.floor(scores.length * 0.9)];
      const percentileRank = this.calculatePercentileRank(userCategoryScore, scores);

      benchmarks.push({
        userScore: userCategoryScore,
        platformAverage,
        industryAverage,
        topPercentile,
        percentileRank,
        category
      });
    });

    return benchmarks;
  }

  generateInsights(score: ReputationScore, metrics: PerformanceMetrics, trends: ReputationTrend[]): ReputationInsight[] {
    const insights: ReputationInsight[] = [];

    if (score.communication < this.config.thresholds.average) {
      insights.push({
        type: 'weakness',
        title: 'Communication Needs Improvement',
        description: 'Your communication score is below average. Focus on faster response times and clearer project updates.',
        impact: 'high',
        actionable: true,
        suggestedActions: [
          'Set up automated response templates',
          'Schedule regular client check-ins',
          'Use project management tools for better visibility'
        ],
        dataPoints: [`Response time: ${metrics.averageResponseTime} hours`, `Satisfaction: ${metrics.clientSatisfactionScore}/5`]
      });
    }

    if (score.qualityOfWork > this.config.thresholds.excellent) {
      insights.push({
        type: 'strength',
        title: 'Exceptional Work Quality',
        description: 'Your work quality consistently exceeds expectations. This is a key competitive advantage.',
        impact: 'high',
        actionable: true,
        suggestedActions: [
          'Showcase quality work in portfolio',
          'Request testimonials from satisfied clients',
          'Consider premium pricing strategy'
        ],
        dataPoints: [`Quality score: ${metrics.qualityScore}/5`, `Average rating: ${metrics.averageProjectRating}/5`]
      });
    }

    const timelinessDecline = trends
      .filter(t => t.category === 'timeliness')
      .slice(-3)
      .every(t => t.change < 0);

    if (timelinessDecline) {
      insights.push({
        type: 'risk',
        title: 'Declining Timeliness',
        description: 'Your on-time delivery has been declining. This could impact future opportunities.',
        impact: 'medium',
        actionable: true,
        suggestedActions: [
          'Review project planning process',
          'Build in buffer time for deliverables',
          'Improve time estimation skills'
        ],
        dataPoints: [`On-time delivery: ${metrics.onTimeDelivery}%`]
      });
    }

    if (metrics.repeatClientRate > 0.4) {
      insights.push({
        type: 'opportunity',
        title: 'Strong Client Relationships',
        description: 'High repeat client rate indicates strong relationships. Leverage this for growth.',
        impact: 'medium',
        actionable: true,
        suggestedActions: [
          'Ask for referrals from repeat clients',
          'Create a client loyalty program',
          'Increase rates for trusted clients'
        ],
        dataPoints: [`Repeat client rate: ${metrics.repeatClientRate * 100}%`]
      });
    }

    return insights;
  }

  generatePredictions(score: ReputationScore, trends: ReputationTrend[], metrics: PerformanceMetrics): ReputationPrediction[] {
    const predictions: ReputationPrediction[] = [];
    const categories: Array<keyof Omit<ReputationScore, 'lastUpdated'>> = [
      'overall', 'communication', 'qualityOfWork', 'timeliness', 'professionalism', 'reliability'
    ];

    categories.forEach(category => {
      const categoryTrends = trends.filter(t => t.category === category).slice(-6);
      if (categoryTrends.length < 3) return;

      const trendSlope = this.calculateTrendSlope(categoryTrends);
      const currentScore = score[category];
      const predictedScore = Math.max(0, Math.min(100, currentScore + (trendSlope * 30)));
      const confidence = this.calculatePredictionConfidence(categoryTrends);

      const factors = this.identifyPredictionFactors(category, metrics, trendSlope);

      predictions.push({
        category,
        currentScore,
        predictedScore,
        timeframe: 30,
        confidence,
        factors
      });
    });

    return predictions;
  }

  generateRecommendations(insights: ReputationInsight[], score: ReputationScore): ReputationRecommendation[] {
    const recommendations: ReputationRecommendation[] = [];

    if (score.communication < this.config.thresholds.good) {
      recommendations.push({
        id: 'improve-communication',
        type: 'behavior_change',
        priority: 'high',
        title: 'Improve Client Communication',
        description: 'Enhance your communication skills to build better client relationships and increase satisfaction.',
        estimatedImpact: 15,
        estimatedTimeToComplete: 14,
        steps: [
          'Set up automated response system',
          'Create communication templates',
          'Schedule weekly client updates',
          'Use project management tools'
        ],
        resources: [
          {
            type: 'course',
            title: 'Effective Client Communication',
            description: 'Learn professional communication strategies',
            estimatedTime: 480,
            cost: 99
          }
        ]
      });
    }

    if (score.qualityOfWork < this.config.thresholds.good) {
      recommendations.push({
        id: 'enhance-skills',
        type: 'skill_improvement',
        priority: 'high',
        title: 'Enhance Technical Skills',
        description: 'Invest in skill development to improve work quality and command higher rates.',
        estimatedImpact: 20,
        estimatedTimeToComplete: 30,
        steps: [
          'Identify skill gaps',
          'Enroll in relevant courses',
          'Practice with side projects',
          'Get certifications'
        ],
        resources: [
          {
            type: 'course',
            title: 'Advanced Development Techniques',
            description: 'Master modern development practices',
            estimatedTime: 1200,
            cost: 199
          }
        ]
      });
    }

    return recommendations;
  }

  private normalizeScore(score: number): number {
    return Math.max(0, Math.min(100, score));
  }

  private getDaysSinceLastActivity(events: ReputationEvent[]): number {
    if (events.length === 0) return 365;

    const lastEvent = events.reduce((latest, event) =>
      event.timestamp > latest.timestamp ? event : latest
    );

    return Math.floor((Date.now() - lastEvent.timestamp.getTime()) / (24 * 60 * 60 * 1000));
  }

  private calculatePercentileRank(value: number, sortedValues: number[]): number {
    const index = sortedValues.findIndex(v => v >= value);
    if (index === -1) return 100;
    return (index / sortedValues.length) * 100;
  }

  private calculateTrendSlope(trends: ReputationTrend[]): number {
    if (trends.length < 2) return 0;

    const changes = trends.map(t => t.change);
    return changes.reduce((sum, change) => sum + change, 0) / changes.length;
  }

  private calculatePredictionConfidence(trends: ReputationTrend[]): number {
    const variance = this.calculateVariance(trends.map(t => t.change));
    return Math.max(0.3, Math.min(0.9, 1 - (variance / 100)));
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  private identifyPredictionFactors(category: keyof ReputationScore, metrics: PerformanceMetrics, trendSlope: number): PredictionFactor[] {
    const factors: PredictionFactor[] = [];

    switch (category) {
      case 'communication':
        factors.push({
          name: 'Response Time',
          impact: metrics.averageResponseTime > 24 ? -5 : 5,
          trend: metrics.averageResponseTime > 24 ? 'negative' : 'positive',
          description: 'Average time to respond to client messages'
        });
        break;
      case 'qualityOfWork':
        factors.push({
          name: 'Client Ratings',
          impact: metrics.averageProjectRating * 2,
          trend: metrics.averageProjectRating > 4 ? 'positive' : 'negative',
          description: 'Average rating received from clients'
        });
        break;
      case 'timeliness':
        factors.push({
          name: 'On-Time Delivery',
          impact: (metrics.onTimeDelivery - 80) / 5,
          trend: metrics.onTimeDelivery > 80 ? 'positive' : 'negative',
          description: 'Percentage of projects delivered on time'
        });
        break;
    }

    return factors;
  }
}

export const reputationCalculator = new ReputationCalculator();