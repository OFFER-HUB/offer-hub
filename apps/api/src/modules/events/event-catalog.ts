/**
 * Event Catalog
 * 
 * Centralized catalog of all domain events in the OFFER-HUB Orchestrator.
 * These events are the foundation for:
 * - Real-time SSE streaming (Issue 6.2)
 * - Audit trail persistence (Issue 6.3)
 * - Future integrations (webhooks, analytics, etc.)
 * 
 * Event naming convention: {resource}.{action}
 * Use snake_case for compound actions (e.g., funds_reserved)
 */
export const EVENT_CATALOG = {
    // ==================== TopUp Events ====================
    /**
     * Emitted when a new top-up is created
     * Payload: { userId, amount, currency }
     */
    TOPUP_CREATED: 'topup.created',

    /**
     * Emitted when top-up requires user confirmation (e.g., redirect to Airtm)
     * Payload: { topupId, confirmationUri }
     */
    TOPUP_CONFIRMATION_REQUIRED: 'topup.confirmation_required',

    /**
     * Emitted when top-up is being processed by Airtm
     * Payload: { topupId, airtmPayinId }
     */
    TOPUP_PROCESSING: 'topup.processing',

    /**
     * Emitted when top-up succeeds and balance is credited
     * Payload: { topupId, userId, amount, newBalance }
     */
    TOPUP_SUCCEEDED: 'topup.succeeded',

    /**
     * Emitted when top-up fails
     * Payload: { topupId, reason, errorCode }
     */
    TOPUP_FAILED: 'topup.failed',

    /**
     * Emitted when top-up is canceled
     * Payload: { topupId, canceledBy }
     */
    TOPUP_CANCELED: 'topup.canceled',

    // ==================== Order Events ====================
    /**
     * Emitted when a new order is created
     * Payload: { orderId, buyerId, sellerId, amount, title }
     */
    ORDER_CREATED: 'order.created',

    /**
     * Emitted when funds are reserved from buyer's balance
     * Payload: { orderId, amount, buyerId, reservedBalance }
     */
    ORDER_FUNDS_RESERVED: 'order.funds_reserved',

    /**
     * Emitted when escrow creation is initiated
     * Payload: { orderId, escrowId }
     */
    ORDER_ESCROW_CREATING: 'order.escrow_creating',

    /**
     * Emitted when escrow is being funded on Stellar
     * Payload: { orderId, escrowId, trustlessContractId }
     */
    ORDER_ESCROW_FUNDING: 'order.escrow_funding',

    /**
     * Emitted when escrow is successfully funded
     * Payload: { orderId, escrowId, fundedAt }
     */
    ORDER_ESCROW_FUNDED: 'order.escrow_funded',

    /**
     * Emitted when order moves to in-progress state
     * Payload: { orderId }
     */
    ORDER_IN_PROGRESS: 'order.in_progress',

    /**
     * Emitted when release is requested
     * Payload: { orderId, requestedBy }
     */
    ORDER_RELEASE_REQUESTED: 'order.release_requested',

    /**
     * Emitted when funds are released to seller
     * Payload: { orderId, sellerId, amount, releasedAt }
     */
    ORDER_RELEASED: 'order.released',

    /**
     * Emitted when refund is requested
     * Payload: { orderId, requestedBy }
     */
    ORDER_REFUND_REQUESTED: 'order.refund_requested',

    /**
     * Emitted when funds are refunded to buyer
     * Payload: { orderId, buyerId, amount, refundedAt }
     */
    ORDER_REFUNDED: 'order.refunded',

    /**
     * Emitted when order is disputed
     * Payload: { orderId, disputeId, openedBy, reason }
     */
    ORDER_DISPUTED: 'order.disputed',

    /**
     * Emitted when order is closed
     * Payload: { orderId, finalStatus, closedAt }
     */
    ORDER_CLOSED: 'order.closed',

    /**
     * Emitted when order is canceled
     * Payload: { orderId, canceledBy, reason }
     */
    ORDER_CANCELED: 'order.canceled',

    // ==================== Withdrawal Events ====================
    /**
     * Emitted when a new withdrawal is created
     * Payload: { withdrawalId, userId, amount, destinationType }
     */
    WITHDRAWAL_CREATED: 'withdrawal.created',

    /**
     * Emitted when withdrawal is committed (balance debited)
     * Payload: { withdrawalId, userId, amount, committedBalance }
     */
    WITHDRAWAL_COMMITTED: 'withdrawal.committed',

    /**
     * Emitted when withdrawal is pending with Airtm
     * Payload: { withdrawalId, airtmPayoutId }
     */
    WITHDRAWAL_PENDING: 'withdrawal.pending',

    /**
     * Emitted when withdrawal requires user action
     * Payload: { withdrawalId, actionRequired }
     */
    WITHDRAWAL_PENDING_USER_ACTION: 'withdrawal.pending_user_action',

    /**
     * Emitted when withdrawal is completed
     * Payload: { withdrawalId, userId, amount, completedAt }
     */
    WITHDRAWAL_COMPLETED: 'withdrawal.completed',

    /**
     * Emitted when withdrawal fails
     * Payload: { withdrawalId, reason, errorCode }
     */
    WITHDRAWAL_FAILED: 'withdrawal.failed',

    /**
     * Emitted when withdrawal is canceled
     * Payload: { withdrawalId, canceledBy, refundedToBalance }
     */
    WITHDRAWAL_CANCELED: 'withdrawal.canceled',

    // ==================== Dispute Events ====================
    /**
     * Emitted when a dispute is opened
     * Payload: { disputeId, orderId, openedBy, reason }
     */
    DISPUTE_OPENED: 'dispute.opened',

    /**
     * Emitted when dispute is under review
     * Payload: { disputeId, reviewedBy }
     */
    DISPUTE_UNDER_REVIEW: 'dispute.under_review',

    /**
     * Emitted when dispute is resolved
     * Payload: { disputeId, decision, resolvedBy, resolvedAt }
     */
    DISPUTE_RESOLVED: 'dispute.resolved',

    // ==================== Balance Events ====================
    /**
     * Emitted when balance is credited (top-up, refund, release)
     * Payload: { userId, amount, source, newBalance }
     */
    BALANCE_CREDITED: 'balance.credited',

    /**
     * Emitted when balance is debited (withdrawal, order payment)
     * Payload: { userId, amount, destination, newBalance }
     */
    BALANCE_DEBITED: 'balance.debited',

    /**
     * Emitted when balance is reserved (order creation)
     * Payload: { userId, amount, orderId, reservedBalance }
     */
    BALANCE_RESERVED: 'balance.reserved',

    /**
     * Emitted when reserved balance is released (order cancel, dispute)
     * Payload: { userId, amount, orderId, availableBalance }
     */
    BALANCE_RELEASED: 'balance.released',

    // ==================== User Events ====================
    /**
     * Emitted when a new user is created
     * Payload: { userId, externalUserId, type }
     */
    USER_CREATED: 'user.created',

    /**
     * Emitted when user links their Airtm account
     * Payload: { userId, airtmUserId, linkedAt }
     */
    USER_AIRTM_LINKED: 'user.airtm_linked',

    /**
     * Emitted when user's Stellar address is set
     * Payload: { userId, stellarAddress }
     */
    USER_STELLAR_LINKED: 'user.stellar_linked',

    // ==================== Escrow Events ====================
    /**
     * Emitted when escrow is created
     * Payload: { escrowId, orderId, amount }
     */
    ESCROW_CREATED: 'escrow.created',

    /**
     * Emitted when escrow funding starts
     * Payload: { escrowId, trustlessContractId }
     */
    ESCROW_FUNDING_STARTED: 'escrow.funding_started',

    /**
     * Emitted when escrow is funded
     * Payload: { escrowId, fundedAt, amount }
     */
    ESCROW_FUNDED: 'escrow.funded',

    /**
     * Emitted when a milestone is completed
     * Payload: { escrowId, milestoneRef, completedAt }
     */
    ESCROW_MILESTONE_COMPLETED: 'escrow.milestone_completed',

    /**
     * Emitted when escrow is released
     * Payload: { escrowId, releasedAt, amount }
     */
    ESCROW_RELEASED: 'escrow.released',

    /**
     * Emitted when escrow is refunded
     * Payload: { escrowId, refundedAt, amount }
     */
    ESCROW_REFUNDED: 'escrow.refunded',
} as const;

/**
 * Type-safe event type
 */
export type EventType = typeof EVENT_CATALOG[keyof typeof EVENT_CATALOG];

/**
 * Helper to check if a string is a valid event type
 */
export function isValidEventType(eventType: string): eventType is EventType {
    return Object.values(EVENT_CATALOG).includes(eventType as EventType);
}
