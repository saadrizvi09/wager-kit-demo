import { Injectable } from '@nestjs/common';

// WagerKit internal data aggregation service

export interface MarketSource {
  name: string;
  type: 'regulated' | 'onchain';
}

export interface IntegrityScore {
  overall: number;
  marketClarity: number;
  liquidityDepth: number;
  crossSourceAgreement: number;
  volatilitySanity: number;
}

export interface OddsDataPoint {
  timestamp: string;
  polymarket: number;
  kalshi: number;
  predictit: number;
  wagerkit: number;
}

export interface MarketSummary {
  slug: string;
  title: string;
  tag: string;
  closesAt: string;
}

export interface SimulatedMetrics {
  /** Simulated raw tick frequency (production: from ClickHouse odds_tick) */
  ticksPerHour: number;
  /** Simulated 24-h trading volume in $K (production: sum(volume) from odds_tick) */
  dailyVolumeK: number;
  /** Metadata quality / data-completeness factor 0-1 (production: DB metadata checks) */
  dataCompleteness: number;
}

export interface MarketDetail extends MarketSummary {
  description: string;
  sources: MarketSource[];
  integrityScore: IntegrityScore;
  oddsHistory: OddsDataPoint[];
  notes: string[];
  resolutionCriteriaUrl: string;
  question: string;
  simulatedMetrics: SimulatedMetrics;
}

@Injectable()
export class MarketsService {
  private readonly marketsData: MarketDetail[] = [
    {
      slug: 'us_election_2024_winner',
      title: 'US 2024 Presidential Election - Winner',
      tag: 'election',
      closesAt: '11/6/2024',
      description: 'Who will win the 2024 United States presidential election? This market resolves to the candidate who wins the Electoral College majority.',
      question: 'Who will win the 2024 United States presidential election?',
      resolutionCriteriaUrl: 'https://wagerkit.xyz/resolution/us-election-2024',
      sources: [
        { name: 'PredictIt', type: 'regulated' },
        { name: 'Kalshi', type: 'regulated' },
        { name: 'Polymarket', type: 'onchain' },
        { name: 'WagerKit', type: 'onchain' },
      ],
      integrityScore: {
        overall: 84.0,
        marketClarity: 88,
        liquidityDepth: 82,
        crossSourceAgreement: 85,
        volatilitySanity: 81,
      },
      notes: ['Post-election convergence', 'Historical resolved market'],
      simulatedMetrics: { ticksPerHour: 52, dailyVolumeK: 1958, dataCompleteness: 0.949 },
      oddsHistory: [],
    },
    {
      slug: 'btc_halving_2024',
      title: 'BTC Halving 2024 - Price impact probability',
      tag: 'crypto',
      closesAt: '5/20/2024',
      description: 'Will Bitcoin price exceed $80,000 within 90 days of the April 2024 halving event?',
      question: 'Will Bitcoin price exceed $80,000 within 90 days of the April 2024 halving event?',
      resolutionCriteriaUrl: 'https://wagerkit.xyz/resolution/btc-halving-2024',
      sources: [
        { name: 'PredictIt', type: 'regulated' },
        { name: 'Kalshi', type: 'regulated' },
        { name: 'Polymarket', type: 'onchain' },
        { name: 'WagerKit', type: 'onchain' },
      ],
      integrityScore: {
        overall: 90.0,
        marketClarity: 92,
        liquidityDepth: 88,
        crossSourceAgreement: 91,
        volatilitySanity: 89,
      },
      notes: ['Post-halving stability', 'Historical resolved market'],
      simulatedMetrics: { ticksPerHour: 55, dailyVolumeK: 2200, dataCompleteness: 0.919 },
      oddsHistory: [],
    },
    {
      slug: 'us_cpi_yoy_nov_2025',
      title: 'US CPI YoY - Nov 2025 print',
      tag: 'macro',
      closesAt: '12/18/2025',
      description: 'Will the US CPI Year-over-Year figure for November 2025 come in above 3.0%?',
      question: 'Will the US CPI Year-over-Year figure for November 2025 come in above 3.0%?',
      resolutionCriteriaUrl: 'https://wagerkit.xyz/resolution/us-cpi-nov-2025',
      sources: [
        { name: 'PredictIt', type: 'regulated' },
        { name: 'Kalshi', type: 'regulated' },
        { name: 'Polymarket', type: 'onchain' },
        { name: 'WagerKit', type: 'onchain' },
      ],
      integrityScore: {
        overall: 73.0,
        marketClarity: 76,
        liquidityDepth: 71,
        crossSourceAgreement: 74,
        volatilitySanity: 71,
      },
      notes: ['Post-release convergence', 'Historical resolved market'],
      simulatedMetrics: { ticksPerHour: 38, dailyVolumeK: 1855, dataCompleteness: 0.770 },
      oddsHistory: [],
    },
  ];

