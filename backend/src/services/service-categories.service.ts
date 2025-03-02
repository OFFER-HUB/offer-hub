import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceCategoryRepository } from '@/repositories/service-categories.repository';
import { ServiceCategory } from '@/entities/service-categories.entity';
import { CreateServiceCategoryDto } from '@/dtos/service-categories.dto';

@Injectable()
export class ServiceCategoryService {
  constructor(
    @InjectRepository(ServiceCategoryRepository)
    private serviceCategoryRepository: ServiceCategoryRepository,
  ) {}

  async create(createServiceCategoryDto: CreateServiceCategoryDto): Promise<ServiceCategory> {
    const serviceCategory = new ServiceCategory();
    serviceCategory.service_id = createServiceCategoryDto.service_id;
    serviceCategory.category_id = createServiceCategoryDto.category_id;
    
    return this.serviceCategoryRepository.save(serviceCategory);
  }

  async findAll(): Promise<ServiceCategory[]> {
    return this.serviceCategoryRepository.find();
  }

  async findByServiceId(serviceId: string): Promise<ServiceCategory[]> {
    return this.serviceCategoryRepository.findByServiceId(serviceId);
  }

  async findByCategoryId(categoryId: string): Promise<ServiceCategory[]> {
    return this.serviceCategoryRepository.findByCategoryId(categoryId);
  }

  async remove(serviceId: string, categoryId: string): Promise<void> {
    await this.serviceCategoryRepository.delete({ service_id: serviceId, category_id: categoryId });
  }
}