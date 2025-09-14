'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, FileText, Send, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import type { MessagesMainProps } from '@/types';
import { cn } from '@/lib/utils';
import { useMessages } from '@/hooks/use-message';
import { TIMEOUTS, VALIDATION_LIMITS } from '@/constants/magic-numbers';

import { useEffect, useRef, useState } from 'react';
import TypingIndicator from '@/components/messaging/TypingIndicator';
import MessageStatus, { MsgStatus } from '@/components/messaging/MessageStatus';

const ICON_SRC = '/Icon.svg';
const MASK_SRC = '/maskGroup.svg';

export function MessagesMainPlus({
  activeConversation,
  dispute,
  messages,
  onSendMessage,
  chatHeaderItem,
}: MessagesMainProps) {
  const {
    newMessage,
    setNewMessage,
    fileInputRef,
    handleSendMessage,
    handleFileUpload,
    handleKeyPress,
  } = useMessages(onSendMessage);

  const [statusById, setStatusById] = useState<Record<string, MsgStatus>>({});
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    messages.forEach((m) => {
      const id = String(m.id);
      if (!id || !m.isOutgoing || statusById[id]) return;
      setStatusById((s) => ({ ...s, [id]: 'sent' }));
      const t1 = setTimeout(() => setStatusById((s) => ({ ...s, [id]: 'delivered' })), TIMEOUTS.MESSAGE_STATUS_DELIVERED_DELAY);
      const t2 = setTimeout(() => setStatusById((s) => ({ ...s, [id]: 'read' })), TIMEOUTS.MESSAGE_STATUS_READ_DELAY);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    });
  }, [messages, statusById]);

  useEffect(() => {
    const i = setInterval(() => {
      setTyping(true);
      setTimeout(() => setTyping(false), TIMEOUTS.TYPING_INDICATOR_DURATION);
    }, TIMEOUTS.TYPING_SIMULATION_INTERVAL);
    return () => clearInterval(i);
  }, []);

  const endRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = (smooth = true) =>
    endRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end' });
  useEffect(() => { scrollToBottom(); }, [messages, typing]);

  if (!activeConversation) {
    return (
      <div className='flex items-center justify-center flex-1'>
        <p className='text-gray-500'>Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col flex-1'>
      {/* Header idéntico */}
      <div className='bg-[#DEEFE7] rounded-lg px-4 py-3 flex items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='*:data-[slot=avatar]:ring-background flex -space-x-7 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale'>
            {(dispute?.parties ?? [
              { id: '1', avatarUrl: MASK_SRC },
            ]).map((e) => (
              <Avatar className='w-10 h-10 border border-white' key={e.id}>
                <AvatarImage src={e.avatarUrl} alt={activeConversation.name} />
                <AvatarFallback className='text-gray-600 bg-gray-200'>
                  {activeConversation.name.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <h2 className='font-medium text-gray-900'>
            {dispute?.parties
              ? dispute.parties.map((e) => e.name).join(', ').slice(0, VALIDATION_LIMITS.MAX_DISPUTE_PARTY_NAME_LENGTH) + '...'
              : activeConversation.name}
          </h2>
        </div>
        <div>{chatHeaderItem}</div>
      </div>

      {/* Banner superior */}
      <div className='flex items-center justify-center px-6 py-4 border-b border-gray-100'>
        <div className='flex items-center gap-2 text-sm text-gray-600'>
          <div className='flex items-center justify-center w-5 h-5 rounded'>
            <Image src={ICON_SRC} alt='icon' width={16} height={16} className='w-4 h-4' />
          </div>
          <span>Pending: Milestone 1 - </span>
          <span className='text-gray-900 underline cursor-pointer'>NFTs Card Design</span>
        </div>
      </div>

      {/* Mensajes */}
      <div className='flex-1 p-6 space-y-4 overflow-y-auto'>
        {messages.map((message) => (
          <div key={message.id} className={cn('flex', message.isOutgoing ? 'justify-end' : 'justify-start')}>
            <div className='max-w-xs lg:max-w-md'>
              {message.type === 'file' && message.fileData && (
                <div className='p-4 mb-2 border border-gray-200 rounded-lg bg-gray-50'>
                  <div className='flex items-start gap-3'>
                    <div className='flex items-center justify-center flex-shrink-0 w-8 h-8 bg-red-100 rounded'>
                      <FileText className='w-4 h-4 text-red-600' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-900 truncate'>{message.fileData.name}</p>
                      <p className='mt-1 text-xs text-gray-500'>
                        PDF • {message.fileData.size} • {message.fileData.uploadDate}
                      </p>
                      <div className='flex items-center gap-1 mt-2 text-xs text-gray-500'>
                        <div className='flex items-center justify-center w-3 h-3 border border-gray-400 rounded-full'>
                          <div className='w-1 h-1 bg-gray-400 rounded-full'></div>
                        </div>
                        <span>{message.fileData.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className='relative'>
                <div
                  className={cn(
                    'px-4 py-3 rounded-2xl relative',
                    message.isOutgoing ? 'bg-blue-500 text-white rounded-br-md' : 'bg-gray-200 text-gray-900 rounded-bl-md'
                  )}
                >
                  <p className='text-sm'>{message.content}</p>
                  {message.isOutgoing ? (
                    <div className='absolute bottom-0 right-0 w-0 h-0 border-l-[8px] border-l-blue-500 border-t-[8px] border-t-transparent'></div>
                  ) : (
                    <div className='absolute bottom-0 left-0 w-0 h-0 border-r-[8px] border-r-gray-200 border-t-[8px] border-t-transparent'></div>
                  )}
                </div>

                {/* timestamp + status para salientes */}
                <div className={cn('text-xs mt-1 text-gray-500 flex items-center gap-1',
                                    message.isOutgoing ? 'justify-end' : 'justify-start')}>
                  <span suppressHydrationWarning>{message.timestamp}</span>
                  {message.isOutgoing && (
                    <MessageStatus status={statusById[String(message.id)] ?? 'sent'} />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing como burbuja del receptor */}
        {typing && (
          <div className='flex justify-start'>
            <div className='max-w-xs lg:max-w-md'>
              <div className='px-4 py-3 rounded-2xl bg-gray-200 text-gray-900 rounded-bl-md'>
                <TypingIndicator />
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className='p-6 border-t border-gray-100'>
        <div className='flex items-center gap-3'>
          <div className='relative flex-1'>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='Message'
              className='py-3 pr-20 text-sm border-gray-200 rounded-full bg-gray-50 focus:border-gray-300 focus:ring-0'
            />
            <div className='absolute flex items-center gap-2 transform -translate-y-1/2 right-3 top-1/2'>
              <Button
                variant='ghost'
                size='icon'
                className='w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-transparent'
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className='w-4 h-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className='w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-transparent'
              >
                <Camera className='w-4 h-4' />
              </Button>
            </div>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className='flex items-center justify-center w-10 h-10 p-0 text-white bg-black rounded-full hover:bg-gray-800'
          >
            <Send className='w-4 h-4' />
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type='file'
          className='hidden'
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
}