  /**
   * Integrity Score Formula (mirrors production IntegrityWorker):
   * Score = 100 × (0.40×C + 0.30×L + 0.20×A + 0.10×V)
   *
   * C = Market Clarity:  min(1, base × dataCompleteness)
   *     base = 0.5*(hasUrl) + graduated_source_score + graduated_question_score
   * L = Liquidity Depth:  0.40×frequencyScore + 0.40×volumeScore + 0.20×sourceScore
   * A = Cross-Source Agreement: max(0, 1 − min(1, avgPairwiseRMSE / θ)),  θ = 0.10
   * V = Volatility Sanity:  0.70×(1 − avgNormStdDev) + 0.30×spikeScore
   */
  calculateIntegrityScore(market: MarketDetail, oddsHistory: OddsDataPoint[]): IntegrityScore {
    const metrics = market.simulatedMetrics;

    // ── C: Market Clarity ──────────────────────────────────────────────
    // Production: calculateClarity(market, sourceCount)
    //   = min(1, 0.5*(hasUrl) + graduated_source + graduated_question) × dataCompleteness
    let clarityBase = 0;
    if (market.resolutionCriteriaUrl) clarityBase += 0.5;
    // Graduated source score: 1→0 … 4+→0.30
    clarityBase += Math.min(0.3, ((Math.min(market.sources.length, 4) - 1) / 3) * 0.3);
    // Question specificity: graduated by length (20→0, 80+→0.20)
    const qLen = market.question?.length || 0;
    clarityBase += Math.min(0.2, Math.max(0, (qLen - 20) / 300));
    // dataCompleteness from per-market simulated metrics (production: DB metadata quality)
    const clarity = Math.min(1, clarityBase * metrics.dataCompleteness);

    // ── L: Liquidity Depth ─────────────────────────────────────────────
    // Production: 0.4×freq + 0.4×vol + 0.2×src  (real tick data from ClickHouse odds_tick)
    // Uses per-market simulated tick metrics instead of chart-point density.
    const frequencyScore = Math.min(1, metrics.ticksPerHour / 60);
    const volumeScore = Math.min(1, metrics.dailyVolumeK / 2500);
    const sourceScore = Math.min(1, market.sources.length / 5);
    const liquidity = Math.max(0.1, Math.min(1,
      0.4 * frequencyScore + 0.4 * volumeScore + 0.2 * sourceScore,
    ));

    // ── A: Cross-Source Agreement ──────────────────────────────────────
    // Production: max(0, 1 − min(1, RMSE / θ)),  θ = 0.10
    // Average pairwise RMSE across all source combinations.
    const sourceKeys = ['polymarket', 'kalshi', 'predictit', 'wagerkit'] as const;
    let agreement = 0.5;
    if (oddsHistory.length > 0 && market.sources.length >= 2) {
      let totalRmse = 0;
      let pairCount = 0;
      for (let i = 0; i < sourceKeys.length; i++) {
        for (let j = i + 1; j < sourceKeys.length; j++) {
          let sumSqDiff = 0;
          for (const point of oddsHistory) {
            sumSqDiff += Math.pow(point[sourceKeys[i]] - point[sourceKeys[j]], 2);
          }
          totalRmse += Math.sqrt(sumSqDiff / oddsHistory.length);
          pairCount++;
        }
      }
      const avgRmse = totalRmse / pairCount;
      const theta = 0.1;
      agreement = Math.max(0, 1 - Math.min(1, avgRmse / theta));
    }

    // ── V: Volatility Sanity ──────────────────────────────────────────
    // Production: 0.70×(1 − normStdDev) + 0.30×spikeScore
    // Per-source analysis (matching production per-mapping pattern).
    let volatility = 0.5;
    if (oddsHistory.length > 1) {
      let totalNormStdDev = 0;
      let totalSpikes = 0;
      let totalTicks = 0;

      for (const key of sourceKeys) {
        const prices = oddsHistory.map((p) => p[key]);
        const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
        const stdDev = Math.sqrt(
          prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length,
        );
        totalNormStdDev += Math.min(1, stdDev / 0.1);

        // Spike detection: >10 % relative change between consecutive ticks
        for (let i = 1; i < prices.length; i++) {
          const relChange = Math.abs((prices[i] - prices[i - 1]) / prices[i - 1]);
          if (relChange > 0.1) totalSpikes++;
          totalTicks++;
        }
      }

      const avgNormStdDev = totalNormStdDev / sourceKeys.length;
      const spikeRate = totalTicks > 0 ? totalSpikes / totalTicks : 0;
      const spikeScore = Math.max(0, 1 - spikeRate * 2);

      volatility = 0.7 * (1 - avgNormStdDev) + 0.3 * spikeScore;
      volatility = Math.max(0.1, Math.min(1, volatility));
    }

    // ── Overall: 100 × (0.40×C + 0.30×L + 0.20×A + 0.10×V) ──────────
    const overall = 100 * (0.4 * clarity + 0.3 * liquidity + 0.2 * agreement + 0.1 * volatility);

    return {
      overall: Math.round(overall * 10) / 10,
      marketClarity: Math.round(clarity * 100),
      liquidityDepth: Math.round(liquidity * 100),
      crossSourceAgreement: Math.round(agreement * 100),
      volatilitySanity: Math.round(volatility * 100),
    };
  }

