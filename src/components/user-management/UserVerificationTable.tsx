'use client';

import { useFilteredUsers } from '@/hooks/useFilteredUsers';
import NotificationModal from './notify';
import { EditUserModal, UserCards, UserFilters, UserTable, ViewUserModal } from './components';

export default function UserVerificationTable() {
  const {
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    date,
    setDate,
    userType,
    filteredData,
    handleExport,
    handleViewFile,
    handleNotify,
    handleOverflowAction,
    isModalOpen,
    selectedUser,
    setIsModalOpen,
    isEditModalOpen,
    userToEdit,
    setIsEditModalOpen,
    setUserToEdit,
    setUserData,
    isViewModalOpen,
    setIsViewModalOpen,
  } = useFilteredUsers();

  return (
    <div className='space-y-4 md:space-y-6 mb-3'>
      <UserFilters
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        date={date}
        setDate={setDate}
        handleExport={handleExport}
        userType={userType}
      />

      <UserTable
        filteredData={filteredData}
        handleViewFile={handleViewFile}
        handleNotify={handleNotify}
        handleOverflowAction={handleOverflowAction}
      />

      <UserCards
        filteredData={filteredData}
        handleViewFile={handleViewFile}
        handleNotify={handleNotify}
        handleOverflowAction={handleOverflowAction}
      />

      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        userToEdit={userToEdit}
        setIsEditModalOpen={setIsEditModalOpen}
        setUserToEdit={setUserToEdit}
        setUserData={setUserData}
      />

      <ViewUserModal
        isOpen={isViewModalOpen}
        selectedUser={selectedUser}
        setIsViewModalOpen={setIsViewModalOpen}
      />
    </div>
  );
}