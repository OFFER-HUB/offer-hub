import { 
  Achievement, 
  UserAchievement, 
  AchievementRequirement, 
  BadgeRarity, 
  AchievementType,
  AchievementAnalytics,
  AchievementProgressDetail,
  AchievementNotification,
  AchievementLeaderboardEntry,
  BadgeCategory,
  AchievementVerification,
  AchievementShare
} from '@/types/achievement.types';

// Achievement Verification Functions
export const verifyAchievementProgress = (
  achievement: Achievement,
  userProgress: Record<string, any>
): boolean => {
  return achievement.requirements.every(requirement => {
    const currentValue = userProgress[requirement.metric] || 0;
    return currentValue >= requirement.target;
  });
};

export const calculateAchievementProgress = (
  achievement: Achievement,
  userProgress: Record<string, any>
): number => {
  if (achievement.requirements.length === 0) return 0;
  
  const completedRequirements = achievement.requirements.filter(requirement => {
    const currentValue = userProgress[requirement.metric] || 0;
    return currentValue >= requirement.target;
  });
  
  return Math.round((completedRequirements.length / achievement.requirements.length) * 100);
};

export const getRequirementProgress = (
  requirement: AchievementRequirement,
  userProgress: Record<string, any>
): AchievementProgressDetail => {
  const current = userProgress[requirement.metric] || 0;
  const isCompleted = current >= requirement.target;
  
  return {
    requirementId: requirement.id,
    current,
    target: requirement.target,
    lastUpdated: new Date().toISOString(),
    isCompleted
  };
};

// Badge Rarity Utilities
export const getRarityColor = (rarity: BadgeRarity): string => {
  const colors = {
    common: '#6B7280',      // Gray
    uncommon: '#10B981',    // Green
    rare: '#3B82F6',        // Blue
    epic: '#8B5CF6',        // Purple
    legendary: '#F59E0B',   // Orange
    mythic: '#EF4444'       // Red
  };
  return colors[rarity];
};

export const getRarityGradient = (rarity: BadgeRarity): string => {
  const gradients = {
    common: 'linear-gradient(135deg, #6B7280, #9CA3AF)',
    uncommon: 'linear-gradient(135deg, #10B981, #34D399)',
    rare: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
    epic: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
    legendary: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
    mythic: 'linear-gradient(135deg, #EF4444, #F87171)'
  };
  return gradients[rarity];
};

export const getRarityIcon = (rarity: BadgeRarity): string => {
  const icons = {
    common: '★',
    uncommon: '✦',
    rare: '◆',
    epic: '♛',
    legendary: '⚡',
    mythic: '✧'
  };
  return icons[rarity];
};

// Achievement Category Utilities
export const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'Project Completion': '●',
    'Skill Mastery': '◆',
    'Community Contribution': '◈',
    'Rating Milestone': '★',
    'Earning Milestone': '$',
    'Platform Milestone': '▲',
    'Special Event': '✦',
    'Custom': '◉'
  };
  return icons[category] || '●';
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'Project Completion': '#3B82F6',
    'Skill Mastery': '#10B981',
    'Community Contribution': '#F59E0B',
    'Rating Milestone': '#8B5CF6',
    'Earning Milestone': '#EF4444',
    'Platform Milestone': '#06B6D4',
    'Special Event': '#EC4899',
    'Custom': '#6B7280'
  };
  return colors[category] || '#6B7280';
};

// Progress Calculation Utilities
export const formatProgressText = (
  current: number,
  target: number,
  unit?: string
): string => {
  const unitText = unit ? ` ${unit}` : '';
  return `${current}/${target}${unitText}`;
};

