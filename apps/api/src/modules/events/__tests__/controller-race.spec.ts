import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from '../events.controller';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';
import { ScopeGuard } from '../../../common/guards/scope.guard';
import { SseService } from '../sse.service';
import { EVENT_CATALOG } from '../event-catalog';
import { Subject, of, delay, firstValueFrom, toArray, takeUntil, timer, map } from 'rxjs';

describe('EventsController (Race Conditions)', () => {
    let controller: EventsController;
    let sseService: jest.Mocked<SseService>;
    let liveEventsSubject: Subject<any>;

    beforeEach(async () => {
        liveEventsSubject = new Subject();

        sseService = {
            onConnect: jest.fn(),
            onDisconnect: jest.fn(),
            getEventStream: jest.fn().mockReturnValue(liveEventsSubject.asObservable()),
            getMissedEvents: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            controllers: [EventsController],
            providers: [{ provide: SseService, useValue: sseService }],
        })
            .overrideGuard(ApiKeyGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(ScopeGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<EventsController>(EventsController);
    });

    it('🚨 FALLO CRÍTICO: El controlador pierde eventos que ocurren durante el Replay', async () => {
        // 1. Simulamos que el Replay tarda 200ms
        sseService.getMissedEvents.mockImplementation(async () => {
            await new Promise(resolve => setTimeout(resolve, 200));
            return []; // No hay eventos perdidos en el pasado
        });

        const req = { headers: { 'last-event-id': '2026-01-01' }, apiKey: { marketplaceId: 'm1' } };

        // 2. Iniciamos el stream (esto simula la conexión del cliente)
        const stream$ = controller.streamEvents(req as any);

        // Empezamos a recolectar los eventos que el cliente recibiría
        const clientReceived: any[] = [];
        const subscription = stream$.subscribe(ev => clientReceived.push(ev));

        // 3. Emitimos un evento "en vivo" a los 100ms (mientras el Replay sigue trabajando)
        await new Promise(resolve => setTimeout(resolve, 100));

        const transientEvent = { eventType: EVENT_CATALOG.USER_CREATED, aggregateId: 'usr_1', occurredAt: '...' };
        liveEventsSubject.next(transientEvent);

        // 4. Esperamos un poco más para que el Replay termine y el Live se active
        await new Promise(resolve => setTimeout(resolve, 200));

        // 5. Emitimos otro evento después de que el Replay terminó
        const laterEvent = { eventType: EVENT_CATALOG.ORDER_CREATED, aggregateId: 'ord_1', occurredAt: '...' };
        liveEventsSubject.next(laterEvent);

        // Limpiamos
        subscription.unsubscribe();

        // ANALISIS DE LA CATASTROFE:
        // El cliente debería haber recibido AMBOS eventos.
        const receivedTypes = clientReceived.map(ev => ev.type);

        console.log('Resultados recibidos por el cliente:', receivedTypes);

        // Este test fallará en la implementación actual de NestJS/RxJS con concat()
        expect(receivedTypes).toContain(EVENT_CATALOG.USER_CREATED);
        expect(receivedTypes).toContain(EVENT_CATALOG.ORDER_CREATED);
    });
});
