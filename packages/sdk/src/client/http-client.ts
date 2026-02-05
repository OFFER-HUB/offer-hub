import ky, { type KyInstance, type Options } from 'ky';
import { parseError, NetworkError } from '../errors';

export interface HttpClientConfig {
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
 * HTTP Client wrapper around Ky with automatic retries and error handling
 */
export class HttpClient {
    private readonly client: KyInstance;

    constructor(private readonly config: HttpClientConfig) {
        const options: Options = {
            prefixUrl: config.apiUrl,
            timeout: config.timeout || 30000,
            retry: {
                limit: config.retryAttempts || 3,
                methods: ['get', 'post', 'put', 'patch', 'delete'],
                statusCodes: [408, 413, 429, 500, 502, 503, 504],
                backoffLimit: 3000,
            },
            hooks: {
                beforeRequest: [
                    (request) => {
                        // Add API Key header
                        request.headers.set('Authorization', `Bearer ${config.apiKey}`);
                        // Add user agent
                        request.headers.set('User-Agent', 'OfferHub-SDK/0.0.0');
                        // Add custom headers
                        if (config.headers) {
                            Object.entries(config.headers).forEach(([key, value]) => {
                                request.headers.set(key, value);
                            });
                        }
                    },
                ],
                beforeRetry: [
                    ({ request, error, retryCount }) => {
                        console.warn(`Retrying request to ${request.url} (attempt ${retryCount + 1})`);
                    },
                ],
            },
        };

        this.client = ky.create(options);
    }

    /**
     * Make a GET request
     */
    async get<T>(path: string, options?: Options): Promise<T> {
        try {
            const response = await this.client.get(path, options);
            return await response.json<T>();
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Make a POST request
     */
    async post<T>(path: string, body?: any, options?: Options): Promise<T> {
        try {
            const response = await this.client.post(path, {
                ...options,
                json: body,
            });
            return await response.json<T>();
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Make a PUT request
     */
    async put<T>(path: string, body?: any, options?: Options): Promise<T> {
        try {
            const response = await this.client.put(path, {
                ...options,
                json: body,
            });
            return await response.json<T>();
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Make a PATCH request
     */
    async patch<T>(path: string, body?: any, options?: Options): Promise<T> {
        try {
            const response = await this.client.patch(path, {
                ...options,
                json: body,
            });
            return await response.json<T>();
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Make a DELETE request
     */
    async delete<T>(path: string, options?: Options): Promise<T> {
        try {
            const response = await this.client.delete(path, options);
            return await response.json<T>();
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Handle and transform errors into OfferHub error types
     */
    private handleError(error: any): Error {
        // Network/connection errors
        if (error.name === 'TimeoutError' || error.name === 'AbortError') {
            return new NetworkError('Request timeout', error);
        }

        // HTTP errors with response
        if (error.response) {
            try {
                const data = error.response.json ? error.response.json() : null;
                return parseError({
                    status: error.response.status,
                    data,
                });
            } catch {
                return parseError({
                    status: error.response.status,
                    data: { message: error.message },
                });
            }
        }

        // Unknown errors
        return new NetworkError(error.message || 'Unknown error occurred', error);
    }

    /**
     * Set idempotency key for the next request
     */
    withIdempotencyKey(key: string): HttpClient {
        return new HttpClient({
            ...this.config,
            headers: {
                ...this.config.headers,
                'Idempotency-Key': key,
            },
        });
    }

    /**
     * Set custom headers for the next request
     */
    withHeaders(headers: Record<string, string>): HttpClient {
        return new HttpClient({
            ...this.config,
            headers: {
                ...this.config.headers,
                ...headers,
            },
        });
    }
}
