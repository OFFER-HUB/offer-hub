'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  Calendar,
  Eye,
  Target,
  Award,
  Filter,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useReviewQuality } from '@/hooks/use-review-quality';
import {
  QualityAnalytics,
  QualityTrend,
} from '@/types/review-quality.types';
import {
  formatQualityScore,
  getQualityScoreColor,
} from '@/utils/quality-helpers';

interface QualityMetricsProps {
  className?: string;
  showExportOptions?: boolean;
  defaultPeriod?: 'daily' | 'weekly' | 'monthly';
}

export default function QualityMetrics({
  className = '',
  showExportOptions = true,
  defaultPeriod = 'weekly',
}: QualityMetricsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>(defaultPeriod);
  const [selectedMetric, setSelectedMetric] = useState<'score' | 'volume' | 'approval'>('score');

  const {
    state,
    actions,
    loading,
    errors,
  } = useReviewQuality({
    includeMetrics: true,
    includeTrends: true,
  });

  // Mock trend data for demonstration
  const trendData = [
    { name: 'Week 1', score: 82.5, volume: 145, approval: 89.2, flag: 8.1, reject: 2.7 },
    { name: 'Week 2', score: 84.1, volume: 163, approval: 91.5, flag: 6.8, reject: 1.7 },
    { name: 'Week 3', score: 81.9, volume: 138, approval: 87.3, flag: 9.4, reject: 3.3 },
    { name: 'Week 4', score: 85.7, volume: 171, approval: 93.1, flag: 5.2, reject: 1.7 },
    { name: 'Week 5', score: 83.4, volume: 156, approval: 90.8, flag: 7.1, reject: 2.1 },
    { name: 'Week 6', score: 86.2, volume: 189, approval: 94.3, flag: 4.1, reject: 1.6 },
  ];

  const scoreDistributionData = [
    { name: '90-100', value: 35, color: '#10b981' },
    { name: '80-89', value: 28, color: '#3b82f6' },
    { name: '70-79', value: 22, color: '#f59e0b' },
    { name: '60-69', value: 10, color: '#f97316' },
    { name: '0-59', value: 5, color: '#ef4444' },
  ];

  const issueTypeData = [
    { name: 'Language Issues', count: 45, percentage: 32.1 },
    { name: 'Content Quality', count: 38, percentage: 27.1 },
    { name: 'Spam Detection', count: 25, percentage: 17.9 },
    { name: 'Inappropriate Content', count: 18, percentage: 12.9 },
    { name: 'Personal Information', count: 14, percentage: 10.0 },
  ];

  const moderatorPerformanceData = [
    { name: 'Alice Johnson', decisions: 127, accuracy: 94.5, avgTime: 3.2 },
    { name: 'Bob Smith', decisions: 98, accuracy: 91.8, avgTime: 4.1 },
    { name: 'Carol Davis', decisions: 156, accuracy: 96.2, avgTime: 2.8 },
    { name: 'David Wilson', decisions: 89, accuracy: 89.7, avgTime: 5.3 },
  ];

  const handleExport = async (format: 'csv' | 'pdf' | 'json') => {
    try {
      const report = await actions.generateReport('monthly');
      console.log(`Exporting report in ${format} format:`, report);
      // Implementation would handle actual file download
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const handleRefreshData = async () => {
    try {
      await actions.refreshData();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  const getTrendIndicator = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    if (Math.abs(change) < 1) {
      return { icon: Activity, color: 'text-gray-500', text: 'No change' };
    } else if (change > 0) {
      return { icon: TrendingUp, color: 'text-green-500', text: `+${change.toFixed(1)}%` };
    } else {
      return { icon: TrendingDown, color: 'text-red-500', text: `${change.toFixed(1)}%` };
    }
  };

  const OverviewPanel = () => (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Quality Score</p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-2xl font-bold ${getQualityScoreColor(state.metrics.overview.averageQualityScore)}`}>
                    {state.metrics.overview.averageQualityScore.toFixed(1)}
                  </p>
                  <span className="text-sm text-gray-500">/ 100</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-500">+2.3% from last period</span>
                </div>
              </div>
              <Award className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {state.metrics.overview.totalReviews.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-500">+12.5% this month</span>
                </div>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approval Rate</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-green-600">
                    {state.metrics.overview.approvalRate.toFixed(1)}%
                  </p>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-500">+1.8% improvement</span>
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Auto Moderation</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-blue-600">
                    {state.metrics.overview.autoModerationRate.toFixed(1)}%
                  </p>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-500">+5.2% efficiency</span>
                </div>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Score Trend */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Quality Score Trends
            </CardTitle>
            <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[70, 100]} />
                <Tooltip
                  formatter={(value, name) => [
                    `${value}${name === 'score' ? '' : name === 'volume' ? '' : '%'}`,
                    name === 'score' ? 'Quality Score' : name === 'volume' ? 'Review Volume' : 'Approval Rate'
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="approval"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Score Distribution and Top Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoreDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {scoreDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Distribution']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {scoreDistributionData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Top Quality Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {issueTypeData.map((issue, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900">{issue.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24">
                      <Progress value={issue.percentage} className="h-2" />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{issue.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const TrendsPanel = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Detailed Trends Analysis
            </CardTitle>
            <div className="flex gap-2">
              <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Quality Score</SelectItem>
                  <SelectItem value="volume">Review Volume</SelectItem>
                  <SelectItem value="approval">Approval Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey={selectedMetric}
                  fill={
                    selectedMetric === 'score' ? '#3b82f6' :
                    selectedMetric === 'volume' ? '#8b5cf6' :
                    '#10b981'
                  }
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Moderator Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-gray-900">Moderator</th>
                  <th className="text-right p-3 font-medium text-gray-900">Decisions</th>
                  <th className="text-right p-3 font-medium text-gray-900">Accuracy</th>
                  <th className="text-right p-3 font-medium text-gray-900">Avg Time (min)</th>
                  <th className="text-right p-3 font-medium text-gray-900">Performance</th>
                </tr>
              </thead>
              <tbody>
                {moderatorPerformanceData.map((mod, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {mod.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{mod.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right text-gray-600">{mod.decisions}</td>
                    <td className="p-3 text-right">
                      <span className={`font-medium ${mod.accuracy >= 95 ? 'text-green-600' : mod.accuracy >= 90 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {mod.accuracy.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3 text-right text-gray-600">{mod.avgTime.toFixed(1)}</td>
                    <td className="p-3 text-right">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          mod.accuracy >= 95 && mod.avgTime <= 3 ? 'border-green-500 text-green-700' :
                          mod.accuracy >= 90 && mod.avgTime <= 4 ? 'border-blue-500 text-blue-700' :
                          'border-orange-500 text-orange-700'
                        }`}
                      >
                        {mod.accuracy >= 95 && mod.avgTime <= 3 ? 'Excellent' :
                         mod.accuracy >= 90 && mod.avgTime <= 4 ? 'Good' :
                         'Needs Improvement'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ReportsPanel = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Generate Quality Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => handleExport('pdf')}
            >
              <Download className="w-6 h-6" />
              <span>PDF Report</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => handleExport('csv')}
            >
              <Download className="w-6 h-6" />
              <span>CSV Export</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => handleExport('json')}
            >
              <Download className="w-6 h-6" />
              <span>JSON Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quality Insights Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Positive Trends</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Quality scores have improved by 2.3% over the last month</li>
                <li>• Auto-moderation efficiency increased by 5.2%</li>
                <li>• Average response time decreased by 15%</li>
              </ul>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">Areas for Improvement</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Language issues still account for 32% of flagged content</li>
                <li>• Review volume fluctuations need stabilization</li>
                <li>• Moderator training needed for consistent decision-making</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Recommendations</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Implement advanced language processing for better detection</li>
                <li>• Set up automated alerts for quality threshold breaches</li>
                <li>• Establish regular moderator performance reviews</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quality Metrics & Analytics</h1>
          <p className="text-gray-600">Monitor review quality performance and trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            disabled={loading.analytics}
          >
            {loading.analytics ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </Button>
          {showExportOptions && (
            <Button
              size="sm"
              onClick={() => handleExport('pdf')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {errors.analytics && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>{errors.analytics}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewPanel />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <TrendsPanel />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ReportsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}