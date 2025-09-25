'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Clock } from 'lucide-react';
import { PortfolioProject } from '@/lib/mockData/portfolio-mock-data';

interface PortfolioGalleryProps {
  projects: PortfolioProject[];
  onProjectClick?: (project: PortfolioProject) => void;
}

export default function PortfolioGallery({ projects, onProjectClick }: PortfolioGalleryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-gray-900'>Portfolio Projects</h2>
        <Badge variant='outline' className='text-sm'>
          {projects.length} projects
        </Badge>
      </div>
      
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {projects.map((project) => (
          <Card 
            key={project.id} 
            className='overflow-hidden hover:shadow-md transition-shadow cursor-pointer'
            onClick={() => onProjectClick?.(project)}
          >
            <div className='aspect-video bg-gray-100 relative overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center'>
                <div className='text-white text-center'>
                  <div className='text-2xl font-bold'>{project.title.split(' ')[0]}</div>
                  <div className='text-sm opacity-90'>{project.category}</div>
                </div>
              </div>
              <div className='absolute top-3 right-3'>
                <Badge variant='secondary' className='bg-white/90 text-gray-900'>
                  ${project.projectValue.toLocaleString()}
                </Badge>
              </div>
            </div>
            
            <CardContent className='p-4'>
              <div className='space-y-3'>
                <div>
                  <h3 className='font-semibold text-gray-900 mb-1'>
                    {project.title}
                  </h3>
                  <p className='text-sm text-gray-600 line-clamp-2'>
                    {project.description}
                  </p>
                </div>
                
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-xs text-gray-500'>
                    <div className='flex items-center gap-1'>
                      <Calendar className='w-3 h-3' />
                      {formatDate(project.completionDate)}
                    </div>
                    <div className='flex items-center gap-1'>
                      <Clock className='w-3 h-3' />
                      {project.duration}
                    </div>
                  </div>
                  
                  <div className='flex items-center justify-between text-xs text-gray-500'>
                    <span>Client: {project.clientName}</span>
                    <div className='flex items-center gap-1'>
                      <DollarSign className='w-3 h-3' />
                      {project.projectValue.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className='flex flex-wrap gap-1'>
                  {project.technologies.slice(0, 3).map((tech) => (
                    <Badge key={tech} variant='outline' className='text-xs'>
                      {tech}
                    </Badge>
                  ))}
                  {project.technologies.length > 3 && (
                    <Badge variant='outline' className='text-xs'>
                      +{project.technologies.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {projects.length === 0 && (
        <div className='text-center py-12'>
          <div className='text-gray-400 text-lg font-medium'>No portfolio projects yet</div>
          <p className='text-gray-500 text-sm mt-2'>
            This freelancer hasn't added any portfolio projects yet.
          </p>
        </div>
      )}
    </div>
  );
}