  private generateOddsHistory(slug: string): OddsDataPoint[] {
    const points: OddsDataPoint[] = [];
    const now = new Date();

    // Per-market odds config — trend/cosAmp control wave amplitude,
    // vol controls random noise, offsets control per-source spread.
    // Tighter params for resolved/post-event markets mirror production convergence.
    const seeds: Record<string, {
      base: number; trend: number; cosAmp: number;
      vol: number; offsets: [number, number, number, number];
    }> = {
      us_election_2024_winner: {
        base: 0.55, trend: 0.035, cosAmp: 0.017, vol: 0.008,
        offsets: [0, 0.014, -0.011, 0.007],
      },
      btc_halving_2024: {
        base: 0.72, trend: 0.02, cosAmp: 0.01, vol: 0.004,
        offsets: [0, 0.009, -0.007, 0.004],
      },
      us_cpi_yoy_nov_2025: {
        base: 0.62, trend: 0.055, cosAmp: 0.028, vol: 0.011,
        offsets: [0, 0.024, -0.019, 0.014],
      },
    };

    const config = seeds[slug] || {
      base: 0.5, trend: 0.05, cosAmp: 0.02, vol: 0.008,
      offsets: [0, 0.005, -0.003, 0.002] as [number, number, number, number],
    };

    // Deterministic pseudo-random based on slug hash
    const hashCode = (s: string) => {
      let h = 0;
      for (let i = 0; i < s.length; i++) {
        h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
      }
      return h;
    };
    let seed = Math.abs(hashCode(slug));
    const pseudoRandom = () => {
      seed = (seed * 16807 + 0) % 2147483647;
      return (seed & 0xfffffff) / 0x10000000;
    };

    for (let i = 0; i < 96; i++) {
      const time = new Date(now.getTime() - (95 - i) * 15 * 60 * 1000);
      const t = i / 96;

      // Base trend with wave patterns (cosAmp now per-market)
      const base =
        config.base +
        config.trend * Math.sin(t * Math.PI * 2.5) +
        config.cosAmp * Math.cos(t * Math.PI * 5);

      // Per-source variation using configured offsets & noise
      const polymarket = Math.max(0.01, Math.min(0.99,
        base + config.offsets[0] + (pseudoRandom() - 0.5) * config.vol * 2,
      ));
      const kalshi = Math.max(0.01, Math.min(0.99,
        base + config.offsets[1] + (pseudoRandom() - 0.5) * config.vol * 2,
      ));
      const predictit = Math.max(0.01, Math.min(0.99,
        base + config.offsets[2] + (pseudoRandom() - 0.5) * config.vol * 2,
      ));
      const wk = Math.max(0.01, Math.min(0.99,
        base + config.offsets[3] + (pseudoRandom() - 0.5) * config.vol * 2,
      ));

      points.push({
        timestamp: time.toISOString(),
        polymarket: Math.round(polymarket * 10000) / 10000,
        kalshi: Math.round(kalshi * 10000) / 10000,
        predictit: Math.round(predictit * 10000) / 10000,
        wagerkit: Math.round(wk * 10000) / 10000,
      });
    }

    return points;
  }

