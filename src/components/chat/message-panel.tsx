import Image from 'next/image';
import { Phone, Video, MoreVertical, FileIcon } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Conversation } from './@types/conversation.entity';

interface MessagePanelProps {
  activeConversation: Conversation | undefined;
}

export function MessagePanel({ activeConversation }: MessagePanelProps) {
  return (
    <div className='flex-1 flex flex-col'>
      <div className='flex items-center justify-between p-4 border-b'>
        <div className='flex items-center gap-3'>
          <Avatar className='h-8 w-8'>
            <Image
              src={activeConversation?.avatar || '/profile.jpeg'}
              alt={activeConversation?.name || 'User'}
              width={32}
              height={32}
            />
          </Avatar>
          <div>
            <h3 className='font-medium'>
              {activeConversation?.name || 'User'}
            </h3>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='icon'>
            <Phone className='h-5 w-5' />
          </Button>
          <Button variant='ghost' size='icon'>
            <Video className='h-5 w-5' />
          </Button>
          <Button variant='ghost' size='icon'>
            <MoreVertical className='h-5 w-5' />
          </Button>
        </div>
      </div>

      <div className='flex-1 overflow-auto p-4 space-y-4'>
        <div className='flex gap-3 max-w-[80%]'>
          <Avatar className='h-8 w-8 mt-1'>
            <Image
              src='/profile.jpeg'
              alt='Alex Morgan'
              width={32}
              height={32}
            />
          </Avatar>
          <div>
            <div className='bg-muted rounded-lg p-3'>
              <p>
                Hi there! I've been working on the website redesign and wanted
                to share my progress.
              </p>
            </div>
            <span className='text-xs text-muted-foreground mt-1 ml-2'>
              10:15 AM
            </span>
          </div>
        </div>

        <div className='flex justify-end'>
          <div className='flex flex-col items-end bg-primary-600 text-white rounded-lg py-2'>
            <div className='text-primary-foreground rounded-lg p-3 '>
              <p>Great! I'm excited to see what you've done so far.</p>
            </div>
            <span className='text-xs text-muted-foreground mt-1 mr-2 text-white'>
              10:17 AM
            </span>
          </div>
        </div>

        <div className='flex gap-3 max-w-[80%]'>
          <Avatar className='h-8 w-8 mt-1'>
            <Image
              src='/profile.jpeg'
              alt='Alex Morgan'
              width={32}
              height={32}
            />
          </Avatar>
          <div>
            <div className='bg-muted rounded-lg p-3'>
              <p>
                I've completed the homepage and about page designs. I'm still
                working on the services section.
              </p>
            </div>
            <span className='text-xs text-muted-foreground mt-1 ml-2'>
              10:20 AM
            </span>
          </div>
        </div>

        <div className='flex gap-3 max-w-[80%]'>
          <Avatar className='h-8 w-8 mt-1'>
            <Image
              src='/profile.jpeg'
              alt='Alex Morgan'
              width={32}
              height={32}
            />
          </Avatar>
          <div>
            <div className='flex flex-col gap-2'>
              <div className='bg-muted rounded-lg p-3'>
                <p>Here's a preview of the homepage design:</p>
              </div>
              <div className='bg-muted rounded-lg overflow-hidden'>
                <div className='h-64 w-full bg-gray-200 flex items-center justify-center'>
                  <FileIcon className='h-10 w-10 text-muted-foreground' />
                </div>
              </div>
            </div>
            <span className='text-xs text-muted-foreground mt-1 ml-2'>
              10:21 AM
            </span>
          </div>
        </div>

        <div className='flex justify-end'>
          <div className='flex flex-col items-end'>
            <div className='bg-primary text-primary-foreground rounded-lg p-3 max-w-[80%]'>
              <p>
                This looks fantastic! I love the clean layout and how you've
                incorporated our brand colors.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='p-4 border-t'>
        <Input
          type='text'
          placeholder='Type a message...'
          className='bg-muted/40'
        />
      </div>
    </div>
  );
}
