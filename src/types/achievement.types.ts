import type { ReactNode, CSSProperties } from 'react';

// Achievement Types
export type AchievementType = 
  | 'project_completion'
  | 'skill_mastery'
  | 'community_contribution'
  | 'rating_milestone'
  | 'earning_milestone'
  | 'platform_milestone'
  | 'special_event'
  | 'custom';

export type BadgeRarity = 
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

export type AchievementStatus = 
  | 'locked'
  | 'in_progress'
  | 'completed'
  | 'claimed';

export type ProgressType = 
  | 'counter'
  | 'percentage'
  | 'binary';

// Core Achievement Interface
export interface Achievement {
  id: string;
  name: string;
  description: string;
  detailedDescription?: string;
  type: AchievementType;
  category: string;
  rarity: BadgeRarity;
  icon: string | ReactNode;
  color: string;
  backgroundColor: string;
  borderColor?: string;
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
  isHidden: boolean;
  isRepeatable: boolean;
  cooldownHours?: number;
  prerequisites?: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

// Achievement Requirements
export interface AchievementRequirement {
  id: string;
  type: 'count' | 'value' | 'condition' | 'time_based';
  metric: string;
  target: number;
  current: number;
  unit?: string;
  description: string;
  isCompleted: boolean;
}

// Achievement Rewards
export interface AchievementReward {
  id: string;
  type: 'badge' | 'points' | 'discount' | 'feature_access' | 'nft' | 'custom';
  value: string | number;
  description: string;
  icon?: string;
  metadata?: Record<string, any>;
}

// User Achievement Progress
export interface UserAchievement {
  achievementId: string;
  status: AchievementStatus;
  progress: number;
  completedAt?: string;
  claimedAt?: string;
  progressDetails: AchievementProgressDetail[];
  streakCount?: number;
  lastProgressUpdate?: string;
}

// Progress Tracking Detail
export interface AchievementProgressDetail {
  requirementId: string;
  current: number;
  target: number;
  lastUpdated: string;
  isCompleted: boolean;
}

// Badge Display Configuration
export interface BadgeDisplayConfig {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showProgress: boolean;
  showRarity: boolean;
  showTooltip: boolean;
  showAnimation: boolean;
  customStyle?: CSSProperties;
}

// Achievement Analytics
export interface AchievementAnalytics {
  totalAchievements: number;
  completedAchievements: number;
  inProgressAchievements: number;
  lockedAchievements: number;
  totalPoints: number;
  averageCompletionTime: number;
  mostPopularCategory: string;
  recentAchievements: Achievement[];
  streakInfo: {
    current: number;
    longest: number;
    lastAchievementDate?: string;
  };
  categoryBreakdown: Record<string, {
    total: number;
    completed: number;
    percentage: number;
  }>;
}

// Achievement Notification
export interface AchievementNotification {
  id: string;
  type: 'achievement_unlocked' | 'achievement_completed' | 'milestone_reached' | 'badge_earned';
  achievementId: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// Achievement Leaderboard
export interface AchievementLeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  rank: number;
  totalAchievements: number;
  totalPoints: number;
  recentAchievements: string[];
  badgeCount: Record<BadgeRarity, number>;
}

// Badge Category
export interface BadgeCategory {
  id: string;
  name: string;
  description: string;
  icon: string | ReactNode;
  color: string;
  achievements: Achievement[];
  totalCount: number;
  completedCount: number;
}

// Achievement System Configuration
export interface AchievementSystemConfig {
  enableNotifications: boolean;
  enableLeaderboard: boolean;
  enableSharing: boolean;
  enableCustomBadges: boolean;
  maxCustomBadges: number;
  notificationDelay: number;
  leaderboardUpdateInterval: number;
  achievementVerificationRequired: boolean;
  socialSharingPlatforms: string[];
}

// Achievement Event Types
export interface AchievementEvent {
  type: 'achievement_unlocked' | 'achievement_completed' | 'milestone_reached' | 'badge_earned' | 'streak_updated';
  userId: string;
  achievementId?: string;
  data: Record<string, any>;
  timestamp: string;
}

// Achievement Verification
export interface AchievementVerification {
  achievementId: string;
  userId: string;
  verificationMethod: 'automatic' | 'manual' | 'community' | 'admin';
  verificationData: Record<string, any>;
  verifiedAt: string;
  verifiedBy?: string;
  isVerified: boolean;
}

// Achievement Sharing
export interface AchievementShare {
  achievementId: string;
  userId: string;
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'custom';
  shareUrl?: string;
  sharedAt: string;
  metadata?: Record<string, any>;
}

// Achievement Hook State
export interface AchievementSystemState {
  achievements: Achievement[];
  userAchievements: Record<string, UserAchievement>;
  categories: BadgeCategory[];
  analytics: AchievementAnalytics | null;
  notifications: AchievementNotification[];
  leaderboard: AchievementLeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string;
}

// Achievement Hook Actions
export interface AchievementSystemActions {
  loadAchievements: () => Promise<void>;
  loadUserAchievements: (userId: string) => Promise<void>;
  checkAchievements: (userId: string, eventData: Record<string, any>) => Promise<void>;
  claimAchievement: (achievementId: string, userId: string) => Promise<void>;
  shareAchievement: (achievementId: string, platform: string) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  updateUserProgress: (userId: string, metric: string, value: number) => Promise<void>;
  getAchievementProgress: (achievementId: string, userId: string) => Promise<UserAchievement | null>;
  refreshAnalytics: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
}
