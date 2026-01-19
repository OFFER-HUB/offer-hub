import { Injectable, Inject } from '@nestjs/common';
import { AirtmBaseClient } from './airtm-base.client';
import { AirtmConfig } from '../airtm.config';
import type { AirtmPayoutResponse } from '../types';
import type { AirtmCreatePayoutPayload, PayoutDestinationType } from '../dto';

/**
 * Parameters for creating a new payout (withdrawal).
 */
export interface CreatePayoutParams {
    /** Amount in decimal format (e.g., "100.00") */
    amount: string;

    /** Currency code (ISO 4217), defaults to "USD" */
    currency?: string;

    /** Airtm user ID of the source (who is withdrawing) */
    sourceUserId: string;

    /** Type of destination */
    destinationType: PayoutDestinationType;

    /** Destination reference (bank account, crypto address, etc.) */
    destinationRef: string;

    /**
     * If true, creates and commits in one step (trusted flow).
     * If false (default), requires a separate commit call.
     */
    commit?: boolean;

    /** Optional description */
    description?: string;

    /** Optional enterprise fee to charge */
    enterpriseFee?: string;
}

/**
 * Client for Airtm Payout API.
 * Handles withdrawal (balance to fiat/crypto) operations.
 */
@Injectable()
export class AirtmPayoutClient extends AirtmBaseClient {
    constructor(@Inject(AirtmConfig) config: AirtmConfig) {
        super(config, 'AirtmPayoutClient');
    }

    /**
     * Creates a new payout (withdrawal).
     *
     * By default, payouts are created in a two-step process:
     * 1. Create payout (reserves balance, validates destination)
     * 2. Commit payout (executes the transfer)
     *
     * For trusted workflows, set commit=true to execute in one step.
     *
     * @param params - Payout parameters
     * @returns Airtm payout response
     */
    async createPayout(params: CreatePayoutParams): Promise<AirtmPayoutResponse> {
        const amount = parseFloat(params.amount);

        if (isNaN(amount) || amount <= 0) {
            throw new Error(`Invalid amount: ${params.amount}`);
        }

        const payload: AirtmCreatePayoutPayload = {
            amount,
            currency: params.currency || 'USD',
            sourceUserId: params.sourceUserId,
            destinationType: params.destinationType,
            destinationRef: params.destinationRef,
            commit: params.commit,
            description: params.description,
        };

        // Add enterprise fee if provided
        if (params.enterpriseFee) {
            const fee = parseFloat(params.enterpriseFee);
            if (!isNaN(fee) && fee > 0) {
                payload.enterpriseFee = fee;
            }
        }

        this.logger.log(
            `Creating payout: amount=${params.amount}, user=${this.maskId(params.sourceUserId)}, ` +
            `dest=${params.destinationType}, commit=${params.commit ?? false}`,
        );

        const response = await this.post<AirtmPayoutResponse>('payouts', payload);

        this.logger.log(
            `Payout created: id=${response.id}, status=${response.status}, ` +
            `committed=${response.status !== 'CREATED'}`,
        );

        return response;
    }

    /**
     * Commits a previously created payout.
     *
     * This is step 2 of the two-step payout process.
     * The payout must be in CREATED status to be committed.
     *
     * @param payoutId - Airtm payout ID
     * @returns Updated payout details
     */
    async commitPayout(payoutId: string): Promise<AirtmPayoutResponse> {
        this.logger.log(`Committing payout: ${payoutId}`);

        const response = await this.post<AirtmPayoutResponse>(`payouts/${payoutId}/commit`);

        this.logger.log(`Payout committed: id=${payoutId}, status=${response.status}`);

        return response;
    }

    /**
     * Gets a payout by its Airtm ID.
     *
     * @param payoutId - Airtm payout ID
     * @returns Payout details
     */
    async getPayout(payoutId: string): Promise<AirtmPayoutResponse> {
        this.logger.debug(`Getting payout: ${payoutId}`);
        return this.get<AirtmPayoutResponse>(`payouts/${payoutId}`);
    }

    /**
     * Cancels a payout that has not been committed yet.
     *
     * The payout must be in CREATED status to be cancelled.
     *
     * @param payoutId - Airtm payout ID
     * @returns Updated payout details
     */
    async cancelPayout(payoutId: string): Promise<AirtmPayoutResponse> {
        this.logger.log(`Cancelling payout: ${payoutId}`);

        const response = await this.post<AirtmPayoutResponse>(`payouts/${payoutId}/cancel`);

        this.logger.log(`Payout cancelled: id=${payoutId}, status=${response.status}`);

        return response;
    }

    /**
     * Refreshes payout status from Airtm.
     * Use this when webhook may have been missed.
     *
     * @param payoutId - Airtm payout ID
     * @returns Updated payout details
     */
    async refreshPayoutStatus(payoutId: string): Promise<AirtmPayoutResponse> {
        this.logger.log(`Refreshing payout status: ${payoutId}`);
        return this.getPayout(payoutId);
    }

    /**
     * Creates and commits a payout in one step (convenience method).
     *
     * This is equivalent to calling createPayout with commit=true.
     *
     * @param params - Payout parameters (commit flag is ignored)
     * @returns Airtm payout response in COMMITTED or later status
     */
    async createAndCommitPayout(
        params: Omit<CreatePayoutParams, 'commit'>,
    ): Promise<AirtmPayoutResponse> {
        return this.createPayout({ ...params, commit: true });
    }
}
