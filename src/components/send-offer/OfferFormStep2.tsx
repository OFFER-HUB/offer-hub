'use client';

import { Button } from '@/components/ui/button';
import { useOfferForm } from './OfferFormContext';
import { CheckCircle } from 'lucide-react';

interface OfferFormStep2Props {
  onNext: () => void;
  onBack: () => void;
  freelancerId: string;
}

export function OfferFormStep2({ onNext, onBack, freelancerId }: OfferFormStep2Props) {
  const { state, updateField, setError, clearError } = useOfferForm();
  const { formData, errors } = state;

  const handleProjectDurationChange = (duration: 'long' | 'short') => {
    updateField('projectDuration', duration);
    clearError('projectDuration');
  };

  const validateAndProceed = () => {
    let hasErrors = false;

    if (!formData.projectDuration) {
      setError('projectDuration', 'Please select a project duration');
      hasErrors = true;
    } else {
      clearError('projectDuration');
    }

    if (!hasErrors) {
      onNext();
    }
  };

  return (
    <div className='flex-1 flex items-center justify-center p-8'>
      <div className='w-full max-w-md space-y-8'>
        {/* Header */}
        <div className='text-center'>
          <h1 className='text-2xl font-semibold text-gray-900 mb-2'>
            Send an offer
          </h1>
          <p className='text-teal-600 text-sm'>
            Create and send offer to hire
          </p>
        </div>

        {/* Project Duration Selection */}
        <div className='space-y-4'>
          {/* Long term project option */}
          <div 
            onClick={() => handleProjectDurationChange('long')}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.projectDuration === 'long' 
                ? 'border-teal-500 bg-teal-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='font-semibold text-gray-900 mb-1'>Long term project</h3>
                <p className='text-sm text-gray-600'>
                  More than thirty hours a week and/or will be longer than three months.
                </p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                formData.projectDuration === 'long'
                  ? 'border-teal-500 bg-teal-500'
                  : 'border-gray-300'
              }`}>
                {formData.projectDuration === 'long' && (
                  <CheckCircle className='w-4 h-4 text-white' />
                )}
              </div>
            </div>
          </div>

          {/* Short term project option */}
          <div 
            onClick={() => handleProjectDurationChange('short')}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.projectDuration === 'short' 
                ? 'border-teal-500 bg-teal-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='font-semibold text-gray-900 mb-1'>Short term project</h3>
                <p className='text-sm text-gray-600'>
                  Less than thirty hours a week and/or will be shorter than three months.
                </p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                formData.projectDuration === 'short'
                  ? 'border-teal-500 bg-white'
                  : 'border-gray-300'
              }`}>
                {formData.projectDuration === 'short' && (
                  <div className='w-3 h-3 rounded-full bg-teal-500'></div>
                )}
              </div>
            </div>
          </div>

          {errors.projectDuration && (
            <p className='text-sm text-red-600'>{errors.projectDuration}</p>
          )}
        </div>

        {/* Buttons */}
        <div className='space-y-3 pt-4'>
          <Button
            onClick={validateAndProceed}
            disabled={!formData.projectDuration}
            className='w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Post job
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