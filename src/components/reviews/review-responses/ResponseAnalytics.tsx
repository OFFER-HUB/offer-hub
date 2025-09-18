"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BarChart3,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Star,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  ResponseAnalyticsProps,
  ResponseAnalyticsFilters,
  ResponseStatus,
} from "@/types/review-responses.types";
import { useResponseAnalytics } from "@/hooks/useResponseModeration";

export default function ResponseAnalytics({
  analytics,
  filters = {},
  onFilterChange,
}: ResponseAnalyticsProps) {
  const [localFilters, setLocalFilters] =
    useState<ResponseAnalyticsFilters>(filters);
  const [isLoading, setIsLoading] = useState(false);

  const {
    analytics: hookAnalytics,
    isLoading: isLoadingHook,
    error,
    fetchAnalytics,
  } = useResponseAnalytics();

  // Use provided analytics or fetch from hook
  const analyticsData = analytics || hookAnalytics;
  const isLoadingData = isLoading || isLoadingHook;

  useEffect(() => {
    if (!analytics && onFilterChange) {
      fetchAnalytics(localFilters);
    }
  }, [analytics, localFilters, fetchAnalytics, onFilterChange]);

  const handleFilterChange = (
    newFilters: Partial<ResponseAnalyticsFilters>
  ) => {
    const updatedFilters = { ...localFilters, ...newFilters };
    setLocalFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  const exportData = () => {
    if (!analyticsData) return;

    const csvData = [
      ["Metric", "Value"],
      ["Total Responses", analyticsData.total_responses],
      ["Response Rate (%)", analyticsData.response_rate.toFixed(2)],
      ["Quality Score", analyticsData.quality_score.toFixed(2)],
      ["Total Views", analyticsData.engagement_metrics.total_views],
      [
        "Total Helpful Votes",
        analyticsData.engagement_metrics.total_helpful_votes,
      ],
      [
        "Total Unhelpful Votes",
        analyticsData.engagement_metrics.total_unhelpful_votes,
      ],
      [
        "Average Engagement Score",
        analyticsData.engagement_metrics.average_engagement_score.toFixed(2),
      ],
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `response-analytics-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getEngagementScoreColor = (score: number) => {
    if (score >= 4) return "text-green-600";
    if (score >= 3) return "text-yellow-600";
    if (score >= 2) return "text-orange-600";
    return "text-red-600";
  };

  const getEngagementScoreBg = (score: number) => {
    if (score >= 4) return "bg-green-50 border-green-200";
    if (score >= 3) return "bg-yellow-50 border-yellow-200";
    if (score >= 2) return "bg-orange-50 border-orange-200";
    return "bg-red-50 border-red-200";
  };

  const getResponseRateColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-yellow-600";
    if (rate >= 40) return "text-orange-600";
    return "text-red-600";
  };

  if (isLoadingData) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load analytics: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">
              No analytics data available
            </p>
            <p className="text-sm">
              Analytics will appear once responses are created
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Response Analytics Dashboard
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAnalytics(localFilters)}
                disabled={isLoadingData}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Date Range:
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={localFilters.date_from || ""}
                  onChange={(e) =>
                    handleFilterChange({ date_from: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={localFilters.date_to || ""}
                  onChange={(e) =>
                    handleFilterChange({ date_to: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Status Filter:
              </label>
              <select
                value={localFilters.status || ""}
                onChange={(e) =>
                  handleFilterChange({
                    status: (e.target.value as ResponseStatus) || undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Min Engagement Score:
              </label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={localFilters.min_engagement_score || ""}
                onChange={(e) =>
                  handleFilterChange({
                    min_engagement_score: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Responses
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.total_responses}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Response Rate
                </p>
                <p
                  className={`text-2xl font-bold ${getResponseRateColor(
                    analyticsData.response_rate
                  )}`}
                >
                  {analyticsData.response_rate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Quality Score
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.quality_score.toFixed(1)}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Engagement
                </p>
                <p
                  className={`text-2xl font-bold ${getEngagementScoreColor(
                    analyticsData.engagement_metrics.average_engagement_score
                  )}`}
                >
                  {analyticsData.engagement_metrics.average_engagement_score.toFixed(
                    1
                  )}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Engagement Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-3">
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData.engagement_metrics.total_views}
              </p>
              <p className="text-sm text-gray-600">Total Views</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-3">
                <ThumbsUp className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData.engagement_metrics.total_helpful_votes}
              </p>
              <p className="text-sm text-gray-600">Helpful Votes</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-3">
                <ThumbsDown className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData.engagement_metrics.total_unhelpful_votes}
              </p>
              <p className="text-sm text-gray-600">Unhelpful Votes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Performance Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">Response Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      analyticsData.response_rate >= 80
                        ? "bg-green-500"
                        : analyticsData.response_rate >= 60
                        ? "bg-yellow-500"
                        : analyticsData.response_rate >= 40
                        ? "bg-orange-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.min(analyticsData.response_rate, 100)}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {analyticsData.response_rate.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-600" />
                <span className="font-medium">Quality Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      analyticsData.quality_score >= 80
                        ? "bg-green-500"
                        : analyticsData.quality_score >= 60
                        ? "bg-yellow-500"
                        : analyticsData.quality_score >= 40
                        ? "bg-orange-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.min(analyticsData.quality_score, 100)}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {analyticsData.quality_score.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Engagement Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      analyticsData.engagement_metrics
                        .average_engagement_score >= 4
                        ? "bg-green-500"
                        : analyticsData.engagement_metrics
                            .average_engagement_score >= 3
                        ? "bg-yellow-500"
                        : analyticsData.engagement_metrics
                            .average_engagement_score >= 2
                        ? "bg-orange-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${
                        (analyticsData.engagement_metrics
                          .average_engagement_score /
                          5) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {analyticsData.engagement_metrics.average_engagement_score.toFixed(
                    1
                  )}
                  /5
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.response_rate < 60 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Low Response Rate:</strong> Only{" "}
                  {analyticsData.response_rate.toFixed(1)}% of reviews receive
                  responses. Consider implementing automated reminders or
                  incentives to encourage more responses.
                </AlertDescription>
              </Alert>
            )}

            {analyticsData.quality_score < 70 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Quality Improvement Needed:</strong> Average response
                  quality is {analyticsData.quality_score.toFixed(1)}. Consider
                  providing better guidelines and examples to improve response
                  quality.
                </AlertDescription>
              </Alert>
            )}

            {analyticsData.engagement_metrics.average_engagement_score < 3 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Low Engagement:</strong> Average engagement score is{" "}
                  {analyticsData.engagement_metrics.average_engagement_score.toFixed(
                    1
                  )}
                  /5. Focus on creating more helpful and relevant responses.
                </AlertDescription>
              </Alert>
            )}

            {analyticsData.response_rate >= 80 &&
              analyticsData.quality_score >= 80 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Excellent Performance:</strong> Your response system
                    is performing well with high response rates and quality
                    scores. Keep up the great work!
                  </AlertDescription>
                </Alert>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
