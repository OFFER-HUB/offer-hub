import { IsString, IsOptional } from 'class-validator';

/**
 * DTO for requesting release of funds to seller.
 */
export class RequestReleaseDto {
    @IsString()
    @IsOptional()
    reason?: string;
}
