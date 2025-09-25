'use client'
import { useState } from 'react'
import type React from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Paperclip, Camera, Smile } from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (message: string) => void
  placeholder?: string
}

export function MessageInputs({ onSendMessage, placeholder = 'Message' }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className='rounded-full flex items-center justify-between gap-5'>
      <div
        className={`flex items-center gap-0 w-full bg-gray-100 rounded-full transition-all duration-200 ${
          isFocused ? 'ring-2 ring-gray-300 ring-offset-2' : ''
        }`}
      >
        <Button variant='ghost' size='icon' className='text-gray-500 hover:text-gray-700'>
          <Smile className='w-4 h-4 rounded-full' />
        </Button>

        <div className='flex-1 relative'>
          <Input
            value={message}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className='pr-20 focus-visible:ring-offset-0 rounded-full bg-transparent border-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 focus:outline-none'
          />
          <div className='absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1'>
            <Button variant='ghost' size='icon' className='h-8 w-8 text-gray-500 hover:text-gray-700'>
              <Paperclip className='w-4 h-4' />
            </Button>
            <Button variant='ghost' size='icon' className='h-8 w-8 text-gray-500 hover:text-gray-700'>
              <Camera className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </div>
      <Button
        onClick={handleSend}
        disabled={!message.trim()}
        className='bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-full w-10 h-10 p-0'
      >
        <Send className='w-4 h-4 text-white' />
      </Button>
    </div>
  )
}
