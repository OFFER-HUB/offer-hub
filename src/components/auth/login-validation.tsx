'use client';

import React, { useState } from 'react';
import { useAuthValidation } from '@/hooks/use-auth-validation';
import ValidationError from './validation-error';

interface LoginValidationProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

const LoginValidation: React.FC<LoginValidationProps> = ({ onLogin }) => {
  const { state, onFieldChange, onLogin: handleLogin } = useAuthValidation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email') setEmail(value);
    else setPassword(value);
    onFieldChange(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(email, password, onLogin);
  };

  const isDisabled =
    !state.formValid ||
    state.loading ||
    !!(
      state.rateLimit &&
      state.rateLimit.nextAllowed &&
      Date.now() < state.rateLimit.nextAllowed.getTime()
    );

  return (
    <form
      onSubmit={handleSubmit}
      aria-describedby='login-error'
      className='space-y-4'
    >
      <div>
        <label htmlFor='email' className='block font-medium'>
          Email{' '}
          <span className='text-red-500' aria-hidden='true'>
            *
          </span>
        </label>
        <input
          id='email'
          name='email'
          type='email'
          autoComplete='username'
          className={`w-full border rounded px-3 py-2 mt-1 focus:outline-none ${
            state.email.valid
              ? 'border-green-500'
              : state.email.error
              ? 'border-red-500'
              : 'border-gray-300'
          }`}
          value={email}
          onChange={(e) => handleChange('email', e.target.value)}
          aria-invalid={!state.email.valid}
          aria-describedby={state.email.error ? 'email-error' : undefined}
          required
        />
        <ValidationError error={state.email.error} id='email-error' />
      </div>
      <div>
        <label htmlFor='password' className='block font-medium'>
          Password{' '}
          <span className='text-red-500' aria-hidden='true'>
            *
          </span>
        </label>
        <input
          id='password'
          name='password'
          type='password'
          autoComplete='current-password'
          className={`w-full border rounded px-3 py-2 mt-1 focus:outline-none ${
            state.password.valid
              ? 'border-green-500'
              : state.password.error
              ? 'border-red-500'
              : 'border-gray-300'
          }`}
          value={password}
          onChange={(e) => handleChange('password', e.target.value)}
          aria-invalid={!state.password.valid}
          aria-describedby={state.password.error ? 'password-error' : undefined}
          required
        />
        <ValidationError error={state.password.error} id='password-error' />
      </div>
      {state.errorMessage && (
        <ValidationError error={state.errorMessage} id='login-error' />
      )}
      <button
        type='submit'
        className='w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50 flex items-center justify-center'
        disabled={isDisabled}
        aria-busy={state.loading}
      >
        {state.loading ? (
          <span className='loader mr-2' aria-label='Loading' />
        ) : null}
        Log In
      </button>
      {state.rateLimit &&
        state.rateLimit.nextAllowed &&
        Date.now() < state.rateLimit.nextAllowed.getTime() && (
          <div className='text-yellow-600 text-sm mt-2' role='status'>
            Too many failed attempts. Try again in{' '}
            {Math.ceil(
              (state.rateLimit.nextAllowed.getTime() - Date.now()) / 1000,
            )}
            s.
          </div>
        )}
    </form>
  );
};

export default LoginValidation;
