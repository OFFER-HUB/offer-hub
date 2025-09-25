'use client'

import { useState } from 'react'
import { UserAnalyticsCardView, UserAnalyticsModal, UserAnalyticsTableView, UserFilters } from './components'
import { useFilteredUsers } from '@/hooks/useFilteredUsers'
import { User } from '@/interfaces/user.interface'

export default function UserAnalyticsTable() {
  const {
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    date,
    setDate,
    handleExport,
    userType,
    filteredData
  } = useFilteredUsers();
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const handleViewAnalytics = (user: User) => {
    setSelectedUser(user)
    setIsAnalyticsModalOpen(true)
  }

  const handleOverflowAction = (action: string, userId: number) => {
    console.log(`Action ${action} for user ID: ${userId}`)
  }

  return (
    <div className='space-y-4 md:space-y-6 mb-3'>
      <UserFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        date={date}
        setDate={setDate}
        handleExport={handleExport}
        userType={userType}
      />

      <UserAnalyticsTableView data={filteredData} onViewAnalytics={handleViewAnalytics} onOverflowAction={handleOverflowAction} />

      <UserAnalyticsCardView data={filteredData} onViewAnalytics={handleViewAnalytics} onOverflowAction={handleOverflowAction} />

      <UserAnalyticsModal user={selectedUser} open={isAnalyticsModalOpen} onClose={() => setIsAnalyticsModalOpen(false)} />
    </div>
  )
}
