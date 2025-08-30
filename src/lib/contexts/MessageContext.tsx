"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface Message {
  id: string
  text: string
  timestamp: string
  isOutgoing: boolean
  talentId: number
  senderId: number
  receiverId: number
}

interface Conversation {
  id: string
  talentId: number
  messages: Message[]
  lastMessage?: Message
  unreadCount: number
}

interface MessageContextType {
  conversations: Conversation[]
  loading: boolean
  error: string | null
  getConversation: (talentId: number) => Conversation | undefined
  sendMessage: (talentId: number, text: string) => Promise<void>
  markAsRead: (talentId: number) => void
  getTotalUnreadCount: () => number
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

// Mock data for conversations
const mockConversations: Conversation[] = [
  {
    id: "1",
    talentId: 1,
    messages: [
      {
        id: "1",
        text: "Hi! I saw your project posting and I'm very interested in working with you.",
        timestamp: "09:21 am",
        isOutgoing: false,
        talentId: 1,
        senderId: 1,
        receiverId: 2,
      },
      {
        id: "2",
        text: "Great! I'd love to discuss the project details with you.",
        timestamp: "09:23 am",
        isOutgoing: true,
        talentId: 1,
        senderId: 2,
        receiverId: 1,
      },
    ],
    unreadCount: 0,
  },
  {
    id: "2",
    talentId: 2,
    messages: [
      {
        id: "3",
        text: "Thank you for considering me for your project!",
        timestamp: "10:15 am",
        isOutgoing: false,
        talentId: 2,
        senderId: 2,
        receiverId: 2,
      },
    ],
    unreadCount: 1,
  },
]

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Simulate API call to fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true)
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800))
        setConversations(mockConversations)
      } catch (err) {
        setError("Failed to load conversations")
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [])

  const getConversation = (talentId: number): Conversation | undefined => {
    return conversations.find((conv) => conv.talentId === talentId)
  }

  const sendMessage = async (talentId: number, text: string): Promise<void> => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300))

      const newMessage: Message = {
        id: Date.now().toString(),
        text,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOutgoing: true,
        talentId,
        senderId: 2, // Current user ID
        receiverId: talentId,
      }

      setConversations((prev) => {
        const existingConvIndex = prev.findIndex((conv) => conv.talentId === talentId)

        if (existingConvIndex >= 0) {
          // Update existing conversation
          const updated = [...prev]
          updated[existingConvIndex] = {
            ...updated[existingConvIndex],
            messages: [...updated[existingConvIndex].messages, newMessage],
            lastMessage: newMessage,
          }
          return updated
        } else {
          // Create new conversation
          const newConversation: Conversation = {
            id: Date.now().toString(),
            talentId,
            messages: [newMessage],
            lastMessage: newMessage,
            unreadCount: 0,
          }
          return [...prev, newConversation]
        }
      })
    } catch (err) {
      setError("Failed to send message")
      throw err
    }
  }

  const markAsRead = (talentId: number) => {
    setConversations((prev) => prev.map((conv) => (conv.talentId === talentId ? { ...conv, unreadCount: 0 } : conv)))
  }

  const getTotalUnreadCount = (): number => {
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0)
  }

  const value: MessageContextType = {
    conversations,
    loading,
    error,
    getConversation,
    sendMessage,
    markAsRead,
    getTotalUnreadCount,
  }

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
}

export const useMessages = () => {
  const context = useContext(MessageContext)
  if (context === undefined) {
    throw new Error("useMessages must be used within a MessageProvider")
  }
  return context
}
