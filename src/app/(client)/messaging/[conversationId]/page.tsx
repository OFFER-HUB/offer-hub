"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/account-settings/header"
import { Sidebar } from "@/components/account-settings/sidebar"
import { MessagesSidebar } from "@/components/messages/messages-sidebar"
import { MessagesMainPlus } from "@/components/messaging/messages-main-plus"
import { useMessagesMock as useMessages } from "@/hooks/useMessagesMock"
import type { Conversation as MessagesConversation } from '@/types/messages.types';
import type { Conversation as MessagesMainConversation, Message as MessagesMainMessage } from '@/types/index';

type UIConversation = {
  id: string;
  name: string;
  avatarUrl?: string;
  unreadCount?: number;
};

type UIMessage = {
  id: string;
  isOutgoing: boolean;
  content?: string;
  timestamp: string;
  type?: "text" | "file";
  fileData?: { name: string; size: string; uploadDate: string; status: string };
};

interface PageProps {
  params: { conversationId: string }
}

export default function MessagingById({ params }: PageProps) {
  const { conversationId } = params
  
  return <MessagingClient conversationId={conversationId} />
}

// Convert UIConversation to MessagesConversation (for MessagesSidebar)
const convertUIConversationToMessagesConversation = (uiConv: UIConversation): MessagesConversation => {
  return {
    id: uiConv.id,
    project_id: undefined,
    service_request_id: undefined,
    client_id: 'mock-client-id',
    freelancer_id: 'mock-freelancer-id',
    last_message_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    participants: [{
      id: uiConv.id,
      name: uiConv.name,
      avatar_url: uiConv.avatarUrl,
      online: false
    }],
    last_message: undefined,
    unread_count: uiConv.unreadCount ?? 0
  };
};

// Convert UIConversation to MessagesMainConversation (for MessagesMainPlus)
const convertUIConversationToMessagesMainConversation = (uiConv: UIConversation): MessagesMainConversation => {
  return {
    id: parseInt(uiConv.id),
    name: uiConv.name,
    avatar: uiConv.avatarUrl || '/placeholder.svg',
    lastMessage: 'No messages yet',
    timestamp: new Date().toISOString(),
    isOnline: false,
    unreadCount: uiConv.unreadCount ?? 0
  };
};

// Convert UIMessage to MessagesMainMessage
const convertUIMessageToMessagesMainMessage = (uiMsg: UIMessage): MessagesMainMessage => {
  return {
    id: parseInt(uiMsg.id),
    content: uiMsg.content || '',
    timestamp: uiMsg.timestamp,
    isOutgoing: uiMsg.isOutgoing,
    type: (uiMsg.type as "text" | "file") || 'text',
    fileData: uiMsg.fileData
  };
};

function MessagingClient({ conversationId }: { conversationId: string }) {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    messages,
    handleSendMessage,
  } = useMessages()

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserActive, setIsUserActive] = useState(false)

  useEffect(() => { setActiveConversationId(conversationId) }, [conversationId, setActiveConversationId])

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
              conversations={conversations.map(convertUIConversationToMessagesConversation)}
              activeConversationId={activeConversationId}
              onConversationSelect={setActiveConversationId}
            />
            <MessagesMainPlus
              activeConversation={activeConversation ? convertUIConversationToMessagesMainConversation(activeConversation) : undefined}
              messages={messages.map(convertUIMessageToMessagesMainMessage)}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
