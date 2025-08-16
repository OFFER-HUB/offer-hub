"use client";

import { ConversationList } from "@/components/chat/conversation-list";
import { MessagePanel } from "@/components/chat/message-panel";

import { useMessages } from "@/hooks/useMessages";
import { MessagesSidebar } from "@/components/messages/messages-sidebar";
import { MessagesMain } from "@/components/messages/messages-main";


const currentUserId = 'user-1';

export default function MessagingInterface() {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    messages,
    handleSendMessage,
    loadingConversations,
    loadingMessages,
    sendingMessage,
    errorConversations,
    errorMessages,
    errorSend,
  } = useMessages(currentUserId);

  return (
    <div className="max-w-6xl mx-auto px-4 py-2">
      <div className="flex">
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
  );
}
