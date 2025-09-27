'use client';

import React, { useState } from 'react';
import withErrorBoundary from "@/components/shared/WithErrorBoundary";
import { useConfirmation } from '@/hooks/use-confirmation';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  UserCheck,
  UserX,
  Mail,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUserManagement } from '@/hooks/use-admin-dashboard';
import { PlatformUser, BulkUserAction } from '@/types/admin.types';
import { adminService } from '@/services/admin.service';

interface UserRowProps {
  user: PlatformUser;
  isSelected: boolean;
  onSelect: (userId: string) => void;
  onViewDetails: (user: PlatformUser) => void;
  onUpdateUser: (user: PlatformUser) => void;
}

function UserRow({
  user,
  isSelected,
  onSelect,
  onViewDetails,
  onUpdateUser,
}: UserRowProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const [showStatusConfirmation, setShowStatusConfirmation] = useState(false);

  const handleStatusToggle = async () => {
    setShowStatusConfirmation(true);
  };

  const executeStatusChange = async () => {
    setIsUpdating(true);
    try {
      if (user.isActive) {
        await adminService.suspendUser(user.id, 'Manual suspension by admin');
      } else {
        await adminService.activateUser(user.id);
      }
      onUpdateUser({ ...user, isActive: !user.isActive });
    } catch (error) {
      console.error('Failed to update user status:', error);
    } finally {
      setIsUpdating(false);
      setShowStatusConfirmation(false);
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge variant='default' className='bg-green-100 text-green-800'>
            Verified
          </Badge>
        );
      case 'pending':
        return <Badge variant='secondary'>Pending</Badge>;
      case 'rejected':
        return <Badge variant='destructive'>Rejected</Badge>;
      default:
        return <Badge variant='outline'>Unknown</Badge>;
    }
  };

  const getUserTypeBadge = (type: string) => {
    return (
      <Badge variant={type === 'freelancer' ? 'default' : 'secondary'}>
        {type === 'freelancer' ? 'Freelancer' : 'Client'}
      </Badge>
    );
  };

  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(user.id)}
        />
      </TableCell>
      <TableCell>
        <div className='flex items-center space-x-3'>
          <div className='h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center'>
            {user.firstName.charAt(0)}
            {user.lastName.charAt(0)}
          </div>
          <div>
            <p className='font-medium'>
              {user.firstName} {user.lastName}
            </p>
            <p className='text-sm text-muted-foreground'>{user.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>{getUserTypeBadge(user.userType)}</TableCell>
      <TableCell>{getVerificationBadge(user.verificationStatus)}</TableCell>
      <TableCell>
        <Badge variant={user.isActive ? 'default' : 'destructive'}>
          {user.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className='flex items-center space-x-1'>
          <span className='text-sm'>{user.rating.toFixed(1)}</span>
          <span className='text-yellow-500'>★</span>
        </div>
      </TableCell>
      <TableCell className='text-sm text-muted-foreground'>
        {new Date(user.joinedAt).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => onViewDetails(user)}>
              <Eye className='h-4 w-4 mr-2' />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleStatusToggle}
              disabled={isUpdating}
            >
              {user.isActive ? (
                <>
                  <UserX className='h-4 w-4 mr-2' />
                  Suspend User
                </>
              ) : (
                <>
                  <UserCheck className='h-4 w-4 mr-2' />
                  Activate User
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className='h-4 w-4 mr-2' />
              Send Message
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
      <ConfirmationDialog
        isOpen={showStatusConfirmation}
        onClose={() => setShowStatusConfirmation(false)}
        onConfirm={executeStatusChange}
        title={user.isActive ? 'Suspend User' : 'Activate User'}
        description={user.isActive 
          ? `Are you sure you want to suspend ${user.firstName} ${user.lastName}? This will prevent them from accessing the platform.`
          : `Are you sure you want to activate ${user.firstName} ${user.lastName}? This will restore their access to the platform.`
        }
        confirmText={user.isActive ? 'Suspend' : 'Activate'}
        variant={user.isActive ? 'destructive' : 'default'}
      />
    </TableRow>
  );
}

interface BulkActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUserIds: string[];
  onExecute: (action: BulkUserAction) => void;
}

