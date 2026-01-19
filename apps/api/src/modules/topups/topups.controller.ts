import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { TopUpsService, type CreateTopUpResponse, type TopUpResponse } from './topups.service';
import { CreateTopUpDto } from './dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { ScopeGuard } from '../../common/guards/scope.guard';
import { Scopes } from '../../common/decorators/scopes.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * Controller for top-up (payin) operations.
 *
 * Endpoints:
 * - POST /topups - Create a new top-up
 * - GET /topups - List user's top-ups
 * - GET /topups/:id - Get a specific top-up
 * - POST /topups/:id/refresh - Refresh top-up status from Airtm
 */
@Controller('topups')
@UseGuards(ApiKeyGuard, ScopeGuard)
export class TopUpsController {
    constructor(private readonly topupsService: TopUpsService) {}

    /**
     * Creates a new top-up for the authenticated user.
     * Returns a confirmation URI that the user must visit to complete payment.
     */
    @Post()
    @Scopes('write')
    @HttpCode(HttpStatus.CREATED)
    async createTopUp(
        @CurrentUser('userId') userId: string,
        @Body() dto: CreateTopUpDto,
    ): Promise<CreateTopUpResponse> {
        return this.topupsService.createTopUp(userId, dto);
    }

    /**
     * Lists top-ups for the authenticated user.
     */
    @Get()
    @Scopes('read')
    async listTopUps(
        @CurrentUser('userId') userId: string,
        @Query('limit') limit?: string,
        @Query('cursor') cursor?: string,
    ): Promise<{ data: TopUpResponse[]; hasMore: boolean; nextCursor?: string }> {
        return this.topupsService.listTopUps(userId, {
            limit: limit ? parseInt(limit, 10) : undefined,
            cursor,
        });
    }

    /**
     * Gets a specific top-up by ID.
     */
    @Get(':id')
    @Scopes('read')
    async getTopUp(
        @CurrentUser('userId') userId: string,
        @Param('id') topupId: string,
    ): Promise<TopUpResponse> {
        return this.topupsService.getTopUp(topupId, userId);
    }

    /**
     * Refreshes top-up status from Airtm.
     * Use when webhook may have been missed.
     */
    @Post(':id/refresh')
    @Scopes('read')
    @HttpCode(HttpStatus.OK)
    async refreshTopUp(
        @CurrentUser('userId') userId: string,
        @Param('id') topupId: string,
    ): Promise<TopUpResponse> {
        return this.topupsService.refreshTopUp(topupId, userId);
    }
}
