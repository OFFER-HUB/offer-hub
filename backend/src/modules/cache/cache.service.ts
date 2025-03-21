import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getCachedData(key: string) {
    return this.cacheManager.get(key);
  }

  async setCachedData(key: string, value: any, ttl: number = 600) {
    await this.cacheManager.set(key, value, ttl);
  }

  async deleteCachedData(key: string) {
    await this.cacheManager.del(key);
  }

  async clearAllCachedData() {
    await this.cacheManager.clear();
  }

  async testRedis() {
    await this.cacheManager.set('test_key', 'Hello, Redis!',  600 );
    const value = await this.cacheManager.get('test_key');
    console.log('Redis Test Value:', value);
  }
  
}
