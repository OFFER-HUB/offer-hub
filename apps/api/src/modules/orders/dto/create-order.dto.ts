import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { MilestoneDto } from './milestone.dto';

/**
 * DTO for creating a new order.
 */
export class CreateOrderDto {
    @IsString()
    @IsOptional()
    client_order_ref?: string;

    @IsString()
    @IsNotEmpty()
    buyer_id!: string;

    @IsString()
    @IsNotEmpty()
    seller_id!: string;

    @IsString()
    @Matches(/^\d+\.\d{2}$/, {
        message: 'Amount must be a decimal string with exactly 2 decimal places (e.g., "100.50")',
    })
    amount!: string;

    @IsString()
    @IsOptional()
    currency?: string = 'USD';

    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => MilestoneDto)
    milestones?: MilestoneDto[];

    @IsOptional()
    metadata?: Record<string, any>;
}
