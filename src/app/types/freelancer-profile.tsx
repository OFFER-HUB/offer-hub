// Type definitions for the freelancer profile flow

export interface WorkExperience {
  id: string
  title: string
  company: string
  location: string
  country: string
  currentlyWorking: boolean
  startDateMonth: string
  startDateYear: string
  endDateMonth?: string
  endDateYear?: string
  description: string
}

export interface Education {
  id: string
  university: string
  degree: string
  fieldOfStudy: string
  startYear: number
  endYear: number
  location: string
  description: string
}

export type LanguageLevel = 'Basic' | 'Conversational' | 'Fluent' | 'Native or Bilingual' | 'My Level is'
export interface Language {
  id: string
  name: string
  level: LanguageLevel
}

export interface ProfileDetails {
  dateOfBirth?: Date
  country?: string
  streetAddress?: string
  aptSuite?: string
  city?: string
  stateProvince?: string
  zipPostalCode?: string
  phoneNumber?: string
}

// Main user data type for the freelancer profile
export interface UserProfileData {
  role?: 'freelancer' | 'client'
  jobCategory?: string
  jobTypes?: string[]
  skills?: string[]
  workExperience?: WorkExperience[]
  education?: Education[]
  languages?: Language[]
  bio?: string
  hourlyRate?: number | string
  profilePicture?: string
  profileDetails?: ProfileDetails
  name?: string
  email?: string
}

// Props type for profile step components
export interface ProfileStepProps {
  userData: UserProfileData
  updateUserData: (data: Partial<UserProfileData>) => void
  nextStep: () => void
  prevStep: () => void
}
