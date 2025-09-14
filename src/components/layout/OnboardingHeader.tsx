'use client';
import React from 'react';
import Image from 'next/image';

interface OnboardingHeaderProps {
  onSignUp?: () => void;
  onSignIn?: () => void;
  showButtons?: boolean;
  hideSignIn?: boolean;
}

const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ 
  onSignUp, 
  onSignIn, 
  showButtons = true,
  hideSignIn = false
}) => {
  return (
    <header className='flex items-center justify-between px-6 py-4 bg-white'>
      <div className='flex items-center space-x-2'>
        <Image 
          src='/dark_logo.svg' 
          alt='OfferHub Logo' 
          width={112}
          height={56}
          className='h-14 w-auto'
        />
        <span className='text-gray-800 font-semibold text-2xl'>OfferHub</span>
      </div>

      {showButtons && (
        <div className='flex items-center space-x-3'>
                    <button
            onClick={onSignUp}
            className='text-white font-medium hover:bg-[#001a26] transition-colors flex items-center justify-center'
            style={{
              width: '150px',
              height: '44px',
              borderRadius: '28px',
              backgroundColor: '#002333',
              paddingTop: '10px',
              paddingRight: '16px',
              paddingBottom: '10px',
              paddingLeft: '16px',
              gap: '10px'
            }}
          >
            Sign up
          </button>
          
          {!hideSignIn && (
            <button
              onClick={onSignIn}
              className='bg-white text-[#002333] font-medium hover:bg-gray-50 transition-colors flex items-center justify-center'
              style={{
                width: '150px',
                height: '44px',
                borderRadius: '28px',
                border: '1px solid #002333',
                paddingTop: '10px',
                paddingRight: '16px',
                paddingBottom: '10px',
                paddingLeft: '16px',
                gap: '10px'
              }}
            >
              Sign in
            </button>
          )}
            
            <button className='p-2 text-gray-600 hover:text-gray-800 transition-colors'>
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
            </svg>
          </button>
        </div>
      )}
    </header>
  );
};

export default OnboardingHeader; 