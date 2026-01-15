import { createHash, randomBytes } from 'crypto';
import { generateId } from './id-generator';
import { ID_PREFIXES } from '../constants/id-prefixes';

/**
 * Hashes an API key using SHA-256 with a given salt.
 * 
 * @param key The plain text API key (ohk_...)
 * @param salt The salt used for hashing
 * @returns The hex-encoded hash
 */
export function hashApiKey(key: string, salt: string): string {
    return createHash('sha256')
        .update(`${salt}.${key}`)
        .digest('hex');
}

/**
 * Generates a new API key and its corresponding hash and salt.
 * The key format will be: ohk_{env}_{id}_{random}
 * 
 * @param env The environment for the key (live or test)
 * @returns An object containing the plain text key, its hash, salt, and id
 */
export function generateApiKey(env: 'live' | 'test' = 'live'): { key: string; hashedKey: string; salt: string; id: string } {
    const id = generateId(ID_PREFIXES.API_KEY);
    const randomPart = randomBytes(24).toString('hex');
    const key = `ohk_${env}_${id}_${randomPart}`;
    const salt = randomBytes(16).toString('hex');
    const hashedKey = hashApiKey(key, salt);
    return { key, hashedKey, salt, id };
}
/**
 * Hashes a request payload using SHA-256.
 * 
 * @param payload The payload to hash
 * @returns The hex-encoded hash
 */
export function hashPayload(payload: any): string {
    const data = typeof payload === 'string' ? payload : JSON.stringify(payload || {});
    return createHash('sha256')
        .update(data)
        .digest('hex');
}

/**
 * Validates if a string is a valid UUID v4.
 * 
 * @param uuid The string to validate
 * @returns True if valid UUID v4
 */
export function isValidUuidV4(uuid: string): boolean {
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidV4Regex.test(uuid);
}
