"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Loader2, TrendingUpIcon, TrendingDownIcon, ActivityIcon, UsersIcon, SettingsIcon, ShieldIcon, ToggleLeftIcon } from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsData {
  configurations: {
    total: number;
    active: number;
    inactive: number;
    categories: Record<string, number>;
  };
  policies: {
    total: number;
    active: number;
    inactive: number;
    categories: Record<string, number>;
    enforcementCount: number;
  };
  featureToggles: {
    total: number;
    active: number;
    inactive: number;
    categories: Record<string, number>;
    rolloutStats: Record<string, number>;
  };
  recentActivity: Array<{
    id: string;
    type: 'configuration' | 'policy' | 'feature_toggle';
    action: string;
    user: string;
    timestamp: Date;
    environment: string;
  }>;
  performanceMetrics: {
    responseTime: number;
    errorRate: number;
    uptime: number;
  };
}

interface AnalyticsDashboardProps {
  environment?: 'development' | 'staging' | 'production' | 'testing';
  onEnvironmentChange?: (environment: string) => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  environment = 'production',
  onEnvironmentChange,
}) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [environment, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual service call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual data from API
      const mockData: AnalyticsData = {
        configurations: {
          total: 45,
          active: 42,
          inactive: 3,
          categories: {
            general: 12,
            security: 8,
            payments: 6,
            features: 10,
            notifications: 5,
            ui: 4,
          },
        },
        policies: {
          total: 23,
          active: 18,
          inactive: 5,
          categories: {
            user_behavior: 8,
            content: 6,
            transaction: 4,
            security: 3,
            system: 2,
          },
          enforcementCount: 156,
        },
        featureToggles: {
          total: 34,
          active: 28,
          inactive: 6,
          categories: {
            ui: 15,
            backend: 12,
            experiment: 4,
            maintenance: 3,
          },
          rolloutStats: {
            all: 20,
            percentage: 8,
            user_group: 4,
            attributes: 2,
          },
        },
        recentActivity: [
          {
            id: '1',
            type: 'configuration',
            action: 'Updated platform_name',
            user: 'admin@example.com',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            environment: 'production',
          },
          {
            id: '2',
            type: 'policy',
            action: 'Activated spam_detection policy',
            user: 'admin@example.com',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            environment: 'production',
          },
          {
            id: '3',
            type: 'feature_toggle',
            action: 'Rolled out new_dashboard to 50%',
            user: 'admin@example.com',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
            environment: 'production',
          },
        ],
        performanceMetrics: {
          responseTime: 245,
          errorRate: 0.02,
          uptime: 99.9,
        },
      };
      
      setData(mockData);
    } catch (error) {
      toast.error('Failed to load analytics data.');
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue' }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: 'up' | 'down' | 'neutral';
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
        </div>
        {trend && (
          <div className="mt-2 flex items-center text-sm">
            {trend === 'up' ? (
              <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
            ) : trend === 'down' ? (
              <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
            ) : (
              <ActivityIcon className="h-4 w-4 text-gray-500 mr-1" />
            )}
            <span className={trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
              {trend === 'up' ? '+12%' : trend === 'down' ? '-5%' : '0%'} from last week
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No analytics data available.</p>
        <Button onClick={fetchAnalytics} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configuration Analytics</h2>
          <p className="text-gray-600">Overview of system configuration, policies, and feature toggles</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline">{environment}</Badge>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Configurations"
          value={data.configurations.total}
          subtitle={`${data.configurations.active} active`}
          icon={SettingsIcon}
          trend="up"
          color="blue"
        />
        <StatCard
          title="Policies"
          value={data.policies.total}
          subtitle={`${data.policies.active} active`}
          icon={ShieldIcon}
          trend="neutral"
          color="green"
        />
        <StatCard
          title="Feature Toggles"
          value={data.featureToggles.total}
          subtitle={`${data.featureToggles.active} active`}
          icon={ToggleLeftIcon}
          trend="up"
          color="purple"
        />
        <StatCard
          title="Policy Enforcements"
          value={data.policies.enforcementCount}
          subtitle="Last 7 days"
          icon={ActivityIcon}
          trend="down"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Categories</CardTitle>
            <CardDescription>Distribution of configurations by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.configurations.categories).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="capitalize">{category}</span>
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Policy Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Policy Categories</CardTitle>
            <CardDescription>Distribution of policies by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.policies.categories).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="capitalize">{category.replace('_', ' ')}</span>
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Toggle Rollout Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Rollout Strategies</CardTitle>
            <CardDescription>Distribution of feature toggles by rollout strategy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.featureToggles.rolloutStats).map(([strategy, count]) => (
                <div key={strategy} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="capitalize">{strategy}</span>
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>System performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Response Time</span>
                <Badge variant={data.performanceMetrics.responseTime < 300 ? 'default' : 'destructive'}>
                  {data.performanceMetrics.responseTime}ms
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Error Rate</span>
                <Badge variant={data.performanceMetrics.errorRate < 0.05 ? 'default' : 'destructive'}>
                  {(data.performanceMetrics.errorRate * 100).toFixed(2)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Uptime</span>
                <Badge variant={data.performanceMetrics.uptime > 99.5 ? 'default' : 'destructive'}>
                  {data.performanceMetrics.uptime}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest configuration, policy, and feature toggle changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'configuration' ? 'bg-blue-100' :
                    activity.type === 'policy' ? 'bg-green-100' :
                    'bg-purple-100'
                  }`}>
                    {activity.type === 'configuration' ? (
                      <SettingsIcon className={`h-4 w-4 ${
                        activity.type === 'configuration' ? 'text-blue-600' :
                        activity.type === 'policy' ? 'text-green-600' :
                        'text-purple-600'
                      }`} />
                    ) : activity.type === 'policy' ? (
                      <ShieldIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <ToggleLeftIcon className="h-4 w-4 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-500">by {activity.user}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-1">{activity.environment}</Badge>
                  <p className="text-sm text-gray-500">
                    {activity.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
