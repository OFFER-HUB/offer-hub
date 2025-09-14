'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface SuccessConfirmationProps {
  onGoToDashboard: () => void;
}

export function SuccessConfirmation({ onGoToDashboard }: SuccessConfirmationProps) {
  return (
    <Card className='w-full max-w-2xl min-h-[500px] flex flex-col'>
      <CardHeader className='text-center py-8'>
        <h1 className='text-2xl font-bold text-gray-900 mb-6'>
          Your Project has been posted
        </h1>
        
        {/* Success Icon */}
        <div className='flex justify-center mb-8'>
          <Image
            src='/check.png'
            alt='Success checkmark'
            width={160}
            height={160}
            style={{
              width: '160px',
              height: '160px',
              transform: 'rotate(0deg)',
              opacity: 1
            }}
          />
        </div>
      </CardHeader>
      
      <div className='flex-grow'></div>
      
      <CardContent className='pb-8'>
        {/* Action Button */}
        <div className='flex justify-center'>
          <Button 
            className='bg-gray-800 hover:bg-gray-900 text-white font-medium'
            style={{
              width: '361px',
              height: '44px',
              borderRadius: '32px',
              padding: '16px',
              gap: '10px',
              color: '#FFFFFF'
            }}
            onClick={onGoToDashboard}
          >
            Go to dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 