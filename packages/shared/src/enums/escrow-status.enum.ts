/** @see docs/architecture/state-machines.md */
export enum EscrowStatus {
    CREATING = 'CREATING',
    CREATED = 'CREATED',
    FUNDING = 'FUNDING',
    FUNDED = 'FUNDED',
    RELEASING = 'RELEASING',
    RELEASED = 'RELEASED',
    REFUNDING = 'REFUNDING',
    REFUNDED = 'REFUNDED',
    DISPUTED = 'DISPUTED',
}

export const ESCROW_TRANSITIONS: Record<EscrowStatus, EscrowStatus[]> = {
    [EscrowStatus.CREATING]: [EscrowStatus.CREATED],
    [EscrowStatus.CREATED]: [EscrowStatus.FUNDING],
    [EscrowStatus.FUNDING]: [EscrowStatus.FUNDED],
    [EscrowStatus.FUNDED]: [
        EscrowStatus.RELEASING,
        EscrowStatus.REFUNDING,
        EscrowStatus.DISPUTED,
    ],
    [EscrowStatus.RELEASING]: [EscrowStatus.RELEASED],
    [EscrowStatus.REFUNDING]: [EscrowStatus.REFUNDED],
    [EscrowStatus.DISPUTED]: [EscrowStatus.RELEASED, EscrowStatus.REFUNDED],
    [EscrowStatus.RELEASED]: [],
    [EscrowStatus.REFUNDED]: [],
};
