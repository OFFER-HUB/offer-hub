"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip, Camera, Smile } from "lucide-react"

interface MessageInputProps {
  onSendMessage: (message: string) => void
  placeholder?: string
}

export function MessageInputs({ onSendMessage, placeholder = "Message" }: MessageInputProps) {
  const [message, setMessage] = useState("")

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="bg-gray-100 rounded-full">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
          <Smile className="w-5 h-5" />
        </Button>

        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="pr-20 rounded-full bg-transparent focus:ring-0 ring-0 border-none border-transparent focus:border-none"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
              <Camera className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={!message.trim()}
          className="bg-slate-800 hover:bg-slate-700 text-white rounded-full w-10 h-10 p-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
