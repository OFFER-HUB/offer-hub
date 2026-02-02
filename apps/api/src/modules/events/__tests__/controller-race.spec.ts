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

    it('🚨 CRITICAL FAILURE: Controller loses events that occur during Replay', async () => {
        // 1. Simulate Replay taking 200ms
        sseService.getMissedEvents.mockImplementation(async () => {
            await new Promise(resolve => setTimeout(resolve, 200));
            return []; // No missed events in the past
        });

        const req = { headers: { 'last-event-id': '2026-01-01' }, apiKey: { marketplaceId: 'm1' } };

        // 2. Start the stream (this simulates the client connection)
        const stream$ = controller.streamEvents(req as any);

        // Start collecting events that the client would receive
        const clientReceived: any[] = [];
        const subscription = stream$.subscribe(ev => clientReceived.push(ev));

        // 3. Emit a "live" event at 100ms (while Replay is still working)
        await new Promise(resolve => setTimeout(resolve, 100));

        const transientEvent = { eventType: EVENT_CATALOG.USER_CREATED, aggregateId: 'usr_1', occurredAt: '...' };
        liveEventsSubject.next(transientEvent);

        // 4. Wait a bit longer for Replay to finish and Live to activate
        await new Promise(resolve => setTimeout(resolve, 200));

        // 5. Emit another event after Replay finished
        const laterEvent = { eventType: EVENT_CATALOG.ORDER_CREATED, aggregateId: 'ord_1', occurredAt: '...' };
        liveEventsSubject.next(laterEvent);

        // Clean up
        subscription.unsubscribe();

        // CATASTROPHE ANALYSIS:
        // The client should have received BOTH events.
        const receivedTypes = clientReceived.map(ev => ev.type);

        console.log('Results received by the client:', receivedTypes);

        // This test would fail in the initial implementation using concat()
        expect(receivedTypes).toContain(EVENT_CATALOG.USER_CREATED);
        expect(receivedTypes).toContain(EVENT_CATALOG.ORDER_CREATED);
    });
});