  getMarkets(): MarketSummary[] {
    return this.marketsData.map(({ slug, title, tag, closesAt }) => ({
      slug,
      title,
      tag,
      closesAt,
    }));
  }

  getMarketDetail(slug: string): MarketDetail | null {
    const market = this.marketsData.find((m) => m.slug === slug);
    if (!market) return null;

    const oddsHistory = this.generateOddsHistory(slug);

    // Use pre-configured scores for demo consistency
    // In production, these would be calculated from real DOME API data:
    // const computedScore = this.calculateIntegrityScore(market, oddsHistory);

    return {
      ...market,
      oddsHistory,
    };
  }

  getOddsHistoryCsv(slug: string): string | null {
    const market = this.marketsData.find((m) => m.slug === slug);
    if (!market) return null;

    const oddsHistory = this.generateOddsHistory(slug);
    const header = 'Timestamp,Polymarket,Kalshi,PredictIt,WagerKit\n';
    const rows = oddsHistory
      .map(
        (p) =>
          `${p.timestamp},${p.polymarket},${p.kalshi},${p.predictit},${p.wagerkit}`,
      )
      .join('\n');

    return header + rows;
  }

  getIntegrityCsv(slug: string): string | null {
    const market = this.marketsData.find((m) => m.slug === slug);
    if (!market) return null;

    const score = market.integrityScore;
    const header = 'Metric,Value,Weight\n';
    const rows = [
      `Overall Score,${score.overall},100%`,
      `Market Clarity,${score.marketClarity}%,40%`,
      `Liquidity Depth,${score.liquidityDepth}%,30%`,
      `Cross-Source Agreement,${score.crossSourceAgreement}%,20%`,
      `Volatility Sanity,${score.volatilitySanity}%,10%`,
    ].join('\n');

    return header + rows;
  }

  getDossierJson(slug: string): object | null {
    const detail = this.getMarketDetail(slug);
    if (!detail) return null;

    return {
      generatedAt: new Date().toISOString(),
      platform: 'WagerKit',
      market: {
        title: detail.title,
        slug: detail.slug,
        description: detail.description,
        tag: detail.tag,
        closesAt: detail.closesAt,
        question: detail.question,
      },
      integrityScore: detail.integrityScore,
      sources: detail.sources,
      notes: detail.notes,
      oddsHistory: detail.oddsHistory,
    };
  }
}
