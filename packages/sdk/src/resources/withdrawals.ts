import { BaseResource } from './base';
import type {
    CreateWithdrawalRequest,
    Withdrawal,
    PaginationParams,
    PaginatedResponse,
} from '../types';

/**
 * Withdrawals resource client
 * Handles withdrawal (payout) operations
 */
export class WithdrawalsResource extends BaseResource {
    /**
     * Create a new withdrawal
     * By default creates in two-step mode (requires commit)
     * Set commit=true for one-step withdrawal
     *
     * @param data - Withdrawal creation data
     * @returns Promise resolving to the created withdrawal
     *
     * @example
     * ```typescript
     * // Two-step withdrawal (default)
     * const withdrawal = await sdk.withdrawals.create({
     *   amount: '50.00',
     *   description: 'Cash out earnings'
     * });
     * // Later commit when ready
     * await sdk.withdrawals.commit(withdrawal.id);
     *
     * // One-step withdrawal
     * const withdrawal = await sdk.withdrawals.create({
     *   amount: '50.00',
     *   commit: true
     * });
     * ```
     */
    async create(data: CreateWithdrawalRequest): Promise<Withdrawal> {
        return this.client.post<Withdrawal>('withdrawals', data);
    }

    /**
     * List withdrawals for the authenticated user
     *
     * @param params - Pagination parameters
     * @returns Promise resolving to paginated list of withdrawals
     *
     * @example
     * ```typescript
     * const result = await sdk.withdrawals.list({
     *   limit: 20,
     *   cursor: 'wd_xyz'
     * });
     * ```
     */
    async list(params?: PaginationParams): Promise<PaginatedResponse<Withdrawal>> {
        const queryParams: Record<string, string> = {};
        if (params?.limit) queryParams.limit = params.limit.toString();
        if (params?.cursor) queryParams.cursor = params.cursor;

        const query = new URLSearchParams(queryParams).toString();
        const path = query ? `withdrawals?${query}` : 'withdrawals';

        return this.client.get<PaginatedResponse<Withdrawal>>(path);
    }

    /**
     * Get a specific withdrawal by ID
     *
     * @param withdrawalId - Withdrawal ID
     * @returns Promise resolving to the withdrawal
     *
     * @example
     * ```typescript
     * const withdrawal = await sdk.withdrawals.get('wd_abc123');
     * ```
     */
    async get(withdrawalId: string): Promise<Withdrawal> {
        return this.client.get<Withdrawal>(`withdrawals/${withdrawalId}`);
    }

    /**
     * Commit a withdrawal that was created without auto-commit
     * Only works for withdrawals in WITHDRAWAL_CREATED status
     *
     * @param withdrawalId - Withdrawal ID
     * @returns Promise resolving to committed withdrawal
     *
     * @example
     * ```typescript
     * const withdrawal = await sdk.withdrawals.commit('wd_abc123');
     * ```
     */
    async commit(withdrawalId: string): Promise<Withdrawal> {
        return this.client.post<Withdrawal>(`withdrawals/${withdrawalId}/commit`);
    }

    /**
     * Refresh withdrawal status from Airtm
     * Use when webhook may have been missed
     *
     * @param withdrawalId - Withdrawal ID
     * @returns Promise resolving to updated withdrawal
     *
     * @example
     * ```typescript
     * const withdrawal = await sdk.withdrawals.refresh('wd_abc123');
     * ```
     */
    async refresh(withdrawalId: string): Promise<Withdrawal> {
        return this.client.post<Withdrawal>(`withdrawals/${withdrawalId}/refresh`);
    }
}
