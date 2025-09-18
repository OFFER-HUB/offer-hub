"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useDisputeWorkflow } from "@/hooks/use-dispute-workflow";
import {
  ProgressTrackingProps,
  WorkflowProgress,
} from "@/types/workflow.types";
import {
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  Edit3,
  Save,
  X,
  Target,
  Calendar,
  User,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

export function ProgressTracking({
  disputeId,
  showMilestones = true,
  showNotes = true,
  allowUpdates = true,
  compact = false,
}: ProgressTrackingProps) {
  const { workflowState, actions } = useDisputeWorkflow(disputeId);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProgress, setEditingProgress] =
    useState<WorkflowProgress | null>(null);
  const [newMilestone, setNewMilestone] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newProgress, setNewProgress] = useState(0);

  // Mock progress data - in real implementation, this would come from the API
  const [progressData, setProgressData] = useState<WorkflowProgress[]>([
    {
      id: "1",
      disputeId,
      stageId: "dispute_initiation",
      progressPercentage: 100,
      milestone: "Dispute submitted successfully",
      notes: "All required information provided and evidence uploaded",
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      updatedBy: "user123",
    },
    {
      id: "2",
      disputeId,
      stageId: "mediator_assignment",
      progressPercentage: 75,
      milestone: "Mediator assigned and contacted",
      notes: "Waiting for mediator acceptance and initial review",
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      updatedBy: "admin456",
    },
    {
      id: "3",
      disputeId,
      stageId: "evidence_collection",
      progressPercentage: 45,
      milestone: "Initial evidence submitted",
      notes: "Client evidence received, waiting for freelancer response",
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      updatedBy: "mediator789",
    },
  ]);

  const handleUpdateProgress = async (
    progressId: string,
    updates: Partial<WorkflowProgress>
  ) => {
    try {
      await actions.updateProgress({
        id: progressId,
        ...updates,
        updatedAt: new Date(),
        updatedBy: "current_user", // In real implementation, get from auth context
      });

      setProgressData((prev) =>
        prev.map((p) => (p.id === progressId ? { ...p, ...updates } : p))
      );

      toast.success("Progress updated successfully");
    } catch (error) {
      toast.error("Failed to update progress");
    }
  };

  const handleAddMilestone = async () => {
    if (!newMilestone.trim()) return;

    const newProgressEntry: WorkflowProgress = {
      id: Date.now().toString(),
      disputeId,
      stageId: workflowState?.currentStage || "dispute_initiation",
      progressPercentage: newProgress,
      milestone: newMilestone,
      notes: newNote,
      updatedAt: new Date(),
      updatedBy: "current_user",
    };

    try {
      await actions.updateProgress(newProgressEntry);
      setProgressData((prev) => [...prev, newProgressEntry]);
      setNewMilestone("");
      setNewNote("");
      setNewProgress(0);
      toast.success("Milestone added successfully");
    } catch (error) {
      toast.error("Failed to add milestone");
    }
  };

  const handleEditProgress = (progress: WorkflowProgress) => {
    setEditingProgress(progress);
    setIsEditing(true);
    setNewMilestone(progress.milestone || "");
    setNewNote(progress.notes || "");
    setNewProgress(progress.progressPercentage);
  };

  const handleSaveEdit = async () => {
    if (!editingProgress) return;

    await handleUpdateProgress(editingProgress.id, {
      milestone: newMilestone,
      notes: newNote,
      progressPercentage: newProgress,
    });

    setIsEditing(false);
    setEditingProgress(null);
  };

  const calculateOverallProgress = (): number => {
    if (progressData.length === 0) return 0;
    const totalProgress = progressData.reduce(
      (sum, p) => sum + p.progressPercentage,
      0
    );
    return Math.round(totalProgress / progressData.length);
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    if (percentage >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  };

  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Progress</span>
            </div>
            <Badge variant="secondary">
              {calculateOverallProgress()}% Complete
            </Badge>
          </div>
          <Progress value={calculateOverallProgress()} className="h-2" />
          <div className="mt-2 text-xs text-gray-500">
            {progressData.length} milestones • Last updated{" "}
            {getRelativeTime(progressData[0]?.updatedAt || new Date())}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Overall Progress</span>
            </div>
            <Badge variant="secondary" className="text-lg">
              {calculateOverallProgress()}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={calculateOverallProgress()} className="h-3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>
                  Completed:{" "}
                  {
                    progressData.filter((p) => p.progressPercentage === 100)
                      .length
                  }
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>
                  In Progress:{" "}
                  {
                    progressData.filter(
                      (p) =>
                        p.progressPercentage > 0 && p.progressPercentage < 100
                    ).length
                  }
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-gray-500" />
                <span>Total Milestones: {progressData.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Details */}
      <Tabs defaultValue="milestones" className="space-y-4">
        <TabsList>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="milestones" className="space-y-4">
          {/* Add New Milestone */}
          {allowUpdates && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Add Milestone</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Milestone</label>
                    <Input
                      placeholder="Enter milestone description"
                      value={newMilestone}
                      onChange={(e) => setNewMilestone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Progress %</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={newProgress}
                      onChange={(e) =>
                        setNewProgress(parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>

                {showNotes && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Notes (Optional)
                    </label>
                    <Textarea
                      placeholder="Add any additional notes"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}

                <Button
                  onClick={handleAddMilestone}
                  disabled={!newMilestone.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Milestone
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Milestones List */}
          <div className="space-y-4">
            {progressData.map((progress, index) => (
              <motion.div
                key={progress.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-full ${getProgressColor(
                              progress.progressPercentage
                            )} text-white`}
                          >
                            <Target className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {progress.milestone}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>
                                {progress.progressPercentage}% Complete
                              </span>
                              <span>•</span>
                              <span>{getRelativeTime(progress.updatedAt)}</span>
                            </div>
                          </div>
                        </div>

                        <Progress
                          value={progress.progressPercentage}
                          className="h-2"
                        />

                        {showNotes && progress.notes && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                              <p className="text-sm text-gray-700">
                                {progress.notes}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Updated: {formatDate(progress.updatedAt)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="h-3 w-3" />
                            <span>By: {progress.updatedBy}</span>
                          </div>
                        </div>
                      </div>

                      {allowUpdates && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProgress(progress)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Progress Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressData
                  .sort(
                    (a, b) =>
                      new Date(b.updatedAt).getTime() -
                      new Date(a.updatedAt).getTime()
                  )
                  .map((progress, index) => (
                    <div
                      key={progress.id}
                      className="flex items-start space-x-4"
                    >
                      <div
                        className={`w-3 h-3 rounded-full mt-2 ${getProgressColor(
                          progress.progressPercentage
                        )}`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{progress.milestone}</h4>
                          <span className="text-sm text-gray-500">
                            {formatDate(progress.updatedAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {progress.progressPercentage}% complete
                        </p>
                        {progress.notes && (
                          <p className="text-sm text-gray-500 mt-1">
                            {progress.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>All Notes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressData
                  .filter((p) => p.notes)
                  .map((progress) => (
                    <div
                      key={progress.id}
                      className="border-l-4 border-blue-500 pl-4 py-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{progress.milestone}</h4>
                        <span className="text-sm text-gray-500">
                          {getRelativeTime(progress.updatedAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {progress.notes}
                      </p>
                    </div>
                  ))}

                {progressData.filter((p) => p.notes).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notes available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Progress Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Progress</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Milestone</label>
              <Input
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Progress %</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={newProgress}
                onChange={(e) => setNewProgress(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
