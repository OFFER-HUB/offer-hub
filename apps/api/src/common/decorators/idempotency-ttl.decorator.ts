import { SetMetadata } from '@nestjs/common';

export const IDEMPOTENCY_TTL_KEY = 'idempotency_ttl';

/**
 * Decorator to set the TTL for idempotency records.
 * 
 * @param hours Number of hours to keep the record
 */
export const IdempotencyTtl = (hours: number) => SetMetadata(IDEMPOTENCY_TTL_KEY, hours);
