import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User } from '@/interfaces/user.interface';

type EditUserModalProps = {
  isOpen: boolean;
  userToEdit: User | null;
  setIsEditModalOpen: (open: boolean) => void;
  setUserToEdit: (user: User) => void;
  setUserData: React.Dispatch<React.SetStateAction<User[]>>;
};

export function EditUserModal({
  isOpen,
  userToEdit,
  setIsEditModalOpen,
  setUserToEdit,
  setUserData,
}: EditUserModalProps) {
  if (!isOpen || !userToEdit) return null;
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white rounded-md w-full max-w-xl mx-4 shadow-lg relative'>
        <div className='flex items-center justify-between border-b p-4'>
          <h3 className='text-lg font-medium'>Modify User</h3>
          <button
            onClick={() => setIsEditModalOpen(false)}
            className='text-gray-500 hover:text-gray-700 focus:outline-none'
          >
            <X size={20} />
          </button>
        </div>
        <div className='p-4 space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Name
            </label>
            <Input
              value={userToEdit?.name ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUserToEdit({ ...userToEdit, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Email
            </label>
            <Input
              value={userToEdit?.email ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUserToEdit({ ...userToEdit, email: e.target.value })
              }
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Status
            </label>
            <Select
              value={userToEdit?.status ?? ''}
              onValueChange={(value: string) =>
                setUserToEdit({ ...userToEdit, status: value })
              }
            >
              <SelectTrigger className='w-full border-[#B4B9C9] rounded-none h-10'>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Pending'>Pending</SelectItem>
                <SelectItem value='Approved'>Approved</SelectItem>
                <SelectItem value='Rejected'>Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className='flex items-center justify-end gap-3 p-4 border-t'>
          <Button
            variant='outline'
            onClick={() => setIsEditModalOpen(false)}
            className='border-gray-300 text-gray-700'
          >
            Cancel
          </Button>
          <Button
            className='bg-[#002333] hover:bg-[#001a26] text-white'
            onClick={() => {
              setUserData((prevData) =>
                prevData.map((u) =>
                  u.id === userToEdit.id ? userToEdit : u
                )
              );
              setIsEditModalOpen(false);
            }}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}