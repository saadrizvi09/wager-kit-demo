import { Injectable, Logger } from '@nestjs/common';

export interface CachedMarketData {
  slug: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
  data?: any;
  updatedAt?: string;
  error?: string;
}

@Injectable()
export class MarketCacheService {
  private readonly logger = new Logger(MarketCacheService.name);
  private cache = new Map<string, CachedMarketData>();

  setStatus(slug: string, status: CachedMarketData['status'], data?: any, error?: string) {
    const entry: CachedMarketData = {
      slug,
      status,
      data: data || this.cache.get(slug)?.data,
      updatedAt: new Date().toISOString(),
      error,
    };
    this.cache.set(slug, entry);
    this.logger.log(`Cache [${slug}] → ${status}`);
  }

  get(slug: string): CachedMarketData | undefined {
    return this.cache.get(slug);
  }

  getAll(): CachedMarketData[] {
    return Array.from(this.cache.values());
  }

  isReady(slug: string): boolean {
    const entry = this.cache.get(slug);
    return entry?.status === 'ready';
  }
}
