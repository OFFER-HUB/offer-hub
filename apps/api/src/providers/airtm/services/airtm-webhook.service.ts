import { Injectable, Inject, Logger } from '@nestjs/common';
import { Webhook } from 'svix';
import { PrismaService } from '../../../modules/database/prisma.service';
import { AirtmConfig } from '../airtm.config';
import {
    Provider,
    WebhookStatus,
    TopUpStatus,
    WithdrawalStatus,
    TopUpStateMachine,
    WithdrawalStateMachine,
} from '@offerhub/shared';
import { AirtmWebhookSignatureException } from '../exceptions';
import {
    mapPayinWebhookEventToStatus,
    mapPayoutWebhookEventToStatus,
    isPayinEvent,
    isPayoutEvent,
    isTerminalPayinStatus,
    isTerminalPayoutStatus,
} from '../mappers';
import type {
    AirtmWebhookPayload,
    AirtmWebhookEventType,
    SvixWebhookHeaders,
} from '../types';
import type { WebhookProcessResult, SanitizedWebhookPayload } from '../dto';

/**
 * Service for processing Airtm webhooks.
 * Handles signature verification, deduplication, and status updates.
 *
 * Note: Webhook signature verification is optional and can be disabled
 * if AIRTM_WEBHOOK_SECRET is not configured (useful for development).
 */
@Injectable()
export class AirtmWebhookService {
    private readonly logger = new Logger(AirtmWebhookService.name);
    private readonly svixWebhook: Webhook | null;

    constructor(
        @Inject(AirtmConfig) private readonly config: AirtmConfig,
        @Inject(PrismaService) private readonly prisma: PrismaService,
    ) {
        // Only initialize Svix if webhook secret is configured
        if (this.config.isWebhookVerificationEnabled) {
            this.svixWebhook = new Webhook(this.config.webhookSecret);
            this.logger.log('Webhook signature verification enabled');
        } else {
            this.svixWebhook = null;
            this.logger.warn(
                'Webhook signature verification DISABLED - all webhooks will be accepted without verification',
            );
        }
    }

    /**
     * Verifies the webhook signature using Svix HMAC-SHA256.
     *
     * If webhook secret is not configured, verification is skipped and
     * the raw body is parsed directly (useful for development/testing).
     *
     * @param rawBody - Raw request body as string
     * @param headers - Svix headers (svix-id, svix-timestamp, svix-signature)
     * @returns Parsed and verified webhook payload
     * @throws AirtmWebhookSignatureException if signature is invalid (when verification is enabled)
     */
    verifySignature(rawBody: string, headers: SvixWebhookHeaders): AirtmWebhookPayload {
        // If webhook verification is disabled, parse directly without verification
        if (!this.svixWebhook) {
            this.logger.warn(`Webhook verification skipped (disabled): ${headers['svix-id']}`);
            try {
                return JSON.parse(rawBody) as AirtmWebhookPayload;
            } catch {
                throw new AirtmWebhookSignatureException(headers['svix-id']);
            }
        }

        try {
            const payload = this.svixWebhook.verify(rawBody, headers) as AirtmWebhookPayload;
            this.logger.debug(`Webhook signature verified: ${headers['svix-id']}`);
            return payload;
        } catch (error) {
            this.logger.warn(
                `Invalid webhook signature: svixId=${headers['svix-id']}`,
                error instanceof Error ? error.message : 'Unknown error',
            );
            throw new AirtmWebhookSignatureException(headers['svix-id']);
        }
    }

    /**
     * Processes a verified webhook event.
     *
     * Flow:
     * 1. Check for duplicate (by provider + eventId)
     * 2. Create WebhookEvent record with RECEIVED status
     * 3. Process event based on type (update TopUp or Withdrawal)
     * 4. Mark WebhookEvent as PROCESSED
     *
     * @param payload - Verified webhook payload
     * @returns Processing result
     */
    async processEvent(payload: AirtmWebhookPayload): Promise<WebhookProcessResult> {
        const { eventId, eventType, data } = payload;

        this.logger.log(`Processing webhook: eventId=${eventId}, type=${eventType}`);

        // 1. Check for duplicate
        const existing = await this.prisma.webhookEvent.findUnique({
            where: {
                provider_providerEventId: {
                    provider: Provider.AIRTM,
                    providerEventId: eventId,
                },
            },
        });

        if (existing) {
            this.logger.debug(`Duplicate webhook ignored: ${eventId}`);
            return {
                success: true,
                duplicate: true,
                eventId,
                eventType,
            };
        }

        // 2. Create webhook event record
        const sanitizedPayload = this.sanitizePayload(payload);
        const webhookEvent = await this.prisma.webhookEvent.create({
            data: {
                provider: Provider.AIRTM,
                providerEventId: eventId,
                status: WebhookStatus.RECEIVED,
                payload: JSON.parse(JSON.stringify(sanitizedPayload)),
            },
        });

        // 3. Process event based on type
        try {
            let result: WebhookProcessResult;

            if (isPayinEvent(eventType)) {
                result = await this.handlePayinEvent(eventType, data);
            } else if (isPayoutEvent(eventType)) {
                result = await this.handlePayoutEvent(eventType, data);
            } else {
                this.logger.warn(`Unknown event type: ${eventType}`);
                result = {
                    success: true,
                    duplicate: false,
                    eventId,
                    eventType,
                };
            }

            // 4. Mark as processed
            await this.prisma.webhookEvent.update({
                where: { id: webhookEvent.id },
                data: {
                    status: WebhookStatus.PROCESSED,
                    processedAt: new Date(),
                },
            });

            return result;
        } catch (error) {
            this.logger.error(
                `Failed to process webhook ${eventId}`,
                error instanceof Error ? error.message : 'Unknown error',
            );

            // Mark as failed
            await this.prisma.webhookEvent.update({
                where: { id: webhookEvent.id },
                data: { status: WebhookStatus.FAILED },
            });

            return {
                success: false,
                duplicate: false,
                eventId,
                eventType,
                error: error instanceof Error ? error.message : 'Processing failed',
            };
        }
    }

