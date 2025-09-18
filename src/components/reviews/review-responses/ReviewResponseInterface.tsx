"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Trash2,
} from "lucide-react";
import {
  ReviewResponseInterfaceProps,
  ReviewResponseWithDetails,
  ResponseStatus,
  RESPONSE_STATUS_COLORS,
  RESPONSE_STATUS_LABELS,
} from "@/types/review-responses.types";
import {
  useReviewResponses,
  useResponseGuidelines,
} from "@/hooks/useReviewResponses";
import ResponseCreation from "./ResponseCreation";
import ResponseGuidelines from "./ResponseGuidelines";
import { formatDistanceToNow } from "date-fns";

export default function ReviewResponseInterface({
  reviewId,
  currentUserId,
  userRole,
  onResponseCreated,
  onResponseUpdated,
  onResponseDeleted,
}: ReviewResponseInterfaceProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [editingResponse, setEditingResponse] =
    useState<ReviewResponseWithDetails | null>(null);

  const {
    responses,
    isLoading,
    error,
    createResponse,
    updateResponse,
    deleteResponse,
    voteOnResponse,
  } = useReviewResponses(reviewId);

  const { guidelines } = useResponseGuidelines();

  // Check if current user can respond to this review
  const canRespond =
    responses.length === 0 ||
    !responses.some((r) => r.responder_id === currentUserId);

  const handleCreateResponse = async (content: string) => {
    try {
      await createResponse({ review_id: reviewId, content });
      setShowCreateForm(false);
      onResponseCreated?.(responses[0]); // This will be updated by the hook
    } catch (error) {
      console.error("Failed to create response:", error);
    }
  };

  const handleUpdateResponse = async (content: string) => {
    if (!editingResponse) return;

    try {
      await updateResponse(editingResponse.id, { content });
      setEditingResponse(null);
      onResponseUpdated?.(editingResponse);
    } catch (error) {
      console.error("Failed to update response:", error);
    }
  };

  const handleDeleteResponse = async (responseId: string) => {
    try {
      await deleteResponse(responseId);
      onResponseDeleted?.(responseId);
    } catch (error) {
      console.error("Failed to delete response:", error);
    }
  };

  const handleVote = async (
    responseId: string,
    voteType: "helpful" | "unhelpful"
  ) => {
    try {
      await voteOnResponse({ response_id: responseId, vote_type: voteType });
    } catch (error) {
      console.error("Failed to vote on response:", error);
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
            ? "border-green-500 text-green-700"
            : color === "yellow"
            ? "border-yellow-500 text-yellow-700"
            : color === "red"
            ? "border-red-500 text-red-700"
            : "border-orange-500 text-orange-700"
        }`}
      >
        {label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
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
          <div className="text-center text-red-600">
            <p>Failed to load responses: {error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Review Responses
            </CardTitle>
            <Badge variant="outline" className="text-sm">
              {responses.length} response{responses.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Create Response Button */}
      {canRespond && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">
                  Respond to this review
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Share your perspective and address any feedback
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGuidelines(true)}
                >
                  Guidelines
                </Button>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Write Response
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Response Creation Form */}
      {showCreateForm && (
        <ResponseCreation
          reviewId={reviewId}
          onSubmit={handleCreateResponse}
          onCancel={() => setShowCreateForm(false)}
          guidelines={guidelines}
        />
      )}

      {/* Responses List */}
      {responses.length > 0 ? (
        <div className="space-y-4">
          {responses.map((response) => (
            <Card key={response.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={response.responder.avatar}
                      alt={response.responder.name}
                    />
                    <AvatarFallback className="text-sm font-semibold">
                      {response.responder.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-gray-900">
                          {response.responder.name}
                        </h4>
                        {getStatusBadge(response.status)}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>
                          {formatDistanceToNow(new Date(response.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                        {response.responder_id === currentUserId &&
                          response.status === "pending" && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingResponse(response)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteResponse(response.id)
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                      </div>
                    </div>

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
                        <span>👁️</span>
                        <span>{response.analytics.views_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>⭐</span>
                        <span>
                          {response.analytics.engagement_score.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Voting Buttons */}
                    {response.status === "approved" && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVote(response.id, "helpful")}
                          className="flex items-center gap-1"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Helpful
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVote(response.id, "unhelpful")}
                          className="flex items-center gap-1"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          Not Helpful
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No responses yet</p>
              <p className="text-sm">
                {canRespond
                  ? "Be the first to respond to this review"
                  : "This review hasn't received any responses yet"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Response Guidelines Modal */}
      {showGuidelines && guidelines && (
        <ResponseGuidelines
          guidelines={guidelines}
          onClose={() => setShowGuidelines(false)}
        />
      )}

      {/* Edit Response Modal */}
      {editingResponse && (
        <ResponseCreation
          reviewId={reviewId}
          onSubmit={handleUpdateResponse}
          onCancel={() => setEditingResponse(null)}
          guidelines={guidelines}
        />
      )}
    </div>
  );
}
