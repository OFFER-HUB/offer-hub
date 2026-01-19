import { Test, TestingModule } from '@nestjs/testing';
import { AirtmPayinClient } from '../clients/airtm-payin.client';
import { AirtmConfig } from '../airtm.config';
import { mockPayinResponses, mockAirtmConfig } from './mocks/airtm.mocks';

// Mock ky module
jest.mock('ky', () => {
    const mockResponse = {
        json: jest.fn(),
    };
    const mockClient = {
        get: jest.fn().mockReturnValue(mockResponse),
        post: jest.fn().mockReturnValue(mockResponse),
        put: jest.fn().mockReturnValue(mockResponse),
        delete: jest.fn().mockReturnValue(mockResponse),
    };
    return {
        __esModule: true,
        default: {
            create: jest.fn().mockReturnValue(mockClient),
        },
        HTTPError: class HTTPError extends Error {
            response: { status: number };
            constructor(message: string, status: number) {
                super(message);
                this.response = { status };
            }
        },
    };
});

describe('AirtmPayinClient', () => {
    let client: AirtmPayinClient;
    let mockKy: jest.Mocked<any>;

    beforeEach(async () => {
        // Reset mocks
        jest.clearAllMocks();

        // Get reference to mocked ky
        const ky = require('ky').default;
        mockKy = ky.create();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AirtmPayinClient,
                {
                    provide: AirtmConfig,
                    useValue: mockAirtmConfig,
                },
            ],
        }).compile();

        client = module.get<AirtmPayinClient>(AirtmPayinClient);
    });

    describe('createPayin', () => {
        it('should create a payin with generated code', async () => {
            mockKy.post().json.mockResolvedValueOnce(mockPayinResponses.created);

            const result = await client.createPayin({
                amount: '100.00',
                destinationUserId: 'airtm_user_456',
                description: 'Test top-up',
            });

            expect(result).toEqual(mockPayinResponses.created);
            expect(result.confirmationUri).toBeDefined();
            expect(result.status).toBe('CREATED');
        });

        it('should throw error for invalid amount', async () => {
            await expect(
                client.createPayin({
                    amount: 'invalid',
                    destinationUserId: 'airtm_user_456',
                }),
            ).rejects.toThrow('Invalid amount');
        });

        it('should throw error for negative amount', async () => {
            await expect(
                client.createPayin({
                    amount: '-50.00',
                    destinationUserId: 'airtm_user_456',
                }),
            ).rejects.toThrow('Invalid amount');
        });
    });

    describe('getPayin', () => {
        it('should return payin by ID', async () => {
            mockKy.get().json.mockResolvedValueOnce(mockPayinResponses.created);

            const result = await client.getPayin('airtm_payin_123');

            expect(result.id).toBe('airtm_payin_123');
            expect(result.status).toBe('CREATED');
        });
    });

    describe('getPayinByCode', () => {
        it('should return payin by code', async () => {
            mockKy.get().json.mockResolvedValueOnce(mockPayinResponses.created);

            const result = await client.getPayinByCode('topup_abc123xyz456789');

            expect(result.code).toBe('topup_abc123xyz456789');
        });
    });

    describe('refreshPayinStatus', () => {
        it('should return updated payin status', async () => {
            mockKy.get().json.mockResolvedValueOnce(mockPayinResponses.succeeded);

            const result = await client.refreshPayinStatus('airtm_payin_123');

            expect(result.status).toBe('SUCCEEDED');
        });
    });

    describe('cancelPayin', () => {
        it('should cancel payin', async () => {
            const canceledPayin = { ...mockPayinResponses.created, status: 'CANCELED' };
            mockKy.post().json.mockResolvedValueOnce(canceledPayin);

            const result = await client.cancelPayin('airtm_payin_123');

            expect(result.status).toBe('CANCELED');
        });
    });
});
