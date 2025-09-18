"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  Cpu,
  HardDrive,
  Monitor,
  Clock,
  Zap,
} from "lucide-react";
import {
  LineChart,
  AreaChart,
  BarChart,
  MetricsComposedChart,
} from "@/components/ui/charts";
import { usePlatformMonitoring } from "@/hooks/use-platform-monitoring";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  status?: "healthy" | "warning" | "critical";
  isLoading?: boolean;
}

function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  status = "healthy",
  isLoading = false,
}: MetricCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-50 border-green-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getChangeColor = () => {
    if (!change) return "text-gray-500";
    return change > 0 ? "text-green-600" : "text-red-600";
  };

  const getChangeIcon = () => {
    if (!change) return null;
    return change > 0 ? (
      <TrendingUp className="h-4 w-4" />
    ) : (
      <TrendingDown className="h-4 w-4" />
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-gray-100 animate-pulse">
              <div className="h-6 w-6 bg-gray-300 rounded" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn("border-2", getStatusColor().split(" ").slice(2).join(" "))}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div
              className={cn(
                "p-3 rounded-full",
                getStatusColor().split(" ").slice(1).join(" ")
              )}
            >
              <div className={getStatusColor().split(" ")[0]}>{icon}</div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {change !== undefined && (
                <div
                  className={cn(
                    "flex items-center space-x-1 text-sm",
                    getChangeColor()
                  )}
                >
                  {getChangeIcon()}
                  <span>
                    {Math.abs(change)}% {changeLabel || "vs last period"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PerformanceChartProps {
  title: string;
  data: Array<{ name: string; [key: string]: any }>;
  dataKeys: string[];
  height?: number;
  type?: "line" | "area" | "bar" | "composed";
  showLegend?: boolean;
}

function PerformanceChart({
  title,
  data,
  dataKeys,
  height = 300,
  type = "line",
  showLegend = true,
}: PerformanceChartProps) {
  const renderChart = () => {
    switch (type) {
      case "area":
        return (
          <AreaChart
            data={data}
            dataKeys={dataKeys}
            height={height}
            showLegend={showLegend}
          />
        );
      case "bar":
        return (
          <BarChart
            data={data}
            dataKey={dataKeys[0]}
            height={height}
            showLegend={showLegend}
          />
        );
      case "composed":
        return (
          <MetricsComposedChart
            data={data}
            lineDataKeys={dataKeys.slice(0, 2)}
            barDataKeys={dataKeys.slice(2, 3)}
            areaDataKeys={dataKeys.slice(3)}
            height={height}
            showLegend={showLegend}
          />
        );
      default:
        return (
          <LineChart
            data={data}
            dataKeys={dataKeys}
            height={height}
            showLegend={showLegend}
          />
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          renderChart()
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-2" />
              <p>No data available</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function RealTimeMetrics() {
  const {
    systemMetrics,
    performanceMetrics,
    userMetrics,
    businessMetrics,
    isLoading,
    error,
    isConnected,
    lastUpdate,
    refreshMetrics,
    selectedTimeRange,
    updateTimeRange,
    systemHealthStatus,
  } = usePlatformMonitoring();

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState("30"); // seconds

  // Generate mock historical data for charts (in real app, this would come from API)
  const generateChartData = (points = 24) => {
    return Array.from({ length: points }, (_, i) => ({
      name: new Date(
        Date.now() - (points - i - 1) * 60 * 60 * 1000
      ).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100,
      responseTime: Math.random() * 500,
      errorRate: Math.random() * 5,
      activeUsers: Math.floor(Math.random() * 1000),
      revenue: Math.random() * 10000,
    }));
  };

  const chartData = generateChartData();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (autoRefresh && isConnected) {
      interval = setInterval(() => {
        refreshMetrics();
      }, parseInt(refreshInterval) * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, isConnected, refreshMetrics]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Metrics
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Real-time Metrics
          </h2>
          <p className="text-gray-600">
            Live monitoring of system performance and user activity
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-green-500" : "bg-red-500"
              )}
            />
            <span className="text-sm text-gray-600">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          {/* System Status */}
          <Badge
            variant={
              systemHealthStatus === "healthy" ? "default" : "destructive"
            }
            className={cn(
              systemHealthStatus === "healthy" && "bg-green-100 text-green-800",
              systemHealthStatus === "warning" &&
                "bg-yellow-100 text-yellow-800",
              systemHealthStatus === "critical" && "bg-red-100 text-red-800"
            )}
          >
            System:{" "}
            {systemHealthStatus.charAt(0).toUpperCase() +
              systemHealthStatus.slice(1)}
          </Badge>

          {/* Auto Refresh Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? (
                <Zap className="h-4 w-4 mr-1" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Auto Refresh
            </Button>

            <Select value={refreshInterval} onValueChange={setRefreshInterval}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10s</SelectItem>
                <SelectItem value="30">30s</SelectItem>
                <SelectItem value="60">1m</SelectItem>
                <SelectItem value="300">5m</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={refreshMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Last Update */}
      {lastUpdate && (
        <div className="text-sm text-gray-500">
          Last updated: {lastUpdate.toLocaleString()}
        </div>
      )}

      {/* System Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="CPU Usage"
          value={
            systemMetrics ? `${systemMetrics.cpu.usage.toFixed(1)}%` : "--"
          }
          change={systemMetrics ? Math.random() * 10 - 5 : undefined}
          icon={<Cpu className="h-6 w-6" />}
          status={
            systemMetrics?.cpu.usage
              ? systemMetrics.cpu.usage > 80
                ? "critical"
                : systemMetrics.cpu.usage > 60
                ? "warning"
                : "healthy"
              : undefined
          }
          isLoading={isLoading}
        />

        <MetricCard
          title="Memory Usage"
          value={
            systemMetrics ? `${systemMetrics.memory.usage.toFixed(1)}%` : "--"
          }
          change={systemMetrics ? Math.random() * 10 - 5 : undefined}
          icon={<Monitor className="h-6 w-6" />}
          status={
            systemMetrics?.memory.usage
              ? systemMetrics.memory.usage > 90
                ? "critical"
                : systemMetrics.memory.usage > 70
                ? "warning"
                : "healthy"
              : undefined
          }
          isLoading={isLoading}
        />

        <MetricCard
          title="Disk Usage"
          value={
            systemMetrics ? `${systemMetrics.disk.usage.toFixed(1)}%` : "--"
          }
          change={systemMetrics ? Math.random() * 10 - 5 : undefined}
          icon={<HardDrive className="h-6 w-6" />}
          status={
            systemMetrics?.disk.usage
              ? systemMetrics.disk.usage > 90
                ? "critical"
                : systemMetrics.disk.usage > 80
                ? "warning"
                : "healthy"
              : undefined
          }
          isLoading={isLoading}
        />

        <MetricCard
          title="Response Time"
          value={
            performanceMetrics
              ? `${performanceMetrics.responseTime.api}ms`
              : "--"
          }
          change={performanceMetrics ? Math.random() * 20 - 10 : undefined}
          icon={<Clock className="h-6 w-6" />}
          status={
            performanceMetrics?.responseTime.api
              ? performanceMetrics.responseTime.api > 1000
                ? "critical"
                : performanceMetrics.responseTime.api > 500
                ? "warning"
                : "healthy"
              : undefined
          }
          isLoading={isLoading}
        />
      </div>

      {/* Performance Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Users"
          value={
            userMetrics ? userMetrics.activeUsers.total.toLocaleString() : "--"
          }
          change={userMetrics ? Math.random() * 15 : undefined}
          icon={<Users className="h-6 w-6" />}
          isLoading={isLoading}
        />

        <MetricCard
          title="Requests/sec"
          value={
            performanceMetrics
              ? performanceMetrics.throughput.requestsPerSecond.toFixed(0)
              : "--"
          }
          change={performanceMetrics ? Math.random() * 25 - 10 : undefined}
          icon={<Activity className="h-6 w-6" />}
          isLoading={isLoading}
        />

        <MetricCard
          title="Error Rate"
          value={
            performanceMetrics
              ? `${performanceMetrics.errorRates.total.toFixed(2)}%`
              : "--"
          }
          change={performanceMetrics ? Math.random() * 5 - 2.5 : undefined}
          icon={<AlertTriangle className="h-6 w-6" />}
          status={
            performanceMetrics?.errorRates.total
              ? performanceMetrics.errorRates.total > 5
                ? "critical"
                : performanceMetrics.errorRates.total > 1
                ? "warning"
                : "healthy"
              : undefined
          }
          isLoading={isLoading}
        />

        <MetricCard
          title="Revenue Today"
          value={
            businessMetrics
              ? `$${businessMetrics.revenue.daily.toLocaleString()}`
              : "--"
          }
          change={businessMetrics ? Math.random() * 20 : undefined}
          icon={<DollarSign className="h-6 w-6" />}
          isLoading={isLoading}
        />
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart
          title="System Resources"
          data={chartData}
          dataKeys={["cpu", "memory", "disk"]}
          type="area"
        />

        <PerformanceChart
          title="Response Time & Error Rate"
          data={chartData}
          dataKeys={["responseTime", "errorRate"]}
          type="composed"
        />

        <PerformanceChart
          title="Active Users"
          data={chartData}
          dataKeys={["activeUsers"]}
          type="line"
        />

        <PerformanceChart
          title="Revenue Trend"
          data={chartData}
          dataKeys={["revenue"]}
          type="bar"
        />
      </div>

      {/* System Resource Progress Bars */}
      <Card>
        <CardHeader>
          <CardTitle>System Resource Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {systemMetrics && (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>CPU Usage</span>
                    <span>{systemMetrics.cpu.usage.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemMetrics.cpu.usage} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Memory Usage</span>
                    <span>{systemMetrics.memory.usage.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={systemMetrics.memory.usage}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Disk Usage</span>
                    <span>{systemMetrics.disk.usage.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemMetrics.disk.usage} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Network Load</span>
                    <span>
                      {(
                        (systemMetrics.network.bytesIn +
                          systemMetrics.network.bytesOut) /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB/s
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      ((systemMetrics.network.bytesIn +
                        systemMetrics.network.bytesOut) /
                        1024 /
                        1024 /
                        100) *
                        100,
                      100
                    )}
                    className="h-2"
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
