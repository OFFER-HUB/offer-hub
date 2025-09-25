'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateProjectRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/client/create-project/step-1');
  }, [router]);

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4'></div>
        <p className='text-gray-600'>Redirecting to project creation...</p>
      </div>
    </div>
  );
} 