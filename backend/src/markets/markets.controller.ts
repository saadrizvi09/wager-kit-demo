import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Res,
  Inject,
  Optional,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { MarketsService } from './markets.service';
import { MarketCacheService } from './market-cache.service';

@Controller('markets')
export class MarketsController {
  private readonly marketQueue: any;

  constructor(
    private readonly marketsService: MarketsService,
    private readonly cacheService: MarketCacheService,
    @Optional() @Inject('BullQueue_market-processing') marketQueue?: any,
  ) {
    this.marketQueue = marketQueue || null;
  }

  @Get()
  getMarkets(@Query('q') query?: string) {
    if (query && query.trim().length > 0) {
      return this.marketsService.searchMarkets(query);
    }
    const markets = this.marketsService.getMarkets();
    // Enrich with processing status
    return markets.map((m) => {
      const cached = this.cacheService.get(m.slug);
      return {
        ...m,
        processingStatus: cached?.status || 'unknown',
      };
    });
  }

  @Post('search')
  searchMarket(@Body('query') query: string) {
    if (!query || query.trim().length < 2) {
      return { error: 'Query must be at least 2 characters' };
    }
    const detail = this.marketsService.searchOrCreateMarket(query.trim());
    return detail;
  }

  @Get('jobs/status')
  getJobsStatus() {
    const all = this.cacheService.getAll();
    return {
      markets: all.map((c) => ({
        slug: c.slug,
        status: c.status,
        updatedAt: c.updatedAt,
        error: c.error,
      })),
      summary: {
        total: all.length,
        ready: all.filter((c) => c.status === 'ready').length,
        processing: all.filter((c) => c.status === 'processing').length,
        pending: all.filter((c) => c.status === 'pending').length,
        error: all.filter((c) => c.status === 'error').length,
      },
    };
  }

  @Post(':slug/refresh')
  async refreshMarket(@Param('slug') slug: string) {
    const market = this.marketsService.getMarkets().find((m) => m.slug === slug);
    if (!market) {
      throw new NotFoundException('Market not found');
    }
    if (this.marketQueue) {
      this.cacheService.setStatus(slug, 'pending');
      await this.marketQueue.add(
        'process-market',
        { slug },
        { removeOnComplete: 100, removeOnFail: 50 },
      );
      return { message: 'Market refresh queued', slug, status: 'pending' };
    }
    return { message: 'Market data refreshed (no queue)', slug, status: 'ready' };
  }

  @Get(':slug')
  getMarketDetail(@Param('slug') slug: string) {
    // Return cached data if available (processed by BullMQ worker)
    const cached = this.cacheService.get(slug);
    if (cached?.status === 'ready' && cached.data) {
      return {
        ...cached.data,
        fromCache: true,
        processingStatus: 'ready',
      };
    }

    // Try to get the market detail (works for both hardcoded + dynamic)
    const market = this.marketsService.getMarketDetail(slug);
    if (!market) {
      throw new NotFoundException('Market not found');
    }
    return {
      ...market,
      fromCache: false,
      processingStatus: cached?.status || 'not-queued',
    };
  }

  @Get(':slug/export/odds-csv')
  exportOddsCsv(@Param('slug') slug: string, @Res() res: Response) {
    const csv = this.marketsService.getOddsHistoryCsv(slug);
    if (!csv) {
      throw new NotFoundException('Market not found');
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=odds_history_${slug}.csv`,
    );
    res.send(csv);
  }

  @Get(':slug/export/integrity-csv')
  exportIntegrityCsv(@Param('slug') slug: string, @Res() res: Response) {
    const csv = this.marketsService.getIntegrityCsv(slug);
    if (!csv) {
      throw new NotFoundException('Market not found');
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=integrity_${slug}.csv`,
    );
    res.send(csv);
  }

  @Get(':slug/export/dossier-json')
  exportDossierJson(@Param('slug') slug: string) {
    const dossier = this.marketsService.getDossierJson(slug);
    if (!dossier) {
      throw new NotFoundException('Market not found');
    }
    return dossier;
  }
}
