/**
 * @fileoverview Authentication routes for user login, registration, and token management
 * @author Offer Hub Team
 */

import {
  getNonce,
  login,
  logout,
  me,
  refresh,
  register,
  loginWithEmail,
  getSessions,
  deactivateSession,
} from '@/controllers/auth.controller';
import {
  authenticateToken,
  validateRefreshToken,
} from '@/middlewares/auth.middleware';
import { authLimiter } from '@/middlewares/ratelimit.middleware';
import { Router } from 'express';

const router = Router();

router.post('/register', register);
router.post('/nonce', authLimiter, getNonce);
router.post('/login', authLimiter, login);
router.post('/login/email', authLimiter, loginWithEmail);
router.post('/refresh', validateRefreshToken, refresh);
router.post('/logout', validateRefreshToken, logout);
router.get('/me', authenticateToken, me);
router.get('/sessions', authenticateToken, getSessions);
router.delete('/sessions/:sessionId', authenticateToken, deactivateSession);

export default router;
