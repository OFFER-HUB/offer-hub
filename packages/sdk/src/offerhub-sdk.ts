import { HttpClient, type HttpClientConfig } from './client/http-client';
import { UsersResource } from './resources/users';
import { BalanceResource } from './resources/balance';
import { OrdersResource } from './resources/orders';
import { TopUpsResource } from './resources/topups';
import { WithdrawalsResource } from './resources/withdrawals';
import { DisputesResource } from './resources/disputes';

/**
 * Configuration options for the OfferHub SDK
 */
export interface OfferHubSDKConfig {
    /** Base API URL */
    apiUrl: string;
    /** API Key for authentication */
    apiKey: string;
    /** Request timeout in milliseconds (default: 30000) */
    timeout?: number;
    /** Maximum retry attempts (default: 3) */
    retryAttempts?: number;
    /** Custom headers to include in all requests */
    headers?: Record<string, string>;
}

/**
 * Main OfferHub SDK client
 * Provides access to all OfferHub API resources
 *
 * @example
 * ```typescript
 * import { OfferHubSDK } from '@offerhub/sdk';
 *
 * const sdk = new OfferHubSDK({
 *   apiUrl: 'https://api.offerhub.com',
 *   apiKey: 'ohk_your_api_key_here'
 * });
 *
 * // Create a user
 * const user = await sdk.users.create({
 *   externalUserId: 'user_123',
 *   email: 'user@example.com'
 * });
 *
 * // Create an order
 * const order = await sdk.orders.create({
 *   buyer_id: 'usr_buyer',
 *   seller_id: 'usr_seller',
 *   amount: '100.00',
 *   title: 'Website Development'
 * });
 * ```
 */
export class OfferHubSDK {
    private readonly httpClient: HttpClient;

    /** Users resource - manage users and Airtm linking */
    public readonly users: UsersResource;

    /** Balance resource - manage user balances and fund operations */
    public readonly balance: BalanceResource;

    /** Orders resource - manage order lifecycle */
    public readonly orders: OrdersResource;

    /** TopUps resource - manage top-up (payin) operations */
    public readonly topups: TopUpsResource;

    /** Withdrawals resource - manage withdrawal (payout) operations */
    public readonly withdrawals: WithdrawalsResource;

    /** Disputes resource - manage dispute operations */
    public readonly disputes: DisputesResource;

    constructor(config: OfferHubSDKConfig) {
        // Create HTTP client
        this.httpClient = new HttpClient({
            apiUrl: config.apiUrl,
            apiKey: config.apiKey,
            timeout: config.timeout,
            retryAttempts: config.retryAttempts,
            headers: config.headers,
        });

        // Initialize resource clients
        this.users = new UsersResource(this.httpClient);
        this.balance = new BalanceResource(this.httpClient);
        this.orders = new OrdersResource(this.httpClient);
        this.topups = new TopUpsResource(this.httpClient);
        this.withdrawals = new WithdrawalsResource(this.httpClient);
        this.disputes = new DisputesResource(this.httpClient);
    }

    /**
     * Create a new SDK instance with an idempotency key
     * Returns a new SDK instance that will include the idempotency key in all requests
     *
     * @param key - Idempotency key
     * @returns New SDK instance with idempotency key set
     *
     * @example
     * ```typescript
     * const idempotentSdk = sdk.withIdempotencyKey('unique-key-123');
     * await idempotentSdk.orders.create({ ... }); // Will include idempotency key
     * ```
     */
    withIdempotencyKey(key: string): OfferHubSDK {
        const newClient = this.httpClient.withIdempotencyKey(key);
        const newSdk = Object.create(OfferHubSDK.prototype);

        newSdk.httpClient = newClient;
        newSdk.users = new UsersResource(newClient);
        newSdk.balance = new BalanceResource(newClient);
        newSdk.orders = new OrdersResource(newClient);
        newSdk.topups = new TopUpsResource(newClient);
        newSdk.withdrawals = new WithdrawalsResource(newClient);
        newSdk.disputes = new DisputesResource(newClient);

        return newSdk;
    }

    /**
     * Create a new SDK instance with custom headers
     * Returns a new SDK instance that will include the custom headers in all requests
     *
     * @param headers - Custom headers
     * @returns New SDK instance with custom headers set
     *
     * @example
     * ```typescript
     * const customSdk = sdk.withHeaders({ 'X-Custom-Header': 'value' });
     * await customSdk.orders.create({ ... }); // Will include custom headers
     * ```
     */
    withHeaders(headers: Record<string, string>): OfferHubSDK {
        const newClient = this.httpClient.withHeaders(headers);
        const newSdk = Object.create(OfferHubSDK.prototype);

        newSdk.httpClient = newClient;
        newSdk.users = new UsersResource(newClient);
        newSdk.balance = new BalanceResource(newClient);
        newSdk.orders = new OrdersResource(newClient);
        newSdk.topups = new TopUpsResource(newClient);
        newSdk.withdrawals = new WithdrawalsResource(newClient);
        newSdk.disputes = new DisputesResource(newClient);

        return newSdk;
    }
}
