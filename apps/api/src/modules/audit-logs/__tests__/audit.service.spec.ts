import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from '../audit.service';
import { PrismaService } from '../../database/prisma.service';
import { RedactionService } from '../redaction.service';
import type { AuditEntryInput } from '../audit.types';

const createMockPrismaService = () => ({
    auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'aud_test123' }),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
    },
});

describe('AuditService', () => {
    let service: AuditService;
    let mockPrisma: ReturnType<typeof createMockPrismaService>;
    let mockRedaction: { redact: jest.Mock };

    const baseEntry: AuditEntryInput = {
        marketplaceId: 'mkt_abc',
        action: 'CREATE',
        resourceType: 'Order',
        resourceId: 'ord_xyz',
        payloadAfter: { status: 'ORDER_CREATED', amount: '100.00' },
        actorType: 'USER',
        actorId: 'usr_1',
        result: 'SUCCESS',
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        mockPrisma = createMockPrismaService();
        mockRedaction = { redact: jest.fn((x: unknown) => x) };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuditService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: RedactionService, useValue: mockRedaction },
            ],
        }).compile();
        service = module.get(AuditService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('persist', () => {
        it('creates audit log with all fields and redacts payloads', async () => {
            await service.persist(baseEntry);

            expect(mockRedaction.redact).toHaveBeenCalledWith(baseEntry.payloadAfter);
            expect(mockPrisma.auditLog.create).toHaveBeenCalledTimes(1);
            const call = mockPrisma.auditLog.create.mock.calls[0][0];
            expect(call.data.marketplaceId).toBe('mkt_abc');
            expect(call.data.action).toBe('CREATE');
            expect(call.data.resourceType).toBe('Order');
            expect(call.data.resourceId).toBe('ord_xyz');
            expect(call.data.actorType).toBe('USER');
            expect(call.data.actorId).toBe('usr_1');
            expect(call.data.result).toBe('SUCCESS');
            expect(call.data.id).toMatch(/^aud_/);
        });

        it('stores payloadBefore and payloadAfter when provided', async () => {
            const entry: AuditEntryInput = {
                ...baseEntry,
                action: 'UPDATE',
                payloadBefore: { status: 'ORDER_CREATED' },
                payloadAfter: { status: 'FUNDS_RESERVED' },
            };
            await service.persist(entry);

            expect(mockRedaction.redact).toHaveBeenCalledWith(entry.payloadBefore);
            expect(mockRedaction.redact).toHaveBeenCalledWith(entry.payloadAfter);
            const call = mockPrisma.auditLog.create.mock.calls[0][0];
            expect(call.data.payloadBefore).toEqual(entry.payloadBefore);
            expect(call.data.payloadAfter).toEqual(entry.payloadAfter);
        });

        it('includes correlationId, ip, userAgent when provided', async () => {
            const entry: AuditEntryInput = {
                ...baseEntry,
                correlationId: 'req_123',
                ip: '192.168.1.1',
                userAgent: 'Mozilla/5.0',
            };
            await service.persist(entry);

            const call = mockPrisma.auditLog.create.mock.calls[0][0];
            expect(call.data.correlationId).toBe('req_123');
            expect(call.data.ip).toBe('192.168.1.1');
            expect(call.data.userAgent).toBe('Mozilla/5.0');
        });
    });

    describe('log', () => {
        it('calls persist and catches errors', async () => {
            mockPrisma.auditLog.create.mockRejectedValueOnce(new Error('DB error'));
            const promise = service.log(baseEntry);
            await expect(promise).resolves.toBeUndefined();
            expect(mockPrisma.auditLog.create).toHaveBeenCalled();
        });
    });

    describe('listLogs', () => {
        it('returns items with filters and pagination', async () => {
            const items = [
                {
                    id: 'aud_1',
                    occurredAt: new Date(),
                    action: 'CREATE',
                    resourceType: 'Order',
                    resourceId: 'ord_1',
                    payloadBefore: null,
                    payloadAfter: {},
                    actorType: 'USER',
                    actorId: 'usr_1',
                    result: 'SUCCESS',
                    correlationId: null,
                },
            ];
            mockPrisma.auditLog.findMany.mockResolvedValueOnce(items);

            const result = await service.listLogs({
                marketplaceId: 'mkt_abc',
                limit: 10,
            });

            expect(result.items).toEqual(items);
            expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { marketplaceId: 'mkt_abc' },
                    take: 10,
                    orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
                }),
            );
        });

        it('applies resourceType, resourceId, action, userId filters', async () => {
            mockPrisma.auditLog.findMany.mockResolvedValueOnce([]);

            await service.listLogs({
                marketplaceId: 'mkt_abc',
                resourceType: 'Order',
                resourceId: 'ord_xyz',
                action: 'UPDATE',
                userId: 'usr_1',
                limit: 20,
            });

            expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        marketplaceId: 'mkt_abc',
                        resourceType: 'Order',
                        resourceId: 'ord_xyz',
                        action: 'UPDATE',
                        userId: 'usr_1',
                    },
                }),
            );
        });
    });
});
