'use client';

import { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';

interface CreateProjectLayoutProps {
  children: ReactNode;
  onBack?: () => void;
}

export function CreateProjectLayout({ children, onBack }: CreateProjectLayoutProps) {
  return (
    <div className='flex-1 overflow-y-auto'>
      {/* Header with white background */}
      <div className='bg-white border-b border-gray-200 py-4 px-6'>
        <div className='max-w-4xl mx-auto flex items-center justify-between'>
          {onBack ? (
            <button
              onClick={onBack}
              className='flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors'
              style={{ fontSize: '28px' }}
            >
              <ChevronLeft size={28} />
              <span>Back</span>
            </button>
          ) : (
            <div className='w-20'></div>
          )}
          <h1 className='text-base font-semibold text-gray-900'>Create project</h1>
          <div className='w-20'></div>
        </div>
      </div>

      {/* Main content */}
      <div className='px-6 py-4'>
        <div className='max-w-4xl mx-auto flex flex-col items-center'>
          {children}
        </div>
      </div>
    </div>
  );
} 