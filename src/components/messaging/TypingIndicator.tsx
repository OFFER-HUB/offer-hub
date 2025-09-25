'use client';
export default function TypingIndicator() {
  return (
    <div className='inline-flex items-center gap-1 text-gray-400 text-xs'>
      <span className='animate-pulse'>●</span>
      <span className='animate-pulse [animation-delay:150ms]'>●</span>
      <span className='animate-pulse [animation-delay:300ms]'>●</span>
    </div>
  );
}
