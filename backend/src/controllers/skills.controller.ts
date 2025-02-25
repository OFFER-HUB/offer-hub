import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { SkillService } from "../services/skills.service";
import { CreateSkillDto, UpdateSkillDto } from "../dtos/skills.dto";

@Controller("skills")
export class SkillsController {
  constructor(private readonly service: SkillService) {}

  @Post()
  async create(@Body() dto: CreateSkillDto) {
    return await this.service.create(dto);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.service.findById(id);
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateSkillDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
