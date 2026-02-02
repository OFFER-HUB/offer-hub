import { Injectable, Logger, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Subject, Observable, filter, map } from 'rxjs';
import { DomainEvent } from './types/domain-event';
import { RedisService } from '../redis/redis.service';

/**
 * SseService
 * 
 * Manages real-time event streaming via Server-Sent Events.
 * Handles event persistence in Redis for reconnection support (replay).
 */
@Injectable()
export class SseService {
    private readonly logger = new Logger(SseService.name);
    private readonly eventSubject = new Subject<DomainEvent>();
    private readonly REDIS_EVENT_LOG_KEY = 'events:log';
    private readonly MAX_EVENTS = 1000;
    private readonly TTL_SECONDS = 3600; // 1 hour
    private activeConnections = 0;

    constructor(@Inject(RedisService) private readonly redis: RedisService) { }

    /**
     * Track new connection
     */
    onConnect() {
        this.activeConnections++;
        this.logger.log(`New SSE connection opened. Total active: ${this.activeConnections}`);
    }

    /**
     * Track disconnection
     */
    onDisconnect() {
        this.activeConnections--;
        this.logger.log(`SSE connection closed. Total active: ${this.activeConnections}`);
    }

    /**
     * Get active connection count
     */
    getActiveConnections(): number {
        return this.activeConnections;
    }

    /**
     * Captures all domain events emitted by the internal event bus.
     * Streams them to active SSE connections and persists them to Redis.
     * 
     * @param event - The domain event emitted
     */
    @OnEvent('**')
    async handleEvent(event: DomainEvent) {
        // Skip events that are not proper DomainEvents (e.g. internal Nest events if any)
        if (!event.eventType || !event.eventId) {
            return;
        }

        this.logger.debug(`Capturing event for SSE: ${event.eventType} [${event.eventId}]`);

        // 1. Stream to live connections
        this.eventSubject.next(event);

        // 2. Persis to Redis Sorted Set (Score = Timestamp)
        const score = new Date(event.occurredAt).getTime();
        try {
            await this.redis.zadd(
                this.REDIS_EVENT_LOG_KEY,
                score,
                JSON.stringify(event)
            );

            // 3. Keep log capped (keep last 1000 events)
            const count = await this.redis.zcard(this.REDIS_EVENT_LOG_KEY);
            if (count > this.MAX_EVENTS) {
                await this.redis.zremRangeByRank(
                    this.REDIS_EVENT_LOG_KEY,
                    0,
                    count - this.MAX_EVENTS - 1
                );
            }
        } catch (error) {
            this.logger.error('Failed to persist event to Redis log', error);
        }
    }

    /**
     * Returns an Observable stream of filtered domain events.
     * 
     * @param filters - Filtering options (marketplaceId, types, resourceTypes)
     * @returns Observable of domain events
     */
    getEventStream(filters: {
        marketplaceId?: string;
        types?: string[];
        resourceTypes?: string[];
    }): Observable<DomainEvent> {
        return this.eventSubject.asObservable().pipe(
            filter((event) => {
                // 1. Marketplace isolation
                if (filters.marketplaceId) {
                    if (!event.metadata?.marketplaceId || event.metadata.marketplaceId !== filters.marketplaceId) {
                        return false;
                    }
                }

                // 2. Event type filter
                if (filters.types && filters.types.length > 0 && !filters.types.includes(event.eventType)) {
                    return false;
                }

                // 3. Resource type filter
                if (filters.resourceTypes && filters.resourceTypes.length > 0 && !filters.resourceTypes.includes(event.aggregateType)) {
                    return false;
                }

                return true;
            })
        );
    }

    /**
     * Retrieves missed events from Redis based on a timestamp cursor.
     * 
     * @param since - Timestamp in ms or ISO string
     * @param filters - Filtering options
     * @returns Array of missed domain events
     */
    async getMissedEvents(
        since: number | string,
        filters: {
            marketplaceId?: string;
            types?: string[];
            resourceTypes?: string[];
        }
    ): Promise<DomainEvent[]> {
        const minTimestamp = typeof since === 'string' ? new Date(since).getTime() : since;
        // Use '(' + timestamp to exclude the event at exactly that timestamp (prevents duplicates)
        const min = `(${minTimestamp}`;

        try {
            const rawEvents = await this.redis.zrangeByScore(this.REDIS_EVENT_LOG_KEY, min, '+inf');
            return rawEvents
                .map((raw) => JSON.parse(raw) as DomainEvent)
                .filter((event) => {
                    if (filters.marketplaceId && event.metadata?.marketplaceId && event.metadata.marketplaceId !== filters.marketplaceId) {
                        return false;
                    }
                    if (filters.types && filters.types.length > 0 && !filters.types.includes(event.eventType)) {
                        return false;
                    }
                    if (filters.resourceTypes && filters.resourceTypes.length > 0 && !filters.resourceTypes.includes(event.aggregateType)) {
                        return false;
                    }
                    return true;
                });
        } catch (error) {
            this.logger.error('Failed to retrieve missed events from Redis', error);
            return [];
        }
    }
}
