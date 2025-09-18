"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface PortfolioItem {
  id: string | number;
  title: string;
  description: string;
  date: string;
  image?: string;
}

interface PortfolioCarouselProps {
  title?: string;
  items: PortfolioItem[];
  itemsPerPage?: number;
  talentId: string;
}

export default function PortfolioCarousel({
  title = "Portfolio",
  items,
  itemsPerPage = 6,
  talentId,
}: PortfolioCarouselProps) {
  const [index, setIndex] = useState(0);
  const router = useRouter();

  const prev = () => {
    setIndex((prev) => Math.max(prev - itemsPerPage, 0));
  };

  const next = () => {
    setIndex((prev) =>
      Math.min(prev + itemsPerPage, items.length - itemsPerPage)
    );
  };

  const handleProjectClick = (projectId: string | number) => {
    router.push(`/talent/${talentId}/portfolio/${projectId}`);
  };

  return (
    <div className="bg-gray-50  p-6 border">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <div className="border-b border-gray-200" />
      </div>

      {/* Items */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.slice(index, index + itemsPerPage).map((item) => (
            <div
              key={`portfolio-${item.id}`}
              className="rounded-lg overflow-hidden hover:cursor-pointer"
              onClick={() => handleProjectClick(item.id)}
            >
              <div className="overflow-hidden">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover object-center transform transition-transform duration-300 ease-in-out hover:scale-110"
                />
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mt-1">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <Button
          onClick={prev}
          variant="outline"
          size="sm"
          className="bg-transparent shadow-none border-none text-gray-500 cursor-pointer"
          disabled={items.length <= itemsPerPage}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="flex gap-2">
          {Array.from(
            { length: Math.ceil(items.length / itemsPerPage) },
            (_, i) => (
              <button
                key={`page-${i}`}
                onClick={() => setIndex(i * itemsPerPage)}
                className={`w-2 h-2 rounded-full ${
                  Math.floor(index / itemsPerPage) === i
                    ? "bg-gray-800"
                    : "bg-gray-300"
                }`}
              />
            )
          )}
        </div>

        <Button
          onClick={next}
          variant="outline"
          size="sm"
          className="bg-transparent shadow-none border-none text-gray-500 cursor-pointer"
          disabled={items.length <= itemsPerPage}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