export const getProgressPercentage = (current: number, target: number): number => {
  if (target === 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
};

// Achievement Analytics Utilities
export const calculateUserAnalytics = (
  achievements: Achievement[],
  userAchievements: Record<string, UserAchievement>
): AchievementAnalytics => {
  const totalAchievements = achievements.length;
  const completedAchievements = Object.values(userAchievements).filter(
    ua => ua.status === 'completed'
  ).length;
  const inProgressAchievements = Object.values(userAchievements).filter(
    ua => ua.status === 'in_progress'
  ).length;
  const lockedAchievements = totalAchievements - completedAchievements - inProgressAchievements;

  const totalPoints = Object.values(userAchievements)
    .filter(ua => ua.status === 'completed')
    .reduce((sum, ua) => {
      const achievement = achievements.find(a => a.id === ua.achievementId);
      const points = achievement?.rewards.find(r => r.type === 'points')?.value as number || 0;
      return sum + points;
    }, 0);

  const recentAchievements = Object.values(userAchievements)
    .filter(ua => ua.status === 'completed' && ua.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 5)
    .map(ua => achievements.find(a => a.id === ua.achievementId)!)
    .filter(Boolean);

  const categoryBreakdown = achievements.reduce((acc, achievement) => {
    const category = achievement.category;
    if (!acc[category]) {
      acc[category] = { total: 0, completed: 0, percentage: 0 };
    }
    acc[category].total++;
    
    const userAchievement = userAchievements[achievement.id];
    if (userAchievement?.status === 'completed') {
      acc[category].completed++;
    }
    
    acc[category].percentage = Math.round(
      (acc[category].completed / acc[category].total) * 100
    );
    
    return acc;
  }, {} as Record<string, { total: number; completed: number; percentage: number }>);

  return {
    totalAchievements,
    completedAchievements,
    inProgressAchievements,
    lockedAchievements,
    totalPoints,
    averageCompletionTime: 0, // TODO: Calculate based on historical data
    mostPopularCategory: Object.entries(categoryBreakdown)
      .sort(([,a], [,b]) => b.completed - a.completed)[0]?.[0] || '',
    recentAchievements,
    streakInfo: {
      current: 0,
      longest: 0,
      lastAchievementDate: recentAchievements[0]?.createdAt
    },
    categoryBreakdown
  };
};

// Notification Utilities
export const createAchievementNotification = (
  achievement: Achievement,
  userId: string,
  type: AchievementNotification['type']
): AchievementNotification => {
  const messages = {
    achievement_unlocked: `New achievement unlocked: ${achievement.name}`,
    achievement_completed: `Congratulations! You've completed ${achievement.name}`,
    milestone_reached: `Milestone reached in ${achievement.name}`,
    badge_earned: `Badge earned: ${achievement.name}`
  };

  return {
    id: `notification_${Date.now()}_${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9)}`,
    type,
    achievementId: achievement.id,
    userId,
    title: achievement.name,
    message: messages[type],
    isRead: false,
    createdAt: new Date().toISOString(),
    actionUrl: `/achievements/${achievement.id}`,
    metadata: {
      rarity: achievement.rarity,
      category: achievement.category
    }
  };
};

// Leaderboard Utilities
export const calculateLeaderboardRank = (
  entries: AchievementLeaderboardEntry[]
): AchievementLeaderboardEntry[] => {
  return entries
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return b.totalAchievements - a.totalAchievements;
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
};

// Achievement Validation Utilities
export const validateAchievementData = (achievement: Partial<Achievement>): string[] => {
  const errors: string[] = [];

  if (!achievement.name || achievement.name.trim().length === 0) {
    errors.push('Achievement name is required');
  }

  if (!achievement.description || achievement.description.trim().length === 0) {
    errors.push('Achievement description is required');
  }

  if (!achievement.type) {
    errors.push('Achievement type is required');
  }

  if (!achievement.category || achievement.category.trim().length === 0) {
    errors.push('Achievement category is required');
  }

  if (!achievement.rarity) {
    errors.push('Achievement rarity is required');
  }

  if (!achievement.requirements || achievement.requirements.length === 0) {
    errors.push('At least one requirement is needed');
  }

  if (achievement.requirements) {
    achievement.requirements.forEach((req, index) => {
      if (!req.metric || req.metric.trim().length === 0) {
        errors.push(`Requirement ${index + 1}: metric is required`);
      }
      if (req.target <= 0) {
        errors.push(`Requirement ${index + 1}: target must be greater than 0`);
      }
    });
  }

  return errors;
};

// Achievement Sharing Utilities
export const generateShareUrl = (
  achievement: Achievement,
  platform: string,
  userId: string
): string => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://offerhub.com';
  const shareUrl = `${baseUrl}/achievements/${achievement.id}`;
  
  const shareTexts = {
    twitter: `Just earned the "${achievement.name}" badge on OfferHub! 🏆`,
    linkedin: `I'm proud to have earned the "${achievement.name}" achievement on OfferHub.`,
    facebook: `Check out my new achievement: ${achievement.name}!`,
    instagram: `New badge unlocked: ${achievement.name} ✨`,
    custom: `I've earned the "${achievement.name}" achievement!`
  };

  const text = encodeURIComponent(shareTexts[platform as keyof typeof shareTexts] || shareTexts.custom);
  
  const platformUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing
    custom: shareUrl
  };

  return platformUrls[platform as keyof typeof platformUrls] || shareUrl;
};

