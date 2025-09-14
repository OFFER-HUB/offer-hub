'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useOfferForm } from './OfferFormContext';

interface OfferFormStep1Props {
  onNext: () => void;
  onBack: () => void;
  freelancerId: string;
}

export function OfferFormStep1({ onNext, onBack, freelancerId }: OfferFormStep1Props) {
  const { state, updateField, setError, clearError } = useOfferForm();
  const { formData, errors } = state;

  const validateAndProceed = () => {
    let hasErrors = false;

    if (!formData.offerTitle.trim()) {
      setError('offerTitle', 'Job title is required');
      hasErrors = true;
    } else {
      clearError('offerTitle');
    }

    if (!formData.projectDescription.trim()) {
      setError('projectDescription', 'Job description is required');
      hasErrors = true;
    } else {
      clearError('projectDescription');
    }

    if (!formData.budgetAmount || formData.budgetAmount <= 0) {
      setError('budgetAmount', 'Budget estimate is required');
      hasErrors = true;
    } else {
      clearError('budgetAmount');
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

        {/* Form */}
        <div className='space-y-6'>
          {/* Job Title */}
          <div className='space-y-2'>
            <Label htmlFor='jobTitle' className='text-sm font-medium text-gray-700'>
              Job title
            </Label>
            <Input
              id='jobTitle'
              placeholder='Give your job a title'
              value={formData.offerTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('offerTitle', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                errors.offerTitle ? 'border-red-500' : ''
              }`}
            />
            {errors.offerTitle && (
              <p className='text-sm text-red-600'>{errors.offerTitle}</p>
            )}
          </div>

          {/* Job Description */}
          <div className='space-y-2'>
            <Label htmlFor='jobDescription' className='text-sm font-medium text-gray-700'>
              Job description
            </Label>
            <Textarea
              id='jobDescription'
              placeholder='Enter a description...'
              value={formData.projectDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField('projectDescription', e.target.value)}
              rows={6}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none ${
                errors.projectDescription ? 'border-red-500' : ''
              }`}
            />
            {errors.projectDescription && (
              <p className='text-sm text-red-600'>{errors.projectDescription}</p>
            )}
          </div>

          {/* Budget Estimate */}
          <div className='space-y-2'>
            <Label htmlFor='budget' className='text-sm font-medium text-gray-700'>
              What is your estimate for this project
            </Label>
            <Input
              id='budget'
              placeholder='$0'
              value={formData.budgetAmount ? `$${formData.budgetAmount}` : ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                updateField('budgetAmount', value ? parseInt(value) : 0);
              }}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                errors.budgetAmount ? 'border-red-500' : ''
              }`}
            />
            {errors.budgetAmount && (
              <p className='text-sm text-red-600'>{errors.budgetAmount}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className='space-y-3 pt-4'>
          <Button
            onClick={validateAndProceed}
            disabled={!formData.offerTitle.trim() || !formData.projectDescription.trim() || !formData.budgetAmount}
            className='w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Next
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