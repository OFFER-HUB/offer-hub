'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formSchema } from '../schemas/start-dispute-form.schema';
import { toast } from 'sonner';
import { StartDisputePayload, DisputeResponse } from '../types/escrow.types';
import { isDisputeResponse, isErrorWithMessage } from '../utils/type-guards';

interface UseStartDisputeFormReturn {
  loading: boolean;
  response: DisputeResponse | null;
  form: any;
  onSubmit: (payload: StartDisputePayload) => Promise<void>;
}

export const useStartDisputeForm = (): UseStartDisputeFormReturn => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<DisputeResponse | null>(null);
  // const { startDispute } = useStartDisputeHook(); // Temporarily commented
  // const { sendTransaction } = useSendTransaction(); // Temporarily commented

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractId: '',
      signer: '',
      reason: '',
    },
  });

  const onSubmit = async (payload: StartDisputePayload) => {
    setLoading(true);
    setResponse(null);

    try {
      // const { unsignedTransaction } = await startDispute(payload); // Temporarily commented
      // Temporary placeholder implementation
      const unsignedTransaction = null;  

      if (!unsignedTransaction) {
        throw new Error(
          'Dispute functionality temporarily unavailable - escrow hooks not configured.'
        );
      }

      // TODO: Implement proper wallet signing
      // const signedXdr = await signTransaction({
      //   unsignedTransaction,
      //   address: payload.signer,
      // });
      
      // Placeholder for now - implement wallet integration
      const signedXdr = 'PLACEHOLDER_SIGNED_XDR';

      if (!signedXdr) {
        throw new Error('Signed transaction is missing.');
      }

      // const data = await sendTransaction({ // Temporarily commented
      //   signedXdr,
      //   returnEscrowDataIsRequired: false,
      // });
      const data: DisputeResponse = { status: 'SUCCESS', message: 'Temporary success' }; // Temporary placeholder

      if (isDisputeResponse(data) && data.status === 'SUCCESS') {
        setResponse(data);
        toast.success('Dispute started successfully!');
        form.reset();
      } else {
        throw new Error(data.message || 'Transaction failed');
      }
    } catch (error) {
      console.error('Error starting dispute:', error);
      const errorMessage = isErrorWithMessage(error) ? error.message : 'An unknown error occurred';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    response,
    onSubmit,
  };
};