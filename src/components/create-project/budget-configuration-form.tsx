'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BudgetConfigurationFormProps {
  onNext: () => void;
  onBack: () => void;
}

export function BudgetConfigurationForm({ onNext, onBack }: BudgetConfigurationFormProps) {
  const [budget, setBudget] = useState<number>(0);

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setBudget(value);
  };

  const handleNext = () => {
    if (budget <= 0) {
      alert('Please set a valid budget amount');
      return;
    }
    onNext();
  };

  const canProceed = budget > 0;

  return (
    <Card className='w-full max-w-2xl min-h-[500px]'>
      <CardHeader className='text-center py-8'>
        <CardTitle className='text-2xl font-semibold text-gray-900'>
          Budget
        </CardTitle>
        <p className='text-sm text-gray-600'>
          Set your preferred budget for this project
        </p>
      </CardHeader>
      <CardContent className='space-y-8 flex flex-col justify-center flex-1'>
        <div className='space-y-4'>
          <Label htmlFor='budget' className='text-sm font-medium text-gray-700'>
            What is your estimate for this project
          </Label>
          <div className='relative'>
            <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium'>
              $
            </span>
            <Input
              id='budget'
              type='number'
              value={budget || ''}
              onChange={handleBudgetChange}
              placeholder='0'
              className='pl-8 text-lg font-semibold'
              min='0'
              step='0.01'
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className='flex flex-col gap-4 pt-8 items-center'>
          <Button 
            className='bg-gray-800 hover:bg-gray-900 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed'
            style={{
              width: '361px',
              height: '44px',
              borderRadius: '32px',
              padding: '16px',
              gap: '10px',
              color: '#FFFFFF'
            }}
            onClick={handleNext}
            disabled={!canProceed}
          >
            Next
          </Button>
          
          <Button 
            className='text-white font-medium hover:bg-opacity-90'
            style={{
              width: '361px',
              height: '44px',
              borderRadius: '32px',
              padding: '16px',
              gap: '10px',
              backgroundColor: '#149A9B',
              color: '#FFFFFF'
            }}
            onClick={onBack}
          >
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 