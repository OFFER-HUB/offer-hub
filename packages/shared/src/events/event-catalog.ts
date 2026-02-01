/**
 * Event Catalog (Shared)
 * 
 * Shared event catalog for use in SDK and other packages.
 * This is a subset of the main event catalog, containing only
 * the events that are relevant for external consumers.
 */
export const EVENT_CATALOG = {
    // TopUp Events
    TOPUP_CREATED: 'topup.created',
    TOPUP_CONFIRMATION_REQUIRED: 'topup.confirmation_required',
    TOPUP_PROCESSING: 'topup.processing',
    TOPUP_SUCCEEDED: 'topup.succeeded',
    TOPUP_FAILED: 'topup.failed',
    TOPUP_CANCELED: 'topup.canceled',

    // Order Events
    ORDER_CREATED: 'order.created',
    ORDER_FUNDS_RESERVED: 'order.funds_reserved',
    ORDER_ESCROW_CREATING: 'order.escrow_creating',
    ORDER_ESCROW_FUNDING: 'order.escrow_funding',
    ORDER_ESCROW_FUNDED: 'order.escrow_funded',
    ORDER_IN_PROGRESS: 'order.in_progress',
    ORDER_RELEASE_REQUESTED: 'order.release_requested',
    ORDER_RELEASED: 'order.released',
    ORDER_REFUND_REQUESTED: 'order.refund_requested',
    ORDER_REFUNDED: 'order.refunded',
    ORDER_DISPUTED: 'order.disputed',
    ORDER_CLOSED: 'order.closed',
    ORDER_CANCELED: 'order.canceled',

    // Withdrawal Events
    WITHDRAWAL_CREATED: 'withdrawal.created',
    WITHDRAWAL_COMMITTED: 'withdrawal.committed',
    WITHDRAWAL_PENDING: 'withdrawal.pending',
    WITHDRAWAL_PENDING_USER_ACTION: 'withdrawal.pending_user_action',
    WITHDRAWAL_COMPLETED: 'withdrawal.completed',
    WITHDRAWAL_FAILED: 'withdrawal.failed',
    WITHDRAWAL_CANCELED: 'withdrawal.canceled',

    // Dispute Events
    DISPUTE_OPENED: 'dispute.opened',
    DISPUTE_UNDER_REVIEW: 'dispute.under_review',
    DISPUTE_RESOLVED: 'dispute.resolved',

    // Balance Events
    BALANCE_CREDITED: 'balance.credited',
    BALANCE_DEBITED: 'balance.debited',
    BALANCE_RESERVED: 'balance.reserved',
    BALANCE_RELEASED: 'balance.released',

    // User Events
    USER_CREATED: 'user.created',
    USER_AIRTM_LINKED: 'user.airtm_linked',
    USER_STELLAR_LINKED: 'user.stellar_linked',

    // Escrow Events
    ESCROW_CREATED: 'escrow.created',
    ESCROW_FUNDING_STARTED: 'escrow.funding_started',
    ESCROW_FUNDED: 'escrow.funded',
    ESCROW_MILESTONE_COMPLETED: 'escrow.milestone_completed',
    ESCROW_RELEASED: 'escrow.released',
    ESCROW_REFUNDED: 'escrow.refunded',
} as const;

export type EventType = typeof EVENT_CATALOG[keyof typeof EVENT_CATALOG];
