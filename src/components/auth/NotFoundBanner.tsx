'use client';
import React from 'react';

interface NotFoundBannerProps {
  email: string;
  className?: string;
  variant?: 'info' | 'warning' | 'error';
}

const NotFoundBanner: React.FC<NotFoundBannerProps> = ({ 
  email, 
  className = '',
  variant = 'info'
}) => {
  const variantStyles = {
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-[#002333]',
      title: 'text-[#002333]',
      text: 'text-[#002333]'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-400',
      title: 'text-yellow-800',
      text: 'text-yellow-700'
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-400',
      title: 'text-red-800',
      text: 'text-red-700'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={`${styles.container} border rounded-lg p-4 mb-6 ${className}`}>
      <div className='flex items-start'>
        <div className='flex-shrink-0'>
          <svg 
            className={`h-5 w-5 ${styles.icon}`} 
            viewBox='0 0 20 20' 
            fill='currentColor'
            aria-hidden='true'
          >
            <path 
              fillRule='evenodd' 
              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' 
              clipRule='evenodd' 
            />
          </svg>
        </div>
        <div className='ml-3 flex-1'>
          <h3 className={`text-sm font-medium ${styles.title}`}>
            Account not found
          </h3>
          <div className={`mt-1 text-sm ${styles.text}`}>
            <p>
              No account is linked to{' '}
              <span className='font-medium'>{email}</span>.{' '}
              Would you like to create one?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundBanner;