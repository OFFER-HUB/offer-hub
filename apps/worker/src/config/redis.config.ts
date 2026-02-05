import type { RedisOptions } from 'ioredis';

/**
 * Get Redis configuration from environment variables.
 *
 * Environment variables:
 * - REDIS_HOST: Redis host (default: localhost)
 * - REDIS_PORT: Redis port (default: 6379)
 * - REDIS_PASSWORD: Redis password (optional)
 * - REDIS_DB: Redis database number (default: 0)
 * - REDIS_TLS: Enable TLS (default: false)
 */
export function getRedisConfig(): RedisOptions {
    const config: RedisOptions = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        maxRetriesPerRequest: null, // Required for BullMQ
        enableReadyCheck: false,    // Recommended for BullMQ
    };

    if (process.env.REDIS_PASSWORD) {
        config.password = process.env.REDIS_PASSWORD;
    }

    if (process.env.REDIS_DB) {
        config.db = parseInt(process.env.REDIS_DB, 10);
    }

    if (process.env.REDIS_TLS === 'true') {
        config.tls = {};
    }

    return config;
}
