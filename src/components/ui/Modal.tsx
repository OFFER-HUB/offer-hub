'use client';
import React from 'react';

export default function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='relative'>{children}</div>
    </div>
  );
}