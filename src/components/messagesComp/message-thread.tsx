'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import type { Message } from '@/types/messages-types';
import { DateDivider } from './date-divider';
import { MessageBubble } from './message-bubble';
import { TypingIndicator } from './typing-indicator';
import { cn } from '@/lib/utils';
import { TIMEOUTS } from '@/constants/magic-numbers';
import { formatDayLabel, isoDateKey } from '@/lib/date';

// Thread grouped by day, auto-scrolls, supports "jump to reply" and "jump back".
export function MessageThread({
  messages = [],
  typing,
  typingName,
  onReply,
  className,
}: {
  messages?: Message[];
  typing?: boolean;
  typingName?: string;
  onReply?: (messageId: string) => void;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [messages]
  );

  // Group by a timezone-stable key (UTC date portion) to avoid SSR/client drift.
  const messagesByDay = useMemo(() => {
    const bucket: Record<string, Message[]> = {};
    for (const message of sortedMessages) {
      const key = isoDateKey(new Date(message.createdAt));
      if (!bucket[key]) bucket[key] = [];
      bucket[key].push(message);
    }
    return bucket;
  }, [sortedMessages]);

  const orderedDayKeys = useMemo(
    () =>
      Object.keys(messagesByDay).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)),
    [messagesByDay]
  );

  // Map of message id to DOM element to support jump-to.
  const messageElementMap = useRef<Map<string, HTMLDivElement>>(new Map());

  // Jump-back support: remember previous scrollTop and show a floating button.
  const [previousScrollTop, setPreviousScrollTop] = useState<number | null>(
    null
  );
  const [showJumpBack, setShowJumpBack] = useState(false);

  const jumpToMessageById = (messageId: string) => {
    const container = scrollRef.current;
    const targetEl = messageElementMap.current.get(messageId);
    if (!container || !targetEl) return;
    setPreviousScrollTop(container.scrollTop);
    setShowJumpBack(true);
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    targetEl.classList.add('ring-2', 'ring-sky-400/60', 'rounded-xl');
    window.setTimeout(
      () =>
        targetEl.classList.remove('ring-2', 'ring-sky-400/60', 'rounded-xl'),
      1500
    );
  };

  const handleJumpBack = () => {
    const container = scrollRef.current;
    if (container != null && previousScrollTop != null) {
      container.scrollTo({ top: previousScrollTop, behavior: 'smooth' });
    }
    window.setTimeout(() => setShowJumpBack(false), TIMEOUTS.JUMP_BACK_DISPLAY_DURATION);
  };

  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages?.length, typing]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        'h-full w-full overflow-y-auto overflow-x-hidden rounded-xl bg-white',
        className
      )}
      aria-label='Message thread'
    >
      <div className='relative mx-auto flex h-full max-w-3xl flex-col gap-3 p-2 sm:gap-4 sm:p-2'>
        {orderedDayKeys.map((dayKey) => {
          // Parse the UTC-only ISO date "YYYY-MM-DD" safely.
          const dayLabel = formatDayLabel(new Date(`${dayKey}T00:00:00.000Z`));
          const dayMessages = messagesByDay[dayKey];
          return (
            <div key={dayKey}>
              <DateDivider label={dayLabel} />
              <div className='flex flex-col gap-3 sm:gap-4'>
                {dayMessages.map((message) => (
                  <div
                    key={message.id}
                    ref={(el) => {
                      if (el) messageElementMap.current.set(message.id, el);
                      else messageElementMap.current.delete(message.id);
                    }}
                    className='transition-shadow'
                    data-message-id={message.id}
                  >
                    <MessageBubble
                      id={message.id}
                      text={message.text}
                      time={message.time}
                      direction={message.direction}
                      attachments={message.attachments}
                      status={message.status}
                      replyTo={message.replyTo}
                      onReply={onReply}
                      onJumpTo={jumpToMessageById}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {typing && <TypingIndicator name={typingName} align='left' />}

        <div ref={bottomRef} />

        {showJumpBack && (
          <div className='pointer-events-none sticky bottom-3 z-10 mx-auto flex w-full max-w-3xl justify-center'>
            <Button
              size='sm'
              variant='secondary'
              className='pointer-events-auto rounded-full shadow-md bg-white'
              onClick={handleJumpBack}
            >
              <ChevronDown className='mr-1.5 size-4' />
              Jump back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
