'use client';
import React from 'react';

interface RoleSelectorProps {
  email: string;
  onRoleSelect: (role: 'freelancer' | 'client') => void;
  className?: string;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ 
  email, 
  onRoleSelect, 
  className = '' 
}) => {
  return (
    <div className={`mb-6 p-4 rounded-md bg-[#F1F3F7] ${className}`}>
      <p className='text-black text-[10px] mb-4'>
        Looks like{' '}
        <span className='font-bold text-gray-800'>{email}</span>{' '}
        isn't linked to an account. But hey – that's an easy fix! Are you here to hire or get hired?
      </p>
      <div className='flex gap-3'>
        <button
          onClick={() => onRoleSelect('freelancer')}
          className='flex-1 bg-[#002333] h-1/2 text-white py-2 px-4 rounded-full font-medium hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#19213D] focus:ring-offset-2'
          type='button'
        >
          Freelancer
        </button>
        <button
          onClick={() => onRoleSelect('client')}
          className='flex-1 bg-[#002333] text-white py-2 px-4 rounded-full font-medium hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#19213D] focus:ring-offset-2'
          type='button'
        >
          Client
        </button>
      </div>
    </div>
  );
};

export default RoleSelector;