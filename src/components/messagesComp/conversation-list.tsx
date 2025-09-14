// Modern desktop conversation list with bulletproof ellipsis.
// Layout: [Avatar] [Main (name + snippet)] [Meta (time + unread)]

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type Conversation } from '../../types/messages-types';
import { ImageIcon, Paperclip } from 'lucide-react';
import { VALIDATION_LIMITS } from '@/constants/magic-numbers';

function trimWithEllipsis(text: string, max = 120) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max - 1).trimEnd() + '…' : text;
}

function last(conv: Conversation) {
  return conv.messages[conv.messages.length - 1];
}

function lastSnippet(conv: Conversation) {
  const m = last(conv);
  if (!m) return '';
  if (m.text) return trimWithEllipsis(m.text, 40);
  if (m.attachments && m.attachments.length > 0) {
    return m.attachments.length === 1
      ? 'Attachment'
      : `${m.attachments.length} attachments`;
  }
  return '';
}

function lastTime(conv: Conversation) {
  const m = last(conv);
  return m?.time ?? '';
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  dense = false,
  className,
}: {
  conversations: Conversation[];
  activeId?: string;
  onSelect?: (id: string) => void;
  dense?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('w-full', className)}>
      <ScrollArea
        className={cn(
          'rounded-xl border bg-white overflow-x-hidden',
          dense ? 'h-[55vh]' : 'h-[65vh]'
        )}
      >
        <ul className='divide-y'>
          {conversations.map((c) => {
            const active = c.id === activeId;
            const m = last(c);
            const hasImage = !!m?.attachments?.some((a) => a.kind === 'image');
            const hasFiles = !!m?.attachments?.some((a) => a.kind !== 'image');
            return (
              <li
                key={c.id}
                className={cn(
                  'transition-colors',
                  active ? 'bg-muted/60' : 'hover:bg-muted/40'
                )}
              >
                <button
                  type='button'
                  onClick={() => onSelect?.(c.id)}
                  className='flex w-full items-stretch gap-3 px-3 py-3 text-left'
                  aria-pressed={active}
                >
                  {/* Avatar */}
                  <div className='flex-shrink-0'>
                    <Avatar className='size-10 ring-2 ring-white'>
                      <AvatarImage
                        src={c.participant.avatarUrl || '/placeholder.svg'}
                        alt={`${c.participant.name} avatar`}
                      />
                      <AvatarFallback>
                        {c.participant.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, VALIDATION_LIMITS.MAX_AVATAR_INITIALS)
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Main */}

                  <div className='min-w-0 flex-1 overflow-hidden'>
                    {' '}
                    {/* Added overflow-hidden */}
                    <div className='flex items-baseline justify-between gap-3'>
                      <p className='truncate text-sm font-medium'>
                        {c.participant.name}
                      </p>
                      {/* Meta column - removed fixed width */}
                      <div className='flex-shrink-0 flex items-center gap-2'>
                        <span className='text-[11px] text-muted-foreground'>
                          {lastTime(c)}
                        </span>
                        {typeof c.unread === 'number' && c.unread > 0 ? (
                          <Badge className='px-1.5 py-0 text-[10px] bg-black text-white'>
                            {c.unread}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    {/* Snippet row */}
                    <div className='mt-0.5 flex items-center gap-1 text-xs text-muted-foreground'>
                      {hasImage && (
                        <ImageIcon
                          className='size-3.5 opacity-70'
                          aria-hidden='true'
                        />
                      )}
                      {hasFiles && (
                        <Paperclip
                          className='size-3.5 opacity-70'
                          aria-hidden='true'
                        />
                      )}
                      <span
                        className='truncate min-w-0'
                        title={lastSnippet(c)}
                        style={{ maxWidth: 'calc(100% - 20px)' }} // Reserve space for icons
                      >
                        {lastSnippet(c)}
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </div>
  );
}
