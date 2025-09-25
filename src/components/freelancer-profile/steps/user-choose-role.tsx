'use client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { User, Briefcase } from 'lucide-react'
import type { ProfileStepProps } from '@/app/types/freelancer-profile'

const ROLES = [
  {
    key: 'freelancer' as const,
    label: 'Freelancer',
    description: 'I\'m looking for work.',
    icon: <User className='w-7 h-7 text-primary-500' />,
  },
  {
    key: 'client' as const,
    label: 'Client',
    description: 'I\'m hiring for a project.',
    icon: <Briefcase className='w-7 h-7 text-primary-500' />,
  },
]

export default function UserChooseRole({ userData, updateUserData, nextStep }: ProfileStepProps) {
  const selectedRole = userData.role

  const handleSelectRole = (role: 'freelancer' | 'client') => {
    updateUserData({ role })
  }

  const handleCreateAccount = () => {
    if (selectedRole) {
      nextStep()
    }
  }

  return (
    <main className='flex w-full items-center justify-center px-2 py-10'>
      <div className='bg-white rounded-xl shadow-md w-full max-w-md border-2 border-neutral-500 flex flex-col items-center text-center gap-8 px-4 sm:px-8 py-8 sm:py-10 mx-auto'>
        <div className='text-center w-full'>
          <h1 className='text-lg sm:text-xl font-bold text-secondary-500 mb-1'>GET STARTED – Select your role</h1>
          <p className='text-xs sm:text-sm text-primary-500'>Apply for open role or get your project done.</p>
        </div>
        <div className='flex flex-col gap-4 w-full'>
          {ROLES.map((role) => (
            <button
              key={role.key}
              type='button'
              onClick={() => handleSelectRole(role.key)}
              className={`flex items-center justify-start gap-4 border-2 rounded-xl px-4 sm:px-5 py-4 sm:py-6 transition-all duration-150 w-full text-left focus:outline-none ${
                selectedRole === role.key
                  ? 'border-primary-500 bg-primary-50 shadow'
                  : 'border-neutral-500 bg-white hover:bg-neutral-300'
              }`}
            >
              <span className='text-primary-500'>{role.icon}</span>
              <span className='flex-1'>
                <span className='block font-semibold text-secondary-500 text-base sm:text-lg'>{role.label}</span>
                <span className='block text-xs sm:text-sm text-neutral-600 mt-1'>{role.description}</span>
              </span>
              <span
                className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-colors duration-150 ${
                  selectedRole === role.key ? 'border-primary-500' : 'border-neutral-500'
                }`}
              >
                {selectedRole === role.key && <span className='w-3 h-3 bg-primary-500 rounded-full block' />}
              </span>
            </button>
          ))}
        </div>
        <Button
          className='w-full bg-[#149A9B] text-white rounded-full py-2 text-base font-medium disabled:opacity-60'
          disabled={!selectedRole}
          onClick={handleCreateAccount}
        >
          Create Account
        </Button>
        <div className='text-center text-xs text-neutral-600 w-full'>
          Already have an account?{' '}
          <Link href='#' className='text-[#149A9B] underline hover:text-primary-600'>
            Sign in
          </Link>
        </div>
      </div>
    </main>
  )
}
