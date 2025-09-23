// Demo page for review analytics

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  BarChart3,
  TrendingUp,
  Users,
  Star,
  MessageSquare,
  Activity,
  Smartphone,
  Monitor,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Download,
  Eye,
  Settings
} from 'lucide-react';

import AnalyticsDashboard from '@/components/reviews/analytics-dashboard';
import ReviewReports from '@/components/reviews/review-reports';
import {
  EnhancedMetricCard,
  TimeSeriesChart,
  RatingDistributionChart,
  MultiChartComparison,
  ProgressRing,
  Heatmap
} from '@/components/reviews/analytics-visualization';
import {
  PredictiveAnalyticsDashboard,
  TrendForecastVisualization,
  MLPipelineManager,
  AdvancedConfiguration
} from '@/components/reviews/advanced-analytics-features';

import {
  MetricCard,
  TimeSeriesDataPoint,
  RatingDistribution,
  DateRange
} from '@/types/review-analytics.types';

function generateMockTimeSeriesData(days: number = 30): TimeSeriesDataPoint[] {
  const data: TimeSeriesDataPoint[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // FIXME: This should probably use real data at some point
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const value = ((i * 13) % 40) + 10; 
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: value,
      label: `${value} reviews`
    });
  }
  return data;
}

function generateMockRatingDistribution(): RatingDistribution {
  return {
    oneStar: 25,
    twoStar: 18,
    threeStar: 35,
    fourStar: 85,
    fiveStar: 137
  };
}

function generateMockMetrics(): MetricCard[] {
  return [
    {
      title: 'Total Reviews',
      value: 2456,
      change: 12.5,
      changeType: 'increase',
      format: 'number'
    },
    {
      title: 'Average Rating', 
      value: 4.2,
      change: 2.3,
      changeType: 'increase',
      format: 'number'
    },
    {
      title: 'Completion Rate',
      value: 87.5,
      change: -1.2,
      changeType: 'decrease',
      format: 'percentage'
    }
  ];
}

function generateMockHeatmapData() {
  const data = [];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
    for (let hourIndex = 0; hourIndex < hours.length; hourIndex++) {
      data.push({
        x: hours[hourIndex],
        y: days[dayIndex],
        value: ((dayIndex * 24 + hourIndex) * 17) % 100
      });
    }
  }

  return data;
}

function generateMockPredictiveModels() {
  return [
    {
      id: 'review-likelihood-1',
      name: 'Review Likelihood Predictor',
      type: 'review_likelihood' as const,
      accuracy: 0.847,
      lastTrained: new Date('2024-01-15'),
      features: ['user_activity', 'project_type', 'past_reviews', 'engagement_score'],
      parameters: { learningRate: 0.001, epochs: 100 },
      status: 'active' as const
    },
    {
      id: 'quality-prediction-1',
      name: 'Review Quality Predictor',
      type: 'quality_prediction' as const,
      accuracy: 0.723,
      lastTrained: new Date('2024-01-10'),
      features: ['review_length', 'sentiment', 'user_history', 'project_complexity'],
      parameters: { layers: 3, neurons: 128 },
      status: 'training' as const
    },
    {
      id: 'sentiment-analysis-1',
      name: 'Sentiment Analyzer',
      type: 'sentiment_analysis' as const,
      accuracy: 0.912,
      lastTrained: new Date('2024-01-20'),
      features: ['review_text', 'rating', 'user_context'],
      parameters: { model: 'transformer', maxLength: 512 },
      status: 'active' as const
    }
  ];
}

function generateMockMLPipelines() {
  return [
    {
      id: 'pipeline-1',
      name: 'Daily Review Processing',
      stages: [
        { id: 'stage-1', name: 'Data Ingestion', type: 'data_ingestion' as const, config: {}, status: 'completed' as const },
        { id: 'stage-2', name: 'Preprocessing', type: 'preprocessing' as const, config: {}, status: 'completed' as const },
        { id: 'stage-3', name: 'Feature Engineering', type: 'feature_engineering' as const, config: {}, status: 'running' as const },
        { id: 'stage-4', name: 'Model Training', type: 'model_training' as const, config: {}, status: 'pending' as const }
      ],
      schedule: '0 2 * * *',
      lastRun: new Date('2024-01-20'),
      status: 'running' as const,
      metrics: {
        accuracy: 0.856,
        precision: 0.834,
        recall: 0.789,
        f1Score: 0.811,
        trainingLoss: 0.234,
        validationLoss: 0.267,
        convergenceRate: 0.95
      }
    }
  ];
}


