import { Injectable, Logger } from '@nestjs/common';
import { TrustlessWorkConfig } from '../trustless-work.config';
import {
    TrustlessInitializeEscrowResponse,
    TrustlessSendTransactionResponse,
    TrustlessEscrowContract,
    TrustlessFundingResult,
    TrustlessReleaseResult,
    TrustlessRefundResult,
    mapTrustlessStatus,
} from '../types/trustless-work.types';
import { CreateEscrowDto } from '../dto/escrow.dto';
import { ReleaseDto, ReleaseMode } from '../dto/release.dto';
import { RefundDto, RefundMode } from '../dto/refund.dto';
import { DisputeResolutionDto } from '../dto/dispute-resolution.dto';
import { orchestratorToStellar, toStroops, ERROR_CODES } from '@offerhub/shared';
import Big from 'big.js';

/**
 * Trustless Work Escrow Client
 * Handles all escrow contract operations with Trustless Work API
 */
@Injectable()
export class EscrowClient {
    private readonly logger = new Logger(EscrowClient.name);
    private readonly baseUrl: string;
    private readonly headers: Record<string, string>;

    constructor(private readonly config: TrustlessWorkConfig) {
        this.baseUrl = config.apiUrl;
        this.headers = {
            'x-api-key': config.apiKey,
            'Content-Type': 'application/json',
        };
        this.logger.log(`Initialized Trustless Work escrow client: ${this.baseUrl}`);
    }

    /**
     * Create escrow contract (returns unsigned XDR for wallet signing)
     * Uses /deployer/single-release for single milestones or /deployer/multi-release for multiple
     *
     * IMPORTANT: This returns an unsigned XDR transaction that MUST be signed by the user's wallet
     * The signed XDR must then be submitted via sendTransaction()
     *
     * @param data Escrow creation data
     * @param signerAddress Stellar address of the wallet that will sign the transaction
     * @returns Unsigned XDR transaction and contract details
     */
    async createEscrow(
        data: CreateEscrowDto,
        signerAddress: string,
    ): Promise<TrustlessInitializeEscrowResponse> {
        try {
            this.logger.debug(`Creating escrow for order: ${data.order_id}`);

            // Validate milestone amounts if provided
            if (data.milestones && data.milestones.length > 0) {
                this.validateMilestoneAmounts(data.amount, data.milestones);
            }

            // Determine escrow type based on milestones
            const hasMilestones = data.milestones && data.milestones.length > 1;
            const escrowType = hasMilestones ? 'multi-release' : 'single-release';

            // Convert amounts to Stellar format (6 decimals) and then to stroops
            const amountStroops = parseInt(toStroops(orchestratorToStellar(data.amount)));

            // Build milestones according to Trustless Work schema
            const milestones = hasMilestones
                ? data.milestones?.map((m) => ({
                      description: m.title || 'Milestone',
                      amount: parseInt(toStroops(orchestratorToStellar(m.amount))),
                      receiver: data.seller_address,
                  }))
                : [
                      {
                          description:
                              (data.metadata as any)?.milestoneDescription ||
                              'Complete delivery of service',
                      },
                  ];

            // Build payload according to Trustless Work API schema
            const payload: any = {
                signer: signerAddress, // Wallet address that will sign the transaction
                engagementId: data.order_id,
                title: (data.metadata as any)?.title || `Escrow for order ${data.order_id}`,
                description:
                    (data.metadata as any)?.description ||
                    'Escrow contract created via OFFER-HUB Orchestrator',
                roles: {
                    approver: data.buyer_address, // Buyer approves work
                    serviceProvider: data.seller_address, // Seller provides service
                    platformAddress: signerAddress, // Platform receives fees (must have USDC trustline!)
                    releaseSigner: data.buyer_address, // Buyer releases funds
                    disputeResolver: data.buyer_address, // Buyer resolves disputes
                    receiver: data.seller_address, // Seller receives funds
                },
                amount: amountStroops,
                platformFee: (data.metadata as any)?.platformFee || 5, // Platform fee percentage (must be > 0)
                milestones: milestones,
                trustline: {
                    address: this.config.stellarUsdcIssuer,
                    symbol: 'USDC',
                },
            };

            // Use correct Trustless Work endpoint
            const endpoint = `/deployer/${escrowType}`;
            const response = await this.post<TrustlessInitializeEscrowResponse>(
                endpoint,
                payload,
            );

            this.logger.log(
                `Escrow contract (${escrowType}) deployment initiated for order ${data.order_id}`,
            );

            if (!response.unsignedTransaction) {
                throw new Error('No unsigned transaction received from Trustless Work API');
            }

            return response;
        } catch (error: any) {
            this.logger.error(`Failed to create escrow for order ${data.order_id}:`, error);
            throw this.handleApiError(error);
        }
    }

