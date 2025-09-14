import { Router } from 'express';
import {
  createUserHandler,
  getUserByIdHandler,
  updateUserHandler,
  getAllUsersHandler,
} from '@/controllers/user.controller';
import { authorizeRoles, verifyToken } from '@/middlewares/auth.middleware';

const router = Router();

router.get('/', verifyToken, authorizeRoles('admin'), getAllUsersHandler);

// I added authorization here because the route for public registration is in /api/auth/register
router.post('/', verifyToken, authorizeRoles('admin'), createUserHandler);

router.get('/:id', verifyToken, getUserByIdHandler);
router.patch('/:id', verifyToken, updateUserHandler);

export default router;
