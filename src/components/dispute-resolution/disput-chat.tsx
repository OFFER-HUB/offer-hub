import React, { useState } from 'react';
import { DisputeMessageBubble } from './MessageBubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip } from 'lucide-react';

const mockMessages = [
  {
    id: 1,
    content: 'Hello, I have an issue with the payment. The freelancer completed the work but I haven\'t received the deliverables as promised.',
    timestamp: '2 hours ago',
    sender: {
      name: 'Sarah Johnson',
      role: 'customer' as const,
      avatar: '/avatar_olivia.jpg',
    },
  },
  {
    id: 2,
    content: 'I understand your concern. I actually did send the files via email yesterday. Let me resend them to make sure you receive them.',
    timestamp: '1 hour ago',
    sender: {
      name: 'Mike Chen',
      role: 'freelancer' as const,
    },
  },
  {
    id: 3,
    content: 'I\'ve checked my email including spam folder and didn\'t receive anything. Can you please provide proof of delivery?',
    timestamp: '45 minutes ago',
    sender: {
      name: 'Sarah Johnson',
      role: 'customer' as const,
      avatar: '/avatar_olivia.jpg',
    },
  },
  {
    id: 4,
    content: 'This dispute has been escalated to our support team. We will review all communications and resolve this matter within 24 hours.',
    timestamp: '30 minutes ago',
    sender: {
      name: 'Support Team',
      role: 'admin' as const,
    },
    isSystem: true,
  },
];

interface DisputeChatProps {
  onCloseConflict: () => void;
  disputeId?: string;
}

export default function DisputeChat({ onCloseConflict, disputeId }: DisputeChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: messages.length + 1,
      content: newMessage,
      timestamp: 'Just now',
      sender: {
        name: 'Support Team',
        role: 'admin' as const,
      },
      isSystem: false,
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className='flex flex-col h-full bg-white'>
      {/* Chat Header */}
      <div className='border-b bg-gray-50 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='font-semibold text-gray-900'>Dispute #{disputeId || 'ABC123'}</h3>
            <p className='text-sm text-gray-500'>Payment & Delivery Issue</p>
          </div>
          <Button 
            variant='destructive' 
            onClick={onCloseConflict}
            className='bg-red-600 hover:bg-red-700'
          >
            Close conflict & release payment
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className='flex-1 overflow-auto p-6 space-y-4 bg-gray-50'>
        {messages.map((msg) => (
          <DisputeMessageBubble 
            key={msg.id} 
            content={msg.content}
            timestamp={msg.timestamp}
            sender={msg.sender}
            isSystem={msg.isSystem}
          />
        ))}
      </div>

      {/* Message Input */}
      <div className='border-t bg-white p-4'>
        <div className='flex items-end gap-3'>
          <div className='flex-1 relative'>
            <Input
              placeholder='Type your response...'
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className='pr-12 min-h-[40px] resize-none'
            />
            <Button
              variant='ghost'
              size='sm'
              className='absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-8 w-8'
            >
              <Paperclip className='h-4 w-4' />
            </Button>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className='bg-[#149A9B] hover:bg-[#108080] h-10 px-4'
          >
            <Send className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
} 