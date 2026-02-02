import { Injectable, Inject, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EventBusService, EVENT_CATALOG } from '../events';
import {
    OrderCreatedPayload,
    OrderFundsReservedPayload,
    OrderEscrowCreatingPayload,
    OrderEscrowFundingPayload,
    OrderCanceledPayload,
} from '../events/types';
import type { Order, Escrow, Milestone } from '@prisma/client';
import {
    isValidAmount,
    addAmounts,
    compareAmounts,
    generateOrderId,
    generateEscrowId,
    generateAuditLogId,
    OrderStateMachine,
    OrderStatus,
    EscrowStatus,
    MilestoneStatus,
    CANCELLABLE_ORDER_STATES,
} from '@offerhub/shared';
import { PrismaService } from '../database/prisma.service';
import { BalanceService } from '../balance/balance.service';
import { EscrowClient } from '../../providers/trustless-work/clients/escrow.client';
import { InsufficientFundsException } from '../balance/exceptions';
import {
    OrderNotFoundException,
    InvalidOrderStateException,
    MilestoneValidationException,
    EscrowAlreadyExistsException,
    SameUserException,
    EscrowFundingFailedException,
    MilestoneNotFoundException,
    MilestoneAlreadyCompletedException,
} from './exceptions';
import type { CreateOrderDto, MilestoneDto } from './dto';

/**
 * Order with relations.
 */
export interface OrderWithRelations extends Order {
    escrow?: Escrow | null;
    milestones?: Milestone[];
}

/**
 * Orders Service - Order & Escrow Orchestrator
 *
 * Manages the complete lifecycle of marketplace orders:
 * - Order creation with milestones
 * - Funds reservation via BalanceService
 * - Stellar escrow creation and funding
 * - Milestone tracking and completion
 * - Order cancellation
 *
 * @see docs/architecture/state-machines.md#order-states
 */
