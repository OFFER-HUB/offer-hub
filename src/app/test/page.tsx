"use client"

import React, { useState } from "react";
import Pagination from "../../components/ui/pagination";  

export default function PaginationTest() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 68;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8]">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}