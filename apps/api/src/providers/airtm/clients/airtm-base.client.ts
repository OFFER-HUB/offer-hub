import { Logger } from '@nestjs/common';
import ky, { type KyInstance, type Options, HTTPError } from 'ky';
import { AirtmConfig } from '../airtm.config';
import { AirtmProviderException } from '../exceptions';
import { DEFAULT_RETRY_OPTIONS, HTTP_TIMEOUT_MS } from '../types';

/**
 * Base HTTP client for Airtm API.
 * Provides common functionality: authentication, retry logic, error handling.
 */
export abstract class AirtmBaseClient {
    protected readonly logger: Logger;
    protected readonly client: KyInstance;

    constructor(
        protected readonly config: AirtmConfig,
        loggerContext: string,
    ) {
        this.logger = new Logger(loggerContext);
        this.client = this.createClient();
    }

    /**
     * Creates configured ky instance with retry, timeout, and auth.
     */
    private createClient(): KyInstance {
        return ky.create({
            prefixUrl: this.config.baseUrl,
            timeout: HTTP_TIMEOUT_MS,
            retry: {
                limit: DEFAULT_RETRY_OPTIONS.maxRetries,
                methods: ['get', 'post', 'put'],
                statusCodes: DEFAULT_RETRY_OPTIONS.retryStatusCodes,
                backoffLimit: DEFAULT_RETRY_OPTIONS.maxDelayMs,
            },
            hooks: {
                beforeRequest: [
                    (request) => {
                        request.headers.set('Authorization', this.config.basicAuthHeader);
                        request.headers.set('Content-Type', 'application/json');
                        request.headers.set('Accept', 'application/json');

                        // Log request without exposing sensitive data
                        this.logger.debug(
                            `[Airtm] ${request.method} ${this.maskUrl(request.url)}`,
                        );
                    },
                ],
                beforeRetry: [
                    ({ retryCount, error }) => {
                        this.logger.warn(
                            `[Airtm] Retry attempt ${retryCount}/${DEFAULT_RETRY_OPTIONS.maxRetries}`,
                            error instanceof Error ? error.message : 'Unknown error',
                        );
                    },
                ],
                afterResponse: [
                    (_request, _options, response) => {
                        this.logger.debug(
                            `[Airtm] Response ${response.status} ${response.statusText}`,
                        );
                    },
                ],
            },
        });
    }

    /**
     * Makes a GET request to Airtm API.
     */
    protected async get<T>(path: string, options?: Options): Promise<T> {
        return this.request<T>('get', path, options);
    }

    /**
     * Makes a POST request to Airtm API.
     */
    protected async post<T>(path: string, body?: unknown, options?: Options): Promise<T> {
        return this.request<T>('post', path, { ...options, json: body });
    }

    /**
     * Makes a PUT request to Airtm API.
     */
    protected async put<T>(path: string, body?: unknown, options?: Options): Promise<T> {
        return this.request<T>('put', path, { ...options, json: body });
    }

    /**
     * Makes a DELETE request to Airtm API.
     */
    protected async delete<T>(path: string, options?: Options): Promise<T> {
        return this.request<T>('delete', path, options);
    }

    /**
     * Generic request method with error handling.
     */
    private async request<T>(
        method: 'get' | 'post' | 'put' | 'delete',
        path: string,
        options?: Options,
    ): Promise<T> {
        try {
            const response = await this.client[method](path, options);
            return await response.json<T>();
        } catch (error) {
            throw this.handleError(error, method, path);
        }
    }

    /**
     * Converts errors to AirtmProviderException.
     */
    private handleError(error: unknown, method: string, path: string): AirtmProviderException {
        // Log error with masked path
        const maskedPath = this.maskPath(path);
        this.logger.error(
            `[Airtm] ${method.toUpperCase()} ${maskedPath} failed`,
            error instanceof Error ? error.message : 'Unknown error',
        );

        // Extract status code from ky HTTPError
        let statusCode = 502; // Default to Bad Gateway
        let message = 'External provider error';

        if (error instanceof HTTPError) {
            statusCode = error.response.status;
            message = error.message;
        } else if (error instanceof Error) {
            // Check for timeout
            if (error.name === 'TimeoutError') {
                statusCode = 504;
                message = 'Request timed out';
            } else {
                message = error.message;
            }
        }

        return new AirtmProviderException(message, method, path, statusCode, error);
    }

    /**
     * Checks if error is a 404 Not Found.
     */
    protected isNotFoundError(error: unknown): boolean {
        if (error instanceof HTTPError && error.response.status === 404) {
            return true;
        }
        if (error instanceof AirtmProviderException) {
            const res = error.getResponse() as any;
            return res?.error?.details?.originalStatus === 404;
        }
        return false;
    }

    /**
     * Masks URL for safe logging (removes sensitive path segments).
     */
    private maskUrl(url: string): string {
        try {
            const parsed = new URL(url);
            return `${parsed.pathname}${parsed.search}`.replace(/[a-zA-Z0-9_-]{20,}/g, '***');
        } catch {
            return this.maskPath(url);
        }
    }

    /**
     * Masks path for safe logging.
     */
    private maskPath(path: string): string {
        return path.replace(/[a-zA-Z0-9_-]{20,}/g, '***');
    }

    /**
     * Masks an ID for safe logging (shows first/last 4 chars).
     */
    protected maskId(id: string): string {
        if (id.length <= 8) return '********';
        return `${id.slice(0, 4)}****${id.slice(-4)}`;
    }

    /**
     * Masks an email for safe logging.
     */
    protected maskEmail(email: string): string {
        const [local, domain] = email.split('@');
        if (!domain) return '***@***';
        const maskedLocal = local.length > 2 ? `${local.slice(0, 2)}***` : '***';
        return `${maskedLocal}@${domain}`;
    }
}
