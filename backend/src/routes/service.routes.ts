import { Router } from 'express';
import {
  createServiceHandler,
  getAllServicesHandler,
  getServiceByIdHandler,
  updateServiceHandler,
  deleteServiceHandler,
} from '@/controllers/service.controller';
import { authorizeRoles, verifyToken } from '@/middlewares/auth.middleware';
import { UserRole } from '@/types/auth.types';

const router = Router();

/**
 * Router: Service endpoints
 * Base path: /api/services (mounted in backend/src/index.ts)
 * Auth: All endpoints under this router require a valid JWT (Authorization: Bearer <token>).
 * Roles: Some endpoints additionally require specific roles via authorizeRoles().
 */

// POST /api/services - Create a new service
// Auth: JWT required; Roles: freelancer or admin
// Body (JSON): { user_id: string, title: string, description: string, category: string, min_price: number, max_price: number }
// Constraints: min_price >= 0, max_price >= 0, and min_price <= max_price
// Response: 201 Created -> Service; 400 -> Validation errors
// Example:
//   POST /api/services
//   Authorization: Bearer <token>
//   { "user_id": "UUID", "title": "...", "description": "...", "category": "web", "min_price": 100, "max_price": 500 }
router.post(
  '/',
  verifyToken,
  authorizeRoles(UserRole.FREELANCER, UserRole.ADMIN),
  createServiceHandler
);

// GET /api/services - List services with optional filters
// Auth: JWT required
// Query params:
//   category=string
//   min=number (lower bound for min_price)
//   max=number (upper bound for max_price)
//   keyword=string
//   page=number (default 1)
//   limit=number (default 10, allowed range 1..50)
// Response: 200 OK -> Paginated list
// Example: GET /api/services?category=web&min=100&max=1000&page=1&limit=10
router.get('/', getAllServicesHandler);

// GET /api/services/:id - Get service by ID
// Auth: JWT required
// Params: id (UUID v4)
// Response: 200 OK -> Service with freelancer info; 400 -> invalid id; 404 -> not found
// Example: GET /api/services/3fa85f64-5717-4562-b3fc-2c963f66afa6
router.get('/:id', getServiceByIdHandler);

// PATCH /api/services/:id - Update a service
// Auth: JWT required; Roles: freelancer or admin
// Params: id (UUID v4)
// Body (partial JSON): { title?, description?, category?, min_price?, max_price?, is_active? }
// Constraints: if both min_price and max_price are provided, they must be >= 0 and min_price <= max_price
// Response: 200 OK -> Updated service; 400 -> validation error; 404 -> not found
// Example:
//   PATCH /api/services/3fa85f64-5717-4562-b3fc-2c963f66afa6
//   Authorization: Bearer <token>
//   { "title": "New title", "min_price": 120, "max_price": 300 }
router.patch(
  '/:id',
  verifyToken,
  authorizeRoles(UserRole.FREELANCER, UserRole.ADMIN),
  updateServiceHandler
);

// DELETE /api/services/:id - Soft delete a service (sets is_active = false)
// Auth: JWT required; Roles: freelancer or admin
// Params: id (UUID v4)
// Response: 200 OK -> deletion acknowledged; 400 -> invalid id; 404 -> not found
// Example:
//   DELETE /api/services/3fa85f64-5717-4562-b3fc-2c963f66afa6
//   Authorization: Bearer <token>
router.delete(
  '/:id',
  verifyToken,
  authorizeRoles(UserRole.FREELANCER, UserRole.ADMIN),
  deleteServiceHandler
);
export default router;

