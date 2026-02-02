import { Injectable, Inject, Logger } from '@nestjs/common';
import { EventBusService, EVENT_CATALOG } from '../events';
import {
    OrderReleaseRequestedPayload,
    OrderReleasedPayload,
    OrderClosedPayload,
    OrderRefundRequestedPayload,
    OrderRefundedPayload
} from '../events/types/order-events';
import {
    DisputeOpenedPayload,
    DisputeUnderReviewPayload,
    DisputeResolvedPayload
} from '../events/types/dispute-events';
import { Prisma, MilestoneStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { BalanceService } from '../balance/balance.service';
import { EscrowClient } from '../../providers/trustless-work/clients/escrow.client';
import { OrdersService, OrderWithRelations } from '../orders/orders.service';
import {
    generateAuditLogId,
    generateDisputeId,
    OrderStateMachine,
    DisputeStateMachine,
    addAmounts,
    compareAmounts,
    OrderStatus,
    EscrowStatus,
    DisputeStatus,
    ResolutionDecision,
} from '@offerhub/shared';
import { ReleaseMode } from '../../providers/trustless-work/dto/release.dto';
import { RefundMode } from '../../providers/trustless-work/dto/refund.dto';
import type { OpenDisputeDto, AssignDisputeDto, ResolveDisputeDto } from './dto';
import {
    DisputeNotFoundException,
    DisputeAlreadyExistsException,
    InvalidDisputeStateException,
    InvalidDisputeResolutionException,
    MutuallyExclusiveResolutionException,
    ActiveDisputeException,
    InvalidResolutionStateException,
} from './exceptions';

/**
 * Order with relations including dispute.
 */
export interface OrderWithDispute extends OrderWithRelations {
    dispute?: {
        id: string;
        orderId: string;
        openedBy: string;
        reason: string;
        evidence: any;
        status: DisputeStatus;
        resolutionDecision: ResolutionDecision | null;
        decisionNote: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null;
}

/**
 * Dispute with order relation.
 */
export interface DisputeWithRelations {
    id: string;
    orderId: string;
    openedBy: string;
    reason: string;
    evidence: any;
    status: DisputeStatus;
    resolutionDecision: ResolutionDecision | null;
    decisionNote: string | null;
    createdAt: Date;
    updatedAt: Date;
    order?: OrderWithRelations;
}

/**
 * Resolution Orchestrator Service
 *
 * Manages the financial conclusion of marketplace orders through three primary workflows:
 * 1. Release Flow (4.4.1): Fund release to sellers after order completion
 * 2. Refund Flow (4.4.2): Refunds to buyers for cancelled/incomplete orders
 * 3. Dispute Management (4.4.3): Disputes with fractional splits
 *
 * @see docs/architecture/resolution-orchestrator.md
 */
@Injectable()
export class ResolutionService {
    private readonly logger = new Logger(ResolutionService.name);

    constructor(
        @Inject(PrismaService) private readonly prisma: PrismaService,
        @Inject(BalanceService) private readonly balanceService: BalanceService,
        @Inject(EscrowClient) private readonly escrowClient: EscrowClient,
        @Inject(OrdersService) private readonly ordersService: OrdersService,
        @Inject(EventBusService) private readonly eventBus: EventBusService,
    ) { }

    /**
     * Request release of funds to seller.
     * Validates order state, confirms milestone completion, triggers escrow release.
     *
     * @param orderId Order ID
     * @param reason Optional reason for release
     * @returns Updated order
     */
    async requestRelease(orderId: string, reason?: string): Promise<OrderWithRelations> {
        this.logger.debug(`Requesting release for order ${orderId}`);

        // 1. Get order with escrow and milestones
        const order = await this.ordersService.getOrder(orderId);

        if (!order.escrow) {
            throw new InvalidResolutionStateException(
                orderId,
                order.status,
                'Order must have escrow',
            );
        }

        // 2. Validate state is IN_PROGRESS
        if (order.status !== OrderStatus.IN_PROGRESS) {
            throw new InvalidResolutionStateException(
                orderId,
                order.status,
                OrderStatus.IN_PROGRESS,
            );
        }

        // 3. Validate no active dispute exists
        this.validateNoActiveDispute(order);

        // 4. Validate all milestones COMPLETED (if exist)
        if (order.milestones && order.milestones.length > 0) {
            const incompleteMilestones = order.milestones.filter(
                (m) => m.status !== MilestoneStatus.COMPLETED,
            );

            if (incompleteMilestones.length > 0) {
                throw new InvalidResolutionStateException(
                    orderId,
                    order.status,
                    `All milestones must be completed. Incomplete: ${incompleteMilestones.map((m) => m.milestoneRef).join(', ')}`,
                );
            }
        }

        // 5. Validate escrow is FUNDED
        if (order.escrow.status !== EscrowStatus.FUNDED) {
            throw new InvalidResolutionStateException(
                orderId,
                order.escrow.status,
                EscrowStatus.FUNDED,
            );
        }

        // 6. Use OrderStateMachine.assertTransition
        OrderStateMachine.assertTransition(order.status as OrderStatus, OrderStatus.RELEASE_REQUESTED);

        // 7. Update order → RELEASE_REQUESTED in transaction
        const updated = await this.prisma.$transaction(
            async (tx) => {
                const updatedOrder = await tx.order.update({
                    where: { id: orderId },
                    data: { status: OrderStatus.RELEASE_REQUESTED },
                    include: {
                        escrow: true,
                        dispute: true,
                        milestones: true,
                    },
                });

                // Create audit log
                await tx.auditLog.create({
                    data: {
                        id: generateAuditLogId(),
                        marketplaceId: 'system',
                        userId: order.buyerId,
                        action: 'RELEASE_REQUESTED',
                        resourceType: 'order',
                        resourceId: orderId,
                        payloadBefore: { status: order.status },
                        payloadAfter: { status: OrderStatus.RELEASE_REQUESTED, reason },
                        actorType: 'system',
                        result: 'SUCCESS',
                    },
                });

                return updatedOrder;
            },
            {
                isolationLevel: 'Serializable',
                timeout: 10000,
            },
        );

        // 8. Determine escrow type (multi-release if milestones)
        const escrowType =
            order.milestones && order.milestones.length > 1 ? 'multi-release' : 'single-release';

        // 9. Call escrowClient.releaseEscrow
        try {
            await this.escrowClient.releaseEscrow(
                order.escrow.trustlessContractId!,
                {
                    mode: ReleaseMode.FULL,
                    reason: reason || 'Order completed successfully',
                },
                escrowType,
            );

            // 10. Update escrow → RELEASING
            await this.prisma.escrow.updateMany({
                where: { orderId },
                data: { status: EscrowStatus.RELEASING },
            });
        } catch (error: any) {
            this.logger.error(`Failed to release escrow for order ${orderId}:`, error);
            // Rollback order status
            await this.prisma.order.update({
                where: { id: orderId },
                data: { status: OrderStatus.IN_PROGRESS },
            });
            throw error;
        }

        // 11. Emit event
        this.eventBus.emit<OrderReleaseRequestedPayload>({
            eventType: EVENT_CATALOG.ORDER_RELEASE_REQUESTED,
            aggregateId: orderId,
            aggregateType: 'Order',
            payload: {
                orderId,
                requestedBy: order.buyerId, // Usually buyer requests release
                requestedAt: new Date().toISOString(),
            },
            metadata: EventBusService.createMetadata({ userId: order.buyerId }),
        });

        this.logger.log(`Release requested for order ${orderId}`);

        return updated as OrderWithRelations;
    }

    /**
     * Confirm release of funds to seller (called by webhook).
     * Completes release via webhook, credits seller balance, closes order.
     *
     * @param orderId Order ID
     * @returns Updated order
     */
    async confirmRelease(orderId: string): Promise<OrderWithRelations> {
        this.logger.debug(`Confirming release for order ${orderId}`);

        // 1. Get order with escrow, buyer, seller
        const order = await this.ordersService.getOrder(orderId);

        if (!order.escrow) {
            throw new InvalidResolutionStateException(
                orderId,
                order.status,
                'Order must have escrow',
            );
        }

        // 2. Validate state is RELEASE_REQUESTED
        if (order.status !== OrderStatus.RELEASE_REQUESTED) {
            throw new InvalidResolutionStateException(
                orderId,
                order.status,
                OrderStatus.RELEASE_REQUESTED,
            );
        }

        // 3. Use OrderStateMachine.assertTransition
        OrderStateMachine.assertTransition(order.status as OrderStatus, OrderStatus.RELEASED);

        // 4. Use BalanceService.release
        await this.balanceService.release(order.buyerId, {
            amount: order.amount,
            orderId: order.id,
            sellerId: order.sellerId,
        });

        // 5. Update order → RELEASED → CLOSED in transaction
        const updated = await this.prisma.$transaction(
            async (tx) => {
                const releasedOrder = await tx.order.update({
                    where: { id: orderId },
                    data: { status: OrderStatus.RELEASED },
                    include: {
                        escrow: true,
                        dispute: true,
                        milestones: true,
                    },
                });

                const closedOrder = await tx.order.update({
                    where: { id: orderId },
                    data: { status: OrderStatus.CLOSED },
                    include: {
                        escrow: true,
                        dispute: true,
                        milestones: true,
                    },
                });

                // Update escrow releasedAt timestamp
                await tx.escrow.updateMany({
                    where: { orderId },
                    data: {
                        status: EscrowStatus.RELEASED,
                        releasedAt: new Date(),
                    },
                });

                // Create audit log
                await tx.auditLog.create({
                    data: {
                        id: generateAuditLogId(),
                        marketplaceId: 'system',
                        userId: order.sellerId,
                        action: 'RELEASED',
                        resourceType: 'order',
                        resourceId: orderId,
                        payloadBefore: { status: order.status },
                        payloadAfter: { status: OrderStatus.CLOSED },
                        actorType: 'system',
                        result: 'SUCCESS',
                    },
                });

                return closedOrder;
            },
            {
                isolationLevel: 'Serializable',
                timeout: 10000,
            },
        );

        // 6. Emit events
        this.eventBus.emit<OrderReleasedPayload>({
            eventType: EVENT_CATALOG.ORDER_RELEASED,
            aggregateId: orderId,
            aggregateType: 'Order',
            payload: {
                orderId,
                sellerId: order.sellerId,
                amount: order.amount,
                currency: order.currency,
                releasedAt: new Date().toISOString(),
                newSellerBalance: 'unknown',
            },
            metadata: EventBusService.createMetadata({ userId: order.buyerId }),
        });

        this.eventBus.emit<OrderClosedPayload>({
            eventType: EVENT_CATALOG.ORDER_CLOSED,
            aggregateId: orderId,
            aggregateType: 'Order',
            payload: {
                orderId,
                finalStatus: OrderStatus.CLOSED,
                closedAt: new Date().toISOString(),
            },
            metadata: EventBusService.createMetadata({ userId: order.buyerId }),
        });

        this.logger.log(`Release confirmed for order ${orderId}`);

        return updated as OrderWithRelations;
    }

    /**
     * Request refund to buyer.
     * Validates eligibility, triggers escrow refund.
     *
     * @param orderId Order ID
     * @param reason Refund reason (required)
     * @returns Updated order
     */
    async requestRefund(orderId: string, reason: string): Promise<OrderWithRelations> {
        this.logger.debug(`Requesting refund for order ${orderId}`);

        // 1. Get order with escrow
        const order = await this.ordersService.getOrder(orderId);

        if (!order.escrow) {
            throw new InvalidResolutionStateException(
                orderId,
                order.status,
                'Order must have escrow',
            );
        }

        // 2. Validate state is IN_PROGRESS
        if (order.status !== OrderStatus.IN_PROGRESS) {
            throw new InvalidResolutionStateException(
                orderId,
                order.status,
                OrderStatus.IN_PROGRESS,
            );
        }

        // 3. Validate no active dispute
        this.validateNoActiveDispute(order);

        // 4. Validate escrow is FUNDED
        if (order.escrow.status !== EscrowStatus.FUNDED) {
            throw new InvalidResolutionStateException(
                orderId,
                order.escrow.status,
                EscrowStatus.FUNDED,
            );
        }

        // 5. Use OrderStateMachine.assertTransition
        OrderStateMachine.assertTransition(order.status as OrderStatus, OrderStatus.REFUND_REQUESTED);

        // 6. Update order → REFUND_REQUESTED in transaction
        const updated = await this.prisma.$transaction(
            async (tx) => {
                const updatedOrder = await tx.order.update({
                    where: { id: orderId },
                    data: { status: OrderStatus.REFUND_REQUESTED },
                    include: {
                        escrow: true,
                        dispute: true,
                        milestones: true,
                    },
                });

                // Create audit log with reason
                await tx.auditLog.create({
                    data: {
                        id: generateAuditLogId(),
                        marketplaceId: 'system',
                        userId: order.buyerId,
                        action: 'REFUND_REQUESTED',
                        resourceType: 'order',
                        resourceId: orderId,
                        payloadBefore: { status: order.status },
                        payloadAfter: { status: OrderStatus.REFUND_REQUESTED, reason },
                        actorType: 'system',
                        result: 'SUCCESS',
                    },
                });

                return updatedOrder;
            },
            {
                isolationLevel: 'Serializable',
                timeout: 10000,
            },
        );

        // 7. Call escrowClient.refundEscrow
        try {
            await this.escrowClient.refundEscrow(order.escrow.trustlessContractId!, {
                mode: RefundMode.FULL,
                reason,
            });

            // 8. Update escrow → REFUNDING
            await this.prisma.escrow.updateMany({
                where: { orderId },
                data: { status: EscrowStatus.REFUNDING },
            });
        } catch (error: any) {
            this.logger.error(`Failed to refund escrow for order ${orderId}:`, error);
            // Rollback order status
            await this.prisma.order.update({
                where: { id: orderId },
                data: { status: OrderStatus.IN_PROGRESS },
            });
            throw error;
        }

        // 9. Emit event
        this.eventBus.emit<OrderRefundRequestedPayload>({
            eventType: EVENT_CATALOG.ORDER_REFUND_REQUESTED,
            aggregateId: orderId,
            aggregateType: 'Order',
            payload: {
                orderId,
                requestedBy: order.buyerId,
                requestedAt: new Date().toISOString(),
            },
            metadata: EventBusService.createMetadata({ userId: order.buyerId }),
        });

        this.logger.log(`Refund requested for order ${orderId}`);

        return updated as OrderWithRelations;
    }

    /**
     * Confirm refund to buyer (called by webhook).
     * Completes refund via webhook, credits buyer balance, closes order.
     *
     * @param orderId Order ID
     * @returns Updated order
     */
    async confirmRefund(orderId: string): Promise<OrderWithRelations> {
        this.logger.debug(`Confirming refund for order ${orderId}`);

        // 1. Get order with escrow and buyer
        const order = await this.ordersService.getOrder(orderId);

        if (!order.escrow) {
            throw new InvalidResolutionStateException(
                orderId,
                order.status,
                'Order must have escrow',
            );
        }

        // 2. Validate state is REFUND_REQUESTED
        if (order.status !== OrderStatus.REFUND_REQUESTED) {
            throw new InvalidResolutionStateException(
                orderId,
                order.status,
                OrderStatus.REFUND_REQUESTED,
            );
        }

        // 3. Use OrderStateMachine.assertTransition
        OrderStateMachine.assertTransition(order.status as OrderStatus, OrderStatus.REFUNDED);

        // 4. Use BalanceService.creditAvailable
        await this.balanceService.creditAvailable(order.buyerId, {
            amount: order.amount,
            reference: order.id,
        });

        // 5. Update order → REFUNDED → CLOSED in transaction
        const updated = await this.prisma.$transaction(
            async (tx) => {
                const refundedOrder = await tx.order.update({
                    where: { id: orderId },
                    data: { status: OrderStatus.REFUNDED },
                    include: {
                        escrow: true,
                        dispute: true,
                        milestones: true,
                    },
                });

                const closedOrder = await tx.order.update({
                    where: { id: orderId },
                    data: { status: OrderStatus.CLOSED },
                    include: {
                        escrow: true,
                        dispute: true,
                        milestones: true,
                    },
                });

                // Update escrow refundedAt timestamp
                await tx.escrow.updateMany({
                    where: { orderId },
                    data: {
                        status: EscrowStatus.REFUNDED,
                        refundedAt: new Date(),
                    },
                });

                // Create audit log
                await tx.auditLog.create({
                    data: {
                        id: generateAuditLogId(),
                        marketplaceId: 'system',
                        userId: order.buyerId,
                        action: 'REFUNDED',
                        resourceType: 'order',
                        resourceId: orderId,
                        payloadBefore: { status: order.status },
                        payloadAfter: { status: OrderStatus.CLOSED },
                        actorType: 'system',
                        result: 'SUCCESS',
                    },
                });

                return closedOrder;
            },
            {
                isolationLevel: 'Serializable',
                timeout: 10000,
            },
        );

        // 6. Emit events
        this.eventBus.emit<OrderRefundedPayload>({
            eventType: EVENT_CATALOG.ORDER_REFUNDED,
            aggregateId: orderId,
            aggregateType: 'Order',
            payload: {
                orderId,
                buyerId: order.buyerId,
                amount: order.amount,
                currency: order.currency,
                refundedAt: new Date().toISOString(),
                newBuyerBalance: 'unknown',
            },
            metadata: EventBusService.createMetadata({ userId: order.buyerId }),
        });

        this.eventBus.emit<OrderClosedPayload>({
            eventType: EVENT_CATALOG.ORDER_CLOSED,
            aggregateId: orderId,
            aggregateType: 'Order',
            payload: {
                orderId,
                finalStatus: OrderStatus.CLOSED,
                closedAt: new Date().toISOString(),
            },
            metadata: EventBusService.createMetadata({ userId: order.buyerId }),
        });

        this.logger.log(`Refund confirmed for order ${orderId}`);

        return updated as OrderWithRelations;
    }

    /**
     * Open a dispute for an order.
     * Creates dispute record, freezes order operations.
     *
     * @param orderId Order ID
     * @param dto Dispute details
     * @returns Created dispute
     */
    async openDispute(orderId: string, dto: OpenDisputeDto): Promise<DisputeWithRelations> {
        this.logger.debug(`Opening dispute for order ${orderId}`);

        // 1. Get order with existing dispute check
        const order = await this.ordersService.getOrder(orderId);

        // 2. Validate order state is IN_PROGRESS
        if (order.status !== OrderStatus.IN_PROGRESS) {
            throw new InvalidResolutionStateException(
                orderId,
                order.status,
                OrderStatus.IN_PROGRESS,
            );
        }

        // 3. Validate no existing active dispute
        this.validateCanOpenDispute(order);

        // 4. Use OrderStateMachine.assertTransition
        OrderStateMachine.assertTransition(order.status as OrderStatus, OrderStatus.DISPUTED);

        // 5. Create dispute + update order + update escrow in transaction
        const dispute = await this.prisma.$transaction(
            async (tx) => {
                const created = await tx.dispute.create({
                    data: {
                        id: generateDisputeId(),
                        orderId,
                        openedBy: dto.openedBy,
                        reason: dto.reason,
                        evidence: dto.evidence ? dto.evidence : Prisma.JsonNull,
                        status: DisputeStatus.OPEN,
                    },
                    include: {
                        order: {
                            include: {
                                escrow: true,
                                dispute: true,
                                milestones: true,
                            },
                        },
                    },
                });

                await tx.order.update({
                    where: { id: orderId },
                    data: { status: OrderStatus.DISPUTED },
                });

                await tx.escrow.updateMany({
                    where: { orderId },
                    data: { status: EscrowStatus.DISPUTED },
                });

                await tx.auditLog.create({
                    data: {
                        id: generateAuditLogId(),
                        marketplaceId: 'system',
                        userId: order.buyerId,
                        action: 'DISPUTE_OPENED',
                        resourceType: 'dispute',
                        resourceId: created.id,
                        payloadBefore: Prisma.JsonNull,
                        payloadAfter: {
                            orderId,
                            openedBy: dto.openedBy,
                            reason: dto.reason,
                        },
                        actorType: 'user',
                        result: 'SUCCESS',
                    },
                });

                return created;
            },
            {
                isolationLevel: 'Serializable',
                timeout: 10000,
            },
        );

        // 6. Emit event
        this.eventBus.emit<DisputeOpenedPayload>({
            eventType: EVENT_CATALOG.DISPUTE_OPENED,
            aggregateId: dispute.id,
            aggregateType: 'Dispute',
            payload: {
                disputeId: dispute.id,
                orderId,
                openedBy: dto.openedBy as any,
                reason: dto.reason,
                openedAt: new Date().toISOString(),
            },
            metadata: EventBusService.createMetadata({ userId: order.buyerId }),
        });

        this.logger.log(`Dispute ${dispute.id} opened for order ${orderId}`);

        return dispute as DisputeWithRelations;
    }

    /**
     * Assign a dispute to a support agent.
     *
     * @param disputeId Dispute ID
     * @param dto Assignment details
     * @returns Updated dispute
     */
    async assignDispute(
        disputeId: string,
        dto: AssignDisputeDto,
    ): Promise<DisputeWithRelations> {
        this.logger.debug(`Assigning dispute ${disputeId}`);

        // 1. Get dispute
        const dispute = await this.prisma.dispute.findUnique({
            where: { id: disputeId },
            include: {
                order: {
                    include: {
                        escrow: true,
                        dispute: true,
                        milestones: true,
                    },
                },
            },
        });

        if (!dispute) {
            throw new DisputeNotFoundException(disputeId);
        }

        // 2. Validate status is OPEN
        if (dispute.status !== DisputeStatus.OPEN) {
            throw new InvalidDisputeStateException(disputeId, dispute.status, 'assign');
        }

        // 3. Use DisputeStateMachine.assertTransition
        DisputeStateMachine.assertTransition(dispute.status as DisputeStatus, DisputeStatus.UNDER_REVIEW);

        // 4. Update dispute in transaction
        const updated = await this.prisma.$transaction(
            async (tx) => {
                const updatedDispute = await tx.dispute.update({
                    where: { id: disputeId },
                    data: {
                        status: DisputeStatus.UNDER_REVIEW,
                    },
                    include: {
                        order: {
                            include: {
                                escrow: true,
                                dispute: true,
                                milestones: true,
                            },
                        },
                    },
                });

                await tx.auditLog.create({
                    data: {
                        id: generateAuditLogId(),
                        marketplaceId: 'system',
                        userId: dto.assignedTo,
                        action: 'DISPUTE_ASSIGNED',
                        resourceType: 'dispute',
                        resourceId: disputeId,
                        payloadBefore: { status: dispute.status },
                        payloadAfter: { status: DisputeStatus.UNDER_REVIEW, assignedTo: dto.assignedTo },
                        actorType: 'system',
                        result: 'SUCCESS',
                    },
                });

                return updatedDispute;
            },
            {
                isolationLevel: 'Serializable',
                timeout: 10000,
            },
        );

        // 5. Emit event
        this.eventBus.emit<DisputeUnderReviewPayload>({
            eventType: EVENT_CATALOG.DISPUTE_UNDER_REVIEW,
            aggregateId: disputeId,
            aggregateType: 'Dispute',
            payload: {
                disputeId,
                orderId: dispute.orderId,
                reviewedBy: dto.assignedTo,
                reviewStartedAt: new Date().toISOString(),
            },
            metadata: EventBusService.createMetadata({ userId: dto.assignedTo }),
        });

        this.logger.log(`Dispute ${disputeId} assigned to ${dto.assignedTo}`);

        return updated as DisputeWithRelations;
    }

    /**
     * Resolve a dispute with decision (FULL_RELEASE, FULL_REFUND, or SPLIT).
     *
     * @param disputeId Dispute ID
     * @param dto Resolution details
     * @returns Updated dispute
     */
    async resolveDispute(
        disputeId: string,
        dto: ResolveDisputeDto,
    ): Promise<DisputeWithRelations> {
        this.logger.debug(`Resolving dispute ${disputeId}`, dto);

        // 1. Get dispute with order and escrow
        const dispute = await this.prisma.dispute.findUnique({
            where: { id: disputeId },
            include: {
                order: {
                    include: {
                        escrow: true,
                        dispute: true,
                        milestones: true,
                    },
                },
            },
        });

        if (!dispute) {
            throw new DisputeNotFoundException(disputeId);
        }

        const order = dispute.order;

        // 2. Validate status is UNDER_REVIEW
        if (dispute.status !== DisputeStatus.UNDER_REVIEW) {
            throw new InvalidDisputeStateException(disputeId, dispute.status, 'resolve');
        }

        // 3. Use DisputeStateMachine.assertTransition
        DisputeStateMachine.assertTransition(dispute.status as DisputeStatus, DisputeStatus.RESOLVED);

        // 4. Validate resolution decision and amounts
        const { decision, releaseAmount, refundAmount, note } = dto;

        // 5. Validate SPLIT amounts (if applicable)
        if (decision === 'SPLIT') {
            if (!releaseAmount || !refundAmount) {
                throw new InvalidDisputeResolutionException(
                    'Both releaseAmount and refundAmount are required for SPLIT decision',
                );
            }

            const sum = addAmounts(releaseAmount, refundAmount);
            if (compareAmounts(sum, order.amount) !== 0) {
                throw new InvalidDisputeResolutionException(
                    `Split amounts (${releaseAmount} + ${refundAmount} = ${sum}) must equal order amount (${order.amount})`,
                );
            }
        }

        // 6. Execute resolution based on decision
        switch (decision) {
            case 'FULL_RELEASE':
                await this.executeFullRelease(order, dispute, note);
                break;

            case 'FULL_REFUND':
                await this.executeFullRefund(order, dispute, note);
                break;

            case 'SPLIT':
                await this.executeSplitResolution(
                    order,
                    dispute,
                    releaseAmount!,
                    refundAmount!,
                    note,
                );
                break;

            default:
                throw new InvalidDisputeResolutionException(`Unknown decision: ${decision}`);
        }

        // 7. Update dispute → RESOLVED in transaction
        const updated = await this.prisma.$transaction(
            async (tx) => {
                const resolvedDispute = await tx.dispute.update({
                    where: { id: disputeId },
                    data: {
                        status: DisputeStatus.RESOLVED,
                        resolutionDecision: decision,
                        decisionNote: note || null,
                    },
                    include: {
                        order: {
                            include: {
                                escrow: true,
                                dispute: true,
                                milestones: true,
                            },
                        },
                    },
                });

                await tx.auditLog.create({
                    data: {
                        id: generateAuditLogId(),
                        marketplaceId: 'system',
                        userId: order.buyerId,
                        action: 'DISPUTE_RESOLVED',
                        resourceType: 'dispute',
                        resourceId: disputeId,
                        payloadBefore: { status: dispute.status },
                        payloadAfter: {
                            status: DisputeStatus.RESOLVED,
                            decision,
                            releaseAmount,
                            refundAmount,
                            note,
                        },
                        actorType: 'system',
                        result: 'SUCCESS',
                    },
                });

                return resolvedDispute;
            },
            {
                isolationLevel: 'Serializable',
                timeout: 10000,
            },
        );

        // 8. Emit event
        this.eventBus.emit<DisputeResolvedPayload>({
            eventType: EVENT_CATALOG.DISPUTE_RESOLVED,
            aggregateId: disputeId,
            aggregateType: 'Dispute',
            payload: {
                disputeId,
                orderId: order.id,
                decision: decision as any,
                decisionNote: note,
                resolvedBy: 'system', // or admin if we have one
                resolvedAt: new Date().toISOString(),
                buyerAmount: refundAmount,
                sellerAmount: releaseAmount,
            },
            metadata: EventBusService.createMetadata({ userId: order.buyerId }),
        });

        this.logger.log(`Dispute ${disputeId} resolved with decision: ${decision}`);

        return updated as DisputeWithRelations;
    }

    /**
     * Execute full release for dispute resolution.
     * @private
     */
    private async executeFullRelease(
        order: OrderWithRelations,
        dispute: any,
        note?: string,
    ): Promise<void> {
        this.logger.debug(`Executing full release for dispute ${dispute.id}`);

        // Calls escrowClient.releaseEscrow() with mode: FULL
        const escrowType =
            order.milestones && order.milestones.length > 1 ? 'multi-release' : 'single-release';

        await this.escrowClient.releaseEscrow(
            order.escrow!.trustlessContractId!,
            {
                mode: ReleaseMode.FULL,
                reason: note || `Dispute resolved: Full release to seller`,
            },
            escrowType,
        );

        // Update order → RELEASE_REQUESTED
        await this.prisma.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.RELEASE_REQUESTED },
        });

        // Update escrow → RELEASING
        await this.prisma.escrow.updateMany({
            where: { orderId: order.id },
            data: { status: EscrowStatus.RELEASING },
        });

        this.logger.log(`Full release initiated for dispute ${dispute.id}`);
        // confirmRelease() will be called via webhook
    }

    /**
     * Execute full refund for dispute resolution.
     * @private
     */
    private async executeFullRefund(
        order: OrderWithRelations,
        dispute: any,
        note?: string,
    ): Promise<void> {
        this.logger.debug(`Executing full refund for dispute ${dispute.id}`);

        // Calls escrowClient.refundEscrow() with mode: FULL
        await this.escrowClient.refundEscrow(order.escrow!.trustlessContractId!, {
            mode: RefundMode.FULL,
            reason: note || `Dispute resolved: Full refund to buyer`,
        });

        // Update order → REFUND_REQUESTED
        await this.prisma.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.REFUND_REQUESTED },
        });

        // Update escrow → REFUNDING
        await this.prisma.escrow.updateMany({
            where: { orderId: order.id },
            data: { status: EscrowStatus.REFUNDING },
        });

        this.logger.log(`Full refund initiated for dispute ${dispute.id}`);
        // confirmRefund() will be called via webhook
    }

    /**
     * Execute split resolution for dispute.
     * @private
     */
    private async executeSplitResolution(
        order: OrderWithRelations,
        dispute: any,
        releaseAmount: string,
        refundAmount: string,
        note?: string,
    ): Promise<void> {
        this.logger.debug(
            `Executing split resolution for dispute ${dispute.id}: release=${releaseAmount}, refund=${refundAmount}`,
        );

        // Calls escrowClient.resolveDispute() with split amounts
        const escrowType =
            order.milestones && order.milestones.length > 1 ? 'multi-release' : 'single-release';

        await this.escrowClient.resolveDispute(
            order.escrow!.trustlessContractId!,
            {
                release_amount: releaseAmount,
                refund_amount: refundAmount,
            },
            escrowType,
        );

        // Credit seller via creditAvailable
        await this.balanceService.creditAvailable(order.sellerId, {
            amount: releaseAmount,
            reference: `${order.id}-dispute-release`,
        });

        // Credit buyer via creditAvailable
        await this.balanceService.creditAvailable(order.buyerId, {
            amount: refundAmount,
            reference: `${order.id}-dispute-refund`,
        });

        // Update order → RELEASED → CLOSED immediately (no webhook)
        await this.prisma.$transaction(
            async (tx) => {
                await tx.order.update({
                    where: { id: order.id },
                    data: { status: OrderStatus.RELEASED },
                });

                await tx.order.update({
                    where: { id: order.id },
                    data: { status: OrderStatus.CLOSED },
                });

                // Update escrow → RELEASED
                await tx.escrow.updateMany({
                    where: { orderId: order.id },
                    data: {
                        status: EscrowStatus.RELEASED,
                        releasedAt: new Date(),
                    },
                });
            },
            {
                isolationLevel: 'Serializable',
                timeout: 10000,
            },
        );

        // Emit event
        this.eventBus.emit<DisputeResolvedPayload>({
            eventType: EVENT_CATALOG.DISPUTE_RESOLVED,
            aggregateId: dispute.id,
            aggregateType: 'Dispute',
            payload: {
                disputeId: dispute.id,
                orderId: order.id,
                decision: 'SPLIT',
                decisionNote: note,
                resolvedBy: 'system',
                resolvedAt: new Date().toISOString(),
                buyerAmount: refundAmount,
                sellerAmount: releaseAmount,
            },
            metadata: EventBusService.createMetadata({ userId: order.buyerId }),
        });

        this.logger.log(
            `Split resolution completed for dispute ${dispute.id}: ${releaseAmount} to seller, ${refundAmount} to buyer`,
        );
    }

    /**
     * Validate no active dispute exists.
     * @private
     */
    private validateNoActiveDispute(order: OrderWithDispute): void {
        if (order.dispute && order.dispute.status !== DisputeStatus.RESOLVED) {
            throw new ActiveDisputeException(
                order.id,
                `Active dispute prevents release/refund operations`,
            );
        }
    }

    /**
     * Validate that a new dispute can be opened.
     * @private
     */
    private validateCanOpenDispute(order: OrderWithDispute): void {
        if (order.dispute && order.dispute.status !== DisputeStatus.RESOLVED) {
            throw new DisputeAlreadyExistsException(
                order.id,
                `Dispute already exists for this order`,
            );
        }
    }
}
