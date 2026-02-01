/**
 * Withdrawal Event Payloads
 * 
 * Type-safe payload definitions for all withdrawal related events
 */

export interface WithdrawalCreatedPayload {
    withdrawalId: string;
    userId: string;
    amount: string;
    currency: string;
    destinationType: string; // 'bank' | 'crypto'
    destinationRef: string;
}

export interface WithdrawalCommittedPayload {
    withdrawalId: string;
    userId: string;
    amount: string;
    currency: string;
    committedBalance: string;
    availableBalance: string;
}

export interface WithdrawalPendingPayload {
    withdrawalId: string;
    userId: string;
    airtmPayoutId: string;
    amount: string;
}

export interface WithdrawalPendingUserActionPayload {
    withdrawalId: string;
    userId: string;
    actionRequired: string;
    actionUrl?: string;
}

export interface WithdrawalCompletedPayload {
    withdrawalId: string;
    userId: string;
    amount: string;
    currency: string;
    completedAt: string;
    airtmPayoutId?: string;
}

export interface WithdrawalFailedPayload {
    withdrawalId: string;
    userId: string;
    amount: string;
    reason: string;
    errorCode?: string;
    airtmPayoutId?: string;
}

export interface WithdrawalCanceledPayload {
    withdrawalId: string;
    userId: string;
    amount: string;
    canceledBy: 'user' | 'system' | 'admin';
    reason?: string;
    refundedToBalance: boolean;
    newAvailableBalance?: string;
}
