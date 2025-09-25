'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Avatar } from '@radix-ui/react-avatar';

interface ConversationItemProps {
  name: string;
  avatar: string;
  message: string;
  category: string;
  active?: boolean;
  unread?: boolean;
  onClick?: () => void;
}

export function ConversationItem({
  name,
  avatar,
  message,
  category,
  active,
  unread,
  onClick,
}: ConversationItemProps) {
  return (
    <div
      className={cn(
        'flex gap-3 p-3 hover:bg-muted/50 cursor-pointer',
        active && 'bg-muted/50',
      )}
      onClick={onClick}
    >
      <div className='relative'>
        <Avatar className='h-10 w-10'>
          <Image
            src={avatar || '/placeholder.svg'}
            alt={name}
            width={40}
            height={40}
          />
        </Avatar>
        {unread && (
          <span className='absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500' />
        )}
      </div>
      <div className='flex-1 min-w-0'>
        <div className='flex justify-between items-start'>
          <h4 className='font-medium text-sm'>{name}</h4>
        </div>
        <p className='text-sm text-muted-foreground truncate'>{message}</p>
        <p className='text-xs text-muted-foreground mt-1'>{category}</p>
      </div>
    </div>
  );
}
