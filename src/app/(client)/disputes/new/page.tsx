'use client';

import { DisputeCreationForm } from '@/components/disputes/DisputeCreationForm';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewDisputePage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = (disputeData: any) => {
    // Simulate dispute creation and redirect to conversation
    console.log('Creating dispute:', disputeData);
    // In a real app, this would create the dispute and get the ID
    const mockDisputeId = 'dispute-' + Date.now();
    router.push(`/disputes/${mockDisputeId}`);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleBack}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900'
          >
            <ChevronLeft className='h-4 w-4' />
            Back
          </Button>
          <h1 className='text-xl font-semibold text-gray-900 absolute left-1/2 transform -translate-x-1/2'>Manage Project</h1>
          <div></div> {/* Spacer for balance */}
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-2xl mx-auto p-6'>
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8'>
          <div className='text-center mb-8'>
            <h2 className='text-2xl font-semibold text-gray-900 mb-2'>New dispute</h2>
            <p className='text-gray-600'>Initiate new dispute</p>
          </div>

          <DisputeCreationForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}