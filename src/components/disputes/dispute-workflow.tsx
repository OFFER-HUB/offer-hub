"use client";

import React, { useState, useEffect } from "react";
import { useDisputeWorkflow } from "@/hooks/use-dispute-workflow";
import { WorkflowStages } from "./WorkflowStages";
import { ProgressTracking } from "./ProgressTracking";
import { NotificationCenter } from "./NotificationCenter";
import { DeadlineManager } from "./DeadlineManager";
import { WorkflowAnalytics } from "./WorkflowAnalytics";
import { MobileWorkflow } from "./MobileWorkflow";
import { AuditTrailViewer } from "./AuditTrailViewer";
import {
  DisputeWorkflowProps,
  WorkflowStageName,
  WorkflowAnalytics as WorkflowAnalyticsType,
} from "@/types/workflow.types";
import {
  ChevronRight,
  Clock,
  Users,
  FileText,
  AlertCircle,
  TrendingUp,
  Smartphone,
  History,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useMediaQuery } from "@/hooks/use-media-query";

export function DisputeWorkflow({
  disputeId,
  onStageChange,
  onProgressUpdate,
  showAnalytics = false,
  mobileOptimized = false,
}: DisputeWorkflowProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState<WorkflowAnalyticsType | null>(
    null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    workflowState,
    isLoading,
    error,
    currentStage,
    progressPercentage,
    nextDeadline,
    canAdvanceStage,
    actions,
  } = useDisputeWorkflow(disputeId);

  // Handle stage changes
  useEffect(() => {
    if (currentStage && onStageChange) {
      onStageChange(currentStage);
    }
  }, [currentStage, onStageChange]);

  // Handle progress updates
  useEffect(() => {
    if (progressPercentage !== undefined && onProgressUpdate) {
      onProgressUpdate(progressPercentage);
    }
  }, [progressPercentage, onProgressUpdate]);

  // Load analytics if requested
  useEffect(() => {
    if (showAnalytics && !analytics) {
      actions.getAnalytics().then(setAnalytics).catch(console.error);
    }
  }, [showAnalytics, analytics, actions]);

  // Refresh workflow state
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await actions.getAnalytics();
      setAnalytics(null); // Force reload
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Mobile-specific handling
  if (isMobile && mobileOptimized) {
    return (
      <MobileWorkflow
        disputeId={disputeId}
        onActionComplete={(action) => {
          console.log("Action completed:", action);
          handleRefresh();
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading workflow...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Error Loading Workflow
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!workflowState) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Workflow Found</h3>
            <p className="text-gray-600 mb-4">
              No workflow has been initialized for this dispute.
            </p>
            <Button onClick={handleRefresh} variant="outline">
              Initialize Workflow
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStageColor = (stage: WorkflowStageName) => {
    const stageIndex = workflowState.configuration.stages.findIndex(
      (s) => s.stageName === stage
    );
    const currentIndex = workflowState.configuration.stages.findIndex(
      (s) => s.stageName === currentStage
    );

    if (stageIndex < currentIndex) return "bg-green-500";
    if (stageIndex === currentIndex) return "bg-blue-500";
    return "bg-gray-300";
  };

  const getStageIcon = (stage: WorkflowStageName) => {
    switch (stage) {
      case "dispute_initiation":
        return <FileText className="h-4 w-4" />;
      case "mediator_assignment":
        return <Users className="h-4 w-4" />;
      case "evidence_collection":
        return <FileText className="h-4 w-4" />;
      case "mediation_process":
        return <Users className="h-4 w-4" />;
      case "resolution_or_escalation":
        return <AlertCircle className="h-4 w-4" />;
      case "arbitration":
        return <Users className="h-4 w-4" />;
      case "resolution_implementation":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dispute Workflow</h2>
          <p className="text-gray-600">
            Track and manage dispute resolution progress
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          {isMobile && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Smartphone className="h-3 w-3" />
              <span>Mobile</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Overall Progress</span>
            <Badge
              variant={progressPercentage === 100 ? "default" : "secondary"}
            >
              {progressPercentage}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>
                  Current Stage:{" "}
                  {currentStage
                    ?.replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </div>
              {nextDeadline && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    Next Deadline: {new Date(nextDeadline).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stages">Stages</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {showAnalytics && (
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Current Stage Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Current Stage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-full ${getStageColor(
                      currentStage!
                    )} text-white`}
                  >
                    {getStageIcon(currentStage!)}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {currentStage
                        ?.replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                    <p className="text-sm text-gray-600">
                      {
                        workflowState.configuration.stages.find(
                          (s) => s.stageName === currentStage
                        )?.duration
                      }
                      h duration
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Next Action Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Next Action
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {canAdvanceStage
                      ? "Ready to advance"
                      : "Complete current stage"}
                  </p>
                  {canAdvanceStage && (
                    <Button size="sm" className="w-full">
                      <ChevronRight className="h-4 w-4 mr-1" />
                      Advance Stage
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View Evidence
                </Button>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Contact Mediator
                </Button>
                <Button variant="outline" size="sm">
                  <History className="h-4 w-4 mr-2" />
                  View History
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stages">
          <WorkflowStages
            stages={workflowState.configuration.stages.map((stage) => ({
              id: stage.stageName,
              disputeId,
              stageName: stage.stageName,
              stageOrder: workflowState.configuration.stages.indexOf(stage),
              status:
                stage.stageName === currentStage
                  ? "in_progress"
                  : workflowState.configuration.stages.indexOf(stage) <
                    workflowState.configuration.stages.findIndex(
                      (s) => s.stageName === currentStage
                    )
                  ? "completed"
                  : "pending",
              startedAt:
                stage.stageName === currentStage ? new Date() : undefined,
              deadline: nextDeadline,
              metadata: {
                duration: stage.duration,
                requirements: stage.requirements,
              },
            }))}
            currentStage={currentStage!}
            onStageClick={(stage) => {
              console.log("Stage clicked:", stage);
            }}
            showProgress={true}
          />
        </TabsContent>

        <TabsContent value="progress">
          <ProgressTracking
            disputeId={disputeId}
            showMilestones={true}
            showNotes={true}
            allowUpdates={true}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationCenter
            disputeId={disputeId}
            showAllNotifications={true}
            allowMarkAsRead={true}
            allowSendNotification={true}
          />
        </TabsContent>

        {showAnalytics && (
          <TabsContent value="analytics">
            <WorkflowAnalytics
              disputeId={disputeId}
              timeRange="30d"
              showDetailedMetrics={true}
              exportable={true}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Deadline Manager - Always visible */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Deadlines & Escalations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DeadlineManager
            disputeId={disputeId}
            showOverdueOnly={false}
            allowExtensions={true}
            showEscalationHistory={true}
          />
        </CardContent>
      </Card>

      {/* Audit Trail - Collapsible */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Audit Trail</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AuditTrailViewer
            disputeId={disputeId}
            showDetailedChanges={true}
            exportable={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
