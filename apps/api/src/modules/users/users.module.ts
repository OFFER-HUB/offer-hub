import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '../database/database.module';
import { AirtmModule } from '../../providers/airtm/airtm.module';
import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../events/events.module';

/**
 * Users Module
 *
 * Provides user management and Airtm linking functionality.
 *
 * Endpoints:
 * - POST /users - Create a new user (idempotent)
 * - POST /users/:id/airtm/link - Link user's Airtm account
 */
@Module({
    imports: [
        DatabaseModule,
        AirtmModule,
        AuthModule,
        EventsModule,
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
