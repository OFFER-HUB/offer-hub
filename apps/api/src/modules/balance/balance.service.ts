import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { EventBusService, EVENT_CATALOG } from '../events';
import {
    BalanceCreditedPayload,
    BalanceDebitedPayload,
    BalanceReservedPayload,
    BalanceReleasedPayload
} from '../events/types';
import { PrismaService } from '../database/prisma.service';
import { AirtmUserClient } from '../../providers/airtm';
import {
    ERROR_CODES,
    isValidAmount,
    formatAmount,
    addAmounts,
    subtractAmounts,
    compareAmounts,
    generateAuditLogId,
} from '@offerhub/shared';
import type { BalanceResponse } from '@offerhub/shared';
import {
    InsufficientFundsException,
    InsufficientReservedFundsException,
    BalanceDiscrepancyException,
    BalanceConcurrencyException,
    InvalidAmountException,
} from './exceptions';
import type {
    CreditAvailableDto,
    DebitAvailableDto,
    ReserveDto,
    ReleaseDto,
    CancelReservationDto,
    DeductReservedDto,
} from './dto';

/**
 * Result of a balance operation, including audit information.
 */
export interface BalanceOperationResult {
    success: boolean;
    balance: BalanceResponse;
    operation: string;
    amount: string;
    previousBalance: {
        available: string;
        reserved: string;
    };
    newBalance: {
        available: string;
        reserved: string;
    };
    auditLogId: string;
}

/**
 * Result of provider sync operation.
 */
export interface SyncResult {
    synced: boolean;
    localBalance: string;
    providerBalance: string;
    discrepancy: string;
    action: 'none' | 'adjusted' | 'flagged';
}

/**
 * Internal balance data for atomic operations.
 */
interface BalanceData {
    id: string;
    userId: string;
    available: string;
    reserved: string;
    currency: string;
    updatedAt: Date;
}

/**
 * Balance Service - Atomic Balance Management System
 *
 * This service manages all balance operations in the OFFER-HUB platform,
 * handling atomic updates between available and reserved balance components.
 *
 * Core Guarantees:
 * - Atomicity: Operations complete fully or not at all
 * - Consistency: Balance invariants always hold (non-negative values)
 * - Isolation: Concurrent operations don't interfere (via Prisma transactions)
 * - Durability: All changes are persisted with audit logging
 *
 * @see docs/system/state-machines.md#36-balance-model
 */
@Injectable()
export class BalanceService {
    private readonly logger = new Logger(BalanceService.name);

    constructor(
        @Inject(PrismaService) private readonly prisma: PrismaService,
        @Inject(AirtmUserClient) private readonly airtmUser: AirtmUserClient,
        @Inject(EventBusService) private readonly eventBus: EventBusService,
    ) { }

    /**
     * Credits funds to a user's available balance.
     * Used when: Top-up succeeds, refund from escrow, etc.
     *
     * @param userId - The user's internal ID
     * @param dto - Credit operation details
     * @returns Operation result with balance details
     */
    async creditAvailable(userId: string, dto: CreditAvailableDto): Promise<BalanceOperationResult> {
        this.validateAmount(dto.amount);
        this.logger.log(`Crediting ${dto.amount} ${dto.currency || 'USD'} to user ${userId}`);

        return this.executeAtomicOperation(userId, 'CREDIT_AVAILABLE', dto.amount, async (balance) => {
            const newAvailable = addAmounts(balance.available, dto.amount);

            return {
                available: newAvailable,
                reserved: balance.reserved,
            };
        }, {
            reference: dto.reference,
            description: dto.description,
        });
    }

    /**
     * Debits funds from a user's available balance.
     * Used when: Manual deduction, fee collection, etc.
     *
     * @param userId - The user's internal ID
     * @param dto - Debit operation details
     * @returns Operation result with balance details
     * @throws InsufficientFundsException if available balance is less than amount
     */
    async debitAvailable(userId: string, dto: DebitAvailableDto): Promise<BalanceOperationResult> {
        this.validateAmount(dto.amount);
        this.logger.log(`Debiting ${dto.amount} ${dto.currency || 'USD'} from user ${userId}`);

        return this.executeAtomicOperation(userId, 'DEBIT_AVAILABLE', dto.amount, async (balance) => {
            // Validate sufficient funds
            if (compareAmounts(balance.available, dto.amount) < 0) {
                throw new InsufficientFundsException(
                    dto.amount,
                    balance.available,
                    dto.currency || 'USD',
                );
            }

            const newAvailable = subtractAmounts(balance.available, dto.amount);

            return {
                available: newAvailable,
                reserved: balance.reserved,
            };
        }, {
            reference: dto.reference,
            description: dto.description,
        });
    }

