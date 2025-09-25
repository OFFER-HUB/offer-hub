'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import StarRating from '@/components/ui/star-rating';
import { useReviewsApi } from '@/hooks/api-connections/use-reviews-api';

const portfolioItems = [
  {
    id: 1,
    title: 'Mobile app design',
    image: '/portfolio/mobile1.png',
    date: 'August 2024',
  },
  {
    id: 2,
    title: 'Mobile app design',
    image: '/portfolio/mobile2.png',
    date: 'August 2024',
  },
  {
    id: 3,
    title: 'Website design',
    image: '/portfolio/website.png',
    date: 'August 2024',
  },
  {
    id: 4,
    title: 'Landing page design',
    image: '/portfolio/landing.png',
    date: 'August 2024',
  },
  {
    id: 5,
    title: 'Dashboard design',
    image: '/portfolio/dashboard1.png',
    date: 'August 2024',
  },
  {
    id: 6,
    title: 'Dashboard design',
    image: '/portfolio/dashboard2.png',
    date: 'August 2024',
  },
];

// Freelancer ID - TODO: Replace with actual freelancer ID from props or context
const FREELANCER_ID = 'default-freelancer-id';

export default function FreelancerProfile() {
  // Fetch real reviews data
  const { useUserReviews, computeAverage } = useReviewsApi();
  const { data: reviews = [], isLoading: reviewsLoading, error: reviewsError } = useUserReviews(FREELANCER_ID);
  
  const averageRating = computeAverage(reviews);

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(portfolioItems.length / itemsPerPage);

  const visibleItems = portfolioItems.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage
  );

  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  const handleBack = () => setCurrentPage((prev) => Math.max(prev - 1, 0));

  const [currentReviewPage, setCurrentReviewPage] = useState(0);
  const reviewsPerPage = 3;
  const totalReviewPages = Math.ceil(reviews.length / reviewsPerPage);

  const visibleReviews = reviews.slice(
    currentReviewPage * reviewsPerPage,
    currentReviewPage * reviewsPerPage + reviewsPerPage
  );

  const handleReviewsNext = () =>
    setCurrentReviewPage((prev) => Math.min(prev + 1, totalReviewPages - 1));
  const handleReviewsBack = () =>
    setCurrentReviewPage((prev) => Math.max(prev - 1, 0));

  return (
    <div className='space-y-10 px-4 pb-10 max-w-6xl mx-auto'>
      {/* --- FREELANCER PROFILE SECTION --- */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <div className='flex items-center gap-4 mb-6'>
          <Avatar className='w-20 h-20'>
            <Image
              src='/placeholder.svg?height=80&width=80'
              alt='John D'
              width={80}
              height={80}
              className='rounded-full object-cover'
            />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <p className='text-gray-600 text-lg font-semibold'>John D</p>
            <h2 className='text-gray-900 text-2xl font-bold leading-tight'>
              UI/UX designer | Brand designer |
              <br /> Figma pro
            </h2>
            <p className='text-teal-600 text-base mt-1'>Canada</p>
          </div>
        </div>

        <p className='text-gray-700 text-base leading-relaxed mb-8'>
          I am a UI/UX designer with 4 years of experience in creating
          user-friendly interfaces and enhancing user experiences. My passion
          lies in understanding user needs and translating them into intuitive
          designs that drive engagement and satisfaction.
        </p>

        <div className='flex items-center gap-4'>
          <button
            className='w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition'
            aria-label='Like'
          >
            <Heart className='w-5 h-5' />
          </button>
          <Button
            variant='ghost'
            className='flex-1 rounded-full border border-gray-300 text-gray-800 bg-white hover:bg-gray-50 px-8 py-3 text-lg font-medium'
          >
            Message
          </Button>
          <Button
            variant='default'
            className='flex-1 bg-[#002333] rounded-full text-white hover:bg-[#002333]/90 px-8 py-3 text-lg font-medium'
          >
            Hire
          </Button>
        </div>
      </div>

      {/* --- PORTFOLIO SECTION --- */}
      <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
        <h2 className='text-2xl font-semibold text-gray-900 mb-6'>Portfolio</h2>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6'>
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className='bg-white border rounded-lg overflow-hidden shadow-sm'
            >
              <Image
                src={item.image}
                alt={item.title}
                width={400}
                height={260}
                className='w-full h-44 object-cover'
              />
              <div className='p-4'>
                <h3 className='font-medium text-lg text-gray-900'>
                  {item.title}
                </h3>
                <p className='text-sm text-gray-500 mt-1'>{item.date}</p>
              </div>
            </div>
          ))}
        </div>

        <div className='flex items-center justify-center gap-6'>
          <button
            onClick={handleBack}
            disabled={currentPage === 0}
            className='text-sm text-gray-500 hover:text-teal-600 disabled:opacity-40 flex items-center gap-1'
          >
            <ChevronLeft className='w-4 h-4' />
            Back
          </button>
          <div className='flex gap-2'>
            {Array.from({ length: totalPages }).map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === currentPage ? 'bg-teal-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages - 1}
            className='text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1'
          >
            Next
            <ChevronRight className='w-4 h-4' />
          </button>
        </div>
      </div>

      {/* --- REVIEWS SECTION --- */}
      <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-semibold text-gray-900'>Reviews</h2>
          {reviews.length > 0 && (
            <div className='flex items-center space-x-2'>
              <StarRating rating={averageRating} size='sm' />
              <span className='text-sm font-medium text-gray-700'>{averageRating}</span>
              <span className='text-sm text-gray-500'>({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>
          )}
        </div>

        <div className='space-y-6 mb-6'>
          {reviewsLoading ? (
            <div className='space-y-6'>
              {[...Array(3)].map((_, i) => (
                <div key={i} className='border-b border-gray-200 pb-4 animate-pulse'>
                  <div className='flex justify-between items-start mb-1'>
                    <div>
                      <div className='h-5 bg-gray-300 rounded w-32 mb-2'></div>
                      <div className='h-4 bg-gray-300 rounded w-24'></div>
                    </div>
                    <div className='h-4 bg-gray-300 rounded w-20'></div>
                  </div>
                  <div className='h-12 bg-gray-300 rounded w-full'></div>
                </div>
              ))}
            </div>
          ) : reviewsError ? (
            <div className='text-center py-8'>
              <p className='text-red-600 mb-2'>Failed to load reviews</p>
              <p className='text-gray-500 text-sm'>{reviewsError}</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className='text-center py-8'>
              <p className='text-gray-500 text-lg'>No reviews yet</p>
              <p className='text-gray-400 text-sm mt-1'>Reviews from completed contracts will appear here</p>
            </div>
          ) : (
            visibleReviews.map((review) => {
              const reviewDate = new Date(review.created_at);
              const formattedDate = reviewDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              return (
                <div key={review.id} className='border-b border-gray-200 pb-4'>
                  <div className='flex justify-between items-start mb-1'>
                    <div>
                      <p className='font-semibold text-gray-900'>Client Review</p>
                      <p className='text-sm text-gray-500'>{formattedDate}</p>
                    </div>
                    <StarRating rating={review.rating} size='sm' />
                  </div>
                  {review.comment && (
                    <p className='text-gray-700 text-base leading-relaxed'>
                      "{review.comment}"
                    </p>
                  )}
                  <p className='text-xs text-gray-400 mt-2'>Contract: {review.contract_id.slice(-8)}</p>
                </div>
              );
            })
          )}
        </div>

        <div className='flex items-center justify-center gap-6'>
          <button
            onClick={handleReviewsBack}
            disabled={currentReviewPage === 0}
            className='text-sm text-gray-500 hover:text-teal-600 disabled:opacity-40 flex items-center gap-1'
          >
            <ChevronLeft className='w-4 h-4' />
            Back
          </button>
          <div className='flex gap-2'>
            {Array.from({ length: totalReviewPages }).map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === currentReviewPage ? 'bg-teal-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleReviewsNext}
            disabled={currentReviewPage === totalReviewPages - 1}
            className='text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1'
          >
            Next
            <ChevronRight className='w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  );
}
