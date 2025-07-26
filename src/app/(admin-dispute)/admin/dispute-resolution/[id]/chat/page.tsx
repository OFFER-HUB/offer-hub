'use client';

import { Button } from '@/components/ui/button';
import CloseConflictModal from '@/components/dispute-resolution/close-conflict-modal';
import { DisputeRow } from '@/types';
import { FaChevronLeft } from 'react-icons/fa';
import Link from 'next/link';
import { MdGavel } from 'react-icons/md';
import { MessagesMain } from '@/components/messages/messages-main';
import { useMessages } from '@/hooks/useMessages';
import { useMockDisputes } from '@/data/generic-mock-data';
import { useState } from 'react';

const types: { [key in NonNullable<DisputeRow['status']>]: string } = {
  active: 'Active Dispute',
  resolved: 'Resolved Dispute',
  unassigned: 'Unassigned Dispute',
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
      className="py-5 text-white rounded-full bg-secondary-500"
      disabled={dispute.status === 'resolved'}
      onClick={handleOpenModal}
    >
      <MdGavel /> Close conflict
    </Button>
  );

  return (
    <>
      <div className="inline-flex items-center justify-start w-full gap-2 p-4 mb-6 bg-transparent bg-white border-b">
        <Link
          href="/admin/dispute-resolution"
          className="flex items-center gap-x-2"
        >
          <FaChevronLeft size={12} className="text-gray-400" /> Back
        </Link>

        <div className="px-4 py-1 text-white rounded-full bg-secondary-500">
          {types[dispute.status!]}
        </div>
      </div>
      <div className="flex h-full w-full lg:w-[714px] mx-auto bg-white rounded-lg">
        <MessagesMain
          activeConversation={activeConversation}
          messages={messages}
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
