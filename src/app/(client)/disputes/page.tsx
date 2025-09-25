'use client';

import DisputeLayout from '@/components/disputes/DisputeLayout';
import DisputesDashboard from '@/components/disputes/DisputesDashboard';
import { mockDisputes } from '@/lib/mockData/disputes-mock';
import React from 'react';

export default function DisputesPage() {
  return (
    <DisputeLayout>
     <DisputesDashboard disputes={mockDisputes} />
    </DisputeLayout>
  );
}