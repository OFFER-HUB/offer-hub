'use client';

import { Button } from '@/components/ui/button';
import { FreelancerProfile } from '@/lib/mockData/freelancer-profile-mock';
import { getMockOfferSentData } from '@/lib/mockData/offer-form-mock';
import Image from 'next/image';

interface OfferSuccessProps {
  freelancer: FreelancerProfile;
  onViewOffer: () => void;
  onSendAnother: () => void;
}

export function OfferSuccess({ freelancer, onViewOffer, onSendAnother }: OfferSuccessProps) {
  const offerData = getMockOfferSentData(freelancer.name);

  return (
    <div className='flex-1 flex items-center justify-center p-8'>
      <div className='w-full max-w-md space-y-8'>
        <div className='text-center space-y-6'>
          {/* Success Icon */}
          <div className='flex justify-center'>
            <Image
              src='/success-tick.png'
              alt='Success'
              width={120}
              height={120}
              className='w-30 h-30'
            />
          </div>

          {/* Success Message */}
          <div>
            <h1 className='text-lg text-gray-900 mb-1'>
              You have sent offer to
            </h1>
            <h2 className='text-lg font-semibold text-gray-900'>
              {freelancer.name}
            </h2>
          </div>

          {/* Message Button */}
          <Button
            onClick={onViewOffer}
            className='w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-md font-medium'
          >
            Message
          </Button>
        </div>
      </div>
    </div>
  );
}

