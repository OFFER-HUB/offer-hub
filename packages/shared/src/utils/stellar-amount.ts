import Big from 'big.js';

/**
 * Stellar USDC Amount Utilities
 *
 * Stellar uses stroops as the smallest unit:
 * - 1 USDC = 1,000,000 stroops
 * - 1 stroops = 0.000001 USDC
 *
 * @see docs/standards/stellar-precision.md
 */

/**
 * Number of decimal places for Stellar USDC (6)
 */
export const STELLAR_DECIMAL_PLACES = 6;

/**
 * Stroops per USDC unit
 */
export const STROOPS_PER_USDC = 1_000_000;

/**
 * Regex pattern for valid Stellar amount (6 decimal places)
 */
export const STELLAR_AMOUNT_REGEX = /^\d+\.\d{6}$/;

/**
 * Convert decimal USDC amount to stroops (smallest unit)
 * @example
 * toStroops('100.000000') // '100000000'
 * toStroops('0.500000') // '500000'
 * toStroops('120.456789') // '120456789'
 */
export function toStroops(amount: string): string {
    const big = new Big(amount);
    return big.times(STROOPS_PER_USDC).toFixed(0);
}

/**
 * Convert stroops to decimal USDC amount
 * @example
 * fromStroops('100000000') // '100.000000'
 * fromStroops('500000') // '0.500000'
 * fromStroops('1') // '0.000001'
 */
export function fromStroops(stroops: string): string {
    const big = new Big(stroops);
    return big.div(STROOPS_PER_USDC).toFixed(STELLAR_DECIMAL_PLACES);
}

/**
 * Validate Stellar amount format (6 decimal places)
 * @example
 * isValidStellarAmount('100.000000') // true
 * isValidStellarAmount('0.500000') // true
 * isValidStellarAmount('100.00') // false (needs 6 decimals)
 */
export function isValidStellarAmount(amount: unknown): amount is string {
    if (typeof amount !== 'string') return false;
    return STELLAR_AMOUNT_REGEX.test(amount);
}

/**
 * Format a number to Stellar decimal format (6 places)
 * @example
 * formatStellarAmount(100) // '100.000000'
 * formatStellarAmount(0.5) // '0.500000'
 */
export function formatStellarAmount(value: number | Big): string {
    const b = value instanceof Big ? value : new Big(value);
    return b.toFixed(STELLAR_DECIMAL_PLACES);
}

/**
 * Convert Orchestrator amount (2 decimals) to Stellar amount (6 decimals)
 * @example
 * orchestratorToStellar('100.00') // '100.000000'
 * orchestratorToStellar('0.50') // '0.500000'
 */
export function orchestratorToStellar(amount: string): string {
    const big = new Big(amount);
    return big.toFixed(STELLAR_DECIMAL_PLACES);
}

/**
 * Convert Stellar amount (6 decimals) to Orchestrator amount (2 decimals)
 * @example
 * stellarToOrchestrator('100.000000') // '100.00'
 * stellarToOrchestrator('0.500000') // '0.50'
 * stellarToOrchestrator('100.456789') // '100.46' (rounded)
 */
export function stellarToOrchestrator(amount: string): string {
    const big = new Big(amount);
    return big.toFixed(2);
}
