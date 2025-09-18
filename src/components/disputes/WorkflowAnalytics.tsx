"use client";

import React, { useState, useEffect } from "react";

import { useDisputeWorkflow } from "@/hooks/use-dispute-workflow";
import {
  WorkflowAnalyticsProps,
  WorkflowAnalytics as WorkflowAnalyticsType,
} from "@/types/workflow.types";
import {
  TrendingUp,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Download,
  RefreshCw,
  Target,
  Award,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "react-hot-toast";

// Mock chart data - in real implementation, use a charting library like Recharts
const MockChart = ({
  data,
  type = "bar",
}: {
  data: any[];
  type?: "bar" | "line" | "pie";
}) => (
  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
      <p className="text-gray-600">Chart visualization would be here</p>
      <p className="text-sm text-gray-500">
        {type} chart with {data.length} data points
      </p>
    </div>
  </div>
);

export function WorkflowAnalytics({
  disputeId,
  timeRange = "30d",
  showDetailedMetrics = true,
  exportable = true,
}: WorkflowAnalyticsProps) {
  const { actions } = useDisputeWorkflow(disputeId || "default");
  const [analytics, setAnalytics] = useState<WorkflowAnalyticsType | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  // Mock analytics data - in real implementation, this would come from the API
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockAnalytics: WorkflowAnalyticsType = {
          totalDisputes: 156,
          averageResolutionTime: 12.5, // days
          stageCompletionRates: {
            dispute_initiation: 98.5,
            mediator_assignment: 95.2,
            evidence_collection: 87.3,
            mediation_process: 78.9,
            resolution_or_escalation: 85.6,
            arbitration: 92.1,
            resolution_implementation: 96.8,
          },
          escalationRates: {
            mediation_to_arbitration: 23.4,
            overall_escalation: 18.7,
          },
          userSatisfactionScore: 4.2,
          performanceMetrics: {
            pageLoadTime: 1.2,
            apiResponseTime: 245,
            errorRate: 0.8,
          },
        };

        setAnalytics(mockAnalytics);
      } catch (error) {
        toast.error("Failed to load analytics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [disputeId, selectedTimeRange]);

  const handleExport = () => {
    if (!analytics) return;

    const dataStr = JSON.stringify(analytics, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `workflow-analytics-${
      disputeId || "platform"
    }-${selectedTimeRange}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast.success("Analytics exported successfully");
  };

  const handleRefresh = async () => {
    try {
      const data = await actions.getAnalytics();
      setAnalytics(data);
      toast.success("Analytics refreshed");
    } catch (error) {
      toast.error("Failed to refresh analytics");
    }
  };

  const getStageLabel = (stageName: string): string => {
    return stageName.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getCompletionColor = (rate: number): string => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 80) return "text-blue-600";
    if (rate >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceColor = (metric: string, value: number): string => {
    switch (metric) {
      case "pageLoadTime":
        return value <= 2
          ? "text-green-600"
          : value <= 3
          ? "text-yellow-600"
          : "text-red-600";
      case "apiResponseTime":
        return value <= 500
          ? "text-green-600"
          : value <= 1000
          ? "text-yellow-600"
          : "text-red-600";
      case "errorRate":
        return value <= 1
          ? "text-green-600"
          : value <= 3
          ? "text-yellow-600"
          : "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getTimeRangeLabel = (range: string): string => {
    switch (range) {
      case "7d":
        return "Last 7 Days";
      case "30d":
        return "Last 30 Days";
      case "90d":
        return "Last 90 Days";
      case "1y":
        return "Last Year";
      default:
        return "Last 30 Days";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No Analytics Available
            </h3>
            <p className="text-gray-600 mb-4">
              Analytics data is not available for this dispute.
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Workflow Analytics
          </h2>
          <p className="text-gray-600">
            {disputeId
              ? "Dispute-specific analytics"
              : "Platform-wide analytics"}{" "}
            for {getTimeRangeLabel(selectedTimeRange)}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Select
            value={selectedTimeRange}
            onValueChange={(value) =>
              setSelectedTimeRange(value as "7d" | "30d" | "90d" | "1y")
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          {exportable && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Disputes
                </p>
                <p className="text-2xl font-bold">{analytics.totalDisputes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Resolution Time
                </p>
                <p className="text-2xl font-bold">
                  {analytics.averageResolutionTime} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Award className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  User Satisfaction
                </p>
                <p className="text-2xl font-bold">
                  {analytics.userSatisfactionScore}/5
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Escalation Rate
                </p>
                <p className="text-2xl font-bold">
                  {analytics.escalationRates.overall_escalation}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="stages">Stage Analysis</TabsTrigger>
          <TabsTrigger value="escalations">Escalations</TabsTrigger>
          {showDetailedMetrics && (
            <TabsTrigger value="technical">Technical Metrics</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resolution Time Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Resolution Time Trend</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MockChart
                  data={[
                    { month: "Jan", time: 15.2 },
                    { month: "Feb", time: 14.8 },
                    { month: "Mar", time: 13.5 },
                    { month: "Apr", time: 12.9 },
                    { month: "May", time: 12.5 },
                  ]}
                  type="line"
                />
              </CardContent>
            </Card>

            {/* Dispute Volume */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Dispute Volume</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MockChart
                  data={[
                    { month: "Jan", disputes: 45 },
                    { month: "Feb", disputes: 52 },
                    { month: "Mar", disputes: 48 },
                    { month: "Apr", disputes: 61 },
                    { month: "May", disputes: 56 },
                  ]}
                  type="bar"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Stage Completion Rates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.stageCompletionRates).map(
                  ([stage, rate]) => (
                    <div key={stage} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {getStageLabel(stage)}
                        </span>
                        <span
                          className={`text-sm font-semibold ${getCompletionColor(
                            rate
                          )}`}
                        >
                          {rate}%
                        </span>
                      </div>
                      <Progress value={rate} className="h-2" />
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stage Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Stage Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <MockChart
                data={Object.entries(analytics.stageCompletionRates).map(
                  ([stage, rate]) => ({
                    stage: getStageLabel(stage),
                    rate,
                  })
                )}
                type="bar"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escalations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Escalation Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>Escalation Rates</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Mediation to Arbitration
                    </span>
                    <Badge variant="secondary">
                      {analytics.escalationRates.mediation_to_arbitration}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Overall Escalation
                    </span>
                    <Badge variant="outline">
                      {analytics.escalationRates.overall_escalation}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Escalation Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Escalation Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <MockChart
                  data={[
                    { month: "Jan", escalation: 22.1 },
                    { month: "Feb", escalation: 20.8 },
                    { month: "Mar", escalation: 19.5 },
                    { month: "Apr", escalation: 18.9 },
                    { month: "May", escalation: 18.7 },
                  ]}
                  type="line"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {showDetailedMetrics && (
          <TabsContent value="technical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Technical Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-1">Page Load Time</h3>
                    <p
                      className={`text-2xl font-bold ${getPerformanceColor(
                        "pageLoadTime",
                        analytics.performanceMetrics.pageLoadTime
                      )}`}
                    >
                      {analytics.performanceMetrics.pageLoadTime}s
                    </p>
                    <p className="text-sm text-gray-600">Average</p>
                  </div>

                  <div className="text-center">
                    <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-1">API Response Time</h3>
                    <p
                      className={`text-2xl font-bold ${getPerformanceColor(
                        "apiResponseTime",
                        analytics.performanceMetrics.apiResponseTime
                      )}`}
                    >
                      {analytics.performanceMetrics.apiResponseTime}ms
                    </p>
                    <p className="text-sm text-gray-600">Average</p>
                  </div>

                  <div className="text-center">
                    <div className="p-3 bg-red-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="font-semibold mb-1">Error Rate</h3>
                    <p
                      className={`text-2xl font-bold ${getPerformanceColor(
                        "errorRate",
                        analytics.performanceMetrics.errorRate
                      )}`}
                    >
                      {analytics.performanceMetrics.errorRate}%
                    </p>
                    <p className="text-sm text-gray-600">Average</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Insights & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Insights & Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-600">Strengths</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>
                    High completion rate for dispute initiation (98.5%)
                  </span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Fast API response times (245ms average)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Low overall escalation rate (18.7%)</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-yellow-600">
                Areas for Improvement
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span>Evidence collection completion rate (87.3%)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span>Mediation process completion rate (78.9%)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span>Consider optimizing page load times</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
