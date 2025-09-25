'use client'

import { useState } from 'react'
import { VALIDATION_LIMITS } from '@/constants/magic-numbers'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProfileStepProps } from '@/app/types/freelancer-profile'

const CATEGORIES = [
  'Accounting & Consulting',
  'Admin Support',
  'Customer Service',
  'Data Science & Analytics',
  'Design & Creative',
  'Engineering & Architecture',
  'IT Networking',
  'Legal',
  'Sales & Marketing',
  'Translation',
  'Web, Mobile & Software Dev',
  'Writing',
]

const JOB_TYPES_MAP: Record<string, string[]> = {
  'Accounting & Consulting': ['Financial Analysis', 'Bookkeeping', 'Payroll Services'],
  'Admin Support': ['Data Entry', 'Virtual Assistant', 'Project Coordination'],
  'Customer Service': ['Customer Support', 'Technical Support', 'Client Management'],
  'Data Science & Analytics': ['Data Analysis', 'Data Visualization', 'Machine Learning'],
  'Design & Creative': ['Product Design', 'Photography', 'Video & Animation'],
  'Engineering & Architecture': ['Mechanical Design', 'CAD Drafting', 'Architecture Planning'],
  'IT Networking': ['Network Setup', 'Security Analysis', 'Cloud Engineering'],
  Legal: ['Contract Drafting', 'Legal Consulting', 'Compliance'],
  'Sales & Marketing': ['SEO', 'PPC Advertising', 'Email Marketing'],
  Translation: ['Language Translation', 'Localization', 'Subtitling'],
  'Web, Mobile & Software Dev': [
    'Blockchain, NFT & Cryptocurrency',
    'AI Apps & Integration',
    'Desktop Application Development',
    'Game Design & Development',
    'Web & Mobile Design',
    'Web Development',
  ],
  Writing: ['Content Writing', 'Technical Writing', 'Blogging'],
}

export default function UserSelectJobType({ userData, updateUserData, prevStep, nextStep }: ProfileStepProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(userData.jobCategory || null)
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>(userData.jobTypes || [])

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat)
    setSelectedJobTypes([])
    updateUserData({ jobCategory: cat, jobTypes: [] })
  }

  const handleSelectJobType = (job: string) => {
    const newSelection = selectedJobTypes.includes(job)
      ? selectedJobTypes.filter((j) => j !== job)
      : selectedJobTypes.length < VALIDATION_LIMITS.MAX_JOB_TYPES_SELECTION
        ? [...selectedJobTypes, job]
        : selectedJobTypes
    setSelectedJobTypes(newSelection)
    updateUserData({ jobTypes: newSelection })
  }

  const jobOptions = selectedCategory ? JOB_TYPES_MAP[selectedCategory] || [] : []

  return (
    <div className='space-y-6 bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto'>
      <p className='text-neutral-500 font-semibold'>2/11</p>
      <h2 className='text-2xl font-semibold'>Great, so what kind of projects are you looking for?</h2>
      <p className='text-[#149A9B]'>Don’t worry you can change these choices later on.</p>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-8'>
        <div className='space-y-3 md:col-span-1'>
          <h3 className='text-lg font-medium '>Select 1 Category</h3>
          <div className='flex flex-col space-y-2 '>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type='button'
                onClick={() => handleSelectCategory(cat)}
                className={cn(
                  'text-left px-2 py-1 rounded-md hover:bg-muted transition',
                  selectedCategory === cat && 'text-[#149A9B] font-semibold underline',
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className='space-y-3 md:col-span-2'>
          <h3 className='text-lg font-medium'>Select up to {VALIDATION_LIMITS.MAX_JOB_TYPES_SELECTION} options</h3>
          <div className='flex flex-col space-y-3'>
            {jobOptions.map((job) => (
              <label key={job} className='flex items-center space-x-3 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={selectedJobTypes.includes(job)}
                  onChange={() => handleSelectJobType(job)}
                  disabled={!selectedJobTypes.includes(job) && selectedJobTypes.length >= VALIDATION_LIMITS.MAX_JOB_TYPES_SELECTION}
                  className='w-5 h-5 accent-[#149A9B] rounded'
                />
                <span className='text-sm'>{job}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className='flex justify-between mt-8 pt-6 border-t'>
        <Button onClick={prevStep} variant='ghost' className='gap-1 rounded-full'>
          <ArrowLeft size={18} /> Back
        </Button>
        <Button
          onClick={nextStep}
          disabled={!selectedCategory || selectedJobTypes.length === 0}
          className='bg-[#149A9B] text-white rounded-full md:min-w-36'
        >
          Add Experience
        </Button>
      </div>
    </div>
  )
}
