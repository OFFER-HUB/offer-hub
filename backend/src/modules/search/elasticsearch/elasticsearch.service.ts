import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class CustomElasticsearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async searchIndex(index: string, query: any) {
    return await this.elasticsearchService.search({
      index,
      body: query,
    });
  }
}
