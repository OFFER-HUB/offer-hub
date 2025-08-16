export interface Conversation {
  id: string;
  project_id?: string;
  service_request_id?: string;
  client_id: string;
  freelancer_id: string;
  last_message_at: string;
  created_at: string;
  participants?: User[];
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'file' | 'system';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  is_read: boolean;
  created_at: string;
  sender?: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  id: string;
  name: string;
  avatar_url?: string;
  online?: boolean;
}

export interface CreateMessageDTO {
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'file' | 'system';
  file_url?: string;
  file_name?: string;
  file_size?: number;
}
