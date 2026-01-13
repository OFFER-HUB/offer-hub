/**
 * TopUp Status Enum
 * @see docs/architecture/state-machines.md
 */
export enum TopUpStatus {
    TOPUP_CREATED = 'TOPUP_CREATED',
    TOPUP_AWAITING_USER_CONFIRMATION = 'TOPUP_AWAITING_USER_CONFIRMATION',
    TOPUP_PROCESSING = 'TOPUP_PROCESSING',
    TOPUP_SUCCEEDED = 'TOPUP_SUCCEEDED',
    TOPUP_FAILED = 'TOPUP_FAILED',
    TOPUP_CANCELED = 'TOPUP_CANCELED',
}

/**
 * Terminal states for TopUp - no further transitions allowed
 */
export const TOPUP_TERMINAL_STATES: TopUpStatus[] = [
    TopUpStatus.TOPUP_SUCCEEDED,
    TopUpStatus.TOPUP_FAILED,
    TopUpStatus.TOPUP_CANCELED,
];
