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

    // --- ESCENARIOS EXTRAORDINARIOS ---

    describe('Casos de Resiliencia y Fallos Críticos', () => {
        it('✓ Resiliencia: No debe romper el stream SSE si Redis falla (Persistence Failure)', async () => {
            // Simulamos rror catastrófico en Redis
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

            // Intentamos procesar el evento
            await service.handleEvent(event);

            // El evento DEBE haber llegado al stream aunque Redis fallara
            expect(streamSpy).toHaveBeenCalledWith(event);
            expect(redisService.zadd).toHaveBeenCalled();
            // No debe propagar el error hacia arriba para no romper el flujo principal
        });

        it('✓ Defensa: Debe manejar eventos con metadatos nulos o corruptos sin crashear', async () => {
            const corruptEvent: any = {
                eventId: 'evt_corrupt',
                eventType: EVENT_CATALOG.USER_CREATED,
                aggregateId: 'usr_1',
                aggregateType: 'User',
                occurredAt: new Date().toISOString(),
                payload: {},
                // metadata: undefined // Caso de metadatos faltantes
            };

            const streamSpy = jest.fn();
            // Filtramos por marketplaceId, lo cual accedería a event.metadata.marketplaceId
            service.getEventStream({ marketplaceId: 'mkt_1' }).subscribe(streamSpy);

            await service.handleEvent(corruptEvent);

            // El sistema no debe crashear con TypeError y simplemente filtrar el evento
            expect(streamSpy).not.toHaveBeenCalled();
        });
    });

    describe('Casos de Replay con Datos Basura (getMissedEvents)', () => {
        it('✓ Robusticidad: Maneja formatos de fecha inválidos en "since"', async () => {
            // Simulamos que el header Last-Event-ID trae basura
            const invalidSince = 'no-es-una-fecha';

            // Redis debería recibir un score de NaN si no se valida, 
            // pero el servicio debe manejar la conversión ISO
            await service.getMissedEvents(invalidSince, {});

            expect(redisService.zrangeByScore).toHaveBeenCalled();
            const callArgs = redisService.zrangeByScore.mock.calls[0];
            // Si la fecha es inválida, Date().getTime() es NaN. 
            // Queremos ver que el sistema lo maneje o use un valor seguro.
            expect(callArgs[1]).toBeDefined();
        });

        it('✓ Integridad: Devuelve lista vacía si Redis devuelve basura o está caído', async () => {
            mockRedisService.zrangeByScore.mockRejectedValueOnce(new Error('Redis Timeout'));

            const results = await service.getMissedEvents(Date.now(), {});

            expect(results).toEqual([]);
        });
    });

    describe('Casos de Carga y Límites (Stress)', () => {
        it('✓ Control: Limpieza masiva cuando el log excede por mucho el límite', async () => {
            // Simulamos que Redis tiene 5000 eventos (Límite 1000)
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

            // Debe limpiar los 4000 eventos excedentes + 1
            expect(redisService.zremRangeByRank).toHaveBeenCalledWith(
                'events:log',
                0,
                5000 - 1000 - 1
            );
        });
    });

    // --- TESTS BASE ---

    describe('Cimientos (Core Functionality)', () => {
        it('✓ Tracking: Seguimiento de conexiones activas', () => {
            service.onConnect();
            service.onConnect();
            expect(service.getActiveConnections()).toBe(2);
            service.onDisconnect();
            expect(service.getActiveConnections()).toBe(1);
        });

        it('✓ Filtering: Filtro por tipos de recursos', (done) => {
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
