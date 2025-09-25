'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Button,
} from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Badge,
} from '@/components/ui/badge';
import {
  Input,
} from '@/components/ui/input';
import {
  Label,
} from '@/components/ui/label';
import {
  DatePicker,
} from '@/components/ui/date-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Checkbox,
} from '@/components/ui/checkbox';
import {
  ApplicationAnalyticsFilter,
  ApplicationStatus,
  ApplicationSource,
  EngagementLevel,
  VisualizationType,
} from '@/types/application-analytics.types';
import { useApplicationAnalytics } from '@/hooks/use-application-analytics';
import { ApplicationAnalyticsCalculator } from '@/utils/analytics-helpers';
import { AnalyticsVisualization, MetricCard } from './analytics-visualization';
import { ApplicationReports } from './application-reports';

interface AnalyticsDashboardProps {
  className?: string;
}

interface FilterPanelProps {
  filters: ApplicationAnalyticsFilter;
  onFiltersChange: (filters: ApplicationAnalyticsFilter) => void;
  onClearFilters: () => void;
}

interface KPIGridProps {
  performanceMetrics: any;
  trends: any[];
  loading: boolean;
}

interface InsightsPanelProps {
  insights: string[];
  predictiveAnalytics: any;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const updateDateRange = (field: 'from' | 'to', date: Date | undefined) => {
    if (date) {
      onFiltersChange({
        ...filters,
        dateRange: {
          ...filters.dateRange,
          [field]: date,
        },
      });
    }
  };

  const toggleStatus = (status: ApplicationStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];

