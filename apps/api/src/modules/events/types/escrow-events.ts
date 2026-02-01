/**
 * Escrow Event Payloads
 * 
 * Type-safe payload definitions for all escrow related events
 */

export interface EscrowCreatedPayload {
    escrowId: string;
    orderId: string;
    amount: string;
    currency: string;
}

export interface EscrowFundingStartedPayload {
    escrowId: string;
    orderId: string;
    trustlessContractId: string;
    amount: string;
}

export interface EscrowFundedPayload {
    escrowId: string;
    orderId: string;
    trustlessContractId: string;
    amount: string;
    fundedAt: string;
}

export interface EscrowMilestoneCompletedPayload {
    escrowId: string;
    orderId: string;
    milestoneRef: string;
    milestoneTitle: string;
    amount: string;
    completedAt: string;
}

export interface EscrowReleasedPayload {
    escrowId: string;
    orderId: string;
    sellerId: string;
    amount: string;
    releasedAt: string;
}

export interface EscrowRefundedPayload {
    escrowId: string;
    orderId: string;
    buyerId: string;
    amount: string;
    refundedAt: string;
}
