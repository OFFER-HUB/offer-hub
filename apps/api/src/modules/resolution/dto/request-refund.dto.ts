import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO for requesting refund to buyer.
 */
export class RequestRefundDto {
    @IsString()
    @IsNotEmpty()
    reason!: string;
}
