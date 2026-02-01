/**
 * Balance Event Payloads
 * 
 * Type-safe payload definitions for all balance related events
 */

export interface BalanceCreditedPayload {
    userId: string;
    amount: string;
    currency: string;
    source: 'topup' | 'refund' | 'release' | 'withdrawal_cancel' | 'other';
    sourceId?: string; // topupId, orderId, withdrawalId, etc.
    previousAvailableBalance: string;
    newAvailableBalance: string;
}

export interface BalanceDebitedPayload {
    userId: string;
    amount: string;
    currency: string;
    destination: 'withdrawal' | 'order' | 'fee' | 'other';
    destinationId?: string; // withdrawalId, orderId, etc.
    previousAvailableBalance: string;
    newAvailableBalance: string;
}

export interface BalanceReservedPayload {
    userId: string;
    amount: string;
    currency: string;
    orderId: string;
    previousReservedBalance: string;
    newReservedBalance: string;
    previousAvailableBalance: string;
    newAvailableBalance: string;
}

export interface BalanceReleasedPayload {
    userId: string;
    amount: string;
    currency: string;
    orderId: string;
    reason: 'cancel' | 'dispute' | 'escrow_funded' | 'other';
    previousReservedBalance: string;
    newReservedBalance: string;
    previousAvailableBalance: string;
    newAvailableBalance: string;
}
