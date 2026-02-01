/**
 * Base Domain Event Interface
 * 
 * All events emitted through the EventBusService must conform to this interface.
 * This ensures consistent structure for event streaming, audit logging, and future integrations.
 */
export interface DomainEvent<T = unknown> {
    /**
     * Unique event identifier with evt_ prefix
     * Generated using nanoid(21)
     * @example "evt_abc123def456ghi789jkl"
     */
    eventId: string;

    /**
     * Event type from the EVENT_CATALOG
     * @example "order.created", "topup.succeeded"
     */
    eventType: string;

    /**
     * ISO 8601 timestamp when the event occurred
     * @example "2026-01-27T10:00:00.000Z"
     */
    occurredAt: string;

    /**
     * ID of the resource that triggered this event
     * @example "ord_abc123", "topup_xyz789"
     */
    aggregateId: string;

    /**
     * Type of the resource
     * @example "Order", "TopUp", "Withdrawal"
     */
    aggregateType: string;

    /**
     * Event-specific payload data
     * Type is generic to allow different event types to have different payloads
     */
    payload: T;

    /**
     * Metadata for traceability and correlation
     */
    metadata: EventMetadata;
}

/**
 * Event Metadata for correlation and tracing
 */
export interface EventMetadata {
    /**
     * Correlation ID to trace related events across the system
     * Should be propagated from the original request
     */
    correlationId?: string;

    /**
     * ID of the event that caused this event (event causality chain)
     */
    causationId?: string;

    /**
     * User ID who triggered this event (if applicable)
     */
    userId?: string;

    /**
     * Marketplace ID (for multi-tenant scenarios)
     */
    marketplaceId?: string;

    /**
     * Additional context-specific metadata
     */
    [key: string]: unknown;
}
