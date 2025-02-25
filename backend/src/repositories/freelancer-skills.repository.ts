import { CreateFreelancerSkillDto, UpdateFreelancerSkillDto } from '@/dtos/freelancer-skills.dto';
import { FreelancerSkill } from '@/entities/freelancer-skills.entity';
import { getRepository, Repository } from 'typeorm';

export class FreelancerSkillsRepository {
  private repo: Repository<FreelancerSkill>;

  constructor() {
    this.repo = getRepository(FreelancerSkill);
  }

  async create(data: CreateFreelancerSkillDto): Promise<FreelancerSkill> {
    const skill = this.repo.create(data);
    return await this.repo.save(skill);
  }

  async findAll(): Promise<FreelancerSkill[]> {
    return await this.repo.find();
  }

  async findById(user_id: string, skill_id: string): Promise<FreelancerSkill | null> {
    return await this.repo.findOne({ where: { user_id, skill_id } }) || null;
  }

  async update(user_id: string, skill_id: string, data: UpdateFreelancerSkillDto): Promise<FreelancerSkill> {
    await this.repo.update({ user_id, skill_id }, data);
    return (await this.repo.findOne({ where: { user_id, skill_id } }))!;
  }

  async delete(user_id: string, skill_id: string): Promise<void> {
    await this.repo.delete({ user_id, skill_id });
  }
}