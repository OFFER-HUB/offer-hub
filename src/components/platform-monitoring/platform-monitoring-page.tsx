'use client';

import { useState } from 'react';
import MonitoringTable from './monitoring-table';
import FilterToolbar from './filter-toolbar';
import ViewUserDetails from './view-userdetails';

// Types
export interface Transaction {
  date: string;
  userId: string;
  customerName: string;
  email: string;
  amount: string;
  status: 'high' | 'low';
}

export interface UserDetail {
  date: string;
  payerUserId: string;
  payerName: string;
  payerEmail: string;
  amount: string;
}

export interface SelectedUser {
  name: string;
  role: string;
  location: string;
  avatar: string;
}

// Sample data
const transactionData: Transaction[] = [
  {
    date: '4 April 2025 • 14:03:09',
    userId: 'wdsh1245w',
    customerName: 'Darlene Robertson',
    email: 'contact@smartsolu...',
    amount: '$850',
    status: 'high',
  },
  {
    date: '4 April 2025 • 14:03:09',
    userId: 'wdsh1245w',
    customerName: 'Guy Hawkins',
    email: 'contact@creativeh...',
    amount: '$770',
    status: 'low',
  },
  {
    date: '4 April 2025 • 14:03:09',
    userId: 'wdsh1245w',
    customerName: 'Esther Howard',
    email: 'support@innovative...',
    amount: '$900',
    status: 'high',
  },
  {
    date: '4 April 2025 • 14:03:09',
    userId: 'wdsh1245w',
    customerName: 'Wade Warren',
    email: 'info@dynamicdesig...',
    amount: '$750',
    status: 'low',
  },
  {
    date: '4 April 2025 • 14:03:09',
    userId: 'wdsh1245w',
    customerName: 'Devon Lane',
    email: 'hello@nextgenapps...',
    amount: '$780',
    status: 'high',
  },
  {
    date: '4 April 2025 • 14:03:09',
    userId: 'wdsh1245w',
    customerName: 'Kathryn Murphy',
    email: 'reachus@futuretec...',
    amount: '$720',
    status: 'low',
  },
  {
    date: '4 April 2025 • 14:03:09',
    userId: 'wdsh1245w',
    customerName: 'Cameron Williamson',
    email: 'connect@visionary...',
    amount: '$760',
    status: 'low',
  },
  {
    date: '4 April 2025 • 14:03:09',
    userId: 'wdsh1245w',
    customerName: 'Floyd Miles',
    email: 'team@pioneerdigit...',
    amount: '$730',
    status: 'high',
  },
  {
    date: '4 April 2025 • 14:03:09',
    userId: 'wdsh1245w',
    customerName: 'Ronald Richards',
    email: 'service@elevatede...',
    amount: '$740',
    status: 'high',
  },
  {
    date: '4 April 2025 • 14:03:09',
    userId: 'wdsh1245w',
    customerName: 'Annette Black',
    email: 'info@creativeinnov...',
    amount: '$800',
    status: 'high',
  },
  {
    date: '4 April 2025 • 14:03:09',
    userId: 'wdsh1245w',
    customerName: 'Dianne Russell',
    email: 'support@brilliantd...',
    amount: '$700',
    status: 'high',
  },
  {
    date: '4 April 2025 • 14:03:09',
    userId: 'wdsh1245w',
    customerName: 'Theresa Webb',
    email: 'hello@cuttingedge...',
    amount: '$810',
    status: 'high',
  },
];

export default function PlatformMonitoringTable() {
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SelectedUser>({
    name: 'John D',
    role: 'UI/UX designer | Brand designer | Figma pro',
    location: 'Canada',
    avatar: '/placeholder.svg?height=60&width=60',
  });

  const handleViewAllTransactions = (customer: {
    name: string;
    userId: string;
    email: string;
  }) => {
    setSelectedUser({
      name: customer.name,
      role: 'UI/UX designer | Brand designer | Figma pro',
      location: 'Canada',
      avatar: '/placeholder.svg?height=60&width=60',
    });
    setShowUserDetail(true);
  };

  const handleUserClick = () => {
    setShowUserDetail(true);
  };

  return (
    <div>
      <div>
        {/* Content */}
        <div>
          {showUserDetail ? (
            <ViewUserDetails />
          ) : (
            <>
              <FilterToolbar />

              <MonitoringTable
                transactionData={transactionData}
                selectedUser={selectedUser}
                onViewAllTransactions={handleViewAllTransactions}
                onUserClick={handleUserClick}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
