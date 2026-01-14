/**
 * Dispute Status Enum
 * @see docs/architecture/state-machines.md
 */
export enum DisputeStatus {
    OPEN = 'OPEN',
    UNDER_REVIEW = 'UNDER_REVIEW',
    RESOLVED = 'RESOLVED',
}

/**
 * Resolution Decision Enum
 */
export enum ResolutionDecision {
    FULL_RELEASE = 'FULL_RELEASE',
    FULL_REFUND = 'FULL_REFUND',
    SPLIT = 'SPLIT',
}

/**
 * Dispute Reason Enum
 */
export enum DisputeReason {
    NOT_DELIVERED = 'NOT_DELIVERED',
    QUALITY_ISSUE = 'QUALITY_ISSUE',
    OTHER = 'OTHER',
}

/**
 * Dispute Opened By Enum
 */
export enum DisputeOpenedBy {
    BUYER = 'BUYER',
    SELLER = 'SELLER',
}
