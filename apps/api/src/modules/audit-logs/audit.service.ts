import { Injectable, Inject, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { generateAuditLogId } from '@offerhub/shared';
import { PrismaService } from '../database/prisma.service';
import { RedactionService } from './redaction.service';
import type { AuditEntryInput } from './audit.types';

export interface ListAuditLogsParams {
    marketplaceId: string;
    resourceType?: string;
    resourceId?: string;
    action?: string;
    userId?: string;
    from?: string;
    to?: string;
    limit: number;
    cursor?: string;
}

/**
 * AuditService – records audit entries for all mutations.
 * Uses fire-and-forget async logging so the main operation is not blocked.
 * Payloads are redacted before storage.
 */
@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);

    constructor(
        @Inject(PrismaService) private readonly prisma: PrismaService,
        @Inject(RedactionService) private readonly redaction: RedactionService,
    ) {}

    /**
     * Log an audit entry. Runs asynchronously (fire-and-forget).
     * Callers should not await; use .catch() if they need to handle failures.
     */
    log(entry: AuditEntryInput): Promise<void> {
        return this.persist(entry).catch((err) => {
            this.logger.error(`Audit log failed: ${err?.message}`, err?.stack);
        });
    }

    /**
     * List audit logs with filters and cursor pagination. Ordered by occurredAt desc.
     */
    async listLogs(params: ListAuditLogsParams): Promise<{ items: Array<{
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
    }> }> {
        const where: Prisma.AuditLogWhereInput = {
            marketplaceId: params.marketplaceId,
        };
        if (params.resourceType != null) where.resourceType = params.resourceType;
        if (params.resourceId != null) where.resourceId = params.resourceId;
        if (params.action != null) where.action = params.action;
        if (params.userId != null) where.userId = params.userId;
        const dateFilter: Prisma.DateTimeFilter = {};
        if (params.from != null) {
            const fromDate = new Date(params.from);
            if (!Number.isNaN(fromDate.getTime())) dateFilter.gte = fromDate;
        }
        if (params.to != null) {
            const toDate = new Date(params.to);
            if (!Number.isNaN(toDate.getTime())) dateFilter.lte = toDate;
        }
        if (Object.keys(dateFilter).length > 0) where.occurredAt = dateFilter;

        const orderBy: Prisma.AuditLogOrderByWithRelationInput[] = [
            { occurredAt: 'desc' },
            { id: 'desc' },
        ];

        const findManyArgs: Prisma.AuditLogFindManyArgs = {
            where,
            orderBy,
            take: params.limit,
            select: {
                id: true,
                occurredAt: true,
                action: true,
                resourceType: true,
                resourceId: true,
                payloadBefore: true,
                payloadAfter: true,
                actorType: true,
                actorId: true,
                result: true,
                correlationId: true,
            },
        };

        if (params.cursor) {
            const cursorRecord = await this.prisma.auditLog.findUnique({
                where: { id: params.cursor, marketplaceId: params.marketplaceId },
                select: { occurredAt: true, id: true },
            });
            if (cursorRecord) {
                findManyArgs.cursor = { id: params.cursor };
                findManyArgs.skip = 1;
            }
        }

        const items = await this.prisma.auditLog.findMany(findManyArgs);
        return { items };
    }

    /**
     * Persist a single audit record. Redacts payloads before storing.
     * Exposed for tests; prefer .log() in application code.
     */
    async persist(entry: AuditEntryInput): Promise<void> {
        const payloadBefore = entry.payloadBefore != null
            ? (this.redaction.redact(entry.payloadBefore) as object)
            : undefined;
        const payloadAfter = entry.payloadAfter != null
            ? (this.redaction.redact(entry.payloadAfter) as object)
            : undefined;

        await this.prisma.auditLog.create({
            data: {
                id: generateAuditLogId(),
                occurredAt: new Date(),
                marketplaceId: entry.marketplaceId,
                userId: entry.userId ?? null,
                action: entry.action,
                resourceType: entry.resourceType,
                resourceId: entry.resourceId,
                payloadBefore: payloadBefore ?? Prisma.JsonNull,
                payloadAfter: payloadAfter ?? Prisma.JsonNull,
                actorType: entry.actorType,
                actorId: entry.actorId ?? null,
                result: entry.result,
                error: entry.error ?? Prisma.JsonNull,
                idempotencyKey: entry.idempotencyKey ?? null,
                correlationId: entry.correlationId ?? null,
                ip: entry.ip ?? null,
                userAgent: entry.userAgent ?? null,
            },
        });
    }
}
