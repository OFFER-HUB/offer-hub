import { useState } from 'react';

interface FundEscrowPayload {
  contractId: string;
  amount: string;
}

export const useFundEscrow = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleFundEscrow = async (payload: FundEscrowPayload) => {
    setLoading(true);
    setError(null);

  try {
      // Validate inputs
      if (!payload.contractId || !payload.amount) {
        throw new Error('Contract ID and amount are required');
      }

      // Convert amount to proper format 
      const amountInSmallestUnit = BigInt(parseFloat(payload.amount) * 10**6); 

      // Create the transaction for funding the escrow
      const txPayload = {
        method: 'fund_escrow',
        args: {
          escrow_id: payload.contractId,
          amount: amountInSmallestUnit.toString()
        }
      };

      // Send the transaction to the smart contract
      const response = await fetch('/api/contracts/escrow/fund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(txPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fund escrow');
      }

      const result = await response.json();
      
      // Verify the transaction was successful
      if (result.status === 'success') {
        return true;
      } else {
        throw new Error(result.message || 'Transaction failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fund escrow');
      return false;
    } finally {
      setLoading(false);
    }
  };
  return {
    fundEscrow: handleFundEscrow,
    loading,
    error
  };
};
