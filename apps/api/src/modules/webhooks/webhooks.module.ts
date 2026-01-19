import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { AirtmModule } from '../../providers/airtm';

/**
 * Module for handling incoming webhooks from external providers.
 *
 * Endpoints:
 * - POST /webhooks/airtm - Airtm payin/payout events
 * - POST /webhooks/trustless-work - Escrow events (TODO)
 */
@Module({
    imports: [AirtmModule],
    controllers: [WebhooksController],
})
export class WebhooksModule {}
