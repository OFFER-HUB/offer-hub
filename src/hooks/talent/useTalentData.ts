"use client"

import { useState, useEffect } from "react"
import { type TalentProfile, talentProfileData } from "@/lib/mockData/talent-mock-data"

export const useTalentData = () => {
  const [talents, setTalents] = useState<TalentProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTalents = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))
      setTalents(talentProfileData)
      setLoading(false)
    }

    fetchTalents()
  }, [])

  const getTalentById = (id: number): TalentProfile | undefined => {
    return talents.find((talent) => talent.id === id)
  }

  const getTalentsByCategory = (category: string): TalentProfile[] => {
    return talents.filter((talent) => talent.category === category)
  }

  return {
    talents,
    loading,
    getTalentById,
    getTalentsByCategory,
  }
}
