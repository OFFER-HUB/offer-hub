import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from './queue.constants';
import { WebhookProcessor } from './processors/webhook.processor';
import { DlqProcessor } from './processors/dlq.processor';
import { QueueService } from './queue.service';

/**
 * Queue module that registers all BullMQ queues and processors.
 *
 * This module is integrated into the main API application,
 * allowing background job processing in the same process.
 */
@Module({
    imports: [
        // Register queues
        BullModule.registerQueue(
            {
                name: QUEUE_NAMES.WEBHOOKS,
                defaultJobOptions: {
                    attempts: 5,
                    backoff: {
                        type: 'exponential',
                        delay: 2000,
                    },
                },
            },
            {
                name: QUEUE_NAMES.RECONCILIATION,
                defaultJobOptions: {
                    attempts: 3,
                    backoff: {
                        type: 'fixed',
                        delay: 5000,
                    },
                },
            },
            {
                name: QUEUE_NAMES.NOTIFICATIONS,
                defaultJobOptions: {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 1000,
                    },
                },
            },
            {
                name: QUEUE_NAMES.DLQ,
                defaultJobOptions: {
                    attempts: 1,
                    removeOnComplete: false,
                    removeOnFail: false,
                },
            },
        ),
    ],
    providers: [
        WebhookProcessor,
        DlqProcessor,
        QueueService,
    ],
    exports: [QueueService],
})
export class QueueModule {}
