import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogsModule } from './activity-logs.module';
import { RatingsModule } from './ratings.module';
import { ActivityLogs } from './entities';
import { Rating } from './entities/ratings.entity';
import { SkillsModule } from './skills.module';
import { Skill } from './entities/skills.entity';
import { UserAchievement } from './entities/user-achievements.entity';
import { UserAchievementsModule } from './user-achievements.module';
import { CategoryModule } from './category.module';
import { Category } from './entities/categories.entity';
// Commented out since the files do not exist
// import { User } from './entities/user.entity';
// import { Project } from './entities/project.entity';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'admin',
      database: 'offerhub',
      entities: [ActivityLogs, Rating, UserAchievement, Category, Skill],
      synchronize: true,
    }),
    ActivityLogsModule, RatingsModule,UserAchievementsModule, CategoryModule, SkillsModule
  ],
})
export class AppModule { }
