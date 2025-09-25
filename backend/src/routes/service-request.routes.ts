import { Router } from 'express';
import {
  createServiceRequestHandler,
  getRequestsForFreelancerHandler,
  updateRequestStatusHandler,
} from '@/controllers/service-request.controller';
import { authorizeRoles, verifyToken } from '@/middlewares/auth.middleware';
import { UserRole } from '@/types/auth.types';

const router = Router();

router.post(
  '/',
  verifyToken,
  authorizeRoles(UserRole.CLIENT, UserRole.ADMIN),
  createServiceRequestHandler
);

router.get(
  '/:freelancerId',
  verifyToken,
  authorizeRoles(UserRole.FREELANCER, UserRole.ADMIN),
  getRequestsForFreelancerHandler
);

router.patch(
  '/:id',
  verifyToken,
  authorizeRoles(UserRole.FREELANCER, UserRole.ADMIN),
  updateRequestStatusHandler
);

export default router;
