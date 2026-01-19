import { Module } from '@nestjs/common';
import { TopUpsController } from './topups.controller';
import { TopUpsService } from './topups.service';
import { DatabaseModule } from '../database/database.module';
import { AirtmModule } from '../../providers/airtm';
import { AuthModule } from '../auth/auth.module';

/**
 * Module for top-up (payin) functionality.
 *
 * Endpoints:
 * - POST /topups - Create a new top-up
 * - GET /topups - List user's top-ups
 * - GET /topups/:id - Get a specific top-up
 * - POST /topups/:id/refresh - Refresh status from Airtm
 */
@Module({
    imports: [DatabaseModule, AirtmModule, AuthModule],
    controllers: [TopUpsController],
    providers: [TopUpsService],
    exports: [TopUpsService],
})
export class TopUpsModule {}
