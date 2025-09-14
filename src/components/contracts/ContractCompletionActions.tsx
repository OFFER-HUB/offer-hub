'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import ReviewModal from '@/components/modals/review-modal';
import { Review } from '@/types/review.types';
import { useNotification } from '@/lib/contexts/NotificatonContext';

interface ContractCompletionActionsProps {
  contractId: string;
  contractStatus: 'active' | 'completed' | 'released' | 'disputed';
  fromId: string; // Current user ID (authenticated user)
  toId: string;   // Other participant ID
  userRole: 'client' | 'freelancer'; // Current user's role in the contract
  onReviewSubmitted?: (review: Review) => void;
}

const ContractCompletionActions: React.FC<ContractCompletionActionsProps> = ({
  contractId,
  contractStatus,
  fromId,
  toId,
  userRole,
  onReviewSubmitted,
}) => {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);
  const { actions: { addNotification } } = useNotification();

  // Only show review option when contract is completed/released
  if (contractStatus !== 'released') {
    return null;
  }

  // Prevent duplicate reviews (in a real implementation, this would check the backend)
  if (hasSubmittedReview) {
    return (
      <div className='flex items-center space-x-2 text-sm text-gray-500'>
        <Star className='h-4 w-4 text-yellow-400' />
        <span>Review submitted</span>
      </div>
    );
  }

  const handleOpenReviewModal = () => {
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
  };

  const handleReviewCreated = (review: Review) => {
    setHasSubmittedReview(true);
    onReviewSubmitted?.(review);
    
    // Optional: Show additional success notification
    addNotification({
      type: 'success',
      title: 'Review Published',
      message: 'Your review will help other users make informed decisions.',
    });
  };

  const getRoleSpecificText = () => {
    if (userRole === 'client') {
      return {
        buttonText: 'Review Freelancer',
        description: 'Share your experience working with this freelancer'
      };
    } else {
      return {
        buttonText: 'Review Client',
        description: 'Share your experience working with this client'
      };
    }
  };

  const { buttonText, description } = getRoleSpecificText();

  return (
    <div className='border border-gray-200 rounded-lg p-4 bg-gray-50'>
      <div className='flex items-start justify-between'>
        <div>
          <h3 className='text-sm font-medium text-gray-900 mb-1'>
            Contract Completed
          </h3>
          <p className='text-xs text-gray-600 mb-3'>
            {description}
          </p>
        </div>
        <div className='flex space-x-2'>
          <Button
            onClick={handleOpenReviewModal}
            size='sm'
            className='flex items-center space-x-1'
          >
            <Star className='h-4 w-4' />
            <span>{buttonText}</span>
          </Button>
        </div>
      </div>

      {isReviewModalOpen && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={handleCloseReviewModal}
          contractId={contractId}
          fromId={fromId}
          toId={toId}
          onCreated={handleReviewCreated}
        />
      )}
    </div>
  );
};

export default ContractCompletionActions;