import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../queue.constants';

/**
 * Dead Letter Queue processor.
 *
 * Jobs in the DLQ are not automatically processed - they require manual
 * intervention. This processor logs DLQ events for monitoring and alerting.
 */
@Processor(QUEUE_NAMES.DLQ)
export class DlqProcessor extends WorkerHost {
    private readonly logger = new Logger(DlqProcessor.name);

    async process(job: Job<{
        originalQueue: string;
        originalJobId: string;
        originalJobName: string;
        originalJobData: Record<string, unknown>;
        failedAt: string;
        error: { message: string; stack?: string };
        attemptsMade: number;
    }>): Promise<{ logged: boolean }> {
        this.logger.error(`🚨 DLQ Job received: ${job.data.originalJobName}`);
        this.logger.error(`  Original Queue: ${job.data.originalQueue}`);
        this.logger.error(`  Original Job ID: ${job.data.originalJobId}`);
        this.logger.error(`  Failed At: ${job.data.failedAt}`);
        this.logger.error(`  Attempts Made: ${job.data.attemptsMade}`);
        this.logger.error(`  Error: ${job.data.error.message}`);

        // TODO: Send alert to monitoring system (e.g., Slack, PagerDuty, etc.)

        return { logged: true };
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        this.logger.log(`DLQ job logged: ${job.id}`);
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job, error: Error) {
        this.logger.error(`DLQ processor failed: ${job.id} - ${error.message}`);
    }
}