    /**
     * Reserves funds by moving from available to reserved balance.
     * Used when: Order is created and funds need to be locked.
     *
     * @param userId - The user's internal ID (buyer)
     * @param dto - Reserve operation details
     * @returns Operation result with balance details
     * @throws InsufficientFundsException if available balance is less than amount
     */
    async reserve(userId: string, dto: ReserveDto): Promise<BalanceOperationResult> {
        this.validateAmount(dto.amount);
        this.logger.log(`Reserving ${dto.amount} ${dto.currency || 'USD'} for order ${dto.orderId} from user ${userId}`);

        return this.executeAtomicOperation(userId, 'RESERVE', dto.amount, async (balance) => {
            // Validate sufficient available funds
            if (compareAmounts(balance.available, dto.amount) < 0) {
                throw new InsufficientFundsException(
                    dto.amount,
                    balance.available,
                    dto.currency || 'USD',
                );
            }

            const newAvailable = subtractAmounts(balance.available, dto.amount);
            const newReserved = addAmounts(balance.reserved, dto.amount);

            return {
                available: newAvailable,
                reserved: newReserved,
            };
        }, {
            orderId: dto.orderId,
            description: dto.description,
        });
    }

    /**
     * Releases reserved funds to the seller's available balance.
     * Used when: Order is completed and funds are released to seller.
     *
     * This is a two-user operation:
     * 1. Deducts from buyer's reserved balance
     * 2. Credits to seller's available balance
     *
     * @param buyerId - The buyer's internal ID
     * @param dto - Release operation details (includes sellerId)
     * @returns Operation result with seller's balance details
     * @throws InsufficientReservedFundsException if buyer's reserved balance is less than amount
     */
    async release(buyerId: string, dto: ReleaseDto): Promise<BalanceOperationResult> {
        this.validateAmount(dto.amount);
        this.logger.log(
            `Releasing ${dto.amount} ${dto.currency || 'USD'} from buyer ${buyerId} ` +
            `to seller ${dto.sellerId} for order ${dto.orderId}`,
        );

        const result = await this.prisma.$transaction(async (tx) => {
            const buyerBalance = await this.getOrCreateBalanceInTx(tx, buyerId);

            if (compareAmounts(buyerBalance.reserved, dto.amount) < 0) {
                throw new InsufficientReservedFundsException(
                    dto.amount,
                    buyerBalance.reserved,
                    dto.currency || 'USD',
                );
            }

            const sellerBalance = await this.getOrCreateBalanceInTx(tx, dto.sellerId);

            const sellerPrevious = {
                available: sellerBalance.available,
                reserved: sellerBalance.reserved,
            };

            const buyerNewReserved = subtractAmounts(buyerBalance.reserved, dto.amount);
            const sellerNewAvailable = addAmounts(sellerBalance.available, dto.amount);

            await tx.balance.update({
                where: { userId: buyerId },
                data: { reserved: buyerNewReserved },
            });

            const updatedSellerBalance = await tx.balance.update({
                where: { userId: dto.sellerId },
                data: { available: sellerNewAvailable },
            });

            const buyerAuditId = generateAuditLogId();
            const sellerAuditId = generateAuditLogId();

            await tx.auditLog.createMany({
                data: [
                    {
                        id: buyerAuditId,
                        marketplaceId: 'system',
                        userId: buyerId,
                        action: 'RELEASE_DEDUCT_RESERVED',
                        resourceType: 'balance',
                        resourceId: buyerBalance.id,
                        payloadBefore: { available: buyerBalance.available, reserved: buyerBalance.reserved },
                        payloadAfter: { available: buyerBalance.available, reserved: buyerNewReserved },
                        actorType: 'system',
                        result: 'SUCCESS',
                    },
                    {
                        id: sellerAuditId,
                        marketplaceId: 'system',
                        userId: dto.sellerId,
                        action: 'RELEASE_CREDIT_AVAILABLE',
                        resourceType: 'balance',
                        resourceId: sellerBalance.id,
                        payloadBefore: sellerPrevious,
                        payloadAfter: { available: sellerNewAvailable, reserved: sellerBalance.reserved },
                        actorType: 'system',
                        result: 'SUCCESS',
                    },
                ],
            });

            return {
                sellerAuditId,
                sellerBalance: updatedSellerBalance,
                sellerPrevious,
                sellerNewAvailable,
            };
        }, {
            isolationLevel: 'Serializable',
            timeout: 10000,
        });

        this.eventBus.emit<BalanceReleasedPayload>({
            eventType: EVENT_CATALOG.BALANCE_RELEASED,
            aggregateId: buyerId,
            aggregateType: 'Balance',
            payload: {
                userId: buyerId,
                amount: dto.amount,
                currency: dto.currency || 'USD',
                orderId: dto.orderId,
                reason: 'other',
                previousReservedBalance: 'unknown', // We don't have this easily here without more lookups
                newReservedBalance: 'unknown',
                previousAvailableBalance: 'unknown',
                newAvailableBalance: 'unknown',
            },
            metadata: EventBusService.createMetadata({ userId: buyerId }),
        });

        this.eventBus.emit<BalanceCreditedPayload>({
            eventType: EVENT_CATALOG.BALANCE_CREDITED,
            aggregateId: dto.sellerId,
            aggregateType: 'Balance',
            payload: {
                userId: dto.sellerId,
                amount: dto.amount,
                currency: dto.currency || 'USD',
                source: 'release',
                sourceId: dto.orderId,
                previousAvailableBalance: result.sellerPrevious.available,
                newAvailableBalance: result.sellerNewAvailable,
            },
            metadata: EventBusService.createMetadata({ userId: dto.sellerId }),
        });

        this.logger.log(`Release completed: ${dto.amount} from buyer ${buyerId} to seller ${dto.sellerId}`);

        return {
            success: true,
            balance: {
                user_id: dto.sellerId,
                available: result.sellerNewAvailable,
                reserved: result.sellerBalance.reserved,
                currency: result.sellerBalance.currency,
                total: addAmounts(result.sellerNewAvailable, result.sellerBalance.reserved),
                updated_at: result.sellerBalance.updatedAt.toISOString(),
            },
            operation: 'RELEASE',
            amount: dto.amount,
            previousBalance: result.sellerPrevious,
            newBalance: {
                available: result.sellerNewAvailable,
                reserved: result.sellerBalance.reserved,
            },
            auditLogId: result.sellerAuditId,
        };
    }

