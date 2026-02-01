import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventBusService } from './event-bus.service';

/**
 * EventsModule
 * 
 * Provides the internal event bus for the OFFER-HUB Orchestrator.
 * 
 * Configuration:
 * - Wildcard support enabled (order.*, *)
 * - Delimiter: '.' for event namespacing
 * - Max 20 listeners per event
 * - Memory leak warnings enabled
 * - Errors are not ignored (will throw)
 * 
 * Usage:
 * 1. Import EventsModule in your feature module
 * 2. Inject EventBusService in your service
 * 3. Emit events on state changes
 * 4. Use @OnEvent() decorator to handle events
 */
@Module({
    imports: [
        EventEmitterModule.forRoot({
            // Enable wildcard subscriptions (e.g., 'order.*', '*')
            wildcard: true,

            // Event name delimiter for namespacing
            delimiter: '.',

            // Don't emit newListener events
            newListener: false,

            // Don't emit removeListener events
            removeListener: false,

            // Maximum number of listeners per event
            // Increase if you have many subscribers to the same event
            maxListeners: 20,

            // Show warning if potential memory leak detected
            verboseMemoryLeak: true,

            // Don't ignore errors in event handlers
            // Errors will be thrown and can be caught by exception filters
            ignoreErrors: false,
        }),
    ],
    providers: [EventBusService],
    exports: [EventBusService],
})
export class EventsModule { }
