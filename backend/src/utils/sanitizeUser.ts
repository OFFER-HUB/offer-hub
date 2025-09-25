import { User } from '@/types/user.types';

export function sanitizeUser(user: User) {
  const { nonce, created_at, ...safeUser } = user;
  return safeUser;
}
