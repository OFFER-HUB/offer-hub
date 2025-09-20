/**
 * @fileoverview Reputation trend analysis and insights component
 * @author OnlyDust Platform
 * @license MIT
 */

"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ReputationTrend,
  ReputationInsight,
  ReputationPrediction,
  ReputationRecommendation,
  ReputationScore
} from "@/types/reputation-analytics.types";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
  Zap,
  Award,
  Clock,
  Star,
  ArrowRight,
  Filter,
  RefreshCw
} from "lucide-react";

interface TrendAnalysisProps {
  trends: ReputationTrend[];
  insights: ReputationInsight[];
  predictions: ReputationPrediction[];
  recommendations: ReputationRecommendation[];
  currentScore: ReputationScore;
  timeframe?: string;
  onTimeframeChange?: (timeframe: string) => void;
  className?: string;
}

export default function TrendAnalysis({
  trends,
  insights,
  predictions,
  recommendations,
  currentScore,
  timeframe = "6months",
  onTimeframeChange,
  className = ""
}: TrendAnalysisProps) {
  const [activeTab, setActiveTab] = useState("trends");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [insightFilter, setInsightFilter] = useState<string>("all");

  const timeframeOptions = [
    { value: "1month", label: "Last Month" },
    { value: "3months", label: "Last 3 Months" },
    { value: "6months", label: "Last 6 Months" },
    { value: "1year", label: "Last Year" },
    { value: "all", label: "All Time" }
  ];

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "overall", label: "Overall" },
    { value: "communication", label: "Communication" },
    { value: "qualityOfWork", label: "Quality of Work" },
    { value: "timeliness", label: "Timeliness" },
    { value: "professionalism", label: "Professionalism" },
    { value: "reliability", label: "Reliability" }
  ];

  const filteredTrends = useMemo(() => {
    if (selectedCategory === "all") return trends;
    return trends.filter(trend => trend.category === selectedCategory);
  }, [trends, selectedCategory]);

  const filteredInsights = useMemo(() => {
    if (insightFilter === "all") return insights;
    return insights.filter(insight => insight.type === insightFilter);
  }, [insights, insightFilter]);

  const trendSummary = useMemo(() => {
    const summary = {
      overall: { positive: 0, negative: 0, neutral: 0 },
      categories: {} as Record<string, { positive: number; negative: number; neutral: number }>
    };

    filteredTrends.forEach(trend => {
      const category = trend.category;
      if (!summary.categories[category]) {
        summary.categories[category] = { positive: 0, negative: 0, neutral: 0 };
      }

      if (trend.change > 0.5) {
        summary.overall.positive++;
        summary.categories[category].positive++;
      } else if (trend.change < -0.5) {
        summary.overall.negative++;
        summary.categories[category].negative++;
      } else {
        summary.overall.neutral++;
        summary.categories[category].neutral++;
      }
    });

    return summary;
  }, [filteredTrends]);

  const getTrendIcon = (change: number) => {
    if (change > 0.5) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < -0.5) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4 rounded-full bg-gray-300" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0.5) return "text-green-600";
    if (change < -0.5) return "text-red-600";
    return "text-gray-600";
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "strength":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "opportunity":
        return <Lightbulb className="h-5 w-5 text-blue-500" />;
      case "weakness":
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case "risk":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Target className="h-5 w-5 text-gray-500" />;
    }
  };

  const getInsightBadgeColor = (type: string, impact: string) => {
    const baseColors = {
      strength: "bg-green-100 text-green-800",
      opportunity: "bg-blue-100 text-blue-800",
      weakness: "bg-orange-100 text-orange-800",
      risk: "bg-red-100 text-red-800"
    };

    return baseColors[type as keyof typeof baseColors] || "bg-gray-100 text-gray-800";
  };

  const getPredictionConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const formatCategoryName = (category: string) => {
    const names: Record<string, string> = {
      overall: "Overall",
      communication: "Communication",
      qualityOfWork: "Quality of Work",
      timeliness: "Timeliness",
      professionalism: "Professionalism",
      reliability: "Reliability"
    };
    return names[category] || category;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trend Analysis & Insights</h2>
          <p className="text-gray-600">Reputation trends and performance insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeframe} onValueChange={onTimeframeChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeframeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {trendSummary.overall.positive}
                </div>
                <div className="text-sm text-green-700">Positive Trends</div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {trendSummary.overall.neutral}
                </div>
                <div className="text-sm text-yellow-700">Stable Areas</div>
              </div>
              <BarChart3 className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {trendSummary.overall.negative}
                </div>
                <div className="text-sm text-red-700">Declining Areas</div>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="recommendations">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="flex items-center space-x-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary">
              {filteredTrends.length} data points
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Recent Trends
                </h3>
                <div className="space-y-3">
                  {filteredTrends.slice(0, 6).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTrendIcon(trend.change)}
                        <div>
                          <div className="font-medium">{formatCategoryName(trend.category)}</div>
                          <div className="text-sm text-gray-600">
                            {trend.date.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${getTrendColor(trend.change)}`}>
                          {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Score: {trend.score.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Category Performance
                </h3>
                <div className="space-y-4">
                  {Object.entries(trendSummary.categories).map(([category, data]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{formatCategoryName(category)}</span>
                        <span className="text-sm text-gray-600">
                          {data.positive + data.negative + data.neutral} points
                        </span>
                      </div>
                      <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="bg-green-500"
                          style={{
                            width: `${(data.positive / (data.positive + data.negative + data.neutral)) * 100}%`
                          }}
                        />
                        <div
                          className="bg-yellow-500"
                          style={{
                            width: `${(data.neutral / (data.positive + data.negative + data.neutral)) * 100}%`
                          }}
                        />
                        <div
                          className="bg-red-500"
                          style={{
                            width: `${(data.negative / (data.positive + data.negative + data.neutral)) * 100}%`
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>↗ {data.positive}</span>
                        <span>→ {data.neutral}</span>
                        <span>↘ {data.negative}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="flex items-center space-x-4">
            <Select value={insightFilter} onValueChange={setInsightFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Insights</SelectItem>
                <SelectItem value="strength">Strengths</SelectItem>
                <SelectItem value="opportunity">Opportunities</SelectItem>
                <SelectItem value="weakness">Weaknesses</SelectItem>
                <SelectItem value="risk">Risks</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary">
              {filteredInsights.length} insights
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredInsights.map((insight, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getInsightIcon(insight.type)}
                      <div>
                        <h4 className="font-semibold">{insight.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getInsightBadgeColor(insight.type, insight.impact)}>
                            {insight.type}
                          </Badge>
                          <Badge variant="outline">
                            {insight.impact} impact
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {insight.actionable && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Actionable
                      </Badge>
                    )}
                  </div>

                  <p className="text-gray-600 mb-4">{insight.description}</p>

                  {insight.dataPoints && insight.dataPoints.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Supporting Data:</div>
                      <div className="space-y-1">
                        {insight.dataPoints.map((point, pointIndex) => (
                          <div key={pointIndex} className="text-sm text-gray-600 flex items-center">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                            {point}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {insight.suggestedActions && insight.suggestedActions.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Suggested Actions:</div>
                      <div className="space-y-1">
                        {insight.suggestedActions.map((action, actionIndex) => (
                          <div key={actionIndex} className="text-sm text-gray-600 flex items-center">
                            <ArrowRight className="h-3 w-3 mr-2 text-blue-500" />
                            {action}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {predictions.map((prediction, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-lg">
                      {formatCategoryName(prediction.category)}
                    </h4>
                    <Badge className={getPredictionConfidenceColor(prediction.confidence)}>
                      {(prediction.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-700">
                        {prediction.currentScore.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Current</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className={`text-xl font-bold ${
                        prediction.predictedScore > prediction.currentScore
                          ? 'text-green-600'
                          : prediction.predictedScore < prediction.currentScore
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}>
                        {prediction.predictedScore.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Predicted</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">
                      Prediction for next {prediction.timeframe} days
                    </div>
                    <div className={`text-lg font-medium ${
                      prediction.predictedScore > prediction.currentScore
                        ? 'text-green-600'
                        : prediction.predictedScore < prediction.currentScore
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}>
                      {prediction.predictedScore > prediction.currentScore ? '+' : ''}
                      {(prediction.predictedScore - prediction.currentScore).toFixed(1)} points
                    </div>
                  </div>

                  {prediction.factors.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Key Factors:</div>
                      <div className="space-y-2">
                        {prediction.factors.map((factor, factorIndex) => (
                          <div key={factorIndex} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{factor.name}</span>
                            <div className="flex items-center space-x-1">
                              {factor.trend === 'positive' ? (
                                <TrendingUp className="h-3 w-3 text-green-500" />
                              ) : factor.trend === 'negative' ? (
                                <TrendingDown className="h-3 w-3 text-red-500" />
                              ) : (
                                <div className="h-3 w-3 rounded-full bg-gray-300" />
                              )}
                              <span className={`font-medium ${
                                factor.impact > 0 ? 'text-green-600' : factor.impact < 0 ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {recommendations.map((recommendation, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <Award className="h-5 w-5 text-blue-500" />
                        <h4 className="font-semibold text-lg">{recommendation.title}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={
                            recommendation.priority === 'high'
                              ? 'bg-red-100 text-red-800'
                              : recommendation.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }
                        >
                          {recommendation.priority} priority
                        </Badge>
                        <Badge variant="outline">{recommendation.type.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        +{recommendation.estimatedImpact}
                      </div>
                      <div className="text-sm text-gray-600">points</div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{recommendation.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Estimated time: {recommendation.estimatedTimeToComplete} days
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Impact: +{recommendation.estimatedImpact} reputation points
                      </span>
                    </div>
                  </div>

                  {recommendation.steps.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Action Steps:</div>
                      <div className="space-y-2">
                        {recommendation.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-center text-sm text-gray-600">
                            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                              {stepIndex + 1}
                            </span>
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {recommendation.resources.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Resources:</div>
                      <div className="space-y-2">
                        {recommendation.resources.map((resource, resourceIndex) => (
                          <div key={resourceIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <div className="text-sm font-medium">{resource.title}</div>
                              <div className="text-xs text-gray-600">{resource.description}</div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {resource.type}
                              {resource.estimatedTime && ` • ${resource.estimatedTime}min`}
                              {resource.cost && ` • $${resource.cost}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t">
                    <Button className="w-full">
                      Start Implementation
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}