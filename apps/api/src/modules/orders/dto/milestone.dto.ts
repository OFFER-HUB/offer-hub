import { IsString, IsNotEmpty, Matches } from 'class-validator';

/**
 * DTO for milestone creation within an order.
 */
export class MilestoneDto {
    @IsString()
    @IsNotEmpty()
    milestone_ref!: string;

    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsString()
    @Matches(/^\d+\.\d{2}$/, {
        message: 'Amount must be a decimal string with exactly 2 decimal places (e.g., "100.50")',
    })
    amount!: string;
}
