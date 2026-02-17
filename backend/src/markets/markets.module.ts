import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MarketsService } from './markets.service';
import { MarketsController } from './markets.controller';
import { MarketProcessor } from './market.processor';
import { MarketCacheService } from './market-cache.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'market-processing',
    }),
  ],
  controllers: [MarketsController],
  providers: [MarketsService, MarketProcessor, MarketCacheService],
})
export class MarketsModule implements OnModuleInit {
  constructor(
    @InjectQueue('market-processing') private readonly marketQueue: Queue,
    private readonly marketsService: MarketsService,
    private readonly cacheService: MarketCacheService,
  ) {}

  async onModuleInit() {
    // Pre-process all markets on startup so dashboard loads instantly
    const markets = this.marketsService.getMarkets();
    for (const market of markets) {
      this.cacheService.setStatus(market.slug, 'pending');
      await this.marketQueue.add(
        'process-market',
        { slug: market.slug },
        {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        },
      );
    }
    console.log(`[WagerKit] Queued ${markets.length} markets for background processing`);
  }
}
