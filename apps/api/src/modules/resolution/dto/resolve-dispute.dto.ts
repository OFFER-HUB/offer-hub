import { IsString, IsEnum, IsOptional, Matches } from 'class-validator';
import { ResolutionDecision } from '@prisma/client';

/**
 * DTO for resolving a dispute.
 */
export class ResolveDisputeDto {
    @IsEnum(ResolutionDecision)
    decision!: ResolutionDecision;

    @IsString()
    @IsOptional()
    @Matches(/^\d+\.\d{2}$/, {
        message: 'Release amount must be a decimal string with exactly 2 decimal places (e.g., "100.50")',
    })
    releaseAmount?: string;

    @IsString()
    @IsOptional()
    @Matches(/^\d+\.\d{2}$/, {
        message: 'Refund amount must be a decimal string with exactly 2 decimal places (e.g., "100.50")',
    })
    refundAmount?: string;

    @IsString()
    @IsOptional()
    note?: string;
}
