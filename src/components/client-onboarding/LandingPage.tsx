'use client';
import React from 'react';
import OnboardingHeader from '@/components/layout/OnboardingHeader';

interface LandingPageProps {
  onAction: (action: 'sign-up' | 'sign-in') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAction }) => {
  return (
    <div className='min-h-screen bg-[#f6f6f6]'>
      <OnboardingHeader 
        onSignUp={() => onAction('sign-up')}
        onSignIn={() => onAction('sign-in')}
      />

      <div className='flex items-center justify-center min-h-[calc(100vh-80px)]'>
        <div 
          className='bg-white'
          style={{
            width: '714px',
            height: '579px',
            paddingRight: '60px',
            paddingBottom: '60px',
            paddingLeft: '60px',
            display: 'flex',
            flexDirection: 'column',
            gap: '45px',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <h1 className='text-6xl font-bold mb-2'>
            <span className='text-gray-800'>Hire Or</span>
            <br />
            <span className='text-[#149A9B]'>Get Hired.</span>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 