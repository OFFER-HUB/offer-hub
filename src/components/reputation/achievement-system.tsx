'use client';

import React, { useState, useEffect } from 'react';
import { useAchievementSystem } from '@/hooks/use-achievement-system';
import { Achievement } from '@/types/achievement.types';
import { BadgeCategories, CategoryFilter, CategoryStats } from './badge-categories';
import { BadgeDisplay, BadgeGrid, BadgeCollection } from './badge-display';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Search, 
   Grid, 
  List, 
  RefreshCw,
  Target,
  Bell,
  PieChart,
  Zap,
  Activity,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementSystemProps {
  userId?: string;
  initialTab?: string;
  className?: string;
}

export const AchievementSystem: React.FC<AchievementSystemProps> = ({
  userId,
  initialTab = 'overview',
  className
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [filterRarity, setFilterRarity] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const {
    achievements,
    userAchievements,
    categories,
    analytics,
    notifications,
    leaderboard,
    isLoading,
    error,
    loadAchievements,
    loadUserAchievements,
    checkAchievements,
    claimAchievement,
    shareAchievement,
    markNotificationRead,
    updateUserProgress,
    refreshAnalytics,
    refreshLeaderboard,
    filteredAchievements
  } = useAchievementSystem(userId);

  const recentAchievements = React.useMemo(() => 
    Object.values(userAchievements)
      .filter(ua => ua.status === 'completed' || ua.status === 'claimed')
      .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
      .slice(0, 5),
    [userAchievements]
  );

  const inProgressAchievements = React.useMemo(() => 
    Object.values(userAchievements)
      .filter(ua => ua.status === 'in_progress')
      .sort((a, b) => b.progress - a.progress),
    [userAchievements]
  );

  const upcomingAchievements = React.useMemo(() => 
    Object.values(userAchievements)
      .filter(ua => ua.status === 'in_progress' && ua.progress > 50)
      .sort((a, b) => b.progress - a.progress),
    [userAchievements]
  );

  // Filter achievements based on search and filters
  const localFilteredAchievements = React.useMemo(() => {
    let filtered = achievements;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(achievement =>
        achievement.name.toLowerCase().includes(query) ||
        achievement.description.toLowerCase().includes(query) ||
        achievement.category.toLowerCase().includes(query) ||
        achievement.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Rarity filter
    if (filterRarity) {
      filtered = filtered.filter(achievement => achievement.rarity === filterRarity);
    }

    // Status filter
    if (filterStatus && userId) {
      filtered = filtered.filter(achievement => {
        const userAchievement = userAchievements[achievement.id];
        const status = userAchievement?.status || 'locked';
        return status === filterStatus;
      });
    }

    return filtered;
  }, [
    achievements,
    searchQuery,
    filterRarity,
    filterStatus,
    userAchievements,
    userId
  ]);

  // Handle achievement selection
  const handleAchievementSelect = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
  };

  // Handle achievement sharing
  const handleShare = async (achievement: Achievement, platform: string) => {
    await shareAchievement(achievement.id, platform);
  };

  // Handle achievement claiming
  const handleClaim = async (achievementId: string) => {
    if (userId) {
      await claimAchievement(achievementId, userId);
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  // Refresh data
  const handleRefresh = async () => {
    await Promise.all([
      loadAchievements(),
      userId ? loadUserAchievements(userId) : Promise.resolve(),
      refreshAnalytics(),
      refreshLeaderboard()
    ]);
  };

  // Auto-refresh notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (userId) {
        loadUserAchievements(userId);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [userId, loadUserAchievements]);

  if (isLoading && achievements.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading achievement system...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="text-red-500 mb-4">
          <Trophy className="w-12 h-12 mx-auto mb-2" />
          <h3 className="text-lg font-medium">Error Loading Achievements</h3>
          <p className="text-sm mt-2">{error}</p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          {(
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
              <Badge variant="destructive" className="ml-2 text-xs">
                {notifications.filter(n => !n.isRead).length}
              </Badge>
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {analytics && (
        <CategoryStats 
          categories={categories}
          userAchievements={userAchievements}
        />
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="collection">Collection</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Recent Achievements</span>
                </CardTitle>
                <CardDescription>Your latest accomplishments</CardDescription>
              </CardHeader>
              <CardContent>
                {recentAchievements.length > 0 ? (
                  recentAchievements.map((userAchievement) => {
                    const achievement = achievements.find(a => a.id === userAchievement.achievementId);
                    if (!achievement) return null;

                    return (
                      <div key={userAchievement.achievementId} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg mb-2">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium">{achievement.name}</div>
                          <div className="text-sm text-gray-600">{achievement.category}</div>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-300">
                          Completed
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Trophy className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No achievements completed yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* In Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>In Progress</span>
                </CardTitle>
                <CardDescription>Achievements you're working towards</CardDescription>
              </CardHeader>
              <CardContent>
                {inProgressAchievements.length > 0 ? (
                  inProgressAchievements.slice(0,5).map((userAchievement) => {
                    const achievement = achievements.find(a => a.id === userAchievement.achievementId);
                    if (!achievement) return null;

                    return (
                      <div key={userAchievement.achievementId} className="space-y-2 mb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="text-lg">{achievement.icon}</div>
                            <span className="font-medium text-sm">{achievement.name}</span>
                          </div>
                          <span className="text-sm font-medium">{userAchievement.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${userAchievement.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No achievements in progress</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Almost There */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Almost There</span>
              </CardTitle>
              <CardDescription>Achievements you're close to completing</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAchievements.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAchievements.map((ua) => {
                    const achievement = achievements.find(a => a.id === ua.achievementId);
                    if (!achievement) return null;
                    return (
                      <div key={ua.achievementId} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-xl">{achievement.icon}</div>
                            <div className="font-medium text-sm">{achievement.name}</div>
                          </div>
                          <Badge variant="outline" className="text-orange-600 border-orange-300">{ua.progress}%</Badge>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${ua.progress}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Zap className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No achievements close to completion</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="w-5 h-5" />
                  <span>Category Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(analytics.categoryBreakdown).map(([category, stats]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category}</span>
                        <span className="text-sm text-gray-600">{stats.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stats.percentage}%` }} />
                      </div>
                      <div className="text-xs text-gray-500">{stats.completed} of {stats.total} completed</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search achievements..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={filterRarity || ''}
                    onChange={(e) => setFilterRarity(e.target.value || null)}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="" className='mr-2 '>All Rarities</option>
                    <option value="common">Common</option>
                    <option value="uncommon">Uncommon</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                    <option value="mythic">Mythic</option>
                  </select>
                  
                  {userId && (
                    <select
                      value={filterStatus || ''}
                      onChange={(e) => setFilterStatus(e.target.value || null)}
                      className="px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="locked">Locked</option>
                    </select>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-full"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  >
                    {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievement Display */}
          {localFilteredAchievements.length > 0 ? (
            viewMode === 'grid' ? (
              <BadgeGrid
                achievements={localFilteredAchievements}
                userAchievements={userAchievements}
                onAchievementSelect={handleAchievementSelect}
                onShare={handleShare}
                onClaim={handleClaim}
                config={{ size: 'md', showProgress: true, showRarity: true }}
              />
            ) : (
              <div className="space-y-2">
                {localFilteredAchievements.map((achievement) => (
                  <Card key={achievement.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div>
                          <div className="font-medium text-sm">{achievement.name}</div>
                          <div className="text-xs text-gray-500">{achievement.description}</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleAchievementSelect(achievement)}>
                        View
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <Card className="p-8 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No Achievements Found</h3>
              <p className="text-sm text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <BadgeCategories
            categories={categories}
            userAchievements={userAchievements}
            onCategorySelect={handleCategorySelect}
            onAchievementSelect={handleAchievementSelect}
            selectedCategory={selectedCategory || undefined}
          />
        </TabsContent>



        {/* Collection Tab */}
        <TabsContent value="collection" className="space-y-4">
          <BadgeCollection
            userAchievements={userAchievements}
            achievements={achievements}
          />
          
          {/* Detailed Badge Collection */}
          <Card>
            <CardHeader>
              <CardTitle>Your Badge Collection</CardTitle>
              <CardDescription>All achievements you've earned</CardDescription>
            </CardHeader>
            <CardContent>
              <BadgeGrid
                achievements={achievements}
                userAchievements={userAchievements}
                onAchievementSelect={handleAchievementSelect}
                onShare={handleShare}
                onClaim={handleClaim}
                config={{ size: 'lg', showProgress: false, showRarity: true }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Achievement Modal/Details */}
      {selectedAchievement && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Achievement Details</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAchievement(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BadgeDisplay
              achievement={selectedAchievement}
              userAchievement={userAchievements[selectedAchievement.id]}
              config={{ size: 'xl', showProgress: true, showRarity: true, showTooltip: false }}
              onShare={handleShare}
              onClaim={handleClaim}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AchievementSystem;

