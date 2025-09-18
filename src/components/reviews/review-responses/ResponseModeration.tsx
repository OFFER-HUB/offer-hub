"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  Flag,
  Clock,
  MessageSquare,
  AlertCircle,
  User,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Star,
  Search,
} from "lucide-react";
import {
  ResponseModerationProps,
  ResponseStatus,
  ReviewResponseWithDetails,
  RESPONSE_STATUS_COLORS,
  RESPONSE_STATUS_LABELS,
} from "@/types/review-responses.types";
import { useResponseModeration } from "@/hooks/useResponseModeration";
import { formatDistanceToNow } from "date-fns";

export default function ResponseModeration({
  responses,
  onModerate,
  isLoading = false,
}: ResponseModerationProps) {
  const [selectedResponse, setSelectedResponse] =
    useState<ReviewResponseWithDetails | null>(null);
  const [moderationNotes, setModerationNotes] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<ResponseStatus>("approved");
  const [isModerating, setIsModerating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ResponseStatus | "all">(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");

  const {
    pendingResponses,
    isLoading: isLoadingPending,
    error,
    moderateResponse,
    refetch,
  } = useResponseModeration();

  // Use provided responses or fetch from hook
  const responsesToShow = responses.length > 0 ? responses : pendingResponses;
  const isLoadingData = isLoading || isLoadingPending;

  // Filter responses
  const filteredResponses = responsesToShow.filter((response) => {
    const matchesStatus =
      filterStatus === "all" || response.status === filterStatus;
    const matchesSearch =
      searchTerm === "" ||
      response.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.responder.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleModerate = async () => {
    if (!selectedResponse) return;

    setIsModerating(true);
    try {
      await moderateResponse(
        selectedResponse.id,
        selectedStatus,
        moderationNotes
      );
      setSelectedResponse(null);
      setModerationNotes("");
      onModerate?.(selectedResponse.id, selectedStatus, moderationNotes);
    } catch (error) {
      console.error("Failed to moderate response:", error);
    } finally {
      setIsModerating(false);
    }
  };

  const getStatusBadge = (status: ResponseStatus) => {
    const color = RESPONSE_STATUS_COLORS[status];
    const label = RESPONSE_STATUS_LABELS[status];

    return (
      <Badge
        variant="outline"
        className={`text-xs ${
          color === "green"
            ? "border-green-500 text-green-700 bg-green-50"
            : color === "yellow"
            ? "border-yellow-500 text-yellow-700 bg-yellow-50"
            : color === "red"
            ? "border-red-500 text-red-700 bg-red-50"
            : "border-orange-500 text-orange-700 bg-orange-50"
        }`}
      >
        {status === "pending" && <Clock className="w-3 h-3 mr-1" />}
        {status === "approved" && <CheckCircle className="w-3 h-3 mr-1" />}
        {status === "rejected" && <XCircle className="w-3 h-3 mr-1" />}
        {status === "flagged" && <Flag className="w-3 h-3 mr-1" />}
        {label}
      </Badge>
    );
  };

  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      flagged: 0,
      total: responsesToShow.length,
    };

    responsesToShow.forEach((response) => {
      counts[response.status]++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  if (isLoadingData) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
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
              Failed to load responses: {error}
            </AlertDescription>
          </Alert>
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
              <MessageSquare className="w-5 h-5" />
              Response Moderation
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={isLoadingData}
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {statusCounts.total}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {statusCounts.pending}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {statusCounts.approved}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {statusCounts.rejected}
              </div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {statusCounts.flagged}
              </div>
              <div className="text-sm text-gray-600">Flagged</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search responses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
              >
                All
              </Button>
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("pending")}
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === "approved" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("approved")}
              >
                Approved
              </Button>
              <Button
                variant={filterStatus === "rejected" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("rejected")}
              >
                Rejected
              </Button>
              <Button
                variant={filterStatus === "flagged" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("flagged")}
              >
                Flagged
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responses List */}
      <div className="space-y-4">
        {filteredResponses.length > 0 ? (
          filteredResponses.map((response) => (
            <Card
              key={response.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {response.responder.name}
                          </span>
                        </div>
                        {getStatusBadge(response.status)}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDistanceToNow(new Date(response.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Response Content */}
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 leading-relaxed">
                        {response.content}
                      </p>
                    </div>

                    {/* Analytics */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{response.analytics.helpful_votes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsDown className="w-4 h-4" />
                        <span>{response.analytics.unhelpful_votes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{response.analytics.views_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        <span>
                          {response.analytics.engagement_score.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Moderation Actions */}
                    {response.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedResponse(response);
                            setSelectedStatus("approved");
                            setModerationNotes("");
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedResponse(response);
                            setSelectedStatus("rejected");
                            setModerationNotes("");
                          }}
                          className="border-red-500 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedResponse(response);
                            setSelectedStatus("flagged");
                            setModerationNotes("");
                          }}
                          className="border-orange-500 text-orange-600 hover:bg-orange-50"
                        >
                          <Flag className="w-4 h-4 mr-1" />
                          Flag
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No responses found</p>
                <p className="text-sm">
                  {filterStatus === "all"
                    ? "No responses available for moderation"
                    : `No ${filterStatus} responses found`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Moderation Modal */}
      {selectedResponse && (
        <Card className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Moderate Response
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedResponse(null)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Response Preview */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Response Content:
                </h4>
                <p className="text-sm text-gray-700">
                  {selectedResponse.content}
                </p>
              </div>

              {/* Status Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Moderation Decision:
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={
                      selectedStatus === "approved" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedStatus("approved")}
                    className={
                      selectedStatus === "approved"
                        ? "bg-green-600 hover:bg-green-700"
                        : ""
                    }
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant={
                      selectedStatus === "rejected" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedStatus("rejected")}
                    className={
                      selectedStatus === "rejected"
                        ? "bg-red-600 hover:bg-red-700"
                        : ""
                    }
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    variant={
                      selectedStatus === "flagged" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedStatus("flagged")}
                    className={
                      selectedStatus === "flagged"
                        ? "bg-orange-600 hover:bg-orange-700"
                        : ""
                    }
                  >
                    <Flag className="w-4 h-4 mr-1" />
                    Flag
                  </Button>
                </div>
              </div>

              {/* Moderation Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Moderation Notes (Optional):
                </label>
                <Textarea
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  placeholder="Add notes about your moderation decision..."
                  className="min-h-[100px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedResponse(null)}
                  disabled={isModerating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleModerate}
                  disabled={isModerating}
                  className={`${
                    selectedStatus === "approved"
                      ? "bg-green-600 hover:bg-green-700"
                      : selectedStatus === "rejected"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-orange-600 hover:bg-orange-700"
                  }`}
                >
                  {isModerating
                    ? "Moderating..."
                    : `Moderate as ${selectedStatus}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </Card>
      )}
    </div>
  );
}
