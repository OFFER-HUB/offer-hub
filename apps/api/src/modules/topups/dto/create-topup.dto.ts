import { IsString, IsNotEmpty, Matches, IsOptional } from 'class-validator';

/**
 * DTO for creating a new top-up request.
 */
export class CreateTopUpDto {
    /**
     * Amount to top-up in decimal format (e.g., "100.00").
     * Must be a positive number with exactly 2 decimal places.
     */
    @IsString()
    @IsNotEmpty()
    @Matches(/^\d+\.\d{2}$/, {
        message: 'amount must be a decimal string with exactly 2 decimal places (e.g., "100.00")',
    })
    amount!: string;

    /**
     * Currency code (ISO 4217). Currently only "USD" is supported.
     */
    @IsString()
    @IsOptional()
    currency?: string = 'USD';

    /**
     * Optional description for the top-up.
     */
    @IsString()
    @IsOptional()
    description?: string;
}
