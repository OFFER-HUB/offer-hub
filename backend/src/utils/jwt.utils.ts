/**
 * @fileoverview JWT utility functions for token generation and validation
 * @author Offer Hub Team
 */

import jwt from 'jsonwebtoken';
import { JWTPayload } from '@/types/auth.types';
import { createHash } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN as any) || '24h';
const JWT_REFRESH_EXPIRES_IN =
  (process.env.JWT_REFRESH_EXPIRES_IN as any) || '7d';
const JWT_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment');
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function signAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function signRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>) {
  const refreshToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });

  const refreshTokenHash = hashToken(refreshToken);

  return { refreshToken, refreshTokenHash };
}

export function verifyAccessToken(token: string): JWTPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
  return decoded;
}

export function verifyRefreshToken(token: string): JWTPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
  return decoded;
}

/**
 * Check if token is close to expiration (within 5 minutes)
 * @param token - JWT token to check
 * @returns boolean indicating if token needs refresh
 */
export function isTokenNearExpiration(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded || !decoded.exp) return true;
    
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;
    
    return timeUntilExpiration <= JWT_REFRESH_THRESHOLD;
  } catch {
    return true; // If we can't decode, consider it expired
  }
}

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns token string or null if invalid format
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
}

/**
 * Validate token format and structure
 * @param token - JWT token to validate
 * @returns boolean indicating if token has valid format
 */
export function isValidTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  
  // JWT should have 3 parts separated by dots
  const parts = token.split('.');
  return parts.length === 3;
}

/**
 * Get token expiration time in milliseconds
 * @param token - JWT token
 * @returns expiration time in milliseconds or null if invalid
 */
export function getTokenExpiration(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded?.exp ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 * @param token - JWT token to check
 * @returns boolean indicating if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const expirationTime = getTokenExpiration(token);
  if (!expirationTime) return true;
  
  return Date.now() >= expirationTime;
}
