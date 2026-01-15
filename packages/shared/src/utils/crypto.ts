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
