'use client';

import { useState, useEffect } from 'react';
import { DisputeMessageDisplay } from './DisputeMessageDisplay';
import { DisputeMessageInput } from './DisputeMessageInput';
import { getMessagesByDisputeId, addMessage, DisputeMessage } from '@/lib/mockData/dispute-messages-mock';
import { TIMEOUTS } from '@/constants/magic-numbers';

interface DisputeConversationProps {
  disputeId: string;
}

export function DisputeConversation({ disputeId }: DisputeConversationProps) {
  const [messages, setMessages] = useState<DisputeMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading messages
    const loadMessages = async () => {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, TIMEOUTS.API_DELAY_MEDIUM));
      const disputeMessages = getMessagesByDisputeId(disputeId);
      setMessages(disputeMessages);
      setIsLoading(false);
    };

    loadMessages();
  }, [disputeId]);

  const handleSendMessage = async (content: string, file?: File) => {
    if (!content.trim() && !file) return;

    // Add message optimistically
    const newMessage = addMessage(disputeId, content, 'current-user');
    setMessages(prev => [...prev, newMessage]);

    // In a real app, you would send this to the backend
    console.log('Sending message:', { content, file, disputeId });
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full bg-white'>
      {/* Messages Display Area */}
      <div className='flex-1 overflow-hidden px-6 py-4'>
        <DisputeMessageDisplay messages={messages} />
      </div>

      {/* Message Input Area */}
      <div className='px-6'>
        <DisputeMessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}