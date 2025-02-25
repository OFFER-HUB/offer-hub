import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Skill } from "./entities/skills.entity";
import { SkillsController } from "./controllers/skills.controller";
import { SkillService } from "./services/skills.service";

@Module({
    imports: [ TypeOrmModule.forFeature([ Skill ])],
    controllers: [ SkillsController ],
    providers: [ SkillService ]
})
export class SkillsModule {}
