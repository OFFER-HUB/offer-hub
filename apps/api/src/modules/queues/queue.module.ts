import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from './queue.constants';
import { WebhookProcessor } from './processors/webhook.processor';
import { DlqProcessor } from './processors/dlq.processor';
import { ReconciliationProcessor } from './processors/reconciliation.processor';
import { QueueService } from './queue.service';
import { DatabaseModule } from '../database/database.module';
import { TopUpsModule } from '../topups/topups.module';
import { WithdrawalsModule } from '../withdrawals/withdrawals.module';
import { TrustlessWorkModule } from '../../providers/trustless-work/trustless-work.module';

/**
 * Queue module that registers all BullMQ queues and processors.
 *
 * This module is integrated into the main API application,
 * allowing background job processing in the same process.
 *
 * Scheduled Jobs:
 * - SYNC_TOPUPS: Every 5 minutes, syncs pending topups with Airtm
 * - SYNC_WITHDRAWALS: Every 5 minutes, syncs pending withdrawals with Airtm
 * - SYNC_ESCROWS: Every 10 minutes, verifies escrow states with Trustless Work
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
        // Dependencies for processors
        DatabaseModule,
        forwardRef(() => TopUpsModule),
        forwardRef(() => WithdrawalsModule),
        TrustlessWorkModule,
    ],
    providers: [
        WebhookProcessor,
        DlqProcessor,
        ReconciliationProcessor,
        QueueService,
    ],
    exports: [QueueService],
})
export class QueueModule {}
