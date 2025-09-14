'use client'

import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { PlusCircle, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { ProfileStepProps } from '@/app/types/freelancer-profile'
import Footer from '../footer'

export default function UserSetAccountProfileActiveState({
  userData,
  updateUserData,
  nextStep,
  prevStep,
}: ProfileStepProps) {
  const [profileImage, setProfileImage] = useState<string | null>(userData.profilePicture || null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateUserData({ profileDetails: { ...userData.profileDetails, [e.target.name]: e.target.value } })
  }

  const handleSelectChange = (name: string, value: string) => {
    updateUserData({ profileDetails: { ...userData.profileDetails, [name]: value } })
  }

  const handleDateChange = (date?: Date) => {
    updateUserData({ profileDetails: { ...userData.profileDetails, dateOfBirth: date } })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setProfileImage(result)
        updateUserData({ profilePicture: result })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className='max-w-4xl mx-auto px-4 py-10 pb-28'>
      <div className='mb-8'>
        <p className='text-sm text-muted-foreground mb-2'>10/11</p>
        <h1 className='text-3xl font-bold text-[#19213D] mb-4'>
          A few last details, then you can check and publish your profile.
        </h1>
        <p className='text-muted-foreground max-w-2xl'>
          This information is for identity verification and will not be shown on your public profile.
        </p>
      </div>

      <div className='flex flex-col items-center gap-4 mb-8'>
        <div className='relative group cursor-pointer'>
          <label htmlFor='profile-photo-input'>
            {profileImage ? (
              <Image
                src={profileImage || '/placeholder.svg'}
                alt='Profile Photo'
                width={150}
                height={150}
                className='rounded-full object-cover border-2 border-gray-300 bg-[#D9D9D9]'
              />
            ) : (
              <div className='w-36 h-36 rounded-full bg-[#D9D9D9] flex items-center justify-center'></div>
            )}
            <div className='absolute bottom-0 right-0 bg-green-500 rounded-full p-1 cursor-pointer'>
              <PlusCircle className='h-6 w-6 text-white' />
            </div>
          </label>
          <input
            id='profile-photo-input'
            type='file'
            accept='image/*'
            onChange={handleImageChange}
            className='hidden'
          />
        </div>
        <Button asChild variant='outline'>
          <label htmlFor='profile-photo-input'>Upload Profile Photo</label>
        </Button>
      </div>

      <form className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-10'>
        <div className='flex flex-col'>
          <Label className='mb-2'>Date of Birth*</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'w-full text-left font-normal rounded-[16px]',
                  !userData.profileDetails?.dateOfBirth && 'text-muted-foreground',
                )}
              >
                {userData.profileDetails?.dateOfBirth
                  ? format(userData.profileDetails.dateOfBirth, 'PPP')
                  : 'Select your date of birth'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0'>
              <Calendar
                mode='single'
                selected={userData.profileDetails?.dateOfBirth}
                onSelect={handleDateChange}
                captionLayout='dropdown-buttons'
                fromYear={1950}
                toYear={new Date().getFullYear()}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label>Country*</Label>
          <Select
            onValueChange={(value) => handleSelectChange('country', value)}
            value={userData.profileDetails?.country}
          >
            <SelectTrigger className='rounded-[16px]'>
              <SelectValue placeholder='Select a country' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='usa'>United States</SelectItem>
              <SelectItem value='mexico'>Mexico</SelectItem>
              <SelectItem value='canada'>Canada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='col-span-1 md:col-span-2'>
          <Label>Street Address*</Label>
          <Input
            type='text'
            name='streetAddress'
            value={userData.profileDetails?.streetAddress}
            onChange={handleChange}
          />
        </div>
        <div className='col-span-1 md:col-span-2'>
          <Label>APT/Suite (Optional)</Label>
          <Input type='text' name='aptSuite' value={userData.profileDetails?.aptSuite} onChange={handleChange} />
        </div>
        <div>
          <Label>City*</Label>
          <Input type='text' name='city' value={userData.profileDetails?.city} onChange={handleChange} />
        </div>
        <div>
          <Label>State/Province*</Label>
          <Input
            type='text'
            name='stateProvince'
            value={userData.profileDetails?.stateProvince}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Zip/Postal Code*</Label>
          <Input
            type='text'
            name='zipPostalCode'
            value={userData.profileDetails?.zipPostalCode}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Phone Number</Label>
          <Input
            type='text'
            name='phoneNumber'
            value={userData.profileDetails?.phoneNumber}
            onChange={handleChange}
            placeholder='+1 123 456 7890'
          />
        </div>
      </form>
      <Footer className='px-4 mt-auto flex justify-between'>
        <div>
          <Button onClick={prevStep} variant='ghost' className='gap-1 rounded-full'>
            <ArrowLeft size={18} /> Back
          </Button>
        </div>
        <div className='space-x-4'>
          <Button onClick={nextStep} className='gap-1 bg-[#149A9B] text-white rounded-full md:min-w-36'>
            Preview Profile
          </Button>
        </div>
      </Footer>
    </div>
  )
}
