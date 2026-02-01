import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { BalanceModule } from '../balance/balance.module';
import { TrustlessWorkModule } from '../../providers/trustless-work/trustless-work.module';
import { EventsModule } from '../events/events.module';

/**
 * Orders Module
 * Handles order lifecycle management, funds reservation, and escrow orchestration
 */
@Module({
    imports: [
        BalanceModule, // For funds reservation/deduction
        TrustlessWorkModule, // For escrow creation/funding
        EventsModule,
    ],
    controllers: [OrdersController],
    providers: [OrdersService],
    exports: [OrdersService],
})
export class OrdersModule { }
