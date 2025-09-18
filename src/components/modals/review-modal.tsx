"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import StarRating from "@/components/ui/star-rating";
import { useReviewsApi } from "@/hooks/api-connections/use-reviews-api";
import { Review } from "@/types/review.types";
import { useNotification } from "@/lib/contexts/NotificatonContext";
import { VALIDATION_LIMITS } from "@/constants/magic-numbers";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  fromId: string;
  toId: string;
  onCreated?: (review: Review) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  contractId,
  fromId,
  toId,
  onCreated,
}) => {
  const { useCreateReview } = useReviewsApi();
  const { mutate: createReview, isLoading, error } = useCreateReview();
  const {
    actions: { addNotification },
  } = useNotification();

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setComment("");
      setValidationError("");
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    if (rating === 0) {
      setValidationError("Please select a rating");
      return false;
    }
    if (rating < 1 || rating > 5) {
      setValidationError("Rating must be between 1 and 5");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const newReview = await createReview({
        from_id: fromId,
        to_id: toId,
        contract_id: contractId,
        rating,
        comment: comment.trim() || undefined,
      });

      // Success feedback
      addNotification({
        type: "success",
        title: "Review Submitted",
        message: "Your review has been submitted successfully!",
      });

      // Call onCreated callback with the new review
      onCreated?.(newReview);

      // Reset form and close modal
      setRating(0);
      setComment("");
      setValidationError("");
      onClose();
    } catch (err) {
      // Error is already handled in the hook and shown in the error state
      console.error("Failed to submit review:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Leave a Review</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2">
              <StarRating
                rating={0}
                interactive={true}
                value={rating}
                onChange={setRating}
                size="lg"
              />
              {rating > 0 && (
                <span className="text-sm text-gray-600">
                  {rating} star{rating !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* Comment Section */}
          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Comment (Optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isLoading}
              placeholder="Share your experience working on this contract..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              maxLength={VALIDATION_LIMITS.MAX_REVIEW_COMMENT_LENGTH}
            />
            <div className="flex justify-between mt-1">
              <div className="text-xs text-gray-500">
                {comment.length}/{VALIDATION_LIMITS.MAX_REVIEW_COMMENT_LENGTH}{" "}
                characters
              </div>
            </div>
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="text-red-600 text-sm">{validationError}</div>
          )}

          {/* API Error */}
          {error && <div className="text-red-600 text-sm">{error}</div>}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || rating === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
            >
              {isLoading && (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {isLoading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
