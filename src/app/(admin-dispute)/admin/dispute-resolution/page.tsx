'use client';

import ActiveDispute from '@/components/dispute-resolution/views/active-dispute';
import DisputeTabs from '@/components/dispute-resolution/Tabs';
import React from 'react';
import ResolvedDispute from '@/components/dispute-resolution/views/resolved-dispute';
import UnassignedDispute from '@/components/dispute-resolution/views/unassigned-dispute';

export default function DisputeResolutionPage() {
  return (
    <div className="p-0">
      <DisputeTabs
        defaultValue="unassigned"
        tabsListclassName="!bg-white !rounded-none !p-4 !h-auto border-b"
        tabs={[
          {
            label: 'Unassigned dispute',
            value: 'unassigned',
            component: <UnassignedDispute />,
          },
          {
            label: 'Active',
            value: 'active',
            component: <ActiveDispute />,
          },
          {
            label: 'Resolved dispute',
            value: 'resolved',
            component: <ResolvedDispute />,
          },
        ]}
      />
    </div>
  );
}
