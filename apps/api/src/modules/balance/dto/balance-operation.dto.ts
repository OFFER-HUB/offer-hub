import { IsString, IsNotEmpty, Matches, IsOptional } from 'class-validator';
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

    @IsString()
    @IsOptional()
    description?: string;
}

/**
 * Base DTO for operations that track an external reference.
 */
class ReferenceOperationDto extends BalanceOperationDto {
    @IsString()
    @IsOptional()
    reference?: string;
}

/**
 * Base DTO for order-related balance operations.
 */
class OrderOperationDto extends BalanceOperationDto {
    @IsString()
    @IsNotEmpty()
    orderId!: string;
}

/**
 * DTO for credit operations (adding funds to available balance).
 */
export class CreditAvailableDto extends ReferenceOperationDto {}

/**
 * DTO for debit operations (removing funds from available balance).
 */
export class DebitAvailableDto extends ReferenceOperationDto {}

/**
 * DTO for reserve operations (moving funds from available to reserved).
 */
export class ReserveDto extends OrderOperationDto {}

/**
 * DTO for release operations (moving reserved funds to seller's available).
 */
export class ReleaseDto extends OrderOperationDto {
    @IsString()
    @IsNotEmpty()
    sellerId!: string;
}

/**
 * DTO for cancel reservation operations (returning reserved to available).
 */
export class CancelReservationDto extends OrderOperationDto {}

/**
 * DTO for deduct reserved operations (removing from reserved balance).
 */
export class DeductReservedDto extends OrderOperationDto {}
