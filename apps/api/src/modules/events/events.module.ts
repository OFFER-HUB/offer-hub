import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventBusService } from './event-bus.service';
import { SseService } from './sse.service';
import { EventsController } from './events.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { AuditLogListener } from './audit-log.listener';

/**
 * EventsModule
 * 
 * Provides the internal event bus and public SSE event stream.
 */
@Module({
    imports: [
        EventEmitterModule.forRoot({
            wildcard: true,
            delimiter: '.',
            newListener: false,
            removeListener: false,
            maxListeners: 20,
            verboseMemoryLeak: true,
            ignoreErrors: false,
        }),
        DatabaseModule,
        AuthModule,
    ],
    controllers: [EventsController],
    providers: [EventBusService, SseService, AuditLogListener],
    exports: [EventBusService, SseService],
})
export class EventsModule { }
