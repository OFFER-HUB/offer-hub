/**
 * @fileoverview TypeScript interfaces for reputation analytics system
 * @author OnlyDust Platform
 * @license MIT
 */

export interface ReputationScore {
  overall: number;
  communication: number;
  qualityOfWork: number;
  timeliness: number;
  professionalism: number;
  reliability: number;
  lastUpdated: Date;
}

export interface PerformanceMetrics {
  completionRate: number;
  averageResponseTime: number;
  projectsCompleted: number;
  onTimeDelivery: number;
  clientSatisfactionScore: number;
  repeatClientRate: number;
  averageProjectRating: number;
  disputeRate: number;
  refundRate: number;
  qualityScore: number;
}

export interface ReputationTrend {
  date: Date;
  score: number;
  category: keyof ReputationScore;
  change: number;
  events: ReputationEvent[];
}

export interface ReputationEvent {
  type: 'project_completion' | 'client_review' | 'dispute' | 'milestone' | 'communication';
  impact: number;
  description: string;
  timestamp: Date;
  projectId?: string;
  clientId?: string;
}

export interface BenchmarkData {
  userScore: number;
  platformAverage: number;
  industryAverage: number;
  topPercentile: number;
  percentileRank: number;
  category: string;
}

export interface ReputationCategory {
  id: string;
  name: string;
  weight: number;
  description: string;
  skills: string[];
  score: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export interface ExportFormat {
  format: 'pdf' | 'json' | 'csv' | 'linkedin' | 'portfolio';
  data: ReputationExportData;
  generatedAt: Date;
  validUntil?: Date;
}

export interface ReputationExportData {
  userInfo: {
    id: string;
    username: string;
    name?: string;
    profilePicture?: string;
  };
  overallScore: ReputationScore;
  metrics: PerformanceMetrics;
  categories: ReputationCategory[];
  achievements: Achievement[];
  certifications: Certification[];
  recentProjects: ProjectSummary[];
  testimonials: Testimonial[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issuedAt: Date;
  expiresAt?: Date;
  verificationUrl?: string;
  credentialId?: string;
}

export interface ProjectSummary {
  id: string;
  title: string;
  description: string;
  completedAt: Date;
  rating: number;
  skills: string[];
  budget: number;
  duration: number;
  clientFeedback?: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  clientAvatar?: string;
  projectTitle: string;
  rating: number;
  comment: string;
  createdAt: Date;
  isVerified: boolean;
}

export interface ReputationAnalytics {
  userId: string;
  score: ReputationScore;
  metrics: PerformanceMetrics;
  trends: ReputationTrend[];
  benchmarks: BenchmarkData[];
  categories: ReputationCategory[];
  achievements: Achievement[];
  insights: ReputationInsight[];
  predictions: ReputationPrediction[];
  recommendations: ReputationRecommendation[];
}

export interface ReputationInsight {
  type: 'strength' | 'weakness' | 'opportunity' | 'risk';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  suggestedActions?: string[];
  dataPoints: string[];
}

export interface ReputationPrediction {
  category: keyof ReputationScore;
  currentScore: number;
  predictedScore: number;
  timeframe: number;
  confidence: number;
  factors: PredictionFactor[];
}

export interface PredictionFactor {
  name: string;
  impact: number;
  trend: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface ReputationRecommendation {
  id: string;
  type: 'skill_improvement' | 'behavior_change' | 'platform_engagement' | 'portfolio_enhancement';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  estimatedImpact: number;
  estimatedTimeToComplete: number;
  steps: string[];
  resources: RecommendationResource[];
}

export interface RecommendationResource {
  type: 'course' | 'article' | 'tool' | 'community' | 'mentor';
  title: string;
  url?: string;
  description: string;
  estimatedTime?: number;
  cost?: number;
}

export interface ReputationConfig {
  weightings: {
    communication: number;
    qualityOfWork: number;
    timeliness: number;
    professionalism: number;
    reliability: number;
  };
  thresholds: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
  decayFactors: {
    timeDecay: number;
    activityBonus: number;
    consistencyBonus: number;
  };
  gamification: {
    enabled: boolean;
    achievementPoints: number;
    levelThresholds: number[];
    badges: BadgeConfig[];
  };
}

export interface BadgeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: BadgeCriteria;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

export interface BadgeCriteria {
  type: 'score_threshold' | 'streak' | 'milestone' | 'special_event';
  value: number;
  category?: keyof ReputationScore;
  timeframe?: number;
}

export interface ReputationApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: Date;
  version: string;
}

export interface ReputationError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  retryable: boolean;
}

export interface ReputationFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
  minScore?: number;
  maxScore?: number;
  includeInactive?: boolean;
  sortBy?: 'score' | 'date' | 'impact' | 'category';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface MobileReputationView {
  isMobile: boolean;
  condensedMetrics: Partial<PerformanceMetrics>;
  keyInsights: ReputationInsight[];
  quickActions: QuickAction[];
  notifications: ReputationNotification[];
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  priority: number;
}

export interface ReputationNotification {
  id: string;
  type: 'score_change' | 'achievement' | 'recommendation' | 'milestone';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: any;
}

export interface ExternalPlatformIntegration {
  platform: 'linkedin' | 'github' | 'stackoverflow' | 'behance' | 'dribbble';
  connected: boolean;
  lastSync?: Date;
  syncEnabled: boolean;
  dataMapping: Record<string, string>;
  permissions: string[];
}

export interface PrivacySettings {
  publicProfile: boolean;
  shareWithClients: boolean;
  allowExport: boolean;
  dataRetentionDays: number;
  anonymizeData: boolean;
  consentGiven: boolean;
  consentDate: Date;
}

export interface ReputationAuditLog {
  id: string;
  userId: string;
  action: string;
  details: any;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  source: 'user' | 'system' | 'admin' | 'api';
}