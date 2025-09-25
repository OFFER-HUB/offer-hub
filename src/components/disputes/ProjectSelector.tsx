'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { getActiveProjects } from '@/lib/mockData/projects-mock';

interface ProjectSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function ProjectSelector({ value, onChange, error }: ProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const projects = getActiveProjects();

  const selectedProject = projects.find(project => project.id === value);

  const handleSelect = (projectId: string) => {
    onChange(projectId);
    setIsOpen(false);
  };

  return (
    <div className='relative'>
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 text-left bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <div className='flex items-center justify-between'>
          <span className={selectedProject ? 'text-gray-900' : 'text-gray-500'}>
            {selectedProject ? selectedProject.title : 'Choose client'}
          </span>
          <ChevronDown 
            className={`h-4 w-4 text-gray-400 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`} 
          />
        </div>
      </button>

      {isOpen && (
        <div className='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg'>
          <div className='py-1 max-h-60 overflow-auto'>
            {projects.map((project) => (
              <button
                key={project.id}
                type='button'
                onClick={() => handleSelect(project.id)}
                className={`w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                  value === project.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                }`}
              >
                <div>
                  <div className='font-medium'>{project.title}</div>
                  <div className='text-sm text-gray-500 mt-1'>
                    Client: {project.client.name} • Budget: {project.budget}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className='mt-1 text-sm text-red-500'>{error}</p>
      )}
    </div>
  );
}