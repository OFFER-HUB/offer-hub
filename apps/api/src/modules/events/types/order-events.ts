/**
 * Order Event Payloads
 * 
 * Type-safe payload definitions for all order related events
 */

export interface OrderCreatedPayload {
    orderId: string;
    buyerId: string;
    sellerId: string;
    amount: string;
    currency: string;
    title: string;
    description?: string;
    clientOrderRef?: string;
}

export interface OrderFundsReservedPayload {
    orderId: string;
    buyerId: string;
    amount: string;
    currency: string;
    reservedBalance: string;
    availableBalance: string;
}

export interface OrderEscrowCreatingPayload {
    orderId: string;
    escrowId: string;
    amount: string;
}

export interface OrderEscrowFundingPayload {
    orderId: string;
    escrowId: string;
    trustlessContractId: string;
    amount: string;
}

export interface OrderEscrowFundedPayload {
    orderId: string;
    escrowId: string;
    trustlessContractId: string;
    amount: string;
    fundedAt: string;
}

export interface OrderInProgressPayload {
    orderId: string;
    escrowId: string;
}

export interface OrderReleaseRequestedPayload {
    orderId: string;
    requestedBy: string; // userId
    requestedAt: string;
}

export interface OrderReleasedPayload {
    orderId: string;
    sellerId: string;
    amount: string;
    currency: string;
    releasedAt: string;
    newSellerBalance: string;
}

export interface OrderRefundRequestedPayload {
    orderId: string;
    requestedBy: string; // userId
    requestedAt: string;
}

export interface OrderRefundedPayload {
    orderId: string;
    buyerId: string;
    amount: string;
    currency: string;
    refundedAt: string;
    newBuyerBalance: string;
}

export interface OrderDisputedPayload {
    orderId: string;
    disputeId: string;
    openedBy: 'BUYER' | 'SELLER';
    reason: string;
    openedAt: string;
}

export interface OrderClosedPayload {
    orderId: string;
    finalStatus: string;
    closedAt: string;
}

export interface OrderCanceledPayload {
    orderId: string;
    buyerId: string;
    canceledBy: string; // userId or 'system'
    reason?: string;
    canceledAt: string;
    fundsReleased: boolean;
}
