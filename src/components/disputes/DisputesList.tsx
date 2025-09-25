import React from 'react';
import DisputeCard from './DisputeCard';
import { Dispute } from '@/types/dispute';

type DisputeListProps = {
  disputes: Dispute[];
}
const DisputesList = ({disputes}: DisputeListProps) => {
  return (
    <main className='flex flex-col gap-4'>
      {disputes.map(dispute => (
        <DisputeCard
          key={dispute.id}
          title={dispute.title}
          name={dispute.name}
          date={dispute.date}
          avatarUrl={dispute.avatarUrl}
        />
      ))}
    </main>
  );
};

export default DisputesList;