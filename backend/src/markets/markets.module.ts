import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MarketsService } from './markets.service';
import { MarketsController } from './markets.controller';
import { MarketProcessor } from './market.processor';
import { MarketCacheService } from './market-cache.service';

const redisAvailable = process.env.REDIS_HOST || process.env.ENABLE_REDIS === 'true';

const bullImports = redisAvailable
  ? [BullModule.registerQueue({ name: 'market-processing' })]
  : [];

const bullProviders = redisAvailable ? [MarketProcessor] : [];

@Module({
  imports: [...bullImports],
  controllers: [MarketsController],
  providers: [MarketsService, MarketCacheService, ...bullProviders],
})
export class MarketsModule implements OnModuleInit {
  constructor(
    private readonly marketsService: MarketsService,
    private readonly cacheService: MarketCacheService,
  ) {}

  async onModuleInit() {
    // Pre-set all markets as ready (no queue needed without Redis)
    const markets = this.marketsService.getMarkets();
    for (const market of markets) {
      this.cacheService.setStatus(market.slug, 'ready');
    }
    console.log(`[WagerKit] Initialized ${markets.length} markets (Redis: ${redisAvailable ? 'connected' : 'skipped'})`);
  }
}
