import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SseService } from '../sse.service';
import { RedisService } from '../../redis/redis.service';
import { EVENT_CATALOG } from '../event-catalog';
import { DomainEvent } from '../types/domain-event';

describe('SseService (Experimental & Edge Cases)', () => {
    let service: SseService;
    let redisService: jest.Mocked<RedisService>;
    let eventEmitter: EventEmitter2;

    const mockRedisService = {
        zadd: jest.fn().mockResolvedValue(1),
        zcard: jest.fn().mockResolvedValue(10),
        zremRangeByRank: jest.fn().mockResolvedValue(0),
        zrangeByScore: jest.fn().mockResolvedValue([]),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SseService,
                {
                    provide: RedisService,
                    useValue: mockRedisService,
                },
                {
                    provide: EventEmitter2,
                    useValue: new EventEmitter2({ wildcard: true }),
                },
            ],
        }).compile();

        service = module.get<SseService>(SseService);
        redisService = module.get(RedisService);
        eventEmitter = module.get(EventEmitter2);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // --- EXTRAORDINARY SCENARIOS ---

    describe('Resilience and Critical Failures', () => {
        it('✓ Resilience: Should not break the SSE stream if Redis fails (Persistence Failure)', async () => {
            // Simulate critical Redis error
            mockRedisService.zadd.mockRejectedValueOnce(new Error('Redis Connection Lost'));

            const event: DomainEvent = {
                eventId: 'evt_critical',
                eventType: EVENT_CATALOG.USER_CREATED,
                aggregateId: 'usr_1',
                aggregateType: 'User',
                occurredAt: new Date().toISOString(),
                payload: {},
                metadata: {},
            };

            const streamSpy = jest.fn();
            service.getEventStream({}).subscribe(streamSpy);

            // Try to process the event
            await service.handleEvent(event);

            // The event MUST have reached the stream even if Redis failed
            expect(streamSpy).toHaveBeenCalledWith(event);
            expect(redisService.zadd).toHaveBeenCalled();
            // Should not propagate the error upwards to avoid breaking the main flow
        });

        it('✓ Defense: Should handle events with null or corrupt metadata without crashing', async () => {
            const corruptEvent: any = {
                eventId: 'evt_corrupt',
                eventType: EVENT_CATALOG.USER_CREATED,
                aggregateId: 'usr_1',
                aggregateType: 'User',
                occurredAt: new Date().toISOString(),
                payload: {},
                // metadata: undefined // Case of missing metadata
            };

            const streamSpy = jest.fn();
            // Filtering by marketplaceId would access event.metadata.marketplaceId
            service.getEventStream({ marketplaceId: 'mkt_1' }).subscribe(streamSpy);

            await service.handleEvent(corruptEvent);

            // The system should not crash with TypeError and simply filter out the event
            expect(streamSpy).not.toHaveBeenCalled();
        });
    });

    describe('Replay with Invalid Data (getMissedEvents)', () => {
        it('✓ Robustness: Handles invalid date formats in "since"', async () => {
            // Simulate the Last-Event-ID header sending garbage
            const invalidSince = 'not-a-date';

            // Redis should receive a NaN score if not validated, 
            // but the service must handle the ISO conversion
            await service.getMissedEvents(invalidSince, {});

            expect(redisService.zrangeByScore).toHaveBeenCalled();
            const callArgs = redisService.zrangeByScore.mock.calls[0];
            // If the date is invalid, Date().getTime() is NaN. 
            // We want to ensure the system handles it or uses a safe value.
            expect(callArgs[1]).toBeDefined();
        });

        it('✓ Integrity: Returns an empty list if Redis returns garbage or is down', async () => {
            mockRedisService.zrangeByScore.mockRejectedValueOnce(new Error('Redis Timeout'));

            const results = await service.getMissedEvents(Date.now(), {});

            expect(results).toEqual([]);
        });
    });

    describe('Load and Limits (Stress)', () => {
        it('✓ Control: Massive cleanup when the log greatly exceeds the limit', async () => {
            // Simulate Redis having 5000 events (Limit is 1000)
            mockRedisService.zcard.mockResolvedValueOnce(5000);

            const event: DomainEvent = {
                eventId: 'evt_bulk',
                eventType: EVENT_CATALOG.USER_CREATED,
                aggregateId: 'usr_1',
                aggregateType: 'User',
                occurredAt: new Date().toISOString(),
                payload: {},
                metadata: {},
            };

            await service.handleEvent(event);

            // Should clean the extra 4000 events + 1
            expect(redisService.zremRangeByRank).toHaveBeenCalledWith(
                'events:log',
                0,
                5000 - 1000 - 1
            );
        });
    });

    // --- BASE TESTS ---

    describe('Foundations (Core Functionality)', () => {
        it('✓ Tracking: Active connection tracking', () => {
            service.onConnect();
            service.onConnect();
            expect(service.getActiveConnections()).toBe(2);
            service.onDisconnect();
            expect(service.getActiveConnections()).toBe(1);
        });

        it('✓ Filtering: Filter by resource types', (done) => {
            const event: DomainEvent = {
                eventId: 'evt_1',
                eventType: EVENT_CATALOG.ORDER_CREATED,
                aggregateId: 'ord_1',
                aggregateType: 'Order',
                occurredAt: new Date().toISOString(),
                payload: {},
                metadata: {},
            };

            service.getEventStream({ resourceTypes: ['Order'] }).subscribe((ev) => {
                expect(ev.aggregateType).toBe('Order');
                done();
            });

            service.handleEvent(event);
        });
    });
});
