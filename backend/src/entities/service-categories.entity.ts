import { Entity, PrimaryColumn } from 'typeorm';

@Entity('service_categories')
export class ServiceCategory {
  @PrimaryColumn('uuid')
  service_id: string;

  @PrimaryColumn('uuid')
  category_id: string;
}
