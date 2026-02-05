import { BaseResource } from './base';
import type {
    CreateOrderRequest,
    Order,
    ListOrdersParams,
    PaginatedResponse,
    CancelOrderRequest,
    Milestone,
} from '../types';

/**
 * Orders resource client
 * Handles order lifecycle management
 */
export class OrdersResource extends BaseResource {
    /**
     * Create a new order
     *
     * @param data - Order creation data
     * @returns Promise resolving to the created order
     *
     * @example
     * ```typescript
     * const order = await sdk.orders.create({
     *   buyer_id: 'usr_buyer123',
     *   seller_id: 'usr_seller456',
     *   amount: '100.00',
     *   title: 'Website Development',
     *   description: 'Build a landing page',
     *   milestones: [
     *     { ref: 'design', description: 'Design mockups', amount: '30.00' },
     *     { ref: 'dev', description: 'Development', amount: '70.00' }
     *   ]
     * });
     * ```
     */
    async create(data: CreateOrderRequest): Promise<Order> {
        const response = await this.client.post<{ success: boolean; data: Order }>('orders', data);
        return response.data;
    }

    /**
     * List orders with pagination and filtering
     *
     * @param params - Filtering and pagination parameters
     * @returns Promise resolving to paginated list of orders
     *
     * @example
     * ```typescript
     * const result = await sdk.orders.list({
     *   buyer_id: 'usr_123',
     *   status: 'ESCROW_FUNDED',
     *   limit: 20
     * });
     * ```
     */
    async list(params?: ListOrdersParams): Promise<PaginatedResponse<Order>> {
        const queryParams: Record<string, string> = {};
        if (params?.buyer_id) queryParams.buyer_id = params.buyer_id;
        if (params?.seller_id) queryParams.seller_id = params.seller_id;
        if (params?.status) queryParams.status = params.status;
        if (params?.limit) queryParams.limit = params.limit.toString();
        if (params?.cursor) queryParams.cursor = params.cursor;

        const query = new URLSearchParams(queryParams).toString();
        const path = query ? `orders?${query}` : 'orders';

        const response = await this.client.get<{
            success: boolean;
            data: Order[];
            hasMore: boolean;
            nextCursor?: string;
        }>(path);

        return {
            data: response.data,
            hasMore: response.hasMore,
            nextCursor: response.nextCursor,
        };
    }

    /**
     * Get order by ID
     *
     * @param orderId - Order ID
     * @returns Promise resolving to the order
     *
     * @example
     * ```typescript
     * const order = await sdk.orders.get('ord_abc123');
     * ```
     */
    async get(orderId: string): Promise<Order> {
        const response = await this.client.get<{ success: boolean; data: Order }>(
            `orders/${orderId}`,
        );
        return response.data;
    }

    /**
     * Reserve funds for an order
     * Moves funds from buyer's available balance to reserved
     *
     * @param orderId - Order ID
     * @returns Promise resolving to updated order
     *
     * @example
     * ```typescript
     * const order = await sdk.orders.reserve('ord_abc123');
     * ```
     */
    async reserve(orderId: string): Promise<Order> {
        const response = await this.client.post<{ success: boolean; data: Order }>(
            `orders/${orderId}/reserve`,
        );
        return response.data;
    }

    /**
     * Cancel an order
     * Returns reserved funds to buyer's available balance if applicable
     *
     * @param orderId - Order ID
     * @param data - Optional cancellation reason
     * @returns Promise resolving to updated order
     *
     * @example
     * ```typescript
     * const order = await sdk.orders.cancel('ord_abc123', {
     *   reason: 'Buyer changed mind'
     * });
     * ```
     */
    async cancel(orderId: string, data?: CancelOrderRequest): Promise<Order> {
        const response = await this.client.post<{ success: boolean; data: Order }>(
            `orders/${orderId}/cancel`,
            data,
        );
        return response.data;
    }

    /**
     * Create escrow contract for an order
     * Must be called after funds are reserved
     *
     * @param orderId - Order ID
     * @returns Promise resolving to updated order with escrow
     *
     * @example
     * ```typescript
     * const order = await sdk.orders.createEscrow('ord_abc123');
     * ```
     */
    async createEscrow(orderId: string): Promise<Order> {
        const response = await this.client.post<{ success: boolean; data: Order }>(
            `orders/${orderId}/escrow`,
        );
        return response.data;
    }

    /**
     * Fund escrow contract
     * Moves funds from reserved balance to on-chain escrow
     *
     * @param orderId - Order ID
     * @returns Promise resolving to updated order
     *
     * @example
     * ```typescript
     * const order = await sdk.orders.fundEscrow('ord_abc123');
     * ```
     */
    async fundEscrow(orderId: string): Promise<Order> {
        const response = await this.client.post<{ success: boolean; data: Order }>(
            `orders/${orderId}/escrow/fund`,
        );
        return response.data;
    }

    /**
     * Get milestones for an order
     *
     * @param orderId - Order ID
     * @returns Promise resolving to list of milestones
     *
     * @example
     * ```typescript
     * const milestones = await sdk.orders.getMilestones('ord_abc123');
     * ```
     */
    async getMilestones(orderId: string): Promise<Milestone[]> {
        const response = await this.client.get<{ success: boolean; data: Milestone[] }>(
            `orders/${orderId}/milestones`,
        );
        return response.data;
    }

    /**
     * Complete a milestone
     *
     * @param orderId - Order ID
     * @param milestoneRef - Milestone reference
     * @returns Promise resolving to completed milestone
     *
     * @example
     * ```typescript
     * const milestone = await sdk.orders.completeMilestone('ord_abc123', 'design');
     * ```
     */
    async completeMilestone(orderId: string, milestoneRef: string): Promise<Milestone> {
        const response = await this.client.post<{ success: boolean; data: Milestone }>(
            `orders/${orderId}/milestones/${milestoneRef}/complete`,
        );
        return response.data;
    }

    /**
     * Request release of funds to seller
     *
     * @param orderId - Order ID
     * @param reason - Optional release reason
     * @returns Promise resolving to updated order
     *
     * @example
     * ```typescript
     * const order = await sdk.orders.release('ord_abc123', 'Work completed');
     * ```
     */
    async release(orderId: string, reason?: string): Promise<Order> {
        const response = await this.client.post<{ success: boolean; data: Order }>(
            `orders/${orderId}/resolution/release`,
            reason ? { reason } : undefined,
        );
        return response.data;
    }

    /**
     * Request refund to buyer
     *
     * @param orderId - Order ID
     * @param reason - Refund reason (required)
     * @returns Promise resolving to updated order
     *
     * @example
     * ```typescript
     * const order = await sdk.orders.refund('ord_abc123', 'Seller failed to deliver');
     * ```
     */
    async refund(orderId: string, reason: string): Promise<Order> {
        const response = await this.client.post<{ success: boolean; data: Order }>(
            `orders/${orderId}/resolution/refund`,
            { reason },
        );
        return response.data;
    }
}
