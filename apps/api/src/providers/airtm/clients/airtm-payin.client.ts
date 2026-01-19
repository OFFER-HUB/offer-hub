import { Injectable, Inject } from '@nestjs/common';
import { AirtmBaseClient } from './airtm-base.client';
import { AirtmConfig } from '../airtm.config';
import { generateTopupId } from '@offerhub/shared';
import type { AirtmPayinResponse } from '../types';
import type { AirtmCreatePayinPayload } from '../dto';

/**
 * Parameters for creating a new payin (top-up).
 */
export interface CreatePayinParams {
    /** Amount in decimal format (e.g., "100.00") */
    amount: string;

    /** Currency code (ISO 4217), defaults to "USD" */
    currency?: string;

    /** Airtm user ID of the recipient */
    destinationUserId: string;

    /** Optional description */
    description?: string;

    /** Base URL for confirmation redirect */
    confirmationBaseUrl?: string;

    /** Base URL for cancellation redirect */
    cancellationBaseUrl?: string;
}

/**
 * Client for Airtm Payin API.
 * Handles top-up (fiat to balance) operations.
 */
@Injectable()
export class AirtmPayinClient extends AirtmBaseClient {
    constructor(@Inject(AirtmConfig) config: AirtmConfig) {
        super(config, 'AirtmPayinClient');
    }

    /**
     * Creates a new payin (top-up).
     *
     * Generates a unique code with 'topup_' prefix using nanoid.
     * The payin will be in CREATED status and user must confirm via confirmationUri.
     *
     * @param params - Payin parameters
     * @returns Airtm payin response with confirmationUri
     */
    async createPayin(params: CreatePayinParams): Promise<AirtmPayinResponse> {
        const code = generateTopupId();
        const amount = parseFloat(params.amount);

        if (isNaN(amount) || amount <= 0) {
            throw new Error(`Invalid amount: ${params.amount}`);
        }

        const payload: AirtmCreatePayinPayload = {
            amount,
            currency: params.currency || 'USD',
            code,
            destinationUserId: params.destinationUserId,
            description: params.description,
        };

        // Add confirmation/cancellation URIs if provided
        if (params.confirmationBaseUrl) {
            payload.confirmationUri = `${params.confirmationBaseUrl}?code=${code}&status=confirmed`;
        }
        if (params.cancellationBaseUrl) {
            payload.cancellationUri = `${params.cancellationBaseUrl}?code=${code}&status=cancelled`;
        }

        this.logger.log(
            `Creating payin: code=${code}, amount=${params.amount}, user=${this.maskId(params.destinationUserId)}`,
        );

        const response = await this.post<AirtmPayinResponse>('payins', payload);

        this.logger.log(
            `Payin created: airtmId=${response.id}, code=${code}, status=${response.status}`,
        );

        return response;
    }

    /**
     * Gets a payin by its Airtm ID.
     *
     * @param payinId - Airtm payin ID
     * @returns Payin details
     */
    async getPayin(payinId: string): Promise<AirtmPayinResponse> {
        this.logger.debug(`Getting payin: ${payinId}`);
        return this.get<AirtmPayinResponse>(`payins/${payinId}`);
    }

    /**
     * Gets a payin by its internal code (topup_xxx).
     *
     * @param code - Internal code (topup_xxx)
     * @returns Payin details
     */
    async getPayinByCode(code: string): Promise<AirtmPayinResponse> {
        this.logger.debug(`Getting payin by code: ${code}`);
        return this.get<AirtmPayinResponse>(`payins/by-code/${encodeURIComponent(code)}`);
    }

    /**
     * Refreshes payin status from Airtm.
     * Use this when webhook may have been missed.
     *
     * @param payinId - Airtm payin ID
     * @returns Updated payin details
     */
    async refreshPayinStatus(payinId: string): Promise<AirtmPayinResponse> {
        this.logger.log(`Refreshing payin status: ${payinId}`);
        return this.getPayin(payinId);
    }

    /**
     * Cancels a payin that is in AWAITING_USER_CONFIRMATION status.
     * Note: This may not be supported by all Airtm configurations.
     *
     * @param payinId - Airtm payin ID
     * @returns Updated payin details
     */
    async cancelPayin(payinId: string): Promise<AirtmPayinResponse> {
        this.logger.log(`Cancelling payin: ${payinId}`);
        return this.post<AirtmPayinResponse>(`payins/${payinId}/cancel`);
    }
}
