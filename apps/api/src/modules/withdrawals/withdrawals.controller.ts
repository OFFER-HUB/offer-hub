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
import {
    WithdrawalsService,
    type CreateWithdrawalResponse,
    type WithdrawalResponse,
} from './withdrawals.service';
import { CreateWithdrawalDto } from './dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { ScopeGuard } from '../../common/guards/scope.guard';
import { Scopes } from '../../common/decorators/scopes.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * Controller for withdrawal (payout) operations.
 *
 * Endpoints:
 * - POST /withdrawals - Create a new withdrawal
 * - GET /withdrawals - List user's withdrawals
 * - GET /withdrawals/:id - Get a specific withdrawal
 * - POST /withdrawals/:id/commit - Commit a pending withdrawal
 * - POST /withdrawals/:id/refresh - Refresh withdrawal status from Airtm
 */
@Controller('withdrawals')
@UseGuards(ApiKeyGuard, ScopeGuard)
export class WithdrawalsController {
    constructor(private readonly withdrawalsService: WithdrawalsService) {}

    /**
     * Creates a new withdrawal for the authenticated user.
     * By default creates in two-step mode (requires commit).
     * Set commit=true for one-step withdrawal.
     */
    @Post()
    @Scopes('write')
    @HttpCode(HttpStatus.CREATED)
    async createWithdrawal(
        @CurrentUser('userId') userId: string,
        @Body() dto: CreateWithdrawalDto,
    ): Promise<CreateWithdrawalResponse> {
        return this.withdrawalsService.createWithdrawal(userId, dto);
    }

    /**
     * Lists withdrawals for the authenticated user.
     */
    @Get()
    @Scopes('read')
    async listWithdrawals(
        @CurrentUser('userId') userId: string,
        @Query('limit') limit?: string,
        @Query('cursor') cursor?: string,
    ): Promise<{ data: WithdrawalResponse[]; hasMore: boolean; nextCursor?: string }> {
        return this.withdrawalsService.listWithdrawals(userId, {
            limit: limit ? parseInt(limit, 10) : undefined,
            cursor,
        });
    }

    /**
     * Gets a specific withdrawal by ID.
     */
    @Get(':id')
    @Scopes('read')
    async getWithdrawal(
        @CurrentUser('userId') userId: string,
        @Param('id') withdrawalId: string,
    ): Promise<WithdrawalResponse> {
        return this.withdrawalsService.getWithdrawal(withdrawalId, userId);
    }

    /**
     * Commits a withdrawal that was created without auto-commit.
     * Only works for withdrawals in WITHDRAWAL_CREATED status.
     */
    @Post(':id/commit')
    @Scopes('write')
    @HttpCode(HttpStatus.OK)
    async commitWithdrawal(
        @CurrentUser('userId') userId: string,
        @Param('id') withdrawalId: string,
    ): Promise<WithdrawalResponse> {
        return this.withdrawalsService.commitWithdrawal(withdrawalId, userId);
    }

    /**
     * Refreshes withdrawal status from Airtm.
     * Use when webhook may have been missed.
     */
    @Post(':id/refresh')
    @Scopes('read')
    @HttpCode(HttpStatus.OK)
    async refreshWithdrawal(
        @CurrentUser('userId') userId: string,
        @Param('id') withdrawalId: string,
    ): Promise<WithdrawalResponse> {
        return this.withdrawalsService.refreshWithdrawal(withdrawalId, userId);
    }
}
