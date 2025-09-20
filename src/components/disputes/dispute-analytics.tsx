'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  PerformanceMetrics,
  DisputePattern,
  PredictiveModel,
  AnalyticsFilter,
  ExportOptions,
  ExportFormat,
  DisputeStatus,
  DisputeType,
  DisputeCategory,
  DisputePriority,
  VisualizationType
} from '@/types/analytics.types';
import { useDisputeAnalytics, usePerformanceMetrics, useTrendAnalysis, useRealtimeMetrics } from '@/hooks/use-dispute-analytics';
import {
  MetricCard,
  ChartContainer,
  AnalyticsVisualization,
  LineChartVisualization,
  AreaChartVisualization,
  BarChartVisualization,
  PieChartVisualization,
  DonutChartVisualization,
  GaugeVisualization,
  ProgressRing,
  TrendIndicator
} from './analytics-visualization';
import { AnalyticsReports } from './analytics-reports';
import { AnalyticsCalculator } from '@/utils/analytics-helpers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Download,
  Filter,
  RefreshCw,
  Calendar as CalendarIcon,
  Settings,
  Eye,
  Zap,
  Target,
  Shield,
  Smartphone
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import withErrorBoundary from '@/components/shared/WithErrorBoundary';

interface DashboardFilters extends AnalyticsFilter {
  quickRange?: 'today' | '7d' | '30d' | '90d' | 'custom';
}

const quickRanges = [
  { value: 'today', label: 'Today', days: 0 },
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: '90d', label: 'Last 90 days', days: 90 }
];

