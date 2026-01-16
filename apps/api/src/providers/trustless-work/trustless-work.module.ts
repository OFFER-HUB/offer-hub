import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../modules/database/database.module';
import { TrustlessWorkConfig } from './trustless-work.config';
import { EscrowClient } from './clients/escrow.client';
import { WalletClient } from './clients/wallet.client';
import { WebhookService } from './services/webhook.service';
import { BalanceProjectionService } from './services/balance-projection.service';

/**
 * Trustless Work Module
 * Provides escrow contract management via Trustless Work API
 *
 * Features:
 * - Escrow contract creation, funding, release, refund
 * - Stellar wallet balance queries
 * - Balance projection (Airtm + on-chain)
 * - Webhook processing with HMAC verification
 */
@Module({
    imports: [DatabaseModule],
    providers: [
        TrustlessWorkConfig,
        EscrowClient,
        WalletClient,
        WebhookService,
        BalanceProjectionService,
    ],
    exports: [
        TrustlessWorkConfig,
        EscrowClient,
        WalletClient,
        WebhookService,
        BalanceProjectionService,
    ],
})
export class TrustlessWorkModule {}
