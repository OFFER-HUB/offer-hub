import { useState } from 'react';
import type { ServiceRequest, CreateServiceRequestDTO, UpdateServiceRequestDTO, RequestStatus } from '@/types/service-request-types';

const API_BASE_URL = "http://localhost:4000/api";

interface ApiError {
  status: number;
  message: string;
}

export function useServiceRequestsApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const createServiceRequest = async (data: CreateServiceRequestDTO, signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
  const res = await fetch(`${API_BASE_URL}/service-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw { status: res.status, message: result?.message || 'Error creating request' };
      return result as ServiceRequest;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getFreelancerRequests = async (freelancerId: string, signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
  const res = await fetch(`${API_BASE_URL}/service-requests/${freelancerId}`);
      const result = await res.json();
      if (!res.ok) throw { status: res.status, message: result?.message || 'Error retrieving requests' };
      return result.data as ServiceRequest[];
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateServiceRequestStatus = async (id: string, status: RequestStatus, freelancerId: string, signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
  const res = await fetch(`${API_BASE_URL}/service-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, freelancerId}),
      });
      const result = await res.json();
      if (!res.ok) throw { status: res.status, message: result?.message || 'Error updating status' };
      return result as ServiceRequest;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createServiceRequest,
    getFreelancerRequests,
    updateServiceRequestStatus,
  };
}
