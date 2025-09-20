/**
 * @fileoverview Comprehensive performance metrics component
 * @author OnlyDust Platform
 * @license MIT
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PerformanceMetrics, BenchmarkData, ReputationInsight } from "@/types/reputation-analytics.types";
import {
  Clock,
  CheckCircle,
  Star,
  Users,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Target,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Shield,
  Download
} from "lucide-react";

interface PerformanceAnalyticsProps {
  metrics: PerformanceMetrics;
  benchmarks: BenchmarkData[];
  insights: ReputationInsight[];
  timeframe?: string;
  showExportButton?: boolean;
  className?: string;
}

export default function PerformanceAnalytics({
  metrics,
  benchmarks,
  insights,
  timeframe = "Last 6 months",
  showExportButton = true,
  className = ""
}: PerformanceAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const getMetricColor = (value: number, threshold: { good: number; excellent: number }) => {
    if (value >= threshold.excellent) return "text-green-600";
    if (value >= threshold.good) return "text-blue-600";
    return "text-yellow-600";
  };

  const getProgressColor = (value: number, threshold: { good: number; excellent: number }) => {
    if (value >= threshold.excellent) return "bg-green-500";
    if (value >= threshold.good) return "bg-blue-500";
    return "bg-yellow-500";
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  const getBenchmarkComparison = (metric: keyof PerformanceMetrics, value: number) => {
    const mockPlatformAverage: Record<keyof PerformanceMetrics, number> = {
      completionRate: 85,
      averageResponseTime: 8,
      projectsCompleted: 12,
      onTimeDelivery: 78,
      clientSatisfactionScore: 4.2,
      repeatClientRate: 0.3,
      averageProjectRating: 4.1,
      disputeRate: 0.08,
      refundRate: 0.05,
      qualityScore: 4.0
    };

    const platformAvg = mockPlatformAverage[metric];
    const difference = ((value - platformAvg) / platformAvg) * 100;

    return {
      platformAverage: platformAvg,
      difference: difference.toFixed(1),
      isAbove: difference > 0
    };
  };

  const performanceCards = [
    {
      title: "Completion Rate",
      value: `${metrics.completionRate}%`,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Projects successfully completed",
      benchmark: getBenchmarkComparison("completionRate", metrics.completionRate),
      threshold: { good: 80, excellent: 95 }
    },
    {
      title: "Response Time",
      value: formatDuration(metrics.averageResponseTime),
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Average time to respond to messages",
      benchmark: getBenchmarkComparison("averageResponseTime", metrics.averageResponseTime),
      threshold: { good: 12, excellent: 4 }
    },
    {
      title: "Client Satisfaction",
      value: `${metrics.clientSatisfactionScore.toFixed(1)}/5`,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      description: "Average client satisfaction rating",
      benchmark: getBenchmarkComparison("clientSatisfactionScore", metrics.clientSatisfactionScore),
      threshold: { good: 4.0, excellent: 4.5 }
    },
    {
      title: "On-Time Delivery",
      value: `${metrics.onTimeDelivery}%`,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Projects delivered on schedule",
      benchmark: getBenchmarkComparison("onTimeDelivery", metrics.onTimeDelivery),
      threshold: { good: 75, excellent: 90 }
    },
    {
      title: "Repeat Clients",
      value: `${(metrics.repeatClientRate * 100).toFixed(0)}%`,
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      description: "Clients who return for more work",
      benchmark: getBenchmarkComparison("repeatClientRate", metrics.repeatClientRate),
      threshold: { good: 0.25, excellent: 0.5 }
    },
    {
      title: "Quality Score",
      value: `${metrics.qualityScore.toFixed(1)}/5`,
      icon: Award,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Average work quality rating",
      benchmark: getBenchmarkComparison("qualityScore", metrics.qualityScore),
      threshold: { good: 3.8, excellent: 4.5 }
    }
  ];

  const riskMetrics = [
    {
      title: "Dispute Rate",
      value: `${(metrics.disputeRate * 100).toFixed(1)}%`,
      icon: AlertTriangle,
      color: "text-red-600",
      isRisk: true,
      description: "Percentage of projects with disputes",
      threshold: { good: 0.05, excellent: 0.02 }
    },
    {
      title: "Refund Rate",
      value: `${(metrics.refundRate * 100).toFixed(1)}%`,
      icon: Shield,
      color: "text-orange-600",
      isRisk: true,
      description: "Percentage of projects refunded",
      threshold: { good: 0.03, excellent: 0.01 }
    }
  ];

  const keyInsights = insights.filter(insight =>
    insight.impact === 'high' &&
    (insight.type === 'strength' || insight.type === 'opportunity')
  ).slice(0, 3);

  const riskInsights = insights.filter(insight =>
    insight.impact === 'high' &&
    (insight.type === 'weakness' || insight.type === 'risk')
  ).slice(0, 2);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Analytics</h2>
          <p className="text-gray-600">{timeframe}</p>
        </div>
        {showExportButton && (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {performanceCards.map((card, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${card.bgColor}`}>
                      <card.icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getMetricColor(
                        typeof card.benchmark.platformAverage === 'number'
                          ? parseFloat(card.value.replace(/[^\d.-]/g, ''))
                          : 0,
                        card.threshold
                      )}`}>
                        {card.value}
                      </div>
                      <div className="flex items-center justify-end mt-1">
                        <TrendingUp className={`h-3 w-3 mr-1 ${card.benchmark.isAbove ? 'text-green-500' : 'text-red-500'}`} />
                        <span className={`text-xs ${card.benchmark.isAbove ? 'text-green-600' : 'text-red-600'}`}>
                          {card.benchmark.isAbove ? '+' : ''}{card.benchmark.difference}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{card.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>vs Platform Average</span>
                      <span>{card.benchmark.platformAverage}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-red-700">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Risk Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {riskMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg">
                    <div className="flex items-center space-x-3">
                      <metric.icon className={`h-5 w-5 ${metric.color}`} />
                      <div>
                        <div className="font-medium">{metric.title}</div>
                        <div className="text-sm text-gray-600">{metric.description}</div>
                      </div>
                    </div>
                    <div className={`text-xl font-bold ${metric.color}`}>
                      {metric.value}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Project Metrics
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Projects Completed</span>
                      <span className="font-medium">{metrics.projectsCompleted}</span>
                    </div>
                    <Progress value={(metrics.projectsCompleted / 50) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Average Rating</span>
                      <span className="font-medium">{metrics.averageProjectRating.toFixed(1)}/5</span>
                    </div>
                    <Progress value={(metrics.averageProjectRating / 5) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <span className="font-medium">{metrics.completionRate}%</span>
                    </div>
                    <Progress value={metrics.completionRate} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Client Relationship
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Satisfaction Score</span>
                      <span className="font-medium">{metrics.clientSatisfactionScore.toFixed(1)}/5</span>
                    </div>
                    <Progress value={(metrics.clientSatisfactionScore / 5) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Repeat Client Rate</span>
                      <span className="font-medium">{(metrics.repeatClientRate * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={metrics.repeatClientRate * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Response Time</span>
                      <span className="font-medium">{formatDuration(metrics.averageResponseTime)}</span>
                    </div>
                    <Progress value={Math.max(0, 100 - (metrics.averageResponseTime / 24) * 100)} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {metrics.completionRate}%
                  </div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                  <Badge variant="secondary" className="mt-1">Excellent</Badge>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {metrics.onTimeDelivery}%
                  </div>
                  <div className="text-sm text-gray-600">On-Time Delivery</div>
                  <Badge variant="secondary" className="mt-1">Good</Badge>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {metrics.clientSatisfactionScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Client Satisfaction</div>
                  <Badge variant="secondary" className="mt-1">Above Average</Badge>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {(metrics.repeatClientRate * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">Repeat Clients</div>
                  <Badge variant="secondary" className="mt-1">Excellent</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {keyInsights.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-green-700">
                  <Zap className="h-5 w-5 mr-2" />
                  Key Strengths & Opportunities
                </h3>
                <div className="space-y-3">
                  {keyInsights.map((insight, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge variant="secondary">{insight.type}</Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{insight.description}</p>
                      {insight.suggestedActions && insight.suggestedActions.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-gray-700 mb-1">Suggested Actions:</div>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {insight.suggestedActions.map((action, actionIndex) => (
                              <li key={actionIndex} className="flex items-center">
                                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {riskInsights.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-orange-700">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Areas for Improvement
                </h3>
                <div className="space-y-3">
                  {riskInsights.map((insight, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge variant="destructive">{insight.impact} Impact</Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{insight.description}</p>
                      {insight.suggestedActions && insight.suggestedActions.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-gray-700 mb-1">Recommended Actions:</div>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {insight.suggestedActions.map((action, actionIndex) => (
                              <li key={actionIndex} className="flex items-center">
                                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Performance Trends
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Completion Rate</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">+5.2%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Client Satisfaction</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">+0.3</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Response Time</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">-2.1h</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Monthly Summary
                </h3>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{metrics.projectsCompleted}</div>
                    <div className="text-sm text-gray-600">Projects Completed</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{metrics.onTimeDelivery}%</div>
                      <div className="text-xs text-gray-600">On Time</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-lg font-bold text-yellow-600">{metrics.averageProjectRating.toFixed(1)}</div>
                      <div className="text-xs text-gray-600">Avg Rating</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}