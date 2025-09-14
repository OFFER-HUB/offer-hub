'use client';
import React, { useState } from 'react';
import OnboardingHeader from '@/components/layout/OnboardingHeader';

interface SignInProps {
  email?: string;
  onSignIn: (method: 'apple' | 'google' | 'email', data?: { email: string; password?: string }) => void;
  onRecoverPassword: () => void;
}

const SignIn: React.FC<SignInProps> = ({
  email: initialEmail = '',
  onSignIn,
  onRecoverPassword
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    onSignIn('email', { email: email.trim() });
  };

  const handleSocialSignIn = (method: 'apple' | 'google') => {
    setIsLoading(true);
    onSignIn(method);
  };

  return (
    <div className='min-h-screen bg-[#f6f6f6]'>
      <OnboardingHeader hideSignIn={true} />

      <div className='flex items-center justify-center min-h-[calc(100vh-80px)] p-8'>
        <div
          className='bg-white'
          style={{
            width: '714px',
            height: '700px',
            borderRadius: '12px',
            opacity: 1,
            padding: '60px',
            display: 'flex',
            flexDirection: 'column',
            gap: '45px',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div className='text-center w-full'>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              Welcome back
            </h1>
          </div>

          <div className='w-full flex flex-col items-center'>
            <div className='space-y-3 mb-6'>
              <button
                onClick={() => handleSocialSignIn('apple')}
                disabled={isLoading}
                className='bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative'
                style={{
                  width: '480px',
                  height: '44px',
                  borderRadius: '32px',
                  opacity: 1,
                  gap: '10px',
                  padding: '16px'
                }}
              >
                <div className='absolute left-4 w-8 h-8 bg-white rounded-full flex items-center justify-center'>
                  <svg className='w-5 h-5 text-black' viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z' />
                  </svg>
                </div>
                Apple
              </button>

              <button
                onClick={() => handleSocialSignIn('google')}
                disabled={isLoading}
                className='bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative'
                style={{
                  width: '480px',
                  height: '44px',
                  borderRadius: '32px',
                  opacity: 1,
                  gap: '10px',
                  padding: '16px'
                }}
              >
                <div className='absolute left-4'>
                  <svg className='w-6 h-6' viewBox='0 0 24 24'>
                    <path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
                    <path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
                    <path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' />
                    <path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
                  </svg>
                </div>
                Google
              </button>
            </div>

            <div className='mb-6 flex justify-center'>
              <div
                className='relative flex justify-center text-sm'
                style={{
                  width: '480px'
                }}
              >
                <span className='px-2 bg-white'>Or</span>
              </div>
            </div>

            <form onSubmit={handleEmailSubmit} className='space-y-4'>
              <div>
                <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
                  Email
                </label>
                <input
                  type='email'
                  id='email'
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder='olivia@email.com'
                  className='border border-gray-300 focus:ring-2 focus:ring-[#149A9B] focus:border-transparent outline-none transition-colors'
                  style={{
                    width: '480px',
                    height: '44px',
                    borderRadius: '8px',
                    borderWidth: '1px',
                    opacity: 1,
                    paddingTop: '10px',
                    paddingRight: '14px',
                    paddingBottom: '10px',
                    paddingLeft: '14px',
                    gap: '8px'
                  }}
                  required
                />
              </div>

              <button
                type='submit'
                disabled={isLoading || !email.trim()}
                className='text-white font-medium hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
                style={{
                  width: '480px',
                  height: '44px',
                  borderRadius: '32px',
                  opacity: 1,
                  gap: '10px',
                  padding: '16px',
                  backgroundColor: '#002333'
                }}
              >
                {isLoading && (
                  <svg className='animate-spin -ml-1 mr-2 h-4 w-4 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                  </svg>
                )}
                Sign in
              </button>
            </form>
          </div>

          <div className='text-center w-full flex flex-col items-center'>
            <button
              onClick={onRecoverPassword}
              style={{
                color: '#6D758F',
                fontSize: '12px'
              }}
            >
              New to OfferHub? Create an account.
            </button>

            <div className='mt-4 flex justify-center'>
              <button
                style={{
                  width: '357px',
                  height: '44px',
                  borderRadius: '32px',
                  opacity: 1,
                  gap: '10px',
                  padding: '16px',
                  backgroundColor: '#149A9B',
                  color: 'white',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn; 