    /**
     * Send signed transaction to Stellar network via Trustless Work
     *
     * @param signedXdr XDR transaction signed by user's wallet
     * @returns Transaction submission result
     */
    async sendTransaction(signedXdr: string): Promise<TrustlessSendTransactionResponse> {
        try {
            this.logger.debug('Submitting signed transaction to Stellar');

            const response = await this.post<TrustlessSendTransactionResponse>(
                '/helper/send-transaction',
                {
                    signedXdr,
                },
            );

            if (response.status === 'SUCCESS') {
                this.logger.log('Transaction submitted successfully to Stellar');
            } else {
                this.logger.error('Transaction submission failed:', response.message);
            }

            return response;
        } catch (error: any) {
            this.logger.error('Failed to send transaction:', error);
            throw this.handleApiError(error);
        }
    }

    /**
     * Get escrow contract by ID
     */
    async getEscrow(contractId: string): Promise<TrustlessEscrowContract> {
        try {
            this.logger.debug(`Fetching escrow: ${contractId}`);

            const response = await this.get<TrustlessEscrowContract>(`/escrow/${contractId}`);

            return response;
        } catch (error: any) {
            this.logger.error(`Failed to fetch escrow ${contractId}:`, error);
            throw this.handleApiError(error);
        }
    }

    /**
     * Fund escrow contract
     * Uses /escrow/{type}/fund-escrow endpoint
     */
    async fundEscrow(contractId: string, amount: string, escrowType: 'single-release' | 'multi-release' = 'single-release'): Promise<TrustlessFundingResult> {
        try {
            this.logger.debug(`Funding escrow: ${contractId} with ${amount}`);

            // Convert amount to stroops
            const amountStroops = toStroops(orchestratorToStellar(amount));

            const payload = {
                contractId,
                amount: amountStroops,
                currency: 'USDC',
            };

            const response = await this.post<TrustlessFundingResult>(
                `/escrow/${escrowType}/fund-escrow`,
                payload,
            );

            this.logger.log(
                `Escrow ${contractId} funded successfully. Tx: ${response.transaction_hash}`,
            );

            return response;
        } catch (error: any) {
            this.logger.error(`Failed to fund escrow ${contractId}:`, error);
            throw this.handleApiError(error);
        }
    }

    /**
     * Release escrow funds (full or partial)
     * Uses /escrow/{type}/release-funds or /escrow/{type}/release-milestone-funds
     */
    async releaseEscrow(
        contractId: string,
        data: ReleaseDto,
        escrowType: 'single-release' | 'multi-release' = 'single-release',
    ): Promise<TrustlessReleaseResult> {
        try {
            this.logger.debug(`Releasing escrow: ${contractId}`, data);

            const payload: any = {
                contractId,
                mode: data.mode,
                reason: data.reason,
            };

            if (data.mode === ReleaseMode.PARTIAL && data.amount) {
                payload.amount = toStroops(orchestratorToStellar(data.amount));
            }

            // Use milestone-specific endpoint if milestone_ref is provided
            const endpoint = data.milestone_ref
                ? `/escrow/${escrowType}/release-milestone-funds`
                : `/escrow/${escrowType}/release-funds`;

            if (data.milestone_ref) {
                payload.milestoneRef = data.milestone_ref;
            }

            const response = await this.post<TrustlessReleaseResult>(endpoint, payload);

            this.logger.log(
                `Escrow ${contractId} release initiated. Tx: ${response.transaction_hash}`,
            );

            return response;
        } catch (error: any) {
            this.logger.error(`Failed to release escrow ${contractId}:`, error);
            throw this.handleApiError(error);
        }
    }

    /**
     * Refund escrow funds (full or partial)
     */
    async refundEscrow(contractId: string, data: RefundDto): Promise<TrustlessRefundResult> {
        try {
            this.logger.debug(`Refunding escrow: ${contractId}`, data);

            const payload: any = {
                mode: data.mode,
                reason: data.reason,
            };

            if (data.mode === RefundMode.PARTIAL && data.amount) {
                payload.amount = toStroops(orchestratorToStellar(data.amount));
            }

            const response = await this.post<TrustlessRefundResult>(
                `/escrow/${contractId}/refund`,
                payload,
            );

            this.logger.log(
                `Escrow ${contractId} refund initiated. Tx: ${response.transaction_hash}`,
            );

            return response;
        } catch (error: any) {
            this.logger.error(`Failed to refund escrow ${contractId}:`, error);
            throw this.handleApiError(error);
        }
    }

