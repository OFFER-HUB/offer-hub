import { Router } from 'express';
import {
  createContractHandler,
  getContractByIdHandler,
  updateContractStatusHandler,
  getContractsByUserHandler,
  getContractsByStatusHandler,
} from '@/controllers/contract.controller';
import { authorizeRoles, verifyToken } from '@/middlewares/auth.middleware';
import { UserRole } from '@/types/auth.types';

const router = Router();

// POST /api/contracts - Create contract
// Protected route - requires authentication
router.post('/', verifyToken, authorizeRoles(UserRole.CLIENT), createContractHandler);

// GET /api/contracts/:id - Get contract details
// Protected route - requires authentication
router.get('/:id', verifyToken, getContractByIdHandler);

// PATCH /api/contracts/:id - Update escrow status
// Protected route - requires authentication and authorization
router.patch(
  '/:id',
  verifyToken,
  authorizeRoles(UserRole.CLIENT, UserRole.ADMIN),
  updateContractStatusHandler
);

// GET /api/contracts/user/:userId - Get contracts by user
// Protected route - requires authentication
router.get('/user/:userId', verifyToken, getContractsByUserHandler);

// GET /api/contracts/status/:status - Get contracts by status
// Protected route - requires authentication
router.get(
  '/status/:status',
  verifyToken,
  authorizeRoles(UserRole.ADMIN),
  getContractsByStatusHandler
);

export default router;
