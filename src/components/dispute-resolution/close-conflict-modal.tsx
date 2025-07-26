import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DisputeRow, User } from '@/types';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { FaCaretDown } from 'react-icons/fa';
import { PropagateLoader } from 'react-spinners';
import { simulateDisputResolution } from '@/data/generic-mock-data';
import { toast } from 'sonner';

export default function CloseConflictModal({
  open,
  onClose,
  dispute,
  onConfirm,
}: {
  open: boolean;
  dispute: DisputeRow;
  onClose: () => void;
  onConfirm: (recipient: User, message: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [recipient, setRecipient] = useState(
    dispute.parties.find((e) => e.id === dispute.userId)!
  );
  const [message, setMessage] = useState(
    `Hi [Customer name]\n\nWe have closed your conflict and released payment to you.\n\nXYZ team`
  );

  const handleConfirm = async () => {
    setLoading(true);
    const { data } = await simulateDisputResolution(dispute, recipient);

    setLoading(false);
    onConfirm(recipient, message);

    toast.success(
      `Conflict "${data.ticket}" has been closed and payment released to ${recipient.name}`,
      {
        position: 'bottom-center',
        duration: 5000,
        richColors: true,
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg !rounded-sm">
        <DialogHeader>
          <DialogTitle className="font-medium text-gray-600 text-md">
            Close conflict
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-6">
          <div className="flex items-center gap-3 p-3 border rounded-sm lg:flex-row border-gray-400/1">
            <label className="block text-sm font-medium">
              Release payment to
            </label>
            <div className="relative flex flex-1">
              <select
                value={recipient.id}
                onChange={(e) =>
                  setRecipient(
                    dispute.parties.find((x) => x.id === e.target.value)!
                  )
                }
                className="px-4 py-[5px] pr-8 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 flex-1 focus:ring-primary-500 focus:border-transparent"
              >
                {dispute.parties &&
                  dispute.parties.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
              </select>
              <FaCaretDown
                className="absolute text-black transform -translate-y-1/2 border border-black rounded-full pointer-events-none right-2 top-1/2"
                size={12}
              />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-base font-semibold">
              Message (Optional)
            </label>
            <textarea
              className="w-full border rounded-md px-3 py-2 min-h-[165px] text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2 mt-6">
          <DialogClose asChild>
            <Button variant="outline" className="px-6 rounded-full">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleConfirm}
            className="rounded-full px-6 flex items-center bg-[#002333] hover:bg-[#002333]/90 text-white justify-center min-w-36"
          >
            {loading ? (
              <PropagateLoader
                color="white"
                size={10}
                loading={loading}
                className="pb-2"
              />
            ) : (
              'Close conflict'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
