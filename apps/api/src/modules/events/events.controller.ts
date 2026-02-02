import { Controller, Get, Sse, MessageEvent, Query, UseGuards, Req, Inject } from '@nestjs/common';
import { Observable, interval, map, merge, concat, from, switchMap, finalize, ReplaySubject, filter } from 'rxjs';
import { DomainEvent } from './types/domain-event';
import { SseService } from './sse.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

/**
 * EventsController
 * 
 * Provides the SSE (Server-Sent Events) endpoint for real-time domain event streaming.
 * Supports filtering, heartbeat, and reconnection via Last-Event-ID.
 */
@Controller('events')
export class EventsController {
    constructor(
        @Inject(SseService) private readonly sseService: SseService
    ) { }

    /**
     * Real-time event stream endpoint.
     * 
     * Query Parameters:
     * @param types - Filter by event type(s) (e.g. order.created)
     * @param resources - Filter by resource type(s) (e.g. Order)
     * @param since - Timestamp cursor for replaying missed events
     * 
     * Headers:
     * - Last-Event-ID: Reconnection cursor (sent by browser automatic retry)
     */
    @Get()
    @Sse()
    @UseGuards(ApiKeyGuard)
    streamEvents(
        @Req() req: any,
        @Query('types') types?: string | string[],
        @Query('resources') resources?: string | string[],
        @Query('since') since?: string,
    ): Observable<MessageEvent> {
        const apiKey = req['apiKey'];
        // Marketplace isolation: filter events by the marketplace tied to the API key
        const marketplaceId = apiKey?.marketplaceId;

        // Standardize filters
        const typeFilters = Array.isArray(types) ? types : types ? [types] : undefined;
        const resourceFilters = Array.isArray(resources) ? resources : resources ? [resources] : undefined;

        // Reconnection cursor priority: Last-Event-ID header > 'since' query param
        const lastEventId = req.headers['last-event-id'] || since;

        // Track connection start
        this.sseService.onConnect();

        // 1. Heartbeat: Keep connection alive by sending a ping every 30 seconds
        const heartbeat$ = interval(30000).pipe(
            map(() => ({
                data: { ping: true, timestamp: new Date().toISOString() },
                type: 'ping'
            } as MessageEvent))
        );

        // 2. Buffer Live Updates: Start listening immediately to catch the "gap"
        const proxyStream$ = new ReplaySubject<DomainEvent>(100);
        const liveSubscription = this.sseService.getEventStream({
            marketplaceId,
            types: typeFilters,
            resourceTypes: resourceFilters,
        }).subscribe(proxyStream$);

        let eventStream$: Observable<MessageEvent>;

        // 3. Replay & Connect
        if (lastEventId) {
            eventStream$ = from(this.sseService.getMissedEvents(lastEventId as string, {
                marketplaceId,
                types: typeFilters,
                resourceTypes: resourceFilters,
            })).pipe(
                switchMap((history) => {
                    const historyIds = new Set(history.map(e => e.eventId));

                    const historical$ = from(history).pipe(
                        map(event => ({
                            id: event.occurredAt,
                            type: event.eventType,
                            data: event,
                        } as MessageEvent))
                    );

                    const live$ = proxyStream$.asObservable().pipe(
                        // Deduplicate: avoid sending events already in history
                        filter(event => !historyIds.has(event.eventId)),
                        map(event => ({
                            id: event.occurredAt,
                            type: event.eventType,
                            data: event,
                        } as MessageEvent))
                    );

                    return concat(historical$, live$);
                })
            );
        } else {
            eventStream$ = proxyStream$.asObservable().pipe(
                map(event => ({
                    id: event.occurredAt,
                    type: event.eventType,
                    data: event,
                } as MessageEvent))
            );
        }

        // 4. Combine with Heartbeat and Cleanup
        return merge(heartbeat$, eventStream$).pipe(
            finalize(() => {
                liveSubscription.unsubscribe();
                proxyStream$.complete();
                this.sseService.onDisconnect();
            })
        );
    }
}