function BulkActionDialog({
  isOpen,
  onClose,
  selectedUserIds,
  onExecute,
}: BulkActionDialogProps) {
  const [action, setAction] = useState<
    'activate' | 'deactivate' | 'verify' | 'suspend' | 'send_message'
  >('activate');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleExecute = () => {
    setShowConfirmation(true);
  };

  const executeAction = async () => {
    setIsExecuting(true);
    try {
      await onExecute({
        action,
        userIds: selectedUserIds,
        reason: reason || undefined,
        message: message || undefined,
      });
      onClose();
      setReason('');
      setMessage('');
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsExecuting(false);
      setShowConfirmation(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Action</DialogTitle>
          <DialogDescription>
            Perform action on {selectedUserIds.length} selected user(s)
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <Label htmlFor='action'>Action</Label>
            <Select
              value={action}
              onValueChange={(value: typeof action) => setAction(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='activate'>Activate Users</SelectItem>
                <SelectItem value='deactivate'>Deactivate Users</SelectItem>
                <SelectItem value='verify'>Verify Users</SelectItem>
                <SelectItem value='suspend'>Suspend Users</SelectItem>
                <SelectItem value='send_message'>Send Message</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(action === 'suspend' || action === 'deactivate') && (
            <div>
              <Label htmlFor='reason'>Reason</Label>
              <Textarea
                id='reason'
                placeholder='Enter reason for this action...'
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          )}

          {action === 'send_message' && (
            <div>
              <Label htmlFor='message'>Message</Label>
              <Textarea
                id='message'
                placeholder='Enter message to send...'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleExecute}
            disabled={isExecuting || (action === 'send_message' && !message)}
          >
            {isExecuting ? 'Executing...' : 'Execute Action'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface UserDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: PlatformUser | null;
}

function UserDetailsDialog({ isOpen, onClose, user }: UserDetailsDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                Name
              </Label>
              <p className='text-sm font-medium'>
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                Email
              </Label>
              <p className='text-sm'>{user.email}</p>
            </div>
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                User Type
              </Label>
              <p className='text-sm capitalize'>{user.userType}</p>
            </div>
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                Verification Status
              </Label>
              <p className='text-sm capitalize'>{user.verificationStatus}</p>
            </div>
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                Rating
              </Label>
              <p className='text-sm'>{user.rating.toFixed(1)} ★</p>
            </div>
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                Projects Completed
              </Label>
              <p className='text-sm'>{user.projectsCompleted}</p>
            </div>
            <div>
              <Label className='text-sm font-medium text-muted-.foreground'>
                Profile Completeness
              </Label>
              <p className='text-sm'>{user.profileCompleteness}%</p>
            </div>
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                Joined Date
              </Label>
              <p className='text-sm'>
                {new Date(user.joinedAt).toLocaleDateString()}
              </p>
            </div>
            {user.location && (
              <div>
                <Label className='text-sm font-medium text-muted-foreground'>
                  Location
                </Label>
                <p className='text-sm'>{user.location}</p>
              </div>
            )}
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                Last Active
              </Label>
              <p className='text-sm'>
                {new Date(user.lastActiveAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {user.userType === 'freelancer' && user.totalEarnings && (
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                Total Earnings
              </Label>
              <p className='text-sm font-medium'>
                ${user.totalEarnings.toLocaleString()}
              </p>
            </div>
          )}

          {user.userType === 'client' && user.totalSpent && (
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>
                Total Spent
              </Label>
              <p className='text-sm font-medium'>
                ${user.totalSpent.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UserManagement() {
  const {
    users,
    totalUsers,
    currentPage,
    totalPages,
    filters,
    selectedUsers,
    isLoading,
    error,
    updateFilters,
    toggleUserSelection,
    selectAllUsers,
    clearSelection,
    searchUsers,
    setCurrentPage,
  } = useUserManagement();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchUsers(query);
    } else {
      updateFilters({});
    }
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    updateFilters(newFilters);
  };

  const handleBulkAction = async (action: BulkUserAction) => {
    try {
      await adminService.bulkUserAction(action);
      clearSelection();
      // Refresh the user list
      window.location.reload();
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const handleViewUserDetails = (user: PlatformUser) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleUpdateUser = () => {
    // This would typically update the local state
    // For now, we'll refresh the list
    window.location.reload();
  };

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>User Management</h1>
          <p className='text-muted-foreground'>
            Manage platform users and their permissions
          </p>
        </div>
        <div className='flex items-center space-x-3'>
          <Button variant='outline'>
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
          {selectedUsers.length > 0 && (
            <Button onClick={() => setShowBulkDialog(true)}>
              Bulk Actions ({selectedUsers.length})
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center space-x-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search users by name, email, or ID...'
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <Button
              variant='outline'
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className='h-4 w-4 mr-2' />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className='mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4'>
              <Select
                value={filters.userType || 'all'}
                onValueChange={(value) =>
                  handleFilterChange({
                    ...filters,
                    userType:
                      value === 'all'
                        ? undefined
                        : (value as 'client' | 'freelancer'),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='User Type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Types</SelectItem>
                  <SelectItem value='client'>Clients</SelectItem>
                  <SelectItem value='freelancer'>Freelancers</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.verificationStatus || 'all'}
                onValueChange={(value) =>
                  handleFilterChange({
                    ...filters,
                    verificationStatus:
                      value === 'all'
                        ? undefined
                        : (value as 'pending' | 'verified' | 'rejected'),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Verification' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Status</SelectItem>
                  <SelectItem value='verified'>Verified</SelectItem>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='rejected'>Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={
                  filters.isActive !== undefined
                    ? filters.isActive
                      ? 'active'
                      : 'inactive'
                    : 'all'
                }
                onValueChange={(value) =>
                  handleFilterChange({
                    ...filters,
                    isActive: value === 'all' ? undefined : value === 'active',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Status</SelectItem>
                  <SelectItem value='active'>Active</SelectItem>
                  <SelectItem value='inactive'>Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder='Location'
                value={filters.location || ''}
                onChange={(e) =>
                  handleFilterChange({ ...filters, location: e.target.value })
                }
              />

              <Button
                variant='outline'
                onClick={() => {
                  updateFilters({});
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Users ({totalUsers.toLocaleString()})</CardTitle>
            <div className='flex items-center space-x-2'>
              {selectedUsers.length > 0 && (
                <>
                  <Button variant='outline' size='sm' onClick={selectAllUsers}>
                    Select All
                  </Button>
                  <Button variant='outline' size='sm' onClick={clearSelection}>
                    Clear Selection
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className='text-center py-8'>
              <p className='text-red-600'>{error}</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Checkbox
                        checked={
                          selectedUsers.length === users.length &&
                          users.length > 0
                        }
                        onCheckedChange={() =>
                          selectedUsers.length === users.length
                            ? clearSelection()
                            : selectAllUsers()
                        }
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading
                    ? Array.from({ length: 10 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className='h-4 w-4 bg-gray-200 animate-pulse rounded' />
                          </TableCell>
                          <TableCell>
                            <div className='h-4 w-32 bg-gray-200 animate-pulse rounded' />
                          </TableCell>
                          <TableCell>
                            <div className='h-4 w-16 bg-gray-200 animate-pulse rounded' />
                          </TableCell>
                          <TableCell>
                            <div className='h-4 w-16 bg-gray-200 animate-pulse rounded' />
                          </TableCell>
                          <TableCell>
                            <div className='h-4 w-16 bg-gray-200 animate-pulse rounded' />
                          </TableCell>
                          <TableCell>
                            <div className='h-4 w-12 bg-gray-200 animate-pulse rounded' />
                          </TableCell>
                          <TableCell>
                            <div className='h-4 w-20 bg-gray-200 animate-pulse rounded' />
                          </TableCell>
                          <TableCell>
                            <div className='h-4 w-8 bg-gray-200 animate-pulse rounded' />
                          </TableCell>
                        </TableRow>
                      ))
                    : users.map((user) => (
                        <UserRow
                          key={user.id}
                          user={user}
                          isSelected={selectedUsers.includes(user.id)}
                          onSelect={toggleUserSelection}
                          onViewDetails={handleViewUserDetails}
                          onUpdateUser={handleUpdateUser}
                        />
                      ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='flex items-center justify-between mt-6'>
                  <p className='text-sm text-muted-foreground'>
                    Showing {(currentPage - 1) * 20 + 1} to{' '}
                    {Math.min(currentPage * 20, totalUsers)} of {totalUsers}{' '}
                    users
                  </p>
                  <div className='flex items-center space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className='h-4 w-4' />
                      Previous
                    </Button>
                    <span className='text-sm'>
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <BulkActionDialog
        isOpen={showBulkDialog}
        onClose={() => setShowBulkDialog(false)}
        selectedUserIds={selectedUsers}
        onExecute={handleBulkAction}
      />

      <UserDetailsDialog
        isOpen={showUserDetails}
        onClose={() => {
          setShowUserDetails(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </div>
  );
}

export default withErrorBoundary(UserManagement);