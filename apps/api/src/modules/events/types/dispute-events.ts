/**
 * Dispute Event Payloads
 * 
 * Type-safe payload definitions for all dispute related events
 */

export interface DisputeOpenedPayload {
    disputeId: string;
    orderId: string;
    openedBy: 'BUYER' | 'SELLER';
    reason: string;
    evidence?: string[]; // URLs to evidence
    openedAt: string;
}

export interface DisputeUnderReviewPayload {
    disputeId: string;
    orderId: string;
    reviewedBy?: string; // admin/support userId
    reviewStartedAt: string;
}

export interface DisputeResolvedPayload {
    disputeId: string;
    orderId: string;
    decision: 'FULL_RELEASE' | 'FULL_REFUND' | 'SPLIT';
    decisionNote?: string;
    resolvedBy: string; // admin/support userId
    resolvedAt: string;
    buyerAmount?: string;
    sellerAmount?: string;
}
