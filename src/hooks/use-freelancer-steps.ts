'use client'

import { useState, useCallback } from 'react'
import type { UserProfileData } from '@/app/types/freelancer-profile'

interface UseFreelancerOnboardingReturn {
  currentStep: number;
  userData: UserProfileData;
  nextStep: () => void;
  prevStep: () => void;
  updateUserData: (data: Partial<UserProfileData>) => void;
  goToStep: (step: number) => void;
  resetOnboarding: () => void;
}

export function useFreelancerOnboarding(): UseFreelancerOnboardingReturn {
  const [currentStep, setCurrentStep] = useState(0)
  const [userData, setUserData] = useState<UserProfileData>({
    languages: [{ id: '1', name: 'English', level: 'Native or Bilingual' }],
    skills: [],
    workExperience: [],
    education: [],
    hourlyRate: 0.267,
  })

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1)
  }, [])

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }, [])

  const updateUserData = useCallback((data: Partial<UserProfileData>) => {
    setUserData((prev) => ({ ...prev, ...data }))
  }, [])

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step)
  }, [])

  const resetOnboarding = useCallback(() => {
    setCurrentStep(0)
    setUserData({
      languages: [{ id: '1', name: 'English', level: 'Native or Bilingual' }],
      skills: [],
      workExperience: [],
      education: [],
      hourlyRate: 0.267,
    })
  }, [])

  return {
    currentStep,
    userData,
    nextStep,
    prevStep,
    updateUserData,
    goToStep,
    resetOnboarding,
  }
}
