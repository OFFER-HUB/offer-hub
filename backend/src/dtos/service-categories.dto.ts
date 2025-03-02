import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateServiceCategoryDto {
  @IsNotEmpty()
  @IsUUID()
  service_id: string;

  @IsNotEmpty()
  @IsUUID()
  category_id: string;
}

export class ServiceCategoryDto {
  service_id: string;
  category_id: string;
}