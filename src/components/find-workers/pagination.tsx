'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  isLoading = false
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage <= 3) {
        // Show first 3 pages + ellipsis + last page
        pages.push(2, 3)
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Show first page + ellipsis + last 3 pages
        pages.push('ellipsis')
        pages.push(totalPages - 2, totalPages - 1, totalPages)
      } else {
        // Show first page + ellipsis + current page + ellipsis + last page
        pages.push('ellipsis')
        pages.push(currentPage - 1, currentPage, currentPage + 1)
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-4 py-6'>
      {/* Results info */}
      <div className='text-sm text-gray-600'>
        Showing {startItem} to {endItem} of {totalItems} results
      </div>

      {/* Pagination controls */}
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className='h-8 w-8 p-0'
        >
          <ChevronLeft className='h-4 w-4' />
        </Button>

        {getPageNumbers().map((page, index) => (
          <div key={index}>
            {page === 'ellipsis' ? (
              <div className='flex items-center justify-center h-8 w-8'>
                <MoreHorizontal className='h-4 w-4 text-gray-400' />
              </div>
            ) : (
              <Button
                variant={currentPage === page ? 'default' : 'outline'}
                size='sm'
                onClick={() => onPageChange(page as number)}
                disabled={isLoading}
                className='h-8 w-8 p-0'
              >
                {page}
              </Button>
            )}
          </div>
        ))}

        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className='h-8 w-8 p-0'
        >
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}
