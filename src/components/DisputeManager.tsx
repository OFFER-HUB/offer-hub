import React from 'react';
import { StartDisputeForm } from './forms/StartDisputeForm';

interface DisputeManagerProps {
  contractId?: string;
  signerAddress?: string;
}

export const DisputeManager: React.FC<DisputeManagerProps> = ({
  contractId,
  signerAddress
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Dispute Management</h2>
      <StartDisputeForm />
    </div>
  );
};