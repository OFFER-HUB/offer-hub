import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { BalanceService } from './balance.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { ScopeGuard } from '../../common/guards/scope.guard';
import { Scopes } from '../../common/decorators/scopes.decorator';
import {
    CreditAvailableDto,
    DebitAvailableDto,
    ReserveDto,
    ReleaseDto,
    CancelReservationDto,
    DeductReservedDto,
} from './dto';

/**
 * Balance Controller
 *
 * Provides HTTP endpoints for balance management operations:
 * - GET /users/:userId/balance - Get user balance
 * - POST /users/:userId/balance/credit - Credit available balance
 * - POST /users/:userId/balance/debit - Debit available balance
 * - POST /users/:userId/balance/reserve - Reserve funds
 * - POST /users/:userId/balance/release - Release reserved funds to seller
 * - POST /users/:userId/balance/cancel-reservation - Cancel reservation
 * - POST /users/:userId/balance/deduct-reserved - Deduct from reserved
 * - GET /users/:userId/balance/sync - Sync with provider
 * - GET /users/:userId/balance/verify - Get balance with provider verification
 */
@Controller('users/:userId/balance')
@UseGuards(ApiKeyGuard, ScopeGuard)
export class BalanceController {
    constructor(private readonly balanceService: BalanceService) {}

    /**
     * Get user balance.
     */
    @Get()
    @Scopes('read')
    async getBalance(@Param('userId') userId: string) {
        return this.balanceService.getBalance(userId);
    }

    /**
     * Credit funds to available balance.
     */
    @Post('credit')
    @Scopes('write')
    @HttpCode(HttpStatus.OK)
    async creditAvailable(
        @Param('userId') userId: string,
        @Body() dto: CreditAvailableDto,
    ) {
        return this.balanceService.creditAvailable(userId, dto);
    }

    /**
     * Debit funds from available balance.
     */
    @Post('debit')
    @Scopes('write')
    @HttpCode(HttpStatus.OK)
    async debitAvailable(
        @Param('userId') userId: string,
        @Body() dto: DebitAvailableDto,
    ) {
        return this.balanceService.debitAvailable(userId, dto);
    }

    /**
     * Reserve funds (move from available to reserved).
     */
    @Post('reserve')
    @Scopes('write')
    @HttpCode(HttpStatus.OK)
    async reserve(
        @Param('userId') userId: string,
        @Body() dto: ReserveDto,
    ) {
        return this.balanceService.reserve(userId, dto);
    }

    /**
     * Release reserved funds to seller.
     */
    @Post('release')
    @Scopes('write')
    @HttpCode(HttpStatus.OK)
    async release(
        @Param('userId') userId: string,
        @Body() dto: ReleaseDto,
    ) {
        return this.balanceService.release(userId, dto);
    }

    /**
     * Cancel reservation (return reserved to available).
     */
    @Post('cancel-reservation')
    @Scopes('write')
    @HttpCode(HttpStatus.OK)
    async cancelReservation(
        @Param('userId') userId: string,
        @Body() dto: CancelReservationDto,
    ) {
        return this.balanceService.cancelReservation(userId, dto);
    }

    /**
     * Deduct from reserved balance.
     */
    @Post('deduct-reserved')
    @Scopes('write')
    @HttpCode(HttpStatus.OK)
    async deductReserved(
        @Param('userId') userId: string,
        @Body() dto: DeductReservedDto,
    ) {
        return this.balanceService.deductReserved(userId, dto);
    }

    /**
     * Sync balance with provider.
     */
    @Post('sync')
    @Scopes('write')
    @HttpCode(HttpStatus.OK)
    async syncBalance(@Param('userId') userId: string) {
        return this.balanceService.syncBalanceFromProvider(userId);
    }

    /**
     * Get balance with provider verification.
     */
    @Get('verify')
    @Scopes('read')
    async verifyBalance(@Param('userId') userId: string) {
        return this.balanceService.getBalanceWithProviderCheck(userId);
    }
}
