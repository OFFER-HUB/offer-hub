export const NOTIFICATION_QUEUE = 'notification-queue';

export enum NotificationType {
  SERVICE_BOOKED = 'service_booked',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  DISPUTE_UPDATED = 'dispute_updated',
  NEW_MESSAGE = 'new_message',
}

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
} 