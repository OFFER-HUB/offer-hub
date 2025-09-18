"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  BarChart3,
  Settings,
  TrendingUp,
  Users,
  AlertTriangle,
  RefreshCw,
  Download,
  Bell,
  PieChart,
  Monitor,
} from "lucide-react";
import RealTimeMetrics from "./real-time-metrics";
import UserAnalytics from "./user-analytics";
import CustomDashboards from "./custom-dashboards";
import { usePlatformMonitoring } from "@/hooks/use-platform-monitoring";
import { cn } from "@/lib/utils";

interface QuickStatsProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "stable";
}

function QuickStats({
  title,
  value,
  change,
  icon,
  trend = "stable",
}: QuickStatsProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return "↗";
      case "down":
        return "↘";
      default:
        return "→";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <div className="text-blue-600">{icon}</div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
          {change !== undefined && (
            <div
              className={cn(
                "text-sm font-medium flex items-center",
                getTrendColor()
              )}
            >
              <span className="mr-1">{getTrendIcon()}</span>
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface AlertItemProps {
  alert: {
    id: string;
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    message: string;
    timestamp: Date;
    acknowledged: boolean;
  };
  onAcknowledge: (id: string) => void;
}

function AlertItem({ alert, onAcknowledge }: AlertItemProps) {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 border rounded-lg",
        alert.acknowledged ? "bg-gray-50 opacity-75" : "bg-white",
        alert.severity === "critical" &&
          !alert.acknowledged &&
          "border-red-200 bg-red-50"
      )}
    >
      <div className="flex items-center space-x-3">
        <AlertTriangle
          className={cn(
            "h-4 w-4",
            alert.severity === "critical"
              ? "text-red-600"
              : alert.severity === "high"
              ? "text-orange-600"
              : alert.severity === "medium"
              ? "text-yellow-600"
              : "text-gray-600"
          )}
        />
        <div>
          <p className="text-sm font-medium">{alert.message}</p>
          <p className="text-xs text-gray-500">
            {alert.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {getSeverityBadge(alert.severity)}
        {!alert.acknowledged && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAcknowledge(alert.id)}
          >
            Acknowledge
          </Button>
        )}
      </div>
    </div>
  );
}

