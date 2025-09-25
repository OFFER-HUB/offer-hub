'use client';
import React, { useState } from 'react';
import OnboardingHeader from '@/components/layout/OnboardingHeader';

interface ResetPasswordProps {
  onResetPassword: (newPassword: string) => void;
  onBack: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({
  onResetPassword,
  onBack: _onBack
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = {
    length: password.length >= 8,
    characters: /[A-Za-z0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const isStrong = passwordStrength.length && passwordStrength.characters && passwordStrength.special;
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStrong || !passwordsMatch) return;
    
    setIsLoading(true);
    onResetPassword(password);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className='min-h-screen bg-[#f6f6f6]'>
      <OnboardingHeader hideSignIn={true} />
      <div className='flex items-center justify-center min-h-[calc(100vh-80px)] p-8'>
        <div
          className='bg-white'
          style={{
            width: '714px',
            height: '561.4993896484375px',
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
              Reset your password
            </h1>
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
                    placeholder='Enter your new password'
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

                <div className='mt-2'>
                  <div className='flex items-center text-sm'>
                    <span className='text-gray-600'>Strength: </span>
                    <span className={`ml-1 font-semibold ${isStrong ? 'text-green-600' : 'text-gray-600'}`}>
                      {isStrong ? 'Strong' : 'Weak'}
                    </span>
                  </div>
                  <div className='mt-2 space-y-1'>
                    <div className='flex items-center text-xs'>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${passwordStrength.length ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                        {passwordStrength.length ? '✓' : ''}
                      </span>
                      <span className={passwordStrength.length ? 'text-green-600' : 'text-gray-500'}>
                        At least 8 characters.
                      </span>
                    </div>
                    <div className='flex items-center text-xs'>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${passwordStrength.characters ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                        {passwordStrength.characters ? '✓' : ''}
                      </span>
                      <span className={passwordStrength.characters ? 'text-green-600' : 'text-gray-500'}>
                        At least one uppercase, lowercase characters or numbers
                      </span>
                    </div>
                    <div className='flex items-center text-xs'>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${passwordStrength.special ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                        {passwordStrength.special ? '✓' : ''}
                      </span>
                      <span className={passwordStrength.special ? 'text-green-600' : 'text-gray-500'}>
                        At least one special characters
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor='confirmPassword' className={`block text-sm font-medium mb-2 ${!passwordsMatch && confirmPassword.length > 0 ? 'text-red-600' : 'text-gray-700'}`}>
                  Enter password again
                </label>
                <div className='relative'>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id='confirmPassword'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='Confirm your new password'
                    className={`border focus:ring-2 focus:ring-[#149A9B] focus:border-transparent outline-none transition-colors pr-12 ${
                      !passwordsMatch && confirmPassword.length > 0 ? 'border-red-500' : 'border-gray-300'
                    }`}
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
                    onClick={toggleConfirmPasswordVisibility}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                  >
                    {showConfirmPassword ? (
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
                {!passwordsMatch && confirmPassword.length > 0 && (
                  <p className='mt-1 text-xs text-red-600'>Password mis-match.</p>
                )}
              </div>

              <button
                type='submit'
                disabled={isLoading || !isStrong || !passwordsMatch}
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
                Change password
              </button>
            </form>
          </div>


        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 