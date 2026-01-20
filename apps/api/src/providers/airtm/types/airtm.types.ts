/**
 * Airtm Provider Types
 * @see https://docs.airtm.io/enterprise/api/v2
 */

/** Airtm environment */
export type AirtmEnvironment = 'sandbox' | 'production';

/** Airtm Payin (Top-up) statuses as returned by the API */
export type AirtmPayinStatus =
    | 'CREATED'
    | 'AWAITING_USER_CONFIRMATION'
    | 'PROCESSING'
    | 'SUCCEEDED'
    | 'FAILED'
    | 'CANCELED';

/** Airtm Payout (Withdrawal) statuses as returned by the API */
export type AirtmPayoutStatus =
    | 'CREATED'
    | 'COMMITTED'
    | 'PENDING'
    | 'PENDING_USER_ACTION'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELED';

/** Webhook event types from Airtm */
export type AirtmWebhookEventType =
    | 'payin.created'
    | 'payin.awaiting_user_confirmation'
    | 'payin.processing'
    | 'payin.succeeded'
    | 'payin.failed'
    | 'payin.canceled'
    | 'payout.created'
    | 'payout.committed'
    | 'payout.pending'
    | 'payout.pending_user_action'
    | 'payout.completed'
    | 'payout.failed'
    | 'payout.canceled';

/** Airtm user status */
export type AirtmUserStatus = 'active' | 'inactive' | 'suspended';

/** Result of user verification check */
export interface AirtmVerificationResult {
    eligible: boolean;
    failureReason?: AirtmVerificationFailureReason;
    airtmUserId?: string;
    email?: string;
}

/** Possible reasons for user verification failure */
export type AirtmVerificationFailureReason =
    | 'USER_NOT_FOUND'
    | 'USER_INACTIVE'
    | 'USER_NOT_VERIFIED';

/** Airtm user response from API */
export interface AirtmUserResponse {
    id: string;
    email: string;
    status: AirtmUserStatus;
    isVerified: boolean;
    country?: string;
    createdAt: string;
}

/** Airtm Payin response from API */
export interface AirtmPayinResponse {
    id: string;
    code: string;
    amount: number;
    currency: string;
    status: AirtmPayinStatus;
    confirmationUri: string;
    destinationUserId: string;
    description?: string;
    reasonCode?: string;
    reasonDescription?: string;
    createdAt: string;
    updatedAt: string;
    expiresAt?: string;
}

/** Airtm Payout response from API */
export interface AirtmPayoutResponse {
    id: string;
    amount: number;
    currency: string;
    fee?: number;
    enterpriseFee?: number;
    status: AirtmPayoutStatus;
    sourceUserId: string;
    destinationType: string;
    destinationRef: string;
    description?: string;
    reasonCode?: string;
    reasonDescription?: string;
    createdAt: string;
    updatedAt: string;
}

/** Svix webhook headers */
export interface SvixWebhookHeaders {
    'svix-id': string;
    'svix-timestamp': string;
    'svix-signature': string;
}

/** Airtm webhook payload structure */
export interface AirtmWebhookPayload {
    eventId: string;
    eventType: AirtmWebhookEventType;
    occurredAt: string;
    data: AirtmWebhookEventData;
}

/** Data contained in webhook event */
export interface AirtmWebhookEventData {
    id: string;
    code?: string;
    amount: number;
    currency: string;
    status: string;
    userId?: string;
    reasonCode?: string;
    reasonDescription?: string;
    [key: string]: unknown;
}

/** HTTP retry options for Airtm client */
export interface AirtmRetryOptions {
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
    retryStatusCodes: number[];
}

/** Default retry configuration */
export const DEFAULT_RETRY_OPTIONS: AirtmRetryOptions = {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 10000,
    retryStatusCodes: [500, 502, 503, 504],
};

/** HTTP timeout in milliseconds */
export const HTTP_TIMEOUT_MS = 30000;

/** Airtm balance response from API */
export interface AirtmBalanceResponse {
    userId: string;
    available: number;
    pending: number;
    currency: string;
    updatedAt: string;
}
