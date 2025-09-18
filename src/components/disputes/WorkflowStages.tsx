"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  WorkflowStagesProps,
  WorkflowStage,
  WorkflowStageName,
  WorkflowStageStatus,
} from "@/types/workflow.types";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ChevronRight,
  FileText,
  Users,
  MessageSquare,
  Gavel,
  TrendingUp,
  ArrowRight,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const stageIcons: Record<WorkflowStageName, React.ReactNode> = {
  dispute_initiation: <FileText className="h-5 w-5" />,
  mediator_assignment: <Users className="h-5 w-5" />,
  evidence_collection: <FileText className="h-5 w-5" />,
  mediation_process: <MessageSquare className="h-5 w-5" />,
  resolution_or_escalation: <AlertCircle className="h-5 w-5" />,
  arbitration: <Gavel className="h-5 w-5" />,
  resolution_implementation: <TrendingUp className="h-5 w-5" />,
};

const stageLabels: Record<WorkflowStageName, string> = {
  dispute_initiation: "Dispute Initiation",
  mediator_assignment: "Mediator Assignment",
  evidence_collection: "Evidence Collection",
  mediation_process: "Mediation Process",
  resolution_or_escalation: "Resolution or Escalation",
  arbitration: "Arbitration",
  resolution_implementation: "Resolution Implementation",
};

const stageDescriptions: Record<WorkflowStageName, string> = {
  dispute_initiation:
    "Initial dispute submission and basic information collection",
  mediator_assignment: "Assignment of qualified mediator to handle the dispute",
  evidence_collection:
    "Collection and validation of evidence from both parties",
  mediation_process: "Facilitated negotiation and settlement attempts",
  resolution_or_escalation:
    "Final mediation outcome or escalation to arbitration",
  arbitration: "Binding arbitration process with final decision",
  resolution_implementation:
    "Implementation of resolution and fund distribution",
};

const statusColors: Record<WorkflowStageStatus, string> = {
  pending: "bg-gray-100 text-gray-800 border-gray-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  skipped: "bg-yellow-100 text-yellow-800 border-yellow-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  escalated: "bg-purple-100 text-purple-800 border-purple-200",
};

const statusIcons: Record<WorkflowStageStatus, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  in_progress: <AlertCircle className="h-4 w-4" />,
  completed: <CheckCircle className="h-4 w-4" />,
  skipped: <XCircle className="h-4 w-4" />,
  failed: <XCircle className="h-4 w-4" />,
  escalated: <ArrowRight className="h-4 w-4" />,
};

