import "reflect-metadata";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Project } from "../entities/project.entity";
import { CreateProjectDTO, UpdateProjectDTO } from "../dtos/project.dto";
import { ProjectStatus } from "../entities/project.entity";

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>
  ) {}

  async create(createProjectDto: CreateProjectDTO): Promise<Project> {
    const project = this.projectRepository.create(createProjectDto);
    return await this.projectRepository.save(project);
  }

  async findAll(): Promise<Project[]> {
    return await this.projectRepository.find();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { project_id: id } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async findByStatus(status: ProjectStatus): Promise<Project[]> {
    return await this.projectRepository.find({ where: { status } });
  }

  async update(id: string, updateProjectDto: UpdateProjectDTO): Promise<Project> {
    const project = await this.findOne(id);
    Object.assign(project, updateProjectDto);
    return await this.projectRepository.save(project);
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }

  async countProjectsByStatus(status: ProjectStatus): Promise<number> {
    return await this.projectRepository.count({ where: { status } });
  }

  async getLatestProjects(limit: number): Promise<Project[]> {
    return await this.projectRepository.find({
      order: { created_at: "DESC" },
      take: limit,
    });
  }
}
