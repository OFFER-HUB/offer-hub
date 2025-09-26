
import axios, { AxiosError } from 'axios';
import type { Conversation, Message, ApiResponse, CreateMessageDTO } from '../../types/messages.types';

const API_BASE = '/api';

export async function getUserConversations(userId: string, signal?: AbortSignal): Promise<{ data?: Conversation[]; error?: string; loading: boolean }> {
  let loading = true;
  try {
    const res = await axios.get<ApiResponse<Conversation[]>>(`${API_BASE}/conversations/user/${userId}`, { signal });
    loading = false;
    return { data: res.data.data, loading };
  } catch (err) {
    loading = false;
    // if aborted, return a specific message for callers to optionally ignore
    if ((err as any)?.name === 'CanceledError' || (err as any)?.name === 'AbortError') {
      return { error: 'request-aborted', loading };
    }
    return { error: getErrorMsg(err), loading };
  }
}

export async function getConversationMessages(conversationId: string, signal?: AbortSignal): Promise<{ data?: Message[]; error?: string; loading: boolean }> {
  let loading = true;
  try {
    const res = await axios.get<ApiResponse<Message[]>>(`${API_BASE}/messages/conversation/${conversationId}`, { signal });
    loading = false;
    return { data: res.data.data, loading };
  } catch (err) {
    loading = false;
    if ((err as any)?.name === 'CanceledError' || (err as any)?.name === 'AbortError') {
      return { error: 'request-aborted', loading };
    }
    return { error: getErrorMsg(err), loading };
  }
}

export async function sendMessage(messageData: CreateMessageDTO, signal?: AbortSignal): Promise<{ data?: Message; error?: string; loading: boolean }> {
  let loading = true;
  try {
    const res = await axios.post<ApiResponse<Message>>(`${API_BASE}/messages`, messageData, { signal });
    loading = false;
    return { data: res.data.data, loading };
  } catch (err) {
    loading = false;
    if ((err as any)?.name === 'CanceledError' || (err as any)?.name === 'AbortError') {
      return { error: 'request-aborted', loading };
    }
    return { error: getErrorMsg(err), loading };
  }
}

export async function markAsRead(conversationId: string, userId: string, signal?: AbortSignal): Promise<{ success: boolean; error?: string; loading: boolean }> {
  let loading = true;
  try {
    await axios.post(`${API_BASE}/messages/read`, { conversationId, userId }, { signal });
    loading = false;
    return { success: true, loading };
  } catch (err) {
    loading = false;
    if ((err as any)?.name === 'CanceledError' || (err as any)?.name === 'AbortError') {
      return { success: false, error: 'request-aborted', loading };
    }
    return { success: false, error: getErrorMsg(err), loading };
  }
}

function getErrorMsg(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const e = err as AxiosError;
    const msg = typeof e.response?.data === 'object' && e.response?.data !== null ? (e.response.data as any).message : undefined;
    if (msg) return msg;
    if (e.response?.status) return `Error ${e.response.status}`;
    return e.message;
  }
  return 'Unknown error';
}
