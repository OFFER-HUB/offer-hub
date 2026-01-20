import { Injectable, Logger, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { Prisma, EscrowStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { Provider, ERROR_CODES } from '@offerhub/shared';
import { PrismaService } from '../../../modules/database/prisma.service';
import { WalletClient } from '../clients/wallet.client';
import { TrustlessWorkConfig } from '../trustless-work.config';
import {
    TrustlessWebhookEvent,
    TrustlessWebhookEventType,
    mapTrustlessStatus,
} from '../types/trustless-work.types';

/**
 * Trustless Work Webhook Service
 * Handles webhook events with HMAC signature verification
 */
@Injectable()
export class WebhookService {
    private readonly logger = new Logger(WebhookService.name);

    private resolutionService: any; // Lazy-loaded to avoid circular dependency

    constructor(
        @Inject(TrustlessWorkConfig) private readonly config: TrustlessWorkConfig,
        @Inject(PrismaService) private readonly prisma: PrismaService,
        @Inject(WalletClient) private readonly walletClient: WalletClient,
    ) {}

    /**
     * Set ResolutionService (called after module initialization to avoid circular dependency)
     */
    setResolutionService(resolutionService: any): void {
        this.resolutionService = resolutionService;
    }

    /**
     * Verify webhook signature using HMAC-SHA256
     * @param rawBody Raw request body (as string or Buffer)
     * @param signature Signature from TW-Signature header
     * @returns true if valid, throws UnauthorizedException if invalid
     */
    verifySignature(rawBody: string | Buffer, signature: string): boolean {
        const body = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');

        const expectedSignature = crypto
            .createHmac('sha256', this.config.webhookSecret)
            .update(body)
            .digest('hex');

        if (signature !== expectedSignature) {
            this.logger.error('Invalid webhook signature');
            throw new UnauthorizedException({
                error: {
                    code: ERROR_CODES.WEBHOOK_SIGNATURE_INVALID,
                    message: 'Invalid webhook signature',
                },
            });
        }

        return true;
    }

    /**
     * Process webhook event
     * @param event Webhook event payload
     * @returns Success status
     */
    async processWebhook(event: TrustlessWebhookEvent): Promise<{ success: boolean }> {
        this.logger.log(`Processing webhook event: ${event.type} (${event.event_id})`);

        // Check for duplicate event
        const isDuplicate = await this.checkDuplicate(event.event_id);
        if (isDuplicate) {
            this.logger.warn(`Duplicate webhook event ignored: ${event.event_id}`);
            return { success: true }; // Return success for duplicates
        }

        try {
            // Route to appropriate handler based on event type
            switch (event.type) {
                case TrustlessWebhookEventType.ESCROW_CREATED:
                    await this.handleEscrowCreated(event);
                    break;

                case TrustlessWebhookEventType.ESCROW_FUNDING_STARTED:
                    await this.handleEscrowFundingStarted(event);
                    break;

                case TrustlessWebhookEventType.ESCROW_FUNDED:
                    await this.handleEscrowFunded(event);
                    break;

                case TrustlessWebhookEventType.ESCROW_MILESTONE_COMPLETED:
                    await this.handleMilestoneCompleted(event);
                    break;

                case TrustlessWebhookEventType.ESCROW_RELEASED:
                    await this.handleEscrowReleased(event);
                    break;

                case TrustlessWebhookEventType.ESCROW_REFUNDED:
                    await this.handleEscrowRefunded(event);
                    break;

                case TrustlessWebhookEventType.ESCROW_DISPUTED:
                    await this.handleEscrowDisputed(event);
                    break;

                default:
                    this.logger.warn(`Unknown webhook event type: ${event.type}`);
            }

            // Store webhook event for audit and deduplication
            await this.storeWebhookEvent(event);

            this.logger.log(`Webhook event processed successfully: ${event.event_id}`);
            return { success: true };
        } catch (error: any) {
            this.logger.error(`Failed to process webhook event ${event.event_id}:`, error);
            throw error;
        }
    }

    /**
     * Handle escrow.created event
     */
    private async handleEscrowCreated(event: TrustlessWebhookEvent): Promise<void> {
        const { contract_id, order_id, status } = event.data;

        await this.prisma.$transaction(async (tx) => {
            // Update escrow with contract ID
            await tx.escrow.updateMany({
                where: {
                    order: { id: order_id },
                },
                data: {
                    trustlessContractId: contract_id,
                    status: mapTrustlessStatus(status),
                    updatedAt: new Date(),
                },
            });

            // Transition order to ESCROW_FUNDING state
            await tx.order.update({
                where: { id: order_id },
                data: {
                    status: 'ESCROW_FUNDING',
                    updatedAt: new Date(),
                },
            });

            // Create audit log
            await tx.auditLog.create({
                data: {
                    id: crypto.randomUUID(),
                    marketplaceId: 'system',
                    userId: 'system',
                    action: 'ESCROW_CREATED',
                    resourceType: 'escrow',
                    resourceId: contract_id,
                    payloadBefore: Prisma.JsonNull,
                    payloadAfter: { contract_id, order_id, status },
                    actorType: 'system',
                    result: 'SUCCESS',
                },
            });
        });

        this.logger.log(`Escrow created: ${contract_id} for order ${order_id}`);
    }

    /**
     * Handle escrow.funding_started event
     */
    private async handleEscrowFundingStarted(event: TrustlessWebhookEvent): Promise<void> {
        const { contract_id, status } = event.data;

        await this.prisma.escrow.updateMany({
            where: { trustlessContractId: contract_id },
            data: {
                status: mapTrustlessStatus(status),
                updatedAt: new Date(),
            },
        });

        this.logger.log(`Escrow funding started: ${contract_id}`);
    }

    /**
     * Handle escrow.funded event.
     */
    private async handleEscrowFunded(event: TrustlessWebhookEvent): Promise<void> {
        const { contract_id, status, transaction_hash } = event.data;

        await this.verifyTransactionIfPresent(transaction_hash);

        await this.prisma.$transaction(async (tx) => {
            // Update escrow status
            await tx.escrow.updateMany({
                where: { trustlessContractId: contract_id },
                data: {
                    status: mapTrustlessStatus(status),
                    fundedAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            // Get escrow to find order ID
            const escrow = await tx.escrow.findFirst({
                where: { trustlessContractId: contract_id },
                select: { orderId: true },
            });

            if (escrow) {
                // Transition order to IN_PROGRESS state
                await tx.order.update({
                    where: { id: escrow.orderId },
                    data: {
                        status: 'IN_PROGRESS',
                        updatedAt: new Date(),
                    },
                });

                // Create audit log
                await tx.auditLog.create({
                    data: {
                        id: crypto.randomUUID(),
                        marketplaceId: 'system',
                        userId: 'system',
                        action: 'ESCROW_FUNDED',
                        resourceType: 'escrow',
                        resourceId: contract_id,
                        payloadBefore: Prisma.JsonNull,
                        payloadAfter: { contract_id, status, transaction_hash },
                        actorType: 'system',
                        result: 'SUCCESS',
                    },
                });
            }
        });

        this.logger.log(`Escrow funded: ${contract_id} (tx: ${transaction_hash})`);
    }

    /**
     * Handle escrow.milestone_completed event
     */
    private async handleMilestoneCompleted(event: TrustlessWebhookEvent): Promise<void> {
        const { contract_id, milestone_ref } = event.data;

        // Update milestone status in database
        // Note: Milestones are tracked separately in the database
        this.logger.log(`Milestone completed: ${milestone_ref} for escrow ${contract_id}`);
    }

    /**
     * Handle escrow.released event.
     */
    private async handleEscrowReleased(event: TrustlessWebhookEvent): Promise<void> {
        const { contract_id, transaction_hash } = event.data;

        await this.verifyTransactionIfPresent(transaction_hash);

        const escrow = await this.prisma.escrow.findUnique({
            where: { trustlessContractId: contract_id },
            include: { order: true },
        });

        if (!escrow?.order) {
            this.logger.warn(`No order found for escrow ${contract_id}`);
            return;
        }

        // Update escrow status
        await this.prisma.escrow.updateMany({
            where: { trustlessContractId: contract_id },
            data: {
                status: EscrowStatus.RELEASED,
                releasedAt: new Date(),
            },
        });

        // Call ResolutionService to complete release
        if (this.resolutionService) {
            await this.resolutionService.confirmRelease(escrow.order.id);
        } else {
            this.logger.error('ResolutionService not available for confirmRelease');
        }

        this.logger.log(`Escrow released: ${contract_id} (tx: ${transaction_hash})`);
    }

    /**
     * Handle escrow.refunded event.
     */
    private async handleEscrowRefunded(event: TrustlessWebhookEvent): Promise<void> {
        const { contract_id, transaction_hash } = event.data;

        await this.verifyTransactionIfPresent(transaction_hash);

        const escrow = await this.prisma.escrow.findUnique({
            where: { trustlessContractId: contract_id },
            include: { order: true },
        });

        if (!escrow?.order) {
            this.logger.warn(`No order found for escrow ${contract_id}`);
            return;
        }

        // Update escrow status
        await this.prisma.escrow.updateMany({
            where: { trustlessContractId: contract_id },
            data: {
                status: EscrowStatus.REFUNDED,
                refundedAt: new Date(),
            },
        });

        // Call ResolutionService to complete refund
        if (this.resolutionService) {
            await this.resolutionService.confirmRefund(escrow.order.id);
        } else {
            this.logger.error('ResolutionService not available for confirmRefund');
        }

        this.logger.log(`Escrow refunded: ${contract_id} (tx: ${transaction_hash})`);
    }

    /**
     * Handle escrow.disputed event
     */
    private async handleEscrowDisputed(event: TrustlessWebhookEvent): Promise<void> {
        const { contract_id } = event.data;

        await this.prisma.escrow.updateMany({
            where: { trustlessContractId: contract_id },
            data: { status: EscrowStatus.DISPUTED },
        });

        this.logger.log(`Escrow ${contract_id} marked as DISPUTED via webhook`);
    }

    /**
     * Check if webhook event is duplicate.
     */
    private async checkDuplicate(eventId: string): Promise<boolean> {
        const existing = await this.prisma.webhookEvent.findUnique({
            where: {
                provider_providerEventId: {
                    provider: Provider.TRUSTLESS_WORK,
                    providerEventId: eventId,
                },
            },
        });

        return existing !== null;
    }

    /**
     * Verifies a Stellar transaction hash if provided.
     */
    private async verifyTransactionIfPresent(transactionHash?: string): Promise<void> {
        if (!transactionHash) {
            return;
        }

        const verified = await this.walletClient.verifyTransaction(transactionHash);
        if (!verified) {
            throw new Error(`Failed to verify transaction: ${transactionHash}`);
        }
    }

    /**
     * Store webhook event for audit and deduplication
     */
    private async storeWebhookEvent(event: TrustlessWebhookEvent): Promise<void> {
        await this.prisma.webhookEvent.create({
            data: {
                provider: Provider.TRUSTLESS_WORK,
                providerEventId: event.event_id,
                payload: event as any,
                processedAt: new Date(),
            },
        });
    }
}
