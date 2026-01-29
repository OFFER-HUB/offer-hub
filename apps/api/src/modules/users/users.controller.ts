import {
    Controller,
    Post,
    Body,
    Param,
    UseGuards,
    HttpStatus,
    HttpCode,
    Inject,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { ScopeGuard } from '../../common/guards/scope.guard';
import { Scopes } from '../../common/decorators/scopes.decorator';
import { CreateUserDto, LinkAirtmDto } from './dto';

/**
 * Users Controller
 *
 * Provides HTTP endpoints for user management:
 * - POST /users - Create a new user (idempotent)
 * - POST /users/:id/airtm/link - Link user's Airtm account
 */
@Controller('users')
@UseGuards(ApiKeyGuard, ScopeGuard)
export class UsersController {
    constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

    /**
     * Create a new user with balance.
     * This endpoint is idempotent - if a user with the same externalUserId exists,
     * it returns the existing user (200 OK) instead of creating a new one.
     *
     * @returns 201 Created if new user is created, 200 OK if user already exists
     */
    @Post()
    @Scopes('write')
    async createUser(@Body() dto: CreateUserDto) {
        const user = await this.usersService.createUser(dto);

        // Return the user in a data wrapper
        return {
            data: user,
        };
    }

    /**
     * Link a user's Airtm account.
     * Verifies the user's email against Airtm and stores the linkage.
     * If already linked, returns current link information.
     *
     * @returns 200 OK with link information
     */
    @Post(':id/airtm/link')
    @Scopes('write')
    @HttpCode(HttpStatus.OK)
    async linkAirtm(
        @Param('id') userId: string,
        @Body() dto: LinkAirtmDto,
    ) {
        const linkInfo = await this.usersService.linkAirtm(userId, dto);

        // Return the link info in a data wrapper
        return {
            data: linkInfo,
        };
    }
}
