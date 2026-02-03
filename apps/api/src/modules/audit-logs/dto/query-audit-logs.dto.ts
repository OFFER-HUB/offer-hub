import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

const AUDIT_ACTIONS = ['CREATE', 'UPDATE', 'DELETE'] as const;

/**
 * Query parameters for GET /audit/logs.
 */
export class QueryAuditLogsDto {
    @IsOptional()
    @IsString()
    resourceType?: string;

    @IsOptional()
    @IsString()
    resourceId?: string;

    @IsOptional()
    @IsIn(AUDIT_ACTIONS)
    action?: (typeof AUDIT_ACTIONS)[number];

    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsString()
    from?: string;

    @IsOptional()
    @IsString()
    to?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @IsOptional()
    @IsString()
    cursor?: string;
}
