"use client"
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Review {
  id: string | number;
  clientName: string;
  rating: number;
  date: string;
  comment: string;
  projectTitle?: string;
}

interface ReviewsCarouselProps {
  title?: string;
  reviews: Review[];
  renderStars: (rating: number) => React.ReactNode; // pass your star renderer here
  itemsPerPage?: number; // allow customizing
}

export default function ReviewsCarousel({
  title = "Reviews",
  reviews,
  renderStars,
  itemsPerPage = 3,
}: ReviewsCarouselProps) {
  const [index, setIndex] = useState(0);

  const totalPages = Math.ceil(reviews.length / itemsPerPage);

  const prev = () => setIndex((prev) => Math.max(prev - itemsPerPage, 0));
  const next = () =>
    setIndex((prev) =>
      Math.min(prev + itemsPerPage, (totalPages - 1) * itemsPerPage)
    );

  return (
    <div className="bg-gray-50  p-6 border">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <div className="px-[5rem]">
          <div className="border-b border-gray-200" />
        </div>
      </div>

      {/* Review Content */}
      {reviews.length > 0 && (
        <div className="">
          {reviews.slice(index, index + itemsPerPage).map((review) => (
            <div
              key={review.id}
              className="hover:shadow-md transition mb-4 p-2 rounded-md"
            >
              <div className="flex items-center justify-between mb-0">
                <h4 className="font-semibold text-gray-900 leading-tight">
                  {review.clientName}
                </h4>
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-2">{review.date.slice(0,1).toUpperCase()+review.date.slice(1)}</p>
              <p className="text-gray-700 leading-relaxed text-sm">"{review.comment}"</p>
              {/* {review.projectTitle && (
                <p className="text-sm text-teal-600 mt-2">
                  Project: {review.projectTitle}
                </p>
              )} */}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 px-20">
        <Button
          onClick={prev}
          variant="outline"
          size="sm"
          className="bg-transparent shadow-none border-none text-gray-500 cursor-pointer"
          disabled={index === 0}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i * itemsPerPage)}
              className={`w-2 h-2 rounded-full ${
                Math.floor(index / itemsPerPage) === i
                  ? "bg-gray-800"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        <Button
          onClick={next}
          variant="outline"
          size="sm"
          className="bg-transparent shadow-none border-none text-gray-500 cursor-pointer"
          disabled={index >= (totalPages - 1) * itemsPerPage}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
