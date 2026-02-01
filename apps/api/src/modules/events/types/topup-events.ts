/**
 * TopUp Event Payloads
 * 
 * Type-safe payload definitions for all top-up related events
 */

export interface TopUpCreatedPayload {
    userId: string;
    amount: string;
    currency: string;
}

export interface TopUpConfirmationRequiredPayload {
    topupId: string;
    confirmationUri: string;
}

export interface TopUpProcessingPayload {
    topupId: string;
    airtmPayinId: string;
}

export interface TopUpSucceededPayload {
    topupId: string;
    userId: string;
    amount: string;
    currency: string;
    newAvailableBalance: string;
    airtmPayinId?: string;
}

export interface TopUpFailedPayload {
    topupId: string;
    userId: string;
    amount: string;
    reason: string;
    errorCode?: string;
    airtmPayinId?: string;
}

export interface TopUpCanceledPayload {
    topupId: string;
    userId: string;
    amount: string;
    canceledBy: 'user' | 'system' | 'admin';
    reason?: string;
}
