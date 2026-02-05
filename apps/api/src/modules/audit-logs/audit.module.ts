import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { RedactionService } from './redaction.service';
import { DatabaseModule } from '../database/database.module';

/**
 * Audit Logs Module
 * Provides audit trail for compliance and support: AuditService, RedactionService, GET /audit/logs.
 */
@Module({
    imports: [DatabaseModule],
    controllers: [AuditController],
    providers: [AuditService, RedactionService],
    exports: [AuditService, RedactionService],
})
export class AuditModule {}
