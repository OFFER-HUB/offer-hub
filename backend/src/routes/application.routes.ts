import { Router } from 'express';
import {
  createApplicationHandler,
  getApplicationsByProjectHandler,
  updateApplicationStatusHandler,
} from '@/controllers/application.controller';
import { authorizeRoles, verifyToken } from '@/middlewares/auth.middleware';

const router = Router();

router.post(
  '/',
  verifyToken,
  authorizeRoles('freelancer'),
  createApplicationHandler
);

router.get(
  '/project/:id',
  verifyToken,
  authorizeRoles('client', 'admin'),
  getApplicationsByProjectHandler
);

router.patch(
  '/:id',
  verifyToken,
  authorizeRoles('client', 'admin'),
  updateApplicationStatusHandler
);

export default router;
