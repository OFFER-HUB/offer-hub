import { Injectable, Logger, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { nanoid } from 'nanoid';
import { DomainEvent, EventMetadata } from './types/domain-event';
import { EVENT_CATALOG, EventType, isValidEventType } from './event-catalog';

/**
 * EventBusService
 * 
 * Core service for emitting and subscribing to domain events.
 * Uses NestJS EventEmitter2 under the hood with wildcard support.
 * 
 * Features:
 * - Automatic event ID generation (evt_ prefix)
 * - Wildcard subscriptions (e.g., 'order.*', '*')
 * - Type-safe event emission
 * - Metadata propagation for correlation
 * - Event validation
 * 
 * @example
 * ```typescript
 * // Emit an event
 * this.eventBus.emit({
 *   eventType: EVENT_CATALOG.ORDER_CREATED,
 *   aggregateId: order.id,
 *   aggregateType: 'Order',
 *   payload: { buyerId, sellerId, amount },
 *   metadata: { correlationId, userId }
 * });
 * 
 * // Subscribe to events
 * @OnEvent('order.created')
 * handleOrderCreated(event: DomainEvent<OrderCreatedPayload>) {
 *   // Handle event
 * }
 * 
 * // Subscribe to all order events
 * @OnEvent('order.*')
 * handleAnyOrderEvent(event: DomainEvent) {
 *   // Handle any order event
 * }
 * ```
 */
@Injectable()
export class EventBusService {
    private readonly logger = new Logger(EventBusService.name);

    constructor(@Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2) { }

    /**
     * Emit a domain event
     * 
     * Automatically generates:
     * - eventId with evt_ prefix
     * - occurredAt timestamp
     * 
     * @param event - Partial domain event (eventId and occurredAt are auto-generated)
     * @returns The complete domain event that was emitted
     */
    emit<T = unknown>(
        event: Omit<DomainEvent<T>, 'eventId' | 'occurredAt'>,
    ): DomainEvent<T> {
        // Validate event type
        if (!isValidEventType(event.eventType)) {
            this.logger.warn(
                `Event type "${event.eventType}" is not in EVENT_CATALOG. This may be intentional for custom events.`,
            );
        }

        // Generate event ID and timestamp
        const completeEvent: DomainEvent<T> = {
            eventId: this.generateEventId(),
            occurredAt: new Date().toISOString(),
            ...event,
        };

        // Log event emission (debug level)
        this.logger.debug(
            `Emitting event: ${completeEvent.eventType} [${completeEvent.eventId}] for ${completeEvent.aggregateType}:${completeEvent.aggregateId}`,
        );

        // Emit the event
        try {
            this.eventEmitter.emit(completeEvent.eventType, completeEvent);
        } catch (error) {
            this.logger.error(
                `Failed to emit event ${completeEvent.eventType} [${completeEvent.eventId}]`,
                error,
            );
            throw error;
        }

        return completeEvent;
    }

    /**
     * Emit multiple events in sequence
     * 
     * @param events - Array of partial domain events
     * @returns Array of complete domain events that were emitted
     */
    emitMany<T = unknown>(
        events: Array<Omit<DomainEvent<T>, 'eventId' | 'occurredAt'>>,
    ): DomainEvent<T>[] {
        return events.map((event) => this.emit(event));
    }

    /**
     * Subscribe to an event type
     * 
     * Note: In NestJS, it's recommended to use the @OnEvent() decorator instead.
     * This method is provided for programmatic subscriptions.
     * 
     * @param eventType - Event type to subscribe to (supports wildcards like 'order.*')
     * @param handler - Handler function to call when event is emitted
     */
    subscribe<T = unknown>(
        eventType: EventType | string,
        handler: (event: DomainEvent<T>) => void | Promise<void>,
    ): void {
        this.eventEmitter.on(eventType, handler);
        this.logger.debug(`Subscribed to event type: ${eventType}`);
    }

    /**
     * Unsubscribe from an event type
     * 
     * @param eventType - Event type to unsubscribe from
     * @param handler - Handler function to remove
     */
    unsubscribe<T = unknown>(
        eventType: EventType | string,
        handler: (event: DomainEvent<T>) => void | Promise<void>,
    ): void {
        this.eventEmitter.off(eventType, handler);
        this.logger.debug(`Unsubscribed from event type: ${eventType}`);
    }

    /**
     * Generate a prefixed event ID
     * 
     * Format: evt_{nanoid(21)}
     * 
     * @returns Event ID with evt_ prefix
     */
    private generateEventId(): string {
        return `evt_${nanoid(21)}`;
    }

    /**
     * Create event metadata with correlation support
     * 
     * Helper method to create metadata objects with proper typing
     * 
     * @param metadata - Partial metadata
     * @returns Complete metadata object
     */
    static createMetadata(metadata: Partial<EventMetadata> = {}): EventMetadata {
        return {
            correlationId: metadata.correlationId,
            causationId: metadata.causationId,
            userId: metadata.userId,
            marketplaceId: metadata.marketplaceId,
            ...metadata,
        };
    }
}