    /**
     * Resolve dispute with split decision
     * Uses /escrow/{type}/resolve-dispute endpoint
     */
    async resolveDispute(
        contractId: string,
        resolution: DisputeResolutionDto,
        escrowType: 'single-release' | 'multi-release' = 'single-release',
    ): Promise<{ success: boolean; transaction_hash: string }> {
        try {
            this.logger.debug(`Resolving dispute for escrow: ${contractId}`, resolution);

            // Convert amounts to stroops
            const releaseAmountStroops = toStroops(
                orchestratorToStellar(resolution.release_amount),
            );
            const refundAmountStroops = toStroops(orchestratorToStellar(resolution.refund_amount));

            const payload = {
                contractId,
                releaseAmount: releaseAmountStroops,
                refundAmount: refundAmountStroops,
            };

            const response = await this.post<{ success: boolean; transaction_hash: string }>(
                `/escrow/${escrowType}/resolve-dispute`,
                payload,
            );

            this.logger.log(
                `Dispute resolved for escrow ${contractId}. Tx: ${response.transaction_hash}`,
            );

            return response;
        } catch (error: any) {
            this.logger.error(`Failed to resolve dispute for escrow ${contractId}:`, error);
            throw this.handleApiError(error);
        }
    }

    /**
     * Complete a milestone
     */
    async completeMilestone(contractId: string, milestoneRef: string): Promise<void> {
        try {
            this.logger.debug(`Completing milestone ${milestoneRef} for escrow: ${contractId}`);

            await this.post(`/escrow/${contractId}/milestones/${milestoneRef}/complete`, {});

            this.logger.log(`Milestone ${milestoneRef} completed for escrow ${contractId}`);
        } catch (error: any) {
            this.logger.error(
                `Failed to complete milestone ${milestoneRef} for escrow ${contractId}:`,
                error,
            );
            throw this.handleApiError(error);
        }
    }

    /**
     * Validate that milestone amounts sum to total escrow amount
     */
    private validateMilestoneAmounts(
        totalAmount: string,
        milestones: Array<{ amount: string }>,
    ): void {
        const total = new Big(totalAmount);
        let sum = new Big(0);

        for (const milestone of milestones) {
            sum = sum.plus(milestone.amount);
        }

        if (!sum.eq(total)) {
            throw new Error(
                `Milestone amounts (${sum.toFixed(2)}) do not sum to total escrow amount (${totalAmount})`,
            );
        }
    }

    /**
     * HTTP GET request
     */
    private async get<T>(path: string): Promise<T> {
        const url = `${this.baseUrl}${path}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.config.timeout);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers,
                signal: controller.signal,
            });

            clearTimeout(timeout);

            if (!response.ok) {
                throw await this.handleHttpError(response);
            }

            return await response.json();
        } catch (error: any) {
            clearTimeout(timeout);
            throw error;
        }
    }

    /**
     * HTTP POST request
     */
    private async post<T>(path: string, body: any): Promise<T> {
        const url = `${this.baseUrl}${path}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.config.timeout);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(body),
                signal: controller.signal,
            });

            clearTimeout(timeout);

            if (!response.ok) {
                throw await this.handleHttpError(response);
            }

            return await response.json();
        } catch (error: any) {
            clearTimeout(timeout);
            throw error;
        }
    }

    /**
     * Handle HTTP error responses
     */
    private async handleHttpError(response: Response): Promise<Error> {
        const body = await response.json().catch(() => ({}));

        let code: string = ERROR_CODES.PROVIDER_ERROR;
        let message = `Trustless Work API error: ${response.status}`;

        if (response.status === 404) {
            code = ERROR_CODES.ESCROW_NOT_FOUND;
            message = 'Escrow contract not found';
        } else if (response.status === 409) {
            code = ERROR_CODES.ESCROW_ALREADY_FUNDED;
            message = body.message ?? 'Escrow contract already funded';
        } else if (response.status === 422) {
            code = ERROR_CODES.ESCROW_INSUFFICIENT_FUNDS;
            message = body.message ?? 'Invalid escrow operation';
        } else if (response.status === 503) {
            code = ERROR_CODES.PROVIDER_UNAVAILABLE;
            message = 'Trustless Work temporarily unavailable';
        }

        const error = new Error(message);
        (error as any).code = code;
        (error as any).statusCode = response.status;
        (error as any).details = body;

        return error;
    }

    /**
     * Handle general API errors
     */
    private handleApiError(error: any): Error {
        if (error.name === 'AbortError') {
            const timeoutError = new Error('Trustless Work API timeout');
            (timeoutError as any).code = ERROR_CODES.PROVIDER_TIMEOUT;
            return timeoutError;
        }

        if (error.code && typeof error.code === 'string') {
            return error;
        }

        const providerError = new Error(`Trustless Work API error: ${error.message}`);
        (providerError as any).code = ERROR_CODES.PROVIDER_ERROR;
        return providerError;
    }
}
