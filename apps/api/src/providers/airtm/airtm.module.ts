import { Module } from '@nestjs/common';
import { AirtmConfig } from './airtm.config';
import { AirtmPayinClient, AirtmPayoutClient, AirtmUserClient } from './clients';
import { AirtmWebhookService } from './services';
import { DatabaseModule } from '../../modules/database/database.module';
import { RedisModule } from '../../modules/redis/redis.module';

/**
 * Module for Airtm provider integration.
 *
 * Provides:
 * - AirtmConfig: Configuration and environment validation
 * - AirtmUserClient: User lookup and KYC verification
 * - AirtmPayinClient: Top-up (payin) operations
 * - AirtmPayoutClient: Withdrawal (payout) operations
 * - AirtmWebhookService: Webhook verification and processing
 *
 * @example
 * ```typescript
 * // In your service
 * constructor(
 *   private readonly airtmPayin: AirtmPayinClient,
 *   private readonly airtmPayout: AirtmPayoutClient,
 * ) {}
 *
 * // Create a top-up
 * const payin = await this.airtmPayin.createPayin({
 *   amount: '100.00',
 *   destinationUserId: 'airtm_user_123',
 * });
 *
 * // Create a withdrawal
 * const payout = await this.airtmPayout.createPayout({
 *   amount: '50.00',
 *   sourceUserId: 'airtm_user_123',
 *   destinationType: 'bank',
 *   destinationRef: 'bank_account_ref',
 * });
 * ```
 */
@Module({
    imports: [DatabaseModule, RedisModule],
    providers: [
        AirtmConfig,
        AirtmUserClient,
        AirtmPayinClient,
        AirtmPayoutClient,
        AirtmWebhookService,
    ],
    exports: [
        AirtmConfig,
        AirtmUserClient,
        AirtmPayinClient,
        AirtmPayoutClient,
        AirtmWebhookService,
    ],
})
export class AirtmModule {}
