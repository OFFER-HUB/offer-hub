import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { validate } from "class-validator";
import { Repository } from "typeorm";
import { CreateSkillDto, UpdateSkillDto } from "../dtos/skills.dto";
import { Skill } from "../entities/skills.entity";

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(Skill)
    private readonly repo: Repository<Skill>
  ) {}

  async create(skillData: CreateSkillDto) {
    const errors = await validate(skillData);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
    const skill = await this.repo.create(skillData);

    return this.repo.save(skill);
  }

  async findById(id: string) {
    const skill = await this.repo.findOne({ where: { skill_id: id } });
    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found.`);
    }
    return skill;
  }

  async findAll() {
    return this.repo.find();
  }

  async update(id: string, data: UpdateSkillDto) {
    const skill = await this.findById(id);
    Object.assign(skill, data);

    return this.repo.save(skill);
  }

  async remove(id: string) {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Skill with ID ${id} not found.`);
    }

    return this.repo.delete(id);
  }
}
