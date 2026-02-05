import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HealthController } from './health.controller';
import { QUEUE_NAMES } from '../queues/queue.constants';

@Module({
    imports: [
        BullModule.registerQueue(
            { name: QUEUE_NAMES.WEBHOOKS },
            { name: QUEUE_NAMES.RECONCILIATION },
            { name: QUEUE_NAMES.NOTIFICATIONS },
            { name: QUEUE_NAMES.DLQ },
        ),
    ],
    controllers: [HealthController],
})
export class HealthModule {}
