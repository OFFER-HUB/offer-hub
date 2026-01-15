/** @see docs/architecture/state-machines.md */
export enum TopUpStatus {
    TOPUP_CREATED = 'TOPUP_CREATED',
    TOPUP_AWAITING_USER_CONFIRMATION = 'TOPUP_AWAITING_USER_CONFIRMATION',
    TOPUP_PROCESSING = 'TOPUP_PROCESSING',
    TOPUP_SUCCEEDED = 'TOPUP_SUCCEEDED',
    TOPUP_FAILED = 'TOPUP_FAILED',
    TOPUP_CANCELED = 'TOPUP_CANCELED',
}

export const TOPUP_TRANSITIONS: Record<TopUpStatus, TopUpStatus[]> = {
    [TopUpStatus.TOPUP_CREATED]: [TopUpStatus.TOPUP_AWAITING_USER_CONFIRMATION],
    [TopUpStatus.TOPUP_AWAITING_USER_CONFIRMATION]: [
        TopUpStatus.TOPUP_PROCESSING,
        TopUpStatus.TOPUP_CANCELED,
    ],
    [TopUpStatus.TOPUP_PROCESSING]: [
        TopUpStatus.TOPUP_SUCCEEDED,
        TopUpStatus.TOPUP_FAILED,
    ],
    [TopUpStatus.TOPUP_SUCCEEDED]: [],
    [TopUpStatus.TOPUP_FAILED]: [],
    [TopUpStatus.TOPUP_CANCELED]: [],
};
