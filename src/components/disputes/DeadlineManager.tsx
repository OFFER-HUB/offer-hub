"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDisputeWorkflow } from "@/hooks/use-dispute-workflow";
import {
  DeadlineManagerProps,
  Deadline,
  DeadlineExtension,
} from "@/types/workflow.types";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Calendar,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Settings,
  History,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";

export function DeadlineManager({
  disputeId,
  showOverdueOnly = false,
  allowExtensions = true,
  showEscalationHistory = true,
}: DeadlineManagerProps) {
  const { workflowState, actions } = useDisputeWorkflow(disputeId);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [filteredDeadlines, setFilteredDeadlines] = useState<Deadline[]>([]);
  const [isExtending, setIsExtending] = useState(false);
  const [extendingDeadline, setExtendingDeadline] = useState<Deadline | null>(
    null
  );
  const [extensionHours, setExtensionHours] = useState(24);
  const [extensionReason, setExtensionReason] = useState("");

  // Mock deadlines data - in real implementation, this would come from the API
  useEffect(() => {
    const mockDeadlines: Deadline[] = [
      {
        id: "1",
        stageId: "evidence_collection",
        stageName: "evidence_collection",
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        isOverdue: false,
        escalationTriggered: false,
        extensionHistory: [
          {
            extendedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            extendedBy: "mediator123",
            originalDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            newDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            reason: "Additional evidence required from both parties",
          },
        ],
      },
      {
        id: "2",
        stageId: "mediation_process",
        stageName: "mediation_process",
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        isOverdue: false,
        escalationTriggered: false,
        extensionHistory: [],
      },
      {
        id: "3",
        stageId: "arbitration",
        stageName: "arbitration",
        deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day overdue
        isOverdue: true,
        escalationTriggered: true,
        extensionHistory: [],
      },
    ];

    setDeadlines(mockDeadlines);
  }, [disputeId]);

  // Filter deadlines
  useEffect(() => {
    let filtered = deadlines;

    if (showOverdueOnly) {
      filtered = filtered.filter((d) => d.isOverdue);
    }

    setFilteredDeadlines(filtered);
  }, [deadlines, showOverdueOnly]);

  const handleExtendDeadline = async () => {
    if (!extendingDeadline || !extensionHours || !extensionReason.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const newDeadline = new Date(
        extendingDeadline.deadline.getTime() + extensionHours * 60 * 60 * 1000
      );

      // In real implementation, this would call the API
      const newExtension: DeadlineExtension = {
        extendedAt: new Date(),
        extendedBy: "current_user",
        originalDeadline: extendingDeadline.deadline,
        newDeadline,
        reason: extensionReason,
      };

      setDeadlines((prev) =>
        prev.map((d) =>
          d.id === extendingDeadline.id
            ? {
                ...d,
                deadline: newDeadline,
                extensionHistory: [...d.extensionHistory, newExtension],
              }
            : d
        )
      );

      toast.success(`Deadline extended by ${extensionHours} hours`);
      setIsExtending(false);
      setExtendingDeadline(null);
      setExtensionHours(24);
      setExtensionReason("");
    } catch (error) {
      toast.error("Failed to extend deadline");
    }
  };

  const handleTriggerEscalation = async (
    deadlineId: string,
    reason: string
  ) => {
    try {
      // In real implementation, this would call the API
      setDeadlines((prev) =>
        prev.map((d) =>
          d.id === deadlineId ? { ...d, escalationTriggered: true } : d
        )
      );

      toast.success("Escalation triggered successfully");
    } catch (error) {
      toast.error("Failed to trigger escalation");
    }
  };

  const getTimeRemaining = (deadline: Date): string => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();

    if (diff <= 0) return "Overdue";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const getDeadlineStatus = (
    deadline: Deadline
  ): "critical" | "warning" | "normal" | "overdue" => {
    if (deadline.isOverdue) return "overdue";

    const now = new Date();
    const diff = deadline.deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours <= 24) return "critical";
    if (hours <= 72) return "warning";
    return "normal";
  };

  const getStatusColor = (
    status: "critical" | "warning" | "normal" | "overdue"
  ): string => {
    switch (status) {
      case "overdue":
        return "border-red-500 bg-red-50";
      case "critical":
        return "border-red-400 bg-red-100";
      case "warning":
        return "border-yellow-400 bg-yellow-100";
      case "normal":
        return "border-green-400 bg-green-100";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  const getStatusIcon = (
    status: "critical" | "warning" | "normal" | "overdue"
  ): React.ReactNode => {
    switch (status) {
      case "overdue":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "normal":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getProgressPercentage = (deadline: Deadline): number => {
    // This is a simplified calculation - in real implementation,
    // you'd calculate based on actual stage progress
    const now = new Date();
    const totalDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
    const elapsed =
      now.getTime() - (deadline.deadline.getTime() - totalDuration);

    if (deadline.isOverdue) return 100;

    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStageLabel = (stageName: string): string => {
    return stageName.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const overdueCount = deadlines.filter((d) => d.isOverdue).length;
  const criticalCount = deadlines.filter(
    (d) => getDeadlineStatus(d) === "critical"
  ).length;
  const warningCount = deadlines.filter(
    (d) => getDeadlineStatus(d) === "warning"
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Deadlines
                </p>
                <p className="text-2xl font-bold">{deadlines.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {overdueCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">
                  {criticalCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Warning</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {warningCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deadlines List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredDeadlines.map((deadline, index) => {
            const status = getDeadlineStatus(deadline);
            const timeRemaining = getTimeRemaining(deadline.deadline);
            const progressPercentage = getProgressPercentage(deadline);

            return (
              <motion.div
                key={deadline.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`transition-all duration-200 ${getStatusColor(
                    status
                  )}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          {getStatusIcon(status)}
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {getStageLabel(deadline.stageName)}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Deadline: {formatDate(deadline.deadline)}
                              </p>
                            </div>

                            <div className="text-right">
                              <Badge
                                variant={
                                  status === "overdue"
                                    ? "destructive"
                                    : status === "critical"
                                    ? "destructive"
                                    : status === "warning"
                                    ? "secondary"
                                    : "default"
                                }
                                className="mb-2"
                              >
                                {timeRemaining}
                              </Badge>

                              {deadline.escalationTriggered && (
                                <Badge variant="outline" className="ml-2">
                                  Escalated
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{Math.round(progressPercentage)}%</span>
                            </div>
                            <Progress
                              value={progressPercentage}
                              className="h-2"
                            />
                          </div>

                          {/* Extension History */}
                          {deadline.extensionHistory.length > 0 &&
                            showEscalationHistory && (
                              <div className="bg-white/50 p-3 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                  <History className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium">
                                    Extension History
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {deadline.extensionHistory.map(
                                    (extension, extIndex) => (
                                      <div key={extIndex} className="text-sm">
                                        <div className="flex items-center justify-between">
                                          <span className="font-medium">
                                            Extended by {extension.extendedBy}
                                          </span>
                                          <span className="text-gray-500">
                                            {formatDate(extension.extendedAt)}
                                          </span>
                                        </div>
                                        <p className="text-gray-600 text-xs mt-1">
                                          {extension.reason}
                                        </p>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2 ml-4">
                        {allowExtensions && !deadline.isOverdue && (
                          <Dialog
                            open={
                              isExtending &&
                              extendingDeadline?.id === deadline.id
                            }
                            onOpenChange={setIsExtending}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setExtendingDeadline(deadline)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Extend
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Extend Deadline</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">
                                    Extension Hours
                                  </label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="168" // 1 week max
                                    value={extensionHours}
                                    onChange={(e) =>
                                      setExtensionHours(
                                        parseInt(e.target.value) || 24
                                      )
                                    }
                                  />
                                </div>

                                <div className="space-y-2">
                                  <label className="text-sm font-medium">
                                    Reason
                                  </label>
                                  <Textarea
                                    placeholder="Explain why the deadline needs to be extended"
                                    value={extensionReason}
                                    onChange={(e) =>
                                      setExtensionReason(e.target.value)
                                    }
                                    rows={3}
                                  />
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-sm">
                                    <strong>Current Deadline:</strong>{" "}
                                    {formatDate(deadline.deadline)}
                                  </p>
                                  <p className="text-sm">
                                    <strong>New Deadline:</strong>{" "}
                                    {formatDate(
                                      new Date(
                                        deadline.deadline.getTime() +
                                          extensionHours * 60 * 60 * 1000
                                      )
                                    )}
                                  </p>
                                </div>

                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setIsExtending(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button onClick={handleExtendDeadline}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Extend Deadline
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {!deadline.escalationTriggered &&
                          (status === "critical" || status === "overdue") && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleTriggerEscalation(
                                  deadline.id,
                                  "Deadline exceeded"
                                )
                              }
                            >
                              <ArrowRight className="h-4 w-4 mr-2" />
                              Escalate
                            </Button>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredDeadlines.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No deadlines found</h3>
              <p className="text-gray-600">
                {showOverdueOnly
                  ? "No overdue deadlines"
                  : "All deadlines are on track"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              View Calendar
            </Button>
            <Button variant="outline" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance Report
            </Button>
            <Button variant="outline" size="sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Alert Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
