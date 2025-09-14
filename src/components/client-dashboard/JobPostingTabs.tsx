'use client';

import { useState } from 'react';
import ViewJobPostingOverview from '@/components/client-dashboard/ViewJobPostingOverview';
import ViewJobPostingProposals from '@/components/client-dashboard/ViewJobPostingProposals';

export default function JobPostingTabs() {
  const [activeTab, setActiveTab] = useState<'overview' | 'proposals'>(
    'overview'
  );

  return (
    <div className='max-w-4xl mx-auto p-4'>
      {/* Tab Navigation */}
      <div className='border border-gray-200 rounded-lg mb-6 overflow-hidden'>
        <div className='flex'>
          <button
            className={`flex-1 py-3 px-6 font-medium transition ${
              activeTab === 'overview'
                ? 'bg-teal-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            View job posting
          </button>
          <button
            className={`flex-1 py-3 px-6 font-medium transition ${
              activeTab === 'proposals'
                ? 'bg-slate-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('proposals')}
          >
            Proposals
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <ViewJobPostingOverview />}
      {activeTab === 'proposals' && <ViewJobPostingProposals />}
    </div>
  );
}
