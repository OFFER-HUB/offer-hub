import { IsString, IsNotEmpty, IsEnum, IsArray, IsOptional } from 'class-validator';
import { DisputeOpenedBy, DisputeReason } from '@prisma/client';

/**
 * DTO for opening a dispute.
 */
export class OpenDisputeDto {
    @IsString()
    @IsNotEmpty()
    orderId!: string;

    @IsEnum(DisputeOpenedBy)
    openedBy!: DisputeOpenedBy;

    @IsEnum(DisputeReason)
    reason!: DisputeReason;

    @IsArray()
    @IsOptional()
    evidence?: string[];
}
