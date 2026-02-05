import { createRequire } from 'module';
import type { CliConfig } from './config.js';

const require = createRequire(import.meta.url);
const { OfferHubSDK } = require('@offerhub/sdk');

/**
 * Create SDK client from CLI config
 */
export function createClient(config: CliConfig): any {
    return new OfferHubSDK({
        apiUrl: config.apiUrl,
        apiKey: config.apiKey,
    });
}

/**
 * Make a direct HTTP request to the API
 * Use this for endpoints not yet in the SDK
 */
export async function makeRequest<T>(
    config: CliConfig,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: any,
): Promise<T> {
    const url = `${config.apiUrl}/${path}`;
    const headers: Record<string, string> = {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
    };

    const options: RequestInit = {
        method,
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
            const errorData = await response.json();
            if (errorData.error?.message) {
                errorMessage = errorData.error.message;
            }
        } catch {
            // Ignore JSON parse error
        }
        throw new Error(errorMessage);
    }

    return response.json();
}
