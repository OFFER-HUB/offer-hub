import { Test, TestingModule } from '@nestjs/testing';
import { AirtmPayoutClient } from '../clients/airtm-payout.client';
import { AirtmConfig } from '../airtm.config';
import { mockPayoutResponses, mockAirtmConfig } from './mocks/airtm.mocks';

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

describe('AirtmPayoutClient', () => {
    let client: AirtmPayoutClient;
    let mockKy: jest.Mocked<any>;

    beforeEach(async () => {
        jest.clearAllMocks();

        const ky = require('ky').default;
        mockKy = ky.create();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AirtmPayoutClient,
                {
                    provide: AirtmConfig,
                    useValue: mockAirtmConfig,
                },
            ],
        }).compile();

        client = module.get<AirtmPayoutClient>(AirtmPayoutClient);
    });

    describe('createPayout', () => {
        it('should create a payout without commit (two-step)', async () => {
            mockKy.post().json.mockResolvedValueOnce(mockPayoutResponses.created);

            const result = await client.createPayout({
                amount: '50.00',
                sourceUserId: 'airtm_user_456',
                destinationType: 'bank',
                destinationRef: 'bank_ref_123',
            });

            expect(result).toEqual(mockPayoutResponses.created);
            expect(result.status).toBe('CREATED');
        });

        it('should create and commit payout in one step', async () => {
            mockKy.post().json.mockResolvedValueOnce(mockPayoutResponses.committed);

            const result = await client.createPayout({
                amount: '50.00',
                sourceUserId: 'airtm_user_456',
                destinationType: 'bank',
                destinationRef: 'bank_ref_123',
                commit: true,
            });

            expect(result.status).toBe('COMMITTED');
        });

        it('should throw error for invalid amount', async () => {
            await expect(
                client.createPayout({
                    amount: 'invalid',
                    sourceUserId: 'airtm_user_456',
                    destinationType: 'bank',
                    destinationRef: 'bank_ref_123',
                }),
            ).rejects.toThrow('Invalid amount');
        });
    });

    describe('commitPayout', () => {
        it('should commit a created payout', async () => {
            mockKy.post().json.mockResolvedValueOnce(mockPayoutResponses.committed);

            const result = await client.commitPayout('airtm_payout_789');

            expect(result.status).toBe('COMMITTED');
        });
    });

    describe('getPayout', () => {
        it('should return payout by ID', async () => {
            mockKy.get().json.mockResolvedValueOnce(mockPayoutResponses.created);

            const result = await client.getPayout('airtm_payout_789');

            expect(result.id).toBe('airtm_payout_789');
        });
    });

    describe('cancelPayout', () => {
        it('should cancel a created payout', async () => {
            const canceledPayout = { ...mockPayoutResponses.created, status: 'CANCELED' };
            mockKy.post().json.mockResolvedValueOnce(canceledPayout);

            const result = await client.cancelPayout('airtm_payout_789');

            expect(result.status).toBe('CANCELED');
        });
    });

    describe('createAndCommitPayout', () => {
        it('should create and commit in one call', async () => {
            mockKy.post().json.mockResolvedValueOnce(mockPayoutResponses.committed);

            const result = await client.createAndCommitPayout({
                amount: '50.00',
                sourceUserId: 'airtm_user_456',
                destinationType: 'bank',
                destinationRef: 'bank_ref_123',
            });

            expect(result.status).toBe('COMMITTED');
        });
    });
});
