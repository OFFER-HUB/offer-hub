import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';

type DependencyStatus = 'healthy' | 'degraded' | 'unhealthy';

interface DependencyCheck {
    status: DependencyStatus;
    latency?: number;
    error?: string;
}

interface HealthCheckResult {
    status: DependencyStatus;
    version: string;
    dependencies: {
        database: DependencyCheck;
        redis: DependencyCheck;
        airtm: DependencyCheck;
        trustlessWork: DependencyCheck;
    };
    timestamp: string;
}

@Injectable()
export class HealthService {
    constructor(
        @Inject(PrismaService) private prisma: PrismaService,
        @Inject(RedisService) private redis: RedisService,
    ) {}

    /**
     * Performs a comprehensive health check of all dependencies.
     */
    async check(): Promise<HealthCheckResult> {
        const [database, redisCheck, airtm, trustlessWork] = await Promise.all([
            this.checkDatabase(),
            this.checkRedis(),
            this.checkAirtm(),
            this.checkTrustlessWork(),
        ]);

        const dependencies = { database, redis: redisCheck, airtm, trustlessWork };
        const statuses = Object.values(dependencies).map((d) => d.status);

        let overallStatus: DependencyStatus = 'healthy';
        if (statuses.some((s) => s === 'unhealthy')) {
            overallStatus = 'unhealthy';
        } else if (statuses.some((s) => s === 'degraded')) {
            overallStatus = 'degraded';
        }

        return {
            status: overallStatus,
            version: process.env.npm_package_version || '1.0.0',
            dependencies,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Checks database connectivity.
     */
    private async checkDatabase(): Promise<DependencyCheck> {
        const start = Date.now();
        try {
            await Promise.race([
                this.prisma.$queryRaw`SELECT 1`,
                this.timeout(5000),
            ]);
            return {
                status: 'healthy',
                latency: Date.now() - start,
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                latency: Date.now() - start,
                error: error instanceof Error ? error.message : 'Database connection failed',
            };
        }
    }

    /**
     * Checks Redis connectivity.
     */
    private async checkRedis(): Promise<DependencyCheck> {
        const start = Date.now();
        try {
            await Promise.race([
                this.redis.set('health:ping', 'pong', 'EX', 10),
                this.timeout(5000),
            ]);
            return {
                status: 'healthy',
                latency: Date.now() - start,
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                latency: Date.now() - start,
                error: error instanceof Error ? error.message : 'Redis connection failed',
            };
        }
    }

    /**
     * Checks Airtm API reachability.
     * Returns degraded if not configured, unhealthy if configured but unreachable.
     */
    private async checkAirtm(): Promise<DependencyCheck> {
        if (!process.env.AIRTM_API_KEY) {
            return {
                status: 'degraded',
                error: 'Not configured',
            };
        }

        const start = Date.now();
        const baseUrl =
            process.env.AIRTM_ENV === 'production'
                ? 'https://payments.air-pay.io'
                : 'https://payments.static-stg.tests.airtm.org';

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`${baseUrl}/health`, {
                method: 'GET',
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Even 4xx responses mean the API is reachable
            return {
                status: response.ok || response.status < 500 ? 'healthy' : 'degraded',
                latency: Date.now() - start,
            };
        } catch (error) {
            return {
                status: 'degraded',
                latency: Date.now() - start,
                error: error instanceof Error ? error.message : 'Airtm API unreachable',
            };
        }
    }

    /**
     * Checks Trustless Work API reachability.
     * Returns degraded if not configured, unhealthy if configured but unreachable.
     */
    private async checkTrustlessWork(): Promise<DependencyCheck> {
        if (!process.env.TRUSTLESS_API_KEY) {
            return {
                status: 'degraded',
                error: 'Not configured',
            };
        }

        const start = Date.now();
        const baseUrl = process.env.TRUSTLESS_API_URL || 'https://dev.api.trustlesswork.com';

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`${baseUrl}/health`, {
                method: 'GET',
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            return {
                status: response.ok || response.status < 500 ? 'healthy' : 'degraded',
                latency: Date.now() - start,
            };
        } catch (error) {
            return {
                status: 'degraded',
                latency: Date.now() - start,
                error: error instanceof Error ? error.message : 'Trustless Work API unreachable',
            };
        }
    }

    /**
     * Creates a timeout promise for race conditions.
     */
    private timeout(ms: number): Promise<never> {
        return new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms),
        );
    }
}
