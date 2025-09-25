'use client'

import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { User, ProfileFormData } from '@/types/user.types'
import { useProfileApi, mapFormDataToUpdateDTO, combineName, splitName } from '@/hooks/api-connections/use-profile-api'

interface EditProfileFormProps {
  user: User
  onBack: () => void
  onSave: (data: User) => void
}

export default function EditProfileForm({ user, onBack, onSave }: EditProfileFormProps) {
  const { firstName, lastName } = splitName(user.name);
  const [formData, setFormData] = useState({
    firstName,
    lastName,
    email: user.email || '',
    username: user.username || '',
    bio: user.bio || '',
  })
  const { updateProfile, isLoading, error } = useProfileApi()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const profileData: ProfileFormData = {
      name: combineName(formData.firstName, formData.lastName),
      username: formData.username,
      email: formData.email,
      bio: formData.bio,
    }

    const updateData = mapFormDataToUpdateDTO(profileData)
    const success = await updateProfile(user.id, updateData)

    if (success) {
      toast.success('Profile updated', {
        description: 'Your profile information has been saved successfully.',
      })
      // Pass updated user data back to parent
      onSave({
        ...user,
        ...updateData,
      })
    } else {
      toast.error('Error', {
        description: error?.message || 'Failed to update profile. Please try again.',
      })
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className='relative h-full'>
      {/* Fixed Header */}
      <div className='bg-white border-y border-gray-200 px-6 py-4 fixed top-16 left-0 right-0 z-10'>
        <div className='max-w-2xl mx-auto flex items-center justify-between'>
          <Button
            variant='ghost'
            onClick={onBack}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900 p-0 px-2'
          >
            <ChevronLeft className='w-4 h-4' />
            Back
          </Button>
          <h1 className='text-xl font-semibold text-gray-900'>Edit profile</h1>
          <div className='w-16' /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className='pt-20 pb-6 px-6 h-full overflow-y-auto'>
        <div className='max-w-2xl mx-auto'>
          <div className='bg-white rounded-lg border border-gray-200 p-8'>
            <h2 className='text-lg font-semibold text-gray-900 mb-6'>Edit details</h2>

            <form onSubmit={handleSubmit} className='space-y-6'>
              <div>
                <Label htmlFor='firstName' className='text-sm font-medium text-gray-700'>
                  First Name:
                </Label>
                <Input
                  id='firstName'
                  type='text'
                  value={formData.firstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('firstName', e.target.value)}
                  className='mt-1 h-12'
                  required
                />
              </div>

              <div>
                <Label htmlFor='lastName' className='text-sm font-medium text-gray-700'>
                  Last Name:
                </Label>
                <Input
                  id='lastName'
                  type='text'
                  value={formData.lastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('lastName', e.target.value)}
                  className='mt-1 h-12'
                  required
                />
              </div>

              <div>
                <Label htmlFor='email' className='text-sm font-medium text-gray-700'>
                  Email Address
                </Label>
                <Input
                  id='email'
                  type='email'
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('email', e.target.value)}
                  className='mt-1 h-12'
                  required
                />
              </div>

              <div>
                <Label htmlFor='username' className='text-sm font-medium text-gray-700'>
                  Username:
                </Label>
                <Input
                  id='username'
                  type='text'
                  value={formData.username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('username', e.target.value)}
                  placeholder='Username'
                  className='mt-1 h-12'
                  required
                />
              </div>

              <div>
                <Label htmlFor='bio' className='text-sm font-medium text-gray-700'>
                  Bio:
                </Label>
                <textarea
                  id='bio'
                  value={formData.bio}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('bio', e.target.value)}
                  placeholder='Tell us about yourself...'
                  className='mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-800 resize-none min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <Button
                type='submit'
                disabled={isLoading}
                className='w-full h-12 bg-[#002333] hover:bg-[#001a26] text-white font-medium rounded-full'
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
