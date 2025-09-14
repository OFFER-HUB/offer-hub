'use client';

import React from 'react';
import SentRequestsList from '@/components/client-dashboard/sent-requests';

const TEST_CLIENT_ID = '080471dc-96d0-48b9-bee6-f8450f92c7fe';

export default function TestSentRequestsPage() {
  return (
    <div className='p-8'>
      <h1 className='text-2xl font-bold mb-6'>Test: Sent Service Requests</h1>
      <SentRequestsList clientId={TEST_CLIENT_ID} />
    </div>
  );
}
