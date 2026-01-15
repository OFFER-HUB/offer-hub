/** @see docs/architecture/state-machines.md */
export enum OrderStatus {
    ORDER_CREATED = 'ORDER_CREATED',
    FUNDS_RESERVED = 'FUNDS_RESERVED',
    ESCROW_CREATING = 'ESCROW_CREATING',
    ESCROW_FUNDING = 'ESCROW_FUNDING',
    ESCROW_FUNDED = 'ESCROW_FUNDED',
    IN_PROGRESS = 'IN_PROGRESS',
    RELEASE_REQUESTED = 'RELEASE_REQUESTED',
    RELEASED = 'RELEASED',
    REFUND_REQUESTED = 'REFUND_REQUESTED',
    REFUNDED = 'REFUNDED',
    DISPUTED = 'DISPUTED',
    CLOSED = 'CLOSED',
}

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.ORDER_CREATED]: [OrderStatus.FUNDS_RESERVED, OrderStatus.CLOSED],
    [OrderStatus.FUNDS_RESERVED]: [OrderStatus.ESCROW_CREATING, OrderStatus.CLOSED],
    [OrderStatus.ESCROW_CREATING]: [OrderStatus.ESCROW_FUNDING],
    [OrderStatus.ESCROW_FUNDING]: [OrderStatus.ESCROW_FUNDED],
    [OrderStatus.ESCROW_FUNDED]: [OrderStatus.IN_PROGRESS],
    [OrderStatus.IN_PROGRESS]: [
        OrderStatus.RELEASE_REQUESTED,
        OrderStatus.REFUND_REQUESTED,
        OrderStatus.DISPUTED,
    ],
    [OrderStatus.RELEASE_REQUESTED]: [OrderStatus.RELEASED],
    [OrderStatus.REFUND_REQUESTED]: [OrderStatus.REFUNDED],
    [OrderStatus.DISPUTED]: [OrderStatus.RELEASED, OrderStatus.REFUNDED],
    [OrderStatus.RELEASED]: [OrderStatus.CLOSED],
    [OrderStatus.REFUNDED]: [OrderStatus.CLOSED],
    [OrderStatus.CLOSED]: [],
};

export const CANCELLABLE_ORDER_STATES: OrderStatus[] = [
    OrderStatus.ORDER_CREATED,
    OrderStatus.FUNDS_RESERVED,
];