    /**
     * Handles payin (top-up) webhook events.
     */
    private async handlePayinEvent(
        eventType: AirtmWebhookEventType,
        data: AirtmWebhookPayload['data'],
    ): Promise<WebhookProcessResult> {
        const airtmPayinId = data.id;
        const newStatus = mapPayinWebhookEventToStatus(eventType);

        if (!newStatus) {
            this.logger.warn(`No status mapping for event type: ${eventType}`);
            return {
                success: true,
                duplicate: false,
                eventId: data.id,
                eventType,
            };
        }

        // Find the TopUp by Airtm payin ID
        const topup = await this.prisma.topUp.findFirst({
            where: { airtmPayinId },
        });

        if (!topup) {
            this.logger.warn(`TopUp not found for payin: ${airtmPayinId}`);
            return {
                success: false,
                duplicate: false,
                eventId: data.id,
                eventType,
                error: `TopUp not found for payin ${airtmPayinId}`,
            };
        }

        // Skip if already in terminal state
        if (isTerminalPayinStatus(topup.status as TopUpStatus)) {
            this.logger.debug(
                `TopUp ${topup.id} already in terminal state ${topup.status}, skipping`,
            );
            return {
                success: true,
                duplicate: false,
                eventId: data.id,
                eventType,
                resourceId: topup.id,
                newStatus: topup.status,
            };
        }

        // Validate state transition
        const currentStatus = topup.status as TopUpStatus;
        const transitionResult = TopUpStateMachine.validateTransition(currentStatus, newStatus);

        if (!transitionResult.valid) {
            this.logger.warn(
                `Invalid state transition for TopUp ${topup.id}: ${currentStatus} → ${newStatus}`,
            );
            // Don't fail - just log and continue (webhook data is authoritative)
        }

        // Update TopUp status
        const updateData: Record<string, unknown> = {
            status: newStatus,
            updatedAt: new Date(),
        };

        // Store reason if provided
        if (data.reasonCode) {
            updateData.failureReason = data.reasonCode;
        }
        if (data.reasonDescription) {
            updateData.failureDescription = data.reasonDescription;
        }

        await this.prisma.topUp.update({
            where: { id: topup.id },
            data: updateData,
        });

        this.logger.log(`TopUp ${topup.id} updated: ${currentStatus} → ${newStatus}`);

        // If succeeded, update user balance
        if (newStatus === TopUpStatus.TOPUP_SUCCEEDED) {
            await this.creditUserBalance(topup.userId, topup.amount.toString(), topup.currency);
        }

        return {
            success: true,
            duplicate: false,
            eventId: data.id,
            eventType,
            resourceId: topup.id,
            newStatus,
        };
    }

