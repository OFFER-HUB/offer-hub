import {
  getNonce,
  login,
  logout,
  me,
  refresh,
  register,
} from '@/controllers/auth.controller';
import {
  validateRefreshToken,
  verifyToken,
} from '@/middlewares/auth.middleware';
import { authLimiter } from '@/middlewares/ratelimit.middleware';
import { Router } from 'express';

const router = Router();

router.post('/register', register);
router.post('/nonce', authLimiter, getNonce);
router.post('/login', authLimiter, login);
router.post('/refresh', validateRefreshToken, refresh);
router.post('/logout', validateRefreshToken, logout);
router.get('/me', verifyToken, me);

export default router;
