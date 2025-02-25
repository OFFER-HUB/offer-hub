import { Repository, getRepository } from 'typeorm';
import { Achievement } from '@/entities/achievements.entity';

export class AchievementsRepository {
  private repo: Repository<Achievement>;

  constructor() {
    this.repo = getRepository(Achievement);
  }

  async create(achievementData: Partial<Achievement>): Promise<Achievement> {
    const achievement = this.repo.create(achievementData);
    return this.repo.save(achievement);
  }

  async findAll(): Promise<Achievement[]> {
    return this.repo.find();
  }

  async findById(id: string): Promise<Achievement | null> {
    return this.repo.findOne({ where: { achievement_id: id } }) || null;
  }

  async update(id: string, achievementData: Partial<Achievement>): Promise<Achievement | null> {
    await this.repo.update(id, achievementData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
  
  
}
