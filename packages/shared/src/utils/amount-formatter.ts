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
 * isValidAmount(100.00) // false (not a string)
 */
export function isValidAmount(amount: unknown): amount is string {
    if (typeof amount !== 'string') return false;
    return AMOUNT_REGEX.test(amount);
}

/**
 * Format a number to a valid amount string
 * @example
 * formatAmount(100) // '100.00'
 * formatAmount(0.5) // '0.50'
 * formatAmount(1234.567) // '1234.57' (rounded)
 */
export function formatAmount(value: number): string {
    return value.toFixed(2);
}

/**
 * Parse an amount string to a number (for calculations)
 * WARNING: Use only for internal calculations, always convert back to string
 * @example
 * parseAmount('100.00') // 100
 * parseAmount('0.50') // 0.5
 */
export function parseAmount(amount: string): number {
    if (!isValidAmount(amount)) {
        throw new Error(`Invalid amount format: ${amount}`);
    }
    return parseFloat(amount);
}

/**
 * Add two amounts (returns properly formatted string)
 * @example
 * addAmounts('100.00', '50.50') // '150.50'
 */
export function addAmounts(a: string, b: string): string {
    return formatAmount(parseAmount(a) + parseAmount(b));
}

/**
 * Subtract amounts (returns properly formatted string)
 * @example
 * subtractAmounts('100.00', '30.50') // '69.50'
 */
export function subtractAmounts(a: string, b: string): string {
    return formatAmount(parseAmount(a) - parseAmount(b));
}

/**
 * Compare two amounts
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareAmounts(a: string, b: string): -1 | 0 | 1 {
    const numA = parseAmount(a);
    const numB = parseAmount(b);
    if (numA < numB) return -1;
    if (numA > numB) return 1;
    return 0;
}

/**
 * Check if amount is positive (greater than 0)
 */
export function isPositiveAmount(amount: string): boolean {
    return parseAmount(amount) > 0;
}
