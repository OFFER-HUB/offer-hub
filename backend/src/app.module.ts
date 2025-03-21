import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { BullModule } from '@nestjs/bull';

config(); // Load .env file

//=======================================
//               Entities
//=======================================
import { Achievement } from './modules/achievements/entity';
import { ActivityLogs } from './modules/activity-logs/entity';
import { AuthLog } from './modules/auth-logs/entity';
import { Category } from './modules/categories/entity';
import { Certification } from './modules/certifications/entity';
import { Conversation } from './modules/conversations/entity';
import { ConversationParticipant } from './modules/conversation-participants/entity';
import { FreelancerSkill } from './modules/freelancer-skills/entity';
import { Message } from './modules/messages/entity';
import { Notification } from './modules/notifications/entity';
import { PortfolioItem } from './modules/portfolio-items/entity';
import { Project } from './modules/projects/entity';
import { Rating } from './modules/ratings/entity';
import { Skill } from './modules/skills/entity';
import { Transaction } from './modules/transactions/entity';
import { User } from './modules/users/entity';
import { UserAchievement } from './modules/user-achievements/entity';
import { UserProfile } from './modules/user-profiles/entity';
import { Service } from './modules/services/entity';
import { ServiceCategory } from './modules/service-categories/entity';

//=======================================
//               Modules
//=======================================
import { ActivityLogsModule } from './modules/activity-logs/module';
import { AuthLogsModule } from './modules/auth-logs/module';
import { CategoriesModule } from './modules/categories/module';
import { CertificationsModule } from './modules/certifications/module';
import { ConversationsModule } from './modules/conversations/module';
import { ConversationParticipantsModule } from './modules/conversation-participants/module';
import { FreelancerSkillsModule } from './modules/freelancer-skills/module';
import { MessagesModule } from './modules/messages/module';
import { NotificationsModule } from './modules/notifications/module';
import { PortfolioItemsModule } from './modules/portfolio-items/module';
import { ProjectsModule } from './modules/projects/module';
import { RatingsModule } from './modules/ratings/module';
import { SkillsModule } from './modules/skills/module';
import { TransactionsModule } from './modules/transactions/module';
import { UsersModule } from './modules/users/module';
import { UserAchievementsModule } from './modules/user-achievements/module';
import { UserProfileModule } from './modules/user-profiles/module';
import { AchievementsModule } from './modules/achievements/module';
import { ServicesModule } from './modules/services/module';
import { ServiceCategoriesModule } from './modules/service-categories/module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || (process.env.DOCKER_ENV ? 'offer_hub_database' : 'localhost'),
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'offerhub_admin',
      password: process.env.DATABASE_PASSWORD || 'offerhub_pass',
      database: process.env.DATABASE_NAME || 'offer_hub_database',
      entities: [
        Achievement,
        ActivityLogs,
        AuthLog,
        Category,
        Certification,
        Conversation,
        ConversationParticipant,
        FreelancerSkill,
        Message,
        Notification,
        PortfolioItem,
        Project,
        Rating,
        Skill,
        Transaction,
        User,
        UserAchievement,
        UserProfile,
        Service,
        ServiceCategory,
      ],
      synchronize: true,
      autoLoadEntities: true,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || (process.env.DOCKER_ENV ? 'offer_hub_redis' : 'localhost'),
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    ActivityLogsModule,
    AuthLogsModule,
    CategoriesModule,
    CertificationsModule,
    ConversationsModule,
    ConversationParticipantsModule,
    FreelancerSkillsModule,
    MessagesModule,
    NotificationsModule,
    PortfolioItemsModule,
    ProjectsModule,
    RatingsModule,
    SkillsModule,
    TransactionsModule,
    UsersModule,
    UserAchievementsModule,
    UserProfileModule,
    AchievementsModule,
    ServicesModule,
    ServiceCategoriesModule,
  ],
})
export class AppModule {}
