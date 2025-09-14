'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { VALIDATION_LIMITS } from '@/constants/magic-numbers'
import type { ProfileStepProps } from '@/app/types/freelancer-profile'

export function useFreelancerSkills({ userData, updateUserData }: ProfileStepProps) {
  const [skills, setSkills] = useState<string[]>(userData?.skills || [])
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    updateUserData({ skills })
  }, [skills, updateUserData])

  const handleAddSkill = (skill: string) => {
    if (skills.length >= VALIDATION_LIMITS.MAX_SKILLS_PER_USER) return
    if (!skills.includes(skill)) {
      setSkills([...skills, skill])
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim() && !skills.includes(searchInput.trim())) {
      handleAddSkill(searchInput.trim())
      setSearchInput('')
    }
  }

  return {
    skills,
    searchInput,
    setSearchInput,
    handleAddSkill,
    handleRemoveSkill,
    handleSearchSubmit,
  }
}
