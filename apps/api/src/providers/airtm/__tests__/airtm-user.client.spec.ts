import { Test, TestingModule } from '@nestjs/testing';
import { AirtmUserClient } from '../clients/airtm-user.client';
import { AirtmConfig } from '../airtm.config';
import { RedisService } from '../../../modules/redis/redis.service';
import {
    mockUserResponses,
    mockAirtmConfig,
    createMockRedisService,
} from './mocks/airtm.mocks';

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
                this.name = 'HTTPError';
                this.response = { status };
            }
        },
    };
});

describe('AirtmUserClient', () => {
    let client: AirtmUserClient;
    let mockKy: jest.Mocked<any>;
    let mockRedis: ReturnType<typeof createMockRedisService>;

    beforeEach(async () => {
        jest.clearAllMocks();

        const ky = require('ky').default;
        mockKy = ky.create();
        mockRedis = createMockRedisService();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AirtmUserClient,
                {
                    provide: AirtmConfig,
                    useValue: mockAirtmConfig,
                },
                {
                    provide: RedisService,
                    useValue: mockRedis,
                },
            ],
        }).compile();

        client = module.get<AirtmUserClient>(AirtmUserClient);
    });

    describe('getUserByEmail', () => {
        it('should return user from API when not cached', async () => {
            mockRedis.get.mockResolvedValueOnce(null);
            mockKy.get().json.mockResolvedValueOnce(mockUserResponses.active);

            const result = await client.getUserByEmail('test@example.com');

            expect(result).toEqual(mockUserResponses.active);
            expect(mockRedis.set).toHaveBeenCalled();
        });

        it('should return user from cache when available', async () => {
            mockRedis.get.mockResolvedValueOnce(JSON.stringify(mockUserResponses.active));

            const result = await client.getUserByEmail('test@example.com');

            expect(result).toEqual(mockUserResponses.active);
            expect(mockKy.get).not.toHaveBeenCalled();
        });

        it('should return null for non-existent user', async () => {
            mockRedis.get.mockResolvedValueOnce(null);
            const HTTPError = require('ky').HTTPError;
            mockKy.get().json.mockRejectedValueOnce(new HTTPError('Not found', 404));

            const result = await client.getUserByEmail('nonexistent@example.com');

            expect(result).toBeNull();
        });
    });

    describe('verifyUserEligibility', () => {
        it('should return eligible for active verified user', async () => {
            mockRedis.get.mockResolvedValueOnce(null);
            mockKy.get().json.mockResolvedValueOnce(mockUserResponses.active);

            const result = await client.verifyUserEligibility('test@example.com');

            expect(result.eligible).toBe(true);
            expect(result.airtmUserId).toBe('airtm_user_456');
            expect(result.failureReason).toBeUndefined();
        });

        it('should return not eligible for inactive user', async () => {
            mockRedis.get.mockResolvedValueOnce(null);
            mockKy.get().json.mockResolvedValueOnce(mockUserResponses.inactive);

            const result = await client.verifyUserEligibility('inactive@example.com');

            expect(result.eligible).toBe(false);
            expect(result.failureReason).toBe('USER_INACTIVE');
        });

        it('should return not eligible for unverified user', async () => {
            mockRedis.get.mockResolvedValueOnce(null);
            mockKy.get().json.mockResolvedValueOnce(mockUserResponses.unverified);

            const result = await client.verifyUserEligibility('unverified@example.com');

            expect(result.eligible).toBe(false);
            expect(result.failureReason).toBe('USER_NOT_VERIFIED');
        });

        it('should return not eligible for non-existent user', async () => {
            mockRedis.get.mockResolvedValueOnce(null);
            const HTTPError = require('ky').HTTPError;
            mockKy.get().json.mockRejectedValueOnce(new HTTPError('Not found', 404));

            const result = await client.verifyUserEligibility('nonexistent@example.com');

            expect(result.eligible).toBe(false);
            expect(result.failureReason).toBe('USER_NOT_FOUND');
        });
    });

    describe('invalidateCache', () => {
        it('should delete cached user data', async () => {
            await client.invalidateCache('test@example.com');

            expect(mockRedis.del).toHaveBeenCalled();
        });
    });
});
