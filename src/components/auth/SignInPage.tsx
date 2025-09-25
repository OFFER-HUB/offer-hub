'use client';

import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import SignInForm from '@/components/auth/SignInForm';
import { OAuthButton } from './OAuthButton';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { useAuthApi } from '@/hooks/api-connections/use-auth-api';
import { useCallback } from 'react';

export function SignInPage() {
  const { registerUser, isLoading, error, clearError } = useAuthApi();

  const handleRegister = useCallback(async (payload: Parameters<typeof registerUser>[0]) => {
    await registerUser(payload);
  }, [registerUser]);

  return (
    <div className='min-h-screen bg-muted flex flex-col'>
      <AuthHeader />
      <div className='flex flex-col items-center justify-start flex-1 px-4 pt-8'>
        <Card className='w-full max-w-md p-6 shadow-lg'>
          <h1 className='text-2xl font-semibold text-center mb-6'>
            Welcome back
          </h1>
          <div className='space-y-4'>
            <OAuthButton
              icon={<FaApple />}
              label='Sign in with Apple'
              onClick={() => { }}
            />
            <OAuthButton
              icon={<FcGoogle />}
              label='Sign in with Google'
              onClick={() => { }}
            />
          </div>
          <div className='flex items-center my-6'>
            <Separator className='flex-1' />
            <span className='mx-4 text-muted-foreground text-sm font-medium'>
              Or
            </span>
            <Separator className='flex-1' />
          </div>
          <SignInForm
            onSignIn={() => { }}
            onRegister={handleRegister}
            isRegistering={isLoading}
            backendError={error?.message || null}
          />
          <div className='mt-8 text-center text-sm'>
            Don&apos;t have an account?{' '}
            <a href='#' className='text-primary font-medium hover:underline'>
              Sign up
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
