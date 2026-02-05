import { EscrowStatus } from '@offerhub/shared';

/**
 * Trustless Work API Response Types
 * @see docs/providers/trustless-work.md
 */

/**
 * Response from initialize escrow endpoint
 * Contains unsigned XDR transaction that must be signed by user's wallet
 */
export interface TrustlessInitializeEscrowResponse {
    status: 'SUCCESS' | 'FAILED';
    unsignedTransaction?: string; // XDR format - must be signed by user wallet
    contractId: string; // Stellar contract address (C...)
    escrow: TrustlessEscrowContract;
    message: string;
}

/**
 * Escrow contract from Trustless Work API
 */
export interface TrustlessEscrowContract {
    contractId: string; // Stellar contract address (C...)
    signer: string; // Address that signed the deployment transaction
    engagementId: string; // Reference to Orchestrator order
    title: string;
    description: string;
    roles: {
        approver: string; // Entity requiring the service (buyer)
        serviceProvider: string; // Entity providing the service (seller)
        platformAddress: string; // Platform owner
        releaseSigner: string; // Who releases funds
        disputeResolver: string; // Who resolves disputes
        receiver: string; // Final recipient of funds
    };
    amount: number; // In stroops
    platformFee: number; // Platform fee in stroops
    balance: number; // Current balance in stroops
    milestones: TrustlessMilestone[];
    flags?: {
        disputed?: boolean;
        released?: boolean;
        resolved?: boolean;
        approved?: boolean;
    };
    trustline: {
        address: string; // USDC asset issuer address
        symbol: string; // e.g., "USDC"
    };
}

/**
 * Trustless Work escrow status enum
 * Maps to internal EscrowStatus
 */
export enum TrustlessEscrowStatus {
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
 * Milestone in escrow contract
 */
export interface TrustlessMilestone {
    description: string;
    status?: string; // e.g., "pending", "completed"
    evidence?: string; // Evidence of work
    approved?: boolean; // Single-release only
    amount?: number; // Multi-release only - in stroops
    receiver?: string; // Multi-release only
}

/**
 * Response from send transaction endpoint
 */
export interface TrustlessSendTransactionResponse {
    status: 'SUCCESS' | 'FAILED';
    message: string;
}

/**
 * Funding result from Trustless Work
 */
export interface TrustlessFundingResult {
    success: boolean;
    contract_id: string;
    status: TrustlessEscrowStatus;
    transaction_hash: string; // Stellar tx hash
    funded_at: string; // ISO timestamp
}

/**
 * Release result from Trustless Work
 */
export interface TrustlessReleaseResult {
    success: boolean;
    contract_id: string;
    status: 'RELEASING' | 'RELEASED';
    released_amount: string; // In stroops
    remaining_amount: string; // In stroops
    transaction_hash: string; // Stellar tx hash for verification
}

/**
 * Refund result from Trustless Work
 */
export interface TrustlessRefundResult {
    success: boolean;
    contract_id: string;
    status: 'REFUNDING' | 'REFUNDED';
    refunded_amount: string; // In stroops
    remaining_amount: string; // In stroops
    transaction_hash: string; // Stellar tx hash for verification
}

/**
 * Stellar wallet balance
 */
export interface StellarWalletBalance {
    address: string; // Stellar public key (G...)
    usdc_balance: string; // In stroops
    native_balance: string; // XLM balance in stroops
}

/**
 * Projected user balance across Airtm and on-chain
 */
export interface ProjectedBalance {
    available: string; // Funds ready for use (2 decimals)
    reserved: string; // Funds in FUNDS_RESERVED state (2 decimals)
    on_chain: string; // Funds locked in escrow contracts (2 decimals)
    total: string; // Sum of all (2 decimals)
    currency: 'USDC';
    last_updated: string; // ISO timestamp
}

/**
 * Trustless Work webhook event
 */
export interface TrustlessWebhookEvent {
    type: TrustlessWebhookEventType;
    event_id: string; // Unique event identifier
    data: TrustlessWebhookData;
}

/**
 * Webhook event types
 */
export enum TrustlessWebhookEventType {
    ESCROW_CREATED = 'escrow.created',
    ESCROW_FUNDING_STARTED = 'escrow.funding_started',
    ESCROW_FUNDED = 'escrow.funded',
    ESCROW_MILESTONE_COMPLETED = 'escrow.milestone_completed',
    ESCROW_RELEASED = 'escrow.released',
    ESCROW_REFUNDED = 'escrow.refunded',
    ESCROW_DISPUTED = 'escrow.disputed',
}

/**
 * Webhook data payload
 */
export interface TrustlessWebhookData {
    contract_id: string;
    order_id: string;
    status: TrustlessEscrowStatus;
    amount: string; // In stroops
    currency: 'USDC';
    buyer_address: string;
    seller_address: string;
    transaction_hash?: string; // Present for on-chain events
    milestone_ref?: string; // Present for milestone events
    created_at: string;
    updated_at: string;
}

/**
 * Map Trustless Work status to internal EscrowStatus
 */
export function mapTrustlessStatus(status: TrustlessEscrowStatus): EscrowStatus {
    const mapping: Record<TrustlessEscrowStatus, EscrowStatus> = {
        [TrustlessEscrowStatus.CREATING]: EscrowStatus.CREATING,
        [TrustlessEscrowStatus.CREATED]: EscrowStatus.CREATED,
        [TrustlessEscrowStatus.FUNDING]: EscrowStatus.FUNDING,
        [TrustlessEscrowStatus.FUNDED]: EscrowStatus.FUNDED,
        [TrustlessEscrowStatus.RELEASING]: EscrowStatus.RELEASING,
        [TrustlessEscrowStatus.RELEASED]: EscrowStatus.RELEASED,
        [TrustlessEscrowStatus.REFUNDING]: EscrowStatus.REFUNDING,
        [TrustlessEscrowStatus.REFUNDED]: EscrowStatus.REFUNDED,
        [TrustlessEscrowStatus.DISPUTED]: EscrowStatus.DISPUTED,
    };
    return mapping[status];
}

/**
 * Derive escrow status from contract state (flags and balance)
 * Since TrustlessEscrowContract doesn't have a direct status field,
 * we derive it from flags and balance.
 */
export function deriveEscrowStatusFromContract(contract: TrustlessEscrowContract): EscrowStatus {
    const flags = contract.flags || {};

    // Check terminal states first
    if (flags.released) {
        return EscrowStatus.RELEASED;
    }

    if (flags.resolved) {
        // Resolved means dispute was settled - could be released or refunded
        // Check balance to determine outcome
        return contract.balance === 0 ? EscrowStatus.REFUNDED : EscrowStatus.RELEASED;
    }

    if (flags.disputed) {
        return EscrowStatus.DISPUTED;
    }

    // Check if funded based on balance
    if (contract.balance > 0) {
        return EscrowStatus.FUNDED;
    }

    // Contract exists but not funded
    return EscrowStatus.CREATED;
}
