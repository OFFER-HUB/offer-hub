import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { User } from '@/interfaces/user.interface';

type ViewUserModalProps = {
  isOpen: boolean;
  selectedUser: User | null;
  setIsViewModalOpen: (open: boolean) => void;
};

export function ViewUserModal({
  isOpen,
  selectedUser,
  setIsViewModalOpen,
}: ViewUserModalProps) {
  if (!isOpen || !selectedUser) return null;
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white rounded-md w-full max-w-lg mx-4 shadow-lg relative'>
        <div className='flex items-center justify-between border-b p-4'>
          <h3 className='text-lg font-medium'>User Details</h3>
          <button
            onClick={() => setIsViewModalOpen(false)}
            className='text-gray-500 hover:text-gray-700 focus:outline-none'
          >
            <X size={20} />
          </button>
        </div>
        <div className='p-4 space-y-3 text-sm text-gray-700'>
          <p><strong>Name:</strong> {selectedUser.name}</p>
          <p><strong>Email:</strong> {selectedUser.email}</p>
          <p><strong>Status:</strong> {selectedUser.status}</p>
          <p><strong>Email Validated:</strong> {selectedUser.emailValidated ? 'Yes' : 'No'}</p>
          <p><strong>Identity Card:</strong> {selectedUser.identityCard}</p>
          <p><strong>Submission Date:</strong> {new Date(selectedUser.submissionDate).toLocaleDateString('en-US')}</p>
        </div>
        <div className='flex justify-end p-4 border-t'>
          <Button
            variant='outline'
            onClick={() => setIsViewModalOpen(false)}
            className='border-gray-300 text-gray-700'
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}