import { Test, TestingModule } from '@nestjs/testing';
import { AirtmWebhookService } from '../services/airtm-webhook.service';
import { AirtmConfig } from '../airtm.config';
import { PrismaService } from '../../../modules/database/prisma.service';
import { AirtmWebhookSignatureException } from '../exceptions';
import {
    mockWebhookPayloads,
    mockSvixHeaders,
    mockAirtmConfig,
    createMockPrismaService,
} from './mocks/airtm.mocks';
import { TopUpStatus, WithdrawalStatus, WebhookStatus } from '@offerhub/shared';

// Mock svix module
jest.mock('svix', () => ({
    Webhook: jest.fn().mockImplementation(() => ({
        verify: jest.fn(),
    })),
}));

describe('AirtmWebhookService', () => {
    let service: AirtmWebhookService;
    let mockPrisma: ReturnType<typeof createMockPrismaService>;
    let mockSvixWebhook: jest.Mocked<any>;

    beforeEach(async () => {
        jest.clearAllMocks();

        mockPrisma = createMockPrismaService();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AirtmWebhookService,
                {
                    provide: AirtmConfig,
                    useValue: mockAirtmConfig,
                },
                {
                    provide: PrismaService,
                    useValue: mockPrisma,
                },
            ],
        }).compile();

        service = module.get<AirtmWebhookService>(AirtmWebhookService);

        // Get reference to mocked Svix webhook
        const { Webhook } = require('svix');
        mockSvixWebhook = Webhook.mock.results[0].value;
    });

    describe('verifySignature', () => {
        it('should verify valid signature and return payload', () => {
            mockSvixWebhook.verify.mockReturnValueOnce(mockWebhookPayloads.payinSucceeded);

            const result = service.verifySignature(
                JSON.stringify(mockWebhookPayloads.payinSucceeded),
                mockSvixHeaders,
            );

            expect(result).toEqual(mockWebhookPayloads.payinSucceeded);
            expect(mockSvixWebhook.verify).toHaveBeenCalledWith(
                JSON.stringify(mockWebhookPayloads.payinSucceeded),
                mockSvixHeaders,
            );
        });

        it('should throw AirtmWebhookSignatureException for invalid signature', () => {
            mockSvixWebhook.verify.mockImplementationOnce(() => {
                throw new Error('Invalid signature');
            });

            expect(() =>
                service.verifySignature(
                    JSON.stringify(mockWebhookPayloads.payinSucceeded),
                    mockSvixHeaders,
                ),
            ).toThrow(AirtmWebhookSignatureException);
        });
    });

    describe('processEvent', () => {
        describe('deduplication', () => {
            it('should ignore duplicate events', async () => {
                mockPrisma.webhookEvent.findUnique.mockResolvedValueOnce({
                    id: 'existing_webhook',
                    status: WebhookStatus.PROCESSED,
                });

                const result = await service.processEvent(mockWebhookPayloads.payinSucceeded);

                expect(result.success).toBe(true);
                expect(result.duplicate).toBe(true);
                expect(mockPrisma.webhookEvent.create).not.toHaveBeenCalled();
            });
        });

        describe('payin events', () => {
            it('should update TopUp status on payin.succeeded', async () => {
                mockPrisma.webhookEvent.findUnique.mockResolvedValueOnce(null);
                mockPrisma.topUp.findFirst.mockResolvedValueOnce({
                    id: 'topup_abc123',
                    airtmPayinId: 'airtm_payin_123',
                    userId: 'usr_123',
                    amount: 100.0,
                    currency: 'USD',
                    status: TopUpStatus.TOPUP_PROCESSING,
                });

                const result = await service.processEvent(mockWebhookPayloads.payinSucceeded);

                expect(result.success).toBe(true);
                expect(result.duplicate).toBe(false);
                expect(result.newStatus).toBe(TopUpStatus.TOPUP_SUCCEEDED);
                expect(mockPrisma.topUp.update).toHaveBeenCalledWith(
                    expect.objectContaining({
                        where: { id: 'topup_abc123' },
                        data: expect.objectContaining({
                            status: TopUpStatus.TOPUP_SUCCEEDED,
                        }),
                    }),
                );
                // Should credit balance on success
                expect(mockPrisma.balance.update).toHaveBeenCalled();
            });

            it('should update TopUp status on payin.failed', async () => {
                mockPrisma.webhookEvent.findUnique.mockResolvedValueOnce(null);
                mockPrisma.topUp.findFirst.mockResolvedValueOnce({
                    id: 'topup_abc123',
                    airtmPayinId: 'airtm_payin_123',
                    userId: 'usr_123',
                    amount: 100.0,
                    currency: 'USD',
                    status: TopUpStatus.TOPUP_PROCESSING,
                });

                const result = await service.processEvent(mockWebhookPayloads.payinFailed);

                expect(result.success).toBe(true);
                expect(result.newStatus).toBe(TopUpStatus.TOPUP_FAILED);
                // Should NOT credit balance on failure
                expect(mockPrisma.balance.upsert).not.toHaveBeenCalled();
            });

            it('should skip update if TopUp not found', async () => {
                mockPrisma.webhookEvent.findUnique.mockResolvedValueOnce(null);
                mockPrisma.topUp.findFirst.mockResolvedValueOnce(null);

                const result = await service.processEvent(mockWebhookPayloads.payinSucceeded);

                expect(result.success).toBe(false);
                expect(result.error).toContain('TopUp not found');
            });

            it('should skip update if TopUp already in terminal state', async () => {
                mockPrisma.webhookEvent.findUnique.mockResolvedValueOnce(null);
                mockPrisma.topUp.findFirst.mockResolvedValueOnce({
                    id: 'topup_abc123',
                    airtmPayinId: 'airtm_payin_123',
                    status: TopUpStatus.TOPUP_SUCCEEDED, // Already terminal
                });

                const result = await service.processEvent(mockWebhookPayloads.payinSucceeded);

                expect(result.success).toBe(true);
                expect(mockPrisma.topUp.update).not.toHaveBeenCalled();
            });
        });

        describe('payout events', () => {
            it('should update Withdrawal status on payout.completed', async () => {
                mockPrisma.webhookEvent.findUnique.mockResolvedValueOnce(null);
                mockPrisma.withdrawal.findFirst.mockResolvedValueOnce({
                    id: 'wd_abc123',
                    airtmPayoutId: 'airtm_payout_789',
                    userId: 'usr_123',
                    amount: 50.0,
                    currency: 'USD',
                    status: WithdrawalStatus.WITHDRAWAL_PENDING,
                });

                const result = await service.processEvent(mockWebhookPayloads.payoutCompleted);

                expect(result.success).toBe(true);
                expect(result.newStatus).toBe(WithdrawalStatus.WITHDRAWAL_COMPLETED);
            });

            it('should refund balance on payout.failed', async () => {
                mockPrisma.webhookEvent.findUnique.mockResolvedValueOnce(null);
                mockPrisma.withdrawal.findFirst.mockResolvedValueOnce({
                    id: 'wd_abc123',
                    airtmPayoutId: 'airtm_payout_789',
                    userId: 'usr_123',
                    amount: 50.0,
                    currency: 'USD',
                    status: WithdrawalStatus.WITHDRAWAL_PENDING,
                });

                const result = await service.processEvent(mockWebhookPayloads.payoutFailed);

                expect(result.success).toBe(true);
                expect(result.newStatus).toBe(WithdrawalStatus.WITHDRAWAL_FAILED);
                // Should refund balance on failure
                expect(mockPrisma.balance.update).toHaveBeenCalled();
            });
        });

        describe('webhook event recording', () => {
            it('should create webhook event record with RECEIVED status', async () => {
                mockPrisma.webhookEvent.findUnique.mockResolvedValueOnce(null);

                await service.processEvent(mockWebhookPayloads.payinSucceeded);

                expect(mockPrisma.webhookEvent.create).toHaveBeenCalledWith(
                    expect.objectContaining({
                        data: expect.objectContaining({
                            provider: 'AIRTM',
                            providerEventId: mockWebhookPayloads.payinSucceeded.eventId,
                            status: WebhookStatus.RECEIVED,
                        }),
                    }),
                );
            });

            it('should update webhook event to PROCESSED on success', async () => {
                mockPrisma.webhookEvent.findUnique.mockResolvedValueOnce(null);
                mockPrisma.webhookEvent.create.mockResolvedValueOnce({ id: 'webhook_1' });

                await service.processEvent(mockWebhookPayloads.payinSucceeded);

                expect(mockPrisma.webhookEvent.update).toHaveBeenCalledWith(
                    expect.objectContaining({
                        where: { id: 'webhook_1' },
                        data: expect.objectContaining({
                            status: WebhookStatus.PROCESSED,
                        }),
                    }),
                );
            });
        });
    });
});
