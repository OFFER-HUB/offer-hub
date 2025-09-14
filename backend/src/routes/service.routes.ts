import { Router } from 'express';
import {
  createServiceHandler,
  getAllServicesHandler,
  getServiceByIdHandler,
  updateServiceHandler,
  deleteServiceHandler,
} from '@/controllers/service.controller';
import { authorizeRoles, verifyToken } from '@/middlewares/auth.middleware';

const router = Router();

// POST /api/services - Create new service
// Protected route - requires authentication
router.post(
  '/',
  verifyToken,
  authorizeRoles('freelancer', 'admin'),
  createServiceHandler
);
// GET /api/services - List all services with optional filters
// Public route - no authentication required
router.get('/', getAllServicesHandler);

// GET /api/services/:id - Get service details by ID
// Public route - no authentication required
router.get('/:id', getServiceByIdHandler);

// PATCH /api/services/:id - Update service
// Protected route - requires authentication and ownership verification
router.patch(
  '/:id',
  verifyToken,
  authorizeRoles('freelancer', 'admin'),
  updateServiceHandler
);
// DELETE /api/services/:id - Delete service (soft delete)
// Protected route - requires authentication and ownership verification
router.delete(
  '/:id',
  verifyToken,
  authorizeRoles('freelancer', 'admin'),
  deleteServiceHandler
);
export default router;
