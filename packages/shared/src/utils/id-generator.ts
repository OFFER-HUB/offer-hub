import { customAlphabet } from 'nanoid';
import { ID_PREFIXES, IdPrefix } from '../constants/id-prefixes';

/**
 * URL-safe alphabet for nanoid
 * Similar to standard nanoid but explicitly defined
 */
const NANOID_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Generate a 32-character nanoid
 */
const nanoid = customAlphabet(NANOID_ALPHABET, 32);

/**
 * Generate a prefixed ID for a resource
 * @see docs/standards/naming-conventions.md
 *
 * @example
 * generateId(ID_PREFIXES.USER) // 'usr_V1StGXR8Z5jdHi6B3mEv0'
 * generateId(ID_PREFIXES.ORDER) // 'ord_W2TuHYS9A6keIj7C4nFw1'
 */
export function generateId(prefix: IdPrefix): string {
    return `${prefix}${nanoid()}`;
}

/**
 * Convenience functions for each resource type
 */
export const generateUserId = () => generateId(ID_PREFIXES.USER);
export const generateOrderId = () => generateId(ID_PREFIXES.ORDER);
export const generateTopupId = () => generateId(ID_PREFIXES.TOPUP);
export const generateEscrowId = () => generateId(ID_PREFIXES.ESCROW);
export const generateDisputeId = () => generateId(ID_PREFIXES.DISPUTE);
export const generateWithdrawalId = () => generateId(ID_PREFIXES.WITHDRAWAL);
export const generateEventId = () => generateId(ID_PREFIXES.EVENT);
export const generateAuditLogId = () => generateId(ID_PREFIXES.AUDIT_LOG);
export const generateApiKeyId = () => generateId(ID_PREFIXES.API_KEY);
export const generateMarketplaceId = () => generateId(ID_PREFIXES.MARKETPLACE);

/**
 * Extract prefix from an ID
 * @example
 * extractPrefix('usr_V1StGXR8Z5jdHi6B3mEv0') // 'usr_'
 */
export function extractPrefix(id: string): string | null {
    const match = id.match(/^([a-z]+_)/);
    return match ? match[1] : null;
}

/**
 * Validate that an ID has the expected prefix
 * @example
 * validateIdPrefix('usr_V1StGXR8Z5jdHi6B3mEv0', ID_PREFIXES.USER) // true
 * validateIdPrefix('ord_V1StGXR8Z5jdHi6B3mEv0', ID_PREFIXES.USER) // false
 */
export function validateIdPrefix(id: string, expectedPrefix: IdPrefix): boolean {
    return id.startsWith(expectedPrefix);
}
