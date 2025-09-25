import { cn } from '@/lib/utils';
import { Check, CheckCheck, FileText, Reply } from 'lucide-react';
import Image from 'next/image';
import { type Attachment, type Message } from '@/types/messages-types';

function isImage(att: Attachment) {
  return att.kind === 'image' || att.mime.startsWith('image/');
}

function FileChip({
  att,
  tone,
}: {
  att: Attachment;
  tone: 'sent' | 'received';
}) {
  const sent = tone === 'sent';
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border px-2 py-1 text-xs',
        sent ? 'border-white/20 bg-white/15 text-white' : 'bg-background'
      )}
    >
      <FileText className='size-4 opacity-80' />
      <span className='max-w-[10rem] truncate'>{att.name}</span>
      <span className={cn(sent ? 'opacity-80' : 'text-muted-foreground')}>
        ({Math.ceil(att.size / 1024)} KB)
      </span>
    </div>
  );
}

export function MessageBubble({
  id,
  text = '',
  time,
  direction = 'sent',
  attachments = [],
  status,
  replyTo,
  onReply,
  onJumpTo,
  className,
}: Pick<
  Message,
  'id' | 'text' | 'time' | 'direction' | 'attachments' | 'status' | 'replyTo'
> & {
  onReply?: (id: string) => void;
  onJumpTo?: (id: string) => void;
  className?: string;
}) {
  const isSent = direction === 'sent';
  const imageAttachments = attachments?.filter(isImage);
  const fileAttachments = attachments?.filter((a) => !isImage(a));

  // Touch swipe to reply (mobile)
  let touchStartX = 0;
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.changedTouches[0]?.clientX ?? 0;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX;
    if (dx > 60) onReply?.(id); // swipe right
  };

  const Ticks = () => {
    if (!isSent) return null;
    if (status === 'read')
      return (
        <CheckCheck className='size-3.5 text-[#1D7DFF]' aria-label='Read' />
      );
    if (status === 'delivered')
      return (
        <CheckCheck
          className='size-3.5 text-muted-foreground'
          aria-label='Delivered'
        />
      );
    return (
      <Check className='size-3.5 text-muted-foreground' aria-label='Sent' />
    );
  };

  const bubbleTone = isSent
    ? 'bg-[#1D7DFF] text-white rounded-br-md'
    : 'bg-muted text-foreground/90 rounded-bl-md';

  return (
    <div
      className={cn(
        'group/message flex w-full select-text overflow-x-hidden',
        isSent ? 'justify-end' : 'justify-start',
        className
      )}
      role='article'
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Row with an external reply rail and the bubble. Prevents overlap with text. */}
      <div className='flex max-w-[80%] items-start gap-2 sm:max-w-[66%]'>
        {/* Left rail (received) */}
        {!isSent && (
          <button
            type='button'
            onClick={() => onReply?.(id)}
            className='mt-1 hidden size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted/70 text-muted-foreground opacity-0 transition-opacity hover:bg-muted md:inline-flex group-hover/message:opacity-100'
            title='Reply'
            aria-label='Reply'
          >
            <Reply className='size-4' />
          </button>
        )}

        {/* Bubble */}
        <div className='min-w-0 flex-1'>
          <div
            className={cn('overflow-hidden rounded-2xl shadow-sm', bubbleTone)}
          >
            {/* Inline quoted preview with its own contrasting background; clickable to jump */}
            {replyTo && (
              <button
                type='button'
                onClick={() => replyTo.id && onJumpTo?.(replyTo.id)}
                className={cn(
                  'mx-3.5 mt-2 flex items-start gap-2 rounded-md p-2 ring-1 transition hover:opacity-90',
                  isSent
                    ? 'bg-white/20 ring-white/25'
                    : 'bg-foreground/5 ring-foreground/10'
                )}
                aria-label='Show replied message'
                title='Show replied message'
              >
                {replyTo.attachmentThumbUrl ? (
                  <Image
                    src={
                      replyTo.attachmentThumbUrl ||
                      '/placeholder.svg?height=32&width=32&query=reply-thumb'
                    }
                    alt='quoted'
                    width={32}
                    height={32}
                    className='mt-0.5 flex-shrink-0 rounded object-cover'
                  />
                ) : null}
                <div
                  className={cn(
                    'min-w-0 flex-1 border-l-2 pl-2 text-left',
                    isSent
                      ? 'border-white/60 text-white/90'
                      : 'border-foreground/20 text-foreground/80'
                  )}
                >
                  <span className='block max-w-full break-words break-all'>
                    {replyTo.text ||
                      (replyTo.attachmentThumbUrl ? 'Photo' : 'Quoted message')}
                  </span>
                </div>
              </button>
            )}

            {/* Media grid (inside bubble) */}
            {imageAttachments && imageAttachments.length > 0 && (
              <div
                className={cn(
                  'grid gap-1 p-1',
                  imageAttachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
                )}
              >
                {imageAttachments.map((att) => (
                  <div
                    key={att.id}
                    className='relative aspect-square overflow-hidden rounded-xl'
                  >
                    <Image
                      src={
                        att.url ||
                        '/placeholder.svg?height=300&width=300&query=chat-media'
                      }
                      alt={att.name}
                      fill
                      className='object-cover'
                      sizes='(max-width: 640px) 50vw, 300px'
                    />
                  </div>
                ))}
              </div>
            )}

            {/* File chips (inside bubble) */}
            {fileAttachments && fileAttachments.length > 0 && (
              <div
                className={cn(
                  'flex flex-wrap gap-2 px-3.5 pt-2',
                  text ? '' : 'pb-2'
                )}
              >
                {fileAttachments.map((att) => (
                  <FileChip
                    key={att.id}
                    att={att}
                    tone={isSent ? 'sent' : 'received'}
                  />
                ))}
              </div>
            )}

            {/* Caption / text */}
            {text && (
              <div className='px-3.5 pb-2 pt-2 text-sm leading-relaxed'>
                <p className='max-w-full break-words break-all'>{text}</p>
              </div>
            )}
          </div>

          {/* Timestamp + ticks */}
          <div
            className={cn(
              'mt-1 flex items-center gap-1 text-[11px] leading-none text-muted-foreground',
              isSent ? 'justify-end pr-1.5' : 'pl-1.5'
            )}
          >
            <span>{time}</span>
            {isSent && <Ticks />}
          </div>
        </div>

        {/* Right rail (sent) */}
        {isSent && (
          <button
            type='button'
            onClick={() => onReply?.(id)}
            className='mt-1 hidden size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted/70 text-muted-foreground opacity-0 transition-opacity hover:bg-muted md:inline-flex group-hover/message:opacity-100'
            title='Reply'
            aria-label='Reply'
          >
            <Reply className='size-4' />
          </button>
        )}
      </div>
    </div>
  );
}
