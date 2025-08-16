
import { useState, useEffect, useCallback } from 'react';
import type { Conversation, Message, CreateMessageDTO } from '@/types/messages.types';
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markAsRead,
} from '@/services/api/messages.service';

interface UseMessagesResult {
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string) => void;
  activeConversation: Conversation | null;
  messages: Message[];
  handleSendMessage: (content: string, file?: File) => Promise<void>;
  loadingConversations: boolean;
  loadingMessages: boolean;
  sendingMessage: boolean;
  errorConversations: string | null;
  errorMessages: string | null;
  errorSend: string | null;
}

export function useMessages(userId?: string): UseMessagesResult {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [errorConversations, setErrorConversations] = useState<string | null>(null);
  const [errorMessages, setErrorMessages] = useState<string | null>(null);
  const [errorSend, setErrorSend] = useState<string | null>(null);


  useEffect(() => {
    if (!userId) return;
    setLoadingConversations(true);
    getUserConversations(userId)
      .then((res) => {
        if (res.error) setErrorConversations(res.error);
        else setConversations(res.data || []);
      })
      .catch((e) => setErrorConversations(e.message))
      .finally(() => setLoadingConversations(false));
  }, [userId]);


  useEffect(() => {
    if (!activeConversationId) {
      setActiveConversation(null);
      setMessages([]);
      return;
    }
    const conv = conversations.find((c) => c.id === activeConversationId) || null;
    setActiveConversation(conv);
  }, [activeConversationId, conversations]);


  useEffect(() => {
    if (!activeConversationId) return;
    setLoadingMessages(true);
    getConversationMessages(activeConversationId)
      .then(async (res) => {
        if (res.error) {
          setErrorMessages(res.error);
        } else {
          const msgs = res.data || [];
          setMessages(msgs);

          if (userId) {
            const readRes = await markAsRead(activeConversationId, userId);
            if (!readRes.success && readRes.error) {

              setErrorMessages((prev) => prev ?? readRes.error);
            } else {
              // Optimistically update unread_count and message read flags for incoming messages
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === activeConversationId
                    ? { ...c, unread_count: 0, last_message: c.last_message ? { ...c.last_message, is_read: true } : c.last_message }
                    : c
                )
              );
              setMessages((prev) => prev.map((m) => (m.sender_id !== userId ? { ...m, is_read: true } : m)));
            }
          }
        }
      })
      .catch((e) => setErrorMessages(e.message))
      .finally(() => setLoadingMessages(false));
  }, [activeConversationId, userId]);

  // Simple polling for new messages and conversation updates
  // NB: (we can always change it, if we move to Socket or SSE)

  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => {

      getUserConversations(userId).then((res) => {
        if (!res.error && res.data) setConversations(res.data);
      });

      if (activeConversationId) {
        getConversationMessages(activeConversationId).then((res) => {
          if (!res.error && res.data) setMessages(res.data);
        });
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [userId, activeConversationId]);

  const handleSendMessage = useCallback(
    async (content: string, file?: File) => {
      if (!activeConversationId || !userId) return;
      setSendingMessage(true);
      setErrorSend(null);
      let fileUrl, fileName, fileSize;
      if (file) {
       
        fileUrl = URL.createObjectURL(file);
        fileName = file.name;
        fileSize = file.size;
      }
      const optimisticMsg: Message = {
        id: 'optimistic-' + Date.now(),
        conversation_id: activeConversationId,
        sender_id: userId,
        content,
        message_type: file ? 'file' : 'text',
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMsg]);
      try {
        const dto: CreateMessageDTO = {
          conversation_id: activeConversationId,
          sender_id: userId,
          content,
          message_type: file ? 'file' : 'text',
          file_url: fileUrl,
          file_name: fileName,
          file_size: fileSize,
        };
        const res = await sendMessage(dto);
        if (res.error || !res.data) {
          setErrorSend(res.error || 'Failed to send message');
          
          setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
        } else {
          
          setMessages((prev) =>
            prev.map((m) => (m.id === optimisticMsg.id ? res.data! : m))
          );
        }
      } catch (e: any) {
        setErrorSend(e.message);
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      } finally {
        setSendingMessage(false);
      }
    },
    [activeConversationId, userId]
  );

  return {
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
  };
}
