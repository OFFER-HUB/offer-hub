'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  BarChart3,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Eye,
  RefreshCw,
  Download,
  Filter,
  Search,
  MoreHorizontal
} from 'lucide-react';
import { useReviewQuality } from '@/hooks/use-review-quality';
import {
  QualityScore,
  QualityMetrics,
  ModerationStatus,
  QualityAssessmentConfig,
} from '@/types/review-quality.types';
import {
  formatQualityScore,
  getQualityScoreColor,
  getModerationStatusColor,
} from '@/utils/quality-helpers';

interface QualityAssuranceProps {
  className?: string;
  enableRealTime?: boolean;
  showConfigPanel?: boolean;
  onConfigChange?: (config: Partial<QualityAssessmentConfig>) => void;
}

export default function QualityAssurance({
  className = '',
  enableRealTime = true,
  showConfigPanel = true,
  onConfigChange,
}: QualityAssuranceProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [configMode, setConfigMode] = useState(false);

  const {
    state,
    actions,
    loading,
    errors,
  } = useReviewQuality({
    enableRealTime,
    autoRefresh: true,
    refreshInterval: 30000,
    includeMetrics: true,
    includeTrends: true,
    includeWorkflows: true,
  });

  const handleAssessReview = async (reviewId: string) => {
    try {
      await actions.assessReview(reviewId);
      setSelectedReviewId(reviewId);
    } catch (error) {
      console.error('Failed to assess review:', error);
    }
  };

  const handleConfigUpdate = async (newConfig: Partial<QualityAssessmentConfig>) => {
    try {
      await actions.updateConfig(newConfig);
      onConfigChange?.(newConfig);
    } catch (error) {
      console.error('Failed to update config:', error);
    }
  };

  const getStatusIcon = (status: ModerationStatus) => {
    switch (status) {
      case 'approved':
      case 'auto-approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
      case 'auto-rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'flagged':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'escalated':
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const QualityScoreDisplay = ({ score }: { score: QualityScore }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Overall Quality Score</h4>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${getQualityScoreColor(score.overall)}`}>
            {score.overall.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500">/ 100</span>
        </div>
      </div>

      <Progress value={score.overall} className="h-2" />

      <div className="grid grid-cols-2 gap-4 text-sm">
        {Object.entries(score.breakdown).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="capitalize text-gray-600">
              {key.replace('_', ' ')}:
            </span>
            <span className={`font-medium ${getQualityScoreColor(value)}`}>
              {value.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const OverviewPanel = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {state.metrics.overview.totalReviews.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Quality Score</p>
                <p className={`text-2xl font-bold ${getQualityScoreColor(state.metrics.overview.averageQualityScore)}`}>
                  {state.metrics.overview.averageQualityScore.toFixed(1)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approval Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {state.metrics.overview.approvalRate.toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Auto Moderation</p>
                <p className="text-2xl font-bold text-blue-600">
                  {state.metrics.overview.autoModerationRate.toFixed(1)}%
                </p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Quality Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {state.trends.length > 0 && state.trends[0].scoreDistribution && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(state.trends[0].scoreDistribution).map(([range, count]) => (
                  <div key={range} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600">{range}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Top Quality Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {state.metrics.topIssues.slice(0, 5).map((issue, index) => (
              <div key={issue.issue} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900">{issue.issue}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{issue.count} instances</span>
                  <Badge variant="outline" className="text-xs">
                    {issue.percentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const AssessmentPanel = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Review Assessment
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAssessReview('sample_review_id')}
              disabled={loading.assessment}
            >
              {loading.assessment ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                'Assess Sample Review'
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Auto-Approve Threshold
                </label>
                <div className="flex items-center gap-2">
                  <Progress value={state.config.thresholds.autoApprove} className="flex-1" />
                  <span className="text-sm text-gray-600">{state.config.thresholds.autoApprove}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Flag for Review Threshold
                </label>
                <div className="flex items-center gap-2">
                  <Progress value={state.config.thresholds.flagForReview} className="flex-1" />
                  <span className="text-sm text-gray-600">{state.config.thresholds.flagForReview}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Auto-Reject Threshold
                </label>
                <div className="flex items-center gap-2">
                  <Progress value={state.config.thresholds.autoReject} className="flex-1" />
                  <span className="text-sm text-gray-600">{state.config.thresholds.autoReject}</span>
                </div>
              </div>
            </div>

            {errors.assessment && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.assessment}</p>
              </div>
            )}

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Assessment Weights</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(state.config.weights).map(([key, weight]) => (
                  <div key={key} className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{weight}%</div>
                    <div className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Assessments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Assessments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon('approved')}
                  <div>
                    <p className="font-medium text-gray-900">Review #{1000 + index}</p>
                    <p className="text-sm text-gray-600">
                      Assessed {Math.floor(Math.random() * 60)} minutes ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold ${getQualityScoreColor(85.5)}`}>
                    85.5
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Auto-approved
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ConfigurationPanel = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Quality Assessment Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* AI Provider Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                AI Provider
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={state.config.aiProvider}
                onChange={(e) => handleConfigUpdate({
                  aiProvider: e.target.value as QualityAssessmentConfig['aiProvider']
                })}
              >
                <option value="rule_based">Rule-based Assessment</option>
                <option value="openai">OpenAI Integration</option>
                <option value="custom">Custom AI Model</option>
              </select>
            </div>

            {/* Feature Toggles */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Enabled Features</h4>
              <div className="space-y-2">
                {Object.entries(state.config.enabledFeatures).map(([feature, enabled]) => (
                  <label key={feature} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => handleConfigUpdate({
                        enabledFeatures: {
                          ...state.config.enabledFeatures,
                          [feature]: e.target.checked,
                        }
                      })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-900 capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t">
              <Button
                onClick={() => setConfigMode(false)}
                className="w-full"
              >
                Save Configuration
              </Button>
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
          <h1 className="text-2xl font-bold text-gray-900">Quality Assurance</h1>
          <p className="text-gray-600">Monitor and maintain review quality standards</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={actions.refreshData}
            disabled={state.isProcessing}
          >
            {state.isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => actions.generateReport('monthly')}
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Status Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">
                Quality assurance system is active and monitoring reviews
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date(state.lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="configuration" disabled={!showConfigPanel}>
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewPanel />
        </TabsContent>

        <TabsContent value="assessment" className="space-y-6">
          <AssessmentPanel />
        </TabsContent>

        {showConfigPanel && (
          <TabsContent value="configuration" className="space-y-6">
            <ConfigurationPanel />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}