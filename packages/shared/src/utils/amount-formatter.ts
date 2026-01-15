import Big from 'big.js';

/**
 * Amount formatting utilities
 * @see docs/standards/naming-conventions.md
 *
 * IMPORTANT: Amounts are ALWAYS strings with exactly 2 decimals
 */

/**
 * Regex pattern for valid amount format
 * Must be a decimal string with exactly 2 decimal places
 */
export const AMOUNT_REGEX = /^\d+\.\d{2}$/;

/**
 * Validate that an amount string is in the correct format
 * @example
 * isValidAmount('100.00') // true
 * isValidAmount('0.50') // true
 * isValidAmount('100') // false
 */
export function isValidAmount(amount: unknown): amount is string {
    if (typeof amount !== 'string') return false;
    return AMOUNT_REGEX.test(amount);
}

/**
 * Format a number or Big object to a valid amount string
 * @example
 * formatAmount(100) // '100.00'
 * formatAmount(0.5) // '0.50'
 */
export function formatAmount(value: number | Big): string {
    const b = value instanceof Big ? value : new Big(value);
    return b.toFixed(2);
}

/**
 * Parse an amount string to a Big object (for safe calculations)
 */
export function parseAmount(amount: string): Big {
    if (!isValidAmount(amount)) {
        throw new Error(`Invalid amount format: ${amount}`);
    }
    return new Big(amount);
}

/**
 * Add two amounts (returns properly formatted string)
 * @example
 * addAmounts('100.00', '50.50') // '150.50'
 */
export function addAmounts(a: string, b: string): string {
    const valA = parseAmount(a);
    const valB = parseAmount(b);
    return formatAmount(valA.plus(valB));
}

/**
 * Subtract amounts (returns properly formatted string)
 * @example
 * subtractAmounts('100.00', '30.50') // '69.50'
 */
export function subtractAmounts(a: string, b: string): string {
    const valA = parseAmount(a);
    const valB = parseAmount(b);
    return formatAmount(valA.minus(valB));
}

/**
 * Compare two amounts
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareAmounts(a: string, b: string): -1 | 0 | 1 {
    const valA = parseAmount(a);
    const valB = parseAmount(b);
    return valA.cmp(valB) as -1 | 0 | 1;
}

/**
 * Check if amount is positive (greater than 0)
 */
export function isPositiveAmount(amount: string): boolean {
    return parseAmount(amount).gt(0);
}
