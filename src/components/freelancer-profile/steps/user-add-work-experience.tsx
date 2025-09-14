'use client'

import { Search, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProfileStepProps } from '@/app/types/freelancer-profile'

export default function UserAddWorkExperience({ nextStep, prevStep }: ProfileStepProps) {
  return (
    <main className='flex flex-col items-center px-4 py-10 w-full'>
      <div className='w-full max-w-xl space-y-8 bg-white p-8 rounded-lg shadow-md'>
        <div className='text-base font-semibold text-[#B4B9C9]'>4/11</div>
        <div className='space-y-2'>
          <h1 className='text-[20px] font-semibold leading-none text-[#19213D]'>
            Now, let's tell the world what you have been about.
          </h1>
          <p className='text-[12px] font-normal leading-none text-[#19213D]'>
            It’s the very first thing clients see, so make it count. Stand out by describing your expertise in your own
            words.
          </p>
        </div>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
            <Search className='w-5 h-5 text-gray-400' />
          </div>
          <input
            id='role'
            type='text'
            placeholder='Example: Design & Creative'
            className='w-full border border-[#19213D] rounded-[16px] p-4 pl-12 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#19213D]'
          />
        </div>
        <div className='flex justify-between mt-8 pt-6 border-t'>
          <Button onClick={prevStep} variant='ghost' className='gap-1 rounded-full'>
            <ArrowLeft size={18} /> Back
          </Button>
          <Button onClick={nextStep} className='bg-[#149A9B] text-white rounded-full md:min-w-36'>
            Add Work Experience
          </Button>
        </div>
      </div>
    </main>
  )
}
