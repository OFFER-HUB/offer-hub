import { IsString, IsNotEmpty, Matches } from 'class-validator';

/**
 * Dispute resolution DTO
 * For splitting escrow funds between buyer and seller
 */
export class DisputeResolutionDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^\d+\.\d{2}$/, {
        message: 'release_amount must be a decimal string with exactly 2 decimal places',
    })
    release_amount!: string; // Amount to seller (2 decimals)

    @IsString()
    @IsNotEmpty()
    @Matches(/^\d+\.\d{2}$/, {
        message: 'refund_amount must be a decimal string with exactly 2 decimal places',
    })
    refund_amount!: string; // Amount to buyer (2 decimals)

    // Note: release_amount + refund_amount must equal total escrow
}
