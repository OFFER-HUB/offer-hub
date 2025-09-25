'use client';

import React from 'react';
import ReceivedRequestsList from '@/components/freelancer-dashboard/received-requests';

const TEST_FREELANCER_ID = '07d2564c-124b-41fe-b963-fb7aa600a056';

export default function TestReceivedRequestsPage() {
  return (
    <div className='p-8'>
      <h1 className='text-2xl font-bold mb-6'>Test: Received Service Requests</h1>
      <ReceivedRequestsList freelancerId={TEST_FREELANCER_ID} />
    </div>
  );
}