    /**
     * Cancels a reservation, returning reserved funds to available balance.
     * Used when: Order is canceled before escrow funding.
     *
     * @param userId - The user's internal ID
     * @param dto - Cancel reservation operation details
     * @returns Operation result with balance details
     * @throws InsufficientReservedFundsException if reserved balance is less than amount
     */
    async cancelReservation(userId: string, dto: CancelReservationDto): Promise<BalanceOperationResult> {
        this.validateAmount(dto.amount);
        this.logger.log(
            `Canceling reservation of ${dto.amount} ${dto.currency || 'USD'} ` +
            `for order ${dto.orderId} for user ${userId}`,
        );

        return this.executeAtomicOperation(userId, 'CANCEL_RESERVATION', dto.amount, async (balance) => {
            // Validate sufficient reserved funds
            if (compareAmounts(balance.reserved, dto.amount) < 0) {
                throw new InsufficientReservedFundsException(
                    dto.amount,
                    balance.reserved,
                    dto.currency || 'USD',
                );
            }

            const newReserved = subtractAmounts(balance.reserved, dto.amount);
            const newAvailable = addAmounts(balance.available, dto.amount);

            return {
                available: newAvailable,
                reserved: newReserved,
            };
        }, {
            orderId: dto.orderId,
            description: dto.description,
        });
    }

