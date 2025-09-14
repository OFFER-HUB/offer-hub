
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StarRating from '@/components/ui/star-rating';
import ServiceRequestModal from '@/components/modals/service-request-modal';
import type { Freelancer } from '@/data/landing-data';

export default function FreelancerCard({
  name,
  title,
  avatar,
  rating,
  reviews,
  hourlyRate,
  verified,
  serviceId,
}: Freelancer & { serviceId: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <div className='bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow'>
      <div className='h-32 bg-gradient-to-r from-[#002333] to-[#15949C] relative'>
        <div className='absolute -bottom-10 left-6'>
          <div className='rounded-full border-4 border-white overflow-hidden h-20 w-20'>
            <Image
              src={avatar || '/placeholder.svg'}
              alt={name}
              width={80}
              height={80}
              className='object-cover'
            />
          </div>
        </div>
      </div>
      <div className='pt-12 pb-6 px-6'>
        <div className='flex items-center gap-2 mb-1'>
          <h3 className='text-xl font-semibold text-[#002333]'>{name}</h3>
          {verified && (
            <CheckCircle className='h-4 w-4 text-[#15949C] fill-[#15949C]' />
          )}
        </div>
        <p className='text-[#002333]/70 mb-3'>{title}</p>
        <div className='flex items-center gap-1 mb-4'>
          <StarRating rating={rating} />
          <span className='text-sm text-[#002333]/70'>({reviews})</span>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-[#002333] font-semibold'>${hourlyRate}/hr</span>
          <Button
            size='sm'
            className='bg-[#15949C] hover:bg-[#15949C]/90 text-white'
            onClick={() => setModalOpen(true)}
          >
            Hire Me
          </Button>
        </div>
      </div>
      <ServiceRequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        serviceId={serviceId}
      />
    </div>
  );
}
