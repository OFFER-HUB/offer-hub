import { CreateUserDTO } from '@/types/user.types';
import { userService } from './user.service';
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
} from '@/utils/jwt.utils';
import { supabase } from '@/lib/supabase/supabase';
import { AuthUser, LoginDTO, RefreshTokenRecord } from '@/types/auth.types';
import { AppError } from '@/utils/AppError';
import { randomBytes } from 'crypto';
import { utils } from 'ethers';
import { sanitizeUser } from '@/utils/sanitizeUser';

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

  const accessToken = signAccessToken({ user_id: newUser.id });
  const { refreshToken, refreshTokenHash } = signRefreshToken({
    user_id: newUser.id,
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
    recoveredAddress = utils.verifyMessage(user.nonce, signature);
  } catch {
    throw new AppError('Invalid signature', 401);
  }

  if (recoveredAddress.toLowerCase() !== wallet_address.toLowerCase()) {
    throw new AppError('Signature does not match wallet address', 401);
  }

  // Clear nonce after successful login
  await supabase
    .from('users')
    .update({ nonce: null })
    .eq('wallet_address', wallet_address);

  // Issue tokens
  const accessToken = signAccessToken({ user_id: user.id });
  const { refreshToken, refreshTokenHash } = signRefreshToken({
    user_id: user.id,
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

  const accessToken = signAccessToken({ user_id: user.id });
  const { refreshToken: newRefreshToken, refreshTokenHash } = signRefreshToken({
    user_id: user.id,
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

  return safeUser as AuthUser;
}
