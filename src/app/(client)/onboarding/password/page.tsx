'use client';

import { Suspense } from 'react';
import { PasswordForm } from '@/components/auth/PasswordForm';
import { AuthHeader } from '@/components/auth/AuthHeader';

function PasswordPageContent() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <AuthHeader />
      <div className='flex items-center justify-center p-4 pt-16'>
        <div className='w-full max-w-md'>
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}

export default function PasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PasswordPageContent />
    </Suspense>
  );
}
