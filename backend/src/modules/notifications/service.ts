import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CreateNotificationDto, UpdateNotificationDto } from './dto';
import { Notification } from './entity';
import { User } from '../users/entity';
import { NOTIFICATION_QUEUE, NotificationPayload, NotificationType } from './notification.constants';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private readonly repo: Repository<Notification>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectQueue(NOTIFICATION_QUEUE) private readonly notificationQueue: Queue,
  ) {}

  async findAll(): Promise<Notification[]> {
    return this.repo.find({ relations: ['user'] });
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    return this.repo.find({
      where: { user: { user_id: userId } },
      order: { created_at: 'DESC' },
    });
  }

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const user = await this.userRepo.findOne({ where: { user_id: dto.user_id } });
    if (!user) throw new NotFoundException(`User with ID ${dto.user_id} not found.`);

    const notification = this.repo.create({ ...dto, user });
    return this.repo.save(notification);
  }

  async findById(notification_id: string): Promise<Notification> {
    const notification = await this.repo.findOne({ where: { notification_id }, relations: ['user'] });
    if (!notification) throw new NotFoundException(`Notification with ID ${notification_id} not found.`);
    return notification;
  }

  async update(notification_id: string, dto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findById(notification_id);
    Object.assign(notification, dto);
    return this.repo.save(notification);
  }

  async markAsRead(notification_id: string): Promise<Notification> {
    const notification = await this.findById(notification_id);
    notification.read = true;
    return this.repo.save(notification);
  }

  async delete(notification_id: string): Promise<void> {
    const result = await this.repo.delete(notification_id);
    if (result.affected === 0) throw new NotFoundException(`Notification with ID ${notification_id} not found.`);
  }

  // Queue a notification to be sent
  async queueNotification(payload: NotificationPayload): Promise<void> {
    await this.notificationQueue.add('send-notification', payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000, // 5 seconds
      },
    });
  }

  // Helper methods for common notification types
  async notifyServiceBooked(userId: string, serviceTitle: string, freelancerId: string): Promise<void> {
    await this.queueNotification({
      userId: freelancerId,
      type: NotificationType.SERVICE_BOOKED,
      title: 'New Service Request',
      content: `Your service "${serviceTitle}" has been booked by a client.`,
      actionUrl: `/services/bookings`,
      metadata: { serviceTitle, clientId: userId },
    });
  }

  async notifyPaymentConfirmed(userId: string, amount: number, serviceTitle: string): Promise<void> {
    await this.queueNotification({
      userId,
      type: NotificationType.PAYMENT_CONFIRMED,
      title: 'Payment Confirmed',
      content: `Your payment of $${amount.toFixed(2)} for "${serviceTitle}" has been confirmed.`,
      actionUrl: '/transactions',
      metadata: { amount, serviceTitle },
    });
  }

  async notifyDisputeUpdated(disputeId: string, status: string, userIds: string[]): Promise<void> {
    for (const userId of userIds) {
      await this.queueNotification({
        userId,
        type: NotificationType.DISPUTE_UPDATED,
        title: 'Dispute Status Updated',
        content: `Your dispute (ID: ${disputeId}) has been updated to: ${status}`,
        actionUrl: `/disputes/${disputeId}`,
        metadata: { disputeId, status },
      });
    }
  }
}
