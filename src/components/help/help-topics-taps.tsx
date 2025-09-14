'use client';

import { useState } from 'react';

const tabs = [
  'Getting Started',
  'Account & Profile',
  'Projects & Payments',
  'Troubleshooting',
];

const content: Record<
  string,
  { title: string; description: string; new?: boolean }[]
> = {
  'Getting Started': [
    {
      title: 'Creating Your Account',
      description: 'Step-by-step guide on registering a new account.',
    },
    {
      title: 'Building Your Profile',
      description: 'Tips for creating a strong and trustworthy profile.',
    },
    {
      title: 'Finding Your Project',
      description: 'How to browse and find the right project for you.',
    },
    {
      title: 'Posting Your First Job',
      description: 'Guide to publishing your first job as a client.',
      new: true,
    },
  ],
  'Account & Profile': [
    {
      title: 'Managing Account Settings',
      description: 'Update your personal details and preferences.',
    },
    {
      title: 'Security Best Practices',
      description: 'Protect your account with 2FA and other tips.',
    },
    {
      title: 'Notification Settings',
      description: 'Customize how and when you receive updates.',
    },
    {
      title: 'Linking Social Accounts',
      description: 'Connect Facebook, Google, and more to your profile.',
      new: true,
    },
  ],
  'Projects & Payments': [
    {
      title: 'Creating Milestones',
      description: 'How to break down projects into manageable milestones.',
    },
    {
      title: 'Payment Methods',
      description:
        'Overview of available payment options and how to set them up.',
    },
    {
      title: 'Contracts & Agreements',
      description: 'Understanding the legal aspects of freelance contracts.',
    },
    {
      title: 'Dispute Resolution',
      description: 'Steps to take if there’s a disagreement about a project.',
      new: true,
    },
  ],
  Troubleshooting: [
    {
      title: 'Login Issues',
      description: 'Recover your account and resolve sign-in problems.',
    },
    {
      title: 'Payment Troubleshooting',
      description: 'Fix errors and delays in payment processing.',
    },
    {
      title: 'Communicating Problems',
      description: 'What to do when messaging or calls aren’t working.',
    },
    {
      title: 'Mobile App Troubleshooting',
      description: 'Fix bugs and performance issues on the mobile app.',
      new: true,
    },
  ],
};

export default function HelpTopicsTabs() {
  const [activeTab, setActiveTab] = useState('Getting Started');

  return (
    <section className='max-w-6xl mx-auto px-4 py-12'>
      <h2 className='text-2xl font-bold text-center mb-2'>
        Browse Help Topics
      </h2>
      <p className='text-center text-gray-600 mb-6'>
        Explore our comprehensive guides and tutorials to get the most out of
        Offer Hub
      </p>

      <div className='flex flex-wrap justify-center gap-2 mb-8'>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              tab === activeTab
                ? 'bg-gray-300 text-gray-900'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className='grid sm:grid-cols-2 gap-6'>
        {content[activeTab].map((item, idx) => (
          <div
            key={idx}
            className='bg-white shadow-sm border rounded-lg p-4 hover:shadow-md transition-shadow'
          >
            <div className='flex items-center justify-between'>
              <h3 className='font-semibold text-gray-900'>{item.title}</h3>
              {item.new && (
                <span className='bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full'>
                  New
                </span>
              )}
            </div>
            <p className='text-sm text-gray-600 mt-1 mb-2'>
              {item.description}
            </p>
            <a
              href='#'
              className='text-teal-600 text-sm font-medium hover:underline'
            >
              Read article →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
