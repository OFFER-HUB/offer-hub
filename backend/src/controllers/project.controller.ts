import "reflect-metadata";
import { Controller, Get, Post, Body, Put, Param, Delete } from "@nestjs/common";
import { ProjectService } from "../services/project.service";
import { CreateProjectDTO, UpdateProjectDTO } from "../dtos/project.dto";
import { Project } from "../entities/project.entity";

@Controller("projects")

export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDTO): Promise<Project> {
    return await this.projectService.create(createProjectDto);
  }

  @Get()
  async findAll(): Promise<Project[]> {
    return await this.projectService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<Project> {
    return await this.projectService.findOne(id);
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() updateProjectDto: UpdateProjectDTO): Promise<Project> {
    return await this.projectService.update(id, updateProjectDto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string): Promise<void> {
    return await this.projectService.remove(id);
  }
}
