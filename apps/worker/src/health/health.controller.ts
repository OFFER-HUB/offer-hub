import { Controller, Get } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from '../queues/queue.constants';

interface QueueHealth {
    name: string;
    status: 'healthy' | 'unhealthy';
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
}

interface HealthResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: number;
    redis: {
        status: 'connected' | 'disconnected';
    };
    queues: QueueHealth[];
}

/**
 * Health check endpoint for the worker.
 *
 * Returns the status of:
 * - Redis connection
 * - All registered queues
 * - Worker uptime
 */
@Controller('health')
export class HealthController {
    private readonly startTime = Date.now();

    constructor(
        @InjectQueue(QUEUE_NAMES.WEBHOOKS) private readonly webhooksQueue: Queue,
        @InjectQueue(QUEUE_NAMES.RECONCILIATION) private readonly reconciliationQueue: Queue,
        @InjectQueue(QUEUE_NAMES.NOTIFICATIONS) private readonly notificationsQueue: Queue,
        @InjectQueue(QUEUE_NAMES.DLQ) private readonly dlqQueue: Queue,
    ) {}

    @Get()
    async getHealth(): Promise<HealthResponse> {
        const queues = [
            { name: QUEUE_NAMES.WEBHOOKS, queue: this.webhooksQueue },
            { name: QUEUE_NAMES.RECONCILIATION, queue: this.reconciliationQueue },
            { name: QUEUE_NAMES.NOTIFICATIONS, queue: this.notificationsQueue },
            { name: QUEUE_NAMES.DLQ, queue: this.dlqQueue },
        ];

        const queueHealths: QueueHealth[] = [];
        let redisConnected = true;

        for (const { name, queue } of queues) {
            try {
                const [waiting, active, completed, failed, delayed] = await Promise.all([
                    queue.getWaitingCount(),
                    queue.getActiveCount(),
                    queue.getCompletedCount(),
                    queue.getFailedCount(),
                    queue.getDelayedCount(),
                ]);

                queueHealths.push({
                    name,
                    status: 'healthy',
                    waiting,
                    active,
                    completed,
                    failed,
                    delayed,
                });
            } catch {
                redisConnected = false;
                queueHealths.push({
                    name,
                    status: 'unhealthy',
                    waiting: 0,
                    active: 0,
                    completed: 0,
                    failed: 0,
                    delayed: 0,
                });
            }
        }

        const unhealthyQueues = queueHealths.filter((q) => q.status === 'unhealthy');
        let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

        if (!redisConnected) {
            overallStatus = 'unhealthy';
        } else if (unhealthyQueues.length > 0) {
            overallStatus = 'degraded';
        }

        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            redis: {
                status: redisConnected ? 'connected' : 'disconnected',
            },
            queues: queueHealths,
        };
    }

    @Get('ready')
    async getReadiness(): Promise<{ ready: boolean }> {
        try {
            // Check if we can communicate with Redis
            await this.webhooksQueue.getWaitingCount();
            return { ready: true };
        } catch {
            return { ready: false };
        }
    }

    @Get('live')
    getLiveness(): { alive: boolean } {
        return { alive: true };
    }
}
