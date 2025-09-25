import ChatPageClient from '@/components/messagesComp/chat-page';
import { mockConversations } from '@/data/mock-messages';

export default async function MessagesPage() {
  const initialConversations = mockConversations;
  return <ChatPageClient initialConversations={initialConversations} />;
}
