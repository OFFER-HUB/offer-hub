import { Injectable, Inject, Logger } from '@nestjs/common';
import { Horizon } from '@stellar/stellar-sdk';
import { TrustlessWorkConfig } from '../trustless-work.config';
import { StellarWalletBalance } from '../types/trustless-work.types';
import { ERROR_CODES } from '@offerhub/shared';

/**
 * Stellar Wallet Client
 * Queries Stellar Horizon API for wallet balances
 */
@Injectable()
export class WalletClient {
    private readonly logger = new Logger(WalletClient.name);
    private readonly server: Horizon.Server;

    constructor(@Inject(TrustlessWorkConfig) private readonly config: TrustlessWorkConfig) {
        this.server = new Horizon.Server(config.stellarHorizonUrl);
        this.logger.log(
            `Initialized Stellar wallet client for ${config.stellarNetwork} network`,
        );
    }

    /**
     * Get wallet balance for a Stellar address
     * @param address Stellar public key (G...)
     * @returns Wallet balance with USDC and native XLM
     */
    async getWalletBalance(address: string): Promise<StellarWalletBalance> {
        try {
            this.logger.debug(`Fetching balance for address: ${address}`);

            const account = await this.server.loadAccount(address);

            // Find USDC balance
            const usdcBalance = account.balances.find(
                (b) =>
                    'asset_code' in b &&
                    b.asset_code === this.config.stellarUsdcAssetCode &&
                    'asset_issuer' in b &&
                    b.asset_issuer === this.config.stellarUsdcIssuer,
            );

            // Find native XLM balance
            const nativeBalance = account.balances.find((b) => b.asset_type === 'native');

            const usdcBalanceStroops = usdcBalance
                ? this.decimalToStroops(usdcBalance.balance)
                : '0';
            const nativeBalanceStroops = nativeBalance
                ? this.decimalToStroops(nativeBalance.balance)
                : '0';

            this.logger.debug(
                `Balance for ${address}: ${usdcBalanceStroops} stroops USDC, ${nativeBalanceStroops} stroops XLM`,
            );

            return {
                address,
                usdc_balance: usdcBalanceStroops,
                native_balance: nativeBalanceStroops,
            };
        } catch (error: any) {
            this.logger.error(`Failed to fetch balance for ${address}:`, error);

            if (error.response?.status === 404) {
                // Account not found - return zero balance
                this.logger.warn(`Account ${address} not found on Stellar network`);
                return {
                    address,
                    usdc_balance: '0',
                    native_balance: '0',
                };
            }

            throw this.handleStellarError(error);
        }
    }

    /**
     * Check if a Stellar account exists
     */
    async accountExists(address: string): Promise<boolean> {
        try {
            await this.server.loadAccount(address);
            return true;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return false;
            }
            throw this.handleStellarError(error);
        }
    }

    /**
     * Verify a transaction hash on Stellar
     */
    async verifyTransaction(transactionHash: string): Promise<boolean> {
        try {
            this.logger.debug(`Verifying transaction: ${transactionHash}`);
            const transaction = await this.server.transactions().transaction(transactionHash).call();
            return transaction.successful;
        } catch (error: any) {
            this.logger.error(`Failed to verify transaction ${transactionHash}:`, error);
            if (error.response?.status === 404) {
                return false;
            }
            throw this.handleStellarError(error);
        }
    }

    /**
     * Convert Stellar decimal balance to stroops (smallest unit)
     * Stellar Horizon returns balances as decimal strings (e.g., "100.0000000")
     */
    private decimalToStroops(balance: string): string {
        const num = parseFloat(balance);
        const stroops = Math.floor(num * 1_000_000);
        return stroops.toString();
    }

    /**
     * Handle Stellar network errors and map to internal error codes
     */
    private handleStellarError(error: any): Error {
        const errorObj = new Error(`Stellar network error: ${error.message}`);
        (errorObj as any).code = ERROR_CODES.STELLAR_NETWORK_ERROR;
        return errorObj;
    }
}
