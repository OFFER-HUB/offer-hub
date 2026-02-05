import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { QueueService } from '../queues/queue.service';
import { QUEUE_NAMES, JOB_TYPES } from '../queues/queue.constants';

describe('QueueService', () => {
    let service: QueueService;
    let mockWebhooksQueue: any;
    let mockReconciliationQueue: any;
    let mockNotificationsQueue: any;
    let mockDlqQueue: any;

    beforeEach(async () => {
        // Create mock queues
        const createMockQueue = () => ({
            add: jest.fn().mockResolvedValue({ id: 'job-123', name: 'test-job' }),
            getJob: jest.fn(),
            getWaitingCount: jest.fn().mockResolvedValue(5),
            getActiveCount: jest.fn().mockResolvedValue(2),
            getCompletedCount: jest.fn().mockResolvedValue(100),
            getFailedCount: jest.fn().mockResolvedValue(3),
            getDelayedCount: jest.fn().mockResolvedValue(1),
            getJobs: jest.fn().mockResolvedValue([]),
        });

        mockWebhooksQueue = createMockQueue();
        mockReconciliationQueue = createMockQueue();
        mockNotificationsQueue = createMockQueue();
        mockDlqQueue = createMockQueue();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QueueService,
                { provide: getQueueToken(QUEUE_NAMES.WEBHOOKS), useValue: mockWebhooksQueue },
                { provide: getQueueToken(QUEUE_NAMES.RECONCILIATION), useValue: mockReconciliationQueue },
                { provide: getQueueToken(QUEUE_NAMES.NOTIFICATIONS), useValue: mockNotificationsQueue },
                { provide: getQueueToken(QUEUE_NAMES.DLQ), useValue: mockDlqQueue },
            ],
        }).compile();

        service = module.get<QueueService>(QueueService);
    });

    describe('addWebhookJob', () => {
        it('should add a job to the webhooks queue', async () => {
            const data = { eventId: 'evt_123', payload: {} };
            const result = await service.addWebhookJob(JOB_TYPES.AIRTM_PAYIN, data);

            expect(mockWebhooksQueue.add).toHaveBeenCalledWith(
                JOB_TYPES.AIRTM_PAYIN,
                data,
                expect.objectContaining({ jobId: expect.any(String) }),
            );
            expect(result).toEqual({ id: 'job-123', name: 'test-job' });
        });
    });

    describe('addReconciliationJob', () => {
        it('should add a job to the reconciliation queue', async () => {
            const data = { batchId: 'batch_123' };
            const result = await service.addReconciliationJob(JOB_TYPES.SYNC_TOPUPS, data);

            expect(mockReconciliationQueue.add).toHaveBeenCalledWith(JOB_TYPES.SYNC_TOPUPS, data);
            expect(result).toEqual({ id: 'job-123', name: 'test-job' });
        });
    });

    describe('addNotificationJob', () => {
        it('should add a job to the notifications queue', async () => {
            const data = { to: 'user@example.com', subject: 'Test' };
            const result = await service.addNotificationJob(JOB_TYPES.SEND_EMAIL, data);

            expect(mockNotificationsQueue.add).toHaveBeenCalledWith(JOB_TYPES.SEND_EMAIL, data);
            expect(result).toEqual({ id: 'job-123', name: 'test-job' });
        });
    });

    describe('moveToDlq', () => {
        it('should move a failed job to the DLQ', async () => {
            const mockJob = {
                id: 'failed-job-123',
                name: 'airtm:payin',
                data: { eventId: 'evt_123' },
                attemptsMade: 5,
            };
            const error = new Error('Processing failed');

            await service.moveToDlq(QUEUE_NAMES.WEBHOOKS, mockJob as any, error);

            expect(mockDlqQueue.add).toHaveBeenCalledWith(
                'failed-job',
                expect.objectContaining({
                    originalQueue: QUEUE_NAMES.WEBHOOKS,
                    originalJobId: 'failed-job-123',
                    originalJobName: 'airtm:payin',
                    originalJobData: { eventId: 'evt_123' },
                    error: expect.objectContaining({ message: 'Processing failed' }),
                    attemptsMade: 5,
                }),
            );
        });
    });

    describe('retryFromDlq', () => {
        it('should retry a job from the DLQ', async () => {
            const mockDlqJob = {
                id: 'dlq-job-123',
                data: {
                    originalQueue: QUEUE_NAMES.WEBHOOKS,
                    originalJobName: 'airtm:payin',
                    originalJobData: { eventId: 'evt_123' },
                },
                remove: jest.fn().mockResolvedValue(undefined),
            };
            mockDlqQueue.getJob.mockResolvedValue(mockDlqJob);

            const result = await service.retryFromDlq('dlq-job-123');

            expect(mockDlqQueue.getJob).toHaveBeenCalledWith('dlq-job-123');
            expect(mockWebhooksQueue.add).toHaveBeenCalledWith('airtm:payin', { eventId: 'evt_123' });
            expect(mockDlqJob.remove).toHaveBeenCalled();
            expect(result).toBeTruthy();
        });

        it('should return null if DLQ job not found', async () => {
            mockDlqQueue.getJob.mockResolvedValue(null);

            const result = await service.retryFromDlq('non-existent');

            expect(result).toBeNull();
        });
    });

    describe('getQueueStats', () => {
        it('should return statistics for all queues', async () => {
            const stats = await service.getQueueStats();

            expect(stats).toHaveProperty(QUEUE_NAMES.WEBHOOKS);
            expect(stats).toHaveProperty(QUEUE_NAMES.RECONCILIATION);
            expect(stats).toHaveProperty(QUEUE_NAMES.NOTIFICATIONS);
            expect(stats).toHaveProperty(QUEUE_NAMES.DLQ);

            expect(stats[QUEUE_NAMES.WEBHOOKS]).toEqual({
                waiting: 5,
                active: 2,
                completed: 100,
                failed: 3,
                delayed: 1,
            });
        });
    });

    describe('getDlqJobs', () => {
        it('should return jobs from the DLQ', async () => {
            const mockJobs = [{ id: 'dlq-1' }, { id: 'dlq-2' }];
            mockDlqQueue.getJobs.mockResolvedValue(mockJobs);

            const result = await service.getDlqJobs(0, 10);

            expect(mockDlqQueue.getJobs).toHaveBeenCalledWith(['waiting', 'delayed', 'failed'], 0, 10);
            expect(result).toEqual(mockJobs);
        });
    });
});