    /**
     * Deducts funds from reserved balance without transferring elsewhere.
     * Used when: Escrow is funded (funds move to blockchain).
     *
     * @param userId - The user's internal ID
     * @param dto - Deduct reserved operation details
     * @returns Operation result with balance details
     * @throws InsufficientReservedFundsException if reserved balance is less than amount
     */
    async deductReserved(userId: string, dto: DeductReservedDto): Promise<BalanceOperationResult> {
        this.validateAmount(dto.amount);
        this.logger.log(
            `Deducting ${dto.amount} ${dto.currency || 'USD'} from reserved ` +
            `for order ${dto.orderId} for user ${userId}`,
        );

        return this.executeAtomicOperation(userId, 'DEDUCT_RESERVED', dto.amount, async (balance) => {
            // Validate sufficient reserved funds
            if (compareAmounts(balance.reserved, dto.amount) < 0) {
                throw new InsufficientReservedFundsException(
                    dto.amount,
                    balance.reserved,
                    dto.currency || 'USD',
                );
            }

            const newReserved = subtractAmounts(balance.reserved, dto.amount);

            return {
                available: balance.available,
                reserved: newReserved,
            };
        }, {
            orderId: dto.orderId,
            description: dto.description,
        });
    }

    /**
     * Gets the current balance for a user.
     *
     * @param userId - The user's internal ID
     * @returns Balance details
     */
    async getBalance(userId: string): Promise<BalanceResponse> {
        const balance = await this.prisma.balance.findUnique({
            where: { userId },
        });

        if (!balance) {
            // Return zero balance if no record exists
            return {
                user_id: userId,
                available: '0.00',
                reserved: '0.00',
                currency: 'USD',
                total: '0.00',
                updated_at: new Date().toISOString(),
            };
        }

        const total = addAmounts(balance.available, balance.reserved);

        return {
            user_id: userId,
            available: balance.available,
            reserved: balance.reserved,
            currency: balance.currency,
            total,
            updated_at: balance.updatedAt.toISOString(),
        };
    }

    /**
     * Synchronizes local balance with provider (Airtm) balance.
     * Used for reconciliation and consistency checks.
     *
     * @param userId - The user's internal ID
     * @returns Sync result with discrepancy details
     */
    async syncBalanceFromProvider(userId: string): Promise<SyncResult> {
        this.logger.log(`Syncing balance from provider for user ${userId}`);

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
            return {
                synced: false,
                localBalance: '0.00',
                providerBalance: '0.00',
                discrepancy: '0.00',
                action: 'none',
            };
        }

        const localBalance = await this.getBalance(userId);

        let providerBalance: string;
        try {
            const airtmBalance = await this.airtmUser.getBalance(user.airtmUserId);
            providerBalance = formatAmount(airtmBalance.available);
        } catch (error) {
            this.logger.warn(`Failed to fetch Airtm balance for user ${userId}: ${error}`);
            return {
                synced: false,
                localBalance: localBalance.available,
                providerBalance: 'unknown',
                discrepancy: 'unknown',
                action: 'none',
            };
        }

        const discrepancy = subtractAmounts(providerBalance, localBalance.available);
        const discrepancyValue = parseFloat(discrepancy);
        const hasDiscrepancy = discrepancyValue !== 0;

        await this.prisma.auditLog.create({
            data: {
                id: generateAuditLogId(),
                marketplaceId: 'system',
                userId,
                action: 'BALANCE_SYNC',
                resourceType: 'balance',
                resourceId: userId,
                payloadBefore: { localAvailable: localBalance.available },
                payloadAfter: { providerAvailable: providerBalance, discrepancy },
                actorType: 'system',
                result: hasDiscrepancy ? 'DISCREPANCY_FOUND' : 'SUCCESS',
            },
        });

        if (hasDiscrepancy) {
            this.logger.warn(
                `Balance discrepancy detected for user ${userId}: ` +
                `local=${localBalance.available}, provider=${providerBalance}, diff=${discrepancy}`,
            );
        } else {
            this.logger.log(`Balance sync complete for user ${userId}: No discrepancy`);
        }