    /**
     * Handles payout (withdrawal) webhook events.
     */
    private async handlePayoutEvent(
        eventType: AirtmWebhookEventType,
        data: AirtmWebhookPayload['data'],
    ): Promise<WebhookProcessResult> {
        const airtmPayoutId = data.id;
        const newStatus = mapPayoutWebhookEventToStatus(eventType);

        if (!newStatus) {
            this.logger.warn(`No status mapping for event type: ${eventType}`);
            return {
                success: true,
                duplicate: false,
                eventId: data.id,
                eventType,
            };
        }

        // Find the Withdrawal by Airtm payout ID
        const withdrawal = await this.prisma.withdrawal.findFirst({
            where: { airtmPayoutId },
        });

        if (!withdrawal) {
            this.logger.warn(`Withdrawal not found for payout: ${airtmPayoutId}`);
            return {
                success: false,
                duplicate: false,
                eventId: data.id,
                eventType,
                error: `Withdrawal not found for payout ${airtmPayoutId}`,
            };
        }

        // Skip if already in terminal state
        if (isTerminalPayoutStatus(withdrawal.status as WithdrawalStatus)) {
            this.logger.debug(
                `Withdrawal ${withdrawal.id} already in terminal state ${withdrawal.status}, skipping`,
            );
            return {
                success: true,
                duplicate: false,
                eventId: data.id,
                eventType,
                resourceId: withdrawal.id,
                newStatus: withdrawal.status,
            };
        }

        // Validate state transition
        const currentStatus = withdrawal.status as WithdrawalStatus;
        const transitionResult = WithdrawalStateMachine.validateTransition(currentStatus, newStatus);

        if (!transitionResult.valid) {
            this.logger.warn(
                `Invalid state transition for Withdrawal ${withdrawal.id}: ${currentStatus} → ${newStatus}`,
            );
            // Don't fail - just log and continue (webhook data is authoritative)
        }

        // Update Withdrawal status
        const updateData: Record<string, unknown> = {
            status: newStatus,
            updatedAt: new Date(),
        };

        // Store reason if provided
        if (data.reasonCode) {
            updateData.failureReason = data.reasonCode;
        }
        if (data.reasonDescription) {
            updateData.failureDescription = data.reasonDescription;
        }

        await this.prisma.withdrawal.update({
            where: { id: withdrawal.id },
            data: updateData,
        });

        this.logger.log(`Withdrawal ${withdrawal.id} updated: ${currentStatus} → ${newStatus}`);

        // If failed or canceled, refund the reserved balance
        if (
            newStatus === WithdrawalStatus.WITHDRAWAL_FAILED ||
            newStatus === WithdrawalStatus.WITHDRAWAL_CANCELED
        ) {
            await this.refundUserBalance(
                withdrawal.userId,
                withdrawal.amount.toString(),
                withdrawal.currency,
            );
        }

        return {
            success: true,
            duplicate: false,
            eventId: data.id,
            eventType,
            resourceId: withdrawal.id,
            newStatus,
        };
    }

    /**
     * Credits user available balance after successful top-up.
     */
    private async creditUserBalance(
        userId: string,
        amount: string,
        _currency: string,
    ): Promise<void> {
        // Get current balance or create if not exists
        const existingBalance = await this.prisma.balance.findUnique({
            where: { userId },
        });

        if (existingBalance) {
            // Add to existing balance using string arithmetic
            const currentAvailable = parseFloat(existingBalance.available);
            const addAmount = parseFloat(amount);
            const newAvailable = (currentAvailable + addAmount).toFixed(2);

            await this.prisma.balance.update({
                where: { userId },
                data: { available: newAvailable },
            });
        } else {
            // Create new balance record
            await this.prisma.balance.create({
                data: {
                    userId,
                    available: parseFloat(amount).toFixed(2),
                    reserved: '0.00',
                    currency: 'USD',
                },
            });
        }

        this.logger.log(`Balance credited: user=${userId}, amount=${amount}`);
    }

    /**
     * Refunds user balance after failed/canceled withdrawal.
     */
    private async refundUserBalance(
        userId: string,
        amount: string,
        _currency: string,
    ): Promise<void> {
        const existingBalance = await this.prisma.balance.findUnique({
            where: { userId },
        });

        if (!existingBalance) {
            this.logger.warn(`Cannot refund: no balance found for user ${userId}`);
            return;
        }

        // Refund: add to available, subtract from reserved
        const currentAvailable = parseFloat(existingBalance.available);
        const currentReserved = parseFloat(existingBalance.reserved);
        const refundAmount = parseFloat(amount);

        const newAvailable = (currentAvailable + refundAmount).toFixed(2);
        const newReserved = Math.max(0, currentReserved - refundAmount).toFixed(2);

        await this.prisma.balance.update({
            where: { userId },
            data: {
                available: newAvailable,
                reserved: newReserved,
            },
        });

        this.logger.log(`Balance refunded: user=${userId}, amount=${amount}`);
    }

    /**
     * Sanitizes webhook payload by removing sensitive data before storage.
     */
    private sanitizePayload(payload: AirtmWebhookPayload): SanitizedWebhookPayload {
        const sanitizedData = {
            id: payload.data.id,
            code: payload.data.code,
            amount: payload.data.amount,
            currency: payload.data.currency,
            status: payload.data.status,
            reasonCode: payload.data.reasonCode,
            reasonDescription: payload.data.reasonDescription,
        };

        // Remove any sensitive fields that might be in the original data
        // (bank accounts, crypto addresses, etc.)

        return {
            eventId: payload.eventId,
            eventType: payload.eventType,
            occurredAt: payload.occurredAt,
            data: sanitizedData,
        };
    }
}
