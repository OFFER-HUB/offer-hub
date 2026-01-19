import { Injectable } from '@nestjs/common';

/**
 * Trustless Work configuration
 * Validates required environment variables at startup
 */
@Injectable()
export class TrustlessWorkConfig {
    // Trustless Work API
    readonly apiKey: string;
    readonly apiUrl: string;
    readonly webhookSecret: string;
    readonly timeout: number;

    // Stellar Configuration
    readonly stellarNetwork: 'testnet' | 'mainnet';
    readonly stellarHorizonUrl: string;
    readonly stellarUsdcAssetCode: string;
    readonly stellarUsdcIssuer: string;

    constructor() {
        // Trustless Work API
        this.apiKey = this.getRequiredEnv('TRUSTLESS_API_KEY');
        this.apiUrl = this.getEnv('TRUSTLESS_API_URL', 'https://api.trustlesswork.com/v1');
        this.webhookSecret = this.getRequiredEnv('TRUSTLESS_WEBHOOK_SECRET');
        this.timeout = parseInt(this.getEnv('TRUSTLESS_TIMEOUT_MS', '60000'), 10);

        // Stellar Configuration
        const network = this.getEnv('STELLAR_NETWORK', 'testnet');
        if (network !== 'testnet' && network !== 'mainnet') {
            throw new Error('STELLAR_NETWORK must be "testnet" or "mainnet"');
        }
        this.stellarNetwork = network;

        this.stellarHorizonUrl = this.getEnv(
            'STELLAR_HORIZON_URL',
            network === 'testnet'
                ? 'https://horizon-testnet.stellar.org'
                : 'https://horizon.stellar.org',
        );

        this.stellarUsdcAssetCode = this.getEnv('STELLAR_USDC_ASSET_CODE', 'USDC');

        // Default to testnet USDC issuer if not provided
        this.stellarUsdcIssuer = this.getEnv(
            'STELLAR_USDC_ISSUER',
            'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5', // Testnet USDC issuer
        );

        this.validate();
    }

    private getEnv(key: string, defaultValue: string): string {
        return process.env[key] ?? defaultValue;
    }

    private getRequiredEnv(key: string): string {
        const value = process.env[key];
        if (!value) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
        return value;
    }

    private validate(): void {
        // Validate API key format (format: {id}.{secret})
        if (!this.apiKey.includes('.') || this.apiKey.split('.').length !== 2) {
            console.warn(
                'TRUSTLESS_API_KEY format may be invalid - expected format: {id}.{secret}',
            );
        }

        // Validate webhook secret format
        if (!this.webhookSecret.startsWith('tw_whsec_')) {
            console.warn(
                'TRUSTLESS_WEBHOOK_SECRET does not start with "tw_whsec_" - this may not be a valid webhook secret',
            );
        }

        // Validate timeout
        if (this.timeout < 1000 || this.timeout > 120000) {
            throw new Error('TRUSTLESS_TIMEOUT_MS must be between 1000 and 120000');
        }

        // Validate Stellar Horizon URL
        if (!this.stellarHorizonUrl.startsWith('https://')) {
            throw new Error('STELLAR_HORIZON_URL must start with https://');
        }

        // Validate USDC issuer format (Stellar public key: G...)
        if (!this.stellarUsdcIssuer.startsWith('G') || this.stellarUsdcIssuer.length !== 56) {
            throw new Error(
                'STELLAR_USDC_ISSUER must be a valid Stellar public key (starts with G, 56 characters)',
            );
        }
    }

    /**
     * Check if running on Stellar mainnet (production)
     */
    isMainnet(): boolean {
        return this.stellarNetwork === 'mainnet';
    }

    /**
     * Check if running on Stellar testnet (development)
     */
    isTestnet(): boolean {
        return this.stellarNetwork === 'testnet';
    }
}
