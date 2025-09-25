import { Request, Response } from 'express';
import { serviceRequestService } from '@/services/service-request.service';
import { buildSuccessResponse, buildErrorResponse } from '../utils/responseBuilder';

export const createServiceRequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { service_id, client_id, message } = req.body;

    // Validate required fields
    if (!service_id || !client_id || !message) {
      return res.status(400).json(
        buildErrorResponse('Missing required fields: service_id, client_id, message')
      );
    }

    // Validate UUID format (basic check)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(service_id) || !uuidRegex.test(client_id)) {
      return res.status(400).json(
        buildErrorResponse('Invalid UUID format for service_id or client_id')
      );
    }

    // Validate message length
    if (typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json(
        buildErrorResponse('Message must be a non-empty string')
      );
    }

    const serviceRequest = await serviceRequestService.createServiceRequest({
      service_id,
      client_id,
      message: message.trim(),
    });

    res.status(201).json(
      buildSuccessResponse(serviceRequest, 'Service request created successfully')
    );
  } catch (error) {
    res.status(500).json(
      buildErrorResponse('Failed to create service request')
    );
  }
};

export const getRequestsForFreelancerHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { freelancerId } = req.params;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(freelancerId)) {
      return res.status(400).json(
        buildErrorResponse('Invalid UUID format for freelancerId')
      );
    }

    const requests = await serviceRequestService.getRequestsForFreelancer(
      freelancerId
    );

    res.status(200).json(
      buildSuccessResponse(requests, 'Service requests retrieved successfully')
    );
  } catch (error) {
    res.status(500).json(
      buildErrorResponse('Failed to retrieve service requests')
    );
  }
};

export const updateRequestStatusHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // For now, we'll extract freelancerId from request body
    // In a real app, this would come from authentication middleware
    const { freelancerId } = req.body;

    // Validate required fields
    if (!status || !freelancerId) {
      return res.status(400).json(
        buildErrorResponse('Missing required fields: status, freelancerId')
      );
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id) || !uuidRegex.test(freelancerId)) {
      return res.status(400).json(
        buildErrorResponse('Invalid UUID format for id or freelancerId')
      );
    }

    // Validate status value
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json(
        buildErrorResponse('Status must be either "accepted" or "rejected"')
      );
    }

    const updatedRequest = await serviceRequestService.updateRequestStatus(
      id,
      status,
      freelancerId
    );

    res.status(200).json(
      buildSuccessResponse(updatedRequest, `Service request ${status} successfully`)
    );
  } catch (error) {
    res.status(500).json(
      buildErrorResponse('Failed to update request status')
    );
  }
};
