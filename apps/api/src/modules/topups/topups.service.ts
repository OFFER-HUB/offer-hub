import { Injectable, Inject, Logger, NotFoundException, UnprocessableEntityException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AirtmPayinClient, AirtmUserClient } from '../../providers/airtm';
import {
    TopUpStatus,
    TopUpStateMachine,
    ERROR_CODES,
    generateTopupId,
} from '@offerhub/shared';
import { mapAirtmPayinStatus } from '../../providers/airtm/mappers';
import type { CreateTopUpDto } from './dto';
import { BalanceService } from '../balance/balance.service';
import { AirtmConfig } from '../../providers/airtm/airtm.config';
import { EventBusService, EVENT_CATALOG } from '../events';
import {
    TopUpCreatedPayload,
    TopUpConfirmationRequiredPayload,
    TopUpProcessingPayload,
    TopUpSucceededPayload,
    TopUpFailedPayload,
    TopUpCanceledPayload
} from '../events/types';

/**
 * Response when creating a top-up.
 */
export interface CreateTopUpResponse {
    id: string;
    amount: string;
    currency: string;
    status: TopUpStatus;
    confirmationUri: string;
    expiresAt?: string;
    createdAt: string;
}

/**
 * Response when getting a top-up.
 */
export interface TopUpResponse {
    id: string;
    userId: string;
    amount: string;
    currency: string;
    status: TopUpStatus;
    airtmPayinId?: string;
    confirmationUri?: string;
    failureReason?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Service for managing top-up operations.
 * Coordinates between local database and Airtm API.
 */
@Injectable()
export class TopUpsService {
    private readonly logger = new Logger(TopUpsService.name);

    constructor(
        @Inject(PrismaService) private readonly prisma: PrismaService,
        @Inject(AirtmPayinClient) private readonly airtmPayin: AirtmPayinClient,
        @Inject(AirtmUserClient) private readonly airtmUser: AirtmUserClient,
        @Inject(BalanceService) private readonly balanceService: BalanceService,
        @Inject(AirtmConfig) private readonly airtmConfig: AirtmConfig,
        private readonly eventBus: EventBusService,
    ) { }

    /**
     * Creates a new top-up for a user.
     *
     * Flow:
     * 1. Verify user has linked Airtm account
     * 2. Verify user is eligible (active + KYC verified)
     * 3. Create top-up record in DB
     * 4. Create payin in Airtm
     * 5. Update top-up with Airtm details
     *
     * @param userId - Internal user ID
     * @param dto - Top-up details
     * @returns Top-up with confirmation URI
     */
    async createTopUp(userId: string, dto: CreateTopUpDto): Promise<CreateTopUpResponse> {
        // 1. Get user and verify Airtm linkage
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException({
                error: {
                    code: ERROR_CODES.USER_NOT_FOUND,
                    message: 'User not found',
                },
            });
        }

        if (!user.airtmUserId) {
            throw new UnprocessableEntityException({
                error: {
                    code: ERROR_CODES.AIRTM_USER_NOT_LINKED,
                    message: 'User must link Airtm account before creating top-ups',
                },
            });
        }

        // 2. Verify user eligibility in Airtm
        const eligibility = await this.airtmUser.verifyUserEligibilityById(user.airtmUserId);

        if (!eligibility.eligible) {
            throw new UnprocessableEntityException({
                error: {
                    code: ERROR_CODES.AIRTM_USER_INVALID,
                    message: `Airtm user not eligible: ${eligibility.failureReason}`,
                    details: { failureReason: eligibility.failureReason },
                },
            });
        }

        // 3. Create top-up record in DB
        const topupId = generateTopupId();
        const topup = await this.prisma.topUp.create({
            data: {
                id: topupId,
                userId,
                amount: dto.amount,
                currency: dto.currency || 'USD',
                status: TopUpStatus.TOPUP_CREATED,
                metadata: dto.description ? { description: dto.description } : undefined,
            },
        });

        this.logger.log(`TopUp created: ${topupId} for user ${userId}`);

        // Emit TOPUP_CREATED event
        this.eventBus.emit<TopUpCreatedPayload>({
            eventType: EVENT_CATALOG.TOPUP_CREATED,
            aggregateId: topupId,
            aggregateType: 'TopUp',
            payload: {
                userId,
                amount: dto.amount,
                currency: dto.currency || 'USD',
            },
            metadata: EventBusService.createMetadata({ userId }),
        });

