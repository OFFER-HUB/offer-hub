"use client";

import React from "react";
import clsx from "clsx";
import Image from 'next/image';
import ArrowLeftIcon from "@/components/icons/Arrow left.svg";
import ArrowRightIcon from "@/components/icons/Arrow right.svg";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = [];
  const range = 2; // Number of pages to show around the current page

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || // First page
      i === totalPages || // Last page
      (i >= currentPage - range && i <= currentPage + range) // Pages around current
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav
      aria-label="Page navigation"
      className="flex items-center gap-2 justify-center"
    >
      {/* Previous Button */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        className={clsx(
          "flex items-center px-3 py-2 rounded text-[#002333]",
          currentPage === 1 && "text-gray-400 cursor-not-allowed"
        )}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <Image src={ArrowLeftIcon} alt="Previous" width={20} height={20} />
        Previous
      </button>

      {/* Page Numbers */}
      {pages.map((page, index) => (
        <React.Fragment key={index}>
          {typeof page === "number" ? (
            <button
              onClick={() => onPageChange(page)}
              className={clsx(
                "px-3 py-2 rounded",
                page === currentPage
                  ? "bg-[#002333] text-white"
                  : "text-[#002333]"
              )}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          ) : (
            <span className="px-2 text-[#002333]">&hellip;</span>
          )}
        </React.Fragment>
      ))}

      {/* Next Button */}
      <button
        onClick={() =>
          currentPage < totalPages && onPageChange(currentPage + 1)
        }
        className={clsx(
          "flex items-center px-3 py-2 rounded text-[#002333]",
          currentPage === totalPages && "text-gray-400 cursor-not-allowed"
        )}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        Next
        <Image src={ArrowRightIcon} alt="Next" width={20} height={20} />
      </button>
    </nav>
  );
}
