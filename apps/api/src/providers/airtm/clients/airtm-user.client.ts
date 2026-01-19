import { Injectable, Inject } from '@nestjs/common';
import { AirtmBaseClient } from './airtm-base.client';
import { AirtmConfig } from '../airtm.config';
import { RedisService } from '../../../modules/redis/redis.service';
import type { AirtmUserResponse, AirtmVerificationResult } from '../types';

/** Cache TTL for user verification results (5 minutes) */
const USER_CACHE_TTL_SECONDS = 300;

/** Redis key prefix for user cache */
const USER_CACHE_PREFIX = 'airtm:user:';

/**
 * Client for Airtm User API.
 * Handles user lookup and KYC verification with caching.
 */
@Injectable()
export class AirtmUserClient extends AirtmBaseClient {
    constructor(
        @Inject(AirtmConfig) config: AirtmConfig,
        @Inject(RedisService) private readonly redis: RedisService,
    ) {
        super(config, 'AirtmUserClient');
    }

    /**
     * Gets a user from Airtm by email.
     * Results are cached for 5 minutes to reduce API calls.
     *
     * @param email - User's email address
     * @returns User data or null if not found
     */
    async getUserByEmail(email: string): Promise<AirtmUserResponse | null> {
        const cacheKey = `${USER_CACHE_PREFIX}email:${this.hashEmail(email)}`;

        // Check cache first
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            this.logger.debug(`Cache hit for user ${this.maskEmail(email)}`);
            return JSON.parse(cached) as AirtmUserResponse;
        }

        try {
            const user = await this.get<AirtmUserResponse>(
                `users/by-email/${encodeURIComponent(email)}`,
            );

            // Cache successful result
            await this.redis.set(
                cacheKey,
                JSON.stringify(user),
                'EX',
                USER_CACHE_TTL_SECONDS,
            );

            this.logger.log(`User found: ${this.maskEmail(email)} (id: ${this.maskId(user.id)})`);
            return user;
        } catch (error) {
            // User not found is expected, return null
            if (this.isNotFoundError(error)) {
                this.logger.debug(`User not found: ${this.maskEmail(email)}`);
                return null;
            }
            throw error;
        }
    }

    /**
     * Gets a user from Airtm by their Airtm user ID.
     *
     * @param airtmUserId - Airtm user ID
     * @returns User data or null if not found
     */
    async getUserById(airtmUserId: string): Promise<AirtmUserResponse | null> {
        const cacheKey = `${USER_CACHE_PREFIX}id:${airtmUserId}`;

        // Check cache first
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            this.logger.debug(`Cache hit for user ID ${this.maskId(airtmUserId)}`);
            return JSON.parse(cached) as AirtmUserResponse;
        }

        try {
            const user = await this.get<AirtmUserResponse>(`users/${airtmUserId}`);

            // Cache successful result
            await this.redis.set(
                cacheKey,
                JSON.stringify(user),
                'EX',
                USER_CACHE_TTL_SECONDS,
            );

            return user;
        } catch (error) {
            if (this.isNotFoundError(error)) {
                return null;
            }
            throw error;
        }
    }

    /**
     * Verifies if a user is eligible for Airtm operations.
     *
     * A user is eligible if:
     * - They exist in Airtm
     * - Their status is 'active'
     * - They have completed KYC verification (isVerified = true)
     *
     * @param email - User's email address
     * @returns Verification result with eligibility status
     */
    async verifyUserEligibility(email: string): Promise<AirtmVerificationResult> {
        const user = await this.getUserByEmail(email);

        if (!user) {
            this.logger.debug(`Verification failed: user not found (${this.maskEmail(email)})`);
            return {
                eligible: false,
                failureReason: 'USER_NOT_FOUND',
                email,
            };
        }

        if (user.status !== 'active') {
            this.logger.debug(
                `Verification failed: user inactive (${this.maskEmail(email)}, status: ${user.status})`,
            );
            return {
                eligible: false,
                failureReason: 'USER_INACTIVE',
                airtmUserId: user.id,
                email,
            };
        }

        if (!user.isVerified) {
            this.logger.debug(
                `Verification failed: user not verified (${this.maskEmail(email)})`,
            );
            return {
                eligible: false,
                failureReason: 'USER_NOT_VERIFIED',
                airtmUserId: user.id,
                email,
            };
        }

        this.logger.log(`User eligible: ${this.maskEmail(email)} (id: ${this.maskId(user.id)})`);
        return {
            eligible: true,
            airtmUserId: user.id,
            email,
        };
    }

    /**
     * Verifies eligibility by Airtm user ID.
     *
     * @param airtmUserId - Airtm user ID
     * @returns Verification result
     */
    async verifyUserEligibilityById(airtmUserId: string): Promise<AirtmVerificationResult> {
        const user = await this.getUserById(airtmUserId);

        if (!user) {
            return {
                eligible: false,
                failureReason: 'USER_NOT_FOUND',
            };
        }

        if (user.status !== 'active') {
            return {
                eligible: false,
                failureReason: 'USER_INACTIVE',
                airtmUserId: user.id,
                email: user.email,
            };
        }

        if (!user.isVerified) {
            return {
                eligible: false,
                failureReason: 'USER_NOT_VERIFIED',
                airtmUserId: user.id,
                email: user.email,
            };
        }

        return {
            eligible: true,
            airtmUserId: user.id,
            email: user.email,
        };
    }

    /**
     * Invalidates cached user data.
     * Call this when user data may have changed.
     *
     * @param email - User's email address
     */
    async invalidateCache(email: string): Promise<void> {
        const cacheKey = `${USER_CACHE_PREFIX}email:${this.hashEmail(email)}`;
        await this.redis.del(cacheKey);
        this.logger.debug(`Cache invalidated for ${this.maskEmail(email)}`);
    }

    /**
     * Invalidates cached user data by ID.
     *
     * @param airtmUserId - Airtm user ID
     */
    async invalidateCacheById(airtmUserId: string): Promise<void> {
        const cacheKey = `${USER_CACHE_PREFIX}id:${airtmUserId}`;
        await this.redis.del(cacheKey);
        this.logger.debug(`Cache invalidated for ID ${this.maskId(airtmUserId)}`);
    }

    /**
     * Creates a hash of email for cache key (to avoid storing email in Redis keys).
     */
    private hashEmail(email: string): string {
        // Simple hash for cache key - not for security
        let hash = 0;
        for (let i = 0; i < email.length; i++) {
            const char = email.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }
}
