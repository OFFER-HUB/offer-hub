'use client';

import { useMemo, useState } from 'react';
import { ChatHeader } from './chat-header';
import { MessageThread } from './message-thread';
import { MessageInput } from './message-input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ConversationList } from './conversation-list';
import { Button } from '@/components/ui/button';
import { TIMEOUTS } from '@/constants/magic-numbers';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { List } from 'lucide-react';
import {
  type Conversation,
  type Message,
  type Attachment,
  type AttachmentKind,
} from '@/types/messages-types';
import { formatTime12h } from '@/lib/date';

// Helper: convert selected Files into attachment objects for UI preview.
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function filesToAttachments(files: File[]): Promise<Attachment[]> {
  const results: Attachment[] = [];
  for (const file of files) {
    const dataUrl = await fileToDataUrl(file);
    const isImage = file.type.startsWith('image/');
    results.push({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()
        .toString(36)
        .slice(2)}`,
      kind: isImage ? 'image' : 'file',
      name: file.name,
      size: file.size,
      mime: file.type,
      url: dataUrl,
    });
  }
  return results;
}

export default function ChatPageClient({
  initialConversations,
}: {
  initialConversations: Conversation[];
}) {
  // State: conversations and active conversation
  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string>(
    initialConversations[0]?.id ?? ''
  );

  // State: reply target and simulated peer typing
  const [replyTarget, setReplyTarget] = useState<
    | {
        id: string;
        text?: string;
        attachmentThumbUrl?: string;
        attachmentKind?: AttachmentKind;
      }
    | undefined
  >(undefined);
  const [isPeerTyping, setIsPeerTyping] = useState(false);

  const activeConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === activeConversationId
      ) ?? conversations[0],
    [conversations, activeConversationId]
  );

  // Handler: start reply by clicking the reply rail/icon or swiping on touch
  const handleStartReply = (messageId: string) => {
    const originalMessage = activeConversation?.messages.find(
      (message) => message.id === messageId
    );
    if (!originalMessage) return;
    const firstAttachment = originalMessage.attachments?.[0];
    setReplyTarget({
      id: originalMessage.id,
      text: originalMessage.text,
      attachmentThumbUrl: firstAttachment?.url,
      attachmentKind: firstAttachment?.kind,
    });
  };

  // Handler: send message with optional attachments and reply metadata
  const handleSendMessage = async (text: string, files: File[]) => {
    if (!activeConversation) return;
    const now = new Date();
    const newMessage: Message = {
      id: `m_${now.getTime()}`,
      direction: 'sent',
      text: text || undefined,
      createdAt: now.toISOString(),
      time: formatTime12h(now),
      attachments:
        files.length > 0 ? await filesToAttachments(files) : undefined,
      status: 'sent',
      replyTo: replyTarget,
    };

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === activeConversation.id
          ? {
              ...conversation,
              messages: [...conversation.messages, newMessage],
              unread: 0,
            }
          : conversation
      )
    );

    // Simulate delivered/read
    window.setTimeout(() => {
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === activeConversation.id
            ? {
                ...conversation,
                messages: conversation.messages.map((m) =>
                  m.id === newMessage.id ? { ...m, status: 'delivered' } : m
                ),
              }
            : conversation
        )
      );
    }, 600);

    window.setTimeout(() => {
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === activeConversation.id
            ? {
                ...conversation,
                messages: conversation.messages.map((m) =>
                  m.id === newMessage.id ? { ...m, status: 'read' } : m
                ),
              }
            : conversation
        )
      );
    }, 1400);

    setReplyTarget(undefined);
  };

  // Handler: typing preview simulation
  const handleTextDraftChange = (_next: string) => {
    setIsPeerTyping(true);
    const timeoutId = window.setTimeout(() => setIsPeerTyping(false), TIMEOUTS.PEER_TYPING_TIMEOUT);
    return () => window.clearTimeout(timeoutId);
  };

  return (
    <div className='bg-[#F4F5F6]'>
      {/* Mobile header with conversation drawer trigger */}
      <div className='mx-auto w-full max-w-6xl px-4'>
        <div className='mb-4 flex items-center justify-between xl:hidden'>
          <h1 className='text-center text-sm font-medium text-muted-foreground'>
            Message
          </h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                aria-label='Open conversations'
              >
                <List className='size-5' />
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='w-[88vw] p-0'>
              <SheetHeader className='px-4 py-3'>
                <SheetTitle className='text-left'>Conversations</SheetTitle>
              </SheetHeader>
              <div className='p-3'>
                <ConversationList
                  conversations={conversations}
                  activeId={activeConversation?.id}
                  onSelect={(id: string) => setActiveConversationId(id)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className='mx-auto w-full max-w-6xl px-4'>
        <div className='grid grid-cols-1 gap-4 xl:grid-cols-[340px_1fr]'>
          {/* Conversation list (desktop) */}
          <div className='hidden xl:block'>
            <Card className='overflow-hidden rounded-2xl border bg-white shadow-sm'>
              <div className='px-4 py-3'>
                <h2 className='text-sm font-semibold'>Conversations</h2>
              </div>
              <Separator />
              <div className='p-3'>
                <ConversationList
                  conversations={conversations}
                  activeId={activeConversation?.id}
                  onSelect={(id: string) => setActiveConversationId(id)}
                  dense={false}
                />
              </div>
            </Card>
          </div>

          {/* Chat column */}
          <Card className='mx-auto w-full overflow-hidden rounded-2xl border bg-white shadow-sm'>
            {activeConversation ? (
              <>
                <ChatHeader
                  name={activeConversation.participant.name}
                  avatarUrl={activeConversation.participant.avatarUrl}
                />
                <Separator />
                <div className='relative h-[65vh] w-full overflow-hidden p-4 sm:p-6'>
                  <MessageThread
                    messages={activeConversation.messages as Message[]}
                    typing={isPeerTyping}
                    typingName={
                      activeConversation.participant.name.split(' ')[0]
                    }
                    onReply={handleStartReply}
                    className='h-full'
                  />
                </div>
                <div className='border-t bg-white/90 p-3 sm:p-4'>
                  <MessageInput
                    placeholder='Message'
                    onSend={handleSendMessage}
                    onAttach={() => {}}
                    onChangeText={handleTextDraftChange}
                    replyToPreview={replyTarget}
                    onCancelReply={() => setReplyTarget(undefined)}
                  />
                </div>
              </>
            ) : (
              <div className='flex h-[70vh] items-center justify-center text-sm text-muted-foreground'>
                Select a conversation to start chatting
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
