'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
  getMarketDetail,
  exportOddsCsv,
  exportIntegrityCsv,
  exportDossierJson,
} from '@/lib/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MarketDetail {
  slug: string;
  title: string;
  tag: string;
  closesAt: string;
  description: string;
  sources: { name: string; type: string }[];
  integrityScore: {
    overall: number;
    marketClarity: number;
    liquidityDepth: number;
    crossSourceAgreement: number;
    volatilitySanity: number;
  };
  oddsHistory: {
    timestamp: string;
    polymarket: number;
    kalshi: number;
    predictit: number;
    wagerkit: number;
  }[];
  notes: string[];
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-blue-400';
  if (score >= 40) return 'text-yellow-400';
  if (score >= 20) return 'text-orange-400';
  return 'text-red-400';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Highly Reliable';
  if (score >= 60) return 'Stable';
  if (score >= 40) return 'Caution';
  if (score >= 20) return 'High Risk';
  return 'Critical';
}

export default function MarketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [market, setMarket] = useState<MarketDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset state when slug changes to prevent showing stale market data
    setMarket(null);
    setLoading(true);
    if (slug) {
      getMarketDetail(slug)
        .then(setMarket)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const handleExportOddsCsv = async () => {
    const csv = await exportOddsCsv(slug);
    downloadFile(csv, `odds_history_${slug}.csv`, 'text/csv');
  };

  const handleExportIntegrityCsv = async () => {
    const csv = await exportIntegrityCsv(slug);
    downloadFile(csv, `integrity_${slug}.csv`, 'text/csv');
  };

  const handleExportDossierJson = async () => {
    const json = await exportDossierJson(slug);
    downloadFile(JSON.stringify(json, null, 2), `dossier_${slug}.json`, 'application/json');
  };

  const handleExportDossierPdf = async () => {
    if (!market) return;

    // Dynamic import for jspdf
    const { default: jsPDF } = await import('jspdf');
    const autoTableModule = await import('jspdf-autotable');

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(24);
    doc.setTextColor(107, 33, 168);
    doc.text('WagerKit Dossier', 20, 25);

    // Subtitle
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 33);

    // Horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 37, pageWidth - 20, 37);

    // Market Title
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text(market.title, 20, 48);

    // Market Info
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Tag: ${market.tag}  |  Closes: ${market.closesAt}`, 20, 56);
    doc.text(`Description: ${market.description}`, 20, 63, { maxWidth: pageWidth - 40 });

    // Integrity Score Section
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text('Integrity Score', 20, 80);

    // Overall Score
    const scoreColor = market.integrityScore.overall >= 80 ? [34, 197, 94] :
                       market.integrityScore.overall >= 60 ? [59, 130, 246] :
                       market.integrityScore.overall >= 40 ? [234, 179, 8] : [239, 68, 68];
    doc.setFontSize(28);
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(`${market.integrityScore.overall}`, pageWidth - 20, 80, { align: 'right' });

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(getScoreLabel(market.integrityScore.overall), pageWidth - 20, 86, { align: 'right' });

    // Score Components Table
    const scoreData = [
      ['Market Clarity', `${market.integrityScore.marketClarity}%`, '40%'],
      ['Liquidity Depth', `${market.integrityScore.liquidityDepth}%`, '30%'],
      ['Cross-Source Agreement', `${market.integrityScore.crossSourceAgreement}%`, '20%'],
      ['Volatility Sanity', `${market.integrityScore.volatilitySanity}%`, '10%'],
    ];

    (doc as any).autoTable({
      startY: 92,
      head: [['Component', 'Score', 'Weight']],
      body: scoreData,
      theme: 'grid',
      headStyles: { fillColor: [107, 33, 168], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 20, right: 20 },
    });

    // Data Sources
    const sourcesY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text('Data Sources', 20, sourcesY);

    const sourcesData = market.sources.map(s => [s.name, s.type]);
    (doc as any).autoTable({
      startY: sourcesY + 5,
      head: [['Source', 'Type']],
      body: sourcesData,
      theme: 'grid',
      headStyles: { fillColor: [107, 33, 168], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 20, right: 20 },
    });

    // Notes
    const notesY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text('Notes', 20, notesY);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    market.notes.forEach((note, i) => {
      doc.text(`• ${note}`, 25, notesY + 8 + i * 7);
    });

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text('WagerKit - Market Intelligence Platform', 20, footerY);
    doc.text('Confidential', pageWidth - 20, footerY, { align: 'right' });

    doc.save(`dossier_${slug}.pdf`);
  };

  if (loading) {
    return (
      <div className="page-gradient min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <svg className="animate-spin h-8 w-8 text-purple-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="page-gradient min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Market Not Found</h2>
          <button onClick={() => router.push('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Chart data
  const chartLabels = market.oddsHistory.map((p) => {
    const d = new Date(p.timestamp);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  });

  // Only show every 8th label to avoid overcrowding
  const sparseLabels = chartLabels.map((label, i) => (i % 8 === 0 ? label : ''));

  const chartData = {
    labels: sparseLabels,
    datasets: [
      {
        label: 'Polymarket',
        data: market.oddsHistory.map((p) => p.polymarket * 100),
        borderColor: '#ffffff',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.3,
      },
      {
        label: 'Kalshi',
        data: market.oddsHistory.map((p) => p.kalshi * 100),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.05)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.3,
      },
      {
        label: 'PredictIt',
        data: market.oddsHistory.map((p) => p.predictit * 100),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.05)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.3,
      },
      {
        label: 'WagerKit',
        data: market.oddsHistory.map((p) => p.wagerkit * 100),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.05)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          color: '#9ca3af',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: '#1e1e30',
        borderColor: '#2a2a40',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#9ca3af',
        padding: 12,
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}%`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255,255,255,0.05)',
        },
        ticks: {
          color: '#6b7280',
          font: { size: 10 },
          maxRotation: 45,
        },
      },
      y: {
        grid: {
          color: 'rgba(255,255,255,0.05)',
        },
        ticks: {
          color: '#6b7280',
          font: { size: 10 },
          callback: (value: any) => `${value}%`,
        },
      },
    },
  };

  const score = market.integrityScore;

  return (
    <div className="page-gradient min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-wk-muted hover:text-white transition-colors mb-6"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6" />
          </svg>
          Back
        </button>

        {/* Market Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">
          {market.title}
        </h1>

        {/* ============= INTEGRITY SCORE CARD ============= */}
        <div className="card mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">💎</span>
                <h2 className="text-xl font-semibold text-white">Integrity Score</h2>
              </div>
              <p className="text-sm text-wk-muted">
                Multi-factor market integrity analysis
              </p>
            </div>
            <div className="text-right">
              <div className={`text-5xl font-bold ${getScoreColor(score.overall)}`}>
                {score.overall.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Sub-scores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            {[
              { label: 'Market Clarity', value: score.marketClarity },
              { label: 'Liquidity Depth', value: score.liquidityDepth },
              { label: 'Cross-Source Agreement', value: score.crossSourceAgreement },
              { label: 'Volatility Sanity', value: score.volatilitySanity },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-sm text-wk-muted mb-1">{item.label}</p>
                <p className="text-2xl font-bold text-white">{item.value}%</p>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Notes</h3>
            <div className="flex flex-wrap gap-2">
              {market.notes.map((note, i) => (
                <span
                  key={i}
                  className={i % 2 === 0 ? 'note-tag note-tag-green' : 'note-tag note-tag-blue'}
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ============= ODDS HISTORY CHART ============= */}
        <div className="card mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Odds History</h2>
              <p className="text-sm text-wk-muted">
                Historical odds trends over the last 24 hours
              </p>
            </div>
            <button
              onClick={handleExportOddsCsv}
              className="btn-outline text-sm flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export CSV
            </button>
          </div>

          <div className="h-80">
            <Line key={slug} data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* ============= LATEST ODDS ============= */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-white mb-1">Latest Odds</h2>
          <p className="text-sm text-wk-muted mb-6">
            Real-time odds from all sources
          </p>

          <div className="flex flex-col items-center justify-center py-10 text-center">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4b5563"
              strokeWidth="1.5"
              className="mb-3"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
            <p className="text-wk-muted font-medium mb-1">No Recent Odds</p>
            <p className="text-sm text-gray-600">
              We haven&apos;t received any recent price ticks from the source feeds.
            </p>
          </div>
        </div>

        {/* ============= DATA SOURCES ============= */}
        <div className="card mb-6" style={{
          background: 'linear-gradient(180deg, #12121e 0%, #0d0d18 50%, #12121e 100%)',
        }}>
          <h2 className="text-xl font-semibold text-white mb-1">Data Sources</h2>
          <p className="text-sm text-wk-muted mb-6">
            Sources providing odds for this market
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {market.sources.map((source) => (
              <div
                key={source.name}
                className="border border-wk-border rounded-xl p-5 flex items-center justify-between bg-wk-card/50"
              >
                <div>
                  <p className="text-white font-semibold">{source.name}</p>
                  <p className="text-sm text-wk-muted">{source.type}</p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    source.type === 'regulated'
                      ? 'bg-gray-800 text-gray-300 border border-gray-600'
                      : 'bg-purple-900/50 text-purple-300 border border-purple-700'
                  }`}
                >
                  {source.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ============= ACTIONS ============= */}
        <div className="card mb-10">
          <h2 className="text-xl font-semibold text-white mb-6">Actions</h2>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleExportDossierPdf}
              className="btn-outline flex items-center gap-2 px-5 py-3"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Dossier (PDF)
            </button>

            <button
              onClick={handleExportDossierJson}
              className="btn-outline flex items-center gap-2 px-5 py-3"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Dossier (JSON)
            </button>

            <button
              onClick={handleExportIntegrityCsv}
              className="btn-outline flex items-center gap-2 px-5 py-3"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              Export Integrity CSV
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