        return {
            synced: true,
            localBalance: localBalance.available,
            providerBalance,
            discrepancy,
            action: hasDiscrepancy ? 'flagged' : 'none',
        };
    }

    /**
     * Gets balance with provider verification.
     * Fetches local balance and compares with provider.
     *
     * @param userId - The user's internal ID
     * @returns Balance with provider verification status
     * @throws BalanceDiscrepancyException if significant discrepancy detected
     */
    async getBalanceWithProviderCheck(userId: string): Promise<BalanceResponse & { providerVerified: boolean }> {
        const localBalance = await this.getBalance(userId);
        const syncResult = await this.syncBalanceFromProvider(userId);

        if (syncResult.action === 'flagged') {
            const discrepancyAmount = Math.abs(parseFloat(syncResult.discrepancy));

            // Throw exception if discrepancy is significant (> $1.00)
            if (discrepancyAmount > 1.0) {
                throw new BalanceDiscrepancyException(
                    userId,
                    syncResult.localBalance,
                    syncResult.providerBalance,
                    'USD',
                );
            }
        }

        return {
            ...localBalance,
            providerVerified: syncResult.synced && syncResult.action === 'none',
        };
    }

    /**
     * Validates that an amount is in the correct format.
     * @throws InvalidAmountException if amount is invalid
     */
    private validateAmount(amount: string): void {
        if (!isValidAmount(amount)) {
            throw new InvalidAmountException(amount);
        }

        // Also validate it's positive
        if (parseFloat(amount) <= 0) {
            throw new InvalidAmountException(amount);
        }
    }

    /**
     * Gets or creates a balance record for a user within a transaction.
     */
    private async getOrCreateBalanceInTx(
        tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0],
        userId: string,
    ): Promise<BalanceData> {
        let balance = await tx.balance.findUnique({
            where: { userId },
        });

        if (!balance) {
            // Create balance record with zero values
            balance = await tx.balance.create({
                data: {
                    userId,
                    available: '0.00',
                    reserved: '0.00',
                    currency: 'USD',
                },
            });
        }

        return balance;
    }

    /**
     * Executes an atomic balance operation with transaction, audit logging, and event emission.
     */
    private async executeAtomicOperation(
        userId: string,
        operation: string,
        amount: string,
        calculateNewBalance: (balance: BalanceData) => Promise<{ available: string; reserved: string }>,
        metadata: Record<string, unknown> = {},
    ): Promise<BalanceOperationResult> {
        const auditId = generateAuditLogId();

        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const balance = await this.getOrCreateBalanceInTx(tx, userId);

                const previousBalance = {
                    available: balance.available,
                    reserved: balance.reserved,
                };

                const newBalance = await calculateNewBalance(balance);

                if (parseFloat(newBalance.available) < 0 || parseFloat(newBalance.reserved) < 0) {
                    throw new BalanceConcurrencyException(userId, operation);
                }

                const updatedBalance = await tx.balance.update({
                    where: { userId },
                    data: {
                        available: newBalance.available,
                        reserved: newBalance.reserved,
                    },
                });

                await tx.auditLog.create({
                    data: {
                        id: auditId,
                        marketplaceId: 'system',
                        userId,
                        action: operation,
                        resourceType: 'balance',
                        resourceId: balance.id,
                        payloadBefore: previousBalance,
                        payloadAfter: newBalance,
                        actorType: 'system',
                        result: 'SUCCESS',
                        ...metadata,
                    },
                });

                return { balance: updatedBalance, previousBalance, newBalance };
            }, {
                isolationLevel: 'Serializable',
                timeout: 10000,
            });

            // Emit appropriate domain event
            this.emitOperationEvent(userId, operation, amount, result.previousBalance, result.newBalance, metadata);

            this.logger.log(`${operation} completed for user ${userId}: ${amount}`);

            return {
                success: true,
                balance: {
                    user_id: userId,
                    available: result.newBalance.available,
                    reserved: result.newBalance.reserved,
                    currency: result.balance.currency,
                    total: addAmounts(result.newBalance.available, result.newBalance.reserved),
                    updated_at: result.balance.updatedAt.toISOString(),
                },
                operation,
                amount,
                previousBalance: result.previousBalance,
                newBalance: result.newBalance,
                auditLogId: auditId,
            };
        } catch (error) {
            await this.prisma.auditLog.create({
                data: {
                    id: auditId,
                    marketplaceId: 'system',
                    userId,
                    action: operation,
                    resourceType: 'balance',
                    resourceId: userId,
                    payloadBefore: { amount },
                    actorType: 'system',
                    result: 'FAILURE',
                    error: {
                        message: error instanceof Error ? error.message : 'Unknown error',
                    },
                },
            }).catch((auditError) => {
                this.logger.error(`Failed to log audit for failed operation: ${auditError}`);
            });

            throw error;
        }
    }

    /**
     * Helper to emit appropriate domain event for a balance operation.
     */
    private emitOperationEvent(
        userId: string,
        operation: string,
        amount: string,
        previousBalance: { available: string; reserved: string },
        newBalance: { available: string; reserved: string },
        metadata: Record<string, unknown>,
    ) {
        const commonMetadata = EventBusService.createMetadata({ userId });
        const currency = (metadata.currency as string) || 'USD';

        switch (operation) {
            case 'CREDIT_AVAILABLE':
                this.eventBus.emit<BalanceCreditedPayload>({
                    eventType: EVENT_CATALOG.BALANCE_CREDITED,
                    aggregateId: userId,
                    aggregateType: 'Balance',
                    payload: {
                        userId,
                        amount,
                        currency,
                        source: (metadata.source as any) || 'other',
                        sourceId: (metadata.sourceId as string) || (metadata.reference as string),
                        previousAvailableBalance: previousBalance.available,
                        newAvailableBalance: newBalance.available,
                    },
                    metadata: commonMetadata,
                });
                break;
            case 'DEBIT_AVAILABLE':
                this.eventBus.emit<BalanceDebitedPayload>({
                    eventType: EVENT_CATALOG.BALANCE_DEBITED,
                    aggregateId: userId,
                    aggregateType: 'Balance',
                    payload: {
                        userId,
                        amount,
                        currency,
                        destination: (metadata.destination as any) || 'other',
                        destinationId: (metadata.destinationId as string) || (metadata.reference as string),
                        previousAvailableBalance: previousBalance.available,
                        newAvailableBalance: newBalance.available,
                    },
                    metadata: commonMetadata,
                });
                break;
            case 'RESERVE':
                this.eventBus.emit<BalanceReservedPayload>({
                    eventType: EVENT_CATALOG.BALANCE_RESERVED,
                    aggregateId: userId,
                    aggregateType: 'Balance',
                    payload: {
                        userId,
                        amount,
                        currency,
                        orderId: (metadata.orderId as string) || 'unknown',
                        previousReservedBalance: previousBalance.reserved,
                        newReservedBalance: newBalance.reserved,
                        previousAvailableBalance: previousBalance.available,
                        newAvailableBalance: newBalance.available,
                    },
                    metadata: commonMetadata,
                });
                break;
            case 'CANCEL_RESERVATION':
                this.eventBus.emit<BalanceReleasedPayload>({
                    eventType: EVENT_CATALOG.BALANCE_RELEASED,
                    aggregateId: userId,
                    aggregateType: 'Balance',
                    payload: {
                        userId,
                        amount,
                        currency,
                        orderId: (metadata.orderId as string) || 'unknown',
                        reason: 'cancel',
                        previousReservedBalance: previousBalance.reserved,
                        newReservedBalance: newBalance.reserved,
                        previousAvailableBalance: previousBalance.available,
                        newAvailableBalance: newBalance.available,
                    },
                    metadata: commonMetadata,
                });
                break;
            case 'DEDUCT_RESERVED':
                this.eventBus.emit<BalanceReleasedPayload>({
                    eventType: EVENT_CATALOG.BALANCE_RELEASED,
                    aggregateId: userId,
                    aggregateType: 'Balance',
                    payload: {
                        userId,
                        amount,
                        currency,
                        orderId: (metadata.orderId as string) || 'unknown',
                        reason: 'escrow_funded',
                        previousReservedBalance: previousBalance.reserved,
                        newReservedBalance: newBalance.reserved,
                        previousAvailableBalance: previousBalance.available,
                        newAvailableBalance: newBalance.available,
                    },
                    metadata: commonMetadata,
                });
                break;
        }
    }
}
