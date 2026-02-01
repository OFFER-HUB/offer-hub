import { Module, OnModuleInit, Inject } from '@nestjs/common';
import { ResolutionService } from './resolution.service';
import { ResolutionController } from './resolution.controller';
import { DatabaseModule } from '../database/database.module';
import { BalanceModule } from '../balance/balance.module';
import { TrustlessWorkModule } from '../../providers/trustless-work/trustless-work.module';
import { OrdersModule } from '../orders/orders.module';
import { WebhookService } from '../../providers/trustless-work/services/webhook.service';
import { EventsModule } from '../events/events.module';

/**
 * Resolution Module
 * Manages the financial conclusion of marketplace orders through:
 * - Release flows (funds to seller)
 * - Refund flows (funds to buyer)
 * - Dispute management (fractional splits)
 */
@Module({
    imports: [
        DatabaseModule,
        BalanceModule,
        TrustlessWorkModule,
        OrdersModule,
        EventsModule,
    ],
    controllers: [ResolutionController],
    providers: [ResolutionService],
    exports: [ResolutionService],
})
export class ResolutionModule implements OnModuleInit {
    constructor(
        @Inject(ResolutionService) private readonly resolutionService: ResolutionService,
        @Inject(WebhookService) private readonly webhookService: WebhookService,
    ) { }

    onModuleInit() {
        // Inject ResolutionService into WebhookService to avoid circular dependency
        if (this.webhookService) {
            this.webhookService.setResolutionService(this.resolutionService);
        }
    }
}
