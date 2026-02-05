import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES, JOB_TYPES } from '../queues/queue.constants';

/**
 * Processor for webhook jobs.
 *
 * Handles incoming webhooks from external providers:
 * - Airtm payin/payout updates
 * - Trustless Work escrow updates
 */
@Processor(QUEUE_NAMES.WEBHOOKS)
export class WebhookProcessor extends WorkerHost {
    private readonly logger = new Logger(WebhookProcessor.name);

    async process(job: Job<Record<string, unknown>>): Promise<unknown> {
        this.logger.log(`Processing webhook job: ${job.name} [${job.id}]`);

        try {
            switch (job.name) {
                case JOB_TYPES.AIRTM_PAYIN:
                    return this.processAirtmPayin(job);
                case JOB_TYPES.AIRTM_PAYOUT:
                    return this.processAirtmPayout(job);
                case JOB_TYPES.TRUSTLESS_ESCROW:
                    return this.processTrustlessEscrow(job);
                default:
                    this.logger.warn(`Unknown webhook job type: ${job.name}`);
                    return { processed: false, reason: 'unknown_job_type' };
            }
        } catch (error) {
            this.logger.error(`Failed to process webhook job ${job.id}:`, error);
            throw error; // Re-throw to trigger retry or DLQ
        }
    }

    private async processAirtmPayin(job: Job): Promise<{ processed: boolean }> {
        this.logger.debug(`Processing Airtm payin webhook: ${JSON.stringify(job.data)}`);
        // TODO: Implement actual payin processing logic
        // This will be connected to the API's webhook service
        return { processed: true };
    }

    private async processAirtmPayout(job: Job): Promise<{ processed: boolean }> {
        this.logger.debug(`Processing Airtm payout webhook: ${JSON.stringify(job.data)}`);
        // TODO: Implement actual payout processing logic
        return { processed: true };
    }

    private async processTrustlessEscrow(job: Job): Promise<{ processed: boolean }> {
        this.logger.debug(`Processing Trustless escrow webhook: ${JSON.stringify(job.data)}`);
        // TODO: Implement actual escrow processing logic
        return { processed: true };
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        this.logger.log(`Webhook job completed: ${job.name} [${job.id}]`);
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job, error: Error) {
        this.logger.error(`Webhook job failed: ${job.name} [${job.id}] - ${error.message}`);
        if (job.attemptsMade >= (job.opts.attempts || 3)) {
            this.logger.warn(`Job ${job.id} exhausted all retries, will be moved to DLQ`);
        }
    }

    @OnWorkerEvent('progress')
    onProgress(job: Job, progress: number | object) {
        this.logger.debug(`Webhook job progress: ${job.name} [${job.id}] - ${JSON.stringify(progress)}`);
    }
}
