import { BaseResource } from './base';
import type {
    OpenDisputeRequest,
    AssignDisputeRequest,
    ResolveDisputeRequest,
    Dispute,
} from '../types';

/**
 * Disputes resource client
 * Handles dispute management operations
 */
export class DisputesResource extends BaseResource {
    /**
     * Open a dispute for an order
     *
     * @param orderId - Order ID
     * @param data - Dispute opening data
     * @returns Promise resolving to the created dispute
     *
     * @example
     * ```typescript
     * const dispute = await sdk.disputes.open('ord_abc123', {
     *   reason: 'Work not delivered as promised',
     *   evidence: 'Screenshots and chat logs attached'
     * });
     * ```
     */
    async open(orderId: string, data: OpenDisputeRequest): Promise<Dispute> {
        const response = await this.client.post<{ success: boolean; data: Dispute }>(
            `orders/${orderId}/resolution/dispute`,
            data,
        );
        return response.data;
    }

    /**
     * Get dispute by ID
     *
     * @param disputeId - Dispute ID
     * @returns Promise resolving to the dispute
     *
     * @example
     * ```typescript
     * const dispute = await sdk.disputes.get('dsp_abc123');
     * ```
     */
    async get(disputeId: string): Promise<Dispute> {
        const response = await this.client.get<{ success: boolean; data: Dispute }>(
            `disputes/${disputeId}`,
        );
        return response.data;
    }

    /**
     * Assign dispute to support agent
     *
     * @param disputeId - Dispute ID
     * @param data - Assignment data
     * @returns Promise resolving to updated dispute
     *
     * @example
     * ```typescript
     * const dispute = await sdk.disputes.assign('dsp_abc123', {
     *   supportAgentId: 'agent_456'
     * });
     * ```
     */
    async assign(disputeId: string, data: AssignDisputeRequest): Promise<Dispute> {
        const response = await this.client.post<{ success: boolean; data: Dispute }>(
            `disputes/${disputeId}/assign`,
            data,
        );
        return response.data;
    }

    /**
     * Resolve dispute with decision
     *
     * @param disputeId - Dispute ID
     * @param data - Resolution data
     * @returns Promise resolving to resolved dispute
     *
     * @example
     * ```typescript
     * // Full release to seller
     * const dispute = await sdk.disputes.resolve('dsp_abc123', {
     *   resolution: 'RELEASE_TO_SELLER',
     *   notes: 'Evidence shows work was completed'
     * });
     *
     * // Full refund to buyer
     * const dispute = await sdk.disputes.resolve('dsp_abc123', {
     *   resolution: 'REFUND_TO_BUYER',
     *   notes: 'Work was not delivered'
     * });
     *
     * // Split decision
     * const dispute = await sdk.disputes.resolve('dsp_abc123', {
     *   resolution: 'SPLIT',
     *   sellerAmount: '60.00',
     *   buyerAmount: '40.00',
     *   notes: 'Partial work completed'
     * });
     * ```
     */
    async resolve(disputeId: string, data: ResolveDisputeRequest): Promise<Dispute> {
        const response = await this.client.post<{ success: boolean; data: Dispute }>(
            `disputes/${disputeId}/resolve`,
            data,
        );
        return response.data;
    }
}
