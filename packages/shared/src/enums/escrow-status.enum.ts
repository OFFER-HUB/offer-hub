/**
 * Escrow Status Enum (internal mirror of Trustless Work states)
 * @see docs/architecture/state-machines.md
 */
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

/**
 * Terminal states for Escrow
 */
export const ESCROW_TERMINAL_STATES: EscrowStatus[] = [
    EscrowStatus.RELEASED,
    EscrowStatus.REFUNDED,
];
