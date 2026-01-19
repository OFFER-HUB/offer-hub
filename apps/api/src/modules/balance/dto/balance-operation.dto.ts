import { IsString, IsNotEmpty, Matches, IsOptional, IsUUID } from 'class-validator';
import { AMOUNT_REGEX } from '@offerhub/shared';

/**
 * Base DTO for balance operations with amount validation.
 */
export class BalanceOperationDto {
    @IsString()
    @IsNotEmpty()
    @Matches(AMOUNT_REGEX, {
        message: 'amount must be a decimal string with exactly 2 decimal places (e.g., "100.00")',
    })
    amount!: string;

    @IsString()
    @IsOptional()
    currency?: string = 'USD';
}

/**
 * DTO for credit operations (adding funds to available balance).
 */
export class CreditAvailableDto extends BalanceOperationDto {
    @IsString()
    @IsOptional()
    reference?: string;

    @IsString()
    @IsOptional()
    description?: string;
}

/**
 * DTO for debit operations (removing funds from available balance).
 */
export class DebitAvailableDto extends BalanceOperationDto {
    @IsString()
    @IsOptional()
    reference?: string;

    @IsString()
    @IsOptional()
    description?: string;
}

/**
 * DTO for reserve operations (moving funds from available to reserved).
 */
export class ReserveDto extends BalanceOperationDto {
    @IsString()
    @IsNotEmpty()
    orderId!: string;

    @IsString()
    @IsOptional()
    description?: string;
}

/**
 * DTO for release operations (moving reserved funds to seller's available).
 */
export class ReleaseDto extends BalanceOperationDto {
    @IsString()
    @IsNotEmpty()
    orderId!: string;

    @IsString()
    @IsNotEmpty()
    sellerId!: string;

    @IsString()
    @IsOptional()
    description?: string;
}

/**
 * DTO for cancel reservation operations (returning reserved to available).
 */
export class CancelReservationDto extends BalanceOperationDto {
    @IsString()
    @IsNotEmpty()
    orderId!: string;

    @IsString()
    @IsOptional()
    description?: string;
}

/**
 * DTO for deduct reserved operations (removing from reserved balance).
 */
export class DeductReservedDto extends BalanceOperationDto {
    @IsString()
    @IsNotEmpty()
    orderId!: string;

    @IsString()
    @IsOptional()
    description?: string;
}

/**
 * DTO for provider sync operations.
 */
export class SyncBalanceDto {
    @IsString()
    @IsOptional()
    providerBalance?: string;

    @IsString()
    @IsOptional()
    currency?: string = 'USD';
}
