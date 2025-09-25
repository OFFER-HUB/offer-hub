'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Share, Camera, Smile } from 'lucide-react';
import { TIMEOUTS } from '@/constants/magic-numbers';

interface DisputeMessageInputProps {
  onSendMessage: (content: string, file?: File) => void;
}

export function DisputeMessageInput({ onSendMessage }: DisputeMessageInputProps) {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Simulate file upload delay
      await new Promise(resolve => setTimeout(resolve, TIMEOUTS.API_DELAY_VERY_LONG));
      onSendMessage(`Shared file: ${file.name}`, file);
      setIsUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className='rounded-2xl'>
      <form onSubmit={handleSubmit} className='flex items-center gap-3'>
        {/* Emoji button */}
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='h-10 w-10 p-0 text-gray-500 hover:text-gray-700 rounded-full'
        >
          <Smile className='h-5 w-5' />
        </Button>

        {/* Message input container */}
        <div className='flex-1 relative'>
          <Input
            type='text'
            placeholder='Message'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className='w-full bg-gray-100 border-gray-200 rounded-2xl px-4 py-3 pr-20 text-sm placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            disabled={isUploading}
          />
          
          {/* Right side icons inside input */}
          <div className='absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2'>
            <label className='cursor-pointer'>
              <input
                type='file'
                accept='image/*,.pdf,.doc,.docx'
                onChange={handleFileUpload}
                className='hidden'
                disabled={isUploading}
              />
              <Share className='h-4 w-4 text-gray-500 hover:text-gray-700' />
            </label>

            <label className='cursor-pointer'>
              <input
                type='file'
                accept='image/*'
                onChange={handleFileUpload}
                className='hidden'
                disabled={isUploading}
              />
              <Camera className='h-4 w-4 text-gray-500 hover:text-gray-700' />
            </label>
          </div>
        </div>

        {/* Send button */}
        <Button
          type='submit'
          size='sm'
          className='h-10 w-10 p-0 bg-gray-800 hover:bg-gray-900 text-white rounded-full flex-shrink-0'
          disabled={!message.trim() || isUploading}
        >
          {isUploading ? (
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
          ) : (
            <Send className='h-4 w-4' />
          )}
        </Button>
      </form>
    </div>
  );
}