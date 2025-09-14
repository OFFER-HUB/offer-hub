'use client';

import { AuthHeader } from '@/components/auth/AuthHeader';
import { ClientSidebar } from '@/components/client-dashboard/Sidebar';
import { ReactNode } from 'react';

export default function ClientCreateProjectLayout({ children }: { children: ReactNode }) {
  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      <div className='w-full border-b border-gray-200 bg-white relative z-10'>
        <AuthHeader />
      </div>
      <div className='flex flex-1 min-h-0'>
        <div className='w-64 border-r border-gray-200 bg-white flex flex-col justify-between'>
          <ClientSidebar />
        </div>
        <div className='flex-1 overflow-y-auto'>{children}</div>
      </div>
    </div>
  );
} 