export default function ReviewAnalyticsDemoPage() {
  // TODO: Make this configurable per user plan
  const [demoMode, setDemoMode] = useState<'components' | 'dashboard' | 'reports' | 'predictive' | 'pipelines'>('components');
  const [isPlaying, setIsPlaying] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [mockData, setMockData] = useState({
    metrics: generateMockMetrics(),
    timeSeriesData: generateMockTimeSeriesData(),
    ratingDistribution: generateMockRatingDistribution(),
    heatmapData: generateMockHeatmapData(),
    predictiveModels: generateMockPredictiveModels(),
    mlPipelines: generateMockMLPipelines()
  });
  
  const [advancedConfig, setAdvancedConfig] = useState({
    enablePredictiveModels: true,
    enableAnomalyDetection: true,
    enableSentimentAnalysis: true,
    enableTrendForecasting: true,
    modelRefreshInterval: 24,
    predictionHorizon: 30
  });

  const refreshMockData = () => {
    // TODO: Replace with real API call
    const newTimeSeriesData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (30 - i));
      return {
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 50) + 10,
        label: `${Math.floor(Math.random() * 50) + 10} reviews`
      };
    });

    const newHeatmapData = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    for (const day of days) {
      for (const hour of hours) {
        newHeatmapData.push({
          x: hour,
          y: day,
          value: Math.floor(Math.random() * 100)
        });
      }
    }

    setMockData({
      metrics: generateMockMetrics(),
      timeSeriesData: newTimeSeriesData,
      ratingDistribution: {
        oneStar: Math.floor(Math.random() * 50) + 5,
        twoStar: Math.floor(Math.random() * 30) + 10,
        threeStar: Math.floor(Math.random() * 40) + 15,
        fourStar: Math.floor(Math.random() * 80) + 50,
        fiveStar: Math.floor(Math.random() * 120) + 80
      },
      heatmapData: newHeatmapData,
      predictiveModels: generateMockPredictiveModels(),
      mlPipelines: generateMockMLPipelines()
    });
    toast.success('Mock data refreshed');
  };

  const toggleAutoRefresh = () => {
    if (isPlaying) {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
      setIsPlaying(false);
      toast.info('Auto-refresh stopped');
    } else {
      const interval = setInterval(refreshMockData, 5000); // Refresh every 5 seconds
      setRefreshInterval(interval);
      setIsPlaying(true);
      toast.success('Auto-refresh started (5s interval)');
    }
  };

  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  const multiChartData = [
    {
      name: 'Reviews',
      data: mockData.timeSeriesData,
      color: '#3b82f6'
    },
    {
      name: 'Ratings',
      data: mockData.timeSeriesData.map(point => ({
        ...point,
        value: Math.random() * 5
      })),
      color: '#f59e0b'
    }
  ];

  const handleTrainModel = async (modelId: string) => {
    console.log('Training:', modelId);
    // TODO: Implement actual ML training
  };

  const handleCreateModel = async (model: any) => {
    console.log('Creating:', model);
  };

  const handleRunPipeline = async (pipelineId: string) => {
    console.log('Running:', pipelineId);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Review Analytics Demo</h1>
        <p className="text-xl text-gray-600">
          Check out our analytics features
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Badge variant="outline" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Live Demo</span>
          </Badge>
          <Badge variant="outline" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Interactive Charts</span>
          </Badge>
          <Badge variant="outline" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Real-time Data</span>
          </Badge>
        </div>
      </div>


      {/* Demo Content */}
      <Tabs value={demoMode} onValueChange={(value) => setDemoMode(value as typeof demoMode)}>
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-max min-w-full lg:grid lg:w-full lg:grid-cols-5 h-auto p-1">
            <TabsTrigger value="components" className="whitespace-nowrap text-xs sm:text-sm">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Components
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="whitespace-nowrap text-xs sm:text-sm">
              <Monitor className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="reports" className="whitespace-nowrap text-xs sm:text-sm">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="predictive" className="whitespace-nowrap text-xs sm:text-sm">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              AI/ML
            </TabsTrigger>
            <TabsTrigger value="pipelines" className="whitespace-nowrap text-xs sm:text-sm">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Pipelines
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="components" className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Component Showcase</h2>
            
            {/* Metric Cards */}
            <div>
              <h3 className="text-lg font-medium mb-4">Enhanced Metric Cards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockData.metrics.map((metric, index) => (
                  <EnhancedMetricCard
                    key={index}
                    metric={metric}
                    showTrend={true}
                    interactive={true}
                    onClick={() => toast.info(`Clicked on ${metric.title}`)}
                  />
                ))}
              </div>
            </div>

            <Separator />

            {/* Time Series Charts */}
            <div>
              <h3 className="text-lg font-medium mb-4">Time Series Visualizations</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TimeSeriesChart
                  data={mockData.timeSeriesData}
                  title="Reviews Over Time (Line)"
                  height={300}
                  showBrush={true}
                  type="line"
                  yAxisLabel="Number of Reviews"
                  onDataPointClick={(data) => toast.info(`Clicked: ${data.label}`)}
                />
                
                <TimeSeriesChart
                  data={mockData.timeSeriesData}
                  title="Reviews Over Time (Area)"
                  height={300}
                  type="area"
                  color="#10b981"
                  yAxisLabel="Review Count"
                />
              </div>
            </div>

            <Separator />

            {/* Rating Distribution */}
            <div>
              <h3 className="text-lg font-medium mb-4">Rating Distribution</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RatingDistributionChart
                  distribution={mockData.ratingDistribution}
                  title="Current Period Distribution"
                  showPercentages={true}
                  interactive={true}
                  onSegmentClick={(rating, count) => 
                    toast.info(`${rating} stars: ${count} reviews`)
                  }
                />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Progress Rings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <ProgressRing
                        value={87.5}
                        max={100}
                        label="Completion Rate"
                        color="#3b82f6"
                      />
                      <ProgressRing
                        value={92.3}
                        max={100}
                        label="Satisfaction Rate"
                        color="#10b981"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Multi-Chart Comparison */}
            <div>
              <h3 className="text-lg font-medium mb-4">Multi-Chart Comparison</h3>
              <MultiChartComparison
                datasets={multiChartData}
                title="Reviews vs Ratings Comparison"
                height={400}
                chartType="line"
              />
            </div>

            <Separator />

            {/* Heatmap */}
            <div>
              <h3 className="text-lg font-medium mb-4">Activity Heatmap</h3>
              <Heatmap
                data={mockData.heatmapData}
                title="Review Activity by Day & Hour"
                xAxisLabel="Hours"
                yAxisLabel="Days of Week"
                height={300}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dashboard">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Full Analytics Dashboard</h2>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  Live Preview
                </Badge>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>
            </div>
            
            <AnalyticsDashboard />
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Custom Reports System</h2>
              <Badge variant="outline">
                <MessageSquare className="h-4 w-4 mr-1" />
                Interactive Demo
              </Badge>
            </div>
            
            <ReviewReports />
          </div>
        </TabsContent>

        <TabsContent value="predictive">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Predictive Analytics & AI</h2>
            <PredictiveAnalyticsDashboard
              models={mockData.predictiveModels}
              onTrainModel={handleTrainModel}
              onCreateModel={handleCreateModel}
            />
          </div>
        </TabsContent>

        <TabsContent value="pipelines">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">ML Pipeline Management</h2>
            <MLPipelineManager
              pipelines={mockData.mlPipelines}
              onRunPipeline={handleRunPipeline}
            />
            
            <AdvancedConfiguration
              config={advancedConfig}
              onUpdateConfig={setAdvancedConfig}
            />
          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
}