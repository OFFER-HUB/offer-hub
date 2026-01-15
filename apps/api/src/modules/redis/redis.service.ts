import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;

    constructor() {
        this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

        this.client.on('error', (error) => {
            console.warn('[Redis] Connection error:', error.message);
        });
    }

    async get(key: string): Promise<string | null> {
        return await this.client.get(key);
    }

    async set(key: string, value: string, ...args: any[]): Promise<string | null> {
        // @ts-ignore
        return await this.client.set(key, value, ...args);
    }

    async del(key: string): Promise<number> {
        return await this.client.del(key);
    }

    onModuleInit() { }

    async onModuleDestroy() {
        await this.client.quit();
    }
}