    onFiltersChange({
      ...filters,
      status: newStatuses.length > 0 ? newStatuses : undefined,
    });
  };

  const toggleSource = (source: ApplicationSource) => {
    const currentSources = filters.source || [];
    const newSources = currentSources.includes(source)
      ? currentSources.filter(s => s !== source)
      : [...currentSources, source];

    onFiltersChange({
      ...filters,
      source: newSources.length > 0 ? newSources : undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between items-center'>
          <CardTitle className='text-lg'>Filters</CardTitle>
          <div className='space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              {filtersOpen ? 'Hide' : 'Show'} Filters
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={onClearFilters}
            >
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      {filtersOpen && (
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>From Date</Label>
              <DatePicker
                date={filters.dateRange.from}
                onSelect={(date) => updateDateRange('from', date)}
              />
            </div>
            <div className='space-y-2'>
              <Label>To Date</Label>
              <DatePicker
                date={filters.dateRange.to}
                onSelect={(date) => updateDateRange('to', date)}
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Application Status</Label>
            <div className='grid grid-cols-3 gap-2'>
              {Object.values(ApplicationStatus).map(status => (
                <div key={status} className='flex items-center space-x-2'>
                  <Checkbox
                    id={`status-${status}`}
                    checked={filters.status?.includes(status) || false}
                    onCheckedChange={() => toggleStatus(status)}
                  />
                  <Label htmlFor={`status-${status}`} className='text-sm'>
                    {status.replace(/_/g, ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Application Source</Label>
            <div className='grid grid-cols-3 gap-2'>
              {Object.values(ApplicationSource).map(source => (
                <div key={source} className='flex items-center space-x-2'>
                  <Checkbox
                    id={`source-${source}`}
                    checked={filters.source?.includes(source) || false}
                    onCheckedChange={() => toggleSource(source)}
                  />
                  <Label htmlFor={`source-${source}`} className='text-sm'>
                    {source.replace(/_/g, ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Min Project Value</Label>
              <Input
                type='number'
                placeholder='0'
                value={filters.projectValueRange?.min || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  projectValueRange: {
                    min: parseInt(e.target.value) || 0,
                    max: filters.projectValueRange?.max || 100000,
                  },
                })}
              />
            </div>
            <div className='space-y-2'>
              <Label>Max Project Value</Label>
              <Input
                type='number'
                placeholder='100000'
                value={filters.projectValueRange?.max || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  projectValueRange: {
                    min: filters.projectValueRange?.min || 0,
                    max: parseInt(e.target.value) || 100000,
                  },
                })}
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Success Rate Threshold (%)</Label>
            <Input
              type='number'
              min='0'
              max='100'
              placeholder='Enter minimum success rate'
              value={filters.successRate || ''}
              onChange={(e) => onFiltersChange({
                ...filters,
                successRate: parseInt(e.target.value) || undefined,
              })}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
};

const KPIGrid: React.FC<KPIGridProps> = ({
  performanceMetrics,
  trends,
  loading,
}) => {
  if (loading || !performanceMetrics) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className='animate-pulse'>
            <CardContent className='p-6'>
              <div className='h-16 bg-gray-200 rounded'></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getTrendValue = (metric: string) => {
    const trend = trends.find(t => t.period === trends[trends.length - 1]?.period);
    return trend ? trend.changePercentage : 0;
  };

  const getTrendDirection = (value: number): 'up' | 'down' | 'stable' => {
    if (Math.abs(value) < 1) return 'stable';
    return value > 0 ? 'up' : 'down';
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      <MetricCard
        title='Total Applications'
        value={ApplicationAnalyticsCalculator.formatNumber(performanceMetrics.totalApplications)}
        change={getTrendValue('applications')}
        trend={getTrendDirection(getTrendValue('applications'))}
        description='Applications received'
      />
      <MetricCard
        title='Success Rate'
        value={ApplicationAnalyticsCalculator.formatPercentage(performanceMetrics.successRate)}
        change={getTrendValue('successRate')}
        trend={getTrendDirection(getTrendValue('successRate'))}
        description='Applications accepted'
      />
      <MetricCard
        title='Avg Decision Time'
        value={ApplicationAnalyticsCalculator.formatDuration(performanceMetrics.averageDecisionTime)}
        change={getTrendValue('decisionTime')}
        trend={getTrendDirection(-getTrendValue('decisionTime'))} // Negative because lower is better
        description='Time to make decision'
      />
      <MetricCard
        title='Avg Project Value'
        value={ApplicationAnalyticsCalculator.formatCurrency(performanceMetrics.averageProjectValue)}
        change={getTrendValue('projectValue')}
        trend={getTrendDirection(getTrendValue('projectValue'))}
        description='Average project worth'
      />
    </div>
  );
};

const InsightsPanel: React.FC<InsightsPanelProps> = ({
  insights,
  predictiveAnalytics,
}) => {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>AI-generated insights from your application data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <div key={index} className='p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500'>
                  <p className='text-sm text-blue-800'>{insight}</p>
                </div>
              ))
            ) : (
              <p className='text-gray-500'>No insights available. Try adjusting your filters or date range.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {predictiveAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle>Success Prediction</CardTitle>
            <CardDescription>ML-powered application success forecasting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='text-center'>
                <div className='text-3xl font-bold text-green-600'>
                  {predictiveAnalytics.applicationSuccessPrediction.successProbability.toFixed(1)}%
                </div>
                <p className='text-sm text-gray-600'>Predicted Success Rate</p>
              </div>

              <div className='space-y-2'>
                <h4 className='font-medium'>Top Success Factors:</h4>
                {predictiveAnalytics.applicationSuccessPrediction.factors
                  .filter((f: any) => f.impact === 'positive')
                  .slice(0, 3)
                  .map((factor: any, index: number) => (
                    <div key={index} className='flex justify-between items-center text-sm'>
                      <span>{factor.name}</span>
                      <Badge variant='outline'>{(factor.weight * 100).toFixed(0)}%</Badge>
                    </div>
                  ))}
              </div>

              {predictiveAnalytics.applicationSuccessPrediction.recommendations.length > 0 && (
                <div className='space-y-2'>
                  <h4 className='font-medium'>Recommendations:</h4>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    {predictiveAnalytics.applicationSuccessPrediction.recommendations.slice(0, 3).map((rec: string, index: number) => (
                      <li key={index} className='flex items-start'>
                        <span className='mr-2'>•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className = '',
}) => {
  const {
    applications,
    performanceMetrics,
    trends,
    userPatterns,
    predictiveAnalytics,
    chartData,
    timeSeriesData,
    mobileAnalytics,
    securityAnalytics,
    insights,
    loading,
    error,
    fetchApplications,
    fetchPerformanceMetrics,
    fetchTrends,
    fetchUserPatterns,
    fetchPredictiveAnalytics,
    fetchChartData,
    fetchTimeSeriesData,
    fetchMobileAnalytics,
    fetchSecurityAnalytics,
    fetchInsights,
    applyFilters,
    clearFilters,
    currentFilters,
  } = useApplicationAnalytics({
    autoRefresh: true,
    refreshInterval: 60000, // 1 minute
    enableRealtime: true,
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [chartType, setChartType] = useState<'status' | 'source' | 'projectType'>('status');
  const [trendsPeriod, setTrendsPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [trendsMetric, setTrendsMetric] = useState<'count' | 'success_rate' | 'average_value'>('count');

  const defaultFilters: ApplicationAnalyticsFilter = useMemo(() => ({
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      to: new Date(),
    },
  }), []);

  const activeFilters = currentFilters || defaultFilters;

  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        fetchApplications(activeFilters),
        fetchPerformanceMetrics(activeFilters),
        fetchTrends(trendsPeriod, trendsMetric, activeFilters),
        fetchChartData(chartType, activeFilters),
        fetchInsights(activeFilters),
      ]);
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'predictive') {
      fetchPredictiveAnalytics(activeFilters);
    } else if (activeTab === 'users') {
      fetchUserPatterns(activeFilters);
    } else if (activeTab === 'mobile') {
      fetchMobileAnalytics(activeFilters);
    } else if (activeTab === 'security') {
      fetchSecurityAnalytics(activeFilters);
    }
  }, [activeTab, activeFilters]);

  useEffect(() => {
    fetchTrends(trendsPeriod, trendsMetric, activeFilters);
  }, [trendsPeriod, trendsMetric, activeFilters]);

  useEffect(() => {
    fetchChartData(chartType, activeFilters);
  }, [chartType, activeFilters]);

  const handleFiltersChange = (filters: ApplicationAnalyticsFilter) => {
    applyFilters(filters);
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className='p-6'>
          <div className='text-center text-red-600'>
            <p className='text-lg font-medium'>Error loading analytics data</p>
            <p>{error}</p>
            <Button
              className='mt-4'
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold'>Application Analytics Dashboard</h1>
          <p className='text-gray-600'>
            Comprehensive insights into application performance and user behavior
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Badge variant='secondary'>
            {applications.length} Applications
          </Badge>
          {loading.lastUpdated && (
            <Badge variant='outline'>
              Updated: {loading.lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
        </div>
      </div>

      <FilterPanel
        filters={activeFilters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={clearFilters}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-6'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='trends'>Trends</TabsTrigger>
          <TabsTrigger value='users'>Users</TabsTrigger>
          <TabsTrigger value='predictive'>Predictive</TabsTrigger>
          <TabsTrigger value='mobile'>Mobile</TabsTrigger>
          <TabsTrigger value='reports'>Reports</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          <KPIGrid
            performanceMetrics={performanceMetrics}
            trends={trends}
            loading={loading.isLoading}
          />

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <h3 className='text-lg font-medium'>Applications by {chartType}</h3>
                <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                  <SelectTrigger className='w-32'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='status'>Status</SelectItem>
                    <SelectItem value='source'>Source</SelectItem>
                    <SelectItem value='projectType'>Project Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <AnalyticsVisualization
                data={chartData}
                type={VisualizationType.PIE_CHART}
                height={300}
              />
            </div>

            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Application Timeline</h3>
              <AnalyticsVisualization
                data={timeSeriesData}
                type={VisualizationType.LINE_CHART}
                height={300}
              />
            </div>
          </div>

          <InsightsPanel
            insights={insights}
            predictiveAnalytics={predictiveAnalytics}
          />
        </TabsContent>

        <TabsContent value='trends' className='space-y-6'>
          <div className='flex justify-between items-center'>
            <h2 className='text-2xl font-bold'>Application Trends</h2>
            <div className='flex space-x-2'>
              <Select value={trendsPeriod} onValueChange={(value: any) => setTrendsPeriod(value)}>
                <SelectTrigger className='w-32'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='daily'>Daily</SelectItem>
                  <SelectItem value='weekly'>Weekly</SelectItem>
                  <SelectItem value='monthly'>Monthly</SelectItem>
                </SelectContent>
              </Select>
              <Select value={trendsMetric} onValueChange={(value: any) => setTrendsMetric(value)}>
                <SelectTrigger className='w-40'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='count'>Application Count</SelectItem>
                  <SelectItem value='success_rate'>Success Rate</SelectItem>
                  <SelectItem value='average_value'>Average Value</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <AnalyticsVisualization
              data={trends.map(t => ({ name: t.period, value: t.applications }))}
              type={VisualizationType.AREA_CHART}
              title='Applications Over Time'
              height={400}
            />
            <AnalyticsVisualization
              data={trends.map(t => ({ name: t.period, value: t.successRate }))}
              type={VisualizationType.LINE_CHART}
              title='Success Rate Trend'
              height={400}
            />
          </div>

          {performanceMetrics?.topSkills && (
            <AnalyticsVisualization
              data={performanceMetrics.topSkills.map((skill: any) => ({
                name: skill.skill,
                value: skill.count,
              }))}
              type={VisualizationType.BAR_CHART}
              title='Most In-Demand Skills'
              height={300}
            />
          )}
        </TabsContent>

        <TabsContent value='users' className='space-y-6'>
          <h2 className='text-2xl font-bold'>User Behavior Analytics</h2>

          {userPatterns && userPatterns.length > 0 && (
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <AnalyticsVisualization
                data={userPatterns.slice(0, 10).map(pattern => ({
                  name: `User ${pattern.userId.slice(-4)}`,
                  value: pattern.engagementScore,
                }))}
                type={VisualizationType.BAR_CHART}
                title='Top User Engagement Scores'
                height={300}
              />
              <AnalyticsVisualization
                data={userPatterns.slice(0, 10).map(pattern => ({
                  name: `User ${pattern.userId.slice(-4)}`,
                  value: pattern.successPrediction,
                }))}
                type={VisualizationType.SCATTER_PLOT}
                title='Success Prediction vs Users'
                height={300}
              />
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>User Behavior Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              {userPatterns && userPatterns.length > 0 ? (
                <AnalyticsVisualization
                  data={userPatterns.slice(0, 20).map(pattern => ({
                    name: `User ${pattern.userId.slice(-6)}`,
                    value: pattern.engagementScore,
                    percentage: pattern.successPrediction,
                    metadata: {
                      applicationFrequency: pattern.applicationFrequency,
                      averageQuality: pattern.averageApplicationQuality,
                      devicePreference: pattern.devicePreference.mobile > 50 ? 'Mobile' : 'Desktop'
                    }
                  }))}
                  type={VisualizationType.TABLE}
                />
              ) : (
                <p className='text-gray-500'>Loading user patterns...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='predictive' className='space-y-6'>
          <h2 className='text-2xl font-bold'>Predictive Analytics</h2>

          {predictiveAnalytics ? (
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Success Prediction Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnalyticsVisualization
                    data={[{ name: 'Success Probability', value: predictiveAnalytics.applicationSuccessPrediction.successProbability }]}
                    type={VisualizationType.GAUGE}
                    height={200}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnalyticsVisualization
                    data={predictiveAnalytics.marketTrends.map((trend: any) => ({
                      name: trend.skill,
                      value: trend.growthRate,
                    }))}
                    type={VisualizationType.BAR_CHART}
                    height={300}
                  />
                </CardContent>
              </Card>

              <Card className='lg:col-span-2'>
                <CardHeader>
                  <CardTitle>Platform Optimization Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {predictiveAnalytics.platformOptimization.map((rec: any, index: number) => (
                      <div key={index} className='p-4 border rounded-lg'>
                        <div className='flex justify-between items-start mb-2'>
                          <h4 className='font-medium'>{rec.area}</h4>
                          <div className='flex space-x-2'>
                            <Badge variant={rec.impact === 'high' ? 'destructive' : rec.impact === 'medium' ? 'secondary' : 'outline'}>
                              {rec.impact} impact
                            </Badge>
                            <Badge variant='outline'>{rec.effort} effort</Badge>
                          </div>
                        </div>
                        <p className='text-gray-600 text-sm mb-2'>{rec.description}</p>
                        <div className='flex justify-between text-sm'>
                          <span>Expected improvement: {rec.expectedImprovement}%</span>
                          <span>Timeframe: {rec.timeframe}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className='p-12 text-center'>
                <p className='text-gray-500'>Loading predictive analytics...</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='mobile' className='space-y-6'>
          <h2 className='text-2xl font-bold'>Mobile Analytics</h2>

          {mobileAnalytics && mobileAnalytics.length > 0 ? (
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <AnalyticsVisualization
                data={mobileAnalytics.map((mobile, index) => ({
                  name: mobile.deviceType,
                  value: mobile.performanceMetrics.appLaunchTime,
                }))}
                type={VisualizationType.BAR_CHART}
                title='App Launch Time by Device'
                height={300}
              />
              <AnalyticsVisualization
                data={mobileAnalytics.map((mobile, index) => ({
                  name: mobile.operatingSystem,
                  value: mobile.performanceMetrics.screenLoadTime,
                }))}
                type={VisualizationType.PIE_CHART}
                title='Screen Load Time by OS'
                height={300}
              />
            </div>
          ) : (
            <Card>
              <CardContent className='p-12 text-center'>
                <p className='text-gray-500'>No mobile analytics data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='reports' className='space-y-6'>
          <ApplicationReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;