'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  DollarSign,
  FileText,
  Activity,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
} from 'lucide-react';
import {
  useAdminDashboard,
  useFinancialMetrics,
} from '@/hooks/use-admin-dashboard';
import type {
  PlatformStatistics as PlatformStatsType,
  FinancialMetrics,
} from '@/types/admin.types';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconColor: string;
  isLoading?: boolean;
  trend?: 'up' | 'down' | 'stable';
}

function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconColor,
  isLoading,
  trend,
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (change === undefined) return null;

    switch (trend) {
      case 'up':
        return <TrendingUp className='h-4 w-4 text-green-500' />;
      case 'down':
        return <TrendingDown className='h-4 w-4 text-red-500' />;
      default:
        return <Activity className='h-4 w-4 text-gray-500' />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card className='overflow-hidden'>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm text-muted-foreground'>{title}</p>
            <p className='text-2xl font-bold'>
              {isLoading ? (
                <div className='h-8 w-20 bg-gray-200 animate-pulse rounded' />
              ) : typeof value === 'number' ? (
                value.toLocaleString()
              ) : (
                value
              )}
            </p>
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${iconColor}`}
          >
            {icon}
          </div>
        </div>

        {change !== undefined && (
          <div className='mt-4 flex items-center'>
            {getTrendIcon()}
            <span className={`ml-1 text-sm font-medium ${getTrendColor()}`}>
              {Math.abs(change)}%
            </span>
            {changeLabel && (
              <span className='ml-1 text-sm text-muted-foreground'>
                {changeLabel}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatsCategoryProps {
  title: string;
  stats: PlatformStatsType | null;
  isLoading: boolean;
}

function UserStatsCategory({ title, stats, isLoading }: StatsCategoryProps) {
  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold'>{title}</h3>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <MetricCard
          title='Total Users'
          value={stats?.totalUsers || 0}
          change={stats?.userGrowthRate}
          changeLabel='from last month'
          icon={<Users className='h-6 w-6' />}
          iconColor='bg-blue-100 text-blue-600'
          isLoading={isLoading}
          trend={
            stats?.userGrowthRate && stats.userGrowthRate > 0
              ? 'up'
              : stats?.userGrowthRate && stats.userGrowthRate < 0
              ? 'down'
              : 'stable'
          }
        />

        <MetricCard
          title='Active Users'
          value={stats?.activeUsers || 0}
          icon={<Activity className='h-6 w-6' />}
          iconColor='bg-green-100 text-green-600'
          isLoading={isLoading}
        />

        <MetricCard
          title='User Growth Rate'
          value={`${stats?.userGrowthRate || 0}%`}
          icon={<TrendingUp className='h-6 w-6' />}
          iconColor='bg-purple-100 text-purple-600'
          isLoading={isLoading}
          trend={
            stats?.userGrowthRate && stats.userGrowthRate > 0
              ? 'up'
              : stats?.userGrowthRate && stats.userGrowthRate < 0
              ? 'down'
              : 'stable'
          }
        />
      </div>
    </div>
  );
}

function ProjectStatsCategory({ title, stats, isLoading }: StatsCategoryProps) {
  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold'>{title}</h3>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <MetricCard
          title='Total Projects'
          value={stats?.totalProjects || 0}
          change={stats?.projectGrowthRate}
          changeLabel='from last month'
          icon={<FileText className='h-6 w-6' />}
          iconColor='bg-orange-100 text-orange-600'
          isLoading={isLoading}
          trend={
            stats?.projectGrowthRate && stats.projectGrowthRate > 0
              ? 'up'
              : stats?.projectGrowthRate && stats.projectGrowthRate < 0
              ? 'down'
              : 'stable'
          }
        />

        <MetricCard
          title='Active Projects'
          value={stats?.activeProjects || 0}
          icon={<Activity className='h-6 w-6' />}
          iconColor='bg-yellow-100 text-yellow-600'
          isLoading={isLoading}
        />

        <MetricCard
          title='Completed Projects'
          value={stats?.completedProjects || 0}
          icon={<FileText className='h-6 w-6' />}
          iconColor='bg-green-100 text-green-600'
          isLoading={isLoading}
        />

        <MetricCard
          title='Average Project Value'
          value={`$${stats?.averageProjectValue?.toLocaleString() || 0}`}
          icon={<DollarSign className='h-6 w-6' />}
          iconColor='bg-blue-100 text-blue-600'
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

interface FinancialStatsCategoryProps {
  title: string;
  stats: FinancialMetrics | null;
  isLoading: boolean;
}

function FinancialStatsCategory({
  title,
  stats,
  isLoading,
}: FinancialStatsCategoryProps) {
  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold'>{title}</h3>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <MetricCard
          title='Total Revenue'
          value={`$${stats?.totalRevenue?.toLocaleString() || 0}`}
          icon={<DollarSign className='h-6 w-6' />}
          iconColor='bg-green-100 text-green-600'
          isLoading={isLoading}
        />

        <MetricCard
          title='Monthly Revenue'
          value={`$${stats?.monthlyRevenue?.toLocaleString() || 0}`}
          icon={<TrendingUp className='h-6 w-6' />}
          iconColor='bg-blue-100 text-blue-600'
          isLoading={isLoading}
        />

        <MetricCard
          title='Platform Fees'
          value={`$${stats?.platformFees?.toLocaleString() || 0}`}
          icon={<BarChart3 className='h-6 w-6' />}
          iconColor='bg-purple-100 text-purple-600'
          isLoading={isLoading}
        />

        <MetricCard
          title='Transaction Volume'
          value={stats?.transactionVolume || 0}
          icon={<Activity className='h-6 w-6' />}
          iconColor='bg-orange-100 text-orange-600'
          isLoading={isLoading}
        />

        <MetricCard
          title='Average Transaction'
          value={`$${stats?.averageTransactionValue?.toLocaleString() || 0}`}
          icon={<BarChart3 className='h-6 w-6' />}
          iconColor='bg-yellow-100 text-yellow-600'
          isLoading={isLoading}
        />

        <MetricCard
          title='Net Revenue'
          value={`$${stats?.netRevenue?.toLocaleString() || 0}`}
          icon={<TrendingUp className='h-6 w-6' />}
          iconColor='bg-green-100 text-green-600'
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

interface QuickStatsOverviewProps {
  platformStats: PlatformStatsType | null;
  financialStats: FinancialMetrics | null;
  isLoading: boolean;
}

function QuickStatsOverview({
  platformStats,
  financialStats,
  isLoading,
}: QuickStatsOverviewProps) {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <MetricCard
        title='Total Users'
        value={platformStats?.totalUsers || 0}
        change={platformStats?.userGrowthRate}
        changeLabel='from last month'
        icon={<Users className='h-6 w-6' />}
        iconColor='bg-blue-100 text-blue-600'
        isLoading={isLoading}
        trend={
          platformStats?.userGrowthRate && platformStats.userGrowthRate > 0
            ? 'up'
            : platformStats?.userGrowthRate && platformStats.userGrowthRate < 0
            ? 'down'
            : 'stable'
        }
      />

      <MetricCard
        title='Active Projects'
        value={platformStats?.activeProjects || 0}
        change={platformStats?.projectGrowthRate}
        changeLabel='from last month'
        icon={<FileText className='h-6 w-6' />}
        iconColor='bg-green-100 text-green-600'
        isLoading={isLoading}
        trend={
          platformStats?.projectGrowthRate &&
          platformStats.projectGrowthRate > 0
            ? 'up'
            : platformStats?.projectGrowthRate &&
              platformStats.projectGrowthRate < 0
            ? 'down'
            : 'stable'
        }
      />

      <MetricCard
        title='Monthly Revenue'
        value={`$${financialStats?.monthlyRevenue?.toLocaleString() || 0}`}
        icon={<DollarSign className='h-6 w-6' />}
        iconColor='bg-purple-100 text-purple-600'
        isLoading={isLoading}
      />

      <MetricCard
        title='Transaction Volume'
        value={financialStats?.transactionVolume || 0}
        icon={<BarChart3 className='h-6 w-6' />}
        iconColor='bg-orange-100 text-orange-600'
        isLoading={isLoading}
      />
    </div>
  );
}

export default function PlatformStatistics() {
  const {
    platformStats,
    isLoading: dashboardLoading,
    error: dashboardError,
    refreshStatistics,
  } = useAdminDashboard();

  const {
    financialData,
    isLoading: financialLoading,
    error: financialError,
    loadFinancialMetrics,
  } = useFinancialMetrics();

  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('overview');

  const isLoading = dashboardLoading || financialLoading;
  const error = dashboardError || financialError;

  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);

    // Calculate date range based on selection
    const now = new Date();
    let from: Date;

    switch (range) {
      case '7d':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    loadFinancialMetrics({ from, to: now });
  };

  const handleRefreshAll = () => {
    refreshStatistics();
    loadFinancialMetrics();
  };

  if (error) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <BarChart3 className='h-12 w-12 text-red-500 mx-auto mb-4' />
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            Error Loading Statistics
          </h3>
          <p className='text-gray-600 mb-4'>{error}</p>
          <Button onClick={handleRefreshAll}>
            <RefreshCw className='h-4 w-4 mr-2' />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case 'users':
        return (
          <UserStatsCategory
            title='User Analytics'
            stats={platformStats}
            isLoading={isLoading}
          />
        );
      case 'projects':
        return (
          <ProjectStatsCategory
            title='Project Analytics'
            stats={platformStats}
            isLoading={isLoading}
          />
        );
      case 'financial':
        return (
          <FinancialStatsCategory
            title='Financial Analytics'
            stats={financialData}
            isLoading={isLoading}
          />
        );
      default:
        return (
          <div className='space-y-8'>
            <QuickStatsOverview
              platformStats={platformStats}
              financialStats={financialData}
              isLoading={isLoading}
            />
            <UserStatsCategory
              title='User Analytics'
              stats={platformStats}
              isLoading={isLoading}
            />
            <ProjectStatsCategory
              title='Project Analytics'
              stats={platformStats}
              isLoading={isLoading}
            />
            <FinancialStatsCategory
              title='Financial Analytics'
              stats={financialData}
              isLoading={isLoading}
            />
          </div>
        );
    }
  };

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Platform Statistics</h1>
          <p className='text-muted-foreground'>
            Real-time platform metrics and analytics
          </p>
        </div>
        <div className='flex items-center space-x-3'>
          <Button variant='outline' onClick={handleRefreshAll}>
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-2'>
                <Calendar className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm text-muted-foreground'>
                  Time Range:
                </span>
                <Select
                  value={selectedTimeRange}
                  onValueChange={handleTimeRangeChange}
                >
                  <SelectTrigger className='w-32'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='7d'>Last 7 days</SelectItem>
                    <SelectItem value='30d'>Last 30 days</SelectItem>
                    <SelectItem value='90d'>Last 90 days</SelectItem>
                    <SelectItem value='1y'>Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <Badge
                variant={
                  selectedCategory === 'overview' ? 'default' : 'outline'
                }
                className='cursor-pointer'
                onClick={() => setSelectedCategory('overview')}
              >
                Overview
              </Badge>
              <Badge
                variant={selectedCategory === 'users' ? 'default' : 'outline'}
                className='cursor-pointer'
                onClick={() => setSelectedCategory('users')}
              >
                Users
              </Badge>
              <Badge
                variant={
                  selectedCategory === 'projects' ? 'default' : 'outline'
                }
                className='cursor-pointer'
                onClick={() => setSelectedCategory('projects')}
              >
                Projects
              </Badge>
              <Badge
                variant={
                  selectedCategory === 'financial' ? 'default' : 'outline'
                }
                className='cursor-pointer'
                onClick={() => setSelectedCategory('financial')}
              >
                Financial
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Content */}
      {renderCategoryContent()}

      {/* Summary Cards */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Platform Health
            </CardTitle>
            <PieChart className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>User Engagement</span>
                <Badge
                  variant='default'
                  className='bg-green-100 text-green-800'
                >
                  High
                </Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Project Success Rate</span>
                <span className='text-sm font-medium'>
                  {platformStats
                    ? Math.round(
                        (platformStats.completedProjects /
                          platformStats.totalProjects) *
                          100,
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Revenue Growth</span>
                <Badge variant='default' className='bg-blue-100 text-blue-800'>
                  Positive
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Top Metrics</CardTitle>
            <LineChart className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Daily Active Users</span>
                <span className='text-sm font-medium'>
                  {platformStats?.activeUsers?.toLocaleString() || '0'}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Avg Project Value</span>
                <span className='text-sm font-medium'>
                  ${platformStats?.averageProjectValue?.toLocaleString() || '0'}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Platform Fee Revenue</span>
                <span className='text-sm font-medium'>
                  ${financialData?.platformFees?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Growth Trends</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>User Growth</span>
                <div className='flex items-center'>
                  {platformStats?.userGrowthRate &&
                  platformStats.userGrowthRate > 0 ? (
                    <TrendingUp className='h-3 w-3 text-green-500 mr-1' />
                  ) : (
                    <TrendingDown className='h-3 w-3 text-red-500 mr-1' />
                  )}
                  <span className='text-sm font-medium'>
                    {platformStats?.userGrowthRate || 0}%
                  </span>
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Project Growth</span>
                <div className='flex items-center'>
                  {platformStats?.projectGrowthRate &&
                  platformStats.projectGrowthRate > 0 ? (
                    <TrendingUp className='h-3 w-3 text-green-500 mr-1' />
                  ) : (
                    <TrendingDown className='h-3 w-3 text-red-500 mr-1' />
                  )}
                  <span className='text-sm font-medium'>
                    {platformStats?.projectGrowthRate || 0}%
                  </span>
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Revenue Growth</span>
                <div className='flex items-center'>
                  <TrendingUp className='h-3 w-3 text-green-500 mr-1' />
                  <span className='text-sm font-medium'>
                    {platformStats?.revenueGrowthRate || 0}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
