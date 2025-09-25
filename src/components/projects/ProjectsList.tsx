'use client'

import { ProjectCard } from '@/components/projects/ProjectCard'
import { MoreHorizontal } from 'lucide-react'
import type { Project } from '@/lib/mockData/projects-list-mock'

interface ProjectsListProps {
  projects: Project[]
}

export function ProjectsList({ projects }: ProjectsListProps) {
  if (projects.length === 0) {
    return (
      <div className='rounded-lg border bg-white p-6 text-center text-slate-500'>
        No items to display.
      </div>
    )
  }

  return (
    <>
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          title={project.title}
          person={project.person}
          date={project.date}
          avatarSrc={project.avatarSrc}
          menuIcon={<MoreHorizontal className='h-4 w-4 text-slate-500' aria-hidden='true' />}
        />
      ))}
    </>
  )
}

