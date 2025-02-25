import { CreateFreelancerSkillDto, UpdateFreelancerSkillDto } from '@/dtos/freelancer-skills.dto';
import { FreelancerSkillsRepository } from '@/repositories/freelancer-skills.repository';

export class FreelancerSkillsService {
  private repository: FreelancerSkillsRepository;

  constructor() {
    this.repository = new FreelancerSkillsRepository();
  }

  async create(dto: CreateFreelancerSkillDto) {
    return await this.repository.create(dto);
  }

  async getAll() {
    return await this.repository.findAll();
  }

  async getById(user_id: string, skill_id: string) {
    return await this.repository.findById(user_id, skill_id);
  }

  async update(user_id: string, skill_id: string, dto: UpdateFreelancerSkillDto) {
    return await this.repository.update(user_id, skill_id, dto);
  }

  async delete(user_id: string, skill_id: string) {
    await this.repository.delete(user_id, skill_id);
  }
}