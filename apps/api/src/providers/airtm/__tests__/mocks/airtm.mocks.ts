import type {
    AirtmPayinResponse,
    AirtmPayoutResponse,
    AirtmUserResponse,
    AirtmWebhookPayload,
} from '../../types';

/**
 * Mock Airtm payin responses for testing.
 */
export const mockPayinResponses = {
    created: {
        id: 'airtm_payin_123',
        code: 'topup_abc123xyz456789',
        amount: 100.0,
        currency: 'USD',
        status: 'CREATED',
        confirmationUri: 'https://airtm.io/confirm/abc123',
        destinationUserId: 'airtm_user_456',
        description: 'Test top-up',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        expiresAt: '2024-01-15T11:00:00Z',
    } satisfies AirtmPayinResponse,

    awaitingConfirmation: {
        id: 'airtm_payin_123',
        code: 'topup_abc123xyz456789',
        amount: 100.0,
        currency: 'USD',
        status: 'AWAITING_USER_CONFIRMATION',
        confirmationUri: 'https://airtm.io/confirm/abc123',
        destinationUserId: 'airtm_user_456',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:01:00Z',
    } satisfies AirtmPayinResponse,

    succeeded: {
        id: 'airtm_payin_123',
        code: 'topup_abc123xyz456789',
        amount: 100.0,
        currency: 'USD',
        status: 'SUCCEEDED',
        confirmationUri: 'https://airtm.io/confirm/abc123',
        destinationUserId: 'airtm_user_456',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:05:00Z',
    } satisfies AirtmPayinResponse,

    failed: {
        id: 'airtm_payin_123',
        code: 'topup_abc123xyz456789',
        amount: 100.0,
        currency: 'USD',
        status: 'FAILED',
        confirmationUri: 'https://airtm.io/confirm/abc123',
        destinationUserId: 'airtm_user_456',
        reasonCode: 'PAYMENT_DECLINED',
        reasonDescription: 'Payment was declined by the provider',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:05:00Z',
    } satisfies AirtmPayinResponse,
};

/**
 * Mock Airtm payout responses for testing.
 */
export const mockPayoutResponses = {
    created: {
        id: 'airtm_payout_789',
        amount: 50.0,
        currency: 'USD',
        fee: 1.5,
        status: 'CREATED',
        sourceUserId: 'airtm_user_456',
        destinationType: 'bank',
        destinationRef: 'bank_ref_123',
        description: 'Test withdrawal',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
    } satisfies AirtmPayoutResponse,

    committed: {
        id: 'airtm_payout_789',
        amount: 50.0,
        currency: 'USD',
        fee: 1.5,
        status: 'COMMITTED',
        sourceUserId: 'airtm_user_456',
        destinationType: 'bank',
        destinationRef: 'bank_ref_123',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:01:00Z',
    } satisfies AirtmPayoutResponse,

    completed: {
        id: 'airtm_payout_789',
        amount: 50.0,
        currency: 'USD',
        fee: 1.5,
        status: 'COMPLETED',
        sourceUserId: 'airtm_user_456',
        destinationType: 'bank',
        destinationRef: 'bank_ref_123',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:10:00Z',
    } satisfies AirtmPayoutResponse,

    failed: {
        id: 'airtm_payout_789',
        amount: 50.0,
        currency: 'USD',
        status: 'FAILED',
        sourceUserId: 'airtm_user_456',
        destinationType: 'bank',
        destinationRef: 'bank_ref_123',
        reasonCode: 'INVALID_DESTINATION',
        reasonDescription: 'Bank account is invalid',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:05:00Z',
    } satisfies AirtmPayoutResponse,
};

/**
 * Mock Airtm user responses for testing.
 */
export const mockUserResponses = {
    active: {
        id: 'airtm_user_456',
        email: 'test@example.com',
        status: 'active',
        isVerified: true,
        country: 'US',
        createdAt: '2023-06-01T10:00:00Z',
    } satisfies AirtmUserResponse,

    inactive: {
        id: 'airtm_user_789',
        email: 'inactive@example.com',
        status: 'inactive',
        isVerified: true,
        country: 'US',
        createdAt: '2023-06-01T10:00:00Z',
    } satisfies AirtmUserResponse,

    unverified: {
        id: 'airtm_user_101',
        email: 'unverified@example.com',
        status: 'active',
        isVerified: false,
        country: 'US',
        createdAt: '2023-06-01T10:00:00Z',
    } satisfies AirtmUserResponse,
};

