'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TalentLayout from '@/components/talent/TalentLayout';
import { OfferSuccess } from '@/components/send-offer/OfferSuccess';
import { getFreelancerProfile } from '@/lib/mockData/freelancer-profile-mock';
import { FreelancerProfile } from '@/lib/mockData/freelancer-profile-mock';

interface SuccessPageClientProps {
  id: string;
}

export default function SuccessPageClient({ id }: SuccessPageClientProps) {
  const router = useRouter();
  const [freelancer, setFreelancer] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profile = getFreelancerProfile(id);
    if (profile) {
      setFreelancer(profile);
    }
    setLoading(false);
  }, [id]);

  const handleViewOffer = () => {
    router.push('/dashboard/manage-project');
  };

  const handleSendAnother = () => {
    router.push('/onboarding/dashboard/talent');
  };

  if (loading) {
    return (
      <TalentLayout>
        <div className='min-h-screen flex items-center justify-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600'></div>
        </div>
      </TalentLayout>
    );
  }

  if (!freelancer) {
    return (
      <TalentLayout>
        <div className='min-h-screen flex items-center justify-center'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>Freelancer Not Found</h1>
            <button
              onClick={() => router.back()}
              className='px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700'
            >
              Go Back
            </button>
          </div>
        </div>
      </TalentLayout>
    );
  }

  return (
    <TalentLayout>
      <div className='min-h-screen bg-gray-50'>
        <OfferSuccess 
          freelancer={freelancer}
          onViewOffer={handleViewOffer}
          onSendAnother={handleSendAnother}
        />
      </div>
    </TalentLayout>
  );
}