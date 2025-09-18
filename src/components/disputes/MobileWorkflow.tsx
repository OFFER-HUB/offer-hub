"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MobileWorkflowProps,
  PendingAction,
  WorkflowStageName,
} from "@/types/workflow.types";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  MessageSquare,
  Gavel,
  TrendingUp,
  Smartphone,
  Wifi,
  WifiOff,
  Hand,
  MoveLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "react-hot-toast";

export function MobileWorkflow({
  disputeId,
  onActionComplete,
  showOfflineIndicator = true,
  enableGestures = true,
}: MobileWorkflowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );

  // Default values for missing props
  const currentStage = "initial" as any;
  const progressPercentage = 0;

  // Mock pending actions - in real implementation, this would come from the API
  useEffect(() => {
    const mockActions: PendingAction[] = [
      {
        id: "1",
        type: "upload_evidence",
        title: "Upload Evidence",
        description: "Please upload supporting documents for your dispute",
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        priority: "high",
      },
      {
        id: "2",
        type: "respond_to_mediator",
        title: "Respond to Mediator",
        description: "The mediator has requested additional information",
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        priority: "urgent",
      },
      {
        id: "3",
        type: "accept_settlement",
        title: "Review Settlement Offer",
        description: "A settlement offer has been proposed",
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        priority: "medium",
      },
    ];

    setPendingActions(mockActions);
  }, [disputeId]);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Gesture handling
  const handleSwipe = (direction: "left" | "right") => {
    if (!enableGestures) return;

    setSwipeDirection(direction);

    if (direction === "left" && currentIndex < pendingActions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === "right" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }

    setTimeout(() => setSwipeDirection(null), 300);
  };

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      // Only handle horizontal swipes
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          handleSwipe("right");
        } else {
          handleSwipe("left");
        }
      }
    };

    const handleTouchEnd = () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
  };

  const handleActionComplete = (action: PendingAction) => {
    setPendingActions((prev) => prev.filter((a) => a.id !== action.id));
    onActionComplete?.(action);
    toast.success("Action completed successfully");
  };

  const getStageIcon = (stage: WorkflowStageName) => {
    switch (stage) {
      case "dispute_initiation":
        return <FileText className="h-6 w-6" />;
      case "mediator_assignment":
        return <Users className="h-6 w-6" />;
      case "evidence_collection":
        return <FileText className="h-6 w-6" />;
      case "mediation_process":
        return <MessageSquare className="h-6 w-6" />;
      case "resolution_or_escalation":
        return <AlertCircle className="h-6 w-6" />;
      case "arbitration":
        return <Gavel className="h-6 w-6" />;
      case "resolution_implementation":
        return <TrendingUp className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  const getStageLabel = (stage: WorkflowStageName): string => {
    return stage.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getPriorityColor = (
    priority: "low" | "medium" | "high" | "urgent"
  ): string => {
    switch (priority) {
      case "urgent":
        return "border-red-500 bg-red-50";
      case "high":
        return "border-orange-500 bg-orange-50";
      case "medium":
        return "border-yellow-500 bg-yellow-50";
      case "low":
        return "border-green-500 bg-green-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  const getPriorityIcon = (priority: "low" | "medium" | "high" | "urgent") => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "high":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case "medium":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimeRemaining = (deadline: Date): string => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();

    if (diff <= 0) return "Overdue";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-gray-500" />
              <div>
                <h1 className="font-semibold text-gray-900">
                  Dispute Workflow
                </h1>
                <p className="text-sm text-gray-600">Mobile View</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {showOfflineIndicator && (
                <div className="flex items-center space-x-1">
                  {isOffline ? (
                    <>
                      <WifiOff className="h-4 w-4 text-red-500" />
                      <span className="text-xs text-red-600">Offline</span>
                    </>
                  ) : (
                    <>
                      <Wifi className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-600">Online</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Current Stage Status */}
      <div className="p-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-full">
                {getStageIcon(currentStage!)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {getStageLabel(currentStage!)}
                </h3>
                <p className="text-sm text-gray-600">Current Stage</p>
              </div>
              <Badge variant="secondary">{progressPercentage}%</Badge>
            </div>

            <div className="mt-4">
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Pending Actions</h2>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{pendingActions.length}</Badge>
            {enableGestures && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <MoveLeft className="h-3 w-3" />
                <span>Swipe</span>
              </div>
            )}
          </div>
        </div>

        {pendingActions.length > 0 ? (
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{
                  opacity: 0,
                  x:
                    swipeDirection === "left"
                      ? 300
                      : swipeDirection === "right"
                      ? -300
                      : 0,
                }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x:
                    swipeDirection === "left"
                      ? -300
                      : swipeDirection === "right"
                      ? 300
                      : 0,
                }}
                transition={{ duration: 0.3 }}
                onTouchStart={handleTouchStart}
              >
                <Card
                  className={`${getPriorityColor(
                    pendingActions[currentIndex]?.priority || "medium"
                  )} border-2`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getPriorityIcon(
                          pendingActions[currentIndex]?.priority || "medium"
                        )}
                        <h3 className="font-semibold text-gray-900">
                          {pendingActions[currentIndex]?.title}
                        </h3>
                      </div>
                      <Badge variant="outline">
                        {pendingActions[currentIndex]?.priority}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      {pendingActions[currentIndex]?.description}
                    </p>

                    {pendingActions[currentIndex]?.deadline && (
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            Due:{" "}
                            {formatTimeRemaining(
                              pendingActions[currentIndex].deadline
                            )}
                          </span>
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      onClick={() =>
                        handleActionComplete(pendingActions[currentIndex])
                      }
                    >
                      Complete Action
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Dots */}
            {pendingActions.length > 1 && (
              <div className="flex justify-center space-x-2 mt-4">
                {pendingActions.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? "bg-blue-500" : "bg-gray-300"
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            )}

            {/* Navigation Buttons */}
            {pendingActions.length > 1 && (
              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(currentIndex - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentIndex === pendingActions.length - 1}
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                All Actions Complete
              </h3>
              <p className="text-gray-600">
                You're all caught up! Check back later for new actions.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-4">
        <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-16 flex-col">
            <FileText className="h-5 w-5 mb-1" />
            <span className="text-xs">Upload Evidence</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col">
            <MessageSquare className="h-5 w-5 mb-1" />
            <span className="text-xs">Contact Mediator</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col">
            <Clock className="h-5 w-5 mb-1" />
            <span className="text-xs">View Timeline</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col">
            <AlertCircle className="h-5 w-5 mb-1" />
            <span className="text-xs">Report Issue</span>
          </Button>
        </div>
      </div>

      {/* Gesture Instructions */}
      {enableGestures && pendingActions.length > 1 && (
        <div className="px-4 mb-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2 text-sm text-blue-700">
                <Hand className="h-4 w-4" />
                <span>Swipe left or right to navigate between actions</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Offline Notice */}
      {isOffline && (
        <div className="fixed bottom-4 left-4 right-4 z-20">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2 text-sm text-yellow-700">
                <WifiOff className="h-4 w-4" />
                <span>You're offline. Some features may be limited.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
