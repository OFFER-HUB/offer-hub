/**
 * @fileoverview Authentication service providing user authentication and token management
 * @author Offer Hub Team
 */

import { CreateUserDTO } from '@/types/user.types';
import { userService } from './user.service';
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
} from '@/utils/jwt.utils';
import { supabase } from '@/lib/supabase/supabase';
import { AuthUser, LoginDTO, RefreshTokenRecord, EmailLoginDTO, AuditLogEntry, DeviceInfo, UserRole } from '@/types/auth.types';
import { AppError } from '@/utils/AppError';
import { randomBytes } from 'crypto';
import { utils } from 'ethers';
import { sanitizeUser } from '@/utils/sanitizeUser';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function getNonce(wallet_address: string) {
  const nonce = randomBytes(16).toString('hex');

  const { data: existing, error: fetchErr } = await supabase
    .from('users')
    .select('id')
    .eq('wallet_address', wallet_address)
    .single();

  if (fetchErr || !existing) throw new AppError('User not found', 404);

  const { error } = await supabase
    .from('users')
    .update({ nonce })
    .eq('wallet_address', wallet_address);

  if (error) throw new AppError('Failed to set nonce', 500);

  return nonce;
}

export async function signup(data: CreateUserDTO) {
  const newUser = await userService.createUser(data);

  const accessToken = signAccessToken({ 
    sub: newUser.id,
    email: newUser.email,
    role: newUser.role || UserRole.CLIENT,
    permissions: newUser.permissions?.map((p: { name: string }) => p.name) || []
  });
  const { refreshToken, refreshTokenHash } = signRefreshToken({
    sub: newUser.id,
    email: newUser.email,
    role: newUser.role || UserRole.CLIENT,
    permissions: newUser.permissions?.map((p: any) => p.name) || []
  });

  // Save refresh token in DB
  const { error: rtInsertError } = await supabase
    .from('refresh_tokens')
    .insert([
      {
        user_id: newUser.id,
        token_hash: refreshTokenHash,
      },
    ]);

  if (rtInsertError) {
    throw new AppError('Failed to persist refresh token', 500);
  }

  const safeUser = sanitizeUser(newUser);

  return {
    user: safeUser,
    tokens: { accessToken, refreshToken },
  };
}

export async function login(data: LoginDTO) {
  const { wallet_address, signature } = data;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', wallet_address)
    .single();

  if (error || !user) throw new AppError('User not found', 401);

  // Verify signature
  let recoveredAddress: string;
  try {
    recoveredAddress = utils.verifyMessage(user.nonce || '', signature || '');
  } catch {
    throw new AppError('Invalid signature', 401);
  }

  if (recoveredAddress.toLowerCase() !== (wallet_address || '').toLowerCase()) {
    throw new AppError('Signature does not match wallet address', 401);
  }

  // Clear nonce after successful login
  await supabase
    .from('users')
    .update({ nonce: null })
    .eq('wallet_address', wallet_address);

  // Issue tokens
  const accessToken = signAccessToken({ 
    sub: user.id,
    email: user.email || '',
    role: user.role || UserRole.CLIENT,
    permissions: user.permissions?.map((p: any) => p.name) || []
  });
  const { refreshToken, refreshTokenHash } = signRefreshToken({
    sub: user.id,
    email: user.email || '',
    role: user.role || UserRole.CLIENT,
    permissions: user.permissions?.map((p: any) => p.name) || []
  });

  const { error: rtInsertError } = await supabase
    .from('refresh_tokens')
    .insert([{ user_id: user.id, token_hash: refreshTokenHash }]);

  if (rtInsertError) {
    throw new AppError('Failed to persist refresh token', 500);
  }

  const safeUser = sanitizeUser(user);

  return {
    user: safeUser,
    tokens: { accessToken, refreshToken },
  };
}

export async function refreshSession(tokenRecord: RefreshTokenRecord) {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', tokenRecord.user_id)
    .single();

  if (error || !user) {
    throw new AppError('User not found', 404);
  }

  const accessToken = signAccessToken({ 
    sub: user.id,
    email: user.email || '',
    role: user.role || UserRole.CLIENT,
    permissions: user.permissions?.map((p: any) => p.name) || []
  });
  const { refreshToken: newRefreshToken, refreshTokenHash } = signRefreshToken({
    sub: user.id,
    email: user.email || '',
    role: user.role || UserRole.CLIENT,
    permissions: user.permissions?.map((p: any) => p.name) || []
  });

  const { data: rotateData, error: rotateError } = await supabase
    .from('refresh_tokens')
    .update({
      token_hash: refreshTokenHash,
      created_at: new Date().toISOString(),
    })
    .eq('token_hash', tokenRecord.token_hash)
    .eq('user_id', tokenRecord.user_id)
    .eq('created_at', tokenRecord.created_at)
    .select('id');

  if (rotateError || !rotateData || rotateData.length !== 1) {
    throw new AppError('Failed to rotate refresh token', 500);
  }

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logoutUser(refreshToken: string) {
  const refreshTokenHash = hashToken(refreshToken);
  const { error } = await supabase
    .from('refresh_tokens')
    .delete()
    .eq('token_hash', refreshTokenHash);

  if (error) throw new AppError(error.message, 500);

  return { message: 'Logged out successfully' };
}

export async function getMe(userId: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !user) throw new AppError('User not found', 404);

  const safeUser = sanitizeUser(user);

  return safeUser as unknown as AuthUser;
}

