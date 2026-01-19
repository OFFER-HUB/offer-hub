import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BalanceService } from '../balance.service';
import { PrismaService } from '../../database/prisma.service';
import { AirtmUserClient } from '../../../providers/airtm';
import {
    InsufficientFundsException,
    InsufficientReservedFundsException,
    InvalidAmountException,
} from '../exceptions';

/**
 * Creates a mock Prisma service for balance testing.
 */
const createMockPrismaService = () => ({
    balance: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    user: {
        findUnique: jest.fn(),
    },
    auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'aud_test123' }),
        createMany: jest.fn().mockResolvedValue({ count: 2 }),
    },
    $transaction: jest.fn(),
});

/**
 * Creates a mock Airtm user client.
 */
const createMockAirtmUserClient = () => ({
    getBalance: jest.fn().mockResolvedValue({
        userId: 'airtm_user_456',
        available: 100.0,
        pending: 0,
        currency: 'USD',
        updatedAt: '2024-01-15T10:00:00Z',
    }),
    verifyUserEligibilityById: jest.fn().mockResolvedValue({
        eligible: true,
        airtmUserId: 'airtm_user_456',
    }),
});

/**
 * Creates a mock event emitter.
 */
const createMockEventEmitter = () => ({
    emit: jest.fn(),
});

