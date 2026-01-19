import { Injectable, Logger } from '@nestjs/common';
import type { AirtmEnvironment } from './types';

/**
 * Configuration service for Airtm integration.
 * Validates required environment variables on instantiation.
 */
@Injectable()
export class AirtmConfig {
    private readonly logger = new Logger(AirtmConfig.name);

    readonly environment: AirtmEnvironment;
    readonly apiKey: string;
    readonly apiSecret: string;
    readonly webhookSecret: string;

    constructor() {
        this.environment = (process.env.AIRTM_ENV as AirtmEnvironment) || 'sandbox';
        this.apiKey = process.env.AIRTM_API_KEY || '';
        this.apiSecret = process.env.AIRTM_API_SECRET || '';
        this.webhookSecret = process.env.AIRTM_WEBHOOK_SECRET || '';

        this.validate();
        this.logConfiguration();
    }

    /**
     * Returns the base URL for Airtm API based on environment.
     */
    get baseUrl(): string {
        return this.environment === 'production'
            ? 'https://enterprise.airtm.io/api/v2'
            : 'https://sandbox-enterprise.airtm.io/api/v2';
    }

    /**
     * Returns the Basic Auth header value (base64 encoded credentials).
     * Format: Basic base64(API_KEY:API_SECRET)
     */
    get basicAuthHeader(): string {
        const credentials = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64');
        return `Basic ${credentials}`;
    }

    /**
     * Validates that all required environment variables are present.
     * Throws an error immediately if any are missing (fail fast).
     */
    private validate(): void {
        const missingVars: string[] = [];

        if (!this.apiKey) {
            missingVars.push('AIRTM_API_KEY');
        }
        if (!this.apiSecret) {
            missingVars.push('AIRTM_API_SECRET');
        }
        if (!this.webhookSecret) {
            missingVars.push('AIRTM_WEBHOOK_SECRET');
        }

        if (missingVars.length > 0) {
            const errorMsg = `Missing required Airtm environment variables: ${missingVars.join(', ')}`;
            this.logger.error(errorMsg);
            throw new Error(errorMsg);
        }
    }

    /**
     * Logs configuration (with masked secrets) for debugging.
     */
    private logConfiguration(): void {
        this.logger.log(`Airtm configured for environment: ${this.environment}`);
        this.logger.debug(`Airtm API Key: ${this.maskSecret(this.apiKey)}`);
        this.logger.debug(`Airtm Base URL: ${this.baseUrl}`);
    }

    /**
     * Masks a secret for safe logging.
     * Shows only first 4 and last 4 characters.
     */
    private maskSecret(secret: string): string {
        if (secret.length <= 8) {
            return '********';
        }
        return `${secret.slice(0, 4)}****${secret.slice(-4)}`;
    }
}
