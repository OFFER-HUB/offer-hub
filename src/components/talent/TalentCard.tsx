/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React from 'react';
import SaveTalent from '@/components/talent/SaveTalent';

interface Skill {
  name: string;
  color: string;
}

interface TalentCardProps {
  id: number;
  name: string;
  title: string;
  location: string;
  category?: string;
  rating?: number;
  hourlyRate?: number;
  avatar: string;
  skills: Skill[];
  description: string;
  actionText: string;
  onActionClick?: (talentId: number) => void;
  className?: string;
}

const TalentCard: React.FC<TalentCardProps> = ({
  id,
  name,
  title,
  location,
  category,
  rating,
  hourlyRate,
  avatar,
  skills,
  description,
  actionText,
  onActionClick,
  className = ''
}) => {
  const handleActionClick = () => {
    if (onActionClick) {
      onActionClick(id);
    }
  };

  return (
    <div className={`bg-gray-50 border-b border-b-gray-200  p-6 ${className}`}>
      {/* Avatar and Header info in same row */}
      <div className='flex items-start gap-4 mb-4 cursor-pointer profile-section'>
        {/* Avatar */}
        <Image
          src={avatar}
          alt={name}
          width={60}
          height={60}
          className='rounded-full object-cover flex-shrink-0'
        />

        {/* Header info */}
        <div className='flex-1'>
          <div className='flex items-center gap-2 mb-1'>
            <h3 className='text-gray-400 text-sm font-normal'>{name}</h3>
            {/* <span className='text-yellow-500 text-sm'>★ {rating}</span> */}
          </div>
          <h2 className='text-lg font-semibold text-gray-900 leading-tight mb-1'>{title}</h2>
          <div className='flex items-center gap-4 text-sm'>
            <p className='text-teal-600'>{location}</p>
            {/* <p className='text-gray-600'>${hourlyRate}/hr</p>
            <span className='text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full'>{category}</span> */}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className='flex flex-wrap gap-2 mb-4'>
        {skills.map((skill, index) => (
          <span
            key={index}
            className={`px-3 py-1 rounded-full text-sm font-medium text-white ${skill.color} ${index == 0 && "bg-slate-500"}`}
          >
            {skill.name}
          </span>
        ))}
      </div>

      {/* Description */}
      <p className='text-gray-600 text-sm mb-6 leading-relaxed'>
        {description}
      </p>

      {/* Action Buttons Row */}
      <div className='flex items-center gap-4'>
        <SaveTalent talentId={id} size='lg' />
        <Button
          onClick={handleActionClick}
          className='bg-slate-800 hover:bg-slate-700 text-white rounded-full flex-1 py-3 font-medium'
        >
          {actionText}
        </Button>
      </div>
    </div>
  );
};

export default TalentCard;