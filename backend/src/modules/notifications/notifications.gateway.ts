import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@WebSocketGateway({
  cors: {
    origin: true, // Allow all origins, including null origin from file:// protocol
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true
  },
  transports: ['websocket', 'polling']
})
@Injectable()
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);
  private userSocketMap = new Map<string, string[]>();

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    
    if (!userId) {
      this.logger.error('Client attempted to connect without userId');
      client.disconnect();
      return;
    }

    this.logger.log(`Client connected: ${client.id} for user: ${userId}`);
    
    // Map userId to socket id
    if (!this.userSocketMap.has(userId)) {
      this.userSocketMap.set(userId, []);
    }
    const socketIds = this.userSocketMap.get(userId);
    if (socketIds) {
      socketIds.push(client.id);
    }
    
    // Subscribe client to their personal room
    client.join(userId);
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    
    if (userId) {
      const socketIds = this.userSocketMap.get(userId) || [];
      const updatedSocketIds = socketIds.filter(id => id !== client.id);
      
      if (updatedSocketIds.length > 0) {
        this.userSocketMap.set(userId, updatedSocketIds);
      } else {
        this.userSocketMap.delete(userId);
      }
      
      this.logger.log(`Client disconnected: ${client.id} for user: ${userId}`);
    }
  }

  @SubscribeMessage('read-notification')
  handleReadNotification(client: Socket, notificationId: string) {
    const userId = client.handshake.query.userId as string;
    this.logger.log(`User ${userId} marked notification ${notificationId} as read`);
    return { event: 'notification-read', data: notificationId };
  }

  @SubscribeMessage('test-service-booked')
  handleTestServiceBooked(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; serviceTitle: string; freelancerId: string }
  ) {
    const notification = {
      id: uuidv4(),
      title: 'New Service Booked',
      content: `Your service "${data.serviceTitle}" has been booked successfully.`,
      type: 'SERVICE_BOOKED',
      createdAt: new Date().toISOString(),
      actionUrl: `/services/${data.freelancerId}`
    };

    this.notifyUser(data.userId, notification);
    return { success: true };
  }

  @SubscribeMessage('test-payment-confirmed')
  handleTestPaymentConfirmed(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; amount: number; serviceTitle: string }
  ) {
    const notification = {
      id: uuidv4(),
      title: 'Payment Confirmed',
      content: `Your payment of $${data.amount} for "${data.serviceTitle}" has been confirmed.`,
      type: 'PAYMENT_CONFIRMED',
      createdAt: new Date().toISOString(),
      actionUrl: '/payments'
    };

    this.notifyUser(data.userId, notification);
    return { success: true };
  }

  @SubscribeMessage('test-dispute-updated')
  handleTestDisputeUpdated(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userIds: string[]; disputeId: string; status: string }
  ) {
    const notification = {
      id: uuidv4(),
      title: 'Dispute Status Updated',
      content: `The status of dispute #${data.disputeId} has been updated to "${data.status}".`,
      type: 'DISPUTE_UPDATED',
      createdAt: new Date().toISOString(),
      actionUrl: `/disputes/${data.disputeId}`
    };

    this.notifyMany(data.userIds, notification);
    return { success: true };
  }

  notifyUser(userId: string, notification: any) {
    this.logger.log(`Sending notification to user ${userId}: ${JSON.stringify(notification)}`);
    this.server.to(userId).emit('notification', notification);
  }

  notifyMany(userIds: string[], notification: any) {
    userIds.forEach(userId => {
      this.notifyUser(userId, notification);
    });
  }
} 