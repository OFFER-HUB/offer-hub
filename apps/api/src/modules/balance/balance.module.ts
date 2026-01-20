import { Module } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';
import { DatabaseModule } from '../database/database.module';
import { AirtmModule } from '../../providers/airtm/airtm.module';
import { AuthModule } from '../auth/auth.module';

/**
 * Balance Module
 *
 * Provides atomic balance management operations for the OFFER-HUB platform.
 *
 * Endpoints:
 * - GET /users/:userId/balance - Get user balance
 * - POST /users/:userId/balance/credit - Credit available balance
 * - POST /users/:userId/balance/debit - Debit available balance
 * - POST /users/:userId/balance/reserve - Reserve funds for order
 * - POST /users/:userId/balance/release - Release reserved funds to seller
 * - POST /users/:userId/balance/cancel-reservation - Cancel reservation
 * - POST /users/:userId/balance/deduct-reserved - Deduct from reserved
 * - POST /users/:userId/balance/sync - Sync with provider
 * - GET /users/:userId/balance/verify - Get balance with provider verification
 *
 * @see docs/system/state-machines.md#36-balance-model
 */
@Module({
    imports: [
        DatabaseModule,
        AirtmModule,
        AuthModule,
    ],
    controllers: [BalanceController],
    providers: [BalanceService],
    exports: [BalanceService],
})
export class BalanceModule {}
