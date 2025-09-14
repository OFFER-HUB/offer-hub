'use client';
import React, { useState } from 'react';

export default function MessageInput({ onSend, onAttach }: {
  onSend: (text: string) => void;
  onAttach?: (file: File) => void;
}) {
  const [value, setValue] = useState('');
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      onSend(value.trim());
      setValue('');
    }
  };
  return (
    <div className='flex items-center gap-2 p-3 bg-gray-100 rounded-full'>
      <button type='button' className='px-2 text-gray-500' aria-label='emoji'>🙂</button>
      <input
        className='flex-1 bg-transparent outline-none text-sm px-2'
        placeholder='Message'
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <label className='cursor-pointer px-2' aria-label='attach'>
        ⤓
        <input type='file' className='hidden' onChange={e => {
          const f = e.target.files?.[0];
          if (f && onAttach) onAttach(f);
        }} />
      </label>
      <button
        className='bg-black text-white rounded-full w-9 h-9 grid place-items-center'
        onClick={() => { if (value.trim()) { onSend(value.trim()); setValue(''); } }}
        aria-label='send'
      >▶</button>
    </div>
  );
}