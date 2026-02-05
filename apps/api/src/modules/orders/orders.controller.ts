import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    Inject,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import type { Milestone } from '@prisma/client';
import { OrderStatus } from '@offerhub/shared';
import { OrdersService, OrderWithRelations } from './orders.service';
import { CreateOrderDto, CancelOrderDto } from './dto';

/**
 * API response wrapper.
 */
interface ApiResponse<T> {
    success: boolean;
    data: T;
}

/**
 * Orders Controller
 * Handles REST API endpoints for order lifecycle management.
 */
@Controller('orders')
export class OrdersController {
    constructor(@Inject(OrdersService) private readonly ordersService: OrdersService) {}

    /**
     * Create a new order.
     * POST /orders
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createOrder(@Body() dto: CreateOrderDto): Promise<ApiResponse<OrderWithRelations>> {
        const order = await this.ordersService.createOrder(dto);
        return { success: true, data: order };
    }

    /**
     * List orders with pagination.
     * GET /orders
     */
    @Get()
    async listOrders(
        @Query('buyer_id') buyerId?: string,
        @Query('seller_id') sellerId?: string,
        @Query('status') status?: string,
        @Query('limit') limit?: string,
        @Query('cursor') cursor?: string,
    ): Promise<{ success: boolean; data: OrderWithRelations[]; hasMore: boolean; nextCursor?: string }> {
        const orderStatus = status && Object.values(OrderStatus).includes(status as OrderStatus)
            ? (status as OrderStatus)
            : undefined;
        const result = await this.ordersService.listOrders({
            buyerId,
            sellerId,
            status: orderStatus,
            limit: limit ? parseInt(limit, 10) : undefined,
            cursor,
        });
        return { success: true, ...result };
    }

    /**
     * Get order by ID.
     * GET /orders/:id
     */
    @Get(':id')
    async getOrder(@Param('id') id: string): Promise<ApiResponse<OrderWithRelations>> {
        const order = await this.ordersService.getOrder(id);
        return { success: true, data: order };
    }

    /**
     * Reserve funds for an order.
     * POST /orders/:id/reserve
     */
    @Post(':id/reserve')
    async reserveFunds(@Param('id') id: string): Promise<ApiResponse<OrderWithRelations>> {
        const order = await this.ordersService.reserveFunds(id);
        return { success: true, data: order };
    }

    /**
     * Cancel an order.
     * POST /orders/:id/cancel
     */
    @Post(':id/cancel')
    async cancelOrder(
        @Param('id') id: string,
        @Body() dto?: CancelOrderDto,
    ): Promise<ApiResponse<OrderWithRelations>> {
        const order = await this.ordersService.cancelOrder(id, dto?.reason);
        return { success: true, data: order };
    }

    /**
     * Create escrow contract for an order.
     * POST /orders/:id/escrow
     */
    @Post(':id/escrow')
    async createEscrow(@Param('id') id: string): Promise<ApiResponse<OrderWithRelations>> {
        const order = await this.ordersService.createEscrow(id);
        return { success: true, data: order };
    }

    /**
     * Fund escrow contract.
     * POST /orders/:id/escrow/fund
     */
    @Post(':id/escrow/fund')
    async fundEscrow(@Param('id') id: string): Promise<ApiResponse<OrderWithRelations>> {
        const order = await this.ordersService.fundEscrow(id);
        return { success: true, data: order };
    }

    /**
     * Get milestones for an order.
     * GET /orders/:id/milestones
     */
    @Get(':id/milestones')
    async getMilestones(@Param('id') id: string): Promise<ApiResponse<Milestone[]>> {
        const milestones = await this.ordersService.getMilestones(id);
        return { success: true, data: milestones };
    }

    /**
     * Complete a milestone.
     * POST /orders/:id/milestones/:ref/complete
     */
    @Post(':id/milestones/:ref/complete')
    async completeMilestone(
        @Param('id') id: string,
        @Param('ref') ref: string,
    ): Promise<ApiResponse<Milestone>> {
        const milestone = await this.ordersService.completeMilestone(id, ref);
        return { success: true, data: milestone };
    }
}
