import { IsString, IsOptional } from 'class-validator';

/**
 * DTO for order cancellation.
 */
export class CancelOrderDto {
    @IsString()
    @IsOptional()
    reason?: string;
}