export const AnalyticsDashboard: React.FC = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    quickRange: '30d',
    dateRange: {
      from: subDays(new Date(), 30),
      to: new Date()
    }
  });
  const [showFilters, setShowFilters] = useState(false);
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  const [mobileView, setMobileView] = useState(false);

  const {
    performanceMetrics,
    trendData,
    disputePatterns,
    predictiveModel,
    chartData,
    timeSeriesData,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    exportData,
    enableRealtimeUpdates,
    disableRealtimeUpdates,
    isRealtimeEnabled
  } = useDisputeAnalytics({
    autoRefresh: true,
    refreshInterval: 300000, // 5 minutes
    enableCache: true
  });

  const { metrics: realtimeMetrics, isConnected } = useRealtimeMetrics();

  useEffect(() => {
    const checkMobile = () => setMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleQuickRangeChange = (range: string) => {
    const rangeConfig = quickRanges.find(r => r.value === range);
    if (rangeConfig) {
      const to = new Date();
      const from = rangeConfig.days === 0 ? startOfDay(new Date()) : subDays(to, rangeConfig.days);

      setFilters({
        ...filters,
        quickRange: range as any,
        dateRange: { from, to }
      });
    }
  };

  const handleCustomDateRange = (from: Date, to: Date) => {
    setFilters({
      ...filters,
      quickRange: 'custom',
      dateRange: { from, to }
    });
  };

  const handleExport = async (format: ExportFormat) => {
    const options: ExportOptions = {
      format,
      includeCharts: true,
      includeData: true,
      dateRange: filters.dateRange,
      filters
    };
    await exportData(options);
  };

  const toggleRealtime = () => {
    if (isRealtimeEnabled) {
      disableRealtimeUpdates();
    } else {
      enableRealtimeUpdates();
    }
    setRealtimeEnabled(!isRealtimeEnabled);
  };

  const currentMetrics = realtimeEnabled && realtimeMetrics ? realtimeMetrics : performanceMetrics;

  const topDisputes = useMemo(() => {
    if (!disputePatterns) return [];
    return disputePatterns
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);
  }, [disputePatterns]);

  const resolutionTrend = useMemo(() => {
    if (!trendData || trendData.length === 0) return null;
    const latest = trendData[trendData.length - 1];
    const previous = trendData[trendData.length - 2];
    return previous ? {
      current: latest.value,
      change: latest.changePercentage,
      trend: latest.change > 0 ? 'up' : latest.change < 0 ? 'down' : 'stable'
    } : null;
  }, [trendData]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dispute Analytics</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive insights into dispute patterns and resolution performance
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {format(lastUpdated, 'MMM dd, yyyy HH:mm')}
              {isRealtimeEnabled && isConnected && (
                <Badge variant="outline" className="ml-2">
                  <Activity className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              )}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center space-x-2 space-y-2 md:space-y-0">
          <div className="flex items-center space-x-2">
            <Switch
              checked={isRealtimeEnabled}
              onCheckedChange={toggleRealtime}
              disabled={isLoading}
            />
            <Label className="text-sm">Real-time</Label>
          </div>

          <Select value={filters.quickRange} onValueChange={handleQuickRangeChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {quickRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={showFilters} onOpenChange={setShowFilters}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Filter Analytics</DialogTitle>
              </DialogHeader>
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                onClose={() => setShowFilters(false)}
              />
            </DialogContent>
          </Dialog>

          <Button onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Select onValueChange={(format) => handleExport(format as ExportFormat)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ExportFormat.PDF}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </SelectItem>
              <SelectItem value={ExportFormat.EXCEL}>Excel</SelectItem>
              <SelectItem value={ExportFormat.CSV}>CSV</SelectItem>
              <SelectItem value={ExportFormat.PNG}>PNG</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewDashboard
            metrics={currentMetrics}
            chartData={chartData}
            timeSeriesData={timeSeriesData}
            topDisputes={topDisputes}
            resolutionTrend={resolutionTrend}
            predictiveModel={predictiveModel}
            isLoading={isLoading}
            mobileView={mobileView}
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceDashboard
            metrics={currentMetrics}
            trendData={trendData}
            chartData={chartData}
            isLoading={isLoading}
            mobileView={mobileView}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <TrendsDashboard
            trendData={trendData}
            timeSeriesData={timeSeriesData}
            filters={filters}
            isLoading={isLoading}
            mobileView={mobileView}
          />
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <PatternsDashboard
            patterns={disputePatterns}
            predictiveModel={predictiveModel}
            isLoading={isLoading}
            mobileView={mobileView}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <AnalyticsReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const OverviewDashboard: React.FC<{
  metrics: PerformanceMetrics | null;
  chartData: any[];
  timeSeriesData: any[];
  topDisputes: DisputePattern[];
  resolutionTrend: any;
  predictiveModel: PredictiveModel | null;
  isLoading: boolean;
  mobileView: boolean;
}> = ({ metrics, chartData, timeSeriesData, topDisputes, resolutionTrend, predictiveModel, isLoading, mobileView }) => {
  const keyMetrics = [
    {
      title: 'Total Disputes',
      value: metrics?.totalDisputes || 0,
      change: resolutionTrend?.change || 0,
      icon: <BarChart3 className="h-5 w-5" />,
      format: 'number' as const
    },
    {
      title: 'Resolution Rate',
      value: metrics?.resolutionRate || 0,
      change: 2.1,
      icon: <CheckCircle className="h-5 w-5" />,
      format: 'percentage' as const
    },
    {
      title: 'Avg Resolution Time',
      value: metrics?.averageResolutionTime || 0,
      change: -8.3,
      icon: <Clock className="h-5 w-5" />,
      format: 'duration' as const
    },
    {
      title: 'User Satisfaction',
      value: metrics?.userSatisfactionRate || 0,
      change: 5.2,
      icon: <Users className="h-5 w-5" />,
      format: 'number' as const
    }
  ];

  return (
    <div className="space-y-6">
      <div className={`grid grid-cols-1 ${mobileView ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-4'} gap-4`}>
        {keyMetrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            changeType={metric.change > 0 ? 'increase' : metric.change < 0 ? 'decrease' : 'neutral'}
            format={metric.format}
            icon={metric.icon}
          />
        ))}
      </div>

      <div className={`grid grid-cols-1 ${mobileView ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-6`}>
        <div className="lg:col-span-2">
          <ChartContainer
            title="Dispute Volume Trend"
            description="Daily dispute volume over time"
            loading={isLoading}
          >
            <LineChartVisualization
              data={timeSeriesData}
              xKey="timestamp"
              yKey="value"
              height={300}
            />
          </ChartContainer>
        </div>

        <div>
          <ChartContainer
            title="Dispute Status Distribution"
            description="Current status breakdown"
            loading={isLoading}
          >
            <DonutChartVisualization
              data={chartData}
              nameKey="name"
              valueKey="value"
              height={300}
              centerText="Total"
              centerValue={chartData.reduce((sum, item) => sum + item.value, 0).toString()}
            />
          </ChartContainer>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${mobileView ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} gap-6`}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Top Dispute Types
            </CardTitle>
            <CardDescription>Most frequent dispute categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topDisputes.map((dispute, index) => (
                <div key={dispute.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl font-bold text-gray-400">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{dispute.type}</p>
                      <p className="text-sm text-gray-600">
                        {AnalyticsCalculator.formatDuration(dispute.averageResolutionTime)} avg
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{dispute.frequency}</p>
                    <p className="text-sm text-gray-600">
                      {dispute.successRate.toFixed(1)}% success
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {predictiveModel && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Predictive Insights
              </CardTitle>
              <CardDescription>AI-powered dispute risk assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Risk Score</span>
                  <div className="flex items-center space-x-2">
                    <ProgressRing
                      value={predictiveModel.riskScore}
                      max={100}
                      size={40}
                      color={predictiveModel.riskScore > 70 ? '#EF4444' : predictiveModel.riskScore > 40 ? '#F59E0B' : '#10B981'}
                    />
                    <span className="font-semibold">{predictiveModel.riskScore}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Key Recommendations:</p>
                  {predictiveModel.recommendations.slice(0, 3).map((rec, index) => (
                    <p key={index} className="text-sm text-gray-600">• {rec}</p>
                  ))}
                </div>

                <div className="text-sm text-gray-500">
                  Confidence: {(predictiveModel.confidence * 100).toFixed(0)}%
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const PerformanceDashboard: React.FC<{
  metrics: PerformanceMetrics | null;
  trendData: any[];
  chartData: any[];
  isLoading: boolean;
  mobileView: boolean;
}> = ({ metrics, trendData, chartData, isLoading, mobileView }) => {
  return (
    <div className="space-y-6">
      <div className={`grid grid-cols-1 ${mobileView ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} gap-6`}>
        <ChartContainer
          title="Resolution Performance"
          description="Key performance indicators"
          loading={isLoading}
        >
          <div className="grid grid-cols-2 gap-4">
            <GaugeVisualization
              value={metrics?.resolutionRate || 0}
              max={100}
              title="Resolution Rate"
              color="#10B981"
            />
            <GaugeVisualization
              value={metrics?.userSatisfactionRate || 0}
              max={5}
              title="Satisfaction Score"
              color="#3B82F6"
            />
          </div>
        </ChartContainer>

        <ChartContainer
          title="Performance Trends"
          description="Weekly performance comparison"
          loading={isLoading}
        >
          <AreaChartVisualization
            data={trendData}
            xKey="period"
            yKey="value"
            height={300}
            fillColor="#3B82F6"
          />
        </ChartContainer>
      </div>

      <ChartContainer
        title="Dispute Category Performance"
        description="Resolution rates by category"
        loading={isLoading}
      >
        <BarChartVisualization
          data={chartData}
          xKey="name"
          yKey="value"
          height={300}
          orientation="vertical"
        />
      </ChartContainer>
    </div>
  );
};

const TrendsDashboard: React.FC<{
  trendData: any[];
  timeSeriesData: any[];
  filters: DashboardFilters;
  isLoading: boolean;
  mobileView: boolean;
}> = ({ trendData, timeSeriesData, filters, isLoading, mobileView }) => {
  return (
    <div className="space-y-6">
      <ChartContainer
        title="Volume Trends"
        description="Dispute volume over time"
        loading={isLoading}
      >
        <LineChartVisualization
          data={timeSeriesData}
          xKey="timestamp"
          yKey="value"
          height={400}
        />
      </ChartContainer>

      <div className={`grid grid-cols-1 ${mobileView ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} gap-6`}>
        <ChartContainer
          title="Resolution Time Trends"
          description="Average resolution time changes"
          loading={isLoading}
        >
          <AreaChartVisualization
            data={trendData}
            xKey="period"
            yKey="value"
            height={300}
            fillColor="#F59E0B"
          />
        </ChartContainer>

        <ChartContainer
          title="Satisfaction Trends"
          description="User satisfaction over time"
          loading={isLoading}
        >
          <LineChartVisualization
            data={trendData}
            xKey="period"
            yKey="value"
            height={300}
            strokeColor="#10B981"
          />
        </ChartContainer>
      </div>
    </div>
  );
};

const PatternsDashboard: React.FC<{
  patterns: DisputePattern[];
  predictiveModel: PredictiveModel | null;
  isLoading: boolean;
  mobileView: boolean;
}> = ({ patterns, predictiveModel, isLoading, mobileView }) => {
  return (
    <div className="space-y-6">
      <div className={`grid grid-cols-1 ${mobileView ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} gap-6`}>
        <Card>
          <CardHeader>
            <CardTitle>Dispute Patterns</CardTitle>
            <CardDescription>Identified patterns in dispute data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patterns.slice(0, 5).map((pattern, index) => (
                <div key={pattern.type} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{pattern.type}</p>
                    <p className="text-sm text-gray-600">
                      {pattern.frequency} occurrences, {pattern.successRate.toFixed(1)}% success rate
                    </p>
                  </div>
                  <Badge variant={pattern.trend === 'increasing' ? 'destructive' : pattern.trend === 'decreasing' ? 'default' : 'secondary'}>
                    {pattern.trend}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {predictiveModel && (
          <Card>
            <CardHeader>
              <CardTitle>Risk Factors</CardTitle>
              <CardDescription>Factors contributing to dispute likelihood</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {predictiveModel.factors.map((factor, index) => (
                  <div key={factor.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{factor.name}</span>
                      <Badge variant={factor.impact === 'negative' ? 'destructive' : factor.impact === 'positive' ? 'default' : 'secondary'}>
                        {factor.impact}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${factor.weight * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600">{factor.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const FilterPanel: React.FC<{
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  onClose: () => void;
}> = ({ filters, onFiltersChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: DashboardFilters = {
      quickRange: '30d',
      dateRange: {
        from: subDays(new Date(), 30),
        to: new Date()
      }
    };
    setLocalFilters(resetFilters);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Status</Label>
          <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
            {Object.values(DisputeStatus).map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={status}
                  checked={localFilters.status?.includes(status) || false}
                  onChange={(e) => {
                    const current = localFilters.status || [];
                    if (e.target.checked) {
                      setLocalFilters({
                        ...localFilters,
                        status: [...current, status]
                      });
                    } else {
                      setLocalFilters({
                        ...localFilters,
                        status: current.filter(s => s !== status)
                      });
                    }
                  }}
                />
                <Label htmlFor={status} className="text-sm capitalize">
                  {status.replace('_', ' ')}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Type</Label>
          <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
            {Object.values(DisputeType).map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={type}
                  checked={localFilters.type?.includes(type) || false}
                  onChange={(e) => {
                    const current = localFilters.type || [];
                    if (e.target.checked) {
                      setLocalFilters({
                        ...localFilters,
                        type: [...current, type]
                      });
                    } else {
                      setLocalFilters({
                        ...localFilters,
                        type: current.filter(t => t !== type)
                      });
                    }
                  }}
                />
                <Label htmlFor={type} className="text-sm capitalize">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(AnalyticsDashboard);