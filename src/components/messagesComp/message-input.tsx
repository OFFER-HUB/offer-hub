'use client';

// MessageInput with:
// - Emoji picker (emoji-mart) in a shadcn Popover
// - Attachment preview tray with remove (uses Next.js <Image> with data URLs)
// - Reply preview (quote bar) with cancel
// - Enter to send (Shift+Enter for newline)
// Emits onSend(text, files); purely frontend.

import { useEffect, useMemo, useState } from 'react';
import { Camera, SendHorizonal, X, Smile } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileAttachmentButton } from './file-attachment-button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Image from 'next/image';

// emoji-mart
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

type LocalPreview = {
  id: string;
  file: File;
  dataUrl: string;
  isImage: boolean;
};


type MinimalEmoji = { native?: string };

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function MessageInput({
  placeholder = 'Message',
  onSend,
  onAttach,
  onChangeText,
  replyToPreview,
  onCancelReply,
  className,
}: {
  placeholder?: string;
  onSend?: (text: string, files: File[]) => void | Promise<void>;
  onAttach?: (files: File[]) => void;
  onChangeText?: (value: string) => void;
  replyToPreview?: { id: string; text?: string };
  onCancelReply?: () => void;
  className?: string;
}) {
  const [textValue, setTextValue] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<LocalPreview[]>([]);

  // Build data URL previews when files change (works with Next <Image> without unoptimized)
  useEffect(() => {
    let cancelled = false;
    async function build() {
      const results: LocalPreview[] = [];
      for (const file of selectedFiles) {
        const id = `${file.name}-${file.size}-${
          file.lastModified
        }-${Math.random().toString(36).slice(2)}`;
        const dataUrl = await fileToDataUrl(file);
        results.push({
          id,
          file,
          dataUrl,
          isImage: file.type.startsWith('image/'),
        });
      }
      if (!cancelled) setPreviews(results);
    }
    build();
    return () => {
      cancelled = true;
    };
  }, [selectedFiles]);

  const itemCount = previews.length;
  const tile = useMemo(() => {
    if (itemCount >= 20) return 56;
    if (itemCount >= 12) return 64;
    if (itemCount >= 6) return 80;
    return 96;
  }, [itemCount]);

  const handleAttach = (incoming: File[]) => {
    const next = [...selectedFiles, ...incoming];
    setSelectedFiles(next);
    onAttach?.(next);
  };

  const removePreview = (id: string) => {
    const nextFiles = previews.filter((p) => p.id !== id).map((p) => p.file);
    setSelectedFiles(nextFiles);
    onAttach?.(nextFiles);
  };

  const handleSend = async () => {
    const hasText = textValue.trim().length > 0;
    const hasFiles = selectedFiles.length > 0;
    if (!hasText && !hasFiles) return;
    await onSend?.(textValue.trim(), selectedFiles);
    setTextValue('');
    setSelectedFiles([]);
    onCancelReply?.();
  };

  return (
    <div className={className}>
      {/* Reply preview */}
      {replyToPreview && (
        <div className='mb-2 flex items-start justify-between rounded-xl border bg-muted/40 px-3 py-2 text-xs'>
          <div className='mr-2 border-l-2 pl-2 text-muted-foreground'>
            <span className='block max-w-full break-words'>
              {replyToPreview.text || 'Quoted message'}
            </span>
          </div>
          <Button
            size='icon'
            variant='ghost'
            className='h-6 w-6'
            aria-label='Cancel reply'
            onClick={onCancelReply}
          >
            <X className='size-4' />
          </Button>
        </div>
      )}

      {/* Attachment preview tray */}
      {previews.length > 0 && (
        <ScrollArea className='mb-2 max-h-44 overflow-x-hidden rounded-xl border bg-white p-2'>
          <div
            className='grid gap-2'
            style={{
              gridTemplateColumns: `repeat(auto-fill, minmax(${tile}px, 1fr))`,
            }}
          >
            {previews.map((p) => (
              <div key={p.id} className='group relative rounded-lg border'>
                {p.isImage ? (
                  <div
                    style={{ height: tile }}
                    className='relative w-full rounded-lg'
                  >
                    <Image
                      src={
                        p.dataUrl ||
                        '/placeholder.svg?height=96&width=96&query=attachment-preview'
                      }
                      alt={p.file.name}
                      fill
                      className='rounded-lg object-cover'
                      sizes='(max-width: 640px) 50vw, 200px'
                    />
                  </div>
                ) : (
                  <div
                    className='flex items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground'
                    style={{ height: tile }}
                  >
                    {p.file.name}
                  </div>
                )}
                <button
                  type='button'
                  className='absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100'
                  onClick={() => removePreview(p.id)}
                  aria-label={`Remove ${p.file.name}`}
                >
                  <X className='size-4' />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Input row */}
      <div className='flex items-end gap-2'>
        <div className='flex w-full items-center gap-2 rounded-full bg-muted px-2 pl-1.5 pr-2 shadow-inner'>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                aria-label='Insert emoji'
                className='rounded-full text-muted-foreground'
              >
                <Smile className='size-5' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='p-0'>
              <Picker
                data={data}
                onEmojiSelect={(emoji: MinimalEmoji) =>
                  setTextValue((prev) => (prev || '') + (emoji?.native || ''))
                }
                theme='light'
                previewPosition='none'
                navPosition='top'
              />
            </PopoverContent>
          </Popover>

          <Input
            value={textValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setTextValue(e.target.value);
              onChangeText?.(e.target.value);
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            placeholder={placeholder}
            className='h-10 min-w-0 flex-1 border-0 bg-transparent px-1 focus-visible:ring-0'
          />

          <div className='flex items-center gap-1.5 pr-1'>
            <FileAttachmentButton
              onFilesSelected={handleAttach}
              aria-label='Upload file'
            />
            <Button
              type='button'
              variant='ghost'
              size='icon'
              aria-label='Open camera'
              className='rounded-full text-muted-foreground'
              onClick={() => console.info('Camera icon clicked')}
            >
              <Camera className='size-5' />
            </Button>
          </div>
        </div>
        <Button
          type='button'
          size='icon'
          aria-label='Send message'
          className='size-10 rounded-full bg-black hover:bg-black/90'
          onClick={() => void handleSend()}
        >
          <SendHorizonal className='size-5 text-white' />
        </Button>
      </div>
    </div>
  );
}
