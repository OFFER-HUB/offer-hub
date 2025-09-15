'use client';
import React, { useState, useMemo } from 'react';
import { 
  Achievement, 
  UserAchievement, 
  AchievementAnalytics, 
  AchievementNotification,
  AchievementLeaderboardEntry
} from '@/types/achievement.types';
import {  
  formatProgressText,
  getRarityColor,
  getCategoryColor
} from '@/utils/achievement-helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  Clock, 
  Star, 
  Users, 
  Calendar,
  Bell,
  BellOff,
  Download,
  Share2,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Zap,
  CheckCircle,
  Circle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementTrackingProps {
  achievements: Achievement[];
  userAchievements: Record<string, UserAchievement>;
  analytics: AchievementAnalytics | null;
  notifications: AchievementNotification[];
  leaderboard: AchievementLeaderboardEntry[];
  onMarkNotificationRead: (notificationId: string) => void;
  onUpdateProgress?: (metric: string, value: number) => void;
  className?: string;
}

export const AchievementTracking: React.FC<AchievementTrackingProps> = ({
  achievements,
  userAchievements,
  analytics,
  notifications,
  leaderboard,
  onMarkNotificationRead,
  onUpdateProgress,
  className
}) => {
  const [activeTab, setActiveTab] = useState('overview');


  const recentAchievements = useMemo(() => 
    Object.values(userAchievements)
      .filter(ua => ua.status === 'completed' || ua.status === 'claimed')
      .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
      .slice(0, 5),
    [userAchievements]
  );

  const inProgressAchievements = useMemo(() => 
    Object.values(userAchievements)
      .filter(ua => ua.status === 'in_progress')
      .sort((a, b) => b.progress - a.progress),
    [userAchievements]
  );

  const upcomingAchievements = useMemo(() => 
    Object.values(userAchievements)
      .filter(ua => ua.status === 'in_progress' && ua.progress > 50)
      .sort((a, b) => b.progress - a.progress),
    [userAchievements]
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Achievement Tracking</h2>
          <p className="text-gray-600">Monitor your progress and celebrate your accomplishments</p>
        </div>
      </div>

      {/* Quick Stats */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics.totalAchievements}</div>
              <div className="text-sm text-gray-600">Total Available</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{analytics.completedAchievements}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{analytics.inProgressAchievements}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{analytics.totalPoints}</div>
              <div className="text-sm text-gray-600">Total Points</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
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
                      <Progress value={stats.percentage} className="h-2" />
                      <div className="text-xs text-gray-500">
                        {stats.completed} of {stats.total} completed
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4">
            {/* Upcoming Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Almost There!</span>
                </CardTitle>
                <CardDescription>Achievements you're close to completing</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingAchievements.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAchievements.map((userAchievement) => {
                      const achievement = achievements.find(a => a.id === userAchievement.achievementId);
                      if (!achievement) return null;

                      return (
                        <div key={userAchievement.achievementId} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">{achievement.icon}</div>
                              <div>
                                <div className="font-medium">{achievement.name}</div>
                                <div className="text-sm text-gray-600">{achievement.description}</div>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-orange-600 border-orange-300">
                              {userAchievement.progress}% Complete
                            </Badge>
                          </div>
                          
                          <Progress value={userAchievement.progress} className="h-3 mb-3" />
                          
                          {userAchievement.progressDetails && (
                            <div className="space-y-1 text-sm">
                              {userAchievement.progressDetails.map((detail, index) => {
                                const requirement = achievement.requirements[index];
                                if (!requirement) return null;

                                return (
                                  <div key={detail.requirementId} className="flex justify-between">
                                    <span className="text-gray-600">{requirement.description}</span>
                                    <span className={cn(
                                      'font-medium',
                                      detail.isCompleted ? 'text-green-600' : 'text-gray-900'
                                    )}>
                                      {formatProgressText(detail.current, detail.target, requirement.unit)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
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

            {/* All In Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>All In Progress</span>
                </CardTitle>
                <CardDescription>All achievements you're working on</CardDescription>
              </CardHeader>
              <CardContent>
                {inProgressAchievements.length > 0 ? (
                  <div className="space-y-3">
                    {inProgressAchievements.map((userAchievement) => {
                      const achievement = achievements.find(a => a.id === userAchievement.achievementId);
                      if (!achievement) return null;

                      return (
                        <div key={userAchievement.achievementId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{achievement.name}</div>
                            <div className="text-xs text-gray-600">{achievement.category}</div>
                            <Progress value={userAchievement.progress} className="h-1 mt-1" />
                          </div>
                          <div className="text-sm font-medium">{userAchievement.progress}%</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No achievements in progress</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {analytics ? (
            <div className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5" />
                      <span>Performance Metrics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Completion Rate</span>
                      <span className="text-lg font-bold">
                        {Math.round((analytics.completedAchievements / analytics.totalAchievements) * 100)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Most Active Category</span>
                      <span className="text-sm font-medium">{analytics.mostPopularCategory}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Current Streak</span>
                      <span className="text-lg font-bold">{analytics.streakInfo.current} days</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Longest Streak</span>
                      <span className="text-lg font-bold">{analytics.streakInfo.longest} days</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="w-5 h-5" />
                      <span>Recent Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.recentAchievements.length > 0 ? (
                      <div className="space-y-2">
                        {analytics.recentAchievements.slice(0, 5).map((achievement) => (
                          <div key={achievement.id} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{achievement.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <Award className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No recent achievements</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Category Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                  <CardDescription>Your progress across different achievement categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analytics.categoryBreakdown).map(([category, stats]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{category}</span>
                          <span className="text-sm text-gray-600">
                            {stats.completed}/{stats.total} ({stats.percentage}%)
                          </span>
                        </div>
                        <Progress value={stats.percentage} className="h-3" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="p-8 text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No Analytics Available</h3>
              <p className="text-sm text-gray-500">
                Complete some achievements to see your analytics
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Achievement Leaderboard</span>
              </CardTitle>
              <CardDescription>Top performers in the achievement system</CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.slice(0, 10).map((entry, index) => (
                    <div 
                      key={entry.userId} 
                      className={cn(
                        'flex items-center space-x-4 p-3 rounded-lg',
                        index === 0 && 'bg-yellow-50 border border-yellow-200',
                        index === 1 && 'bg-gray-50 border border-gray-200',
                        index === 2 && 'bg-orange-50 border border-orange-200',
                        index > 2 && 'bg-white border border-gray-100'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                        index === 0 && 'bg-yellow-400 text-yellow-900',
                        index === 1 && 'bg-gray-400 text-gray-900',
                        index === 2 && 'bg-orange-400 text-orange-900',
                        index > 2 && 'bg-blue-100 text-blue-900'
                      )}>
                        {entry.rank}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium">{entry.username}</div>
                        <div className="text-sm text-gray-600">
                          {entry.totalAchievements} achievements • {entry.totalPoints} points
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium">{entry.totalAchievements}</div>
                        <div className="text-xs text-gray-500">achievements</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No leaderboard data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

