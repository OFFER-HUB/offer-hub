/**
 * Event Types (Shared)
 * 
 * Shared event type definitions for SDK and external packages.
 * These types match the server-side event structure but are
 * designed for consumption by external clients.
 */

/**
 * Base event structure for SSE streaming
 */
export interface StreamedEvent<T = unknown> {
    /**
     * Event ID with evt_ prefix
     */
    id: string;

    /**
     * Event type from EVENT_CATALOG
     */
    type: string;

    /**
     * ISO 8601 timestamp
     */
    occurred_at: string;

    /**
     * Marketplace ID
     */
    marketplace_id?: string;

    /**
     * Actor information
     */
    actor?: {
        type: 'user' | 'system' | 'support' | 'webhook';
        id?: string;
    };

    /**
     * Resource information
     */
    resource: {
        type: 'order' | 'topup' | 'withdrawal' | 'dispute' | 'escrow' | 'user' | 'balance';
        id: string;
    };

    /**
     * Event-specific data
     */
    data: T;
}
