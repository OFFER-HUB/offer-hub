import { IsUUID, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsUUID()
  user_id: string;

  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  read?: boolean;

  @IsOptional()
  @IsString()
  action_url?: string;
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  read?: boolean;

  @IsOptional()
  @IsString()
  action_url?: string;
}
