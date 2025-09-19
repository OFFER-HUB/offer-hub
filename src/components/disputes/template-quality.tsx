'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TemplateQualityStandards,
  TemplatePerformanceMetrics,
  TemplateQualityProps
} from '@/types/templates.types';
import { useTemplateQuality, useTemplateMetrics } from '@/hooks/use-resolution-templates';
import {
  Award,
  BarChart3,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Users,
  Zap,
  Eye,
  RefreshCw,
  Download,
  FileText,
  Globe,
  Smartphone,
  Monitor,
  Accessibility,
  Shield,
  Star,
  ThumbsUp,
  ThumbsDown,
  Activity,
  Calendar,
  Percent,
  Hash,
  ChevronRight,
  Info,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function TemplateQuality({
  templateId,
  showDetailedMetrics = false,
  allowReassessment = true,
  showRecommendations = true,
  showComparisons = false,
  onQualityUpdate
}: TemplateQualityProps) {
  const {
    quality,
    isLoading: qualityLoading,
    error: qualityError,
    reassess
  } = useTemplateQuality(templateId);

  const {
    metrics,
    isLoading: metricsLoading,
    error: metricsError
  } = useTemplateMetrics(templateId);

  const [activeTab, setActiveTab] = useState('overview');
  const [isReassessing, setIsReassessing] = useState(false);

  const handleReassess = async () => {
    if (!allowReassessment) return;

    setIsReassessing(true);
    try {
      await reassess();
      onQualityUpdate?.(quality!);
    } catch (error) {
      console.error('Reassessment failed:', error);
    } finally {
      setIsReassessing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    if (score >= 50) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 70) return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    if (score >= 50) return <AlertTriangle className="h-5 w-5 text-orange-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const formatPercentage = (value: number) => `${Math.round(value * 100) / 100}%`;
  const formatNumber = (value: number) => Math.round(value * 100) / 100;

  if (qualityLoading || metricsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Award className="h-5 w-5 animate-pulse" />
          <span>Loading quality assessment...</span>
        </div>
      </div>
    );
  }

  if (qualityError || metricsError) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Quality Data</h3>
            <p className="text-gray-600 mb-4">{qualityError || metricsError}</p>
            <Button onClick={handleReassess} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quality || !metrics) {
    return (
      <div className="text-center py-8">
        <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quality Data Available</h3>
        <p className="text-gray-600 mb-4">Quality assessment not yet performed for this template.</p>
        {allowReassessment && (
          <Button onClick={handleReassess}>
            <Award className="h-4 w-4 mr-2" />
            Assess Quality
          </Button>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Award className="h-6 w-6" />
              <span>Template Quality Assessment</span>
            </h2>
            <p className="text-gray-600">
              Comprehensive quality analysis and performance metrics
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {allowReassessment && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleReassess}
                disabled={isReassessing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isReassessing ? 'animate-spin' : ''}`} />
                Reassess
              </Button>
            )}
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Overall Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Overall Quality Score</span>
              <Badge variant={quality.overallScore >= 70 ? "default" : "secondary"}>
                {getScoreIcon(quality.overallScore)}
                <span className="ml-2">{quality.overallScore}/100</span>
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={quality.overallScore} className="h-4" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className={`p-3 rounded-lg ${getScoreBgColor(quality.clarity.score)}`}>
                  <p className={`text-2xl font-bold ${getScoreColor(quality.clarity.score)}`}>
                    {quality.clarity.score}
                  </p>
                  <p className="text-sm text-gray-600">Clarity</p>
                </div>
                <div className={`p-3 rounded-lg ${getScoreBgColor(quality.completeness.score)}`}>
                  <p className={`text-2xl font-bold ${getScoreColor(quality.completeness.score)}`}>
                    {quality.completeness.score}
                  </p>
                  <p className="text-sm text-gray-600">Completeness</p>
                </div>
                <div className={`p-3 rounded-lg ${getScoreBgColor(quality.compliance.score)}`}>
                  <p className={`text-2xl font-bold ${getScoreColor(quality.compliance.score)}`}>
                    {quality.compliance.score}
                  </p>
                  <p className="text-sm text-gray-600">Compliance</p>
                </div>
                <div className={`p-3 rounded-lg ${getScoreBgColor(quality.effectiveness.score)}`}>
                  <p className={`text-2xl font-bold ${getScoreColor(quality.effectiveness.score)}`}>
                    {quality.effectiveness.score}
                  </p>
                  <p className="text-sm text-gray-600">Effectiveness</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Last assessed on {new Date(quality.lastAssessed).toLocaleDateString()} by {quality.assessedBy}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Metrics */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quality">Quality Details</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <ThumbsUp className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{formatPercentage(metrics.effectiveness.successRate)}</p>
                      <p className="text-sm text-gray-600">Success Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{metrics.usage.totalUsage}</p>
                      <p className="text-sm text-gray-600">Total Usage</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{formatNumber(metrics.effectiveness.averageResolutionTime)}h</p>
                      <p className="text-sm text-gray-600">Avg Resolution</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">{formatNumber(metrics.effectiveness.userSatisfaction)}/5</p>
                      <p className="text-sm text-gray-600">User Satisfaction</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Strengths</h4>
                    <div className="space-y-2">
                      {quality.clarity.score >= 80 && (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Excellent clarity and readability</span>
                        </div>
                      )}
                      {quality.compliance.score >= 80 && (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">High compliance standards</span>
                        </div>
                      )}
                      {metrics.effectiveness.successRate >= 0.8 && (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">High success rate</span>
                        </div>
                      )}
                      {quality.accessibility.score >= 80 && (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Good accessibility features</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Areas for Improvement</h4>
                    <div className="space-y-2">
                      {quality.completeness.score < 70 && (
                        <div className="flex items-center space-x-2 text-orange-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">Template completeness needs work</span>
                        </div>
                      )}
                      {metrics.quality.errorRate > 0.1 && (
                        <div className="flex items-center space-x-2 text-orange-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">High error rate detected</span>
                        </div>
                      )}
                      {metrics.effectiveness.escalationRate > 0.3 && (
                        <div className="flex items-center space-x-2 text-orange-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">High escalation rate</span>
                        </div>
                      )}
                      {quality.accessibility.score < 60 && (
                        <div className="flex items-center space-x-2 text-red-600">
                          <XCircle className="h-4 w-4" />
                          <span className="text-sm">Poor accessibility support</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            {/* Clarity Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Clarity Assessment</span>
                  <Badge variant="outline">{quality.clarity.score}/100</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={quality.clarity.score} className="h-2" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Criteria Met</h4>
                    <div className="space-y-1">
                      {quality.clarity.criteria.map((criterion, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{criterion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Recommendations</h4>
                    <div className="space-y-1">
                      {quality.clarity.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          <span>{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Completeness Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Completeness Assessment</span>
                  <Badge variant="outline">{quality.completeness.score}/100</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={quality.completeness.score} className="h-2" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Missing Elements</h4>
                    <div className="space-y-1">
                      {quality.completeness.missingElements.map((element, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span>{element}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Suggestions</h4>
                    <div className="space-y-1">
                      {quality.completeness.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          <span>{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Compliance Assessment</span>
                  <Badge variant="outline">{quality.compliance.score}/100</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={quality.compliance.score} className="h-2" />
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Legal Requirements</h4>
                    <div className="space-y-1">
                      {quality.compliance.legalRequirements.map((requirement, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{requirement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Jurisdiction Compliance</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(quality.compliance.jurisdictionCompliance).map(([jurisdiction, compliant]) => (
                        <div key={jurisdiction} className="flex items-center space-x-2">
                          {compliant ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm capitalize">{jurisdiction}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accessibility Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Accessibility className="h-5 w-5" />
                  <span>Accessibility Assessment</span>
                  <Badge variant="outline">{quality.accessibility.score}/100</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={quality.accessibility.score} className="h-2" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className={`h-3 w-3 rounded-full ${quality.accessibility.mobileCompatibility ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm">Mobile Compatible</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`h-3 w-3 rounded-full ${quality.accessibility.visualElements ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm">Visual Elements</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Language Level: {quality.accessibility.languageLevel}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Usage Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Usage Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{metrics.usage.totalUsage}</p>
                    <p className="text-sm text-gray-600">Total Usage</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{formatNumber(metrics.usage.userAdoption * 100)}%</p>
                    <p className="text-sm text-gray-600">User Adoption</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{metrics.usage.monthlyUsage.slice(-1)[0]}</p>
                    <p className="text-sm text-gray-600">This Month</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{metrics.usage.peakUsageTimes.length}</p>
                    <p className="text-sm text-gray-600">Peak Times</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Effectiveness Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Effectiveness Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="font-medium">{formatPercentage(metrics.effectiveness.successRate)}</span>
                    </div>
                    <Progress value={metrics.effectiveness.successRate * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">User Satisfaction</span>
                      <span className="font-medium">{formatNumber(metrics.effectiveness.userSatisfaction)}/5</span>
                    </div>
                    <Progress value={(metrics.effectiveness.userSatisfaction / 5) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Escalation Rate</span>
                      <span className="font-medium">{formatPercentage(metrics.effectiveness.escalationRate)}</span>
                    </div>
                    <Progress value={metrics.effectiveness.escalationRate * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Resolution Time</span>
                      <span className="font-medium">{formatNumber(metrics.effectiveness.averageResolutionTime)}h</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Quality Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Error Rate</span>
                      <span className="font-medium">{formatPercentage(metrics.quality.errorRate)}</span>
                    </div>
                    <Progress value={metrics.quality.errorRate * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <span className="font-medium">{formatPercentage(metrics.quality.completionRate)}</span>
                    </div>
                    <Progress value={metrics.quality.completionRate * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Customization Rate</span>
                      <span className="font-medium">{formatPercentage(metrics.quality.customizationRate)}</span>
                    </div>
                    <Progress value={metrics.quality.customizationRate * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Feedback Score</span>
                      <span className="font-medium">{formatNumber(metrics.quality.feedbackScore)}/10</span>
                    </div>
                    <Progress value={(metrics.quality.feedbackScore / 10) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {showComparisons && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Comparative Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Industry Benchmark</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{formatPercentage(metrics.comparative.industryBenchmark)}</span>
                        <Badge variant={metrics.comparative.industryBenchmark > 0.7 ? "default" : "secondary"}>
                          {metrics.comparative.industryBenchmark > 0.7 ? "Above Average" : "Below Average"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Similar Templates Comparison</h4>
                      <div className="space-y-2">
                        {metrics.comparative.similarTemplates.map((comparison, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>Template {comparison.templateId.slice(-8)}</span>
                            <div className="flex items-center space-x-2">
                              <span>{comparison.performanceComparison > 0 ? '+' : ''}{formatPercentage(comparison.performanceComparison)}</span>
                              {comparison.performanceComparison > 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            {showRecommendations && (
              <div className="space-y-4">
                {/* High Priority Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <span>High Priority Recommendations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {quality.completeness.missingElements.map((element, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Add missing element: {element}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </CardContent>
                </Card>

                {/* Improvement Suggestions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      <span>Improvement Suggestions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[...quality.clarity.recommendations, ...quality.completeness.suggestions].map((suggestion, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm">{suggestion}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Historical Benchmark */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Historical Performance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Current vs Historical</span>
                        <Badge variant="outline">
                          {quality.effectiveness.benchmarkComparison}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Usage Count: {quality.effectiveness.historicalData.usageCount}</p>
                        <p>Success Rate: {formatPercentage(quality.effectiveness.historicalData.successRate)}</p>
                        <p>Average Resolution Time: {formatNumber(quality.effectiveness.historicalData.averageResolutionTime)}h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}