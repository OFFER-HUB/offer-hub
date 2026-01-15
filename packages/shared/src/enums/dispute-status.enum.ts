/** @see docs/architecture/state-machines.md */
export enum DisputeStatus {
    OPEN = 'OPEN',
    UNDER_REVIEW = 'UNDER_REVIEW',
    RESOLVED = 'RESOLVED',
}

export enum ResolutionDecision {
    FULL_RELEASE = 'FULL_RELEASE',
    FULL_REFUND = 'FULL_REFUND',
    SPLIT = 'SPLIT',
}

export enum DisputeReason {
    NOT_DELIVERED = 'NOT_DELIVERED',
    QUALITY_ISSUE = 'QUALITY_ISSUE',
    OTHER = 'OTHER',
}

export enum DisputeOpenedBy {
    BUYER = 'BUYER',
    SELLER = 'SELLER',
}

export const DISPUTE_TRANSITIONS: Record<DisputeStatus, DisputeStatus[]> = {
    [DisputeStatus.OPEN]: [DisputeStatus.UNDER_REVIEW],
    [DisputeStatus.UNDER_REVIEW]: [DisputeStatus.RESOLVED],
    [DisputeStatus.RESOLVED]: [],
};
