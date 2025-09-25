'use client'
import { useState } from 'react'
import { VALIDATION_LIMITS } from '@/constants/magic-numbers'
import type React from 'react'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Footer from '@/components/freelancer-profile/footer'
import { Textarea } from '@/components/ui/textarea'
import ExampleBioCard from './user-add-bio-example-card'
import type { ProfileStepProps } from '@/app/types/freelancer-profile'

function UserAddBioActiveState({ userData, updateUserData, nextStep, prevStep }: ProfileStepProps) {
  const [bio, setBio] = useState(userData.bio || '')
  const [bioError, setBioError] = useState('')

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBio = e.target.value
    setBio(newBio)
    updateUserData({ bio: newBio })
    if (newBio.length < VALIDATION_LIMITS.MIN_BIO_LENGTH) {
      setBioError(`Bio must be at least ${VALIDATION_LIMITS.MIN_BIO_LENGTH} characters`)
    } else {
      setBioError('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (bio.length >= VALIDATION_LIMITS.MIN_BIO_LENGTH) {
      nextStep()
    } else {
      setBioError(`Bio must be at least ${VALIDATION_LIMITS.MIN_BIO_LENGTH} characters`)
    }
  }

  return (
    <div className='flex flex-col gap-y-16 w-full pb-28'>
      <div className='gap-8 mx-auto px-4 font-semibold space-y-4 max-w-4xl'>
        <p className='text-neutral-500'>8/11</p>
        <h1 className='text-3xl text-[#19213D]'>Great. Now write a bio to tell the world about yourself.</h1>
        <p className='font-normal text-lg text-[#19213D]'>
          Help people get to know you at a glance. What work do you do best? Tell them clearly, using paragraphs or
          bullet points. You can always edit later; just make sure you proofread now.
        </p>
      </div>
      <div className='flex flex-col md:flex-row gap-8 w-full max-w-4xl mx-auto px-4'>
        <div className='flex-1'>
          <form id='add-bio-form' onSubmit={handleSubmit}>
            <div className='mt-8'>
              <label htmlFor='bio' className='block text-sm font-medium mb-2'>
                Bio
              </label>
              <Textarea
                id='bio'
                value={bio}
                onChange={handleBioChange}
                placeholder='Enter your top skills, experiences, and interests. This is one of the first things clients will see on your profile.'
                className='w-full min-h-48 border border-[#19213D] rounded-lg p-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#19213D]'
              />
              <div className='flex justify-between mt-2'>
                {bioError && <span className='text-red-500 text-xs'>{bioError}</span>}
                <span className={`text-xs ml-auto ${bio.length < VALIDATION_LIMITS.MIN_BIO_LENGTH ? 'text-gray-500' : 'text-green-600'}`}>
                  At least {VALIDATION_LIMITS.MIN_BIO_LENGTH} characters ({bio.length}/{VALIDATION_LIMITS.MIN_BIO_LENGTH})
                </span>
              </div>
            </div>
          </form>
        </div>
        <div className='md:w-1/3'>
          <ExampleBioCard />
        </div>
      </div>
      <Footer className='px-4 flex justify-between'>
        <div>
          <Button onClick={prevStep} variant='ghost' className='gap-1 rounded-full'>
            <ArrowLeft size={18} /> Back
          </Button>
        </div>
        <div className='space-x-4'>
          <Button
            onClick={nextStep}
            variant='outline'
            className='border-[#149A9B] text-[#149A9B] hover:text-[#149A9B] bg-transparent rounded-full md:min-w-36'
          >
            Skip
          </Button>
          <Button
            type='submit'
            form='add-bio-form'
            className='gap-1 bg-[#149A9B] text-white rounded-full md:min-w-36'
            disabled={bio.length < VALIDATION_LIMITS.MIN_BIO_LENGTH}
          >
            Set your rate
          </Button>
        </div>
      </Footer>
    </div>
  )
}

export default UserAddBioActiveState