export function WorkflowStages({
  stages,
  currentStage,
  onStageClick,
  showProgress = true,
  compact = false,
}: WorkflowStagesProps) {
  const getStageStatus = (stage: WorkflowStage): WorkflowStageStatus => {
    if (stage.status) return stage.status;

    const currentIndex = stages.findIndex((s) => s.stageName === currentStage);
    const stageIndex = stages.findIndex((s) => s.stageName === stage.stageName);

    if (stageIndex < currentIndex) return "completed";
    if (stageIndex === currentIndex) return "in_progress";
    return "pending";
  };

  const getStageProgress = (stage: WorkflowStage): number => {
    if (stage.status === "completed") return 100;
    if (stage.status === "in_progress") return 50;
    if (stage.status === "failed") return 0;
    return 0;
  };

  const isStageClickable = (stage: WorkflowStage): boolean => {
    const status = getStageStatus(stage);
    return status === "completed" || status === "in_progress";
  };

  const formatDuration = (duration: number): string => {
    if (duration < 24) return `${duration}h`;
    const days = Math.floor(duration / 24);
    const hours = duration % 24;
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  };

  const formatDate = (date?: Date): string => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getTimeRemaining = (deadline?: Date): string => {
    if (!deadline) return "";

    const now = new Date();
    const diff = deadline.getTime() - now.getTime();

    if (diff <= 0) return "Overdue";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m remaining`;
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {stages.map((stage, index) => {
          const status = getStageStatus(stage);
          const progress = getStageProgress(stage);
          const isActive = stage.stageName === currentStage;
          const isCompleted = status === "completed";
          const isClickable = isStageClickable(stage);

          return (
            <TooltipProvider key={stage.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                      isActive
                        ? "border-blue-500 bg-blue-50"
                        : isCompleted
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    } ${
                      isClickable
                        ? "cursor-pointer"
                        : "cursor-not-allowed opacity-60"
                    }`}
                    onClick={() =>
                      isClickable && onStageClick?.(stage.stageName)
                    }
                  >
                    <div
                      className={`p-1 rounded-full ${
                        isActive
                          ? "bg-blue-500 text-white"
                          : isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {stageIcons[stage.stageName]}
                    </div>

                    {showProgress && isActive && (
                      <div className="w-16">
                        <Progress value={progress} className="h-1" />
                      </div>
                    )}

                    {index < stages.length - 1 && (
                      <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
                    )}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {stageLabels[stage.stageName]}
                    </p>
                    <p className="text-sm text-gray-600">
                      {stageDescriptions[stage.stageName]}
                    </p>
                    {stage.metadata?.duration && (
                      <p className="text-xs text-gray-500">
                        Duration: {formatDuration(stage.metadata.duration)}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stages.map((stage, index) => {
        const status = getStageStatus(stage);
        const progress = getStageProgress(stage);
        const isActive = stage.stageName === currentStage;
        const isCompleted = status === "completed";
        const isClickable = isStageClickable(stage);
        const timeRemaining = getTimeRemaining(stage.deadline);

        return (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`transition-all duration-200 ${
                isActive
                  ? "ring-2 ring-blue-500 bg-blue-50/50"
                  : isCompleted
                  ? "bg-green-50/50"
                  : "hover:shadow-md"
              } ${isClickable ? "cursor-pointer" : "cursor-not-allowed"}`}
              onClick={() => isClickable && onStageClick?.(stage.stageName)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Stage Icon & Status */}
                  <div className="flex flex-col items-center space-y-2">
                    <div
                      className={`p-3 rounded-full ${
                        isActive
                          ? "bg-blue-500 text-white"
                          : isCompleted
                          ? "bg-green-500 text-white"
                          : status === "failed"
                          ? "bg-red-500 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {stageIcons[stage.stageName]}
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-xs ${statusColors[status]}`}
                    >
                      <div className="flex items-center space-x-1">
                        {statusIcons[status]}
                        <span>{status.replace("_", " ")}</span>
                      </div>
                    </Badge>
                  </div>

                  {/* Stage Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {stageLabels[stage.stageName]}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {stageDescriptions[stage.stageName]}
                        </p>
                      </div>

                      <div className="text-right space-y-1">
                        {stage.metadata?.duration && (
                          <p className="text-sm text-gray-500">
                            Duration: {formatDuration(stage.metadata.duration)}
                          </p>
                        )}
                        {stage.deadline && (
                          <p className="text-sm text-gray-500">
                            Due: {formatDate(stage.deadline)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {showProgress && (isActive || isCompleted) && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}

                    {/* Time Remaining */}
                    {isActive && timeRemaining && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span
                          className={
                            timeRemaining === "Overdue"
                              ? "text-red-600 font-medium"
                              : "text-gray-600"
                          }
                        >
                          {timeRemaining}
                        </span>
                      </div>
                    )}

                    {/* Requirements */}
                    {stage.metadata?.requirements && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                          <Info className="h-4 w-4" />
                          <span>Requirements</span>
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {stage.metadata.requirements
                            .slice(0, 3)
                            .map((requirement: string, reqIndex: number) => (
                              <li
                                key={reqIndex}
                                className="flex items-center space-x-2"
                              >
                                <div className="w-1 h-1 bg-gray-400 rounded-full" />
                                <span>{requirement}</span>
                              </li>
                            ))}
                          {stage.metadata.requirements.length > 3 && (
                            <li className="text-xs text-gray-500">
                              +{stage.metadata.requirements.length - 3} more
                              requirements
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Stage Dates */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        {stage.startedAt && (
                          <span>Started: {formatDate(stage.startedAt)}</span>
                        )}
                        {stage.completedAt && (
                          <span>
                            Completed: {formatDate(stage.completedAt)}
                          </span>
                        )}
                      </div>

                      {stage.assignedTo && (
                        <span>Assigned to: {stage.assignedTo}</span>
                      )}
                    </div>

                    {/* Action Button */}
                    {isActive && isClickable && (
                      <div className="pt-2">
                        <Button size="sm" variant="outline" className="w-full">
                          <Info className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {/* Stage Navigation */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Click on completed or current stages to view details
              </span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Total Stages: {stages.length}</span>
              <span>•</span>
              <span>
                Completed:{" "}
                {stages.filter((s) => getStageStatus(s) === "completed").length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
