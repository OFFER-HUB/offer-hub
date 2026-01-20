import { Controller, Post, Param, Body, Inject, HttpCode, HttpStatus } from '@nestjs/common';
import { ResolutionService, DisputeWithRelations } from './resolution.service';
import { OrderWithRelations } from '../orders/orders.service';
import { RequestReleaseDto, RequestRefundDto, OpenDisputeDto } from './dto';

/**
 * API response wrapper.
 */
interface ApiResponse<T> {
    success: boolean;
    data: T;
}

/**
 * Resolution Controller
 * Handles REST API endpoints for release and refund operations on orders.
 */
@Controller('orders/:orderId/resolution')
export class ResolutionController {
    constructor(
        @Inject(ResolutionService) private readonly resolutionService: ResolutionService,
    ) {}

    /**
     * Request release of funds to seller.
     * POST /orders/:orderId/resolution/release
     */
    @Post('release')
    @HttpCode(HttpStatus.OK)
    async requestRelease(
        @Param('orderId') orderId: string,
        @Body() dto?: RequestReleaseDto,
    ): Promise<ApiResponse<OrderWithRelations>> {
        const order = await this.resolutionService.requestRelease(orderId, dto?.reason);
        return { success: true, data: order };
    }

    /**
     * Request refund to buyer.
     * POST /orders/:orderId/resolution/refund
     */
    @Post('refund')
    @HttpCode(HttpStatus.OK)
    async requestRefund(
        @Param('orderId') orderId: string,
        @Body() dto: RequestRefundDto,
    ): Promise<ApiResponse<OrderWithRelations>> {
        const order = await this.resolutionService.requestRefund(orderId, dto.reason);
        return { success: true, data: order };
    }

    /**
     * Open a dispute for an order.
     * POST /orders/:orderId/resolution/dispute
     */
    @Post('dispute')
    @HttpCode(HttpStatus.CREATED)
    async openDispute(
        @Param('orderId') orderId: string,
        @Body() dto: OpenDisputeDto,
    ): Promise<ApiResponse<DisputeWithRelations>> {
        const dispute = await this.resolutionService.openDispute(orderId, dto);
        return { success: true, data: dispute };
    }
}
