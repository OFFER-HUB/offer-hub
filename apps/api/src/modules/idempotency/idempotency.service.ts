import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { IdempotencyStatus } from '@offerhub/shared';
import { hashPayload } from '@offerhub/shared';

@Injectable()
export class IdempotencyService {
    constructor(
        @Inject(PrismaService) private readonly prisma: PrismaService,
        @Inject(RedisService) private readonly redis: RedisService,
    ) { }

    /**
     * Checks if an idempotency key exists and is valid.
     * If it doesn't exist, it creates a lock.
     */
    async checkOrLock(key: string, marketplaceId: string, payload: any): Promise<{
        status: 'LOCKED' | 'REPLAY';
        response?: { status: number; body: any };
    }> {
        const requestHash = hashPayload(payload);
        const lockKey = `idempotency:lock:${marketplaceId}:${key}`;
        const dataKey = `idempotency:data:${marketplaceId}:${key}`;

        // 1. Check Redis for quick response replay
        const cached = await this.redis.get(dataKey);
        if (cached) {
            const data = JSON.parse(cached);
            if (data.requestHash !== requestHash) {
                throw new ConflictException({
                    error: {
                        code: 'IDEMPOTENCY_KEY_REUSED',
                        message: 'This idempotency key was used with a different request body',
                        details: { idempotency_key: key }
                    }
                });
            }
            if (data.status === IdempotencyStatus.COMPLETED) {
                return {
                    status: 'REPLAY',
                    response: { status: data.responseStatus, body: data.responseBody }
                };
            }
        }

        // 2. Check DB if not in Redis
        const dbKey = await this.prisma.idempotencyKey.findUnique({
            where: {
                key_marketplaceId: {
                    key,
                    marketplaceId
                }
            }
        });

        if (dbKey) {
            if (dbKey.requestHash !== requestHash) {
                throw new ConflictException({
                    error: {
                        code: 'IDEMPOTENCY_KEY_REUSED',
                        message: 'This idempotency key was used with a different request body',
                        details: { idempotency_key: key }
                    }
                });
            }

            if (dbKey.status === IdempotencyStatus.COMPLETED) {
                // Cache it back to Redis
                await this.redis.set(dataKey, JSON.stringify({
                    requestHash: dbKey.requestHash,
                    status: dbKey.status,
                    responseStatus: dbKey.responseStatus,
                    responseBody: dbKey.responseBody
                }), 'EX', 3600);

                return {
                    status: 'REPLAY',
                    response: { status: dbKey.responseStatus!, body: dbKey.responseBody }
                };
            }
        }

        // 3. Try to acquire lock in Redis
        const acquired = await this.redis.set(lockKey, 'locked', 'EX', 60, 'NX');
        if (!acquired) {
            throw new ConflictException({
                error: {
                    code: 'IDEMPOTENCY_KEY_IN_PROGRESS',
                    message: 'Original request still processing',
                    details: { idempotency_key: key }
                }
            });
        }

        // 4. Create or update record in DB
        const expiresAt = new Date(Date.now() + 24 * 3600 * 1000);
        if (!dbKey) {
            await this.prisma.idempotencyKey.create({
                data: {
                    key,
                    marketplaceId,
                    requestHash,
                    status: IdempotencyStatus.PROCESSING,
                    expiresAt
                }
            });
        } else {
            await this.prisma.idempotencyKey.update({
                where: { id: dbKey.id },
                data: { status: IdempotencyStatus.PROCESSING }
            });
        }

        return { status: 'LOCKED' };
    }

    /**
     * Completes the idempotency record with a response.
     */
    async complete(key: string, marketplaceId: string, responseStatus: number, responseBody: any, ttlHours: number = 24) {
        const lockKey = `idempotency:lock:${marketplaceId}:${key}`;
        const dataKey = `idempotency:data:${marketplaceId}:${key}`;

        const dbKey = await this.prisma.idempotencyKey.findUnique({
            where: {
                key_marketplaceId: {
                    key,
                    marketplaceId
                }
            }
        });

        if (dbKey) {
            const expiresAt = new Date(Date.now() + ttlHours * 3600 * 1000);
            await this.prisma.idempotencyKey.update({
                where: { id: dbKey.id },
                data: {
                    status: IdempotencyStatus.COMPLETED,
                    responseStatus,
                    responseBody,
                    expiresAt
                }
            });

            // Store in Redis
            await this.redis.set(dataKey, JSON.stringify({
                requestHash: dbKey.requestHash,
                status: IdempotencyStatus.COMPLETED,
                responseStatus,
                responseBody
            }), 'EX', Math.min(ttlHours * 3600, 86400));
        }

        await this.redis.del(lockKey);
    }

    /**
     * Utility to release lock on failure.
     */
    async releaseLock(key: string, marketplaceId: string) {
        const lockKey = `idempotency:lock:${marketplaceId}:${key}`;
        await this.redis.del(lockKey);

        await this.prisma.idempotencyKey.updateMany({
            where: { key, marketplaceId, status: IdempotencyStatus.PROCESSING },
            data: { status: IdempotencyStatus.FAILED }
        });
    }
}
