import React from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface DisputeMessageBubbleProps {
  content: string;
  timestamp: string;
  sender: {
    name: string;
    role: 'customer' | 'freelancer' | 'admin';
    avatar?: string;
  };
  attachments?: {
    type: 'image' | 'file';
    name: string;
    url: string;
    size?: string;
  }[];
  isSystem?: boolean;
}

export function DisputeMessageBubble({
  content,
  timestamp,
  sender,
  attachments,
  isSystem = false,
}: DisputeMessageBubbleProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'freelancer':
        return 'bg-blue-100 text-blue-800';
      case 'customer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Support';
      case 'freelancer':
        return 'Freelancer';
      case 'customer':
        return 'Customer';
      default:
        return role;
    }
  };

  if (isSystem) {
    return (
      <div className='flex justify-center my-4'>
        <div className='bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full'>
          {content}
        </div>
      </div>
    );
  }

  const isAdminMessage = sender.role === 'admin';

  return (
    <div className={`flex gap-3 mb-4 ${isAdminMessage ? 'flex-row-reverse' : ''}`}>
      <Avatar className='h-8 w-8 mt-1 flex-shrink-0'>
        <AvatarImage src={sender.avatar} alt={sender.name} />
        <AvatarFallback className='text-xs'>
          {sender.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex flex-col max-w-[70%] ${isAdminMessage ? 'items-end' : ''}`}>
        <div className={`flex items-center gap-2 mb-1 ${isAdminMessage ? 'flex-row-reverse' : ''}`}>
          <span className='text-sm font-medium text-gray-900'>{sender.name}</span>
          <Badge variant='secondary' className={`text-xs ${getRoleColor(sender.role)}`}>
            {getRoleLabel(sender.role)}
          </Badge>
        </div>
        
        <div className={`rounded-lg p-3 ${
          isAdminMessage 
            ? 'bg-[#149A9B] text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          <p className='text-sm whitespace-pre-wrap'>{content}</p>
        </div>

        {attachments && attachments.length > 0 && (
          <div className='mt-2 space-y-2'>
            {attachments.map((attachment) => (
              <div
                key={`${attachment.name}-${attachment.url}`}
                className='border border-gray-200 rounded-lg p-3 bg-white max-w-xs'
              >
                {attachment.type === 'image' ? (
                  <div className='relative h-32 w-full rounded overflow-hidden'>
                    <Image
                      src={attachment.url}
                      alt={attachment.name}
                      fill
                      className='object-cover'
                    />
                  </div>
                ) : (
                  <div className='flex items-center gap-2'>
                    <div className='p-2 bg-gray-100 rounded'>
                      📄
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm text-gray-900 truncate'>{attachment.name}</p>
                      {attachment.size && (
                        <p className='text-xs text-gray-500'>{attachment.size}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <span className={`text-xs text-gray-500 mt-1 ${isAdminMessage ? 'text-right' : ''}`}>
          {timestamp}
        </span>
      </div>
    </div>
  );
} 