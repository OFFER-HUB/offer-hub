
import React from "react";
import withErrorBoundary from "@/components/shared/WithErrorBoundary";

import {
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,

} from "lucide-react";
import StarRating from "@/components/ui/star-rating";
import { useReviewsApi } from "@/hooks/api-connections/use-reviews-api";
interface UserProfileProps {
  userId?: string;
  onBack: () => void;
  onMessage: () => void;
  onRestrictAccount: () => void;
}

const UserProfile = ({
  userId = "default-user-id", // TODO: Replace with actual user ID from props or context
  //   onBack,
  onMessage,
  onRestrictAccount,
}: UserProfileProps) => {
  // Fetch real reviews data
  const { useUserReviews, computeAverage } = useReviewsApi();
  const {
    data: reviews = [],
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useUserReviews(userId);

  const averageRating = computeAverage(reviews);
  return (
    <div className="min-h-screen bg-white p-4 md:p-8 max-w-4xl mx-auto">
      <div className="">
        {/* Header Section */}
        <div className="border border-[#DEEFE7] bg-[#F8F8F8] shadow-sm">
          <div className="p-6 md:p-8 border-b border-gray-100">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Profile Image */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                JD
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  John D
                </h1>
                <p className="text-lg text-gray-700 mb-2">
                  UI/UX designer | Brand designer | Figma pro
                </p>
                <p className="text-sm text-gray-500 mb-4">Canada</p>
              </div>
            </div>
            {/* Skills Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                UI/UX
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                Design
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                Figma
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Product design
              </span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                Framer
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
              I am a UI/UX designer with 4 years of experience in creating
              user-friendly interfaces and enhancing user experiences. My
              passion lies in understanding user needs and translating them into
              intuitive designs that drive engagement and satisfaction.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button className="flex items-center justify-center p-3 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <Heart size={20} />
              </button>
              <button
                onClick={onMessage}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                <MessageCircle size={18} />
                Message
              </button>
              <button
                onClick={onRestrictAccount}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                Restrict Account
              </button>
            </div>
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="border border-[#DEEFE7] mt-4 bg-[#F8F8F8] shadow-sm">
          <div className="p-6 md:p-8 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* Portfolio Item 1 */}
              <div className="group cursor-pointer">
                <div className="bg-gray-100 rounded-lg p-4 mb-3 aspect-square flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <div className="w-12 h-16 bg-blue-500 rounded-sm"></div>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Mobile app design
                </h3>
                <p className="text-sm text-gray-500">August 2024</p>
              </div>

              {/* Portfolio Item 2 */}
              <div className="group cursor-pointer">
                <div className="bg-gray-100 rounded-lg p-4 mb-3 aspect-square flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <div className="w-16 h-20 bg-green-500 rounded-sm"></div>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Mobile app design
                </h3>
                <p className="text-sm text-gray-500">August 2024</p>
              </div>

              {/* Portfolio Item 3 */}
              <div className="group cursor-pointer">
                <div className="bg-gray-100 rounded-lg p-4 mb-3 aspect-square flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <div className="w-20 h-12 bg-purple-500 rounded-sm"></div>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Website design
                </h3>
                <p className="text-sm text-gray-500">August 2024</p>
              </div>

              {/* Portfolio Item 4 */}
              <div className="group cursor-pointer">
                <div className="bg-gray-100 rounded-lg p-4 mb-3 aspect-square flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <div className="w-16 h-16 bg-blue-400 rounded-sm"></div>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Landing page design
                </h3>
                <p className="text-sm text-gray-500">August 2024</p>
              </div>

              {/* Portfolio Item 5 */}
              <div className="group cursor-pointer">
                <div className="bg-gray-100 rounded-lg p-4 mb-3 aspect-square flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <div className="w-20 h-14 bg-orange-500 rounded-sm"></div>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Dashboard design
                </h3>
                <p className="text-sm text-gray-500">August 2024</p>
              </div>

              {/* Portfolio Item 6 */}
              <div className="group cursor-pointer">
                <div className="bg-gray-100 rounded-lg p-4 mb-3 aspect-square flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <div className="w-16 h-16 bg-red-500 rounded-sm"></div>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Dashboard design
                </h3>
                <p className="text-sm text-gray-500">August 2024</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ChevronLeft size={16} />
                Back
              </button>
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="p-6 md:p-8 border border-[#DEEFE7] mt-4 bg-[#F8F8F8] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
            {reviews.length > 0 && (
              <div className="flex items-center space-x-2">
                <StarRating rating={averageRating} size="sm" />
                <span className="text-sm font-medium text-gray-700">
                  {averageRating}
                </span>
                <span className="text-sm text-gray-500">
                  ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                </span>
              </div>
            )}
          </div>

          <div className="space-y-6 mb-6">
            {reviewsLoading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="border-b border-gray-100 pb-6 last:border-b-0 animate-pulse"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-24"></div>
                      </div>
                      <div className="h-4 bg-gray-300 rounded w-20"></div>
                    </div>
                    <div className="h-12 bg-gray-300 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : reviewsError ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-2">Failed to load reviews</p>
                <p className="text-gray-500 text-sm">{reviewsError}</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No reviews yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Reviews from completed contracts will appear here
                </p>
              </div>
            ) : (
              reviews.map((review) => {
                const reviewDate = new Date(review.created_at);
                const formattedDate = reviewDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });

                return (
                  <div
                    key={review.id}
                    className="border-b border-gray-100 pb-6 last:border-b-0"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Client Review
                        </h3>
                        <p className="text-sm text-gray-500">{formattedDate}</p>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 text-sm leading-relaxed">
                        &quot;{review.comment}&quot;
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Contract: {review.contract_id.slice(-8)}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Reviews Navigation */}
          <div className="flex items-center justify-between">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ChevronLeft size={16} />
              Back
            </button>
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(UserProfile);
