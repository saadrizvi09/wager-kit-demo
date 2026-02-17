import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MarketsService } from './markets.service';
import { MarketCacheService } from './market-cache.service';

@Processor('market-processing')
export class MarketProcessor extends WorkerHost {
  private readonly logger = new Logger(MarketProcessor.name);

  constructor(
    private readonly marketsService: MarketsService,
    private readonly cacheService: MarketCacheService,
  ) {
    super();
  }

  async process(job: Job<{ slug: string }>): Promise<any> {
    const { slug } = job.data;
    this.logger.log(`Processing market: ${slug} (Job ${job.id})`);

    try {
      this.cacheService.setStatus(slug, 'processing');

      // Simulate heavy data fetching & integrity calculation
      // In production this would call real APIs
      await this.simulateWork(300);

      // Generate market detail (this does the heavy computation)
      const detail = this.marketsService.getMarketDetail(slug);

      if (!detail) {
        throw new Error(`Market ${slug} not found`);
      }

      // Calculate integrity score from the generated data
      const computedScore = this.marketsService.calculateIntegrityScore(detail, detail.oddsHistory);

      const enrichedDetail = {
        ...detail,
        integrityScore: computedScore,
        processedAt: new Date().toISOString(),
        jobId: job.id,
      };

      this.cacheService.setStatus(slug, 'ready', enrichedDetail);
      this.logger.log(`✓ Market ${slug} processed successfully (Score: ${computedScore.overall})`);

      return enrichedDetail;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.cacheService.setStatus(slug, 'error', undefined, msg);
      this.logger.error(`✗ Market ${slug} processing failed: ${msg}`);
      throw error;
    }
  }

  private simulateWork(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
