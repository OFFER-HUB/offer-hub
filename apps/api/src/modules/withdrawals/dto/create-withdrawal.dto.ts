import { IsString, IsNotEmpty, Matches, IsOptional, IsIn, IsBoolean } from 'class-validator';

/**
 * Supported withdrawal destination types.
 */
export type WithdrawalDestinationType = 'bank' | 'crypto' | 'airtm_balance';

/**
 * DTO for creating a new withdrawal request.
 */
export class CreateWithdrawalDto {
    /**
     * Amount to withdraw in decimal format (e.g., "100.00").
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
     * Type of destination for the withdrawal.
     */
    @IsString()
    @IsIn(['bank', 'crypto', 'airtm_balance'])
    destinationType!: WithdrawalDestinationType;

    /**
     * Reference to the destination (bank account ID, crypto address, etc.).
     */
    @IsString()
    @IsNotEmpty()
    destinationRef!: string;

    /**
     * If true, creates and commits the withdrawal in one step.
     * If false (default), requires a separate commit call.
     */
    @IsBoolean()
    @IsOptional()
    commit?: boolean = false;

    /**
     * Optional description for the withdrawal.
     */
    @IsString()
    @IsOptional()
    description?: string;
}
