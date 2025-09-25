'use client';

import { User } from '@/types/user.types';

interface ProfileDetailsProps {
  user: User | null;
  isLoading?: boolean;
}

export default function ProfileDetails({ user, isLoading }: ProfileDetailsProps) {
  if (isLoading) {
    return (
      <div className='w-full'>
        <div className='mb-6'>
          <h3 className='text-base font-semibold text-gray-800 mb-3'>
            Personal Information
          </h3>
          <div className='animate-pulse'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
              <div className='space-y-1.5'>
                <div className='h-4 bg-gray-200 rounded w-16'></div>
                <div className='h-9 bg-gray-200 rounded'></div>
              </div>
              <div className='space-y-1.5'>
                <div className='h-4 bg-gray-200 rounded w-20'></div>
                <div className='h-9 bg-gray-200 rounded'></div>
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
              <div className='space-y-1.5'>
                <div className='h-4 bg-gray-200 rounded w-16'></div>
                <div className='h-9 bg-gray-200 rounded'></div>
              </div>
              <div className='space-y-1.5'>
                <div className='h-4 bg-gray-200 rounded w-24'></div>
                <div className='h-9 bg-gray-200 rounded'></div>
              </div>
            </div>
            <div className='mb-4 space-y-1.5'>
              <div className='h-4 bg-gray-200 rounded w-8'></div>
              <div className='h-20 bg-gray-200 rounded'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full'>
      <div className='mb-6'>
        <h3 className='text-base font-semibold text-gray-800 mb-3'>
          Personal Information
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
          <div className='space-y-1.5'>
            <label
              htmlFor='fullName'
              className='block text-xs font-medium text-gray-600'
            >
              Full Name
            </label>
            <input
              id='fullName'
              type='text'
              value={user?.name || 'Not provided'}
              readOnly
              className='w-full h-9 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none'
            />
          </div>

          <div className='space-y-1.5'>
            <label
              htmlFor='email'
              className='block text-xs font-medium text-gray-600'
            >
              Email Address
            </label>
            <input
              id='email'
              type='email'
              value={user?.email || 'Not provided'}
              readOnly
              className='w-full h-9 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none'
            />
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
          <div className='space-y-1.5'>
            <label
              htmlFor='username'
              className='block text-xs font-medium text-gray-600'
            >
              Username
            </label>
            <input
              id='username'
              type='text'
              value={user?.username || 'Not provided'}
              readOnly
              className='w-full h-9 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none'
            />
          </div>

          <div className='space-y-1.5'>
            <label
              htmlFor='walletAddress'
              className='block text-xs font-medium text-gray-600'
            >
              Wallet Address
            </label>
            <input
              id='walletAddress'
              type='text'
              value={user?.wallet_address || 'Not provided'}
              readOnly
              className='w-full h-9 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none font-mono text-xs'
            />
          </div>
        </div>

        <div className='mb-4 space-y-1.5'>
          <label
            htmlFor='bio'
            className='block text-xs font-medium text-gray-600'
          >
            Bio
          </label>
          <textarea
            id='bio'
            readOnly
            className='w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-800 resize-none min-h-[60px] focus:outline-none'
            value={user?.bio || 'No bio provided'}
          ></textarea>
        </div>

        <div className='space-y-1.5'>
          <label className='block text-xs font-medium text-gray-600'>
            User Type
          </label>
          <div className='flex'>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-normal border ${
              user?.is_freelancer 
                ? 'bg-blue-100 text-blue-800 border-blue-200' 
                : 'bg-green-100 text-green-800 border-green-200'
            }`}>
              {user?.is_freelancer ? 'Freelancer' : 'Client'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
