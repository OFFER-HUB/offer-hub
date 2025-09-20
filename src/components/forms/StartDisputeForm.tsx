"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useStartDisputeForm } from "../../hooks/useStartDispute";

export function StartDisputeForm() {
  const { form, loading, response, onSubmit } = useStartDisputeForm();

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="contractId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract / Escrow ID</FormLabel>
                <FormControl>
                  <Input
                    placeholder="CAZ6UQX7..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="signer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Signer Address</FormLabel>
                <FormControl>
                  <Input placeholder="GSIGN...XYZ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason for Dispute</FormLabel>
                <FormControl>
                  <Input placeholder="Describe the reason for the dispute..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Starting Dispute..." : "Start Dispute"}
          </Button>
        </form>
      </Form>

      {response && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="font-semibold text-green-800">Success!</h3>
          <p className="text-green-700">Dispute started successfully.</p>
          <pre className="mt-2 text-xs text-green-600 overflow-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}