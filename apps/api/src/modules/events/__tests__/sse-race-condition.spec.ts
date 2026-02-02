import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SseService } from '../sse.service';
import { RedisService } from '../../redis/redis.service';
import { EVENT_CATALOG } from '../event-catalog';
import { DomainEvent } from '../types/domain-event';
import { firstValueFrom, lastValueFrom, take, timer, of, delay, tap } from 'rxjs';

describe('SseService (Race Condition Testing)', () => {
    let service: SseService;
    let redisService: jest.Mocked<RedisService>;

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
                { provide: RedisService, useValue: mockRedisService },
                { provide: EventEmitter2, useValue: new EventEmitter2({ wildcard: true }) },
            ],
        }).compile();

        service = module.get<SseService>(SseService);
        redisService = module.get(RedisService);
    });

    it('🚨 ALERT: Detect event loss during Replay -> Live transition', async () => {
        // 1. Set up an artificial delay in historical event retrieval
        mockRedisService.zrangeByScore.mockImplementation(async () => {
            await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
            return [];
        });

        // 2. Start the "Replay" process (getMissedEvents)
        const since = Date.now();
        const missedEventsPromise = service.getMissedEvents(since, {});

        // 3. While history is being recovered, emit a live event
        const liveEvent: DomainEvent = {
            eventId: 'evt_lost',
            eventType: EVENT_CATALOG.USER_CREATED,
            aggregateId: 'usr_1',
            aggregateType: 'User',
            occurredAt: new Date().toISOString(),
            payload: {},
            metadata: {},
        };

        // Listen to the live stream BEFORE Replay finishes
        const liveStreamItems: DomainEvent[] = [];
        const subscription = service.getEventStream({}).subscribe(ev => liveStreamItems.push(ev));

        // Emit the event
        await service.handleEvent(liveEvent);

        // 4. Wait for everything to finish
        await missedEventsPromise;

        // The event MUST be in liveStreamItems
        // If the controller uses concat(historical, live), this event would be lost
        // because the subscription to live would occur AFTER the handleEvent.
        expect(liveStreamItems).toContainEqual(liveEvent);

        subscription.unsubscribe();
    });
});
