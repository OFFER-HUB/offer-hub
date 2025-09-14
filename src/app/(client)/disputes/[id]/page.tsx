'use client';

import { DisputeConversation } from '@/components/disputes/DisputeConversation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function DisputeConversationPage() {
  const router = useRouter();
  const params = useParams();
  const disputeId = params.id as string;

  const handleBack = () => {
    router.back();
  };

  return (
    <div className='min-h-screen'>
      {/* Header outside card */}
      <div className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='max-w-4xl mx-auto flex items-center justify-between'>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleBack}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900 p-2'
          >
            <ChevronLeft className='h-5 w-5' />
            Back
          </Button>
          
          <h1 className='absolute left-1/2 transform -translate-x-1/2 text-lg font-semibold text-gray-900'>
            Mobile App UI/UX design
          </h1>
          
          {/* Spacer for balance */}
          <div className='w-16'></div>
        </div>
      </div>

      {/* Card Container */}
      <div className='p-4 md:p-6'>
        <div className='max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden h-[calc(100vh-8rem)] md:h-[calc(100vh-9rem)]'>
          {/* Conversation Header inside card */}
          

          {/* Main Content */}
          <div className='h-[calc(100%-80px)]'>
            <DisputeConversation disputeId={disputeId} />
          </div>
        </div>
      </div>
    </div>
  );
}