import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventBusService } from '../event-bus.service';
import { EVENT_CATALOG } from '../event-catalog';
import { DomainEvent } from '../types/domain-event';
import { OrderCreatedPayload } from '../types/order-events';

describe('EventBusService', () => {
    let service: EventBusService;
    let eventEmitter: EventEmitter2;

    beforeEach(() => {
        // Create a real EventEmitter2 instance for testing
        eventEmitter = new EventEmitter2({
            wildcard: true,
            delimiter: '.',
        });
        service = new EventBusService(eventEmitter);
    });

    afterEach(() => {
        // Clean up all listeners after each test
        eventEmitter.removeAllListeners();
    });

    describe('emit', () => {
        it('should emit an event with correct payload', (done) => {
            const payload: OrderCreatedPayload = {
                orderId: 'ord_test123',
                buyerId: 'usr_buyer123',
                sellerId: 'usr_seller123',
                amount: '100.00',
                currency: 'USD',
                title: 'Test Order',
            };

            eventEmitter.on(EVENT_CATALOG.ORDER_CREATED, (event: DomainEvent<OrderCreatedPayload>) => {
                expect(event.eventType).toBe(EVENT_CATALOG.ORDER_CREATED);
                expect(event.aggregateId).toBe('ord_test123');
                expect(event.aggregateType).toBe('Order');
                expect(event.payload).toEqual(payload);
                expect(event.metadata.userId).toBe('usr_buyer123');
                done();
            });

            service.emit({
                eventType: EVENT_CATALOG.ORDER_CREATED,
                aggregateId: 'ord_test123',
                aggregateType: 'Order',
                payload,
                metadata: {
                    userId: 'usr_buyer123',
                    correlationId: 'corr_123',
                },
            });
        });

        it('should generate prefixed event ID (evt_)', () => {
            const event = service.emit({
                eventType: EVENT_CATALOG.ORDER_CREATED,
                aggregateId: 'ord_test123',
                aggregateType: 'Order',
                payload: {},
                metadata: {},
            });

            expect(event.eventId).toMatch(/^evt_[a-zA-Z0-9_-]{21}$/);
        });

        it('should generate ISO 8601 timestamp', () => {
            const event = service.emit({
                eventType: EVENT_CATALOG.ORDER_CREATED,
                aggregateId: 'ord_test123',
                aggregateType: 'Order',
                payload: {},
                metadata: {},
            });

            expect(event.occurredAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
            expect(new Date(event.occurredAt).toISOString()).toBe(event.occurredAt);
        });

        it('should propagate metadata correctly', (done) => {
            const metadata = {
                correlationId: 'corr_123',
                causationId: 'evt_cause123',
                userId: 'usr_123',
                marketplaceId: 'mkt_123',
            };

            eventEmitter.on(EVENT_CATALOG.ORDER_CREATED, (event: DomainEvent) => {
                expect(event.metadata).toEqual(metadata);
                done();
            });

            service.emit({
                eventType: EVENT_CATALOG.ORDER_CREATED,
                aggregateId: 'ord_test123',
                aggregateType: 'Order',
                payload: {},
                metadata,
            });
        });

        it('should warn for non-catalog event types', () => {
            const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');

            service.emit({
                eventType: 'custom.event',
                aggregateId: 'test_123',
                aggregateType: 'Custom',
                payload: {},
                metadata: {},
            });

            expect(loggerWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Event type "custom.event" is not in EVENT_CATALOG'),
            );
        });
    });

    describe('wildcard subscriptions', () => {
        it('should support wildcard subscriptions (order.*)', (done) => {
            const events: string[] = [];

            eventEmitter.on('order.*', (event: DomainEvent) => {
                events.push(event.eventType);

                if (events.length === 3) {
                    expect(events).toContain(EVENT_CATALOG.ORDER_CREATED);
                    expect(events).toContain(EVENT_CATALOG.ORDER_FUNDS_RESERVED);
                    expect(events).toContain(EVENT_CATALOG.ORDER_RELEASED);
                    done();
                }
            });

            service.emit({
                eventType: EVENT_CATALOG.ORDER_CREATED,
                aggregateId: 'ord_1',
                aggregateType: 'Order',
                payload: {},
                metadata: {},
            });

            service.emit({
                eventType: EVENT_CATALOG.ORDER_FUNDS_RESERVED,
                aggregateId: 'ord_1',
                aggregateType: 'Order',
                payload: {},
                metadata: {},
            });

            service.emit({
                eventType: EVENT_CATALOG.ORDER_RELEASED,
                aggregateId: 'ord_1',
                aggregateType: 'Order',
                payload: {},
                metadata: {},
            });
        });

        it('should support multiple wildcard patterns', (done) => {
            const orderEvents: string[] = [];
            const topupEvents: string[] = [];

            const checkComplete = () => {
                if (orderEvents.length === 2 && topupEvents.length === 1) {
                    expect(orderEvents).toContain(EVENT_CATALOG.ORDER_CREATED);
                    expect(orderEvents).toContain(EVENT_CATALOG.ORDER_RELEASED);
                    expect(topupEvents).toContain(EVENT_CATALOG.TOPUP_SUCCEEDED);
                    done();
                }
            };

            eventEmitter.on('order.*', (event: DomainEvent) => {
                orderEvents.push(event.eventType);
                checkComplete();
            });

            eventEmitter.on('topup.*', (event: DomainEvent) => {
                topupEvents.push(event.eventType);
                checkComplete();
            });

            service.emit({
                eventType: EVENT_CATALOG.ORDER_CREATED,
                aggregateId: 'ord_1',
                aggregateType: 'Order',
                payload: {},
                metadata: {},
            });

            service.emit({
                eventType: EVENT_CATALOG.TOPUP_SUCCEEDED,
                aggregateId: 'topup_1',
                aggregateType: 'TopUp',
                payload: {},
                metadata: {},
            });

            service.emit({
                eventType: EVENT_CATALOG.ORDER_RELEASED,
                aggregateId: 'ord_1',
                aggregateType: 'Order',
                payload: {},
                metadata: {},
            });
        });
    });

    describe('emitMany', () => {
        it('should emit multiple events in sequence', () => {
            const events = service.emitMany([
                {
                    eventType: EVENT_CATALOG.ORDER_CREATED,
                    aggregateId: 'ord_1',
                    aggregateType: 'Order',
                    payload: {},
                    metadata: {},
                },
                {
                    eventType: EVENT_CATALOG.ORDER_FUNDS_RESERVED,
                    aggregateId: 'ord_1',
                    aggregateType: 'Order',
                    payload: {},
                    metadata: {},
                },
                {
                    eventType: EVENT_CATALOG.ORDER_ESCROW_CREATING,
                    aggregateId: 'ord_1',
                    aggregateType: 'Order',
                    payload: {},
                    metadata: {},
                },
            ]);

            expect(events).toHaveLength(3);
            expect(events[0].eventType).toBe(EVENT_CATALOG.ORDER_CREATED);
            expect(events[1].eventType).toBe(EVENT_CATALOG.ORDER_FUNDS_RESERVED);
            expect(events[2].eventType).toBe(EVENT_CATALOG.ORDER_ESCROW_CREATING);
            events.forEach((event) => {
                expect(event.eventId).toMatch(/^evt_/);
                expect(event.occurredAt).toBeTruthy();
            });
        });
    });

    describe('subscribe and unsubscribe', () => {
        it('should subscribe to events programmatically', (done) => {
            const handler = (event: DomainEvent) => {
                expect(event.eventType).toBe(EVENT_CATALOG.ORDER_CREATED);
                done();
            };

            service.subscribe(EVENT_CATALOG.ORDER_CREATED, handler);

            service.emit({
                eventType: EVENT_CATALOG.ORDER_CREATED,
                aggregateId: 'ord_1',
                aggregateType: 'Order',
                payload: {},
                metadata: {},
            });
        });

        it('should unsubscribe from events', (done) => {
            let callCount = 0;

            const handler = () => {
                callCount++;
            };

            service.subscribe(EVENT_CATALOG.ORDER_CREATED, handler);

            service.emit({
                eventType: EVENT_CATALOG.ORDER_CREATED,
                aggregateId: 'ord_1',
                aggregateType: 'Order',
                payload: {},
                metadata: {},
            });

            service.unsubscribe(EVENT_CATALOG.ORDER_CREATED, handler);

            service.emit({
                eventType: EVENT_CATALOG.ORDER_CREATED,
                aggregateId: 'ord_2',
                aggregateType: 'Order',
                payload: {},
                metadata: {},
            });

            setTimeout(() => {
                expect(callCount).toBe(1);
                done();
            }, 100);
        });
    });

    describe('createMetadata', () => {
        it('should create metadata with provided values', () => {
            const metadata = EventBusService.createMetadata({
                correlationId: 'corr_123',
                userId: 'usr_123',
                marketplaceId: 'mkt_123',
            });

            expect(metadata.correlationId).toBe('corr_123');
            expect(metadata.userId).toBe('usr_123');
            expect(metadata.marketplaceId).toBe('mkt_123');
        });

        it('should create metadata with empty object', () => {
            const metadata = EventBusService.createMetadata();

            expect(metadata.correlationId).toBeUndefined();
            expect(metadata.userId).toBeUndefined();
            expect(metadata.marketplaceId).toBeUndefined();
        });

        it('should support custom metadata fields', () => {
            const metadata = EventBusService.createMetadata({
                customField: 'custom value',
                anotherField: 123,
            });

            expect(metadata.customField).toBe('custom value');
            expect(metadata.anotherField).toBe(123);
        });
    });

    describe('error handling', () => {
        it('should throw error if event emission fails', () => {
            // Mock eventEmitter.emit to throw an error
            jest.spyOn(eventEmitter, 'emit').mockImplementation(() => {
                throw new Error('Emission failed');
            });

            expect(() => {
                service.emit({
                    eventType: EVENT_CATALOG.ORDER_CREATED,
                    aggregateId: 'ord_1',
                    aggregateType: 'Order',
                    payload: {},
                    metadata: {},
                });
            }).toThrow('Emission failed');
        });
    });
});
