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

    getClient(): Redis {
        return this.client;
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

    async incr(key: string): Promise<number> {
        return await this.client.incr(key);
    }

    async expire(key: string, seconds: number): Promise<number> {
        return await this.client.expire(key, seconds);
    }

    async ttl(key: string): Promise<number> {
        return await this.client.ttl(key);
    }

    // Sorted Set operations for event log
    async zadd(key: string, score: number, member: string): Promise<number | string> {
        return await this.client.zadd(key, score, member);
    }

    async zrangeByScore(key: string, min: number | string, max: number | string): Promise<string[]> {
        return await this.client.zrangebyscore(key, min, max);
    }

    async zremRangeByRank(key: string, start: number, stop: number): Promise<number> {
        return await this.client.zremrangebyrank(key, start, stop);
    }

    async zcard(key: string): Promise<number> {
        return await this.client.zcard(key);
    }

    onModuleInit() { }

    async onModuleDestroy() {
        await this.client.quit();
    }
}