// Achievement Verification Utilities
export const createAchievementVerification = (
  achievementId: string,
  userId: string,
  method: AchievementVerification['verificationMethod'],
  data: Record<string, any>,
  verifiedBy?: string
): AchievementVerification => {
  return {
    achievementId,
    userId,
    verificationMethod: method,
    verificationData: data,
    verifiedAt: new Date().toISOString(),
    verifiedBy,
    isVerified: true
  };
};

// Achievement Filtering and Sorting Utilities
export const filterAchievementsByCategory = (
  achievements: Achievement[],
  category: string
): Achievement[] => {
  return achievements.filter(achievement => achievement.category === category);
};

export const filterAchievementsByRarity = (
  achievements: Achievement[],
  rarity: BadgeRarity
): Achievement[] => {
  return achievements.filter(achievement => achievement.rarity === rarity);
};

export const filterAchievementsByType = (
  achievements: Achievement[],
  type: AchievementType
): Achievement[] => {
  return achievements.filter(achievement => achievement.type === type);
};

export const sortAchievementsByRarity = (achievements: Achievement[]): Achievement[] => {
  const rarityOrder = ['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
  return achievements.sort((a, b) => {
    const aIndex = rarityOrder.indexOf(a.rarity);
    const bIndex = rarityOrder.indexOf(b.rarity);
    return aIndex - bIndex;
  });
};

export const sortAchievementsByProgress = (
  achievements: Achievement[],
  userAchievements: Record<string, UserAchievement>
): Achievement[] => {
  return achievements.sort((a, b) => {
    const aProgress = userAchievements[a.id]?.progress || 0;
    const bProgress = userAchievements[b.id]?.progress || 0;
    return bProgress - aProgress;
  });
};

// Achievement Status Utilities
export const getAchievementStatusColor = (status: string): string => {
  const colors = {
    locked: '#6B7280',
    in_progress: '#F59E0B',
    completed: '#10B981',
    claimed: '#3B82F6'
  };
  return colors[status as keyof typeof colors] || '#6B7280';
};

export const getAchievementStatusIcon = (status: string): string => {
  const icons = {
    locked: '🔒',
    in_progress: '⏳',
    completed: '✓',
    claimed: '★'
  };
  return icons[status as keyof typeof icons] || '?';
};

// Achievement Badge Generation Utilities
export const generateBadgeId = (): string => {
  return `badge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateAchievementId = (): string => {
  return `achievement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Achievement Cache Utilities
export const shouldRefreshAchievements = (lastUpdated: string, maxAgeMinutes: number = 5): boolean => {
  const lastUpdate = new Date(lastUpdated);
  const now = new Date();
  const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
  return diffMinutes > maxAgeMinutes;
};

// Achievement Export Utilities
export const exportUserAchievements = (userAchievements: Record<string, UserAchievement>): string => {
  const exportData = {
    exportedAt: new Date().toISOString(),
    achievements: Object.values(userAchievements)
  };
  return JSON.stringify(exportData, null, 2);
};

