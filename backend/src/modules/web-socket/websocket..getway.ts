import { WebSocketGateway, SubscribeMessage, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CacheService } from '../cache/cache.service';

@WebSocketGateway()
export class WebSocketGatewayService {
  @WebSocketServer()
  server: Server;

  constructor(private readonly cacheService: CacheService) {}

  @SubscribeMessage('fetch_data')
  async handleFetchData(client: any, query: string) {
    const cacheKey = `realtime:${query}`;
    let data = await this.cacheService.getCachedData(cacheKey);

    if (!data) {
      data = { message: `Fresh data for ${query}` }; // Simulate fetching real-time data
      await this.cacheService.setCachedData(cacheKey, data, 300);
    }

    client.emit('receive_data', data);
  }

  async handleConnection(client: Socket) {
    await this.cacheService.setCachedData(`ws:${client.id}`, true, 600);
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    await this.cacheService.deleteCachedData(`ws:${client.id}`);
    console.log(`Client disconnected: ${client.id}`);
  }
  
}

