"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formSchema } from "../schemas/start-dispute-form.schema";
import { toast } from "sonner";
import {
  StartDisputePayload,
  EscrowRequestResponse,
} from "@trustless-work/escrow/types";
import {
  useSendTransaction,
  useStartDispute as useStartDisputeHook,
} from "@trustless-work/escrow/hooks";

export const useStartDisputeForm = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<EscrowRequestResponse | null>(null);
  const { startDispute } = useStartDisputeHook();
  const { sendTransaction } = useSendTransaction();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractId: "",
      signer: "",
    },
  });

  const onSubmit = async (payload: StartDisputePayload) => {
    setLoading(true);
    setResponse(null);

    try {
      const { unsignedTransaction } = await startDispute(payload);

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from startDispute response."
        );
      }

      // TODO: Implement proper wallet signing
      // const signedXdr = await signTransaction({
      //   unsignedTransaction,
      //   address: payload.signer,
      // });
      
      // Placeholder for now - implement wallet integration
      const signedXdr = "PLACEHOLDER_SIGNED_XDR";

      if (!signedXdr) {
        throw new Error("Signed transaction is missing.");
      }

      const data = await sendTransaction({
        signedXdr,
        returnEscrowDataIsRequired: false,
      });

      if (data.status === "SUCCESS") {
        setResponse(data);
        toast.success("Dispute started successfully!");
        form.reset();
      } else {
        throw new Error(data.message || "Transaction failed");
      }
    } catch (error) {
      console.error("Error starting dispute:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
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