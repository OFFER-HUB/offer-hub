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
    Res,
    Inject,
} from '@nestjs/common';
import { Response } from 'express';
import { TopUpsService, type CreateTopUpResponse, type TopUpResponse } from './topups.service';
import { CreateTopUpDto } from './dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { ScopeGuard } from '../../common/guards/scope.guard';
import { Scopes } from '../../common/decorators/scopes.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AirtmConfig } from '../../providers/airtm/airtm.config';
import { TopUpStatus } from '@offerhub/shared';

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
    constructor(
        private readonly topupsService: TopUpsService,
        @Inject(AirtmConfig) private readonly airtmConfig: AirtmConfig,
    ) {}

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

    /**
     * Cancels a top-up that is awaiting user confirmation.
     * Only works when status is TOPUP_AWAITING_USER_CONFIRMATION.
     */
    @Post(':id/cancel')
    @Scopes('write')
    @HttpCode(HttpStatus.OK)
    async cancelTopUp(
        @CurrentUser('userId') userId: string,
        @Param('id') topupId: string,
    ): Promise<TopUpResponse> {
        return this.topupsService.cancelTopUp(topupId, userId);
    }

    /**
     * Handles Airtm callback redirects after user confirms or cancels payment.
     * This is a public endpoint (no authentication required).
     * Redirects user to success or cancel URL based on top-up status.
     */
    @Get(':id/callback')
    @Public()
    async handleCallback(
        @Param('id') topupId: string,
        @Query('status') status?: string,
        @Query('code') code?: string,
        @Res() res: Response,
    ): Promise<void> {
        // 1. Fetch topup (no userId required - public callback)
        const topup = await this.topupsService.getTopUpById(topupId);

        if (!topup) {
            // Redirect to cancel URL if topup not found
            return res.redirect(this.airtmConfig.cancelRedirectUrl);
        }

        // 2. Optionally refresh status from Airtm if we have the payin ID
        if (topup.airtmPayinId) {
            try {
                await this.topupsService.refreshTopUp(topupId, topup.userId);
            } catch (error) {
                // Log error but continue - we'll use current status
            }
        }

        // 3. Re-fetch topup to get latest status
        const updatedTopup = await this.topupsService.getTopUpById(topupId);

        // 4. Determine redirect URL based on status
        const topupStatus = (updatedTopup?.status || topup.status) as TopUpStatus;
        let redirectUrl = this.airtmConfig.cancelRedirectUrl;

        if (
            topupStatus === TopUpStatus.TOPUP_SUCCEEDED ||
            topupStatus === TopUpStatus.TOPUP_PROCESSING
        ) {
            redirectUrl = this.airtmConfig.successRedirectUrl;
        }

        // 5. Redirect user
        res.redirect(redirectUrl);
    }
}
