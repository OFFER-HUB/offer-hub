import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { CustomElasticsearchService } from './elasticsearch/elasticsearch.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly elasticsearchService: CustomElasticsearchService,
  ) {}

  async search(query: string) {
    const cacheKey = `search:${query}`;
    const cachedResult = await this.cacheService.getCachedData(cacheKey);

    if (cachedResult) {
      console.log('Returning cached result...');
      return cachedResult;
    }

    console.log('Querying ElasticSearch...');
    const result = await this.elasticsearchService.searchIndex('your_index', {
      query: {
        match: { title: query },
      },
    });

    const formattedResult = result.hits.hits.map((hit) => hit._source);

    // Store result in Redis for future queries
    await this.cacheService.setCachedData(cacheKey, formattedResult, 600);

    return formattedResult;
  }
}
