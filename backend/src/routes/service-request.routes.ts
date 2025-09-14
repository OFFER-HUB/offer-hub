import { Router } from 'express';
import {
  createServiceRequestHandler,
  getRequestsForFreelancerHandler,
  updateRequestStatusHandler,
} from '@/controllers/service-request.controller';
import { authorizeRoles, verifyToken } from '@/middlewares/auth.middleware';

const router = Router();

router.post(
  '/',
  verifyToken,
  authorizeRoles('client', 'admin'),
  createServiceRequestHandler
);

router.get(
  '/:freelancerId',
  verifyToken,
  authorizeRoles('freelancer', 'admin'),
  getRequestsForFreelancerHandler
);

router.patch(
  '/:id',
  verifyToken,
  authorizeRoles('freelancer', 'admin'),
  updateRequestStatusHandler
);

export default router;
