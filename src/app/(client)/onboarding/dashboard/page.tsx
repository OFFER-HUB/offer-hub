'use client';

import { DashboardEmptyState } from '@/components/client-dashboard/DashboardEmptyState.tsx';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function DashboardPage() {
  const [hasJobsOrContracts] = useState(false);

  return (
    <>
      <div className='w-full border-b border-gray-200 bg-white py-3 text-center mb-6'>
        <h1 className='text-sm font-semibold text-gray-800'>Dashboard</h1>
      </div>

      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-medium text-gray-800'>
          Good Morning John Doe
        </h2>
        <Button className='bg-teal-600 hover:bg-teal-700 text-white'>
          <Plus className='w-4 h-4 mr-2' />
          Post Job
        </Button>
      </div>

      {hasJobsOrContracts ? (
        <div className='p-6 rounded-md bg-white shadow-sm'>
          <p>Dashboard content with jobs/contracts would go here</p>
        </div>
      ) : (
        <DashboardEmptyState />
      )}
    </>
  );
}
