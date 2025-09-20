/**
 * @fileoverview Admin dashboard component for managing platform statistics and operations
 * @author Offer Hub Team
 */

"use client";

import React from "react";
import {
  Activity,
  AlertTriangle,
  DollarSign,
  FileText,
  RefreshCw,
  Server,
  Shield,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminDashboard } from "@/hooks/use-admin-dashboard";
import { cn } from "@/lib/utils";
import { PlatformStatistics, SystemHealthMetrics } from "@/types/admin.types";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconColor: string;
  isLoading?: boolean;
}

function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconColor,
  isLoading,
}: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
              ) : (
                value
              )}
            </div>
          </div>
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              iconColor,
            )}
          >
            {icon}
          </div>
        </div>

        {change !== undefined && (
          <div className="mt-4 flex items-center">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span
              className={cn(
                "ml-1 text-sm font-medium",
                isPositive ? "text-green-500" : "text-red-500",
              )}
            >
              {Math.abs(change)}%
            </span>
            {changeLabel && (
              <span className="ml-1 text-sm text-muted-foreground">
                {changeLabel}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SystemHealthCardProps {
  systemHealth: SystemHealthMetrics | null;
  healthStatus: string;
  onRefresh: () => void;
}

function SystemHealthCard({
  systemHealth,
  healthStatus,
  onRefresh,
}: SystemHealthCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-500 bg-green-100";
      case "warning":
        return "text-yellow-500 bg-yellow-100";
      case "critical":
        return "text-red-500 bg-red-100";
      default:
        return "text-gray-500 bg-gray-100";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">System Health</CardTitle>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Overall Status</span>
          <Badge className={cn("capitalize", getStatusColor(healthStatus))}>
            {healthStatus}
          </Badge>
        </div>

        {systemHealth && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Uptime</span>
                <span className="text-sm font-medium">
                  {systemHealth.uptime}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Response Time</span>
                <span className="text-sm font-medium">
                  {systemHealth.responseTime}ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Error Rate</span>
                <span className="text-sm font-medium">
                  {systemHealth.errorRate}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge
                  variant={
                    systemHealth.databaseStatus === "healthy"
                      ? "default"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {systemHealth.databaseStatus}
                </Badge>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface RecentActivityCardProps {
  isLoading: boolean;
}

function RecentActivityCard({ isLoading }: RecentActivityCardProps) {
  // This would typically come from the hook, but for now we'll show a placeholder
  const activities = [
    {
      id: 1,
      action: "User verified",
      user: "john@example.com",
      time: "2 minutes ago",
    },
    {
      id: 2,
      action: "Project approved",
      user: "jane@example.com",
      time: "5 minutes ago",
    },
    {
      id: 3,
      action: "Payment processed",
      user: "bob@example.com",
      time: "10 minutes ago",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gray-200 animate-pulse rounded-full" />
                <div className="space-y-1 flex-1">
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface QuickStatsProps {
  stats: PlatformStatistics | null;
  isLoading: boolean;
}

function QuickStats({ stats, isLoading }: QuickStatsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Users"
        value={stats?.totalUsers?.toLocaleString() || "0"}
        change={stats?.userGrowthRate}
        changeLabel="from last month"
        icon={<Users className="h-6 w-6" />}
        iconColor="bg-blue-100 text-blue-600"
        isLoading={isLoading}
      />

      <MetricCard
        title="Active Projects"
        value={stats?.activeProjects?.toLocaleString() || "0"}
        change={stats?.projectGrowthRate}
        changeLabel="from last month"
        icon={<FileText className="h-6 w-6" />}
        iconColor="bg-green-100 text-green-600"
        isLoading={isLoading}
      />

      <MetricCard
        title="Monthly Revenue"
        value={`$${stats?.monthlyRevenue?.toLocaleString() || "0"}`}
        change={stats?.revenueGrowthRate}
        changeLabel="from last month"
        icon={<DollarSign className="h-6 w-6" />}
        iconColor="bg-purple-100 text-purple-600"
        isLoading={isLoading}
      />

      <MetricCard
        title="Active Users"
        value={stats?.activeUsers?.toLocaleString() || "0"}
        icon={<Activity className="h-6 w-6" />}
        iconColor="bg-orange-100 text-orange-600"
        isLoading={isLoading}
      />
    </div>
  );
}

export default function AdminDashboard() {
  const {
    platformStats,
    systemHealth,
    systemHealthStatus,
    unreadNotificationsCount,
    isLoading,
    error,
    refreshStatistics,
    refreshSystemHealth,
  } = useAdminDashboard();

  const handleRefreshAll = () => {
    refreshStatistics();
    refreshSystemHealth();
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefreshAll}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Overview of platform performance and key metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {unreadNotificationsCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadNotificationsCount} new notifications
            </Badge>
          )}
          <Button variant="outline" onClick={handleRefreshAll}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats stats={platformStats} isLoading={isLoading} />

      {/* Secondary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SystemHealthCard
          systemHealth={systemHealth}
          healthStatus={systemHealthStatus}
          onRefresh={refreshSystemHealth}
        />

        <RecentActivityCard isLoading={isLoading} />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Security Monitor
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Server className="h-4 w-4 mr-2" />
              System Settings
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alert Banner for Critical Issues */}
      {systemHealthStatus === "critical" && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-red-800">
                  Critical System Alert
                </h4>
                <p className="text-sm text-red-700">
                  System performance is below acceptable thresholds. Immediate
                  attention required.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
