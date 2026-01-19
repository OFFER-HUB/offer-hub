import type { AirtmWebhookEventType, AirtmWebhookEventData } from '../types';

/**
 * DTOs for Airtm Webhook processing.
 */

/**
 * Raw webhook payload from Airtm.
 */
export interface AirtmRawWebhookPayload {
    /** Unique event ID from Airtm */
    eventId: string;

    /** Event type (e.g., 'payin.succeeded', 'payout.completed') */
    eventType: AirtmWebhookEventType;

    /** When the event occurred (ISO 8601) */
    occurredAt: string;

    /** Event-specific data */
    data: AirtmWebhookEventData;
}

/**
 * Svix webhook headers for signature verification.
 */
export interface SvixHeaders {
    'svix-id': string;
    'svix-timestamp': string;
    'svix-signature': string;
}

/**
 * Result of webhook processing.
 */
export interface WebhookProcessResult {
    /** Whether the webhook was processed successfully */
    success: boolean;

    /** Whether this was a duplicate (already processed) */
    duplicate: boolean;

    /** Event ID that was processed */
    eventId: string;

    /** Event type */
    eventType: string;

    /** ID of the affected resource (topup_xxx or wd_xxx) */
    resourceId?: string;

    /** New status after processing */
    newStatus?: string;

    /** Error message if processing failed */
    error?: string;
}

/**
 * Sanitized webhook payload for storage (sensitive data removed).
 */
export interface SanitizedWebhookPayload {
    eventId: string;
    eventType: string;
    occurredAt: string;
    data: {
        id: string;
        code?: string;
        amount: number;
        currency: string;
        status: string;
        reasonCode?: string;
        reasonDescription?: string;
    };
}
