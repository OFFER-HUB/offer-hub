/**
 * DTOs for Airtm Payin (Top-up) operations.
 */

/**
 * Request to create a new payin (top-up).
 */
export interface CreatePayinRequest {
    /** Amount in decimal format (e.g., "100.00") */
    amount: string;

    /** Currency code (ISO 4217) */
    currency: string;

    /** Airtm user ID of the recipient */
    destinationUserId: string;

    /** Optional description for the transaction */
    description?: string;

    /** Optional callback URI for redirects */
    callbackUri?: string;
}

/**
 * Internal representation used by AirtmPayinClient.
 */
export interface AirtmCreatePayinPayload {
    amount: number;
    currency: string;
    code: string;
    destinationUserId: string;
    description?: string;
    confirmationUri?: string;
    cancellationUri?: string;
}

/**
 * Response from creating a payin.
 */
export interface CreatePayinResponse {
    /** Internal top-up ID (topup_xxx) */
    topupId: string;

    /** Airtm payin ID */
    airtmPayinId: string;

    /** Amount in decimal format */
    amount: string;

    /** Currency code */
    currency: string;

    /** URI for user to confirm payment */
    confirmationUri: string;

    /** Current status */
    status: string;

    /** Expiration timestamp (ISO 8601) */
    expiresAt?: string;
}

/**
 * Parameters for getting a payin.
 */
export interface GetPayinParams {
    /** Get by Airtm payin ID */
    payinId?: string;

    /** Get by internal code (topup_xxx) */
    code?: string;
}
