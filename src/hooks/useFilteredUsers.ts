import { useState, useEffect, useCallback } from 'react';
import { User, AdminUser, mapAdminUserToLegacy } from '@/interfaces/user.interface';
import { useAdminUsersApi } from '@/hooks/api-connections/use-admin-users-api';
import { UserFilters as ApiUserFilters } from '@/types/admin.types';

export function useFilteredUsers() {
  const [userType, setUserType] = useState<'Freelancer' | 'Customer'>('Freelancer');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userData, setUserData] = useState<User[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  const { fetchUsers, updateUser, loading, error } = useAdminUsersApi();

  const fetchUsersData = useCallback(async () => {
    const filters: ApiUserFilters = {
      page: currentPage,
      limit: 20,
    };

    if (searchQuery.trim()) {
      filters.search = searchQuery.trim();
    }

    if (roleFilter !== 'All') {
      if (roleFilter.toLowerCase() === 'freelancer') {
        filters.is_freelancer = true;
      } else if (roleFilter.toLowerCase() === 'customer' || roleFilter.toLowerCase() === 'client') {
        filters.is_freelancer = false;
      }
    }

    const response = await fetchUsers(filters);
    if (response) {
      setAdminUsers(response.data);
      setUserData(response.data.map(mapAdminUserToLegacy));
      setTotalPages(response.pagination.total_pages);
      setTotalUsers(response.pagination.total_users);
    }
  }, [currentPage, searchQuery, roleFilter, fetchUsers]);

  useEffect(() => {
    fetchUsersData();
  }, [fetchUsersData]);

  const getUserRole = (user: User): string => {
    if (user.role === 'Freelancer') return 'Freelancer';
    if (user.role === 'Customer' || user.role === 'Client') return 'Customer';
    return 'Unknown';
  };
  const filteredData = userData.filter((user) => {
    const matchesStatus =
      statusFilter === 'All' ||
      user.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesStatus;
  });

  const handleExport = () => {
    console.log('Exporting report...');
    alert('Report export initiated. This feature is currently stubbed.');
  };

  const handleViewFile = (userId: number) => {
    console.log(`Viewing file for user ID: ${userId}`);
  };

  const handleNotify = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleOverflowAction = (action: string, userId: number) => {
    const user = userData.find((u: User) => u.id === userId);
    if (!user) return;
    if (action === 'modify') {
      setUserToEdit(user);
      setIsEditModalOpen(true);
    } else if (action === 'view') {
      setSelectedUser(user);
      setIsViewModalOpen(true);
    } else {
      console.log(`Action ${action} for user ID: ${userId}`);
    }
  };

  return {
    userType,
    setUserType,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    date,
    setDate,
    isModalOpen,
    setIsModalOpen,
    selectedUser,
    setSelectedUser,
    isEditModalOpen,
    setIsEditModalOpen,
    userToEdit,
    setUserToEdit,
    userData,
    setUserData,
    isViewModalOpen,
    setIsViewModalOpen,
    filteredData,
    handleExport,
    handleViewFile,
    handleNotify,
    handleOverflowAction,
    loading,
    error,
    adminUsers,
    currentPage,
    setCurrentPage,
    totalPages,
    totalUsers,
    fetchUsersData,
    updateUser,
  };
}