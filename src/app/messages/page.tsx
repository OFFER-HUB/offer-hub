"use client"

import { useState } from "react"
import { Header } from "@/components/account-settings/header"
import { Sidebar } from "@/components/account-settings/sidebar"
import { MessagesSidebar } from "@/components/messages/messages-sidebar"
import { MessagesMain } from "@/components/messages/messages-main"

// Define proper types for the messages page
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

// Mock conversations data with proper structure
const conversationsData: Conversation[] = [
  {
    id: 1,
    name: "John Doe",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Looking forward to the proposal.",
    timestamp: "2 min ago",
    isOnline: true,
    unreadCount: 2,
  },
  {
    id: 2,
    name: "Olivia Rhye",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Looking forward to the proposal.",
    timestamp: "5 min ago",
    isOnline: true,
  },
  {
    id: 3,
    name: "Olivia Rhye",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Looking forward to the proposal.",
    timestamp: "1 hour ago",
    isOnline: true,
  },
]

export default function MessagesPage() {
  const [activeConversationId, setActiveConversationId] = useState(1)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "The main text of the message sent out",
      timestamp: "09:21 am",
      isOutgoing: true,
      type: "text",
    },
    {
      id: 2,
      content: "The main text of the message sent out",
      timestamp: "09:21 am",
      isOutgoing: true,
      type: "text",
    },
    {
      id: 3,
      content: "User Layout. PDF",
      timestamp: "09:21 am",
      isOutgoing: true,
      type: "file",
      fileData: {
        name: "PDF_2022-04-20-20 19.30...",
        size: "2.3mb",
        uploadDate: "uploaded Mar 22",
        status: "Under review (5 days) • 2 days remaining",
      },
    },
    {
      id: 4,
      content: "The main text of the message sent out",
      timestamp: "09:23 am",
      isOutgoing: false,
      type: "text",
    },
  ])

  const activeConversation = conversationsData.find((conversation) => conversation.id === activeConversationId)

  const handleSendMessage = (content: string, file?: File) => {
    const newMessage: Message = file
      ? {
          id: messages.length + 1,
          content,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          isOutgoing: true,
          type: "file",
          fileData: {
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(1)}mb`,
            uploadDate: `uploaded ${new Date().toLocaleDateString()}`,
            status: "Uploaded successfully",
          },
        }
      : {
          id: messages.length + 1,
          content,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          isOutgoing: true,
          type: "text",
        }

    setMessages((prev) => [...prev, newMessage])
  }

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserActive, setIsUserActive] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className="flex">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isUserActive={isUserActive}
          setIsUserActive={setIsUserActive}
        />
        <div className="flex-1 p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-[calc(100vh-140px)] flex overflow-hidden">
            <MessagesSidebar
              conversations={conversationsData}
              activeConversationId={activeConversationId}
              onConversationSelect={setActiveConversationId}
            />
            <MessagesMain
              activeConversation={activeConversation}
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
