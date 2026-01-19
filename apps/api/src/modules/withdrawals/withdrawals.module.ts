import { Module } from '@nestjs/common';
import { WithdrawalsController } from './withdrawals.controller';
import { WithdrawalsService } from './withdrawals.service';
import { DatabaseModule } from '../database/database.module';
import { AirtmModule } from '../../providers/airtm';
import { AuthModule } from '../auth/auth.module';

/**
 * Module for withdrawal (payout) functionality.
 *
 * Endpoints:
 * - POST /withdrawals - Create a new withdrawal
 * - GET /withdrawals - List user's withdrawals
 * - GET /withdrawals/:id - Get a specific withdrawal
 * - POST /withdrawals/:id/commit - Commit a pending withdrawal
 * - POST /withdrawals/:id/refresh - Refresh status from Airtm
 */
@Module({
    imports: [DatabaseModule, AirtmModule, AuthModule],
    controllers: [WithdrawalsController],
    providers: [WithdrawalsService],
    exports: [WithdrawalsService],
})
export class WithdrawalsModule {}
