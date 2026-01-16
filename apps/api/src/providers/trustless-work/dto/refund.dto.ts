import { IsString, IsNotEmpty, IsOptional, IsEnum, Matches, ValidateIf } from 'class-validator';

/**
 * Refund mode enum
 */
export enum RefundMode {
    FULL = 'FULL',
    PARTIAL = 'PARTIAL',
}

/**
 * Refund escrow DTO
 */
export class RefundDto {
    @IsEnum(RefundMode)
    mode!: RefundMode;

    @ValidateIf((o) => o.mode === RefundMode.PARTIAL)
    @IsString()
    @IsNotEmpty()
    @Matches(/^\d+\.\d{2}$/, {
        message: 'amount must be a decimal string with exactly 2 decimal places',
    })
    amount?: string; // Required if mode === PARTIAL

    @IsString()
    @IsNotEmpty()
    reason!: string; // Required: 'not_delivered', 'quality_issue', etc.
}
