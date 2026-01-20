import { Module } from '@nestjs/common';
import { DisputesController } from './disputes.controller';
import { ResolutionModule } from '../resolution/resolution.module';

/**
 * Disputes Module
 * Handles dispute CRUD operations and management endpoints.
 */
@Module({
    imports: [ResolutionModule],
    controllers: [DisputesController],
})
export class DisputesModule {}
