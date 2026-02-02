import { Injectable, Logger, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../database/prisma.service';
import { DomainEvent } from './types/domain-event';
import { nanoid } from 'nanoid';

/**
 * AuditLogListener
 * 
 * Automatically persists domain events to the AuditLog table.
 * This ensures a permanent, unchangeable record of all critical system actions.
 */
@Injectable()
export class AuditLogListener {
    private readonly logger = new Logger(AuditLogListener.name);

    constructor(
        @Inject(PrismaService) private readonly prisma: PrismaService,
    ) { }

    /**
     * Listen to ALL domain events and persist them.
     * Use '**' wildcard to catch every event emitted via EventBusService.
     */
    @OnEvent('**')
    async handleEvent(event: DomainEvent) {
        // Basic validation - skip if it's not a proper DomainEvent
        if (!event.eventType || !event.aggregateId) {
            return;
        }

        try {
            // Map DomainEvent to AuditLog model
            await this.prisma.auditLog.create({
                data: {
                    id: `aud_${nanoid()}`,
                    occurredAt: new Date(event.occurredAt),
                    marketplaceId: (event.metadata?.marketplaceId as string) || 'system',
                    userId: (event.metadata?.userId as string) || null,
                    action: event.eventType,
                    resourceType: event.aggregateType,
                    resourceId: event.aggregateId,
                    payloadAfter: event.payload as any,
                    correlationId: (event.metadata?.correlationId as string) || null,
                    // Additional metadata for tracing
                    actorType: (event.metadata?.actorType as string) || 'USER',
                    actorId: (event.metadata?.userId as string) || 'SYSTEM',
                },
            });

            this.logger.debug(`Audit log persisted for event: ${event.eventType} [${event.eventId}]`);
        } catch (error) {
            // We catch but don't rethrow to avoid breaking the event emission flow
            this.logger.error(
                `Failed to persist audit log for event ${event.eventType} [${event.eventId}]`,
                error,
            );
        }
    }
}