        // 4. Create payin in Airtm
        try {
            const payin = await this.airtmPayin.createPayin({
                amount: dto.amount,
                currency: dto.currency,
                destinationUserId: user.airtmUserId,
                description: dto.description,
                confirmationBaseUrl: `${this.airtmConfig.callbackBaseUrl}/${topupId}/callback`,
                cancellationBaseUrl: `${this.airtmConfig.callbackBaseUrl}/${topupId}/callback`,
            });

            // 5. Update top-up with Airtm details
            const updatedTopup = await this.prisma.topUp.update({
                where: { id: topupId },
                data: {
                    airtmPayinId: payin.id,
                    confirmationUri: payin.confirmationUri,
                    status: mapAirtmPayinStatus(payin.status),
                    metadata: {
                        ...(typeof topup.metadata === 'object' && topup.metadata !== null ? topup.metadata : {}),
                        expiresAt: payin.expiresAt,
                    },
                },
            });

            this.logger.log(
                `TopUp ${topupId} linked to Airtm payin ${payin.id}, ` +
                `status=${updatedTopup.status}`,
            );

            // Emit appropriate event based on status
            if (updatedTopup.status === TopUpStatus.TOPUP_AWAITING_USER_CONFIRMATION) {
                this.eventBus.emit<TopUpConfirmationRequiredPayload>({
                    eventType: EVENT_CATALOG.TOPUP_CONFIRMATION_REQUIRED,
                    aggregateId: topupId,
                    aggregateType: 'TopUp',
                    payload: {
                        topupId,
                        confirmationUri: payin.confirmationUri!,
                    },
                    metadata: EventBusService.createMetadata({ userId }),
                });
            } else if (updatedTopup.status === TopUpStatus.TOPUP_PROCESSING) {
                this.eventBus.emit<TopUpProcessingPayload>({
                    eventType: EVENT_CATALOG.TOPUP_PROCESSING,
                    aggregateId: topupId,
                    aggregateType: 'TopUp',
                    payload: {
                        topupId,
                        airtmPayinId: payin.id,
                    },
                    metadata: EventBusService.createMetadata({ userId }),
                });
            }

            return {
                id: updatedTopup.id,
                amount: updatedTopup.amount,
                currency: updatedTopup.currency,
                status: updatedTopup.status as TopUpStatus,
                confirmationUri: payin.confirmationUri,
                expiresAt: payin.expiresAt,
                createdAt: updatedTopup.createdAt.toISOString(),
            };
        } catch (error) {
            // Mark top-up as failed if Airtm call fails
            await this.failTopUp(topupId, userId, dto.amount, error);
            throw error;
        }
    }

    /**
     * Mark a top-up as failed and emit the event.
     */
    private async failTopUp(topupId: string, userId: string, amount: string, error: any) {
        await this.prisma.topUp.update({
            where: { id: topupId },
            data: {
                status: TopUpStatus.TOPUP_FAILED,
                metadata: {
                    failureReason: error instanceof Error ? error.message : 'Unknown error',
                },
            },
        });

        this.eventBus.emit<TopUpFailedPayload>({
            eventType: EVENT_CATALOG.TOPUP_FAILED,
            aggregateId: topupId,
            aggregateType: 'TopUp',
            payload: {
                topupId,
                userId,
                amount,
                reason: error instanceof Error ? error.message : 'Unknown error',
            },
            metadata: EventBusService.createMetadata({ userId }),
        });
    }

    /**
     * Gets a top-up by ID without authentication (internal use).
     * Used by callback endpoint.
     *
     * @param topupId - Top-up ID
     * @returns Top-up details or null if not found
     */
    async getTopUpById(topupId: string): Promise<TopUpResponse | null> {
        const topup = await this.prisma.topUp.findUnique({
            where: { id: topupId },
        });

        if (!topup) {
            return null;
        }

        const metadata = topup.metadata as Record<string, unknown> | null;
        return {
            id: topup.id,
            userId: topup.userId,
            amount: topup.amount,
            currency: topup.currency,
            status: topup.status as TopUpStatus,
            airtmPayinId: topup.airtmPayinId || undefined,
            confirmationUri: topup.confirmationUri || undefined,
            failureReason: (metadata?.failureReason as string) || undefined,
            createdAt: topup.createdAt.toISOString(),
            updatedAt: topup.updatedAt.toISOString(),
        };
    }

    /**
     * Gets a top-up by ID.
     *
     * @param topupId - Top-up ID
     * @param userId - User ID (for authorization)
     * @returns Top-up details
     */
    async getTopUp(topupId: string, userId: string): Promise<TopUpResponse> {
        const topup = await this.prisma.topUp.findFirst({
            where: {
                id: topupId,
                userId,
            },
        });

        if (!topup) {
            throw new NotFoundException({
                error: {
                    code: ERROR_CODES.TOPUP_NOT_FOUND,
                    message: 'Top-up not found',
                },
            });
        }

        const metadata = topup.metadata as Record<string, unknown> | null;
        return {
            id: topup.id,
            userId: topup.userId,
            amount: topup.amount,
            currency: topup.currency,
            status: topup.status as TopUpStatus,
            airtmPayinId: topup.airtmPayinId || undefined,
            confirmationUri: topup.confirmationUri || undefined,
            failureReason: (metadata?.failureReason as string) || undefined,
            createdAt: topup.createdAt.toISOString(),
            updatedAt: topup.updatedAt.toISOString(),
        };
    }

