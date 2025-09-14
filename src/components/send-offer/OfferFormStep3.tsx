'use client';

import { Button } from '@/components/ui/button';
import { useOfferForm } from './OfferFormContext';

interface OfferFormStep3Props {
  onSubmit: () => void;
  onBack: () => void;
  freelancerId: string;
}

export function OfferFormStep3({ onSubmit, onBack, freelancerId }: OfferFormStep3Props) {
  const { state } = useOfferForm();
  const { formData } = state;

  return (
    <div className='flex-1 flex items-center justify-center p-8'>
      <div className='w-full max-w-md space-y-8'>
        {/* Header */}
        <div className='text-center'>
          <h1 className='text-2xl font-semibold text-gray-900 mb-2'>
            Review & Send
          </h1>
          <p className='text-teal-600 text-sm'>
            Review your offer details before sending
          </p>
        </div>

        {/* Offer Summary */}
        <div className='space-y-4'>
          <div className='bg-gray-50 rounded-lg p-4 space-y-3'>
            <div>
              <h3 className='font-medium text-gray-900 mb-1'>Job Title</h3>
              <p className='text-gray-700'>{formData.offerTitle}</p>
            </div>
            
            <div>
              <h3 className='font-medium text-gray-900 mb-1'>Description</h3>
              <p className='text-gray-700 text-sm'>{formData.projectDescription}</p>
            </div>
            
            <div>
              <h3 className='font-medium text-gray-900 mb-1'>Budget Estimate</h3>
              <p className='text-gray-700'>${formData.budgetAmount?.toLocaleString()}</p>
            </div>
            
            <div>
              <h3 className='font-medium text-gray-900 mb-1'>Project Duration</h3>
              <p className='text-gray-700 capitalize'>
                {formData.projectDuration === 'long' ? 'Long term project' : 'Short term project'}
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className='space-y-3 pt-4'>
          <Button
            onClick={onSubmit}
            className='w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-md font-medium'
          >
            Send Offer
          </Button>
          
          <Button
            onClick={onBack}
            className='w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-md font-medium border-0'
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}