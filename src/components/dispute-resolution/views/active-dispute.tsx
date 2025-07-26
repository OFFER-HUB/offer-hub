import DisputeTable, {
  DisputeTableColumn,
} from '@/components/table/DisputeTable';
import { FaCaretDown, FaRegCopy } from 'react-icons/fa';
import React, { useState } from 'react';

import { DisputeRow } from '@/types';
import Link from 'next/link';
import { SlMagnifier } from 'react-icons/sl';
import { useMockDisputes } from '@/data/generic-mock-data';

const columns: DisputeTableColumn<DisputeRow>[] = [
  { key: 'createdAt', label: 'Date Initiated' },
  { key: 'name', label: 'Customer Name' },
  {
    key: 'ticket',
    label: 'Ticket ID',
    render: (row) => (
      <span className="flex items-center gap-2 text-blue-600">
        <span className="underline cursor-pointer">{row.ticket}</span>
        <FaRegCopy
          className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
          onClick={() => navigator.clipboard.writeText(row.ticket)}
        />
      </span>
    ),
  },
  {
    key: 'email',
    label: 'Email address',
    render: (row) =>
      row.email.length > 25 ? row.email.slice(0, 25) + '...' : row.email,
  },
  {
    key: 'action',
    label: 'Action',
    render: (row) => (
      <Link
        href={`/admin/dispute-resolution/${row.ticket}/chat`}
        className="text-blue-500 hover:underline"
      >
        View Dispute
      </Link>
    ),
  },
];

export default function ActiveDispute() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRole, setSelectedRole] = useState('freelancer');
  const {
    loading,
    filtering,
    disputes: data,
    searchTerm,
    selectedDate,
    search,
  } = useMockDisputes(10);

  return (
    <div
      className="p-6 space-y-6"
      style={{
        minHeight: '100vh',
      }}
    >
      {/* Header with All transaction button and Security Alerts */}
      <div
        className="flex items-center gap-4"
        style={{ backgroundColor: '#FFFFFF', padding: '16px' }}
      >
        <button
          onClick={() => setActiveTab('all')}
          className="bg-[#002333] text-white text-sm font-medium transition-colors hover:bg-[#003344]"
          style={{
            width: '131px',
            height: '40px',
            borderRadius: '24px',
            padding: '9px 12px 10px 12px',
            gap: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          All transaction
        </button>
        <div className="text-sm font-medium text-gray-600">Security Alerts</div>
      </div>

      {/* Filter Controls Section */}
      <div className="grid w-full grid-cols-1 gap-5 p-3 mx-auto bg-white xl:grid-cols-2">
        {/* Left Group: Freelancer + View user + Search */}
        <div className="flex items-center justify-start gap-3">
          {/* Role Selector */}
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-[5px] pr-8 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="freelancer">Freelancer</option>
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
            <FaCaretDown
              className="absolute text-black transform -translate-y-1/2 border border-black rounded-full pointer-events-none right-2 top-1/2"
              size={12}
            />
          </div>

          {/* View User Button */}
          <button className="text-sm font-medium whitespace-nowrap text-white transition-colors bg-teal-600 hover:bg-teal-700 px-4 py-[5px] rounded">
            View user
          </button>

          {/* Search Bar */}
          <div className="relative flex justify-around border rounded-sm">
            <input
              type="text"
              placeholder="Search by customer name"
              value={searchTerm}
              onChange={(e) => search(e.target.value)}
              className="w-full px-3 py-1 text-sm border border-transparent border-gray-300 rounded-sm pr-7 focus:outline-none focus:ring-0"
              style={{
                paddingRight: '40px',
              }}
            />
            <button className="flex items-center justify-center px-2 border-l hover:bg-gray-100">
              <SlMagnifier className="text-gray-400 transform " size={16} />
            </button>
          </div>
        </div>

        {/* Right Group: Date + Filter + Export */}
        <div className="flex items-center justify-start gap-4 xl:justify-end">
          {/* Date Selector */}
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => search(e.target.value, 'date')}
              className="px-4 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Select date"
            />
          </div>

          {/* Filter Button */}
          <button className="px-4 py-1 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-sm hover:bg-gray-50">
            Filter
          </button>

          {/* Export Report Button */}
          <button
            className="bg-[#002333] hover:bg-[#003344] text-white text-sm font-medium transition-colors whitespace-nowrap"
            style={{
              minWidth: '122px',
              height: '32px',
              borderRadius: '25px',
              padding: '5px 16px 5px 16px',
            }}
          >
            Export Report
          </button>
        </div>
      </div>

      <DisputeTable
        columns={columns}
        data={data}
        isLoading={loading}
        isFiltering={filtering}
      />
    </div>
  );
}
