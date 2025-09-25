
'use client'

import React, { useState } from 'react';
import { useServiceRequestsApi } from '@/hooks/api-connections/use-service-requests-api';
import { VALIDATION_LIMITS } from '@/constants/magic-numbers';

//import { useUser } from '@/providers/user-context';

interface ServiceRequestModalProps {
  open: boolean;
  onClose: () => void;
  serviceId: string;
}

const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({ open, onClose, serviceId }) => {
  // const { user } = useUser(); // Get client_id from authenticated user context
  const user = { id: '080471dc-96d0-48b9-bee6-f8450f92c7fe' }; // TODO: Replace with real user context
  const { createServiceRequest, loading, error } = useServiceRequestsApi();
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    if (!message.trim()) return;
    try {
      await createServiceRequest({
        service_id: serviceId,
        client_id: user.id,
        message: message.trim(),
      });
      setSuccess(true);
      setMessage('');
    } catch {}
  };

  // Reset modal state when closed
  React.useEffect(() => {
    if (!open) {
      setMessage('');
      setSuccess(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40'>
      <div className='bg-white rounded-lg shadow-lg p-6 w-full max-w-md'>
        <h2 className='text-xl font-bold mb-4'>Request Service</h2>
        {success ? (
          <div className='flex flex-col items-center'>
            <div className='text-green-600 text-base mb-6'>Request sent successfully!</div>
            <button
              type='button'
              className='bg-blue-600 text-white px-4 py-2 rounded'
              onClick={onClose}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <textarea
              className='w-full border rounded p-2 mb-2'
              placeholder='Write your message for the freelancer...'
              value={message}
              onChange={e => setMessage(e.target.value)}
              minLength={VALIDATION_LIMITS.MIN_MESSAGE_LENGTH}
              required
            />
            {error && (
              <div className='text-red-500 text-sm mb-2'>{error.message || 'Error sending request'}</div>
            )}
            <div className='flex gap-2 justify-end'>
              <button type='button' className='px-4 py-2' onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button
                type='submit'
                className='bg-blue-600 text-white px-4 py-2 rounded'
                disabled={loading || !message.trim()}
              >
                {loading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ServiceRequestModal;
