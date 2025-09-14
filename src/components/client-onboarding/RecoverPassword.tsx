'use client';
import React, { useState } from 'react';
import OnboardingHeader from '@/components/layout/OnboardingHeader';

interface RecoverPasswordProps {
  email?: string;
  onRecoverPassword: (email: string) => void;
  onBack: () => void;
}

const RecoverPassword: React.FC<RecoverPasswordProps> = ({
  email: initialEmail = '',
  onRecoverPassword,
  onBack
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsLoading(true);
    onRecoverPassword(email.trim());
  };

  return (
    <div className='min-h-screen bg-[#f6f6f6]'>
      <OnboardingHeader hideSignIn={true} />
      <div className='flex items-center justify-center min-h-[calc(100vh-80px)] p-8'>
        <div
          className='bg-white'
          style={{
            width: '714px',
            height: '433px',
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
              Recover your password
            </h1>
            <p className='text-gray-600'>
              Enter the email address or username associated with your OfferHub account.
            </p>
          </div>

          <div className='w-full flex flex-col items-center'>
            <form onSubmit={handleSubmit} className='space-y-6 w-full max-w-md'>
              <div>
                <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
                  Email
                </label>
                <input
                  type='email'
                  id='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

              <div className='space-y-3 flex flex-col items-center'>
                <div className='flex justify-center'>
                  <button
                    type='submit'
                    disabled={isLoading || !email.trim()}
                    className='text-white font-medium hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
                    style={{
                      width: '361px',
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
                    Continue
                  </button>
                </div>
                
                <div className='flex justify-center'>
                  <button
                    type='button'
                    onClick={onBack}
                    disabled={isLoading}
                    className='text-white font-medium hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
                    style={{
                      width: '361px',
                      height: '44px',
                      borderRadius: '32px',
                      opacity: 1,
                      gap: '10px',
                      padding: '16px',
                      backgroundColor: '#149A9B'
                    }}
                  >
                    Back
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecoverPassword; 