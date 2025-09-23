'use client';

// TODO: Split this into smaller components
// FIXME: Performance issues with large datasets

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import {
  TrendingUp,
  TrendingDown,
  Star,
  Users,
  MessageSquare,
  Clock,
  Download,
  Filter,
  Calendar as CalendarIcon,
  RotateCcw,
  Settings,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Smartphone,
  Monitor,
  AlertCircle,
  CheckCircle,
  Target,
  Zap,
  Globe
} from 'lucide-react';

import { useReviewAnalytics } from '@/hooks/use-review-analytics';
import {
  EnhancedMetricCard,
  TimeSeriesChart,
  RatingDistributionChart,
  MultiChartComparison,
  ProgressRing,
  Heatmap
} from './analytics-visualization';
import ReviewReports from './review-reports';
import {
  DateRange,
  ChartType,
  MetricCard,
  TimeSeriesDataPoint
} from '@/types/review-analytics.types';
import { 
  formatDate, 
  getDateRange, 
  calculateChangePercentage,
  calculateTrendDirection,
  generateColorPalette
} from '@/utils/analytics-helpers';

// Quick Date Range Selector
interface DateRangeSelectorProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
}

function DateRangeSelector({ selectedRange, onRangeChange }: DateRangeSelectorProps) {
  const [isCustom, setIsCustom] = useState(false);

  const presetRanges = [
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Last 90 days', value: '90d' },
    { label: 'Last year', value: '1y' },
    { label: 'Custom', value: 'custom' }
  ] as const;

  const handlePresetSelect = (value: string) => {
    if (value === 'custom') {
      setIsCustom(true);
    } else {
      setIsCustom(false);
      const newRange = getDateRange(value as '7d' | '30d' | '90d' | '1y');
      onRangeChange(newRange);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Select onValueChange={handlePresetSelect}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          {presetRanges.map(range => (
            <SelectItem key={range.value} value={range.value}>
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isCustom && (
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {formatDate(selectedRange.startDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedRange.startDate}
                onSelect={(date) => date && onRangeChange({
                  ...selectedRange,
                  startDate: date
                })}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <span className="text-sm text-gray-500">to</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {formatDate(selectedRange.endDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedRange.endDate}
                onSelect={(date) => date && onRangeChange({
                  ...selectedRange,
                  endDate: date
                })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}

// Key Metrics Overview
interface KeyMetricsOverviewProps {
  performanceMetrics: any;
  behaviorAnalytics: any;
  reputationTrends: any;
  isLoading: boolean;
}

function KeyMetricsOverview({ 
  performanceMetrics, 
  behaviorAnalytics, 
  reputationTrends, 
  isLoading 
}: KeyMetricsOverviewProps) {
  const metrics = useMemo(() => {
    if (!performanceMetrics) return [];

    return [
      {
        title: 'Total Reviews',
        value: performanceMetrics.totalReviews || 0,
        change: 12.5,
        changeType: 'increase' as const,
        format: 'number' as const,
        trend: performanceMetrics.reviewsOverTime?.slice(-7) || []
      },
      {
        title: 'Average Rating',
        value: performanceMetrics.averageRating || 0,
        change: 2.3, // hardcoded for now
        changeType: 'increase' as const,
        format: 'number' as const
      },
      {
        title: 'Review Completion Rate',
        value: performanceMetrics.reviewCompletionRate || 0,
        change: -1.2,
        changeType: 'decrease' as const,
        format: 'percentage' as const
      },
      {
        title: 'User Engagement',
        value: behaviorAnalytics?.userEngagement?.reviewInteractionRate || 0,
        change: 8.7,
        changeType: 'increase' as const,
        format: 'percentage' as const
      }
    ];
  }, [performanceMetrics, behaviorAnalytics]); // TODO: Move this calculation to the backend

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))} {/* basic loading skeleton */}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <EnhancedMetricCard
          key={index}
          metric={metric}
          showTrend={true}
          interactive={true}
        />
      ))}
    </div>
  );
}

// Performance tab - keeps crashing with large datasets
interface PerformanceDashboardProps {
  performanceMetrics: any;
  chartData: any;
  isLoading: boolean;
}

function PerformanceDashboard({ performanceMetrics, chartData, isLoading }: PerformanceDashboardProps) {
  const [chartType, setChartType] = useState<ChartType>('line');
  const [showGrid, setShowGrid] = useState(true); // users always want this on anyway

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Performance Overview</h3>
        <div className="flex items-center gap-2">
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as any)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="area">Area Chart</option>
          </select>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-3 py-1 text-sm border rounded-md ${showGrid ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-700'}`}
          >
            Grid: {showGrid ? 'On' : 'Off'}
          </button>
          <button
            onClick={() => toast.success('Chart exported successfully')} // TODO: implement actual export
            className="px-3 py-1 text-sm border rounded-md bg-white text-gray-700 hover:bg-gray-50"
          >
            Export
          </button>
          <button
            onClick={() => toast.success('Data refreshed')}
            className="px-3 py-1 text-sm border rounded-md bg-white text-gray-700 hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reviews Over Time */}
        {performanceMetrics?.reviewsOverTime && (
          <TimeSeriesChart
            data={performanceMetrics.reviewsOverTime}
            title="Reviews Over Time"
            height={300}
            showBrush={true}
            showGrid={showGrid}
            type={chartType === 'pie' || chartType === 'scatter' || chartType === 'heatmap' || chartType === 'funnel' || chartType === 'gauge' ? 'line' : chartType}
            yAxisLabel="Number of Reviews"
          />
        )}

        {/* Rating Distribution */}
        {performanceMetrics?.ratingDistribution && (
          <RatingDistributionChart
            distribution={performanceMetrics.ratingDistribution}
            title="Rating Distribution"
            height={300}
            showPercentages={true}
            interactive={true}
          />
        )}

        {/* Response Time Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Response Time Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Response Time</span>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{performanceMetrics?.responseTime?.average?.toFixed(1) || 0}h</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Median Response Time</span>
                <span>{performanceMetrics?.responseTime?.median?.toFixed(1) || 0}h</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">95th Percentile</span>
                <span>{performanceMetrics?.responseTime?.percentile95?.toFixed(1) || 0}h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submission vs Completion Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Submission Rate</span>
                  <span>{performanceMetrics?.reviewSubmissionRate?.toFixed(1) || 0}%</span>
                </div>
                <ProgressRing
                  value={performanceMetrics?.reviewSubmissionRate || 0}
                  max={100}
                  size={80}
                  color="#3b82f6"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Completion Rate</span>
                  <span>{performanceMetrics?.reviewCompletionRate?.toFixed(1) || 0}%</span>
                </div>
                <ProgressRing
                  value={performanceMetrics?.reviewCompletionRate || 0}
                  max={100}
                  size={80}
                  color="#10b981"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// User Behavior Dashboard Tab
interface BehaviorDashboardProps {
  behaviorAnalytics: any;
  isLoading: boolean;
}

function BehaviorDashboard({ behaviorAnalytics, isLoading }: BehaviorDashboardProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!behaviorAnalytics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No behavior data available</h3>
            <p className="text-gray-600">Behavior analytics data is being collected.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const deviceData = [
    { name: 'Desktop', value: behaviorAnalytics.deviceUsage?.desktop || 0 },
    { name: 'Mobile', value: behaviorAnalytics.deviceUsage?.mobile || 0 },
    { name: 'Tablet', value: behaviorAnalytics.deviceUsage?.tablet || 0 }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">User Behavior Analysis</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">User Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg. Time on Review Page</span>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{behaviorAnalytics.userEngagement?.averageTimeOnReviewPage || 0}s</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Interaction Rate</span>
                <span>{behaviorAnalytics.userEngagement?.reviewInteractionRate?.toFixed(1) || 0}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Repeat Reviewers</span>
                <span>{behaviorAnalytics.userEngagement?.repeatReviewers || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Abandonment Rate</span>
                <span>{behaviorAnalytics.userEngagement?.reviewAbandonmentRate?.toFixed(1) || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reading Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reading Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg. Read Time</span>
                <span>{behaviorAnalytics.reviewReadingPatterns?.averageReadTime || 0}s</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completion Rate</span>
                <span>{behaviorAnalytics.reviewReadingPatterns?.readingCompletionRate?.toFixed(1) || 0}%</span>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium">Scroll Depth</span>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>25%</span>
                    <span>{behaviorAnalytics.reviewReadingPatterns?.scrollDepthMetrics?.quarter || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>50%</span>
                    <span>{behaviorAnalytics.reviewReadingPatterns?.scrollDepthMetrics?.half || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>75%</span>
                    <span>{behaviorAnalytics.reviewReadingPatterns?.scrollDepthMetrics?.threeQuarters || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>100%</span>
                    <span>{behaviorAnalytics.reviewReadingPatterns?.scrollDepthMetrics?.complete || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Device Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceData.map((device, index) => {
                // Quick icon mapping - tablet should probably have its own icon
                const icons = {
                  Desktop: Monitor,
                  Mobile: Smartphone,
                  Tablet: Monitor
                };
                const Icon = icons[device.name as keyof typeof icons];
                
                return (
                  <div key={device.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">{device.name}</span>
                    </div>
                    <span>{device.value.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Rating Behavior Trends */}
        {behaviorAnalytics.ratingBehavior?.ratingTrends && (
          <TimeSeriesChart
            data={behaviorAnalytics.ratingBehavior.ratingTrends}
            title="Rating Behavior Trends"
            height={250}
            color="#f59e0b"
            yAxisLabel="Average Rating"
          />
        )}
      </div>
    </div>
  );
}

// Reputation dashboard - needs more business metrics
interface ReputationDashboardProps {
  reputationTrends: any;
  isLoading: boolean;
}

function ReputationDashboard({ reputationTrends, isLoading }: ReputationDashboardProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!reputationTrends) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reputation data available</h3>
            <p className="text-gray-600">Still collecting data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Reputation Overview</h3> {/* TODO: Add business-relevant metrics */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Overall Reputation Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Avg. Rating</span>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{reputationTrends.overallTrends?.currentPeriod?.averageRating?.toFixed(2) || 0}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Reviews</span>
                <span>{reputationTrends.overallTrends?.currentPeriod?.totalReviews || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">High Rated Users</span>
                <span>{reputationTrends.overallTrends?.currentPeriod?.highRatedUsers || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Trend Direction</span>
                <div className="flex items-center space-x-2">
                  {reputationTrends.overallTrends?.trendDirection === 'up' && (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  )}
                  {reputationTrends.overallTrends?.trendDirection === 'down' && (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className="capitalize">{reputationTrends.overallTrends?.trendDirection || 'stable'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projected Trends */}
        {reputationTrends.overallTrends?.projectedTrend && (
          <TimeSeriesChart
            data={reputationTrends.overallTrends.projectedTrend}
            title="Projected Reputation Trends"
            height={250}
            color="#8b5cf6"
            yAxisLabel="Projected Rating"
          />
        )}

        {/* Segment Comparison */}
        {Object.keys(reputationTrends.segmentTrends || {}).length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Segment Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(reputationTrends.segmentTrends || {}).map(([segment, data]: [string, any]) => (
                  <div key={segment} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2 capitalize">{segment.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Avg. Rating:</span>
                        <span>{data.currentPeriod?.averageRating?.toFixed(2) || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Reviews:</span>
                        <span>{data.currentPeriod?.totalReviews || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Change:</span>
                        <div className="flex items-center space-x-1">
                          {data.trendDirection === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                          {data.trendDirection === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                          <span className={`text-xs ${
                            data.trendDirection === 'up' ? 'text-green-500' : 
                            data.trendDirection === 'down' ? 'text-red-500' : 'text-gray-500'
                          }`}>
                            {Math.abs(data.changePercentage || 0).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Main Analytics Dashboard Component
export default function AnalyticsDashboard() {
  const {
    performanceMetrics,
    behaviorAnalytics,
    reputationTrends,
    realtimeMetrics,
    isLoading,
    hasErrors,
    chartData,
    dateRange,
    updateDateRange,
    clearFilters,
    refresh,
    exportData
  } = useReviewAnalytics({
    autoRefresh: true,
    refreshInterval: 30000, // 30 sec refresh - probably too frequent for production
    enableRealTime: true
  });

  const [activeTab, setActiveTab] = useState('overview');
  // const [mobileView, setMobileView] = useState(false); // not using mobile view yet

  // TODO: Implement mobile responsiveness
  // useEffect(() => {
  //   const checkMobile = () => {
  //     setMobileView(window.innerWidth < 768);
  //   };
  //   
  //   checkMobile();
  //   window.addEventListener('resize', checkMobile);
  //   return () => window.removeEventListener('resize', checkMobile);
  // }, []);

  const handleExport = async () => {
    try {
      // Basic export config
      const exportConfig = {
        format: 'pdf' as const,
        includeCharts: true,
        includeRawData: true,
        filename: `review-analytics-${formatDate(new Date())}`
      };
      
      const result = await exportData(exportConfig, [
        performanceMetrics,
        behaviorAnalytics,
        reputationTrends
      ]);
      
      if (result.success && result.url) {
        window.open(result.url, '_blank');
        toast.success('Analytics exported successfully');
      }
    } catch (error) {
      toast.error('Failed to export analytics');
    }
  };

  if (hasErrors) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to load analytics</h3>
            <p className="text-red-600 mb-4">There was an error loading the analytics data.</p>
            <Button onClick={refresh} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-3xl">
            Review Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            Comprehensive insights into review performance and user behavior
          </p>
        </div>
        
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 lg:flex-shrink-0">
          {/* Date Range Selector - Full width on mobile */}
          <div className="w-full sm:w-auto">
            <DateRangeSelector
              selectedRange={dateRange}
              onRangeChange={updateDateRange}
            />
          </div>
          
          {/* Action Buttons Row */}
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Filters</span>
                  <span className="sm:hidden">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <Users className="h-4 w-4 mr-2" />
                  User Segments
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Globe className="h-4 w-4 mr-2" />
                  Regions
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearFilters}>
                  Clear All Filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" size="sm" onClick={handleExport} className="flex-1 sm:flex-none">
              <Download className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            
            <Button variant="outline" size="sm" onClick={refresh} className="px-2 sm:px-3">
              <RotateCcw className="h-4 w-4" />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <KeyMetricsOverview
        performanceMetrics={performanceMetrics}
        behaviorAnalytics={behaviorAnalytics}
        reputationTrends={reputationTrends}
        isLoading={isLoading}
      />

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-max min-w-full sm:grid sm:w-full sm:grid-cols-4 h-auto p-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm whitespace-nowrap">
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-xs sm:text-sm whitespace-nowrap">
              Performance
            </TabsTrigger>
            <TabsTrigger value="behavior" className="text-xs sm:text-sm whitespace-nowrap">
              Behavior
            </TabsTrigger>
            <TabsTrigger value="reputation" className="text-xs sm:text-sm whitespace-nowrap">
              Reputation
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Basic overview charts */}
          {chartData && (
            <MultiChartComparison
              datasets={[
                {
                  name: 'Reviews',
                  data: performanceMetrics?.reviewsOverTime || [],
                  color: '#3b82f6'
                },
                {
                  name: 'Avg Rating', 
                  data: performanceMetrics?.reviewsOverTime?.map((point: TimeSeriesDataPoint) => ({
                    ...point,
                    value: performanceMetrics.averageRating || 0 // FIXME: should be actual rating over time
                  })) || [],
                  color: '#f59e0b'
                }
              ]}
              title="Business Overview"
              height={400}
            />
          )}
          
          {/* Current metrics */}
          {realtimeMetrics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span>Live Data</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {realtimeMetrics.slice(0, 3).map((metric, index) => (
                    <EnhancedMetricCard
                      key={index}
                      metric={metric}
                      size="sm"
                      showTrend={false}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceDashboard
            performanceMetrics={performanceMetrics}
            chartData={chartData}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="behavior">
          <BehaviorDashboard
            behaviorAnalytics={behaviorAnalytics}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="reputation">
          <ReputationDashboard
            reputationTrends={reputationTrends}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Custom Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewReports />
        </CardContent>
      </Card>
    </div>
  );
}