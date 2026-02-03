import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventBusService } from '../../events';
import { OrdersService } from '../orders.service';
import { PrismaService } from '../../database/prisma.service';
import { BalanceService } from '../../balance/balance.service';
import { EscrowClient } from '../../../providers/trustless-work/clients/escrow.client';
import type { CreateOrderDto, MilestoneDto } from '../dto';
import {
    OrderNotFoundException,
    InvalidOrderStateException,
    SameUserException,
    MilestoneValidationException,
    EscrowAlreadyExistsException,
    MilestoneNotFoundException,
    MilestoneAlreadyCompletedException,
} from '../exceptions';
import { InsufficientFundsException } from '../../balance/exceptions';

describe('OrdersService', () => {
    let service: OrdersService;
    let prisma: PrismaService;
    let balanceService: BalanceService;
    let escrowClient: EscrowClient;
    let eventBus: EventBusService;

    // Test constants
    const BUYER_ID = 'user-1';
    const SELLER_ID = 'user-2';
    const ORDER_ID = 'order-123';
    const CONTRACT_ID = 'contract-456';
    const ORDER_AMOUNT = '100.00';

    const mockBalanceOperationResult = {
        success: true,
        balance: {
            user_id: BUYER_ID,
            currency: 'USD',
            available: '100.00',
            reserved: '100.00',
            total: '200.00',
            updated_at: new Date().toISOString(),
        },
        operation: 'RESERVE',
        amount: ORDER_AMOUNT,
        previousBalance: { available: '200.00', reserved: '0.00' },
        newBalance: { available: '100.00', reserved: '100.00' },
        auditLogId: 'audit-log-123',
    };

    const mockOrder = {
        id: ORDER_ID,
        clientOrderRef: null,
        buyerId: BUYER_ID,
        sellerId: SELLER_ID,
        amount: ORDER_AMOUNT,
        currency: 'USD',
        title: 'Test Order',
        description: null,
        status: 'ORDER_CREATED',
        createdAt: new Date(),
        updatedAt: new Date(),
        escrow: null,
        milestones: [],
        dispute: null,
    };

    const mockMilestone = {
        id: 'milestone-1',
        orderId: ORDER_ID,
        milestoneRef: 'm1',
        title: 'Milestone 1',
        amount: '50.00',
        status: 'OPEN',
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
    };

    /**
     * Creates a mock transaction callback for Prisma.
     */
    function createTransactionMock(overrides: Record<string, unknown> = {}) {
        return async (callback: (tx: unknown) => unknown) => {
            const txClient = {
                order: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn() },
                milestone: { createMany: jest.fn(), update: jest.fn() },
                escrow: { create: jest.fn(), update: jest.fn() },
                auditLog: { create: jest.fn() },
                ...overrides,
            };
            return callback(txClient);
        };
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrdersService,
                {
                    provide: PrismaService,
                    useValue: {
                        order: {
                            create: jest.fn(),
                            findUnique: jest.fn(),
                            update: jest.fn(),
                            findMany: jest.fn(),
                        },
                        milestone: {
                            createMany: jest.fn(),
                            findMany: jest.fn(),
                            findFirst: jest.fn(),
                            update: jest.fn(),
                        },
                        escrow: {
                            findFirst: jest.fn(),
                            create: jest.fn(),
                            update: jest.fn(),
                        },
                        auditLog: {
                            create: jest.fn(),
                        },
                        user: {
                            findUnique: jest.fn(),
                        },
                        $transaction: jest.fn((callback) => {
                            const txClient = {
                                order: {
                                    create: jest.fn(),
                                    update: jest.fn(),
                                    findUnique: jest.fn(),
                                },
                                milestone: {
                                    createMany: jest.fn(),
                                    update: jest.fn(),
                                },
                                escrow: {
                                    create: jest.fn(),
                                    update: jest.fn(),
                                },
                                auditLog: {
                                    create: jest.fn(),
                                },
                            };
                            return callback(txClient);
                        }),
                    },
                },
                {
                    provide: BalanceService,
                    useValue: {
                        reserve: jest.fn(),
                        cancelReservation: jest.fn(),
                        deductReserved: jest.fn(),
                    },
                },
                {
                    provide: EscrowClient,
                    useValue: {
                        createEscrow: jest.fn(),
                        fundEscrow: jest.fn(),
                    },
                },
                {
                    provide: EventBusService,
                    useValue: {
                        emit: jest.fn(),
                        emitMany: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<OrdersService>(OrdersService);
        prisma = module.get<PrismaService>(PrismaService);
        balanceService = module.get<BalanceService>(BalanceService);
        escrowClient = module.get<EscrowClient>(EscrowClient);
        eventBus = module.get<EventBusService>(EventBusService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createOrder', () => {
        it('should create order without milestones', async () => {
            const dto: CreateOrderDto = {
                buyer_id: BUYER_ID,
                seller_id: SELLER_ID,
                amount: '100.00',
                title: 'Test Order',
            };

            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: BUYER_ID } as any);
            jest.spyOn(prisma.order, 'findUnique').mockResolvedValue({
                ...mockOrder,
                escrow: null,
                milestones: [],
            } as any);

            (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
                const txClient = {
                    order: {
                        create: jest.fn().mockResolvedValue(mockOrder),
                    },
                    milestone: {
                        createMany: jest.fn(),
                    },
                    auditLog: {
                        create: jest.fn(),
                    },
                };
                return callback(txClient);
            });

            const result = await service.createOrder(dto);

            expect(result.id).toBe(ORDER_ID);
            expect(result.status).toBe('ORDER_CREATED');
            expect(eventBus.emit).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'order.created' }));
        });

        it('should create order with milestones', async () => {
            const milestones: MilestoneDto[] = [
                { milestone_ref: 'm1', title: 'Milestone 1', amount: '50.00' },
                { milestone_ref: 'm2', title: 'Milestone 2', amount: '50.00' },
            ];

            const dto: CreateOrderDto = {
                buyer_id: BUYER_ID,
                seller_id: SELLER_ID,
                amount: '100.00',
                title: 'Test Order',
                milestones,
            };

            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: BUYER_ID } as any);
            jest.spyOn(prisma.order, 'findUnique').mockResolvedValue({
                ...mockOrder,
                escrow: null,
                milestones: [mockMilestone, { ...mockMilestone, id: 'milestone-2', milestoneRef: 'm2' }],
            } as any);

            const createManySpy = jest.fn().mockResolvedValue({ count: 2 });

            (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
                const txClient = {
                    order: {
                        create: jest.fn().mockResolvedValue(mockOrder),
                    },
                    milestone: {
                        createMany: createManySpy,
                    },
                    auditLog: {
                        create: jest.fn(),
                    },
                };
                return callback(txClient);
            });

            const result = await service.createOrder(dto);

            expect(result.milestones).toHaveLength(2);
            expect(createManySpy).toHaveBeenCalled();
        });

        it('should reject if buyer equals seller', async () => {
            const dto: CreateOrderDto = {
                buyer_id: BUYER_ID,
                seller_id: BUYER_ID,
                amount: '100.00',
                title: 'Test Order',
            };

            await expect(service.createOrder(dto)).rejects.toThrow(SameUserException);
        });

        it('should reject if milestone amounts do not sum to total', async () => {
            const milestones: MilestoneDto[] = [
                { milestone_ref: 'm1', title: 'Milestone 1', amount: '40.00' },
                { milestone_ref: 'm2', title: 'Milestone 2', amount: '50.00' },
            ];

            const dto: CreateOrderDto = {
                buyer_id: BUYER_ID,
                seller_id: SELLER_ID,
                amount: '100.00',
                title: 'Test Order',
                milestones,
            };

            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: BUYER_ID } as any);

            await expect(service.createOrder(dto)).rejects.toThrow(MilestoneValidationException);
        });
    });

    describe('reserveFunds', () => {
        it('should reserve funds successfully', async () => {
            const updatedOrder = {
                ...mockOrder,
                status: 'FUNDS_RESERVED',
            };

            jest.spyOn(prisma.order, 'findUnique')
                .mockResolvedValueOnce(mockOrder as any)
                .mockResolvedValueOnce({
                    ...updatedOrder,
                    escrow: null,
                    milestones: [],
                } as any);

            jest.spyOn(balanceService, 'reserve').mockResolvedValue(mockBalanceOperationResult);

            (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
                const txClient = {
                    order: {
                        update: jest.fn().mockResolvedValue(updatedOrder),
                    },
                    auditLog: {
                        create: jest.fn(),
                    },
                };
                return callback(txClient);
            });

            const result = await service.reserveFunds(ORDER_ID);

            expect(result.status).toBe('FUNDS_RESERVED');
            expect(balanceService.reserve).toHaveBeenCalledWith(BUYER_ID, expect.objectContaining({
                amount: '100.00',
                orderId: ORDER_ID,
            }));
            expect(eventBus.emit).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'order.funds_reserved' }));
        });

        it('should reject if not in ORDER_CREATED state', async () => {
            jest.spyOn(prisma.order, 'findUnique').mockResolvedValue({
                ...mockOrder,
                status: 'FUNDS_RESERVED',
            } as any);

            await expect(service.reserveFunds(ORDER_ID)).rejects.toThrow(InvalidOrderStateException);
        });

        it('should handle InsufficientFundsException', async () => {
            jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any);
            jest.spyOn(balanceService, 'reserve').mockRejectedValue(
                new InsufficientFundsException(BUYER_ID, '100.00', '50.00'),
            );

            await expect(service.reserveFunds(ORDER_ID)).rejects.toThrow(InsufficientFundsException);
        });
    });

    describe('cancelOrder', () => {
        it('should cancel from ORDER_CREATED without balance refund', async () => {
            const closedOrder = {
                ...mockOrder,
                status: 'CLOSED',
            };

            jest.spyOn(prisma.order, 'findUnique')
                .mockResolvedValueOnce(mockOrder as any)
                .mockResolvedValueOnce({
                    ...closedOrder,
                    escrow: null,
                    milestones: [],
                } as any);

            (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
                const txClient = {
                    order: {
                        update: jest.fn().mockResolvedValue(closedOrder),
                    },
                    auditLog: {
                        create: jest.fn(),
                    },
                };
                return callback(txClient);
            });

            const result = await service.cancelOrder(ORDER_ID, 'User requested');

            expect(result.status).toBe('CLOSED');
            expect(balanceService.cancelReservation).not.toHaveBeenCalled();
            expect(eventBus.emit).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'order.canceled' }));
        });

        it('should cancel from FUNDS_RESERVED with balance refund', async () => {
            const reservedOrder = {
                ...mockOrder,
                status: 'FUNDS_RESERVED',
            };
            const closedOrder = {
                ...mockOrder,
                status: 'CLOSED',
            };

            jest.spyOn(prisma.order, 'findUnique')
                .mockResolvedValueOnce(reservedOrder as any)
                .mockResolvedValueOnce({
                    ...closedOrder,
                    escrow: null,
                    milestones: [],
                } as any);

            jest.spyOn(balanceService, 'cancelReservation').mockResolvedValue(mockBalanceOperationResult);

            (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
                const txClient = {
                    order: {
                        update: jest.fn().mockResolvedValue(closedOrder),
                    },
                    auditLog: {
                        create: jest.fn(),
                    },
                };
                return callback(txClient);
            });

            const result = await service.cancelOrder(ORDER_ID);

            expect(result.status).toBe('CLOSED');
            expect(balanceService.cancelReservation).toHaveBeenCalledWith(BUYER_ID, expect.objectContaining({
                amount: '100.00',
                orderId: ORDER_ID,
            }));
        });

        it('should reject if in ESCROW_CREATING or later', async () => {
            jest.spyOn(prisma.order, 'findUnique').mockResolvedValue({
                ...mockOrder,
                status: 'ESCROW_CREATING',
            } as any);

            await expect(service.cancelOrder(ORDER_ID)).rejects.toThrow(InvalidOrderStateException);
        });
    });

    describe('createEscrow', () => {
        const mockUser = {
            id: BUYER_ID,
            email: 'test@example.com',
            airtmUserId: 'stellar-address-1',
        };

        it('should create escrow with milestones', async () => {
            const orderWithRelations = {
                ...mockOrder,
                status: 'FUNDS_RESERVED',
                buyer: mockUser,
                seller: { ...mockUser, id: SELLER_ID, airtmUserId: 'stellar-address-2' },
                milestones: [mockMilestone],
                escrow: null,
            };

            const creatingOrder = {
                ...mockOrder,
                status: 'ESCROW_CREATING',
            };

            jest.spyOn(prisma.order, 'findUnique')
                .mockResolvedValueOnce(orderWithRelations as any)
                .mockResolvedValueOnce({
                    ...creatingOrder,
                    escrow: { id: 'escrow-1', trustlessContractId: CONTRACT_ID },
                    milestones: [],
                } as any);

            jest.spyOn(prisma.user, 'findUnique')
                .mockResolvedValueOnce(mockUser as any)
                .mockResolvedValueOnce({ ...mockUser, id: SELLER_ID, airtmUserId: 'stellar-address-2' } as any);

            jest.spyOn(prisma.milestone, 'findMany').mockResolvedValue([mockMilestone] as any);

            jest.spyOn(escrowClient, 'createEscrow').mockResolvedValue({
                contractId: CONTRACT_ID,
                status: 'creating',
            } as any);

            jest.spyOn(prisma.escrow, 'create').mockResolvedValue({
                id: 'escrow-1',
                orderId: ORDER_ID,
                trustlessContractId: CONTRACT_ID,
                status: 'CREATING',
                amount: '100.00',
            } as any);

            (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
                const txClient = {
                    order: {
                        update: jest.fn().mockResolvedValue(creatingOrder),
                    },
                    auditLog: {
                        create: jest.fn(),
                    },
                };
                return callback(txClient);
            });

            const result = await service.createEscrow(ORDER_ID);

            expect(result.status).toBe('ESCROW_CREATING');
            expect(escrowClient.createEscrow).toHaveBeenCalled();
            expect(eventBus.emit).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'order.escrow_creating' }));
        });

        it('should reject if not in FUNDS_RESERVED', async () => {
            jest.spyOn(prisma.order, 'findUnique').mockResolvedValue({
                ...mockOrder,
                status: 'ORDER_CREATED',
            } as any);

            await expect(service.createEscrow(ORDER_ID)).rejects.toThrow(InvalidOrderStateException);
        });

        it('should reject if escrow already exists', async () => {
            jest.spyOn(prisma.order, 'findUnique').mockResolvedValue({
                ...mockOrder,
                status: 'FUNDS_RESERVED',
                escrow: { id: 'escrow-1' },
            } as any);

            await expect(service.createEscrow(ORDER_ID)).rejects.toThrow(EscrowAlreadyExistsException);
        });
    });

    describe('fundEscrow', () => {
        it('should fund escrow successfully', async () => {
            const orderWithEscrow = {
                ...mockOrder,
                status: 'ESCROW_FUNDING',
                escrow: {
                    id: 'escrow-1',
                    trustlessContractId: CONTRACT_ID,
                    status: 'CREATED',
                },
                milestones: [mockMilestone],
            };

            jest.spyOn(prisma.order, 'findUnique')
                .mockResolvedValueOnce(orderWithEscrow as any)
                .mockResolvedValueOnce(orderWithEscrow as any);

            jest.spyOn(balanceService, 'deductReserved').mockResolvedValue(mockBalanceOperationResult);
            jest.spyOn(escrowClient, 'fundEscrow').mockResolvedValue({ success: true } as any);

            (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
                const txClient = {
                    escrow: {
                        update: jest.fn().mockResolvedValue({
                            id: 'escrow-1',
                            status: 'FUNDING',
                        }),
                    },
                    auditLog: {
                        create: jest.fn(),
                    },
                };
                return callback(txClient);
            });

            const result = await service.fundEscrow(ORDER_ID);

            expect(balanceService.deductReserved).toHaveBeenCalledWith(BUYER_ID, expect.objectContaining({
                amount: '100.00',
                orderId: ORDER_ID,
            }));
            expect(escrowClient.fundEscrow).toHaveBeenCalledWith(CONTRACT_ID, '100.00', 'multi-release');
            expect(eventBus.emit).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'order.escrow_funding' }));
        });

        it('should reject if not in ESCROW_FUNDING', async () => {
            jest.spyOn(prisma.order, 'findUnique').mockResolvedValue({
                ...mockOrder,
                status: 'FUNDS_RESERVED',
            } as any);

            await expect(service.fundEscrow(ORDER_ID)).rejects.toThrow(InvalidOrderStateException);
        });
    });

    describe('completeMilestone', () => {
        it('should complete milestone', async () => {
            const orderInProgress = {
                ...mockOrder,
                status: 'IN_PROGRESS',
                escrow: null,
                milestones: [mockMilestone, { ...mockMilestone, id: 'milestone-2', milestoneRef: 'm2' }],
            };

            jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(orderInProgress as any);
            jest.spyOn(prisma.milestone, 'findMany').mockResolvedValue([
                mockMilestone,
                { ...mockMilestone, id: 'milestone-2', milestoneRef: 'm2' },
            ] as any);

            (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
                const txClient = {
                    milestone: {
                        update: jest.fn().mockResolvedValue({
                            ...mockMilestone,
                            status: 'COMPLETED',
                            completedAt: new Date(),
                        }),
                    },
                    auditLog: {
                        create: jest.fn(),
                    },
                };
                return callback(txClient);
            });

            const result = await service.completeMilestone(ORDER_ID, 'm1');

            expect(result.status).toBe('COMPLETED');
            expect(eventBus.emit).toHaveBeenCalledWith(expect.objectContaining({
                eventType: 'escrow.milestone_completed',
                payload: expect.objectContaining({
                    milestoneRef: 'm1',
                }),
            }));
        });

        it('should reject if milestone not found', async () => {
            jest.spyOn(prisma.order, 'findUnique').mockResolvedValue({
                ...mockOrder,
                status: 'IN_PROGRESS',
                escrow: null,
                milestones: [mockMilestone],
            } as any);
            jest.spyOn(prisma.milestone, 'findMany').mockResolvedValue([mockMilestone] as any);

            await expect(service.completeMilestone(ORDER_ID, 'invalid-ref')).rejects.toThrow(
                MilestoneNotFoundException,
            );
        });

        it('should reject if milestone already completed', async () => {
            const completedMilestone = {
                ...mockMilestone,
                status: 'COMPLETED',
            };

            jest.spyOn(prisma.order, 'findUnique').mockResolvedValue({
                ...mockOrder,
                status: 'IN_PROGRESS',
                escrow: null,
                milestones: [completedMilestone],
            } as any);
            jest.spyOn(prisma.milestone, 'findMany').mockResolvedValue([completedMilestone] as any);

            await expect(service.completeMilestone(ORDER_ID, 'm1')).rejects.toThrow(
                MilestoneAlreadyCompletedException,
            );
        });

        it('should reject if order not IN_PROGRESS', async () => {
            jest.spyOn(prisma.order, 'findUnique').mockResolvedValue({
                ...mockOrder,
                status: 'FUNDS_RESERVED',
                milestones: [mockMilestone],
            } as any);

            await expect(service.completeMilestone(ORDER_ID, 'm1')).rejects.toThrow(
                InvalidOrderStateException,
            );
        });
    });

    describe('getOrder', () => {
        it('should return order with relations', async () => {
            jest.spyOn(prisma.order, 'findUnique').mockResolvedValue({
                ...mockOrder,
                escrow: { id: 'escrow-1' },
                milestones: [mockMilestone],
            } as any);

            const result = await service.getOrder(ORDER_ID);

            expect(result.id).toBe(ORDER_ID);
            expect(result.escrow).toBeDefined();
            expect(result.milestones).toHaveLength(1);
        });

        it('should throw if order not found', async () => {
            jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(null);

            await expect(service.getOrder(ORDER_ID)).rejects.toThrow(OrderNotFoundException);
        });
    });

    describe('getMilestones', () => {
        it('should return milestones ordered by createdAt', async () => {
            jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any);
            jest.spyOn(prisma.milestone, 'findMany').mockResolvedValue([
                mockMilestone,
                { ...mockMilestone, id: 'milestone-2', milestoneRef: 'm2' },
            ] as any);

            const result = await service.getMilestones(ORDER_ID);

            expect(result).toHaveLength(2);
            expect(prisma.milestone.findMany).toHaveBeenCalledWith({
                where: { orderId: ORDER_ID },
                orderBy: { createdAt: 'asc' },
            });
        });
    });
});
