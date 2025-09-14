'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar } from 'lucide-react';
import { Review } from '@/lib/mockData/freelancer-profile-mock';

interface ReviewsSectionProps {
  reviews: Review[];
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-xl font-semibold text-gray-900'>Client Reviews</h2>
        <Badge variant='outline' className='text-sm'>
          {reviews.length} reviews
        </Badge>
      </div>
      
      <div className='space-y-6'>
        {reviews.map((review) => (
          <div key={review.id} className='border-b border-gray-100 pb-6 last:border-b-0 last:pb-0'>
            <div className='flex items-start gap-4'>
              <Avatar className='w-12 h-12'>
                <AvatarImage src={review.clientAvatar} alt={review.clientName} />
                <AvatarFallback className='text-sm font-semibold'>
                  {review.clientName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className='flex-1 space-y-3'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='font-semibold text-gray-900'>{review.clientName}</h3>
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <div className='flex items-center gap-1'>
                        {renderStars(review.rating)}
                      </div>
                      <span>•</span>
                      <div className='flex items-center gap-1'>
                        <Calendar className='w-4 h-4' />
                        {formatDate(review.date)}
                      </div>
                    </div>
                  </div>
                  <Badge variant='outline' className='text-xs'>
                    ${review.projectValue.toLocaleString()}
                  </Badge>
                </div>
                
                <div className='space-y-2'>
                  <h4 className='text-sm font-medium text-gray-800'>
                    {review.projectTitle}
                  </h4>
                  <p className='text-gray-700 leading-relaxed'>
                    {review.text}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Review Summary */}
      <div className='mt-6 pt-6 border-t border-gray-200'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
          <div>
            <div className='text-2xl font-bold text-gray-900'>
              {reviews.length}
            </div>
            <div className='text-sm text-gray-600'>Total Reviews</div>
          </div>
          <div>
            <div className='text-2xl font-bold text-gray-900'>
              {(reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)}
            </div>
            <div className='text-sm text-gray-600'>Average Rating</div>
          </div>
          <div>
            <div className='text-2xl font-bold text-gray-900'>
              {reviews.filter(r => r.rating === 5).length}
            </div>
            <div className='text-sm text-gray-600'>5-Star Reviews</div>
          </div>
          <div>
            <div className='text-2xl font-bold text-gray-900'>
              ${reviews.reduce((acc, review) => acc + review.projectValue, 0).toLocaleString()}
            </div>
            <div className='text-sm text-gray-600'>Total Project Value</div>
          </div>
        </div>
      </div>
    </div>
  );
}
