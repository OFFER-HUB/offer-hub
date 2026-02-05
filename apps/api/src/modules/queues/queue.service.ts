import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { QUEUE_NAMES, JOB_TYPES, type JobType } from './queue.constants';

/**
 * Schedule configuration for reconciliation jobs
 */
export interface ScheduleConfig {
    /** Repeat interval in ms */
    every?: number;
    /** Cron pattern (alternative to every) */
    pattern?: string;
    /** Job-specific configuration */
    config?: {
        batchSize?: number;
        rateLimitDelay?: number;
        staleThreshold?: number;
    };
}

/**
 * Default schedules for reconciliation jobs
 */
const DEFAULT_SCHEDULES: Record<string, ScheduleConfig> = {
    [JOB_TYPES.SYNC_TOPUPS]: {
        every: 5 * 60 * 1000, // Every 5 minutes
        config: { batchSize: 50, staleThreshold: 5 * 60 * 1000 },
    },
    [JOB_TYPES.SYNC_WITHDRAWALS]: {
        every: 5 * 60 * 1000, // Every 5 minutes
        config: { batchSize: 50, staleThreshold: 5 * 60 * 1000 },
    },
    [JOB_TYPES.SYNC_ESCROWS]: {
        every: 10 * 60 * 1000, // Every 10 minutes
        config: { batchSize: 30, staleThreshold: 10 * 60 * 1000 },
    },
};

/**
 * Service for enqueuing jobs and managing queues.
 */
@Injectable()
export class QueueService implements OnModuleInit {
    private readonly logger = new Logger(QueueService.name);
    private scheduledJobs: Map<string, string> = new Map(); // jobType -> repeatJobKey

    constructor(
        @InjectQueue(QUEUE_NAMES.WEBHOOKS) private readonly webhooksQueue: Queue,
        @InjectQueue(QUEUE_NAMES.RECONCILIATION) private readonly reconciliationQueue: Queue,
        @InjectQueue(QUEUE_NAMES.NOTIFICATIONS) private readonly notificationsQueue: Queue,
        @InjectQueue(QUEUE_NAMES.DLQ) private readonly dlqQueue: Queue,
    ) {}

    /**
     * Initialize scheduled jobs on module startup
     */
    async onModuleInit(): Promise<void> {
        // Only schedule in non-test environments
        if (process.env.NODE_ENV === 'test') {
            this.logger.debug('Skipping job scheduling in test environment');
            return;
        }

        await this.setupReconciliationSchedules();
    }

    /**
     * Set up all reconciliation job schedules
     */
    private async setupReconciliationSchedules(): Promise<void> {
        this.logger.log('Setting up reconciliation job schedules...');

        for (const [jobType, schedule] of Object.entries(DEFAULT_SCHEDULES)) {
            try {
                await this.scheduleReconciliationJob(jobType as JobType, schedule);
            } catch (error) {
                this.logger.error(
                    `Failed to schedule ${jobType}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                );
            }
        }

        this.logger.log('Reconciliation job schedules configured');
    }

    /**
     * Schedule a repeatable reconciliation job
     */
    async scheduleReconciliationJob(
        jobType: JobType,
        schedule: ScheduleConfig = DEFAULT_SCHEDULES[jobType] || {},
    ): Promise<void> {
        // Remove existing schedule if any
        await this.removeScheduledJob(jobType);

        const repeatOpts: { every?: number; pattern?: string } = {};
        if (schedule.every) {
            repeatOpts.every = schedule.every;
        } else if (schedule.pattern) {
            repeatOpts.pattern = schedule.pattern;
        } else {
            // Default to every 5 minutes
            repeatOpts.every = 5 * 60 * 1000;
        }

        const job = await this.reconciliationQueue.add(
            jobType,
            { config: schedule.config || {} },
            {
                repeat: repeatOpts,
                jobId: `scheduled-${jobType}`,
                removeOnComplete: { count: 100 },
                removeOnFail: false,
            },
        );

        this.scheduledJobs.set(jobType, job.repeatJobKey || '');
        this.logger.log(
            `Scheduled ${jobType}: ${schedule.every ? `every ${schedule.every / 1000}s` : schedule.pattern}`,
        );
    }

    /**
     * Remove a scheduled job
     */
    async removeScheduledJob(jobType: JobType): Promise<void> {
        const repeatJobKey = this.scheduledJobs.get(jobType);
        if (repeatJobKey) {
            try {
                await this.reconciliationQueue.removeRepeatableByKey(repeatJobKey);
                this.scheduledJobs.delete(jobType);
                this.logger.debug(`Removed scheduled job: ${jobType}`);
            } catch {
                // Job may not exist, ignore
            }
        }
    }

    /**
     * Get all scheduled job configurations
     */
    getScheduledJobs(): Map<string, string> {
        return new Map(this.scheduledJobs);
    }

    /**
     * Trigger a reconciliation job immediately (manual run)
     */
    async triggerReconciliationJob(
        jobType: JobType,
        config?: { batchSize?: number; rateLimitDelay?: number; staleThreshold?: number },
    ): Promise<Job> {
        this.logger.log(`Manually triggering reconciliation job: ${jobType}`);
        return this.reconciliationQueue.add(jobType, { config: config || {}, manual: true }, {
            jobId: `manual-${jobType}-${Date.now()}`,
        });
    }

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

    /**
     * Get repeatable jobs info
     */
    async getRepeatableJobs(): Promise<Array<{ key: string; name: string; next?: number; pattern?: string; every?: number }>> {
        const repeatableJobs = await this.reconciliationQueue.getRepeatableJobs();
        return repeatableJobs.map(job => ({
            key: job.key,
            name: job.name,
            next: job.next,
            pattern: job.pattern ?? undefined,
            every: typeof job.every === 'number' ? job.every : undefined,
        }));
    }
}
