import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Achievement,
  UserAchievement,
  AchievementSystemState,
  AchievementSystemActions,
  AchievementAnalytics,
  AchievementNotification,
  AchievementLeaderboardEntry,
  BadgeCategory,
  AchievementProgressDetail,
  AchievementEvent,
  AchievementVerification,
  AchievementShare
} from '@/types/achievement.types';
import {
  calculateUserAnalytics,
  verifyAchievementProgress,
  calculateAchievementProgress,
  getRequirementProgress,
  createAchievementNotification,
  calculateLeaderboardRank,
  validateAchievementData,
  generateShareUrl,
  createAchievementVerification,
  shouldRefreshAchievements,
  filterAchievementsByCategory,
  filterAchievementsByRarity,
  filterAchievementsByType,
  sortAchievementsByRarity,
  sortAchievementsByProgress
} from '@/utils/achievement-helpers';

// Mock data for development - replace with actual API calls
const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_project',
    name: 'First Project',
    description: 'Complete your first project',
    type: 'project_completion',
    category: 'Project Completion',
    rarity: 'common',
    icon: '/badge/badge-batman.png',
    color: '#3B82F6',
    backgroundColor: '#EFF6FF',
    requirements: [
      {
        id: 'complete_project',
        type: 'count',
        metric: 'projects_completed',
        target: 1,
        current: 0,
        description: 'Complete 1 project',
        isCompleted: false
      }
    ],
    rewards: [
      {
        id: 'points_reward',
        type: 'points',
        value: 100,
        description: '100 points'
      }
    ],
    isHidden: false,
    isRepeatable: false,
    tags: ['beginner', 'milestone'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'five_star_rating',
    name: 'Five Star Performer',
    description: 'Achieve a 5-star rating',
    type: 'rating_milestone',
    category: 'Rating Milestone',
    rarity: 'rare',
    icon: '/badge/badge-vip.png',
    color: '#F59E0B',
    backgroundColor: '#FFFBEB',
    requirements: [
      {
        id: 'five_star_requirement',
        type: 'value',
        metric: 'average_rating',
        target: 5,
        current: 0,
        unit: 'stars',
        description: 'Maintain 5-star average rating',
        isCompleted: false
      }
    ],
    rewards: [
      {
        id: 'badge_reward',
        type: 'badge',
        value: 'five_star_badge',
        description: 'Five Star Badge'
      },
      {
        id: 'points_reward',
        type: 'points',
        value: 500,
        description: '500 points'
      }
    ],
    isHidden: false,
    isRepeatable: false,
    tags: ['excellence', 'rating'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'community_helper',
    name: 'Community Helper',
    description: 'Help 10 community members',
    type: 'community_contribution',
    category: 'Community Contribution',
    rarity: 'uncommon',
    icon: '/badge/badge-child.png',
    color: '#10B981',
    backgroundColor: '#ECFDF5',
    requirements: [
      {
        id: 'help_members',
        type: 'count',
        metric: 'community_helps',
        target: 10,
        current: 0,
        description: 'Help 10 community members',
        isCompleted: false
      }
    ],
    rewards: [
      {
        id: 'points_reward',
        type: 'points',
        value: 300,
        description: '300 points'
      }
    ],
    isHidden: false,
    isRepeatable: false,
    tags: ['community', 'helping'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const useAchievementSystem = (userId?: string) => {
  const [state, setState] = useState<AchievementSystemState>({
    achievements: [],
    userAchievements: {},
    categories: [],
    analytics: null,
    notifications: [],
    leaderboard: [],
    isLoading: true,
    error: null,
    lastUpdated: new Date().toISOString()
  });

  // Fetch helper with timeout and JSON parsing
  const fetchJson = useCallback(async (url: string, init?: RequestInit, timeoutMs: number = 5000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }, []);

  // Load achievements from API
  const loadAchievements = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Replace with actual API call if available
      let achievements: Achievement[] = [];
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || '';
        achievements = await fetchJson(`${base}/api/achievements`, { cache: 'no-store' });
      } catch {
        achievements = MOCK_ACHIEVEMENTS;
      }
      
      const categories = groupAchievementsByCategory(achievements);
      
      setState(prev => {
        // Initialize user achievement entries for consistency across tabs
        const initializedUserAchievements: Record<string, UserAchievement> = { ...prev.userAchievements };
        for (const a of achievements) {
          if (!initializedUserAchievements[a.id]) {
            initializedUserAchievements[a.id] = {
              achievementId: a.id,
              status: 'locked',
              progress: 0,
              progressDetails: a.requirements.map(req => ({
                requirementId: req.id,
                current: 0,
                target: req.target,
                lastUpdated: new Date().toISOString(),
                isCompleted: false
              })),
              lastProgressUpdate: new Date().toISOString()
            };
          }
        }

        return {
          ...prev,
          achievements,
          categories,
          userAchievements: initializedUserAchievements,
          isLoading: false,
          lastUpdated: new Date().toISOString()
        };
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load achievements',
        isLoading: false
      }));
    }
  }, []);

  // Load user achievements
  const loadUserAchievements = useCallback(async (targetUserId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      let apiUserAchievements: Record<string, UserAchievement> = {};
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || '';
        apiUserAchievements = await fetchJson(`${base}/api/users/${targetUserId}/achievements`, { cache: 'no-store' });
      } catch {
        apiUserAchievements = {};
      }

      setState(prev => {
        // If API returns none, initialize entries for all known achievements to maintain UI consistency
        const merged: Record<string, UserAchievement> = { ...apiUserAchievements };
        for (const a of prev.achievements) {
          if (!merged[a.id]) {
            merged[a.id] = prev.userAchievements[a.id] || {
              achievementId: a.id,
              status: 'locked',
              progress: 0,
              progressDetails: a.requirements.map(req => ({
                requirementId: req.id,
                current: 0,
                target: req.target,
                lastUpdated: new Date().toISOString(),
                isCompleted: false
              })),
              lastProgressUpdate: new Date().toISOString()
            };
          }
        }

        return {
          ...prev,
          userAchievements: merged,
          isLoading: false,
          lastUpdated: new Date().toISOString()
        };
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load user achievements',
        isLoading: false
      }));
    }
  }, []);

  // Check achievements based on event data
  const checkAchievements = useCallback(async (
    targetUserId: string,
    eventData: Record<string, any>
  ) => {
    try {
      setState(prev => {
        const { achievements, userAchievements } = prev;
        const updatedUserAchievements: Record<string, UserAchievement> = { ...userAchievements };
        const newNotifications: AchievementNotification[] = [];

        for (const achievement of achievements) {
          if (updatedUserAchievements[achievement.id]?.status === 'completed') {
            continue;
          }

          const isCompleted = verifyAchievementProgress(achievement, eventData);
          const progress = calculateAchievementProgress(achievement, eventData);

          if (!updatedUserAchievements[achievement.id]) {
            updatedUserAchievements[achievement.id] = {
              achievementId: achievement.id,
              status: isCompleted ? 'completed' : 'in_progress',
              progress,
              progressDetails: achievement.requirements.map(req =>
                getRequirementProgress(req, eventData)
              ),
              lastProgressUpdate: new Date().toISOString()
            };
          } else {
            const currentUA = updatedUserAchievements[achievement.id];
            updatedUserAchievements[achievement.id] = {
              ...currentUA,
              progress,
              status: isCompleted ? 'completed' : 'in_progress',
              completedAt:
                isCompleted && !currentUA.completedAt ? new Date().toISOString() : currentUA.completedAt,
              progressDetails: achievement.requirements.map(req =>
                getRequirementProgress(req, eventData)
              ),
              lastProgressUpdate: new Date().toISOString()
            };
          }

          if (isCompleted && !userAchievements[achievement.id]?.completedAt) {
            const notification = createAchievementNotification(
              achievement,
              targetUserId,
              'achievement_completed'
            );
            newNotifications.push(notification);
          }
        }

        return {
          ...prev,
          userAchievements: updatedUserAchievements,
          notifications: [...prev.notifications, ...newNotifications],
          lastUpdated: new Date().toISOString()
        };
      });

      // TODO: optionally persist progress via API
      // await fetch(`/api/users/${targetUserId}/achievements/progress`, { ... })
    } catch (error) {
      console.error('Error checking achievements:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to check achievements'
      }));
    }
  }, []);

  // Claim achievement
  const claimAchievement = useCallback(async (achievementId: string, targetUserId: string) => {
    try {
      const { userAchievements } = state;
      const userAchievement = userAchievements[achievementId];

      if (!userAchievement || userAchievement.status !== 'completed') {
        throw new Error('Achievement not completed or not found');
      }

      // Update user achievement status
      const updatedUserAchievements = {
        ...userAchievements,
        [achievementId]: {
          ...userAchievement,
          status: 'claimed' as const,
          claimedAt: new Date().toISOString()
        }
      };

      setState(prev => ({
        ...prev,
        userAchievements: updatedUserAchievements,
        lastUpdated: new Date().toISOString()
      }));

      try {
        const base = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || '';
        await fetch(`${base}/api/users/${targetUserId}/achievements/${achievementId}/claim`, { method: 'POST' });
      } catch {}

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to claim achievement'
      }));
    }
  }, [state.userAchievements]);

  // Share achievement
  const shareAchievement = useCallback(async (achievementId: string, platform: string) => {
    try {
      const { achievements } = state;
      const achievement = achievements.find(a => a.id === achievementId);

      if (!achievement || !userId) {
        throw new Error('Achievement or user not found');
      }

      const shareUrl = generateShareUrl(achievement, platform, userId);
      
      // Open sharing URL
      if (platform !== 'custom') {
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
      }

      try {
        const base = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || '';
        await fetch(`${base}/api/achievements/share`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ achievementId, userId, platform, shareUrl })
        });
      } catch {}

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to share achievement'
      }));
    }
  }, [state.achievements, userId]);

  // Mark notification as read
  const markNotificationRead = useCallback(async (notificationId: string) => {
    try {
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        ),
        lastUpdated: new Date().toISOString()
      }));
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || '';
        await fetch(`${base}/api/notifications/${notificationId}/read`, { method: 'PATCH' });
      } catch {}

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to mark notification as read'
      }));
    }
  }, []);

  // Update user progress
  const updateUserProgress = useCallback(async (targetUserId: string, metric: string, value: number) => {
    try {
      await checkAchievements(targetUserId, { [metric]: value });
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || '';
        await fetch(`${base}/api/users/${targetUserId}/achievements/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metric, value })
        });
      } catch {}
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update user progress'
      }));
    }
  }, [checkAchievements]);

  // Get achievement progress
  const getAchievementProgress = useCallback(async (achievementId: string, userId: string) => {
    return Promise.resolve(state.userAchievements[achievementId] || null);
  }, [state.userAchievements]);

  // Refresh analytics
  const refreshAnalytics = useCallback(async () => {
    try {
      let analytics: AchievementAnalytics | null = null;
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || '';
        analytics = await fetchJson(`${base}/api/users/${userId}/achievements/analytics`, { cache: 'no-store' });
      } catch {}
      if (!analytics) {
        analytics = calculateUserAnalytics(state.achievements, state.userAchievements);
      }
      setState(prev => ({
        ...prev,
        analytics,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh analytics'
      }));
    }
  }, [state.achievements, state.userAchievements]);

  // Refresh leaderboard
  const refreshLeaderboard = useCallback(async () => {
    try {
      let leaderboard: AchievementLeaderboardEntry[] = [];
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || '';
        leaderboard = await fetchJson(`${base}/api/achievements/leaderboard`, { cache: 'no-store' });
      } catch {}
      const rankedLeaderboard = calculateLeaderboardRank(leaderboard || []);
      
      setState(prev => ({
        ...prev,
        leaderboard: rankedLeaderboard,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh leaderboard'
      }));
    }
  }, []);

  // Helper function to group achievements by category
  const groupAchievementsByCategory = useCallback((achievements: Achievement[]): BadgeCategory[] => {
    const categoryMap = new Map<string, Achievement[]>();
    
    achievements.forEach(achievement => {
      if (!categoryMap.has(achievement.category)) {
        categoryMap.set(achievement.category, []);
      }
      categoryMap.get(achievement.category)!.push(achievement);
    });

    return Array.from(categoryMap.entries()).map(([categoryName, categoryAchievements]) => ({
      id: categoryName.toLowerCase().replace(/\s+/g, '_'),
      name: categoryName,
      description: `Achievements related to ${categoryName.toLowerCase()}`,
      icon: categoryAchievements[0]?.icon || '●',
      color: categoryAchievements[0]?.color || '#6B7280',
      achievements: categoryAchievements,
      totalCount: categoryAchievements.length,
      completedCount: 0 // Will be calculated based on user achievements
    }));
  }, []);

  // Memoized filtered and sorted achievements
  const filteredAchievements = useMemo(() => {
    return {
      byCategory: (category: string) => filterAchievementsByCategory(state.achievements, category),
      byRarity: (rarity: string) => filterAchievementsByRarity(state.achievements, rarity as any),
      byType: (type: string) => filterAchievementsByType(state.achievements, type as any),
      byRaritySorted: () => sortAchievementsByRarity(state.achievements),
      byProgressSorted: () => sortAchievementsByProgress(state.achievements, state.userAchievements)
    };
  }, [state.achievements, state.userAchievements]);

  // Actions object
  const actions: AchievementSystemActions = {
    loadAchievements,
    loadUserAchievements,
    checkAchievements,
    claimAchievement,
    shareAchievement,
    markNotificationRead,
    updateUserProgress,
    getAchievementProgress,
    refreshAnalytics,
    refreshLeaderboard
  };

  // Load data on mount
  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  useEffect(() => {
    if (userId) {
      loadUserAchievements(userId);
    }
  }, [userId, loadUserAchievements]);

  // Refresh analytics when achievements or user achievements change
  useEffect(() => {
    if (state.achievements.length > 0 && Object.keys(state.userAchievements).length > 0) {
      refreshAnalytics();
    }
  }, [state.achievements, state.userAchievements]);

  return {
    ...state,
    ...actions,
    filteredAchievements
  };
};
