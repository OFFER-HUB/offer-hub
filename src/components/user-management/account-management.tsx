import { useFilteredUsers } from '@/hooks/useFilteredUsers';
import { useState } from 'react';
import { AccountTable, UserFilters } from './components';
import { RestrictAccountDialog } from './restrict-account-dialog';
import { UserChat } from './user-chat';
import UserProfile from './user-profile';


export default function AccountManagementTable() {
  const [showChat, setShowChat] = useState(false);
  const [restrictDialogOpen, setRestrictDialogOpen] = useState(false);

  const {
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    searchQuery,
    selectedUser,
    setSearchQuery,
    filteredData: filteredUsers,
    setDate,
    date,
    handleExport,
    setSelectedUser,
  } = useFilteredUsers();

  const handleViewProfile = (userId: number) => {
    const user = filteredUsers.find((u) => u.id === userId);
    if (user) {
      setSelectedUser(user);
    }
  };

  const handleBack = () => {
    setSelectedUser(null);
    setShowChat(false);
  };

  const handleMessage = () => {
    setShowChat(true);
  };

  const handleRestrictAccount = () => {
    setRestrictDialogOpen(true);
  };

  if (selectedUser) {
    if (showChat) {
      return <UserChat onBack={handleBack} />;
    } else {
      return (
        <div className='p-6'>
          <UserProfile
            onBack={handleBack}
            onMessage={handleMessage}
            onRestrictAccount={handleRestrictAccount}
          />
          <RestrictAccountDialog
            open={restrictDialogOpen}
            onOpenChange={setRestrictDialogOpen}
          />
        </div>
      );
    }
  }
  return (
    <div className='flex flex-col space-y-4'>
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
        userType='Freelancer'
      />

      <div className='rounded-md border'>
        <AccountTable users={filteredUsers} onViewProfile={handleViewProfile} />
      </div>
    </div>
  );
}
