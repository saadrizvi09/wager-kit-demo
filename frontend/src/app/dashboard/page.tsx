'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getMarkets, searchMarkets } from '@/lib/api';

interface MarketSummary {
  slug: string;
  title: string;
  tag: string;
  closesAt: string;
  processingStatus?: 'pending' | 'processing' | 'ready' | 'error' | 'unknown';
}

const TAG_COLORS: Record<string, string> = {
  election: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  crypto: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  macro: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  sports: 'bg-red-500/15 text-red-400 border-red-500/25',
  tech: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  entertainment: 'bg-pink-500/15 text-pink-400 border-pink-500/25',
  weather: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
  geopolitics: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  general: 'bg-gray-500/15 text-gray-400 border-gray-500/25',
};

const SUGGESTIONS = [
  'Will Bitcoin reach $150k by 2026?',
  'Will AI replace software engineers by 2030?',
  'Will the Fed cut rates in March 2026?',
  'Will Tesla stock go above $500?',
  'Will the Ukraine war end in 2026?',
  'Will SpaceX land humans on Mars by 2030?',
  'Will inflation drop below 2% in 2026?',
  'Will TikTok be banned in the US?',
];

export default function DashboardPage() {
  const router = useRouter();
  const [markets, setMarkets] = useState<MarketSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Load default markets on mount
  useEffect(() => {
    getMarkets()
      .then(setMarkets)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Debounced search
  const doSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setHasSearched(false);
      getMarkets().then(setMarkets);
      return;
    }
    setSearching(true);
    setHasSearched(true);
    try {
      const results = await searchMarkets(query);
      setMarkets(results);
    } catch {
      // fallback
    } finally {
      setSearching(false);
    }
  }, []);

  // Search on Enter or button click
  const handleSearch = () => {
    doSearch(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    doSearch(suggestion);
  };

  return (
    <div className="page-gradient min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Markets Explorer
          </h1>
          <p className="text-gray-400 text-lg">
            Search any prediction market event. Get integrity scores, odds charts, and downloadable dossiers instantly.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative flex gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="block w-full pl-12 pr-4 py-4 rounded-xl bg-wk-card border border-wk-border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-base"
                placeholder="Search any event... e.g. 'Will Bitcoin hit $200k?'"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-base flex items-center gap-2"
            >
              {searching ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              Analyze
            </button>
          </div>
        </div>

        {/* Quick Suggestions */}
        {!hasSearched && (
          <div className="max-w-3xl mx-auto mb-10">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Try searching for</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="px-3 py-1.5 text-sm bg-white/5 hover:bg-purple-500/15 border border-wk-border hover:border-purple-500/30 rounded-full text-gray-400 hover:text-purple-300 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Section Title */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">
            {hasSearched ? `Results for "${searchQuery}"` : 'Featured Markets'}
          </h2>
          <span className="text-sm text-gray-500">{markets.length} market{markets.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-purple-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : markets.length === 0 ? (
          <div className="text-center py-20">
            <svg className="mx-auto h-12 w-12 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-400 text-lg">No markets found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((market) => {
              const tagColor = TAG_COLORS[market.tag] || TAG_COLORS.general;
              return (
                <div
                  key={market.slug}
                  onClick={() => router.push(`/market/${market.slug}`)}
                  className="card hover:border-purple-500/30 transition-all duration-300 flex flex-col cursor-pointer group relative overflow-hidden"
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <h3 className="text-lg font-semibold text-white leading-snug pr-4 line-clamp-2">
                      {market.title}
                    </h3>
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/5 border border-wk-border flex items-center justify-center text-gray-500 group-hover:text-purple-400 group-hover:border-purple-500/30 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
                        <polyline points="16,7 22,7 22,13" />
                      </svg>
                    </div>
                  </div>

                  {/* Tag */}
                  <div className="mb-4 flex items-center gap-2 relative z-10">
                    <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium border ${tagColor}`}>
                      {market.tag}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-wk-border my-2 relative z-10" />

                  {/* Close Date */}
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-4 mt-2 relative z-10">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                    Closes: {market.closesAt}
                  </div>

                  {/* Action */}
                  <div className="mt-auto pt-3 flex items-center justify-between relative z-10">
                    <span className="text-sm text-gray-400 group-hover:text-purple-400 transition-colors flex items-center gap-1.5">
                      View Analysis
                      <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

