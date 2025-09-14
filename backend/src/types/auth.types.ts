import { User } from './user.types';

export type UserRole = 'freelancer' | 'client' | 'admin' | 'moderator';

export interface JWTPayload {
  user_id: string;
  role?: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  wallet_address: string;
  username: string;
  name?: string;
  bio?: string;
  email?: string;
  is_freelancer?: boolean;
  nonce?: string;
  created_at: string;
  updated_at: string;
  role: UserRole;
}

export interface RefreshTokenRecord {
  id: string;
  user_id: string;
  token_hash: string;
  created_at: string;
}

export interface LoginDTO {
  wallet_address: string;
  signature: string;
}
