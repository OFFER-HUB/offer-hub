'use client';

import ProjectCard from './ProjectCard';
import { completedProjectsMock } from '@/lib/mockData/completed-projects-mock';

export default function CompletedProjectsList() {
  return (
    <div className='max-h-[60vh] overflow-y-auto no-scrollbar pr-1 space-y-4'>
      {completedProjectsMock.map((p) => (
        <ProjectCard
          key={p.id}
          title={p.title}
          freelancerName={p.freelancer.name}
          freelancerAvatar={p.freelancer.avatar}
          dateRange={`${p.startDate} - ${p.endDate}`}
        />
      ))}
    </div>
  );
}