/**
 * Authenticate user with email and password
 * @param data - Email login credentials
 * @param deviceInfo - Device information for audit logging
 * @returns User data and JWT tokens
 */
export async function loginWithEmail(data: EmailLoginDTO, deviceInfo: DeviceInfo) {
  const { email, password } = data;

  // Log login attempt
  await logAuthAttempt({
    userId: '', // Will be set after user lookup
    action: 'login_attempt',
    resource: 'auth',
    ipAddress: deviceInfo.ip_address || '',
    userAgent: deviceInfo.user_agent || '',
    timestamp: new Date(),
  });

  // Find user by email
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();

  if (error || !user) {
    await logAuthAttempt({
      userId: '',
      action: 'login_failure',
      resource: 'auth',
      ipAddress: deviceInfo.ip_address || '',
      userAgent: deviceInfo.user_agent || '',
      timestamp: new Date(),
    });
    throw new AppError("Invalid email or password", 401);
  }

  // Check if user has a password (email auth enabled)
  if (!user.password_hash) {
    await logAuthAttempt({
      userId: user.id,
      action: 'login_failure',
      resource: 'auth',
      ipAddress: deviceInfo.ip_address || '',
      userAgent: deviceInfo.user_agent || '',
      timestamp: new Date(),
    });
    throw new AppError("Email authentication not enabled for this account. Please use wallet authentication.", 401);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    await logAuthAttempt({
      userId: user.id,
      action: 'login_failure',
      resource: 'auth',
      ipAddress: deviceInfo.ip_address || '',
      userAgent: deviceInfo.user_agent || '',
      timestamp: new Date(),
    });
    throw new AppError("Invalid email or password", 401);
  }

  // Check if user is active
  if (user.status !== 'active') {
    await logAuthAttempt({
      userId: user.id,
      action: 'login_failure',
      resource: 'auth',
      ipAddress: deviceInfo.ip_address || '',
      userAgent: deviceInfo.user_agent || '',
      timestamp: new Date(),
    });
    throw new AppError(`Account is ${user.status}. Please contact support.`, 403);
  }

  // Generate tokens
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email || '',
    role: user.role || UserRole.CLIENT,
    permissions: user.permissions?.map((p: any) => p.name) || []
  });
  const { refreshToken, refreshTokenHash } = signRefreshToken({
    sub: user.id,
    email: user.email || '',
    role: user.role || UserRole.CLIENT,
    permissions: user.permissions?.map((p: any) => p.name) || []
  });

  // Calculate expiration times
  const accessTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Create session record
  const sessionId = uuidv4();
  const { error: sessionError } = await supabase
    .from("user_sessions")
    .insert([{
      id: sessionId,
      user_id: user.id,
      device_info: deviceInfo,
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      expires_at: accessTokenExpiry.toISOString(),
      is_active: true,
    }]);

  if (sessionError) {
    console.error("Failed to create session:", sessionError);
  }

  // Save refresh token
  const { error: rtInsertError } = await supabase
    .from("refresh_tokens")
    .insert([{
      user_id: user.id,
      token_hash: refreshTokenHash,
      created_at: new Date().toISOString(),
      expires_at: refreshTokenExpiry.toISOString(),
      device_info: deviceInfo,
      is_active: true,
    }]);

  if (rtInsertError) {
    console.error("Failed to persist refresh token:", rtInsertError);
    throw new AppError("Failed to create session", 500);
  }

  // Log successful login
  await logAuthAttempt({
    userId: user.id,
    action: 'login_success',
    resource: 'auth',
    ipAddress: deviceInfo.ip_address || '',
    userAgent: deviceInfo.user_agent || '',
    timestamp: new Date(),
  });

  const safeUser = sanitizeUser(user);

  return {
    user: safeUser,
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
      tokenType: "Bearer",
    },
    session: {
      id: sessionId,
      created_at: new Date().toISOString(),
      expires_at: accessTokenExpiry.toISOString(),
    },
  };
}

/**
 * Log authentication attempts for audit purposes
 * @param logEntry - Audit log entry
 */
async function logAuthAttempt(logEntry: Omit<AuditLogEntry, 'id'>): Promise<void> {
  try {
    const auditEntry: AuditLogEntry = {
      id: uuidv4(),
      ...logEntry,
    };

    // In production, this should be stored in a dedicated audit table
    // For now, we'll log to console with structured format
    console.log(JSON.stringify({
      type: 'AUTH_AUDIT',
      ...auditEntry,
    }));

    // TODO: Store in audit_logs table
    // await supabase.from('audit_logs').insert(auditEntry);
  } catch (error) {
    console.error('Failed to log auth attempt:', error);
  }
}

/**
 * Get active sessions for a user
 * @param userId - User ID
 * @returns List of active sessions
 */
export async function getUserSessions(userId: string) {
  const { data: sessions, error } = await supabase
    .from("user_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError("Failed to retrieve sessions", 500);
  }

  return {
    sessions: sessions || [],
    total: sessions?.length || 0,
  };
}

/**
 * Deactivate a user session
 * @param userId - User ID
 * @param sessionId - Session ID to deactivate
 */
export async function deactivateSession(userId: string, sessionId: string) {
  const { error } = await supabase
    .from("user_sessions")
    .update({ is_active: false })
    .eq("user_id", userId)
    .eq("id", sessionId);

  if (error) {
    throw new AppError("Failed to deactivate session", 500);
  }
}
