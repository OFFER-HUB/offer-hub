'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TalentLayout from '@/components/talent/TalentLayout';
import { OfferFormStep3 } from '@/components/send-offer/OfferFormStep3';
import { getFreelancerProfile } from '@/lib/mockData/freelancer-profile-mock';
import { FreelancerProfile } from '@/lib/mockData/freelancer-profile-mock';

interface Step3PageClientProps {
  id: string;
}

export default function Step3PageClient({ id }: Step3PageClientProps) {
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

  const handleSubmit = () => {
    router.push(`/talent/${id}/send-offer/success`);
  };

  const handleBack = () => {
    router.push(`/talent/${id}/send-offer/step-2`);
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
        <OfferFormStep3 
          onSubmit={handleSubmit} 
          onBack={handleBack}
          freelancerId={id}
        />
      </div>
    </TalentLayout>
  );
}