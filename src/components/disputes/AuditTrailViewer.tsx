"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDisputeWorkflow } from "@/hooks/use-dispute-workflow";
import {
  AuditTrailViewerProps,
  WorkflowAuditTrail,
} from "@/types/workflow.types";
import {
  History,
  User,
  Clock,
  FileText,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Download,
  Search,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { toast } from "react-hot-toast";

const actionIcons: Record<string, React.ReactNode> = {
  stage_transition: <ArrowRight className="h-4 w-4" />,
  progress_update: <CheckCircle className="h-4 w-4" />,
  notification_sent: <FileText className="h-4 w-4" />,
  deadline_extended: <Clock className="h-4 w-4" />,
  escalation_triggered: <AlertCircle className="h-4 w-4" />,
  evidence_uploaded: <FileText className="h-4 w-4" />,
  mediator_assigned: <User className="h-4 w-4" />,
  dispute_resolved: <CheckCircle className="h-4 w-4" />,
  dispute_created: <FileText className="h-4 w-4" />,
  settings_changed: <Settings className="h-4 w-4" />,
};

const actionColors: Record<string, string> = {
  stage_transition: "text-blue-600 bg-blue-100",
  progress_update: "text-green-600 bg-green-100",
  notification_sent: "text-purple-600 bg-purple-100",
  deadline_extended: "text-yellow-600 bg-yellow-100",
  escalation_triggered: "text-red-600 bg-red-100",
  evidence_uploaded: "text-indigo-600 bg-indigo-100",
  mediator_assigned: "text-cyan-600 bg-cyan-100",
  dispute_resolved: "text-green-600 bg-green-100",
  dispute_created: "text-gray-600 bg-gray-100",
  settings_changed: "text-orange-600 bg-orange-100",
};

export function AuditTrailViewer({
  disputeId,
  showDetailedChanges = true,
  filterByAction = [],
  filterByUser = [],
  exportable = true,
}: AuditTrailViewerProps) {
  const { actions } = useDisputeWorkflow(disputeId);
  const [auditTrail, setAuditTrail] = useState<WorkflowAuditTrail[]>([]);
  const [filteredTrail, setFilteredTrail] = useState<WorkflowAuditTrail[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedActions, setSelectedActions] =
    useState<string[]>(filterByAction);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(filterByUser);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showMetadata, setShowMetadata] = useState(false);

  // Mock audit trail data - in real implementation, this would come from the API
  useEffect(() => {
    const mockAuditTrail: WorkflowAuditTrail[] = [
      {
        id: "1",
        disputeId,
        action: "dispute_created",
        performedBy: "user123",
        performedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        newState: {
          status: "open",
          stage: "dispute_initiation",
          initiator: "user123",
        },
        metadata: {
          reason: "Payment dispute",
          amount: 1500,
          projectId: "proj_456",
        },
      },
      {
        id: "2",
        disputeId,
        action: "evidence_uploaded",
        performedBy: "user123",
        performedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        oldState: { evidenceCount: 0 },
        newState: { evidenceCount: 3 },
        metadata: {
          files: ["contract.pdf", "screenshot1.png", "email_thread.txt"],
          totalSize: "2.4MB",
        },
      },
      {
        id: "3",
        disputeId,
        action: "mediator_assigned",
        performedBy: "admin456",
        performedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        oldState: { mediator: null },
        newState: { mediator: "mediator789" },
        metadata: {
          mediatorName: "John Smith",
          expertise: ["contract_disputes", "payment_issues"],
        },
      },
      {
        id: "4",
        disputeId,
        action: "stage_transition",
        performedBy: "mediator789",
        performedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        oldState: { stage: "evidence_collection" },
        newState: { stage: "mediation_process" },
        metadata: {
          reason: "Evidence review completed",
          transitionTime: "2 days ahead of schedule",
        },
      },
      {
        id: "5",
        disputeId,
        action: "deadline_extended",
        performedBy: "admin456",
        performedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        oldState: { deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
        newState: { deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) },
        metadata: {
          extensionHours: 48,
          reason: "Additional evidence required from both parties",
        },
      },
      {
        id: "6",
        disputeId,
        action: "notification_sent",
        performedBy: "system",
        performedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        metadata: {
          recipient: "user123",
          type: "deadline_reminder",
          deliveryMethod: "email",
        },
      },
    ];

    setAuditTrail(mockAuditTrail);
  }, [disputeId]);

  // Filter audit trail
  useEffect(() => {
    let filtered = auditTrail;

    if (searchTerm) {
      filtered = filtered.filter(
        (entry) =>
          entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.performedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedActions.length > 0) {
      filtered = filtered.filter((entry) =>
        selectedActions.includes(entry.action)
      );
    }

    if (selectedUsers.length > 0) {
      filtered = filtered.filter((entry) =>
        selectedUsers.includes(entry.performedBy)
      );
    }

    setFilteredTrail(filtered);
  }, [auditTrail, searchTerm, selectedActions, selectedUsers]);

  const handleExport = () => {
    if (!filteredTrail.length) {
      toast.error("No audit trail data to export");
      return;
    }

    const dataStr = JSON.stringify(filteredTrail, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `audit-trail-${disputeId}-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast.success("Audit trail exported successfully");
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
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

  const getActionLabel = (action: string): string => {
    return action.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getUserDisplayName = (userId: string): string => {
    const userMap: Record<string, string> = {
      user123: "Client User",
      admin456: "Platform Admin",
      mediator789: "John Smith (Mediator)",
      system: "System",
    };
    return userMap[userId] || userId;
  };

  const renderStateDiff = (
    oldState?: Record<string, any>,
    newState?: Record<string, any>
  ) => {
    if (!showDetailedChanges || (!oldState && !newState)) return null;

    return (
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium mb-2">State Changes</h4>
        <div className="space-y-2">
          {oldState && (
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-red-700">Old State</p>
                <pre className="text-xs text-gray-600 mt-1">
                  {JSON.stringify(oldState, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {newState && (
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-green-700">New State</p>
                <pre className="text-xs text-gray-600 mt-1">
                  {JSON.stringify(newState, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMetadata = (metadata?: Record<string, any>) => {
    if (!showMetadata || !metadata) return null;

    return (
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Metadata</h4>
        <pre className="text-xs text-gray-600">
          {JSON.stringify(metadata, null, 2)}
        </pre>
      </div>
    );
  };

  // Get unique actions and users for filters
  const uniqueActions = [...new Set(auditTrail.map((entry) => entry.action))];
  const uniqueUsers = [
    ...new Set(auditTrail.map((entry) => entry.performedBy)),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <History className="h-6 w-6 text-gray-500" />
          <div>
            <h2 className="text-xl font-semibold">Audit Trail</h2>
            <p className="text-sm text-gray-600">
              Complete history of all workflow activities and decisions
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMetadata(!showMetadata)}
          >
            {showMetadata ? (
              <EyeOff className="h-4 w-4 mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            {showMetadata ? "Hide" : "Show"} Metadata
          </Button>

          {exportable && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search audit trail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Select
                value={selectedActions.length > 0 ? selectedActions[0] : "all"}
                onValueChange={(value) =>
                  setSelectedActions(value === "all" ? [] : [value])
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {getActionLabel(action)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedUsers.length > 0 ? selectedUsers[0] : "all"}
                onValueChange={(value) =>
                  setSelectedUsers(value === "all" ? [] : [value])
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map((user) => (
                    <SelectItem key={user} value={user}>
                      {getUserDisplayName(user)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredTrail.map((entry, index) => {
            const isExpanded = expandedItems.has(entry.id);
            const hasDetails =
              entry.oldState || entry.newState || entry.metadata;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`flex-shrink-0 p-2 rounded-full ${
                          actionColors[entry.action] ||
                          "text-gray-600 bg-gray-100"
                        }`}
                      >
                        {actionIcons[entry.action] || (
                          <FileText className="h-4 w-4" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {getActionLabel(entry.action)}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>
                                  {getUserDisplayName(entry.performedBy)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {getRelativeTime(entry.performedAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {formatDate(entry.performedAt)}
                            </Badge>

                            {hasDetails && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpanded(entry.id)}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Collapsible Details */}
                        <Collapsible
                          open={isExpanded}
                          onOpenChange={() => toggleExpanded(entry.id)}
                        >
                          <CollapsibleContent className="space-y-4">
                            {renderStateDiff(entry.oldState, entry.newState)}
                            {renderMetadata(entry.metadata)}
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredTrail.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No audit trail found
              </h3>
              <p className="text-gray-600">
                {searchTerm ||
                selectedActions.length > 0 ||
                selectedUsers.length > 0
                  ? "Try adjusting your filters"
                  : "No activities have been recorded yet"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredTrail.length} of {auditTrail.length} entries
            </span>
            <span>
              Last updated:{" "}
              {auditTrail.length > 0
                ? getRelativeTime(auditTrail[0].performedAt)
                : "Never"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
