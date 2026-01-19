/**
 * DTOs for Airtm Payout (Withdrawal) operations.
 */

/**
 * Request to create a new payout (withdrawal).
 */
export interface CreatePayoutRequest {
    /** Amount in decimal format (e.g., "100.00") */
    amount: string;

    /** Currency code (ISO 4217) */
    currency: string;

    /** Airtm user ID of the source (who is withdrawing) */
    sourceUserId: string;

    /** Type of destination: 'bank', 'crypto', 'airtm_balance' */
    destinationType: PayoutDestinationType;

    /** Destination reference (bank account, crypto address, etc.) */
    destinationRef: string;

    /** If true, creates and commits in one step (trusted flow) */
    commit?: boolean;

    /** Optional description */
    description?: string;
}

/** Supported payout destination types */
export type PayoutDestinationType = 'bank' | 'crypto' | 'airtm_balance';

/**
 * Internal payload sent to Airtm API.
 */
export interface AirtmCreatePayoutPayload {
    amount: number;
    currency: string;
    sourceUserId: string;
    destinationType: string;
    destinationRef: string;
    commit?: boolean;
    description?: string;
    enterpriseFee?: number;
}

/**
 * Response from creating a payout.
 */
export interface CreatePayoutResponse {
    /** Internal withdrawal ID (wd_xxx) */
    withdrawalId: string;

    /** Airtm payout ID */
    airtmPayoutId: string;

    /** Amount in decimal format */
    amount: string;

    /** Fee charged (if any) */
    fee?: string;

    /** Currency code */
    currency: string;

    /** Current status */
    status: string;

    /** Whether payout was auto-committed */
    committed: boolean;
}

/**
 * Response from committing a payout.
 */
export interface CommitPayoutResponse {
    /** Airtm payout ID */
    airtmPayoutId: string;

    /** Updated status */
    status: string;

    /** Commit timestamp */
    committedAt: string;
}

/**
 * Parameters for getting a payout.
 */
export interface GetPayoutParams {
    /** Airtm payout ID */
    payoutId: string;
}
