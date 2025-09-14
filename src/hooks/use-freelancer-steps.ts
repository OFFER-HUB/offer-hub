'use client'

import { useState, useCallback } from 'react'
import type { UserProfileData } from '@/app/types/freelancer-profile'

export function useFreelancerOnboarding() {
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

  return {
    currentStep,
    userData,
    nextStep,
    prevStep,
    updateUserData,
  }
}
