'use client';

import type React from 'react';

import { useState } from 'react'
import { TIMEOUTS } from '@/constants/magic-numbers';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PasswordInput } from './PasswordInput';
import { RememberMeCheckbox } from './RememberMeCheckbox';
import Link from 'next/link';

export function PasswordForm() {
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get('email') || 'AdebayoDoe@yahoo.com';

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, TIMEOUTS.API_DELAY_EXTRA_LONG));
      console.log('Sign in attempt:', { email, password, keepLoggedIn });

      router.push('/dashboard');
    } catch (error) {
      console.error('Sign in failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='border-0 shadow-lg'>
      <CardContent className='p-8'>
        <div className='text-center mb-8'>
          <h1 className='text-2xl font-semibold text-gray-900 mb-2'>
            Welcome back
          </h1>
          <p className='text-sm text-gray-600'>@{email}</p>
        </div>

        <form onSubmit={handleSignIn} className='space-y-6'>
          <PasswordInput
            value={password}
            onChange={setPassword}
            disabled={isLoading}
          />

          <RememberMeCheckbox
            checked={keepLoggedIn}
            onChange={setKeepLoggedIn}
            disabled={isLoading}
          />

          <div className='flex justify-center'>
            <Button
              type='submit'
              className='w-[20rem] bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-full font-medium'
              disabled={isLoading || !password}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>

          <div className='text-center'>
            <Link
              href='/onboarding/forgot-password'
              className='text-sm text-red-500 hover:text-red-600 font-medium'
            >
              Forgot password?
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
