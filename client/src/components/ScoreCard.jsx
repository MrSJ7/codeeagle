import React from 'react';
import { Activity, AlertCircle, Sparkles, Shield, Clock } from 'lucide-react';

export function ScoreCard({ score, breakdown, metadata, isStale, isHistorical, historicalCreatedAt }) {
  const normScore = Math.max(0, Math.min(100, Math.round(score ?? 0)));

  const getScoreColor = (val) => {
    if (val >= 80) return { text: 'text-emerald-400', bar: 'bg-emerald-500', border: 'border-emerald-500/30' };
    if (val >= 60) return { text: 'text-amber-400', bar: 'bg-amber-500', border: 'border-amber-500/30' };
    return { text: 'text-red-400', bar: 'bg-red-500', border: 'border-red-500/30' };
  };

  const overallColors = getScoreColor(normScore);

  const categories = [
    { key: 'security', label: 'Security', value: breakdown?.security ?? 0 },
    { key: 'quality', label: 'Quality', value: breakdown?.quality ?? 0 },
    { key: 'performance', label: 'Performance', value: breakdown?.performance ?? 0 },
    { key: 'complexity', label: 'Complexity', value: breakdown?.complexity ?? 0 },
  ];

  const isHybrid = metadata?.engine === 'hybrid';
  const isAiUnavailable = metadata?.aiStatus === 'UNAVAILABLE' || metadata?.aiStatus === 'VALIDATION_FAILED';

  return (
    <div className={`bg-slate-900 border rounded-lg p-4 transition-colors ${isStale ? 'border-amber-500/30' : 'border-slate-800'}`}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span>Code Health</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {isHistorical && (
            <span
              title={historicalCreatedAt ? `Recorded on ${new Date(historicalCreatedAt).toLocaleString()}` : 'Historical review record'}
              className="flex items-center gap-1 text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 font-medium"
            >
              <Clock className="w-3 h-3 text-cyan-400" />
              Historical Review
            </span>
          )}
          {isStale ? (
            <span className="flex items-center gap-1 text-[10px] font-mono uppercase text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-medium">
              <AlertCircle className="w-3 h-3" />
              Stale Review
            </span>
          ) : isHybrid ? (
            <span className="flex items-center gap-1 text-[10px] font-mono uppercase text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 font-medium">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Hybrid Review (Static + AI)
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-mono uppercase text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-700/60 font-medium">
              <Shield className="w-3 h-3 text-slate-400" />
              Static Review
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        {/* Large Metric Display */}
        <div className={`w-16 h-16 rounded-lg border ${overallColors.border} bg-slate-950 flex flex-col items-center justify-center shrink-0`}>
          <span className={`text-2xl font-bold font-mono ${overallColors.text}`}>
            {normScore}
          </span>
          <span className="text-[9px] font-mono text-slate-500 uppercase">/ 100</span>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-200">
              {normScore >= 80 ? 'Good Condition' : normScore >= 60 ? 'Needs Attention' : 'Critical Defects'}
            </span>
            <span className={`text-xs font-mono font-semibold ${overallColors.text}`}>{normScore}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${overallColors.bar} transition-all duration-300`}
              style={{ width: `${normScore}%` }}
            />
          </div>
          {isStale && (
            <p className="text-[10px] text-amber-400/90 mt-1.5 flex items-center gap-1">
              Code changed since last review. Run review to recompute.
            </p>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {categories.map((cat) => {
          const colors = getScoreColor(cat.value);
          return (
            <div key={cat.key} className="bg-slate-950/70 border border-slate-800/60 rounded p-2">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-400">{cat.label}</span>
                <span className={`font-mono font-medium ${colors.text}`}>{cat.value}</span>
              </div>
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colors.bar} transition-all duration-300`}
                  style={{ width: `${Math.max(5, Math.min(100, cat.value))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
