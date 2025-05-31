"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import userImage from "../../../public/avatar_olivia.jpg"

interface Conversation {
  id: number
  name: string
  avatar: string
  lastMessage: string
  timestamp: string
  isOnline: boolean
  unreadCount?: number
}

interface MessagesSidebarProps {
  conversations: Conversation[]
  activeConversationId: number
  onConversationSelect: (id: number) => void
}

export function MessagesSidebar({ conversations, activeConversationId, onConversationSelect }: MessagesSidebarProps) {
  return (
    <div className="w-80 border-r border-gray-200 flex flex-col px-4">
      <div className="p-6 pb-4">
        <h1 className="text-2xl font-semibold text-gray-900 mb-16">Messages</h1>
      </div>

     <div className="flex-1 overflow-y-auto">
  {conversations.map((conversation) => (
    <div
      key={conversation.id}
      className={cn(
        "flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200 rounded-lg mt-6 mb-6",
        activeConversationId === conversation.id && "bg-gray-50"
      )}
      onClick={() => onConversationSelect(conversation.id)}
    >
            <div className="relative mt-5">
              <Avatar className="h-12 w-12">
                <AvatarImage src={userImage.src || "/placeholder.svg"} alt={conversation.name} />
                <AvatarFallback className="bg-gray-200 text-gray-600">
                  {conversation.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {conversation.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate text-sm">{conversation.name}</h3>
              <p className="text-sm text-gray-500 truncate mt-0.5">{conversation.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