export default function PlatformMonitoring() {
  const {
    systemMetrics,
    userMetrics,
    businessMetrics,
    alerts,
    isLoading,
    error,
    isConnected,
    lastUpdate,
    refreshMetrics,
    acknowledgeAlert,
    systemHealthStatus,
    unacknowledgedAlerts,
    criticalAlerts,
    initializeMonitoring,
  } = usePlatformMonitoring();

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");

  // Initialize monitoring on component mount
  useEffect(() => {
    initializeMonitoring();
  }, [initializeMonitoring]);

  // Mock recent alerts for demonstration
  const mockAlerts = [
    {
      id: "1",
      type: "system",
      severity: "critical" as const,
      message: "Critical CPU usage detected on server-01 (95%)",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      acknowledged: false,
    },
    {
      id: "2",
      type: "security",
      severity: "high" as const,
      message: "Multiple failed login attempts from IP 192.168.1.100",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      acknowledged: false,
    },
    {
      id: "3",
      type: "performance",
      severity: "medium" as const,
      message: "Database response time increased to 250ms",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      acknowledged: false,
    },
    {
      id: "4",
      type: "system",
      severity: "low" as const,
      message: "Disk usage at 70%",
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      acknowledged: true,
    },
  ];

  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
    // In real implementation, this would update the monitoring hook's time range
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Platform Monitoring
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refreshMetrics}>
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
          <h1 className="text-3xl font-bold text-gray-900">
            Platform Monitoring & Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time insights into system performance, user behavior, and
            business metrics
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-green-500" : "bg-red-500"
              )}
            />
            <span className="text-sm text-gray-600">
              {isConnected ? "Live" : "Offline"}
            </span>
          </div>

          {/* System Health Badge */}
          <Badge
            variant={
              systemHealthStatus === "healthy" ? "default" : "destructive"
            }
            className={cn(
              "text-sm px-3 py-1",
              systemHealthStatus === "healthy" && "bg-green-100 text-green-800",
              systemHealthStatus === "warning" &&
                "bg-yellow-100 text-yellow-800",
              systemHealthStatus === "critical" && "bg-red-100 text-red-800"
            )}
          >
            {systemHealthStatus.charAt(0).toUpperCase() +
              systemHealthStatus.slice(1)}
          </Badge>

          {/* Alert Counter */}
          {unacknowledgedAlerts > 0 && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <Bell className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">
                {unacknowledgedAlerts} alerts
              </span>
            </div>
          )}

          {/* Time Range Selector */}
          <Select
            value={selectedTimeRange}
            onValueChange={handleTimeRangeChange}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={refreshMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Last Update Timestamp */}
      {lastUpdate && (
        <div className="text-sm text-gray-500">
          Last updated: {lastUpdate.toLocaleString()}
        </div>
      )}

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuickStats
          title="System Health"
          value={
            systemHealthStatus === "healthy"
              ? "Healthy"
              : systemHealthStatus === "warning"
              ? "Warning"
              : "Critical"
          }
          icon={<Monitor className="h-6 w-6" />}
          trend={
            systemHealthStatus === "healthy"
              ? "up"
              : systemHealthStatus === "warning"
              ? "stable"
              : "down"
          }
        />

        <QuickStats
          title="Active Users"
          value={
            userMetrics
              ? userMetrics.activeUsers.total.toLocaleString()
              : "12,450"
          }
          change={8.2}
          trend="up"
          icon={<Users className="h-6 w-6" />}
        />

        <QuickStats
          title="Response Time"
          value="245ms"
          change={-12.3}
          trend="up"
          icon={<Activity className="h-6 w-6" />}
        />

        <QuickStats
          title="Revenue Today"
          value={
            businessMetrics
              ? `$${businessMetrics.revenue.daily.toLocaleString()}`
              : "$24,580"
          }
          change={15.7}
          trend="up"
          icon={<TrendingUp className="h-6 w-6" />}
        />
      </div>

      {/* Critical Alerts */}
      {mockAlerts.some(
        (alert) => !alert.acknowledged && alert.severity === "high"
      ) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Critical Alerts Require Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockAlerts
              .filter(
                (alert) =>
                  !alert.acknowledged &&
                  (alert.severity === "critical" || alert.severity === "high")
              )
              .map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={acknowledgeAlert}
                />
              ))}
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="real-time"
            className="flex items-center space-x-2"
          >
            <Activity className="h-4 w-4" />
            <span>Real-time</span>
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex items-center space-x-2"
          >
            <PieChart className="h-4 w-4" />
            <span>User Analytics</span>
          </TabsTrigger>
          <TabsTrigger
            value="dashboards"
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Dashboards</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>System Activity Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Activity className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          System Performance
                        </p>
                        <p className="text-xs text-gray-500">
                          All services operational
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Healthy
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">User Activity</p>
                        <p className="text-xs text-gray-500">
                          Peak hours: 2PM - 6PM
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Revenue Tracking</p>
                        <p className="text-xs text-gray-500">
                          Above daily target by 15%
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Target Met
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Alerts
                  <Badge variant="outline">{mockAlerts.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAlerts.slice(0, 5).map((alert) => (
                    <AlertItem
                      key={alert.id}
                      alert={alert}
                      onAcknowledge={acknowledgeAlert}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="text-sm font-medium">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Avg Response Time
                    </span>
                    <span className="text-sm font-medium">245ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Error Rate</span>
                    <span className="text-sm font-medium">0.12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Active Connections
                    </span>
                    <span className="text-sm font-medium">2,847</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Users</span>
                    <span className="text-sm font-medium">12,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Today</span>
                    <span className="text-sm font-medium">3,240</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">New Signups</span>
                    <span className="text-sm font-medium">89</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Session Duration
                    </span>
                    <span className="text-sm font-medium">8m 42s</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Business Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Revenue Today</span>
                    <span className="text-sm font-medium">$24,580</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">This Month</span>
                    <span className="text-sm font-medium">$486,250</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Conversion Rate
                    </span>
                    <span className="text-sm font-medium">3.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Avg Order Value
                    </span>
                    <span className="text-sm font-medium">$127</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="real-time">
          <RealTimeMetrics />
        </TabsContent>

        <TabsContent value="analytics">
          <UserAnalytics />
        </TabsContent>

        <TabsContent value="dashboards">
          <CustomDashboards />
        </TabsContent>
      </Tabs>
    </div>
  );
}
