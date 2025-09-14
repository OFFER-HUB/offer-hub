'use client'
import { useState, useRef } from 'react'
import type React from 'react'

export function useMessages(onSendMessage: (content: string, file?: File) => void) {
  const [newMessage, setNewMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage)
      setNewMessage('')
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onSendMessage(file.name, file)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return {
    newMessage,
    setNewMessage,
    fileInputRef,
    handleSendMessage,
    handleFileUpload,
    handleKeyPress,
  }
}
