import { supabase } from '@/lib/supabase/supabase';
import { ForbiddenError, NotFoundError } from '@/utils/AppError';
import { ConflictError ,InternalServerError} from '@/utils/AppError';
export interface ServiceRequest {
  id: string;
  service_id: string;
  client_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface CreateServiceRequestData {
  service_id: string;
  client_id: string;
  message: string;
}

export interface ServiceRequestWithDetails extends ServiceRequest {
  client: {
    id: string;
    username: string;
    name: string;
    email: string;
  };
  service: {
    id: string;
    title: string;
    user_id: string;
  };
}

export class ServiceRequestService {
  async createServiceRequest(
    data: CreateServiceRequestData
  ): Promise<ServiceRequest> {
    // Check if the client is trying to request their own service
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('user_id')
      .eq('id', data.service_id)
      .single();

    if (serviceError) {
      throw new NotFoundError('Service not found');
    }

    if (service.user_id === data.client_id) {
      throw new ForbiddenError('Cannot request your own service');
    }

    // Check for existing pending requests from the same client to the same service
    const { data: existingRequest, error: existingError } = await supabase
      .from('service_requests')
      .select('id')
      .eq('service_id', data.service_id)
      .eq('client_id', data.client_id)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      throw new ConflictError('You already have a pending request for this service');
    }

    // Create the service request
    const { data: newRequest, error } = await supabase
      .from('service_requests')
      .insert({
        service_id: data.service_id,
        client_id: data.client_id,
        message: data.message,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerError(`Failed to create service request: ${error.message}`);
    }

    return newRequest;
  }

  async getRequestsForFreelancer(
    freelancerId: string
  ): Promise<ServiceRequestWithDetails[]> {
    const { data, error } = await supabase
      .from('service_requests')
      .select(
        `
        *,
        client:users!service_requests_client_id_fkey(
          id,
          username,
          name,
          email
        ),
        service:services!service_requests_service_id_fkey(
          id,
          title,
          user_id
        )
      `
      )
      .eq('service.user_id', freelancerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerError(`Failed to fetch service requests: ${error.message}`);
    }

    return data || [];
  }

  async updateRequestStatus(
    requestId: string,
    status: 'accepted' | 'rejected',
    freelancerId: string
  ): Promise<ServiceRequest> {
    // First, verify that the freelancer owns the service
    const { data: request, error: requestError } = await supabase
      .from('service_requests')
      .select(
        `
        *,
        service:services!service_requests_service_id_fkey(
          user_id
        )
      `
      )
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      throw new NotFoundError('Service request not found');
    }

    if (request.service.user_id !== freelancerId) {
      throw new ForbiddenError('You can only update requests for your own services');
    }

    if (request.status !== 'pending') {
      throw new ConflictError('Request has already been processed');
    }

    // Update the request status
    const { data: updatedRequest, error } = await supabase
      .from('service_requests')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      throw new InternalServerError(`Failed to update service request: ${error.message}`);
    }

    return updatedRequest;
  }
}

export const serviceRequestService = new ServiceRequestService();
