import { Controller, Get, Post, Param, Body, Inject, HttpCode, HttpStatus } from '@nestjs/common';
import { ResolutionService, DisputeWithRelations } from '../resolution/resolution.service';
import { AssignDisputeDto, ResolveDisputeDto } from '../resolution/dto';

/**
 * API response wrapper.
 */
interface ApiResponse<T> {
    success: boolean;
    data: T;
}

/**
 * Disputes Controller
 * Handles REST API endpoints for dispute management (CRUD operations).
 */
@Controller('disputes')
export class DisputesController {
    constructor(
        @Inject(ResolutionService) private readonly resolutionService: ResolutionService,
    ) {}

    /**
     * Get dispute by ID.
     * GET /disputes/:id
     */
    @Get(':id')
    async getDispute(@Param('id') id: string): Promise<ApiResponse<DisputeWithRelations>> {
        // For now, we'll use a simple Prisma query
        // In production, you might want to add this method to ResolutionService
        const dispute = await this.resolutionService['prisma'].dispute.findUnique({
            where: { id },
            include: {
                order: {
                    include: {
                        escrow: true,
                        dispute: true,
                        milestones: true,
                    },
                },
            },
        });

        if (!dispute) {
            throw new Error(`Dispute ${id} not found`);
        }

        return { success: true, data: dispute as DisputeWithRelations };
    }

    /**
     * Assign dispute to support agent.
     * POST /disputes/:id/assign
     */
    @Post(':id/assign')
    @HttpCode(HttpStatus.OK)
    async assignDispute(
        @Param('id') id: string,
        @Body() dto: AssignDisputeDto,
    ): Promise<ApiResponse<DisputeWithRelations>> {
        const dispute = await this.resolutionService.assignDispute(id, dto);
        return { success: true, data: dispute };
    }

    /**
     * Resolve dispute with decision.
     * POST /disputes/:id/resolve
     */
    @Post(':id/resolve')
    @HttpCode(HttpStatus.OK)
    async resolveDispute(
        @Param('id') id: string,
        @Body() dto: ResolveDisputeDto,
    ): Promise<ApiResponse<DisputeWithRelations>> {
        const dispute = await this.resolutionService.resolveDispute(id, dto);
        return { success: true, data: dispute };
    }
}
