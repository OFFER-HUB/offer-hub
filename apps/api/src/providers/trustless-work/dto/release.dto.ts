import { IsString, IsNotEmpty, IsOptional, IsEnum, Matches, ValidateIf } from 'class-validator';

/**
 * Release mode enum
 */
export enum ReleaseMode {
    FULL = 'FULL',
    PARTIAL = 'PARTIAL',
}

/**
 * Release escrow DTO
 */
export class ReleaseDto {
    @IsEnum(ReleaseMode)
    mode!: ReleaseMode;

    @ValidateIf((o) => o.mode === ReleaseMode.PARTIAL)
    @IsString()
    @IsNotEmpty()
    @Matches(/^\d+\.\d{2}$/, {
        message: 'amount must be a decimal string with exactly 2 decimal places',
    })
    amount?: string; // Required if mode === PARTIAL

    @IsOptional()
    @IsString()
    milestone_ref?: string; // Optional: specific milestone

    @IsOptional()
    @IsString()
    reason?: string; // Audit trail
}