/**
 * Mock webhook payloads for testing.
 */
export const mockWebhookPayloads = {
    payinSucceeded: {
        eventId: 'evt_payin_123',
        eventType: 'payin.succeeded',
        occurredAt: '2024-01-15T10:05:00Z',
        data: {
            id: 'airtm_payin_123',
            code: 'topup_abc123xyz456789',
            amount: 100.0,
            currency: 'USD',
            status: 'SUCCEEDED',
        },
    } satisfies AirtmWebhookPayload,

    payinFailed: {
        eventId: 'evt_payin_456',
        eventType: 'payin.failed',
        occurredAt: '2024-01-15T10:05:00Z',
        data: {
            id: 'airtm_payin_123',
            code: 'topup_abc123xyz456789',
            amount: 100.0,
            currency: 'USD',
            status: 'FAILED',
            reasonCode: 'PAYMENT_DECLINED',
            reasonDescription: 'Payment declined',
        },
    } satisfies AirtmWebhookPayload,

    payoutCompleted: {
        eventId: 'evt_payout_789',
        eventType: 'payout.completed',
        occurredAt: '2024-01-15T10:10:00Z',
        data: {
            id: 'airtm_payout_789',
            amount: 50.0,
            currency: 'USD',
            status: 'COMPLETED',
        },
    } satisfies AirtmWebhookPayload,

    payoutFailed: {
        eventId: 'evt_payout_101',
        eventType: 'payout.failed',
        occurredAt: '2024-01-15T10:05:00Z',
        data: {
            id: 'airtm_payout_789',
            amount: 50.0,
            currency: 'USD',
            status: 'FAILED',
            reasonCode: 'INVALID_DESTINATION',
            reasonDescription: 'Invalid destination',
        },
    } satisfies AirtmWebhookPayload,
};

/**
 * Mock Svix headers for webhook signature verification.
 */
export const mockSvixHeaders = {
    'svix-id': 'msg_abc123',
    'svix-timestamp': '1705320300',
    'svix-signature': 'v1,signature_abc123',
};

/**
 * Mock AirtmConfig for testing.
 * Note: basicAuthHeader is generated dynamically to avoid false-positive secret detection.
 */
export const mockAirtmConfig = {
    environment: 'sandbox' as const,
    apiKey: 'test_api_key',
    apiSecret: 'test_api_secret',
    webhookSecret: 'whsec_test_webhook_secret',
    baseUrl: 'https://sandbox-enterprise.airtm.io/api/v2',
    get basicAuthHeader(): string {
        const credentials = `${this.apiKey}:${this.apiSecret}`;
        return `Basic ${Buffer.from(credentials).toString('base64')}`;
    },
    get isWebhookVerificationEnabled(): boolean {
        return !!this.webhookSecret && this.webhookSecret.length >= 20;
    },
};

/**
 * Creates a mock Redis service for testing.
 */
export const createMockRedisService = () => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
});

/**
 * Creates a mock Prisma service for testing.
 */
export const createMockPrismaService = () => ({
    webhookEvent: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'webhook_evt_1' }),
        update: jest.fn().mockResolvedValue({}),
    },
    topUp: {
        findFirst: jest.fn().mockResolvedValue({
            id: 'topup_abc123',
            airtmPayinId: 'airtm_payin_123',
            userId: 'usr_123',
            amount: 100.0,
            currency: 'USD',
            status: 'TOPUP_PROCESSING',
        }),
        update: jest.fn().mockResolvedValue({}),
    },
    withdrawal: {
        findFirst: jest.fn().mockResolvedValue({
            id: 'wd_abc123',
            airtmPayoutId: 'airtm_payout_789',
            userId: 'usr_123',
            amount: 50.0,
            currency: 'USD',
            status: 'WITHDRAWAL_PENDING',
        }),
        update: jest.fn().mockResolvedValue({}),
    },
    balance: {
        findUnique: jest.fn().mockResolvedValue({
            id: 'bal_123',
            userId: 'usr_123',
            available: '100.00',
            reserved: '50.00',
            currency: 'USD',
        }),
        create: jest.fn().mockResolvedValue({}),
        upsert: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
    },
});
