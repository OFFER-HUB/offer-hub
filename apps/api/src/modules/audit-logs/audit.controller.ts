import { Controller, Get, Query, UseGuards, Req, Inject } from '@nestjs/common';
import { Request } from 'express';
import { AuditService } from './audit.service';
import { QueryAuditLogsDto } from './dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { ScopeGuard } from '../../common/guards/scope.guard';
import { Scopes } from '../../common/decorators/scopes.decorator';
import { PAGINATION_DEFAULTS } from '@offerhub/shared';

const MAX_LIMIT = 100;

interface AuditLogRow {
    id: string;
    occurredAt: Date;
    action: string;
    resourceType: string;
    resourceId: string;
    payloadBefore: unknown;
    payloadAfter: unknown;
    actorType: string | null;
    actorId: string | null;
    result: string | null;
    correlationId: string | null;
}

/**
 * Support API for audit trail. Requires support scope.
 */
@Controller('audit/logs')
@UseGuards(ApiKeyGuard, ScopeGuard)
@Scopes('support')
export class AuditController {
    constructor(@Inject(AuditService) private readonly auditService: AuditService) {}

    /**
     * GET /audit/logs – list audit entries with filters and cursor pagination.
     * Ordered by occurredAt descending (newest first).
     */
    @Get()
    async getLogs(
        @Query() query: QueryAuditLogsDto,
        @Req() req: Request,
    ): Promise<{ data: AuditLogRow[]; pagination: { hasMore: boolean; nextCursor?: string } }> {
        const marketplaceId = (req as any).apiKey?.id;
        if (!marketplaceId) {
            return { data: [], pagination: { hasMore: false } };
        }

        const limit = Math.min(
            query.limit ?? PAGINATION_DEFAULTS.DEFAULT_LIMIT,
            MAX_LIMIT,
        );
        const result = await this.auditService.listLogs({
            marketplaceId,
            resourceType: query.resourceType,
            resourceId: query.resourceId,
            action: query.action,
            userId: query.userId,
            from: query.from,
            to: query.to,
            limit: limit + 1,
            cursor: query.cursor,
        });

        const items = result.items.slice(0, limit);
        const hasMore = result.items.length > limit;
        const nextCursor = hasMore ? result.items[limit - 1]?.id : undefined;

        return {
            data: items.map(this.toResponseRow),
            pagination: { hasMore, nextCursor },
        };
    }

    private toResponseRow(row: {
        id: string;
        occurredAt: Date;
        action: string;
        resourceType: string;
        resourceId: string;
        payloadBefore: unknown;
        payloadAfter: unknown;
        actorType: string | null;
        actorId: string | null;
        result: string | null;
        correlationId: string | null;
    }): AuditLogRow {
        return {
            id: row.id,
            occurredAt: row.occurredAt,
            action: row.action,
            resourceType: row.resourceType,
            resourceId: row.resourceId,
            payloadBefore: row.payloadBefore,
            payloadAfter: row.payloadAfter,
            actorType: row.actorType,
            actorId: row.actorId,
            result: row.result,
            correlationId: row.correlationId,
        };
    }
}
