import { EntityRepository, Repository } from 'typeorm';
import { ServiceCategory } from '@/entities/service-categories.entity';

@EntityRepository(ServiceCategory)
export class ServiceCategoryRepository extends Repository<ServiceCategory> {
  async findByServiceId(serviceId: string): Promise<ServiceCategory[]> {
    return this.find({ where: { service_id: serviceId } });
  }

  async findByCategoryId(categoryId: string): Promise<ServiceCategory[]> {
    return this.find({ where: { category_id: categoryId } });
  }

  async findByServiceAndCategory(serviceId: string, categoryId: string): Promise<ServiceCategory | undefined> {
    const result = await this.findOne({ where: { service_id: serviceId, category_id: categoryId } });
    return result || undefined;
  }
}