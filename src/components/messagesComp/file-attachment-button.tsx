'use client'

// FileAttachmentButton: triggers native picker and returns selected files.
// Kept reusable with variant/size props and accessible label.

import { Button } from '@/components/ui/button'
import { Paperclip } from 'lucide-react'
import { useId, useRef } from 'react'

export function FileAttachmentButton({
  onFilesSelected,
  variant = 'ghost',
  size = 'icon',
  'aria-label': ariaLabel = 'Attach files',
  accept,
}: {
  onFilesSelected?: (files: File[]) => void
  variant?: React.ComponentProps<typeof Button>['variant']
  size?: React.ComponentProps<typeof Button>['size']
  'aria-label'?: string
  accept?: string
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const id = useId()

  return (
    <>
      <input
        id={id}
        ref={inputRef}
        type='file'
        className='hidden'
        multiple
        accept={accept}
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : []
          onFilesSelected?.(files)
          if (inputRef.current) inputRef.current.value = ''
        }}
      />
      <Button
        type='button'
        variant={variant}
        size={size}
        className='rounded-full text-muted-foreground'
        aria-label={ariaLabel}
        onClick={() => inputRef.current?.click()}
      >
        <Paperclip className='size-5' />
      </Button>
    </>
  )
}
