// Exponential backoff rate limiting utility for login attempts
import { RateLimitState } from '@/types/auth-validation.types';

const DELAYS = [0, 30_000, 120_000, 300_000]; // ms: immediate, 30s, 2min, 5min

export function getNextRateLimitState(current: RateLimitState): RateLimitState {
  const attempts = current.attempts + 1;
  const delay = DELAYS[Math.min(attempts, DELAYS.length - 1)];
  const nextAllowed = new Date(Date.now() + delay);
  return { attempts, delay, nextAllowed };
}

export function resetRateLimit(): RateLimitState {
  return { attempts: 0, delay: 0, nextAllowed: null };
}

export function isRateLimited(state: RateLimitState): boolean {
  if (!state.nextAllowed) return false;
  return Date.now() < state.nextAllowed.getTime();
}
