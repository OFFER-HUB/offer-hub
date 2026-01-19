import { TopUpStatus } from '@offerhub/shared';
import type { AirtmPayinStatus, AirtmWebhookEventType } from '../types';

/**
 * Maps Airtm Payin statuses to internal TopUpStatus.
 *
 * Mapping:
 * - CREATED → TOPUP_CREATED
 * - AWAITING_USER_CONFIRMATION → TOPUP_AWAITING_USER_CONFIRMATION
 * - PROCESSING → TOPUP_PROCESSING
 * - SUCCEEDED → TOPUP_SUCCEEDED
 * - FAILED → TOPUP_FAILED
 * - CANCELED → TOPUP_CANCELED
 */
export function mapAirtmPayinStatus(airtmStatus: AirtmPayinStatus): TopUpStatus {
    const mapping: Record<AirtmPayinStatus, TopUpStatus> = {
        CREATED: TopUpStatus.TOPUP_CREATED,
        AWAITING_USER_CONFIRMATION: TopUpStatus.TOPUP_AWAITING_USER_CONFIRMATION,
        PROCESSING: TopUpStatus.TOPUP_PROCESSING,
        SUCCEEDED: TopUpStatus.TOPUP_SUCCEEDED,
        FAILED: TopUpStatus.TOPUP_FAILED,
        CANCELED: TopUpStatus.TOPUP_CANCELED,
    };

    const status = mapping[airtmStatus];
    if (!status) {
        throw new Error(`Unknown Airtm payin status: ${airtmStatus}`);
    }

    return status;
}

/**
 * Maps Airtm webhook event types to TopUpStatus.
 * Used when processing webhook events.
 */
export function mapPayinWebhookEventToStatus(eventType: AirtmWebhookEventType): TopUpStatus | null {
    const mapping: Partial<Record<AirtmWebhookEventType, TopUpStatus>> = {
        'payin.created': TopUpStatus.TOPUP_CREATED,
        'payin.awaiting_user_confirmation': TopUpStatus.TOPUP_AWAITING_USER_CONFIRMATION,
        'payin.processing': TopUpStatus.TOPUP_PROCESSING,
        'payin.succeeded': TopUpStatus.TOPUP_SUCCEEDED,
        'payin.failed': TopUpStatus.TOPUP_FAILED,
        'payin.canceled': TopUpStatus.TOPUP_CANCELED,
    };

    return mapping[eventType] ?? null;
}

/**
 * Checks if a webhook event type is related to payins.
 */
export function isPayinEvent(eventType: AirtmWebhookEventType): boolean {
    return eventType.startsWith('payin.');
}

/**
 * Gets the terminal TopUpStatus values.
 */
export function getTerminalPayinStatuses(): TopUpStatus[] {
    return [
        TopUpStatus.TOPUP_SUCCEEDED,
        TopUpStatus.TOPUP_FAILED,
        TopUpStatus.TOPUP_CANCELED,
    ];
}

/**
 * Checks if a TopUpStatus is terminal (no further transitions).
 */
export function isTerminalPayinStatus(status: TopUpStatus): boolean {
    return getTerminalPayinStatuses().includes(status);
}
