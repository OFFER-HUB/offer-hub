'use client';

import { useEffect, useRef } from 'react';
import { DisputeMessage } from '@/lib/mockData/dispute-messages-mock';

interface DisputeMessageDisplayProps {
  messages: DisputeMessage[];
}

export function DisputeMessageDisplay({ messages }: DisputeMessageDisplayProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className='flex items-center justify-center h-full text-gray-500'>
        <div className='text-center'>
          <p className='text-lg font-medium'>No messages yet</p>
          <p className='text-sm'>Start the conversation by sending a message</p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full overflow-y-auto space-y-3'>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.isOutgoing ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[70%] px-3 py-3 rounded-2xl relative ${
              message.isOutgoing
                ? 'bg-[#2862FF] text-white'
                : 'bg-[#F2F2F2] text-gray-900'
            }`}
          >
            <p className='text-sm leading-relaxed mb-1'>{message.content}</p>
            <p
              className={`text-xs ${
                message.isOutgoing 
                  ? 'text-white/80 text-right' 
                  : 'text-gray-600 text-left'
              }`}
            >
              {message.timestamp}
            </p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}