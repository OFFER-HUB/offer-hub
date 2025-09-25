'use client'

import { useState, useEffect } from 'react'
import { type ProjectDetail, projectDetailsData } from '@/lib/mockData/project-details-mock-data'

interface UseProjectDetailsReturn {
  projects: ProjectDetail[];
  loading: boolean;
  getProjectById: (id: string) => ProjectDetail | undefined;
  getProjectsByCategory: (category: string) => ProjectDetail[];
}

export function useProjectDetails(): UseProjectDetailsReturn {
  const [projects, setProjects] = useState<ProjectDetail[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setProjects(projectDetailsData)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const getProjectById = (id: string): ProjectDetail | undefined => {
    return projects.find((project) => project.id === id)
  }

  const getProjectsByCategory = (category: string): ProjectDetail[] => {
    return projects.filter((project) => project.category.toLowerCase().includes(category.toLowerCase()))
  }

  return {
    projects,
    loading,
    getProjectById,
    getProjectsByCategory,
  }
}
