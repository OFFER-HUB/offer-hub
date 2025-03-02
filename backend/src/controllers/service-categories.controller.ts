import { Controller, Get, Post, Body, Param, Delete, ValidationPipe, UsePipes, HttpStatus, HttpCode } from '@nestjs/common';
import { ServiceCategoryService } from '@/services/service-categories.service';
import { CreateServiceCategoryDto, ServiceCategoryDto } from '@/dtos/service-categories.dto';

@Controller('service-categories')
export class ServiceCategoryController {
  constructor(private readonly serviceCategoryService: ServiceCategoryService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createServiceCategoryDto: CreateServiceCategoryDto): Promise<ServiceCategoryDto> {
    const result = await this.serviceCategoryService.create(createServiceCategoryDto);
    return {
      service_id: result.service_id,
      category_id: result.category_id
    };
  }

  @Get()
  async findAll(): Promise<ServiceCategoryDto[]> {
    const results = await this.serviceCategoryService.findAll();
    return results.map(item => ({
      service_id: item.service_id,
      category_id: item.category_id
    }));
  }

  @Get('service/:serviceId')
  async findByServiceId(@Param('serviceId') serviceId: string): Promise<ServiceCategoryDto[]> {
    const results = await this.serviceCategoryService.findByServiceId(serviceId);
    return results.map(item => ({
      service_id: item.service_id,
      category_id: item.category_id
    }));
  }

  @Get('category/:categoryId')
  async findByCategoryId(@Param('categoryId') categoryId: string): Promise<ServiceCategoryDto[]> {
    const results = await this.serviceCategoryService.findByCategoryId(categoryId);
    return results.map(item => ({
      service_id: item.service_id,
      category_id: item.category_id
    }));
  }

  @Delete(':serviceId/:categoryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('serviceId') serviceId: string,
    @Param('categoryId') categoryId: string
  ): Promise<void> {
    await this.serviceCategoryService.remove(serviceId, categoryId);
  }
}