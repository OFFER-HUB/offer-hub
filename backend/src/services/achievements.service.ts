import { AchievementsRepository } from '@/repositories/achievements.repository';
import { CreateAchievementDto, UpdateAchievementDto } from '@/dtos/achievements.dto';
import { Achievement } from '@/entities/achievements.entity';

export class AchievementsService {
  private achievementsRepository: AchievementsRepository;

  constructor() {
    this.achievementsRepository = new AchievementsRepository();
  }

  async createAchievement(dto: CreateAchievementDto): Promise<Achievement> {
    return await this.achievementsRepository.create(dto);
  }

  async getAchievements(): Promise<Achievement[]> {
    return await this.achievementsRepository.findAll();
  }

  async getAchievementById(id: string): Promise<Achievement | null> {
    return (await this.achievementsRepository.findById(id)) || null;
  }

  async updateAchievement(id: string, dto: UpdateAchievementDto): Promise<Achievement> {
    return await this.achievementsRepository.update(id, dto);
  }

  async deleteAchievement(id: string): Promise<void> {
    await this.achievementsRepository.delete(id);
  }
}
