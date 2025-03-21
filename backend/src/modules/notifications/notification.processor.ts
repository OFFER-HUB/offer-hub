import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { NotificationsService } from './service';
import { NotificationsGateway } from './notifications.gateway';
import { NOTIFICATION_QUEUE, NotificationPayload } from './notification.constants';

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  @Process('send-notification')
  async handleSendNotification(job: Job<NotificationPayload>) {
    this.logger.debug(`Processing notification job ${job.id} for user ${job.data.userId}`);
    
    try {
      // Store the notification in the database
      const notification = await this.notificationsService.create({
        user_id: job.data.userId,
        type: job.data.type,
        title: job.data.title,
        content: job.data.content,
        action_url: job.data.actionUrl,
        read: false,
      });

      // Send real-time notification through WebSockets
      this.notificationsGateway.notifyUser(job.data.userId, {
        id: notification.notification_id,
        type: notification.type,
        title: notification.title,
        content: notification.content,
        actionUrl: notification.action_url,
        createdAt: notification.created_at,
        metadata: job.data.metadata,
      });

      this.logger.debug(`Notification ${notification.notification_id} processed successfully`);
      return notification;
    } catch (error) {
      this.logger.error(`Failed to process notification: ${error.message}`, error.stack);
      throw error;
    }
  }
} 