import React, { useEffect, useState } from "react";
import withErrorBoundary from "@/components/shared/WithErrorBoundary";
import { useServiceRequestsApi } from "@/hooks/api-connections/use-service-requests-api";
import type { ServiceRequest } from "@/types/service-request-types";

interface SentRequestsListProps {
  clientId: string;
}

const SentRequestsList: React.FC<SentRequestsListProps> = ({ clientId }) => {
  const { loading, error } = useServiceRequestsApi();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    let mounted = true;
    const controller = new AbortController();
    setFetching(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/service-requests/${clientId}`, { signal: controller.signal })
      .then(res => res.json())
      .then(result => {
        if (!mounted) return;
        setRequests(result.data || []);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        if (!mounted) setRequests([]);
      })
      .finally(() => {
        if (!mounted) return;
        setFetching(false);
      });
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [clientId]);

  if ((loading || fetching) && requests.length === 0) return <div>Loading sent requests...</div>;
  if (error) return <div className="text-red-500">{error.message}</div>;
  if (!requests.length) return <div>No sent requests yet.</div>;

  return (
    <div className="space-y-4">
      {requests.map(req => (
        <div key={req.id} className="border rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white shadow-sm">
          <div>
            <div className="font-semibold text-[#002333]">Service: {req.service_id}</div>
            <div className="text-sm text-[#002333]/70">Freelancer: {req.freelancer_id}</div>
            <div className="mt-2 text-[#002333]">Message: {req.message}</div>
            <div className="mt-1 text-xs text-gray-500">Status: <span className={req.status === 'pending' ? 'text-yellow-600' : req.status === 'accepted' ? 'text-green-600' : 'text-red-600'}>{req.status}</span></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default withErrorBoundary(SentRequestsList);
