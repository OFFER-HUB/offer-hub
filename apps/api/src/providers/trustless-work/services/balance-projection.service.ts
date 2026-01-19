import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../../../modules/database/prisma.service';
import { WalletClient } from '../clients/wallet.client';
import { ProjectedBalance } from '../types/trustless-work.types';
import { fromStroops, stellarToOrchestrator } from '@offerhub/shared';
import { EscrowStatus } from '@offerhub/shared';
import Big from 'big.js';

/**
 * Balance Projection Service
 * Calculates user balance across Airtm (available + reserved) and on-chain escrow
 *
 * Formula: Total = Airtm Available + Airtm Reserved + On-Chain Escrow
 */
@Injectable()
export class BalanceProjectionService {
    private readonly logger = new Logger(BalanceProjectionService.name);

    constructor(
        @Inject(PrismaService) private readonly prisma: PrismaService,
        @Inject(WalletClient) private readonly walletClient: WalletClient,
    ) {}

    /**
     * Project user balance across all sources
     * @param userId User ID
     * @returns Projected balance with breakdown
     */
    async projectUserBalance(userId: string): Promise<ProjectedBalance> {
        this.logger.debug(`Projecting balance for user: ${userId}`);

        // 1. Get Airtm balance (available + reserved)
        const balance = await this.prisma.balance.findUnique({
            where: { userId },
        });

        const airtmAvailable = balance?.available ?? '0.00';
        const airtmReserved = balance?.reserved ?? '0.00';

        // 2. Calculate on-chain escrow balance
        // Query all FUNDED escrows where user is buyer (funds locked on-chain)
        const escrows = await this.prisma.escrow.findMany({
            where: {
                order: {
                    buyerId: userId,
                },
                status: EscrowStatus.FUNDED,
            },
        });

        let onChainTotal = new Big(0);
        for (const escrow of escrows) {
            // escrow.amount is in Orchestrator format (2 decimals)
            onChainTotal = onChainTotal.plus(escrow.amount);
        }

        const onChain = onChainTotal.toFixed(2);

        // 3. Calculate total
        const total = new Big(airtmAvailable)
            .plus(airtmReserved)
            .plus(onChain)
            .toFixed(2);

        const result: ProjectedBalance = {
            available: airtmAvailable,
            reserved: airtmReserved,
            on_chain: onChain,
            total,
            currency: 'USDC',
            last_updated: new Date().toISOString(),
        };

        this.logger.debug(`Projected balance for ${userId}:`, result);

        return result;
    }

    /**
     * Get on-chain balance for a specific Stellar address
     * @param address Stellar public key (G...)
     * @returns USDC balance in Orchestrator format (2 decimals)
     */
    async getOnChainBalance(address: string): Promise<string> {
        const walletBalance = await this.walletClient.getWalletBalance(address);

        // Convert stroops to decimal (6 places), then to Orchestrator format (2 places)
        const stellarAmount = fromStroops(walletBalance.usdc_balance);
        const orchestratorAmount = stellarToOrchestrator(stellarAmount);

        return orchestratorAmount;
    }

    /**
     * Verify balance consistency for a user
     * Checks if projected balance matches actual on-chain + Airtm balance
     * Used by reconciliation workers
     */
    async verifyBalanceConsistency(userId: string): Promise<{
        consistent: boolean;
        projected: ProjectedBalance;
        discrepancy?: string;
    }> {
        const projected = await this.projectUserBalance(userId);

        // Get user's Stellar address (if linked)
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { stellarAddress: true },
        });

        if (!user?.stellarAddress) {
            return {
                consistent: true,
                projected,
            };
        }

        // Get actual on-chain balance
        const actualOnChain = await this.getOnChainBalance(user.stellarAddress);

        // Compare
        const expectedOnChain = new Big(projected.on_chain);
        const actualOnChainBig = new Big(actualOnChain);
        const difference = actualOnChainBig.minus(expectedOnChain).abs();

        // Allow 0.01 USDC tolerance for rounding
        const consistent = difference.lte(0.01);

        if (!consistent) {
            this.logger.warn(
                `Balance discrepancy for user ${userId}: expected ${projected.on_chain}, actual ${actualOnChain}`,
            );
            return {
                consistent: false,
                projected,
                discrepancy: `Expected on-chain: ${projected.on_chain}, Actual: ${actualOnChain}`,
            };
        }

        return {
            consistent: true,
            projected,
        };
    }
}