@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(
        @Inject(PrismaService) private readonly prisma: PrismaService,
        @Inject(BalanceService) private readonly balanceService: BalanceService,
        @Inject(EscrowClient) private readonly escrowClient: EscrowClient,
        @Inject(EventBusService) private readonly eventBus: EventBusService,
    ) { }

    /**
     * Creates a new order with optional milestones.
     *
     * @param dto - Order creation data
     * @returns Created order with milestones
     */
    async createOrder(dto: CreateOrderDto): Promise<OrderWithRelations> {
        if (dto.buyer_id === dto.seller_id) {
            throw new SameUserException();
        }

        if (!isValidAmount(dto.amount)) {
            throw new MilestoneValidationException('Invalid order amount format');
        }

        const [buyer, seller] = await Promise.all([
            this.prisma.user.findUnique({ where: { id: dto.buyer_id } }),
            this.prisma.user.findUnique({ where: { id: dto.seller_id } }),
        ]);

        if (!buyer) {
            throw new OrderNotFoundException(dto.buyer_id);
        }
        if (!seller) {
            throw new OrderNotFoundException(dto.seller_id);
        }

        if (dto.milestones?.length) {
            this.validateMilestones(dto.milestones, dto.amount);
        }

        this.logger.log(
            `Creating order: buyer=${dto.buyer_id}, seller=${dto.seller_id}, amount=${dto.amount}`,
        );

        const order = await this.prisma.$transaction(
            async (tx) => {
                const createdOrder = await tx.order.create({
                    data: {
                        id: generateOrderId(),
                        clientOrderRef: dto.client_order_ref,
                        buyerId: dto.buyer_id,
                        sellerId: dto.seller_id,
                        amount: dto.amount,
                        currency: dto.currency || 'USD',
                        status: OrderStatus.ORDER_CREATED,
                        title: dto.title,
                        description: dto.description,
                        metadata: dto.metadata,
                    },
                });

                if (dto.milestones?.length) {
                    await tx.milestone.createMany({
                        data: dto.milestones.map((m) => ({
                            orderId: createdOrder.id,
                            milestoneRef: m.milestone_ref,
                            title: m.title,
                            amount: m.amount,
                            status: MilestoneStatus.OPEN,
                        })),
                    });
                }

                await tx.auditLog.create({
                    data: {
                        id: generateAuditLogId(),
                        marketplaceId: 'system',
                        userId: dto.buyer_id,
                        action: 'ORDER_CREATED',
                        resourceType: 'order',
                        resourceId: createdOrder.id,
                        payloadBefore: Prisma.JsonNull,
                        payloadAfter: {
                            status: OrderStatus.ORDER_CREATED,
                            amount: dto.amount,
                            milestoneCount: dto.milestones?.length || 0,
                        },
                        actorType: 'system',
                        result: 'SUCCESS',
                    },
                });

                return createdOrder;
            },
            {
                isolationLevel: 'Serializable',
                timeout: 10000,
            },
        );

        this.eventBus.emit<OrderCreatedPayload>({
            eventType: EVENT_CATALOG.ORDER_CREATED,
            aggregateId: order.id,
            aggregateType: 'Order',
            payload: {
                orderId: order.id,
                buyerId: dto.buyer_id,
                sellerId: dto.seller_id,
                amount: dto.amount,
                currency: dto.currency || 'USD',
                title: dto.title,
            },
            metadata: EventBusService.createMetadata({ userId: dto.buyer_id }),
        });

        this.logger.log(`Order created: ${order.id}`);

        return this.getOrder(order.id);
    }

    /**
     * Reserves funds for an order from the buyer's balance.
     *
     * @param orderId - The order ID
     * @returns Updated order
     */
    async reserveFunds(orderId: string): Promise<OrderWithRelations> {
        const order = await this.getOrder(orderId);

        if (order.status !== OrderStatus.ORDER_CREATED) {
            throw new InvalidOrderStateException(orderId, order.status as OrderStatus, 'reserve funds');
        }

        OrderStateMachine.assertTransition(order.status as OrderStatus, OrderStatus.FUNDS_RESERVED);

        this.logger.log(`Reserving ${order.amount} for order ${orderId} from buyer ${order.buyerId}`);

        try {
            await this.balanceService.reserve(order.buyerId, {
                amount: order.amount,
                currency: order.currency,
                orderId: order.id,
                description: `Funds reserved for order ${order.id}`,
            });
        } catch (error) {
            if (error instanceof InsufficientFundsException) {
                this.logger.warn(
                    `Insufficient funds for order ${orderId}: buyer=${order.buyerId}, required=${order.amount}`,
                );
            }
            throw error;
        }

        const updatedOrder = await this.prisma.$transaction(
            async (tx) => {
                const updated = await tx.order.update({
                    where: { id: orderId },
                    data: { status: OrderStatus.FUNDS_RESERVED },
                });

                await tx.auditLog.create({
                    data: {
                        id: generateAuditLogId(),
                        marketplaceId: 'system',
                        userId: order.buyerId,
                        action: 'FUNDS_RESERVED',
                        resourceType: 'order',
                        resourceId: orderId,
                        payloadBefore: { status: OrderStatus.ORDER_CREATED },
                        payloadAfter: { status: OrderStatus.FUNDS_RESERVED },
                        actorType: 'system',
                        result: 'SUCCESS',
                    },
                });

                return updated;
            },
            {
                isolationLevel: 'Serializable',
                timeout: 10000,
            },
        );

        this.eventBus.emit<OrderFundsReservedPayload>({
            eventType: EVENT_CATALOG.ORDER_FUNDS_RESERVED,
            aggregateId: orderId,
            aggregateType: 'Order',
            payload: {
                orderId,
                amount: order.amount,
                currency: order.currency,
                buyerId: order.buyerId,
                reservedBalance: 'unknown',
                availableBalance: 'unknown',
            },
            metadata: EventBusService.createMetadata({ userId: order.buyerId }),
        });

        this.logger.log(`Funds reserved for order ${orderId}`);

        return this.getOrder(updatedOrder.id);
    }

    /**
     * Cancels an order and releases reserved funds if applicable.
     * Can only cancel orders in ORDER_CREATED or FUNDS_RESERVED states.
     *
     * @param orderId - The order ID
     * @param reason - Optional cancellation reason
     * @returns Updated order
     */
    async cancelOrder(orderId: string, reason?: string): Promise<OrderWithRelations> {
        const order = await this.getOrder(orderId);

        if (!CANCELLABLE_ORDER_STATES.includes(order.status as OrderStatus)) {
            throw new InvalidOrderStateException(orderId, order.status as OrderStatus, 'cancel');
        }

        this.logger.log(`Cancelling order ${orderId} from state ${order.status}`);

        if (order.status === OrderStatus.FUNDS_RESERVED) {
            await this.balanceService.cancelReservation(order.buyerId, {
                amount: order.amount,
                currency: order.currency,
                orderId: order.id,
                description: reason || `Order ${order.id} cancelled`,
            });
        }

        const updatedOrder = await this.prisma.$transaction(
            async (tx) => {
                const updated = await tx.order.update({
                    where: { id: orderId },
                    data: { status: OrderStatus.CLOSED },
                });

                await tx.auditLog.create({
                    data: {
                        id: generateAuditLogId(),
                        marketplaceId: 'system',
                        userId: order.buyerId,
                        action: 'ORDER_CANCELLED',
                        resourceType: 'order',
                        resourceId: orderId,
                        payloadBefore: { status: order.status },
                        payloadAfter: { status: OrderStatus.CLOSED, reason },
                        actorType: 'system',
                        result: 'SUCCESS',
                    },
                });

                return updated;
            },
            {
                isolationLevel: 'Serializable',
                timeout: 10000,
            },
        );

        this.eventBus.emit<OrderCanceledPayload>({
            eventType: EVENT_CATALOG.ORDER_CANCELED,
            aggregateId: orderId,
            aggregateType: 'Order',
            payload: {
                orderId,
                buyerId: order.buyerId,
                canceledBy: 'user',
                canceledAt: new Date().toISOString(),
                fundsReleased: order.status === OrderStatus.FUNDS_RESERVED,
                reason,
            },
            metadata: EventBusService.createMetadata({ userId: order.buyerId }),
        });

        this.logger.log(`Order cancelled: ${orderId}`);

        return this.getOrder(updatedOrder.id);
    }

    /**
     * Creates a Stellar escrow contract for the order.
     * Requires order to be in FUNDS_RESERVED state.
     *
     * @param orderId - The order ID
     * @returns Updated order with escrow
     */
    async createEscrow(orderId: string): Promise<OrderWithRelations> {
        const order = await this.getOrder(orderId);

        if (order.status !== OrderStatus.FUNDS_RESERVED) {
            throw new InvalidOrderStateException(orderId, order.status as OrderStatus, 'create escrow');
        }

        if (order.escrow) {
            throw new EscrowAlreadyExistsException(orderId);
        }

        OrderStateMachine.assertTransition(order.status as OrderStatus, OrderStatus.ESCROW_CREATING);

        this.logger.log(`Creating escrow for order ${orderId}`);

        const [buyer, seller] = await Promise.all([
            this.prisma.user.findUnique({ where: { id: order.buyerId } }),
            this.prisma.user.findUnique({ where: { id: order.sellerId } }),
        ]);

        if (!buyer?.airtmUserId || !seller?.airtmUserId) {
            throw new Error('Both buyer and seller must have Airtm accounts');
        }

        try {
            await this.prisma.$transaction(
                async (tx) => {
                    await tx.order.update({
                        where: { id: orderId },
                        data: { status: OrderStatus.ESCROW_CREATING },
                    });

                    await tx.auditLog.create({
                        data: {
                            id: generateAuditLogId(),
                            marketplaceId: 'system',
                            userId: order.buyerId,
                            action: 'ESCROW_CREATING',
                            resourceType: 'order',
                            resourceId: orderId,
                            payloadBefore: { status: OrderStatus.FUNDS_RESERVED },
                            payloadAfter: { status: OrderStatus.ESCROW_CREATING },
                            actorType: 'system',
                            result: 'SUCCESS',
                        },
                    });
                },
                {
                    isolationLevel: 'Serializable',
                    timeout: 10000,
                },
            );

            const milestonesData = order.milestones?.map((m) => ({
                ref: m.milestoneRef,
                title: m.title,
                amount: m.amount,
            }));

            const escrowResponse = await this.escrowClient.createEscrow(
                {
                    order_id: order.id,
                    buyer_address: buyer.airtmUserId,
                    seller_address: seller.airtmUserId,
                    amount: order.amount,
                    milestones: milestonesData,
                    metadata: {
                        title: order.title,
                        description: order.description || '',
                    },
                },
                buyer.airtmUserId,
            );

            const escrow = await this.prisma.escrow.create({
                data: {
                    id: generateEscrowId(),
                    orderId: order.id,
                    trustlessContractId: escrowResponse.contractId,
                    status: EscrowStatus.CREATING,
                    amount: order.amount,
                    terms: milestonesData ? { milestones_required: true } : Prisma.JsonNull,
                },
            });

            this.eventBus.emit<OrderEscrowCreatingPayload>({
                eventType: EVENT_CATALOG.ORDER_ESCROW_CREATING,
                aggregateId: orderId,
                aggregateType: 'Order',
                payload: {
                    orderId,
                    escrowId: escrow.id,
                    amount: order.amount,
                },
                metadata: EventBusService.createMetadata({ userId: order.buyerId }),
            });

            this.logger.log(`Escrow created for order ${orderId}: ${escrow.id}`);
        } catch (error) {
            this.logger.error(`Failed to create escrow for order ${orderId}:`, error);

            await this.prisma.$transaction(
                async (tx) => {
                    await tx.order.update({
                        where: { id: orderId },
                        data: { status: OrderStatus.FUNDS_RESERVED },
                    });

                    await tx.auditLog.create({
                        data: {
                            id: generateAuditLogId(),
                            marketplaceId: 'system',
                            userId: order.buyerId,
                            action: 'ESCROW_CREATE_FAILED',
                            resourceType: 'order',
                            resourceId: orderId,
                            payloadBefore: { status: OrderStatus.ESCROW_CREATING },
                            payloadAfter: { status: OrderStatus.FUNDS_RESERVED },
                            actorType: 'system',
                            result: 'FAILURE',
                            error: {
                                message: error instanceof Error ? error.message : 'Unknown error',
                            },
                        },
                    });
                },
                {
                    isolationLevel: 'Serializable',
                    timeout: 10000,
                },
            );

            throw error;
        }

        return this.getOrder(orderId);
    }

    /**
     * Funds the Stellar escrow with reserved balance.
     * Requires order to be in ESCROW_FUNDING state.
     *
     * @param orderId - The order ID
     * @returns Updated order
     */
    async fundEscrow(orderId: string): Promise<OrderWithRelations> {
        const order = await this.getOrder(orderId);

        if (order.status !== OrderStatus.ESCROW_FUNDING) {
            throw new InvalidOrderStateException(orderId, order.status as OrderStatus, 'fund escrow');
        }

        if (!order.escrow) {
            throw new Error(`No escrow found for order ${orderId}`);
        }

        if (order.escrow.status !== EscrowStatus.CREATED) {
            throw new Error(`Escrow status must be CREATED, got ${order.escrow.status}`);
        }

        this.logger.log(`Funding escrow for order ${orderId}`);

        const escrowType = order.milestones?.length ? 'multi-release' : 'single-release';

        try {
            await this.balanceService.deductReserved(order.buyerId, {
                amount: order.amount,
                currency: order.currency,
                orderId: order.id,
                description: `Escrow funded for order ${order.id}`,
            });

            await this.escrowClient.fundEscrow(
                order.escrow.trustlessContractId!,
                order.amount,
                escrowType,
            );

            await this.prisma.$transaction(
                async (tx) => {
                    await tx.escrow.update({
                        where: { id: order.escrow!.id },
                        data: { status: EscrowStatus.FUNDING },
                    });

                    await tx.auditLog.create({
                        data: {
                            id: generateAuditLogId(),
                            marketplaceId: 'system',
                            userId: order.buyerId,
                            action: 'ESCROW_FUNDING',
                            resourceType: 'escrow',
                            resourceId: order.escrow!.id,
                            payloadBefore: { status: EscrowStatus.CREATED },
                            payloadAfter: { status: EscrowStatus.FUNDING },
                            actorType: 'system',
                            result: 'SUCCESS',
                        },
                    });
                },
                {
                    isolationLevel: 'Serializable',
                    timeout: 10000,
                },
            );

            this.eventBus.emit<OrderEscrowFundingPayload>({
                eventType: EVENT_CATALOG.ORDER_ESCROW_FUNDING,
                aggregateId: orderId,
                aggregateType: 'Order',
                payload: {
                    orderId,
                    escrowId: order.escrow.id,
                    amount: order.amount,
                    trustlessContractId: order.escrow.trustlessContractId!,
                },
                metadata: EventBusService.createMetadata({ userId: order.buyerId }),
            });

            this.logger.log(`Escrow funded for order ${orderId}`);
        } catch (error) {
            this.logger.error(`Failed to fund escrow for order ${orderId}:`, error);

            try {
                await this.balanceService.reserve(order.buyerId, {
                    amount: order.amount,
                    currency: order.currency,
                    orderId: order.id,
                    description: `Rollback: escrow funding failed for order ${order.id}`,
                });

                await this.prisma.$transaction(
                    async (tx) => {
                        await tx.order.update({
                            where: { id: orderId },
                            data: { status: OrderStatus.FUNDS_RESERVED },
                        });

                        await tx.auditLog.create({
                            data: {
                                id: generateAuditLogId(),
                                marketplaceId: 'system',
                                userId: order.buyerId,
                                action: 'ESCROW_FUNDING_FAILED',
                                resourceType: 'order',
                                resourceId: orderId,
                                payloadBefore: { status: OrderStatus.ESCROW_FUNDING },
                                payloadAfter: { status: OrderStatus.FUNDS_RESERVED },
                                actorType: 'system',
                                result: 'FAILURE',
                                error: {
                                    message: error instanceof Error ? error.message : 'Unknown error',
                                },
                            },
                        });
                    },
                    {
                        isolationLevel: 'Serializable',
                        timeout: 10000,
                    },
                );
            } catch (rollbackError) {
                this.logger.error(`Failed to rollback after escrow funding failure:`, rollbackError);
            }

            throw new EscrowFundingFailedException(error instanceof Error ? error : new Error('Unknown error'));
        }

        return this.getOrder(orderId);
    }

    /**
     * Gets milestones for an order.
     *
     * @param orderId - The order ID
     * @returns Array of milestones
     */
    async getMilestones(orderId: string): Promise<Milestone[]> {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            throw new OrderNotFoundException(orderId);
        }

        return this.prisma.milestone.findMany({
            where: { orderId },
            orderBy: { createdAt: 'asc' },
        });
    }

    /**
     * Marks a milestone as completed and calculates completion percentage.
     *
     * @param orderId - The order ID
     * @param milestoneRef - The milestone reference
     * @returns Updated milestone
     */
    async completeMilestone(orderId: string, milestoneRef: string): Promise<Milestone> {
        const order = await this.getOrder(orderId);

        if (order.status !== OrderStatus.IN_PROGRESS) {
            throw new InvalidOrderStateException(orderId, order.status as OrderStatus, 'complete milestone');
        }

        const milestones = await this.getMilestones(orderId);
        const milestone = milestones.find((m) => m.milestoneRef === milestoneRef);

        if (!milestone) {
            throw new MilestoneNotFoundException(orderId, milestoneRef);
        }

        if (milestone.status === MilestoneStatus.COMPLETED) {
            throw new MilestoneAlreadyCompletedException(milestoneRef);
        }

        this.logger.log(`Completing milestone ${milestoneRef} for order ${orderId}`);

        const updatedMilestone = await this.prisma.$transaction(
            async (tx) => {
                const updated = await tx.milestone.update({
                    where: { id: milestone.id },
                    data: { status: MilestoneStatus.COMPLETED },
                });

                await tx.auditLog.create({
                    data: {
                        id: generateAuditLogId(),
                        marketplaceId: 'system',
                        userId: order.sellerId,
                        action: 'MILESTONE_COMPLETED',
                        resourceType: 'milestone',
                        resourceId: milestone.id,
                        payloadBefore: { status: MilestoneStatus.OPEN },
                        payloadAfter: { status: MilestoneStatus.COMPLETED },
                        actorType: 'system',
                        result: 'SUCCESS',
                    },
                });

                return updated;
            },
            {
                isolationLevel: 'Serializable',
                timeout: 10000,
            },
        );

        const completedCount = milestones.filter(
            (m) => m.status === MilestoneStatus.COMPLETED || m.milestoneRef === milestoneRef,
        ).length;
        const completionPercentage = Math.round((completedCount / milestones.length) * 100);

        this.eventBus.emit({
            eventType: EVENT_CATALOG.ESCROW_MILESTONE_COMPLETED,
            aggregateId: orderId,
            aggregateType: 'Order',
            payload: {
                escrowId: order.escrow?.id || 'unknown',
                milestoneRef,
                completedAt: new Date().toISOString(),
            },
            metadata: EventBusService.createMetadata({ userId: order.sellerId }),
        });

        this.logger.log(
            `Milestone ${milestoneRef} completed for order ${orderId} (${completionPercentage}% complete)`,
        );

        return updatedMilestone;
    }

    /**
     * Gets an order by ID with all relations.
     *
     * @param orderId - The order ID
     * @returns Order with escrow and milestones
     */
    async getOrder(orderId: string): Promise<OrderWithRelations> {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                escrow: true,
                milestones: true,
            },
        });

        if (!order) {
            throw new OrderNotFoundException(orderId);
        }

        return order;
    }

    /**
     * Validates that milestone amounts sum to the total order amount.
     *
     * @param milestones - Array of milestones
     * @param totalAmount - Total order amount
     */
    private validateMilestones(milestones: MilestoneDto[], totalAmount: string): void {
        const sum = milestones.reduce((acc, m) => {
            if (!isValidAmount(m.amount)) {
                throw new MilestoneValidationException(`Invalid milestone amount format: ${m.amount}`);
            }
            return addAmounts(acc, m.amount);
        }, '0.00');

        if (compareAmounts(sum, totalAmount) !== 0) {
            throw new MilestoneValidationException(
                `Milestone amounts sum (${sum}) must equal order amount (${totalAmount})`,
            );
        }
    }
}
