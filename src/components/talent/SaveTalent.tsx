'use client';

import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface SaveTalentProps {
  talentId: number;
  className?: string;
  size?: 'sm' | 'lg' | 'default' | 'icon';
}

const SaveTalent: React.FC<SaveTalentProps> = ({ 
  talentId, 
  className = '', 
  size = 'sm' 
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved state from localStorage on mount
  useEffect(() => {
    const savedTalents = JSON.parse(localStorage.getItem('savedTalents') || '[]');
    setIsSaved(savedTalents.includes(talentId));
  }, [talentId]);

  const toggleSave = async () => {
    setIsLoading(true);
    
    try {
      const savedTalents = JSON.parse(localStorage.getItem('savedTalents') || '[]');
      
      if (isSaved) {
        // Remove from saved
        const updatedSaved = savedTalents.filter((id: number) => id !== talentId);
        localStorage.setItem('savedTalents', JSON.stringify(updatedSaved));
        setIsSaved(false);
      } else {
        // Add to saved
        const updatedSaved = [...savedTalents, talentId];
        localStorage.setItem('savedTalents', JSON.stringify(updatedSaved));
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving talent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-5 h-5',
    default: 'w-6 h-6',
    lg: 'w-7 h-7',
    icon: 'w-5 h-5'
  };

  const buttonSizeClasses = {
    sm: 'p-2',
    default: 'p-3',
    lg: 'p-4',
    icon: 'p-2'
  };

  return (
    <Button
      variant='ghost'
      size={size}
      onClick={toggleSave}
      disabled={isLoading}
      className={`
        ${buttonSizeClasses[size]}
        ${isSaved 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-400 hover:text-red-500'
        }
        transition-colors duration-200
        ${className}
      `}
      title={isSaved ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart 
        className={`
          ${sizeClasses[size]} 
          transition-all duration-200
          ${isSaved ? 'fill-current' : ''}
          ${isLoading ? 'animate-pulse' : ''}
        `} 
      />
    </Button>
  );
};

export default SaveTalent;