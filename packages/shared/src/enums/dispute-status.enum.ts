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
