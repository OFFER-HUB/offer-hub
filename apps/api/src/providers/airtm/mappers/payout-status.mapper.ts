import { WithdrawalStatus } from '@offerhub/shared';
import type { AirtmPayoutStatus, AirtmWebhookEventType } from '../types';

/**
 * Maps Airtm Payout statuses to internal WithdrawalStatus.
 *
 * Mapping:
 * - CREATED → WITHDRAWAL_CREATED
 * - COMMITTED → WITHDRAWAL_COMMITTED
 * - PENDING → WITHDRAWAL_PENDING
 * - PENDING_USER_ACTION → WITHDRAWAL_PENDING_USER_ACTION
 * - COMPLETED → WITHDRAWAL_COMPLETED
 * - FAILED → WITHDRAWAL_FAILED
 * - CANCELED → WITHDRAWAL_CANCELED
 */
export function mapAirtmPayoutStatus(airtmStatus: AirtmPayoutStatus): WithdrawalStatus {
    const mapping: Record<AirtmPayoutStatus, WithdrawalStatus> = {
        CREATED: WithdrawalStatus.WITHDRAWAL_CREATED,
        COMMITTED: WithdrawalStatus.WITHDRAWAL_COMMITTED,
        PENDING: WithdrawalStatus.WITHDRAWAL_PENDING,
        PENDING_USER_ACTION: WithdrawalStatus.WITHDRAWAL_PENDING_USER_ACTION,
        COMPLETED: WithdrawalStatus.WITHDRAWAL_COMPLETED,
        FAILED: WithdrawalStatus.WITHDRAWAL_FAILED,
        CANCELED: WithdrawalStatus.WITHDRAWAL_CANCELED,
    };

    const status = mapping[airtmStatus];
    if (!status) {
        throw new Error(`Unknown Airtm payout status: ${airtmStatus}`);
    }

    return status;
}

/**
 * Maps Airtm webhook event types to WithdrawalStatus.
 * Used when processing webhook events.
 */
export function mapPayoutWebhookEventToStatus(eventType: AirtmWebhookEventType): WithdrawalStatus | null {
    const mapping: Partial<Record<AirtmWebhookEventType, WithdrawalStatus>> = {
        'payout.created': WithdrawalStatus.WITHDRAWAL_CREATED,
        'payout.committed': WithdrawalStatus.WITHDRAWAL_COMMITTED,
        'payout.pending': WithdrawalStatus.WITHDRAWAL_PENDING,
        'payout.pending_user_action': WithdrawalStatus.WITHDRAWAL_PENDING_USER_ACTION,
        'payout.completed': WithdrawalStatus.WITHDRAWAL_COMPLETED,
        'payout.failed': WithdrawalStatus.WITHDRAWAL_FAILED,
        'payout.canceled': WithdrawalStatus.WITHDRAWAL_CANCELED,
    };

    return mapping[eventType] ?? null;
}

/**
 * Checks if a webhook event type is related to payouts.
 */
export function isPayoutEvent(eventType: AirtmWebhookEventType): boolean {
    return eventType.startsWith('payout.');
}

/**
 * Gets the terminal WithdrawalStatus values.
 */
export function getTerminalPayoutStatuses(): WithdrawalStatus[] {
    return [
        WithdrawalStatus.WITHDRAWAL_COMPLETED,
        WithdrawalStatus.WITHDRAWAL_FAILED,
        WithdrawalStatus.WITHDRAWAL_CANCELED,
    ];
}

/**
 * Checks if a WithdrawalStatus is terminal (no further transitions).
 */
export function isTerminalPayoutStatus(status: WithdrawalStatus): boolean {
    return getTerminalPayoutStatuses().includes(status);
}

/**
 * Checks if a payout can be committed (only CREATED status).
 */
export function canCommitPayout(status: WithdrawalStatus): boolean {
    return status === WithdrawalStatus.WITHDRAWAL_CREATED;
}

/**
 * Checks if a payout can be canceled (only CREATED status).
 */
export function canCancelPayout(status: WithdrawalStatus): boolean {
    return status === WithdrawalStatus.WITHDRAWAL_CREATED;
}
