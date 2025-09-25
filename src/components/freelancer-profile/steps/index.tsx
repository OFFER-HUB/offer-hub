'use client'

import type { UserProfileData, ProfileStepProps } from '@/app/types/freelancer-profile'
import Header from '../header'

// Import all step components
import UserChooseRole from './user-choose-role'
import UserSelectJobType from './user-select-job-type'
import UserSelectInterestedCategory from './user-select-interested-category'
import UserAddWorkExperience from './user-add-work-experience'
import UserAddWorkExperienceActiveState from './user-add-work-experience-active-state'
import UserAddEducationActiveState from './user-add-education-active-state'
import UserAddLanguagesActiveState from './user-add-languages-active-state'
import UserAddBioActiveState from './user-add-bio-active-state'
import UserSetHourlyRateActiveState from './user-set-hourly-rate-active-state'
import UserSetAccountProfileActiveState from './user-set-account-profile-active-state'
import UserProfilePreviewActiveState from './user-profile-preview-active-state'

interface StepsControllerProps {
  currentStep: number
  userData: UserProfileData
  nextStep: () => void
  prevStep: () => void
  updateUserData: (data: Partial<UserProfileData>) => void
}

const steps = [
  UserChooseRole,
  UserSelectJobType,
  UserSelectInterestedCategory,
  UserAddWorkExperience,
  UserAddWorkExperienceActiveState,
  UserAddEducationActiveState,
  UserAddLanguagesActiveState,
  UserAddBioActiveState,
  UserSetHourlyRateActiveState,
  UserSetAccountProfileActiveState,
  UserProfilePreviewActiveState,
]

export default function StepsController({
  currentStep,
  userData,
  nextStep,
  prevStep,
  updateUserData,
}: StepsControllerProps) {
  const CurrentStepComponent = steps[currentStep]

  const props: ProfileStepProps = {
    userData,
    updateUserData,
    nextStep,
    prevStep,
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <main className='flex-1 flex items-center justify-center w-full'>
        <div className='w-full'>
          {CurrentStepComponent ? (
            <CurrentStepComponent {...props} />
          ) : (
            <div className='text-center'>
              <h2 className='text-2xl font-bold'>Congratulations!</h2>
              <p>You have completed the onboarding process.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
