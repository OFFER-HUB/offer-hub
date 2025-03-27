import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { NotificationsController } from './controller';
import { NotificationsService } from './service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationProcessor } from './notification.processor';
import { Notification } from './entity';
import { User } from '../users/entity';
import { NOTIFICATION_QUEUE } from './notification.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User]),
    BullModule.registerQueue({
      name: NOTIFICATION_QUEUE,
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway, NotificationProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
