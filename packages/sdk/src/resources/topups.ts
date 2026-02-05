import { BaseResource } from './base';
import type { CreateTopUpRequest, TopUp, PaginationParams, PaginatedResponse } from '../types';

/**
 * TopUps resource client
 * Handles top-up (payin) operations
 */
export class TopUpsResource extends BaseResource {
    /**
     * Create a new top-up
     * Returns a confirmation URI that the user must visit to complete payment
     *
     * @param data - Top-up creation data
     * @returns Promise resolving to the created top-up with confirmation URI
     *
     * @example
     * ```typescript
     * const topup = await sdk.topups.create({
     *   amount: '100.00',
     *   description: 'Add funds to account'
     * });
     * // Redirect user to topup.confirmationUri
     * ```
     */
    async create(data: CreateTopUpRequest): Promise<TopUp> {
        return this.client.post<TopUp>('topups', data);
    }

    /**
     * List top-ups for the authenticated user
     *
     * @param params - Pagination parameters
     * @returns Promise resolving to paginated list of top-ups
     *
     * @example
     * ```typescript
     * const result = await sdk.topups.list({
     *   limit: 20,
     *   cursor: 'topup_xyz'
     * });
     * ```
     */
    async list(params?: PaginationParams): Promise<PaginatedResponse<TopUp>> {
        const queryParams: Record<string, string> = {};
        if (params?.limit) queryParams.limit = params.limit.toString();
        if (params?.cursor) queryParams.cursor = params.cursor;

        const query = new URLSearchParams(queryParams).toString();
        const path = query ? `topups?${query}` : 'topups';

        return this.client.get<PaginatedResponse<TopUp>>(path);
    }

    /**
     * Get a specific top-up by ID
     *
     * @param topupId - Top-up ID
     * @returns Promise resolving to the top-up
     *
     * @example
     * ```typescript
     * const topup = await sdk.topups.get('topup_abc123');
     * ```
     */
    async get(topupId: string): Promise<TopUp> {
        return this.client.get<TopUp>(`topups/${topupId}`);
    }

    /**
     * Refresh top-up status from Airtm
     * Use when webhook may have been missed
     *
     * @param topupId - Top-up ID
     * @returns Promise resolving to updated top-up
     *
     * @example
     * ```typescript
     * const topup = await sdk.topups.refresh('topup_abc123');
     * ```
     */
    async refresh(topupId: string): Promise<TopUp> {
        return this.client.post<TopUp>(`topups/${topupId}/refresh`);
    }

    /**
     * Cancel a top-up that is awaiting user confirmation
     * Only works when status is TOPUP_AWAITING_USER_CONFIRMATION
     *
     * @param topupId - Top-up ID
     * @returns Promise resolving to cancelled top-up
     *
     * @example
     * ```typescript
     * const topup = await sdk.topups.cancel('topup_abc123');
     * ```
     */
    async cancel(topupId: string): Promise<TopUp> {
        return this.client.post<TopUp>(`topups/${topupId}/cancel`);
    }
}
