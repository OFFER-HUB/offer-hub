import { Module } from '@nestjs/common';
import { ElasticsearchModule, ElasticsearchService } from '@nestjs/elasticsearch';

@Module({
  imports: [
    ElasticsearchModule.register({
      node: 'http://localhost:9200', // Change if your ES setup is different
    }),
  ],
  providers: [ElasticsearchService],
  exports: [ElasticsearchService],
})
export class CustomElasticsearchModule {}
