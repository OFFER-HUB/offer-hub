import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { QUEUE_NAMES, type JobType } from './queue.constants';

/**
 * Service for enqueuing jobs and managing queues.
 */
@Injectable()
export class QueueService {
    private readonly logger = new Logger(QueueService.name);

    constructor(
        @InjectQueue(QUEUE_NAMES.WEBHOOKS) private readonly webhooksQueue: Queue,
        @InjectQueue(QUEUE_NAMES.RECONCILIATION) private readonly reconciliationQueue: Queue,
        @InjectQueue(QUEUE_NAMES.NOTIFICATIONS) private readonly notificationsQueue: Queue,
        @InjectQueue(QUEUE_NAMES.DLQ) private readonly dlqQueue: Queue,
    ) {}

    /**
     * Add a webhook processing job.
     */
    async addWebhookJob(type: JobType, data: Record<string, unknown>): Promise<Job> {
        this.logger.debug(`Adding webhook job: ${type}`);
        return this.webhooksQueue.add(type, data, {
            jobId: `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        });
    }

    /**
     * Add a reconciliation job.
     */
    async addReconciliationJob(type: JobType, data: Record<string, unknown>): Promise<Job> {
        this.logger.debug(`Adding reconciliation job: ${type}`);
        return this.reconciliationQueue.add(type, data);
    }

    /**
     * Add a notification job.
     */
    async addNotificationJob(type: JobType, data: Record<string, unknown>): Promise<Job> {
        this.logger.debug(`Adding notification job: ${type}`);
        return this.notificationsQueue.add(type, data);
    }

    /**
     * Move a failed job to the Dead Letter Queue.
     */
    async moveToDlq(originalQueue: string, job: Job, error: Error): Promise<Job> {
        this.logger.warn(`Moving job ${job.id} from ${originalQueue} to DLQ: ${error.message}`);
        return this.dlqQueue.add('failed-job', {
            originalQueue,
            originalJobId: job.id,
            originalJobName: job.name,
            originalJobData: job.data,
            failedAt: new Date().toISOString(),
            error: {
                message: error.message,
                stack: error.stack,
            },
            attemptsMade: job.attemptsMade,
        });
    }

    /**
     * Retry a job from the DLQ.
     */
    async retryFromDlq(dlqJobId: string): Promise<Job | null> {
        const dlqJob = await this.dlqQueue.getJob(dlqJobId);
        if (!dlqJob) {
            this.logger.warn(`DLQ job ${dlqJobId} not found`);
            return null;
        }

        const { originalQueue, originalJobName, originalJobData } = dlqJob.data as {
            originalQueue: string;
            originalJobName: string;
            originalJobData: Record<string, unknown>;
        };

        let queue: Queue;
        switch (originalQueue) {
            case QUEUE_NAMES.WEBHOOKS:
                queue = this.webhooksQueue;
                break;
            case QUEUE_NAMES.RECONCILIATION:
                queue = this.reconciliationQueue;
                break;
            case QUEUE_NAMES.NOTIFICATIONS:
                queue = this.notificationsQueue;
                break;
            default:
                this.logger.error(`Unknown queue: ${originalQueue}`);
                return null;
        }

        this.logger.log(`Retrying job ${dlqJobId} from DLQ to ${originalQueue}`);
        const newJob = await queue.add(originalJobName, originalJobData);

        // Remove from DLQ after successful re-queue
        await dlqJob.remove();

        return newJob;
    }

    /**
     * Get queue statistics.
     */
    async getQueueStats(): Promise<Record<string, { waiting: number; active: number; completed: number; failed: number; delayed: number }>> {
        const queues = [
            { name: QUEUE_NAMES.WEBHOOKS, queue: this.webhooksQueue },
            { name: QUEUE_NAMES.RECONCILIATION, queue: this.reconciliationQueue },
            { name: QUEUE_NAMES.NOTIFICATIONS, queue: this.notificationsQueue },
            { name: QUEUE_NAMES.DLQ, queue: this.dlqQueue },
        ];

        const stats: Record<string, { waiting: number; active: number; completed: number; failed: number; delayed: number }> = {};

        for (const { name, queue } of queues) {
            const [waiting, active, completed, failed, delayed] = await Promise.all([
                queue.getWaitingCount(),
                queue.getActiveCount(),
                queue.getCompletedCount(),
                queue.getFailedCount(),
                queue.getDelayedCount(),
            ]);
            stats[name] = { waiting, active, completed, failed, delayed };
        }

        return stats;
    }

    /**
     * Get jobs from DLQ for inspection.
     */
    async getDlqJobs(start = 0, end = 50): Promise<Job[]> {
        return this.dlqQueue.getJobs(['waiting', 'delayed', 'failed'], start, end);
    }
}
