"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Upload, Camera, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import maskGroup from "../../../public/maskGroup.svg"
import Icon from "../../../public/Icon.svg"

interface Message {
  id: number
  content: string
  timestamp: string
  isOutgoing: boolean
  type: "text" | "file"
  fileData?: {
    name: string
    size: string
    uploadDate: string
    status: string
  }
}

interface Conversation {
  id: number
  name: string
  avatar: string
  lastMessage: string
  timestamp: string
  isOnline: boolean
  unreadCount?: number
}

interface MessagesMainProps {
  activeConversation?: Conversation
  messages: Message[]
  onSendMessage: (content: string, file?: File) => void
}

export function MessagesMain({ activeConversation, messages, onSendMessage }: MessagesMainProps) {
  const [newMessage, setNewMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage)
      setNewMessage("")
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onSendMessage(file.name, file)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Select a conversation to start messaging</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header - Left aligned with container padding */}
      <div className="p-4 px-16">
        <div className="bg-[#DEEFE7] rounded-lg px-4 py-3 flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={maskGroup.src || "/placeholder.svg"} alt={activeConversation.name} />
            <AvatarFallback className="bg-gray-200 text-gray-600">
              {activeConversation.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <h2 className="font-medium text-gray-900">{activeConversation.name}</h2>
        </div>
      </div>

      {/* Project Status - Centered */}
      <div className="px-6 py-4 flex items-center justify-center border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-5 h-5 rounded flex items-center justify-center">
            <img src={Icon.src} alt="icon" className="w-4 h-4 mt-4" />
          </div>
          <span>Pending: Milestone 1 - </span>
          <span className="text-gray-900 underline cursor-pointer">NFTs Card Design</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex", message.isOutgoing ? "justify-end" : "justify-start")}>
            <div className="max-w-xs lg:max-w-md">
              {message.type === "file" && message.fileData && (
                <div className="mb-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{message.fileData.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF • {message.fileData.size} • {message.fileData.uploadDate}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                        <div className="w-3 h-3 rounded-full border border-gray-400 flex items-center justify-center">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        </div>
                        <span>{message.fileData.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Message bubble with tail */}
              <div className="relative">
                <div
                  className={cn(
                    "px-4 py-3 rounded-2xl relative",
                    message.isOutgoing
                      ? "bg-blue-500 text-white rounded-br-md"
                      : "bg-gray-200 text-gray-900 rounded-bl-md",
                  )}
                >
                  <p className="text-sm">{message.content}</p>

                  {/* Speech bubble tail */}
                  {message.isOutgoing ? (
                    <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[8px] border-l-blue-500 border-t-[8px] border-t-transparent"></div>
                  ) : (
                    <div className="absolute bottom-0 left-0 w-0 h-0 border-r-[8px] border-r-gray-200 border-t-[8px] border-t-transparent"></div>
                  )}
                </div>

                <div className={cn("text-xs mt-1 text-gray-500", message.isOutgoing ? "text-right" : "text-left")}>
                  {message.timestamp}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-6 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message"
              className="pr-20 py-3 rounded-full border-gray-200 bg-gray-50 focus:border-gray-300 focus:ring-0 text-sm"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-transparent"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-transparent"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="rounded-full bg-black hover:bg-gray-800 text-white w-10 h-10 p-0 flex items-center justify-center"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
        />
      </div>
    </div>
  )
}
