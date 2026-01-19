import { IsString, IsNotEmpty, IsEnum, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { TrustlessWebhookEventType } from '../types/trustless-work.types';

/**
 * Webhook data DTO
 */
export class WebhookDataDto {
    @IsString()
    @IsNotEmpty()
    contract_id!: string;

    @IsString()
    @IsNotEmpty()
    order_id!: string;

    @IsString()
    @IsNotEmpty()
    status!: string;

    @IsString()
    @IsNotEmpty()
    amount!: string;

    @IsString()
    @IsNotEmpty()
    currency!: string;

    @IsString()
    @IsNotEmpty()
    buyer_address!: string;

    @IsString()
    @IsNotEmpty()
    seller_address!: string;

    @IsOptional()
    @IsString()
    transaction_hash?: string;

    @IsOptional()
    @IsString()
    milestone_ref?: string;

    @IsString()
    @IsNotEmpty()
    created_at!: string;

    @IsString()
    @IsNotEmpty()
    updated_at!: string;
}

/**
 * Trustless Work webhook DTO
 */
export class TrustlessWebhookDto {
    @IsEnum(TrustlessWebhookEventType)
    type!: TrustlessWebhookEventType;

    @IsString()
    @IsNotEmpty()
    event_id!: string;

    @ValidateNested()
    @Type(() => WebhookDataDto)
    data!: WebhookDataDto;
}
