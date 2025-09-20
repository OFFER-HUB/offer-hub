/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import SaveTalent from '@/components/talent/SaveTalent';
import { Button } from '@/components/ui/button';

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

  const getActionLink = () => {
    switch (actionText.toLowerCase()) {
      case "message":
        return `/talent/${id}/messages`;
      case "hire now":
        return `/talent/${id}/send-offer`;
      default:
        return `/talent/${id}`;
    }
  };

  return (
    <div className={`bg-gray-50 border-b border-b-gray-200 p-6 ${className}`}>
      {/* Avatar and Header info */}
      <div className='flex items-start gap-4 mb-4 profile-section'>
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
          </div>
          {/* Title linking to profile */}
          <Link href={`/talent/${id}/profile`}>
            <h2 className='text-lg font-semibold text-gray-900 leading-tight mb-1 hover:underline cursor-pointer'>
              {title}
            </h2>
          </Link>
          <div className='flex items-center gap-4 text-sm'>
            <p className='text-teal-600'>{location}</p>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className='flex flex-wrap gap-2 mb-4'>
        {skills.map((skill, index) => (
          <span
            key={index}
            className={`px-3 py-1 rounded-full text-sm font-medium text-white ${skill.color} ${index === 0 && "bg-slate-500"}`}
          >
            {skill.name}
          </span>
        ))}
      </div>

      {/* Description */}
      <p className='text-gray-600 text-sm mb-6 leading-relaxed'>
        {description}
      </p>

      {/* Action Buttons */}
      <div className='flex items-center gap-4'>
        <SaveTalent talentId={id} size='lg' />
        <Link href={getActionLink()} className='flex-1'>
          <Button className='w-full bg-slate-800 hover:bg-slate-700 text-white rounded-full py-3 font-medium'>
            {actionText}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default TalentCard;