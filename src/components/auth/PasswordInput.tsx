'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function PasswordInput({
  value,
  onChange,
  disabled,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='space-y-2'>
      <Label htmlFor='password' className='text-sm font-medium text-gray-700'>
        Enter password
      </Label>
      <div className='relative'>
        <Input
          id='password'
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className='pr-12 py-3 border-gray-300 focus:border-slate-500 focus:ring-slate-500'
          placeholder='••••••••'
          required
        />
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent'
          onClick={togglePasswordVisibility}
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff className='h-4 w-4 text-gray-500' />
          ) : (
            <Eye className='h-4 w-4 text-gray-500' />
          )}
          <span className='sr-only'>
            {showPassword ? 'Hide password' : 'Show password'}
          </span>
        </Button>
      </div>
    </div>
  );
}
