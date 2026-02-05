import { BaseResource } from './base';
import type {
    Balance,
    CreditAvailableRequest,
    DebitAvailableRequest,
    ReserveRequest,
    ReleaseRequest,
    CancelReservationRequest,
    DeductReservedRequest,
} from '../types';

/**
 * Balance resource client
 * Handles balance management operations
 */
export class BalanceResource extends BaseResource {
    /**
     * Get user balance
     *
     * @param userId - User ID
     * @returns Promise resolving to the user's balance
     *
     * @example
     * ```typescript
     * const balance = await sdk.balance.get('usr_123');
     * console.log(balance.available, balance.reserved);
     * ```
     */
    async get(userId: string): Promise<Balance> {
        return this.client.get<Balance>(`users/${userId}/balance`);
    }

    /**
     * Credit funds to available balance
     *
     * @param userId - User ID
     * @param data - Credit operation data
     * @returns Promise resolving to updated balance
     *
     * @example
     * ```typescript
     * const balance = await sdk.balance.credit('usr_123', {
     *   amount: '100.00',
     *   description: 'Bonus credit',
     *   reference: 'bonus_abc123'
     * });
     * ```
     */
    async credit(userId: string, data: CreditAvailableRequest): Promise<Balance> {
        return this.client.post<Balance>(`users/${userId}/balance/credit`, data);
    }

    /**
     * Debit funds from available balance
     *
     * @param userId - User ID
     * @param data - Debit operation data
     * @returns Promise resolving to updated balance
     *
     * @example
     * ```typescript
     * const balance = await sdk.balance.debit('usr_123', {
     *   amount: '50.00',
     *   description: 'Service fee',
     *   reference: 'fee_xyz789'
     * });
     * ```
     */
    async debit(userId: string, data: DebitAvailableRequest): Promise<Balance> {
        return this.client.post<Balance>(`users/${userId}/balance/debit`, data);
    }

    /**
     * Reserve funds (move from available to reserved)
     *
     * @param userId - User ID
     * @param data - Reserve operation data
     * @returns Promise resolving to updated balance
     *
     * @example
     * ```typescript
     * const balance = await sdk.balance.reserve('usr_123', {
     *   amount: '100.00',
     *   reference: 'ord_abc123'
     * });
     * ```
     */
    async reserve(userId: string, data: ReserveRequest): Promise<Balance> {
        return this.client.post<Balance>(`users/${userId}/balance/reserve`, data);
    }

    /**
     * Release reserved funds to seller
     *
     * @param userId - User ID
     * @param data - Release operation data
     * @returns Promise resolving to updated balance
     *
     * @example
     * ```typescript
     * const balance = await sdk.balance.release('usr_123', {
     *   amount: '100.00',
     *   reference: 'ord_abc123',
     *   recipientId: 'usr_456'
     * });
     * ```
     */
    async release(userId: string, data: ReleaseRequest): Promise<Balance> {
        return this.client.post<Balance>(`users/${userId}/balance/release`, data);
    }

    /**
     * Cancel reservation (return reserved to available)
     *
     * @param userId - User ID
     * @param data - Cancel reservation data
     * @returns Promise resolving to updated balance
     *
     * @example
     * ```typescript
     * const balance = await sdk.balance.cancelReservation('usr_123', {
     *   amount: '100.00',
     *   reference: 'ord_abc123'
     * });
     * ```
     */
    async cancelReservation(userId: string, data: CancelReservationRequest): Promise<Balance> {
        return this.client.post<Balance>(`users/${userId}/balance/cancel-reservation`, data);
    }

    /**
     * Deduct from reserved balance
     *
     * @param userId - User ID
     * @param data - Deduct reserved data
     * @returns Promise resolving to updated balance
     *
     * @example
     * ```typescript
     * const balance = await sdk.balance.deductReserved('usr_123', {
     *   amount: '10.00',
     *   reference: 'fee_xyz789'
     * });
     * ```
     */
    async deductReserved(userId: string, data: DeductReservedRequest): Promise<Balance> {
        return this.client.post<Balance>(`users/${userId}/balance/deduct-reserved`, data);
    }

    /**
     * Sync balance with provider
     *
     * @param userId - User ID
     * @returns Promise resolving to synced balance
     *
     * @example
     * ```typescript
     * const balance = await sdk.balance.sync('usr_123');
     * ```
     */
    async sync(userId: string): Promise<Balance> {
        return this.client.post<Balance>(`users/${userId}/balance/sync`);
    }

    /**
     * Get balance with provider verification
     *
     * @param userId - User ID
     * @returns Promise resolving to verified balance
     *
     * @example
     * ```typescript
     * const balance = await sdk.balance.verify('usr_123');
     * ```
     */
    async verify(userId: string): Promise<Balance> {
        return this.client.get<Balance>(`users/${userId}/balance/verify`);
    }
}
