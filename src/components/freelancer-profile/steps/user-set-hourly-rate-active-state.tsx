'use client'

import type React from 'react'

import { ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import type { ProfileStepProps } from '@/app/types/freelancer-profile'
import { Button } from '@/components/ui/button'
import Footer from '../footer'

const EthIcon = () => (
  <svg
    width='20'
    height='20'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none'
  >
    <path
      d='M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z'
      fill='#2F3540'
    />
    <path
      d='M12.187 12.7318L15.8618 10.5176L12.187 3.0791L8.51221 10.5176L12.187 12.7318ZM12.187 13.7496L8.51221 11.5354L12.187 18.9209L15.8618 11.5354L12.187 13.7496Z'
      fill='white'
    />
  </svg>
)

export default function UserSetHourlyRateActiveState({
  userData,
  updateUserData,
  nextStep,
  prevStep,
}: ProfileStepProps) {
  const handleServiceFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || /^[0-9]*\.?\d*$/.test(value)) {
      updateUserData({ hourlyRate: value })
    }
  }

  return (
    <div className='w-full min-h-screen flex flex-col pb-28'>
      <div className='w-full max-w-xl mx-auto flex-grow pt-10'>
        <div className='text-lg font-medium text-gray-500 mb-4'>9/11</div>
        <h1 className='text-3xl font-medium text-[#002333] mb-1'>Now, let&apos;s set your hourly rate.</h1>
        <p className='text-sm md:text-base text-[#6D758F] mb-10 '>
          Clients will see this rate on your profile and in search results once you publish your profile. You can adjust
          your rate every time you submit a proposal.
        </p>
        <Separator className='mb-12 text-[#B4B9C9' />
        <div className='mb-10'>
          <h2 className='text-xl md:text-2xl font-medium text-[#344054] mb-1'>Service Fee</h2>
          <p className='text-sm text-gray-500 mb-4'>Enter your service fee can be edited later in your profile</p>
          <div className='relative inline-block'>
            <EthIcon />
            <Input
              type='text'
              value={userData.hourlyRate}
              onChange={handleServiceFeeChange}
              placeholder='0.000 ETH'
              className='bg-white border border-[#D5D7DA] rounded-md py-2.5 shadow-sm text-base font-medium text-[#0A0A20] pl-10 pr-4 w-auto focus:!ring-0 focus-within:!ring-0'
              pattern='^[0-9]*\\.?\\d*$'
              inputMode='decimal'
            />
          </div>
        </div>
      </div>
      <Footer className='px-4 mt-auto flex justify-between'>
        <div>
          <Button onClick={prevStep} variant='ghost' className='gap-1 rounded-full'>
            <ArrowLeft size={18} /> Back
          </Button>
        </div>
        <div className='space-x-4'>
          <Button onClick={nextStep} className='gap-1 bg-[#149A9B] text-white rounded-full md:min-w-36'>
            Next
          </Button>
        </div>
      </Footer>
    </div>
  )
}
