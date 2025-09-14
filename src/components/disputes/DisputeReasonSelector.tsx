'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { disputeReasons } from '@/lib/mockData/dispute-reasons-mock';

interface DisputeReasonSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function DisputeReasonSelector({ value, onChange, error }: DisputeReasonSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedReason = disputeReasons.find(reason => reason.id === value);

  const handleSelect = (reasonId: string) => {
    onChange(reasonId);
    setIsOpen(false);
  };

  return (
    <div className='relative'>
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 text-left bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <div className='flex items-center justify-between'>
          <span className={selectedReason ? 'text-gray-900' : 'text-gray-500'}>
            {selectedReason ? selectedReason.label : 'What is the reason for dispute'}
          </span>
          <ChevronDown 
            className={`h-4 w-4 text-gray-400 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`} 
          />
        </div>
      </button>

      {isOpen && (
        <div className='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg'>
          <div className='py-1 max-h-60 overflow-auto'>
            {disputeReasons.map((reason) => (
              <button
                key={reason.id}
                type='button'
                onClick={() => handleSelect(reason.id)}
                className={`w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                  value === reason.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                }`}
              >
                <div>
                  <div className='font-medium'>{reason.label}</div>
                  {reason.description && (
                    <div className='text-sm text-gray-500 mt-1'>{reason.description}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className='mt-1 text-sm text-red-500'>{error}</p>
      )}
    </div>
  );
}