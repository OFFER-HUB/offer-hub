/**
 *
 * Trustless Work Documentation: https://docs.trustlesswork.com/
 * Library: https://docs.trustlesswork.com/trustless-work/developer-resources/react-library/getting-started
 *
 * MultiRelease Escrow: It's based on milestone, it means that the amount and flags is in each milestone
 * SingleRelease Escrow: It's based on the escrow, it means that the amount and flags is in the escrow
 * -> If you have any doubts, please check the documentation or even send us a DM
 *
 */

import {
  useInitializeEscrow,
  useSendTransaction,
} from '@trustless-work/escrow';
import { InitializeContractPayload } from '../types/escrow.types';

/**
 * When you want to create a contract between client and freelancer, you need to deploy an escrow contract by using this hook. You just need to pass the payload.
 */

interface UseInitializeContractReturn {
  deployEscrow: unknown;
  sendTransaction: unknown;
  handleSubmit: (payload: InitializeContractPayload) => Promise<void>;
}

export const useInitializeContract = (): UseInitializeContractReturn => {
  const { deployEscrow } = useInitializeEscrow();
  const { sendTransaction } = useSendTransaction();

  // todo: get your private key from your wallet (like @creit.tech/stellar-wallets-kit) or passkey in order to set as the signer

  const handleSubmit = async (payload: InitializeContractPayload) => {
    /**
     * API call by using the trustless work hooks
     * @Note:
     * - We need to pass the payload to the deployEscrow function
     * - The result will be an unsigned transaction
     * - Currently disabled due to type mismatch between InitializeContractPayload and package types
     */
    try {
      // TODO: Fix type mismatch between InitializeContractPayload and package types
      console.warn('useInitializeContract: Hook not fully implemented - type mismatch');
      throw new Error('useInitializeContract hook not implemented - type mismatch');
    } catch (error) {
      console.error('Error in useInitializeContract:', error);
      throw error;
    }
  };

  return { 
    deployEscrow,
    sendTransaction,
    handleSubmit 
  };
};
