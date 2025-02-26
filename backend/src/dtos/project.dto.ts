import { IsUUID, IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, Max, IsDate, IsDateString } from "class-validator";
import { ProjectStatus } from "@/entities/project.entity";

export class CreateProjectDTO {
  @IsUUID()
  @IsNotEmpty()
  client_id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  budget_min?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  budget_max?: number;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;
}

export class UpdateProjectDTO {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  budget_min?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  budget_max?: number;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;
}
