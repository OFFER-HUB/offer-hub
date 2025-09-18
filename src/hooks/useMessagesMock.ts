
"use client";

import {  useMemo, useState } from "react";
import { conversations as rawConvs } from "@/lib/mockData/conversations-mock";
import { messages as rawMsgs } from "@/lib/mockData/messages-mock";
import { currentUserId, users } from "@/lib/mockData/users-mock";

// === Tipos que consumen MessagesSidebar y MessagesMainPlus ===
type UIConversation = {
  id: string;            // ej: "c1"
  name: string;          // nombre mostrado en la sidebar
  avatarUrl?: string;
  unreadCount?: number;
};

type UIMessage = {
  id: string;
  isOutgoing: boolean;
  content?: string;
  timestamp: string;     // string para evitar hydration mismatch
  type?: "text" | "file";
  fileData?: { name: string; size: string; uploadDate: string; status: string };
};

const getUser = (id: string) => users.find(u => u.id === id);

export function useMessagesMock() {
  // Conversaciones adaptadas a la UI
  const conversations: UIConversation[] = useMemo(() => {
    return rawConvs.map((c) => {
      const other = c.participants.find((p) => p.id !== currentUserId) || c.participants[0];
      return {
        id: c.id,
        name: other.name,
        avatarUrl: other.avatarUrl,
        unreadCount: c.unreadCount ?? 0,
      };
    });
  }, []);

  // Mensajes agrupados por conversación
  const [messagesByConv, setMessagesByConv] = useState<Record<string, UIMessage[]>>(() => {
    const g: Record<string, UIMessage[]> = {};
    for (const m of rawMsgs) {
      (g[m.conversationId] ??= []).push({
        id: String(m.id),
        isOutgoing: m.senderId === currentUserId,
        content: m.fileUrl ? undefined : m.text,
        type: m.fileUrl ? "file" : "text",
        fileData: m.fileUrl
          ? {
              name: "file",
              size: "—",
              uploadDate: new Date(m.createdAt).toLocaleDateString(),
              status: m.status === "read" ? "Read" : m.status === "delivered" ? "Delivered" : "Sent",
            }
          : undefined,
        timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }
    return g;
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(conversations[0]?.id ?? "c1");

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) || null,
    [conversations, activeConversationId]
  );

  const messages: UIMessage[] = useMemo(
    () => messagesByConv[activeConversationId] ?? [],
    [messagesByConv, activeConversationId]
  );

  // Enviar mensaje (mock, solo UI)
  const handleSendMessage = (text: string) => {
    const id = String(Date.now());
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMsg: UIMessage = { id, isOutgoing: true, content: text, timestamp: ts, type: "text" };
    setMessagesByConv((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] ?? []), newMsg],
    }));
  };

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    messages,
    handleSendMessage,
  };
}
