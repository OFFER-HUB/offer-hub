import React, { useEffect, useState } from "react";
import withErrorBoundary from "@/components/shared/WithErrorBoundary";
import { useServiceRequestsApi } from "@/hooks/api-connections/use-service-requests-api";
import type { ServiceRequest } from "@/types/service-request-types";

interface ReceivedRequestsListProps {
  freelancerId: string;
}

const ReceivedRequestsList: React.FC<ReceivedRequestsListProps> = ({ freelancerId }) => {
  const { getFreelancerRequests, updateServiceRequestStatus, loading, error } = useServiceRequestsApi();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!freelancerId) return;
    let mounted = true;
    const controller = new AbortController();
    getFreelancerRequests(freelancerId, controller.signal)
      .then((res) => {
        if (!mounted) return;
        setRequests(res || []);
      })
      .catch(() => {
        // ignore errors here — component can show empty state or global error
      });
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [freelancerId, refresh]);

  const handleAction = async (id: string, status: "accepted" | "rejected") => {
    setActionLoading(id + status);
    try {
      await updateServiceRequestStatus(id, status, freelancerId);
      setRefresh(r => r + 1);
    } catch {}
    setActionLoading(null);
  };

  if (loading && requests.length === 0) return <div>Loading requests...</div>;
  if (error) return <div className="text-red-500">{error.message}</div>;
  if (!requests.length) return <div>No requests received yet.</div>;

  return (
    <div className="space-y-4">
      {requests.map(req => (
        <div key={req.id} className="border rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white shadow-sm">
          <div>
            <div className="font-semibold text-[#002333]">Service: {req.service_id}</div>
            <div className="text-sm text-[#002333]/70">Client: {req.client_id}</div>
            <div className="mt-2 text-[#002333]">Message: {req.message}</div>
            <div className="mt-1 text-xs text-gray-500">Status: <span className={req.status === 'pending' ? 'text-yellow-600' : req.status === 'accepted' ? 'text-green-600' : 'text-red-600'}>{req.status}</span></div>
          </div>
          {req.status === "pending" && (
            <div className="flex gap-2">
              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                disabled={actionLoading === req.id + "accepted"}
                onClick={() => handleAction(req.id, "accepted")}
              >
                {actionLoading === req.id + "accepted" ? "Accepting..." : "Accept"}
              </button>
              <button
                className="bg-red-600 text-white px-3 py-1 rounded"
                disabled={actionLoading === req.id + "rejected"}
                onClick={() => handleAction(req.id, "rejected")}
              >
                {actionLoading === req.id + "rejected" ? "Rejecting..." : "Reject"}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default withErrorBoundary(ReceivedRequestsList);
