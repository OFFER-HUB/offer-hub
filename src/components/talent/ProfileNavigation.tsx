'use client';

import { Button } from '@/components/ui/button';
import { User, Briefcase } from 'lucide-react';

interface ProfileNavigationProps {
  activeTab: 'profile' | 'portfolio';
  onTabChange: (tab: 'profile' | 'portfolio') => void;
}

export default function ProfileNavigation({ activeTab, onTabChange }: ProfileNavigationProps) {
  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-1'>
      <div className='flex'>
        <Button
          variant={activeTab === 'profile' ? 'default' : 'ghost'}
          className={`flex-1 justify-start gap-2 ${
            activeTab === 'profile' 
              ? 'bg-teal-600 text-white hover:bg-teal-700' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => onTabChange('profile')}
        >
          <User className='w-4 h-4' />
          Profile
        </Button>
        <Button
          variant={activeTab === 'portfolio' ? 'default' : 'ghost'}
          className={`flex-1 justify-start gap-2 ${
            activeTab === 'portfolio' 
              ? 'bg-teal-600 text-white hover:bg-teal-700' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => onTabChange('portfolio')}
        >
          <Briefcase className='w-4 h-4' />
          Portfolio
        </Button>
      </div>
    </div>
  );
}
