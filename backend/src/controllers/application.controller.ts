import { Request, Response } from 'express';
import {
  createApplication,
  getApplicationsByProject,
  updateApplicationStatus
} from '../services/application.service';
import { buildSuccessResponse, buildErrorResponse } from '../utils/responseBuilder';

export const createApplicationHandler = async (req: Request, res: Response) => {
  try {
    const { project_id, freelancer_id, message } = req.body;
    
    // Validate required fields
    if (!project_id || !freelancer_id || !message) {
      return res.status(400).json(
        buildErrorResponse('Missing required fields: project_id, freelancer_id, message')
      );
    }

    const application = await createApplication({
      project_id,
      freelancer_id,
      message
    });
    
    res.status(201).json(
      buildSuccessResponse(application, 'Application created successfully')
    );
  } catch (error) {
    res.status(500).json(
      buildErrorResponse('Failed to create application')
    );
  }
};

export const getApplicationsByProjectHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json(
        buildErrorResponse('Project ID is required')
      );
    }

    const applications = await getApplicationsByProject(id);
    
    res.status(200).json(
      buildSuccessResponse(applications, 'Applications retrieved successfully')
    );
  } catch (error) {
    res.status(500).json(
      buildErrorResponse('Failed to retrieve applications')
    );
  }
};

export const updateApplicationStatusHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!id) {
      return res.status(400).json(
        buildErrorResponse('Application ID is required')
      );
    }

    if (!status) {
      return res.status(400).json(
        buildErrorResponse('Status is required')
      );
    }

    const application = await updateApplicationStatus(id, status);
    
    res.status(200).json(
      buildSuccessResponse(application, 'Application status updated successfully')
    );
  } catch (error) {
    res.status(500).json(
      buildErrorResponse('Failed to update application status')
    );
  }
};
