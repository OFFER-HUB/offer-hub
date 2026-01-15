/** @see docs/architecture/state-machines.md */
export enum WithdrawalStatus {
    WITHDRAWAL_CREATED = 'WITHDRAWAL_CREATED',
    WITHDRAWAL_COMMITTED = 'WITHDRAWAL_COMMITTED',
    WITHDRAWAL_PENDING = 'WITHDRAWAL_PENDING',
    WITHDRAWAL_PENDING_USER_ACTION = 'WITHDRAWAL_PENDING_USER_ACTION',
    WITHDRAWAL_COMPLETED = 'WITHDRAWAL_COMPLETED',
    WITHDRAWAL_FAILED = 'WITHDRAWAL_FAILED',
    WITHDRAWAL_CANCELED = 'WITHDRAWAL_CANCELED',
}

export const WITHDRAWAL_TRANSITIONS: Record<WithdrawalStatus, WithdrawalStatus[]> = {
    [WithdrawalStatus.WITHDRAWAL_CREATED]: [
        WithdrawalStatus.WITHDRAWAL_COMMITTED,
        WithdrawalStatus.WITHDRAWAL_CANCELED,
    ],
    [WithdrawalStatus.WITHDRAWAL_COMMITTED]: [WithdrawalStatus.WITHDRAWAL_PENDING],
    [WithdrawalStatus.WITHDRAWAL_PENDING]: [
        WithdrawalStatus.WITHDRAWAL_PENDING_USER_ACTION,
        WithdrawalStatus.WITHDRAWAL_COMPLETED,
        WithdrawalStatus.WITHDRAWAL_FAILED,
    ],
    [WithdrawalStatus.WITHDRAWAL_PENDING_USER_ACTION]: [
        WithdrawalStatus.WITHDRAWAL_PENDING,
        WithdrawalStatus.WITHDRAWAL_FAILED,
    ],
    [WithdrawalStatus.WITHDRAWAL_COMPLETED]: [],
    [WithdrawalStatus.WITHDRAWAL_FAILED]: [],
    [WithdrawalStatus.WITHDRAWAL_CANCELED]: [],
};
