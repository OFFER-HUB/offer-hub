'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, FileText, Send, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import Icon from '../../../public/Icon.svg';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

import type { Conversation, Message } from '@/types/messages.types';
import { cn } from '@/lib/utils';
import { useRef, useState } from 'react';

interface MessagesMainProps {
  activeConversation: Conversation | null;
  messages: Message[];
  onSendMessage: (content: string, file?: File) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export function MessagesMain({ activeConversation, messages, onSendMessage, loading, error }: MessagesMainProps) {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    setSendError(null);
    try {
      await onSendMessage(newMessage);
      setNewMessage('');
    } catch (e: any) {
      setSendError(e.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSending(true);
      setSendError(null);
      try {
        await onSendMessage('', file);
        setNewMessage('');
      } catch (err: any) {
        setSendError(err.message || 'Failed to send file');
      } finally {
        setSending(false);
      }
    }
  };

  if (!activeConversation) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p className="text-gray-500">Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="bg-[#DEEFE7] rounded-lg px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="*:data-[slot=avatar]:ring-background flex -space-x-7 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
            {activeConversation.participants?.map((e) => (
              <Avatar className="w-10 h-10 border border-white" key={e.id}>
                <AvatarImage src={e.avatar_url || '/placeholder.svg'} alt={e.name} />
                <AvatarFallback className="text-gray-600 bg-gray-200">
                  {e.name.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <h2 className="font-medium text-gray-900">
            {activeConversation.participants?.map((e) => e.name).join(', ')}
          </h2>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {loading ? (
          <div className="p-4">Loading messages...</div>
        ) : error ? (
          <div className="p-4 text-red-500">{error}</div>
        ) : messages.length === 0 ? (
          <div className="p-4 text-gray-500">No messages yet.</div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.sender_id === activeConversation.client_id ? 'justify-end' : 'justify-start'
              )}
            >
              <div className="max-w-xs lg:max-w-md">
                {message.message_type === 'file' && message.file_url && (
                  <div className="p-4 mb-2 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-red-100 rounded">
                        <FileText className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {message.file_name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {message.file_url?.split('.').pop()?.toUpperCase()} • {message.file_size ? `${(message.file_size / (1024 * 1024)).toFixed(1)}mb` : ''}
                        </p>
                        <a href={message.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 underline">Download</a>
                      </div>
                    </div>
                  </div>
                )}
                <div className="relative">
                  <div
                    className={cn(
                      'px-4 py-3 rounded-2xl relative',
                      message.sender_id === activeConversation.client_id
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-gray-200 text-gray-900 rounded-bl-md'
                    )}
                  >
                    {message.message_type === 'system' ? (
                      <p className="text-xs italic text-gray-500">{message.content}</p>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    {message.sender_id === activeConversation.client_id ? (
                      <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[8px] border-l-blue-500 border-t-[8px] border-t-transparent"></div>
                    ) : (
                      <div className="absolute bottom-0 left-0 w-0 h-0 border-r-[8px] border-r-gray-200 border-t-[8px] border-t-transparent"></div>
                    )}
                  </div>
                  <div className={cn('text-xs mt-1 text-gray-500', message.sender_id === activeConversation.client_id ? 'text-right' : 'text-left')}>
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    {message.is_read ? <span className="ml-2 text-green-500">Read</span> : <span className="ml-2 text-gray-400">Unread</span>}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {sendError && <div className="p-2 text-red-500">{sendError}</div>}
      </div>

      <div className="p-6 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message"
              className="py-3 pr-20 text-sm border-gray-200 rounded-full bg-gray-50 focus:border-gray-300 focus:ring-0"
              disabled={sending}
            />
            <div className="absolute flex items-center gap-2 transform -translate-y-1/2 right-3 top-1/2">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-transparent"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending}
              >
                <Upload className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-transparent"
                disabled={sending}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="flex items-center justify-center w-10 h-10 p-0 text-white bg-black rounded-full hover:bg-gray-800"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          disabled={sending}
        />
      </div>
    </div>
  );
}
