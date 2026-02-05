import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { HealthController } from '../health/health.controller';
import { QUEUE_NAMES } from '../queues/queue.constants';

describe('HealthController', () => {
    let controller: HealthController;
    let mockWebhooksQueue: any;
    let mockReconciliationQueue: any;
    let mockNotificationsQueue: any;
    let mockDlqQueue: any;

    beforeEach(async () => {
        const createMockQueue = () => ({
            getWaitingCount: jest.fn().mockResolvedValue(5),
            getActiveCount: jest.fn().mockResolvedValue(2),
            getCompletedCount: jest.fn().mockResolvedValue(100),
            getFailedCount: jest.fn().mockResolvedValue(3),
            getDelayedCount: jest.fn().mockResolvedValue(1),
        });

        mockWebhooksQueue = createMockQueue();
        mockReconciliationQueue = createMockQueue();
        mockNotificationsQueue = createMockQueue();
        mockDlqQueue = createMockQueue();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [HealthController],
            providers: [
                { provide: getQueueToken(QUEUE_NAMES.WEBHOOKS), useValue: mockWebhooksQueue },
                { provide: getQueueToken(QUEUE_NAMES.RECONCILIATION), useValue: mockReconciliationQueue },
                { provide: getQueueToken(QUEUE_NAMES.NOTIFICATIONS), useValue: mockNotificationsQueue },
                { provide: getQueueToken(QUEUE_NAMES.DLQ), useValue: mockDlqQueue },
            ],
        }).compile();

        controller = module.get<HealthController>(HealthController);
    });

    describe('getHealth', () => {
        it('should return healthy status when all queues are accessible', async () => {
            const result = await controller.getHealth();

            expect(result.status).toBe('healthy');
            expect(result.redis.status).toBe('connected');
            expect(result.queues).toHaveLength(4);
            expect(result.queues.every((q) => q.status === 'healthy')).toBe(true);
            expect(result.uptime).toBeGreaterThanOrEqual(0);
            expect(result.timestamp).toBeDefined();
        });

        it('should return unhealthy status when Redis is disconnected', async () => {
            mockWebhooksQueue.getWaitingCount.mockRejectedValue(new Error('Redis connection lost'));

            const result = await controller.getHealth();

            expect(result.status).toBe('unhealthy');
            expect(result.redis.status).toBe('disconnected');
            expect(result.queues[0].status).toBe('unhealthy');
        });

        it('should include queue statistics', async () => {
            const result = await controller.getHealth();

            const webhooksQueue = result.queues.find((q) => q.name === QUEUE_NAMES.WEBHOOKS);
            expect(webhooksQueue).toEqual({
                name: QUEUE_NAMES.WEBHOOKS,
                status: 'healthy',
                waiting: 5,
                active: 2,
                completed: 100,
                failed: 3,
                delayed: 1,
            });
        });
    });

    describe('getReadiness', () => {
        it('should return ready: true when Redis is connected', async () => {
            const result = await controller.getReadiness();
            expect(result).toEqual({ ready: true });
        });

        it('should return ready: false when Redis is disconnected', async () => {
            mockWebhooksQueue.getWaitingCount.mockRejectedValue(new Error('Connection lost'));

            const result = await controller.getReadiness();
            expect(result).toEqual({ ready: false });
        });
    });

    describe('getLiveness', () => {
        it('should always return alive: true', () => {
            const result = controller.getLiveness();
            expect(result).toEqual({ alive: true });
        });
    });
});
