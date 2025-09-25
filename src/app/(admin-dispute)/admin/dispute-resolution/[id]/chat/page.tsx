'use client';

import { Button } from '@/components/ui/button';
import CloseConflictModal from '@/components/dispute-resolution/close-conflict-modal';
import { DisputeRow, Conversation as MessagesMainConversation, Message as MessagesMainMessage } from '@/types';
import { FaChevronLeft } from 'react-icons/fa';
import Link from 'next/link';
import { MdGavel } from 'react-icons/md';
import { MessagesMainPlus } from '@/components/messaging/messages-main-plus';
import { useMessages } from '@/hooks/useMessages';
import { useMockDisputes } from '@/data/generic-mock-data';
import { useState } from 'react';
import type { Conversation as MessagesConversation, Message as MessagesMessage } from '@/types/messages.types';

const types: { [key in NonNullable<DisputeRow['status']>]: string } = {
  active: 'Active Dispute',
  resolved: 'Resolved Dispute',
  unassigned: 'Unassigned Dispute',
};

// Convert MessagesConversation to MessagesMainConversation
const convertConversation = (conv: MessagesConversation | null): MessagesMainConversation | undefined => {
  if (!conv) return undefined;
  
  return {
    id: parseInt(conv.id),
    name: conv.participants?.map(p => p.name).join(', ') || 'Unknown',
    avatar: conv.participants?.[0]?.avatar_url || '/placeholder.svg',
    lastMessage: conv.last_message?.content || 'No messages yet',
    timestamp: conv.last_message_at,
    isOnline: conv.participants?.some(p => p.online) || false,
    unreadCount: conv.unread_count
  };
};

// Convert MessagesMessage to MessagesMainMessage
const convertMessages = (msgs: MessagesMessage[]): MessagesMainMessage[] => {
  return msgs.map(msg => ({
    id: parseInt(msg.id),
    content: msg.content,
    timestamp: msg.created_at,
    isOutgoing: msg.sender_id === 'current-user-id', // This should be dynamic based on current user
    type: msg.message_type === 'file' ? 'file' : 'text',
    fileData: msg.file_url ? {
      name: msg.file_name || 'File',
      size: msg.file_size?.toString() || '0',
      uploadDate: msg.created_at,
      status: 'uploaded'
    } : undefined
  }));
};

export default function DisputeChat() {
  const { activeConversation, messages, handleSendMessage } = useMessages();

  const { disputes } = useMockDisputes(1);
  const dispute = disputes[0];

  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const handleConfirm = () => {
    setModalOpen(false);
  };

  const closeDisputeButton = (
    <Button
      className='py-5 text-white rounded-full bg-secondary-500'
      disabled={dispute.status === 'resolved'}
      onClick={handleOpenModal}
    >
      <MdGavel /> Close conflict
    </Button>
  );

  return (
    <>
      <div className='inline-flex items-center justify-start w-full gap-2 p-4 mb-6 bg-transparent bg-white border-b'>
        <Link
          href='/admin/dispute-resolution'
          className='flex items-center gap-x-2'
        >
          <FaChevronLeft size={12} className='text-gray-400' /> Back
        </Link>

        <div className='px-4 py-1 text-white rounded-full bg-secondary-500'>
          {types[dispute.status!]}
        </div>
      </div>
      <div className='flex h-full w-full lg:w-[714px] mx-auto bg-white rounded-lg'>
        <MessagesMainPlus
          activeConversation={convertConversation(activeConversation)}
          messages={convertMessages(messages)}
          dispute={dispute}
          onSendMessage={handleSendMessage}
          chatHeaderItem={closeDisputeButton}
        />
        <CloseConflictModal
          open={modalOpen}
          dispute={dispute}
          onClose={handleCloseModal}
          onConfirm={handleConfirm}
        />
      </div>
    </>
  );
}
