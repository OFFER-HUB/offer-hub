/**
 * @fileoverview Main reputation analytics interface
 * @author OnlyDust Platform
 * @license MIT
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { useReputationAnalytics } from "@/hooks/use-reputation-analytics";
import ReputationScoring from "./reputation-scoring";
import PerformanceAnalytics from "./performance-analytics";
import TrendAnalysis from "./trend-analysis";
import {
  Share2,
  Download,
  Settings,
  RefreshCw,
  Users,
  Trophy,
  Zap,
  Shield,
  Eye,
  EyeOff,
  Bell,
  Calendar,
  BarChart3,
  TrendingUp,
  Star,
  Award,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Smartphone
} from "lucide-react";

interface ReputationDashboardProps {
  userId: string;
  viewMode?: "desktop" | "mobile";
  compact?: boolean;
  className?: string;
}

export default function ReputationDashboard({
  userId,
  viewMode = "desktop",
  compact = false,
  className = ""
}: ReputationDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeframe, setTimeframe] = useState("6months");
  const [isPublicView, setIsPublicView] = useState(false);
  const [showNotifications, setShowNotifications] = useState(true);

  const {
    analytics,
    loading,
    error,
    refreshData,
    exportData,
    getInsights,
    getPredictions,
    getRecommendations,
    getBenchmarks,
    getTrends,
    getMobileView,
    markNotificationRead,
    retryCalculation
  } = useReputationAnalytics({
    userId,
    refreshInterval: 300000,
    enableRealTime: true,
    includeHistorical: true
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && analytics) {
        refreshData();
      }
    }, 300000);

    return () => clearInterval(interval);
  }, [loading, analytics, refreshData]);

  const mobileView = getMobileView();
  const insights = getInsights();
  const predictions = getPredictions();
  const recommendations = getRecommendations();
  const benchmarks = getBenchmarks();
  const trends = getTrends();

  const handleExport = async (format: 'pdf' | 'json' | 'csv' | 'linkedin' | 'portfolio') => {
    try {
      await exportData(format);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share && analytics) {
      navigator.share({
        title: 'My Reputation Score',
        text: `Check out my ${analytics.score.overall.toFixed(1)} reputation score on OnlyDust!`,
        url: window.location.href
      });
    }
  };

  const quickStats = analytics ? [
    {
      label: "Overall Score",
      value: analytics.score.overall.toFixed(1),
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      change: "+2.3"
    },
    {
      label: "Projects Completed",
      value: analytics.metrics.projectsCompleted.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+5"
    },
    {
      label: "Client Satisfaction",
      value: `${analytics.metrics.clientSatisfactionScore.toFixed(1)}/5`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+0.2"
    },
    {
      label: "On-Time Delivery",
      value: `${analytics.metrics.onTimeDelivery}%`,
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+3%"
    }
  ] : [];

  const priorityInsights = insights.filter(insight =>
    insight.impact === 'high' && insight.actionable
  ).slice(0, 3);

  const upcomingMilestones = [
    {
      title: "10 Projects Milestone",
      description: "Complete 2 more projects to unlock Achievement Badge",
      progress: 80,
      reward: "Achievement Badge",
      icon: Trophy
    },
    {
      title: "Excellence Tier",
      description: "Reach 95+ overall score to unlock Excellence status",
      progress: Math.min(95, (analytics?.score.overall || 0) / 95 * 100),
      reward: "Premium Features",
      icon: Award
    }
  ];

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                <Skeleton className="h-6 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div>
            <div className="font-medium">Error loading reputation data</div>
            <div className="text-sm mt-1">{error.message}</div>
            {error.retryable && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={retryCalculation}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </Alert>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <div>No reputation data available. Complete your first project to start tracking your reputation.</div>
        </Alert>
      </div>
    );
  }

  if (viewMode === "mobile" || compact) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Reputation</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ReputationScoring
          score={analytics.score}
          categories={analytics.categories}
          benchmarks={benchmarks}
          compact={true}
        />

        <div className="grid grid-cols-2 gap-3">
          {mobileView.condensedMetrics && Object.entries(mobileView.condensedMetrics).map(([key, value], index) => (
            <Card key={index} className="p-3">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {typeof value === 'number' ? value.toFixed(1) : value}
                </div>
                <div className="text-xs text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {mobileView.keyInsights.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Key Insights</h3>
              <div className="space-y-2">
                {mobileView.keyInsights.map((insight, index) => (
                  <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                    <div className="font-medium">{insight.title}</div>
                    <div className="text-gray-600">{insight.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-2">
          {mobileView.quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={action.action}
              className="h-auto p-3"
            >
              <div className="text-center">
                <div className="text-sm font-medium">{action.title}</div>
                <div className="text-xs text-gray-600">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reputation Dashboard</h1>
          <p className="text-gray-600">Track your professional reputation and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPublicView(!isPublicView)}
          >
            {isPublicView ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isPublicView ? "Private" : "Public"} View
          </Button>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {showNotifications && mobileView.notifications.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Bell className="h-4 w-4" />
          <div className="flex items-center justify-between w-full">
            <div>
              <div className="font-medium">You have {mobileView.notifications.length} new notifications</div>
              <div className="text-sm text-gray-600 mt-1">
                {mobileView.notifications[0].message}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                View All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(false)}
              >
                ×
              </Button>
            </div>
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-medium">{stat.change}</span>
                </div>
              </div>
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {priorityInsights.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center text-orange-700">
                <Zap className="h-5 w-5 mr-2" />
                Priority Actions Required
              </h3>
              <Badge variant="secondary">
                {priorityInsights.length} items
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {priorityInsights.map((insight, index) => (
                <div key={index} className="p-4 bg-white rounded-lg">
                  <h4 className="font-medium mb-2">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                  <Button size="sm" variant="outline" className="w-full">
                    Take Action
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {upcomingMilestones.length > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold flex items-center text-purple-700 mb-4">
              <Target className="h-5 w-5 mr-2" />
              Upcoming Milestones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingMilestones.map((milestone, index) => (
                <div key={index} className="p-4 bg-white rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <milestone.icon className="h-5 w-5 text-purple-600" />
                      <h4 className="font-medium">{milestone.title}</h4>
                    </div>
                    <Badge variant="secondary">{milestone.reward}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{milestone.progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="export">Export & Share</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ReputationScoring
            score={analytics.score}
            categories={analytics.categories}
            benchmarks={benchmarks}
            showDetails={!isPublicView}
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceAnalytics
            metrics={analytics.metrics}
            benchmarks={benchmarks}
            insights={insights}
            timeframe={timeframe}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <TrendAnalysis
            trends={trends}
            insights={insights}
            predictions={predictions}
            recommendations={recommendations}
            currentScore={analytics.score}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
          />
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Export Options
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleExport('pdf')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF Report
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleExport('linkedin')}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Export to LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleExport('portfolio')}
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Portfolio Format
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleExport('json')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Raw Data (JSON)
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Share2 className="h-5 w-5 mr-2" />
                  Share & Integration
                </h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Dashboard
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Mobile App
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Privacy Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Notification Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Export Preview</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Sample Export Content:</div>
                <div className="font-mono text-xs bg-white p-3 rounded border">
                  {`Professional Reputation Report

Overall Score: ${analytics.score.overall.toFixed(1)}/100
Communication: ${analytics.score.communication.toFixed(1)}/100
Quality: ${analytics.score.qualityOfWork.toFixed(1)}/100
Timeliness: ${analytics.score.timeliness.toFixed(1)}/100
Professionalism: ${analytics.score.professionalism.toFixed(1)}/100
Reliability: ${analytics.score.reliability.toFixed(1)}/100

Projects Completed: ${analytics.metrics.projectsCompleted}
Client Satisfaction: ${analytics.metrics.clientSatisfactionScore.toFixed(1)}/5
On-Time Delivery: ${analytics.metrics.onTimeDelivery}%`}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-center text-sm text-gray-500">
        Last updated: {analytics.score.lastUpdated.toLocaleString()} •
        Data refreshes every 5 minutes
      </div>
    </div>
  );
}