    /**
     * Lists top-ups for a user.
     *
     * @param userId - User ID
     * @param options - Pagination options
     * @returns List of top-ups
     */
    async listTopUps(
        userId: string,
        options: { limit?: number; cursor?: string } = {},
    ): Promise<{ data: TopUpResponse[]; hasMore: boolean; nextCursor?: string }> {
        const limit = Math.min(options.limit || 20, 100);

        const topups = await this.prisma.topUp.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit + 1,
            ...(options.cursor && {
                cursor: { id: options.cursor },
                skip: 1,
            }),
        });

        const hasMore = topups.length > limit;
        const data = topups.slice(0, limit);

        return {
            data: data.map((topup) => {
                const meta = topup.metadata as Record<string, unknown> | null;
                return {
                    id: topup.id,
                    userId: topup.userId,
                    amount: topup.amount,
                    currency: topup.currency,
                    status: topup.status as TopUpStatus,
                    airtmPayinId: topup.airtmPayinId || undefined,
                    confirmationUri: topup.confirmationUri || undefined,
                    failureReason: (meta?.failureReason as string) || undefined,
                    createdAt: topup.createdAt.toISOString(),
                    updatedAt: topup.updatedAt.toISOString(),
                };
            }),
            hasMore,
            nextCursor: hasMore ? data[data.length - 1].id : undefined,
        };
    }

    /**
     * Refreshes top-up status from Airtm.
     * Use when webhook may have been missed.
     *
     * @param topupId - Top-up ID
     * @param userId - User ID (for authorization)
     * @returns Updated top-up details
     */
    async refreshTopUp(topupId: string, userId: string): Promise<TopUpResponse> {
        const topup = await this.prisma.topUp.findFirst({
            where: { id: topupId, userId },
        });

        if (!topup) {
            throw new NotFoundException({
                error: {
                    code: ERROR_CODES.TOPUP_NOT_FOUND,
                    message: 'Top-up not found',
                },
            });
        }

        if (!topup.airtmPayinId) {
            return this.getTopUp(topupId, userId);
        }

        // Skip if already in terminal state (prevents race condition with webhook)
        const currentStatus = topup.status as TopUpStatus;
        if (TopUpStateMachine.isTerminalState(currentStatus)) {
            this.logger.debug(`TopUp ${topupId} already in terminal state ${currentStatus}, skipping refresh`);
            return this.getTopUp(topupId, userId);
        }

        // Fetch latest status from Airtm
        const payin = await this.airtmPayin.refreshPayinStatus(topup.airtmPayinId);
        const newStatus = mapAirtmPayinStatus(payin.status);

        // Validate state transition
        if (TopUpStateMachine.canTransition(currentStatus, newStatus)) {
            if (payin.reasonDescription) {
                const existingMetadata = (topup.metadata as Record<string, unknown>) ?? {};
                await this.prisma.topUp.update({
                    where: { id: topupId },
                    data: {
                        status: newStatus,
                        metadata: JSON.parse(
                            JSON.stringify({ ...existingMetadata, failureReason: payin.reasonDescription }),
                        ),
                    },
                });
            } else {
                await this.prisma.topUp.update({
                    where: { id: topupId },
                    data: { status: newStatus },
                });
            }

            this.logger.log(`TopUp ${topupId} refreshed: ${currentStatus} → ${newStatus}`);

            // Emit generic state change events (except SUCCEEDED which has special logic below)
            if (newStatus === TopUpStatus.TOPUP_PROCESSING) {
                this.eventBus.emit<TopUpProcessingPayload>({
                    eventType: EVENT_CATALOG.TOPUP_PROCESSING,
                    aggregateId: topupId,
                    aggregateType: 'TopUp',
                    payload: { topupId, airtmPayinId: topup.airtmPayinId },
                    metadata: EventBusService.createMetadata({ userId }),
                });
            } else if (newStatus === TopUpStatus.TOPUP_FAILED) {
                this.eventBus.emit<TopUpFailedPayload>({
                    eventType: EVENT_CATALOG.TOPUP_FAILED,
                    aggregateId: topupId,
                    aggregateType: 'TopUp',
                    payload: {
                        topupId,
                        userId,
                        amount: topup.amount,
                        reason: payin.reasonDescription || 'Transaction failed'
                    },
                    metadata: EventBusService.createMetadata({ userId }),
                });
            } else if (newStatus === TopUpStatus.TOPUP_CANCELED) {
                this.eventBus.emit<TopUpCanceledPayload>({
                    eventType: EVENT_CATALOG.TOPUP_CANCELED,
                    aggregateId: topupId,
                    aggregateType: 'TopUp',
                    payload: {
                        topupId,
                        userId,
                        amount: topup.amount,
                        canceledBy: 'system'
                    },
                    metadata: EventBusService.createMetadata({ userId }),
                });
            }

            // Credit balance if transitioned to SUCCEEDED
            if (currentStatus !== TopUpStatus.TOPUP_SUCCEEDED &&
                newStatus === TopUpStatus.TOPUP_SUCCEEDED) {
                this.logger.log(`Crediting balance for TopUp ${topupId}: ${topup.amount} ${topup.currency}`);

                try {
                    const balance = await this.balanceService.creditAvailable(userId, {
                        amount: topup.amount,
                        currency: topup.currency,
                        reference: topupId,
                        description: `Top-up ${topupId} succeeded`,
                    });

                    // Emit TOPUP_SUCCEEDED event
                    this.eventBus.emit<TopUpSucceededPayload>({
                        eventType: EVENT_CATALOG.TOPUP_SUCCEEDED,
                        aggregateId: topupId,
                        aggregateType: 'TopUp',
                        payload: {
                            topupId,
                            userId,
                            amount: topup.amount,
                            currency: topup.currency,
                            newAvailableBalance: balance.newBalance.available,
                            airtmPayinId: topup.airtmPayinId!,
                        },
                        metadata: EventBusService.createMetadata({ userId }),
                    });
                } catch (error) {
                    this.logger.error(
                        `Failed to credit balance for TopUp ${topupId}:`,
                        error instanceof Error ? error.message : 'Unknown error',
                    );
                    // Don't throw - the topup status is already updated
                    // Manual reconciliation may be needed
                }
            }
        }

        return this.getTopUp(topupId, userId);
    }

    /**
     * Cancels a top-up that is awaiting user confirmation.
     *
     * @param topupId - Top-up ID
     * @param userId - User ID (for authorization)
     * @returns Canceled top-up details
     * @throws NotFoundException if top-up not found
     * @throws ConflictException if top-up is not in cancellable state
     */
    async cancelTopUp(topupId: string, userId: string): Promise<TopUpResponse> {
        // 1. Fetch and validate
        const topup = await this.prisma.topUp.findFirst({
            where: { id: topupId, userId },
        });

        if (!topup) {
            throw new NotFoundException({
                error: {
                    code: ERROR_CODES.TOPUP_NOT_FOUND,
                    message: 'Top-up not found',
                },
            });
        }

        // 2. Validate current status - can only cancel from AWAITING_USER_CONFIRMATION
        const currentStatus = topup.status as TopUpStatus;
        if (currentStatus !== TopUpStatus.TOPUP_AWAITING_USER_CONFIRMATION) {
            throw new ConflictException({
                error: {
                    code: ERROR_CODES.INVALID_STATE,
                    message: `Cannot cancel top-up in status ${currentStatus}`,
                    details: {
                        currentStatus,
                        allowedStatuses: [TopUpStatus.TOPUP_AWAITING_USER_CONFIRMATION],
                    },
                },
            });
        }

        // 3. Call Airtm API to cancel (if payin exists)
        if (topup.airtmPayinId) {
            try {
                await this.airtmPayin.cancelPayin(topup.airtmPayinId);
                this.logger.log(`Airtm payin ${topup.airtmPayinId} canceled via API`);
            } catch (error) {
                this.logger.warn(
                    `Airtm cancel API failed for ${topup.airtmPayinId}, ` +
                    `proceeding with local cancellation: ${error instanceof Error ? error.message : 'Unknown error'}`,
                );
                // Continue with local cancellation even if Airtm API fails
            }
        }

        // 4. Update local status to CANCELED
        await this.prisma.topUp.update({
            where: { id: topupId },
            data: { status: TopUpStatus.TOPUP_CANCELED },
        });

        this.logger.log(`TopUp ${topupId} canceled by user ${userId}`);

        // Emit TOPUP_CANCELED event
        this.eventBus.emit<TopUpCanceledPayload>({
            eventType: EVENT_CATALOG.TOPUP_CANCELED,
            aggregateId: topupId,
            aggregateType: 'TopUp',
            payload: {
                topupId,
                userId,
                amount: topup.amount,
                canceledBy: 'user',
            },
            metadata: EventBusService.createMetadata({ userId }),
        });

        // 5. Return updated top-up
        return this.getTopUp(topupId, userId);
    }
}
