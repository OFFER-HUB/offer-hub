import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    IsArray,
    ValidateNested,
    Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Milestone DTO for escrow creation
 */
export class MilestoneDto {
    @IsString()
    @IsNotEmpty()
    ref!: string; // e.g., "m1", "m2"

    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^\d+\.\d{2}$/, {
        message: 'amount must be a decimal string with exactly 2 decimal places',
    })
    amount!: string; // Orchestrator format (2 decimals)
}

/**
 * Escrow terms configuration
 */
export class EscrowTermsDto {
    @IsOptional()
    @IsBoolean()
    milestones_required?: boolean;

    @IsOptional()
    @IsBoolean()
    allow_partial_release?: boolean;

    @IsOptional()
    @IsBoolean()
    allow_partial_refund?: boolean;
}

/**
 * Create escrow contract DTO
 */
export class CreateEscrowDto {
    @IsString()
    @IsNotEmpty()
    order_id!: string; // Reference to Orchestrator order

    @IsString()
    @IsNotEmpty()
    buyer_address!: string; // Stellar address (G...) or Airtm user ID

    @IsString()
    @IsNotEmpty()
    seller_address!: string; // Stellar address (G...) or Airtm user ID

    @IsString()
    @IsNotEmpty()
    @Matches(/^\d+\.\d{2}$/, {
        message: 'amount must be a decimal string with exactly 2 decimal places',
    })
    amount!: string; // USDC amount in Orchestrator format (2 decimals)

    @IsOptional()
    @ValidateNested()
    @Type(() => EscrowTermsDto)
    terms?: EscrowTermsDto;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MilestoneDto)
    milestones?: MilestoneDto[];

    @IsOptional()
    metadata?: Record<string, string>;
}
