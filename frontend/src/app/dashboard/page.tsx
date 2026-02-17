'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getMarkets } from '@/lib/api';

interface MarketSummary {
  slug: string;
  title: string;
  tag: string;
  closesAt: string;
  processingStatus?: 'pending' | 'processing' | 'ready' | 'error' | 'unknown';
}

export default function DashboardPage() {
  const router = useRouter();
  const [markets, setMarkets] = useState<MarketSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMarkets()
      .then(setMarkets)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-gradient min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Markets</h1>
          <p className="text-wk-muted">
            Monitor prediction market integrity across multiple sources
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-purple-500" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((market) => (
              <div
                key={market.slug}
                onClick={() => router.push(`/market/${market.slug}`)}
                className="card hover:border-purple-500/30 transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white leading-snug pr-4">
                    {market.title}
                  </h3>
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/5 border border-wk-border flex items-center justify-center">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#9ca3af"
                      strokeWidth="2"
                    >
                      <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
                      <polyline points="16,7 22,7 22,13" />
                    </svg>
                  </div>
                </div>

                {/* Tag + Status */}
                <div className="mb-4 flex items-center gap-2">
                  <span className="tag-pill">{market.tag}</span>
                  {market.processingStatus === 'ready' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-900/40 text-green-400 border border-green-800/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                      Ready
                    </span>
                  )}
                  {market.processingStatus === 'processing' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-900/40 text-blue-400 border border-blue-800/50">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing
                    </span>
                  )}
                  {market.processingStatus === 'pending' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-900/40 text-yellow-400 border border-yellow-800/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                      Queued
                    </span>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-wk-border my-3" />

                {/* Close Date */}
                <div className="flex items-center gap-2 text-wk-muted text-sm mb-5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                  </svg>
                  Closes: {market.closesAt}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
