/**
 * Date utilities
 * @see docs/standards/naming-conventions.md
 *
 * All dates are ISO 8601 in UTC
 * Format: YYYY-MM-DDTHH:mm:ss.sssZ
 */

/**
 * Get current timestamp in ISO 8601 UTC format
 * @example
 * nowUTC() // '2026-01-12T14:30:00.000Z'
 */
export function nowUTC(): string {
    return new Date().toISOString();
}

/**
 * Convert a Date object to ISO 8601 UTC string
 * @example
 * toUTCString(new Date()) // '2026-01-12T14:30:00.000Z'
 */
export function toUTCString(date: Date): string {
    return date.toISOString();
}

/**
 * Parse an ISO 8601 string to a Date object
 * @example
 * parseUTC('2026-01-12T14:30:00.000Z') // Date object
 */
export function parseUTC(isoString: string): Date {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid ISO date string: ${isoString}`);
    }
    return date;
}

/**
 * Check if a string is a valid ISO 8601 date
 */
export function isValidISODate(value: string): boolean {
    try {
        const date = new Date(value);
        return !isNaN(date.getTime()) && value === date.toISOString();
    } catch {
        return false;
    }
}

/**
 * Add duration to a date and return ISO string
 * @param date - Base date (ISO string or Date)
 * @param ms - Milliseconds to add
 */
export function addMilliseconds(date: string | Date, ms: number): string {
    const baseDate = typeof date === 'string' ? parseUTC(date) : date;
    return new Date(baseDate.getTime() + ms).toISOString();
}

/**
 * Add hours to a date
 */
export function addHours(date: string | Date, hours: number): string {
    return addMilliseconds(date, hours * 60 * 60 * 1000);
}

/**
 * Add days to a date
 */
export function addDays(date: string | Date, days: number): string {
    return addMilliseconds(date, days * 24 * 60 * 60 * 1000);
}