describe('BalanceService', () => {
    let service: BalanceService;
    let mockPrisma: ReturnType<typeof createMockPrismaService>;
    let mockAirtmUser: ReturnType<typeof createMockAirtmUserClient>;
    let mockEventEmitter: ReturnType<typeof createMockEventEmitter>;

    beforeEach(async () => {
        jest.clearAllMocks();

        mockPrisma = createMockPrismaService();
        mockAirtmUser = createMockAirtmUserClient();
        mockEventEmitter = createMockEventEmitter();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BalanceService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma,
                },
                {
                    provide: AirtmUserClient,
                    useValue: mockAirtmUser,
                },
                {
                    provide: EventEmitter2,
                    useValue: mockEventEmitter,
                },
            ],
        }).compile();

        service = module.get<BalanceService>(BalanceService);
    });

    describe('getBalance', () => {
        it('should return balance for existing user', async () => {
            mockPrisma.balance.findUnique.mockResolvedValueOnce({
                id: 'bal_123',
                userId: 'usr_123',
                available: '100.00',
                reserved: '25.00',
                currency: 'USD',
                updatedAt: new Date('2024-01-15T10:00:00Z'),
            });

            const result = await service.getBalance('usr_123');

            expect(result).toEqual({
                user_id: 'usr_123',
                available: '100.00',
                reserved: '25.00',
                currency: 'USD',
                total: '125.00',
                updated_at: '2024-01-15T10:00:00.000Z',
            });
        });

        it('should return zero balance for user without balance record', async () => {
            mockPrisma.balance.findUnique.mockResolvedValueOnce(null);

            const result = await service.getBalance('usr_new');

            expect(result.available).toBe('0.00');
            expect(result.reserved).toBe('0.00');
            expect(result.total).toBe('0.00');
        });
    });

    describe('creditAvailable', () => {
        it('should credit funds to available balance', async () => {
            const mockBalance = {
                id: 'bal_123',
                userId: 'usr_123',
                available: '100.00',
                reserved: '0.00',
                currency: 'USD',
                updatedAt: new Date(),
            };

            mockPrisma.$transaction.mockImplementationOnce(async (callback: Function) => {
                return callback({
                    balance: {
                        findUnique: jest.fn().mockResolvedValueOnce(mockBalance),
                        create: jest.fn(),
                        update: jest.fn().mockResolvedValueOnce({
                            ...mockBalance,
                            available: '150.00',
                        }),
                    },
                    auditLog: {
                        create: jest.fn().mockResolvedValueOnce({ id: 'aud_test' }),
                    },
                });
            });

            const result = await service.creditAvailable('usr_123', {
                amount: '50.00',
                currency: 'USD',
            });

            expect(result.success).toBe(true);
            expect(result.operation).toBe('CREDIT_AVAILABLE');
            expect(result.newBalance.available).toBe('150.00');
            expect(mockEventEmitter.emit).toHaveBeenCalledWith(
                'balance.updated',
                expect.objectContaining({
                    userId: 'usr_123',
                    operation: 'CREDIT_AVAILABLE',
                }),
            );
        });

        it('should throw InvalidAmountException for invalid amount format', async () => {
            await expect(
                service.creditAvailable('usr_123', { amount: '100' }),
            ).rejects.toThrow(InvalidAmountException);

            await expect(
                service.creditAvailable('usr_123', { amount: 'invalid' }),
            ).rejects.toThrow(InvalidAmountException);

            await expect(
                service.creditAvailable('usr_123', { amount: '100.123' }),
            ).rejects.toThrow(InvalidAmountException);
        });

        it('should throw InvalidAmountException for zero or negative amount', async () => {
            await expect(
                service.creditAvailable('usr_123', { amount: '0.00' }),
            ).rejects.toThrow(InvalidAmountException);

            await expect(
                service.creditAvailable('usr_123', { amount: '-10.00' }),
            ).rejects.toThrow(InvalidAmountException);
        });
    });

    describe('debitAvailable', () => {
        it('should debit funds from available balance', async () => {
            const mockBalance = {
                id: 'bal_123',
                userId: 'usr_123',
                available: '100.00',
                reserved: '0.00',
                currency: 'USD',
                updatedAt: new Date(),
            };

            mockPrisma.$transaction.mockImplementationOnce(async (callback: Function) => {
                return callback({
                    balance: {
                        findUnique: jest.fn().mockResolvedValueOnce(mockBalance),
                        create: jest.fn(),
                        update: jest.fn().mockResolvedValueOnce({
                            ...mockBalance,
                            available: '70.00',
                        }),
                    },
                    auditLog: {
                        create: jest.fn().mockResolvedValueOnce({ id: 'aud_test' }),
                    },
                });
            });

            const result = await service.debitAvailable('usr_123', {
                amount: '30.00',
                currency: 'USD',
            });

            expect(result.success).toBe(true);
            expect(result.operation).toBe('DEBIT_AVAILABLE');
            expect(result.newBalance.available).toBe('70.00');
        });

        it('should throw InsufficientFundsException when balance is too low', async () => {
            const mockBalance = {
                id: 'bal_123',
                userId: 'usr_123',
                available: '50.00',
                reserved: '0.00',
                currency: 'USD',
                updatedAt: new Date(),
            };

            mockPrisma.$transaction.mockImplementationOnce(async (callback: Function) => {
                return callback({
                    balance: {
                        findUnique: jest.fn().mockResolvedValueOnce(mockBalance),
                        create: jest.fn(),
                        update: jest.fn(),
                    },
                    auditLog: {
                        create: jest.fn(),
                    },
                });
            });

            await expect(
                service.debitAvailable('usr_123', { amount: '100.00' }),
            ).rejects.toThrow(InsufficientFundsException);
        });
    });

    describe('reserve', () => {
        it('should move funds from available to reserved', async () => {
            const mockBalance = {
                id: 'bal_123',
                userId: 'usr_123',
                available: '100.00',
                reserved: '0.00',
                currency: 'USD',
                updatedAt: new Date(),
            };

            mockPrisma.$transaction.mockImplementationOnce(async (callback: Function) => {
                return callback({
                    balance: {
                        findUnique: jest.fn().mockResolvedValueOnce(mockBalance),
                        create: jest.fn(),
                        update: jest.fn().mockResolvedValueOnce({
                            ...mockBalance,
                            available: '50.00',
                            reserved: '50.00',
                        }),
                    },
                    auditLog: {
                        create: jest.fn().mockResolvedValueOnce({ id: 'aud_test' }),
                    },
                });
            });

            const result = await service.reserve('usr_123', {
                amount: '50.00',
                orderId: 'ord_123',
            });

            expect(result.success).toBe(true);
            expect(result.operation).toBe('RESERVE');
            expect(result.newBalance.available).toBe('50.00');
            expect(result.newBalance.reserved).toBe('50.00');
        });

        it('should throw InsufficientFundsException when available balance is too low', async () => {
            const mockBalance = {
                id: 'bal_123',
                userId: 'usr_123',
                available: '30.00',
                reserved: '0.00',
                currency: 'USD',
                updatedAt: new Date(),
            };

            mockPrisma.$transaction.mockImplementationOnce(async (callback: Function) => {
                return callback({
                    balance: {
                        findUnique: jest.fn().mockResolvedValueOnce(mockBalance),
                        create: jest.fn(),
                        update: jest.fn(),
                    },
                    auditLog: {
                        create: jest.fn(),
                    },
                });
            });

            await expect(
                service.reserve('usr_123', { amount: '50.00', orderId: 'ord_123' }),
            ).rejects.toThrow(InsufficientFundsException);
        });
    });

    describe('cancelReservation', () => {
        it('should return reserved funds to available', async () => {
            const mockBalance = {
                id: 'bal_123',
                userId: 'usr_123',
                available: '50.00',
                reserved: '50.00',
                currency: 'USD',
                updatedAt: new Date(),
            };

            mockPrisma.$transaction.mockImplementationOnce(async (callback: Function) => {
                return callback({
                    balance: {
                        findUnique: jest.fn().mockResolvedValueOnce(mockBalance),
                        create: jest.fn(),
                        update: jest.fn().mockResolvedValueOnce({
                            ...mockBalance,
                            available: '100.00',
                            reserved: '0.00',
                        }),
                    },
                    auditLog: {
                        create: jest.fn().mockResolvedValueOnce({ id: 'aud_test' }),
                    },
                });
            });

            const result = await service.cancelReservation('usr_123', {
                amount: '50.00',
                orderId: 'ord_123',
            });

            expect(result.success).toBe(true);
            expect(result.operation).toBe('CANCEL_RESERVATION');
            expect(result.newBalance.available).toBe('100.00');
            expect(result.newBalance.reserved).toBe('0.00');
        });

        it('should throw InsufficientReservedFundsException when reserved balance is too low', async () => {
            const mockBalance = {
                id: 'bal_123',
                userId: 'usr_123',
                available: '50.00',
                reserved: '20.00',
                currency: 'USD',
                updatedAt: new Date(),
            };

            mockPrisma.$transaction.mockImplementationOnce(async (callback: Function) => {
                return callback({
                    balance: {
                        findUnique: jest.fn().mockResolvedValueOnce(mockBalance),
                        create: jest.fn(),
                        update: jest.fn(),
                    },
                    auditLog: {
                        create: jest.fn(),
                    },
                });
            });

            await expect(
                service.cancelReservation('usr_123', { amount: '50.00', orderId: 'ord_123' }),
            ).rejects.toThrow(InsufficientReservedFundsException);
        });
    });

    describe('deductReserved', () => {
        it('should deduct funds from reserved balance', async () => {
            const mockBalance = {
                id: 'bal_123',
                userId: 'usr_123',
                available: '50.00',
                reserved: '50.00',
                currency: 'USD',
                updatedAt: new Date(),
            };

            mockPrisma.$transaction.mockImplementationOnce(async (callback: Function) => {
                return callback({
                    balance: {
                        findUnique: jest.fn().mockResolvedValueOnce(mockBalance),
                        create: jest.fn(),
                        update: jest.fn().mockResolvedValueOnce({
                            ...mockBalance,
                            reserved: '0.00',
                        }),
                    },
                    auditLog: {
                        create: jest.fn().mockResolvedValueOnce({ id: 'aud_test' }),
                    },
                });
            });

            const result = await service.deductReserved('usr_123', {
                amount: '50.00',
                orderId: 'ord_123',
            });

            expect(result.success).toBe(true);
            expect(result.operation).toBe('DEDUCT_RESERVED');
            expect(result.newBalance.available).toBe('50.00');
            expect(result.newBalance.reserved).toBe('0.00');
        });
    });

    describe('release', () => {
        it('should transfer reserved funds from buyer to seller available', async () => {
            const buyerBalance = {
                id: 'bal_buyer',
                userId: 'usr_buyer',
                available: '50.00',
                reserved: '100.00',
                currency: 'USD',
                updatedAt: new Date(),
            };

            const sellerBalance = {
                id: 'bal_seller',
                userId: 'usr_seller',
                available: '200.00',
                reserved: '0.00',
                currency: 'USD',
                updatedAt: new Date(),
            };

            mockPrisma.$transaction.mockImplementationOnce(async (callback: Function) => {
                const mockTx = {
                    balance: {
                        findUnique: jest.fn()
                            .mockResolvedValueOnce(buyerBalance)
                            .mockResolvedValueOnce(sellerBalance),
                        create: jest.fn().mockResolvedValue(sellerBalance),
                        update: jest.fn()
                            .mockResolvedValueOnce({ ...buyerBalance, reserved: '0.00' })
                            .mockResolvedValueOnce({
                                ...sellerBalance,
                                available: '300.00',
                                updatedAt: new Date(),
                            }),
                    },
                    auditLog: {
                        createMany: jest.fn().mockResolvedValueOnce({ count: 2 }),
                    },
                };
                return callback(mockTx);
            });

            const result = await service.release('usr_buyer', {
                amount: '100.00',
                orderId: 'ord_123',
                sellerId: 'usr_seller',
            });

            expect(result.success).toBe(true);
            expect(result.operation).toBe('RELEASE');
            expect(result.balance.available).toBe('300.00');
            expect(mockEventEmitter.emit).toHaveBeenCalledTimes(2);
        });

        it('should throw InsufficientReservedFundsException when buyer reserved is too low', async () => {
            const buyerBalance = {
                id: 'bal_buyer',
                userId: 'usr_buyer',
                available: '50.00',
                reserved: '50.00',
                currency: 'USD',
                updatedAt: new Date(),
            };

            mockPrisma.$transaction.mockImplementationOnce(async (callback: Function) => {
                const mockTx = {
                    balance: {
                        findUnique: jest.fn().mockResolvedValueOnce(buyerBalance),
                        create: jest.fn(),
                        update: jest.fn(),
                    },
                    auditLog: {
                        createMany: jest.fn(),
                    },
                };
                return callback(mockTx);
            });

            await expect(
                service.release('usr_buyer', {
                    amount: '100.00',
                    orderId: 'ord_123',
                    sellerId: 'usr_seller',
                }),
            ).rejects.toThrow(InsufficientReservedFundsException);
        });
    });

    describe('syncBalanceFromProvider', () => {
        it('should sync balance and report no discrepancy', async () => {
            mockPrisma.user.findUnique.mockResolvedValueOnce({
                id: 'usr_123',
                airtmUserId: 'airtm_user_456',
            });

            mockPrisma.balance.findUnique.mockResolvedValueOnce({
                id: 'bal_123',
                userId: 'usr_123',
                available: '100.00',
                reserved: '0.00',
                currency: 'USD',
                updatedAt: new Date(),
            });

            mockAirtmUser.getBalance.mockResolvedValueOnce({
                userId: 'airtm_user_456',
                available: 100.0,
                pending: 0,
                currency: 'USD',
                updatedAt: '2024-01-15T10:00:00Z',
            });

            const result = await service.syncBalanceFromProvider('usr_123');

            expect(result.synced).toBe(true);
            expect(result.discrepancy).toBe('0.00');
            expect(result.action).toBe('none');
        });

        it('should flag discrepancy when balances differ', async () => {
            mockPrisma.user.findUnique.mockResolvedValueOnce({
                id: 'usr_123',
                airtmUserId: 'airtm_user_456',
            });

            mockPrisma.balance.findUnique.mockResolvedValueOnce({
                id: 'bal_123',
                userId: 'usr_123',
                available: '100.00',
                reserved: '0.00',
                currency: 'USD',
                updatedAt: new Date(),
            });

            mockAirtmUser.getBalance.mockResolvedValueOnce({
                userId: 'airtm_user_456',
                available: 150.0,
                pending: 0,
                currency: 'USD',
                updatedAt: '2024-01-15T10:00:00Z',
            });

            const result = await service.syncBalanceFromProvider('usr_123');

            expect(result.synced).toBe(true);
            expect(result.discrepancy).toBe('50.00');
            expect(result.action).toBe('flagged');
        });

        it('should return synced=false when user has no Airtm account', async () => {
            mockPrisma.user.findUnique.mockResolvedValueOnce({
                id: 'usr_123',
                airtmUserId: null,
            });

            const result = await service.syncBalanceFromProvider('usr_123');

            expect(result.synced).toBe(false);
            expect(result.action).toBe('none');
        });
    });

    describe('concurrent access scenarios', () => {
        it('should handle serializable transaction isolation', async () => {
            // This test verifies that transactions are configured with serializable isolation
            const mockBalance = {
                id: 'bal_123',
                userId: 'usr_123',
                available: '100.00',
                reserved: '0.00',
                currency: 'USD',
                updatedAt: new Date(),
            };

            mockPrisma.$transaction.mockImplementationOnce(async (callback: Function, options: any) => {
                // Verify isolation level is set to Serializable
                expect(options.isolationLevel).toBe('Serializable');
                expect(options.timeout).toBe(10000);

                return callback({
                    balance: {
                        findUnique: jest.fn().mockResolvedValueOnce(mockBalance),
                        create: jest.fn(),
                        update: jest.fn().mockResolvedValueOnce({
                            ...mockBalance,
                            available: '50.00',
                            reserved: '50.00',
                        }),
                    },
                    auditLog: {
                        create: jest.fn().mockResolvedValueOnce({ id: 'aud_test' }),
                    },
                });
            });

            await service.reserve('usr_123', {
                amount: '50.00',
                orderId: 'ord_123',
            });

            expect(mockPrisma.$transaction).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({
                    isolationLevel: 'Serializable',
                    timeout: 10000,
                }),
            );
        });

        it('should create audit log on failed operation', async () => {
            const mockBalance = {
                id: 'bal_123',
                userId: 'usr_123',
                available: '10.00',
                reserved: '0.00',
                currency: 'USD',
                updatedAt: new Date(),
            };

            mockPrisma.$transaction.mockImplementationOnce(async (callback: Function) => {
                return callback({
                    balance: {
                        findUnique: jest.fn().mockResolvedValueOnce(mockBalance),
                        create: jest.fn(),
                        update: jest.fn(),
                    },
                    auditLog: {
                        create: jest.fn(),
                    },
                });
            });

            // This should fail due to insufficient funds
            try {
                await service.reserve('usr_123', {
                    amount: '50.00',
                    orderId: 'ord_123',
                });
            } catch (error) {
                // Expected to throw
            }

            // Verify audit log was created for failed operation
            expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        action: 'RESERVE',
                        result: 'FAILURE',
                    }),
                }),
            );
        });
    });

    describe('edge cases', () => {
        it('should create balance record if not exists', async () => {
            mockPrisma.$transaction.mockImplementationOnce(async (callback: Function) => {
                const mockTx = {
                    balance: {
                        findUnique: jest.fn().mockResolvedValueOnce(null),
                        create: jest.fn().mockResolvedValueOnce({
                            id: 'bal_new',
                            userId: 'usr_new',
                            available: '0.00',
                            reserved: '0.00',
                            currency: 'USD',
                            updatedAt: new Date(),
                        }),
                        update: jest.fn().mockResolvedValueOnce({
                            id: 'bal_new',
                            userId: 'usr_new',
                            available: '100.00',
                            reserved: '0.00',
                            currency: 'USD',
                            updatedAt: new Date(),
                        }),
                    },
                    auditLog: {
                        create: jest.fn().mockResolvedValueOnce({ id: 'aud_test' }),
                    },
                };
                return callback(mockTx);
            });

            const result = await service.creditAvailable('usr_new', {
                amount: '100.00',
            });

            expect(result.success).toBe(true);
            expect(result.newBalance.available).toBe('100.00');
        });

        it('should handle decimal precision correctly', async () => {
            const mockBalance = {
                id: 'bal_123',
                userId: 'usr_123',
                available: '100.99',
                reserved: '0.00',
                currency: 'USD',
                updatedAt: new Date(),
            };

            mockPrisma.$transaction.mockImplementationOnce(async (callback: Function) => {
                return callback({
                    balance: {
                        findUnique: jest.fn().mockResolvedValueOnce(mockBalance),
                        create: jest.fn(),
                        update: jest.fn().mockResolvedValueOnce({
                            ...mockBalance,
                            available: '101.00',
                        }),
                    },
                    auditLog: {
                        create: jest.fn().mockResolvedValueOnce({ id: 'aud_test' }),
                    },
                });
            });

            const result = await service.creditAvailable('usr_123', {
                amount: '0.01',
            });

            // Verify decimal precision is maintained
            expect(result.newBalance.available).toBe('101.00');
        });
    });
});
