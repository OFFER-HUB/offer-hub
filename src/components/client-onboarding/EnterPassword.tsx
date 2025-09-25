'use client';
import React, { useState } from 'react';
import OnboardingHeader from '@/components/layout/OnboardingHeader';

interface EnterPasswordProps {
  email?: string;
  onPasswordSubmit: (password: string) => void;
  onRecoverPassword: () => void;
  onBack?: () => void;
}

const EnterPassword: React.FC<EnterPasswordProps> = ({
  email,
  onPasswordSubmit,
  onRecoverPassword,
  onBack
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    
    setIsLoading(true);
    onPasswordSubmit(password);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='min-h-screen bg-[#f6f6f6]'>
      <style jsx>{`
        input[type="password"] {
          -webkit-text-security: disc;
          text-security: disc;
        }
      `}</style>
      
      <OnboardingHeader hideSignIn={true} />

      <div className='flex items-center justify-center min-h-[calc(100vh-80px)] p-8'>
        <div 
          className='bg-white'
          style={{
            width: '714px',
            height: '395px',
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
            {email && (
              <p className='text-gray-600'>
                {email}
              </p>
            )}
          </div>

          <div className='w-full flex flex-col items-center'>
            <form onSubmit={handleSubmit} className='space-y-6 w-full max-w-md'>
              <div>
                <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-2'>
                  Enter password
                </label>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Enter your password'
                    className='border border-gray-300 focus:ring-2 focus:ring-[#149A9B] focus:border-transparent outline-none transition-colors pr-12'
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
                  <button
                    type='button'
                    onClick={togglePasswordVisibility}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                  >
                    {showPassword ? (
                      <svg className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                        <path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24'/>
                        <line x1='1' y1='1' x2='23' y2='23'/>
                      </svg>
                    ) : (
                      <svg className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                        <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'/>
                        <circle cx='12' cy='12' r='3'/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className='flex items-center'>
                <input
                  type='checkbox'
                  id='keepLoggedIn'
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  className='h-4 w-4 text-[#149A9B] focus:ring-[#149A9B] border-gray-300 rounded'
                />
                <label htmlFor='keepLoggedIn' className='ml-2 block text-sm text-gray-700'>
                  Keep me Logged in
                </label>
              </div>

                          <div className='flex justify-center'>
                            <button
                              type='submit'
                              disabled={isLoading || !password.trim()}
                              className='text-white font-medium hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
                              style={{
                                width: '361px',
                                height: '44px',
                                borderRadius: '32px',
                                opacity: 1,
                                gap: '10px',
                                padding: '16px',
                                backgroundColor: '#19213D'
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
                          </div>

                          <div className='text-center'>
                            <button
                              type='button'
                              onClick={onRecoverPassword}
                              className='text-red-500 hover:text-red-600 text-sm font-medium'
                            >
                              Forgot password?
                            </button>
                          </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterPassword; 