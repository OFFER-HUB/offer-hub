'use client';
import React from 'react';
import Image from 'next/image';

interface AvatarPreviewProps {
  src: string;
  alt?: string;
}

export default function AvatarPreview({ src, alt = 'Avatar Preview' }: AvatarPreviewProps) {
  return (
    <div className='overflow-hidden rounded-full border-2 border-gray-300 w-40 h-40 flex items-center justify-center bg-white'>
      <Image
        src={src}
        alt={alt}
        width={160}
        height={160}
        className='object-cover w-full h-full'
      />
    </div>
  );
}
