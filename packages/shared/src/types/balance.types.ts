/**
 * Balance types
 * @see docs/data/models.md
 */

/**
 * User balance model
 * - available: Balance available to use
 * - reserved: Balance reserved in active orders
 */
export interface Balance {
    available: string;
    reserved: string;
}

/**
 * Balance response with user context
 */
export interface BalanceResponse extends Balance {
    user_id: string;
    currency: string;
    total: string;
    updated_at: string;
}
