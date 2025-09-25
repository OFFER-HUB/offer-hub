'use client';
import React from 'react';
import OnboardingHeader from '@/components/layout/OnboardingHeader';

interface CheckEmailProps {
  email?: string;
  onBackToSignIn: () => void;
}

const CheckEmail: React.FC<CheckEmailProps> = ({
  email: _email,
  onBackToSignIn
}) => {
  return (
    <div className='min-h-screen bg-[#f6f6f6]'>
      <OnboardingHeader hideSignIn={true} />
      <div className='flex items-center justify-center min-h-[calc(100vh-80px)] p-8'>
        <div
          className='bg-white'
          style={{
            width: '714px',
            height: '450px',
            borderRadius: '12px',
            opacity: 1,
            padding: '60px',
            display: 'flex',
            flexDirection: 'column',
            gap: '25px',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div className='inline-block'>
            <img
              src='/emailicon.jpg'
              alt='Email icon'
              style={{
                width: '155px',
                height: '155px',
                opacity: 1
              }}
            />
          </div>

          <h1 className='text-2xl font-bold text-gray-900 text-center'>
            Check your email
          </h1>

          <p className='text-gray-600 text-center'>
            We've sent an email with the next steps, check your inbox and follow along.
          </p>

          <div className='flex justify-center'>
            <button
              onClick={onBackToSignIn}
              className='text-white font-medium hover:bg-teal-600 transition-colors flex items-center justify-center'
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
              Return to login
            </button>
          </div>


        </div>
      </div>
    </div>
  );
};

export default CheckEmail; 