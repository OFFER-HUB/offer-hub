'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { X, Bold, Italic, Link, Image, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Code, Eye } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any; // You should replace 'any' with a proper user type interface
}

export default function NotificationModal({ isOpen, onClose, user }: NotificationModalProps) {
  const [message, setMessage] = useState(
    'Hi [Customer name]\n\nCongratulations! Your KYC upgrade request has been approved, you can start transacting without limit.\n\nXYZ team'
  );
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div 
        ref={modalRef}
        className='bg-white rounded-md w-full max-w-xl mx-4 shadow-lg' 
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className='flex items-center justify-between border-b p-4'>
          <h3 className='text-lg font-medium'>Send notification</h3>
          <button 
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 focus:outline-none'
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className='p-4'>
          {/* Rich text editor toolbar */}
          <div className='flex items-center gap-2 border rounded-md p-2 mb-3 overflow-x-auto'>
            <div className='flex items-center'>
              <select className='text-sm border-0 focus:ring-0 outline-none pr-1 bg-transparent'>
                <option>14px</option>
                <option>16px</option>
                <option>18px</option>
                <option>20px</option>
              </select>
            </div>
            <button className='p-1 hover:bg-gray-100 rounded'>
              <Bold size={18} />
            </button>
            <button className='p-1 hover:bg-gray-100 rounded'>
              <Italic size={18} />
            </button>
            <button className='p-1 hover:bg-gray-100 rounded'>
              <Link size={18} />
            </button>
            <button className='p-1 hover:bg-gray-100 rounded'>
              <Image size={18} />
            </button>
            <div className='h-6 w-px bg-gray-300 mx-1'></div>
            <button className='p-1 hover:bg-gray-100 rounded'>
              <List size={18} />
            </button>
            <button className='p-1 hover:bg-gray-100 rounded'>
              <ListOrdered size={18} />
            </button>
            <div className='h-6 w-px bg-gray-300 mx-1'></div>
            <button className='p-1 hover:bg-gray-100 rounded'>
              <AlignLeft size={18} />
            </button>
            <button className='p-1 hover:bg-gray-100 rounded'>
              <AlignCenter size={18} />
            </button>
            <button className='p-1 hover:bg-gray-100 rounded'>
              <AlignRight size={18} />
            </button>
            <div className='h-6 w-px bg-gray-300 mx-1'></div>
            <button className='p-1 hover:bg-gray-100 rounded'>
              <Code size={18} />
            </button>
            <button className='p-1 hover:bg-gray-100 rounded'>
              <Eye size={18} />
            </button>
          </div>
          
          {/* Text editor area */}
          <textarea
            value={message}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
            className='w-full h-40 p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none'
            placeholder='Type your message here...'
          />
        </div>

        {/* Modal Footer */}
        <div className='flex items-center justify-end gap-3 p-4 border-t'>
          <Button 
            variant='outline' 
            onClick={onClose}
            className='border-gray-300 text-gray-700'
          >
            Cancel
          </Button>
          <Button 
            className='bg-blue-600 hover:bg-blue-700 text-white'
            onClick={onClose}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}