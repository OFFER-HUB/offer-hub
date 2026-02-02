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

    it('🚨 ALERTA: Detectar pérdida de eventos durante la transición Replay -> Live', async () => {
        // 1. Configuramos un retraso artificial en la recuperación de eventos históricos
        mockRedisService.zrangeByScore.mockImplementation(async () => {
            await new Promise(resolve => setTimeout(resolve, 100)); // 100ms de retraso
            return [];
        });

        // 2. Iniciamos el proceso de "Replay" (getMissedEvents)
        const since = Date.now();
        const missedEventsPromise = service.getMissedEvents(since, {});

        // 3. Mientas se está recuperando el historial, emitimos un evento en vivo
        const liveEvent: DomainEvent = {
            eventId: 'evt_lost',
            eventType: EVENT_CATALOG.USER_CREATED,
            aggregateId: 'usr_1',
            aggregateType: 'User',
            occurredAt: new Date().toISOString(),
            payload: {},
            metadata: {},
        };

        // Escuchamos el stream en vivo ANTES de que termine el Replay
        const liveStreamItems: DomainEvent[] = [];
        const subscription = service.getEventStream({}).subscribe(ev => liveStreamItems.push(ev));

        // Emitimos el evento
        await service.handleEvent(liveEvent);

        // 4. Esperamos a que todo termine
        await missedEventsPromise;

        // El evento DEBE estar en liveStreamItems
        // Si el controlador usa concat(historical, live), este evento se perdería
        // porque la suscripción al live ocurriría DESPUÉS del handleEvent.
        expect(liveStreamItems).toContainEqual(liveEvent);

        subscription.unsubscribe();
    });
});
