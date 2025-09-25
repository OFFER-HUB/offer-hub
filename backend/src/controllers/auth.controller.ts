/**
 * @fileoverview Authentication controller handling user authentication operations
 * @author Offer Hub Team
 */

import { NextFunction, Request, Response } from 'express';
import * as authService from '@/services/auth.service';
import { DeviceInfo, EmailLoginDTO } from '@/types/auth.types';

export async function getNonce(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { wallet_address } = req.body;
    if (!wallet_address) {
      return res.status(400).json({ message: 'wallet_address is required' });
    }
    const nonce = await authService.getNonce(wallet_address);
    res.status(200).json({
      success: 'success',
      nonce,
    });
  } catch (err) {
    next(err);
  }
}


/**
 *Register a new user

 * @route POST /api/auth/register

 * @param req - Express request object

 * @param res - Express response object

 * @param next - Express next function
 *

 *Expected request body:

 * {

 *   "wallet_address": "string (required) - User's wallet address",
 *   "email": "string (optional) - User's email address",
 *   "username": "string (required) - Unique username",
 *   "name": "string (optional) - User's display name",
 *   "bio": "string (optional) - User's description",
 *   "is_freelancer": "boolean (optional) - Whether user is a freelancer"

 * }
 *

 *Response format:

 * {

 *   "status": "success",
 *   "user": { ... },
 *   "tokens": { ... }

 * }

 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { user, tokens } = await authService.signup(req.body);
    res.status(201).json({
      status: 'success',
      user,
      tokens,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Authenticate user login
 * @route POST /api/auth/login
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 *
 * Expected request body:
 * {
 *   "wallet_address": "string (required) - User's wallet address",
 *   "signature": "string (required) - Signed message from wallet",
 *   "nonce": "string (required) - Nonce used for signing"
 * }
 *
 * Response format:
 * {
 *   "status": "success",
 *   "user": { ... },
 *   "tokens": {
 *     "accessToken": "string",
 *     "refreshToken": "string"
 *   }
 * }
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { user, tokens } = await authService.login(req.body);
    res.status(200).json({
      status: 'success',
      user,
      tokens,
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { accessToken, refreshToken } = await authService.refreshSession(
      req.refreshTokenRecord
    );
    res.status(200).json({
      status: 'success',
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user.id);
    res.status(200).json({
      status: 'success',
      user,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { message } = await authService.logoutUser(
      req.refreshTokenRecord?.token_hash || ''
    );
    res.status(200).json({ message });
  } catch (err) {
    next(err);
  }
}

export async function loginWithEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as EmailLoginDTO;

    // Basic input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        error: {
          code: "MISSING_CREDENTIALS",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        error: {
          code: "INVALID_EMAIL_FORMAT",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }

    // Password length validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
        error: {
          code: "PASSWORD_TOO_SHORT",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }

    // Get device info for audit logging
    const deviceInfo: DeviceInfo = {
      type: getDeviceType(req.get('User-Agent') || '') as 'desktop' | 'mobile' | 'tablet',
      os: getOSFromUserAgent(req.get('User-Agent') || ''),
      browser: getBrowserFromUserAgent(req.get('User-Agent') || ''),
      ip_address: req.ip || req.connection.remoteAddress || 'unknown',
      user_agent: req.get('User-Agent') || 'unknown',
    };

    const result = await authService.loginWithEmail({ email, password }, deviceInfo);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get user sessions
 * GET /api/auth/sessions
 */
export async function getSessions(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user.id;
    const result = await authService.getUserSessions(userId);

    res.status(200).json({
      success: true,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Deactivate a user session
 * DELETE /api/auth/sessions/:sessionId
 */
export async function deactivateSession(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user.id;
    const sessionId = req.params.sessionId;

    await authService.deactivateSession(userId, sessionId);

    res.status(200).json({
      success: true,
      message: "Session deactivated successfully",
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Determine device type from user agent
 * @param userAgent - User agent string
 * @returns Device type
 */
function getDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();

  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

/**
 * Get OS from user agent
 * @param userAgent - User agent string
 * @returns OS name
 */
function getOSFromUserAgent(userAgent: string): string {
  const ua = userAgent.toLowerCase();

  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('macintosh') || ua.includes('mac os x')) return 'macOS';
  if (ua.includes('linux')) return 'Linux';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';

  return 'Unknown';
}

/**
 * Get browser from user agent
 * @param userAgent - User agent string
 * @returns Browser name
 */
function getBrowserFromUserAgent(userAgent: string): string {
  const ua = userAgent.toLowerCase();

  if (ua.includes('chrome') && !ua.includes('edg')) return 'Chrome';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('edg')) return 'Edge';
  if (ua.includes('opera')) return 'Opera';

  return 'Unknown';
}
