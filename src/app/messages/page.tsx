'use client'
import { useMessages } from "@/hooks/useMessages";
import { useState } from "react";
import { Header } from "@/components/account-settings/header";
import { Sidebar } from "@/components/account-settings/sidebar";
import { MessagesSidebar } from "@/components/messages/messages-sidebar";
import { MessagesMain } from "@/components/messages/messages-main";

const currentUserId = 'user-1';

export default function MessagesPage() {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    messages,
    handleSendMessage,
    loadingConversations,
    loadingMessages,
    errorConversations,
    errorMessages,
    sendingMessage,
    errorSend,
  } = useMessages(currentUserId);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserActive, setIsUserActive] = useState(false);

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
              conversations={conversations}
              activeConversationId={activeConversationId}
              onConversationSelect={setActiveConversationId}
              loading={loadingConversations}
              error={errorConversations}
            />
            <MessagesMain
              activeConversation={activeConversation}
              messages={messages}
              onSendMessage={handleSendMessage}
              loading={loadingMessages || sendingMessage}
              error={errorMessages || errorSend}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
