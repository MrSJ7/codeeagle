import React from 'react';
import { Clock, CheckCircle2, Sparkles, Shield, AlertTriangle, FileCode } from 'lucide-react';
import { Badge } from './ui/Badge.jsx';

export function ReviewSummary({
  reviewData,
  isStale = false,
  isHistorical = false,
  historicalCreatedAt = null,
  filename = 'auth.js',
  language = 'JavaScript',
  activeCategory = null,
  onSelectCategory = null,
}) {
  if (!reviewData) return null;

  const { score = 100, breakdown = {}, issues = [], metadata = {} } = reviewData;
  const normScore = Math.max(0, Math.min(100, Math.round(score)));

  const totalFindings = issues.length;
  const criticalCount = issues.filter((i) => i.severity === 'CRITICAL').length;
  const highCount = issues.filter((i) => i.severity === 'HIGH').length;
  const mediumCount = issues.filter((i) => i.severity === 'MEDIUM').length;
  const lowCount = issues.filter((i) => i.severity === 'LOW').length;

  const isHybrid = metadata?.engine === 'hybrid';

  const getVerdict = (s) => {
    if (s === 100) return 'Ready to ship';
    if (s >= 90) return 'Minor issues';
    if (s >= 70) return 'Needs attention';
    if (s >= 50) return 'Significant issues';
    return 'High risk';
  };

  const verdict = getVerdict(normScore);

  return (
    <div
      className={`px-4 sm:px-5 py-2 border-b select-none text-xs shrink-0 ${
        isStale
          ? 'bg-amber-950/40 border-amber-800/50 text-amber-200'
          : 'bg-graphite-900 border-graphite-800 text-graphite-200'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        {/* Left: Target File + Findings Headline */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* File Context */}
          <div className="flex items-center gap-1.5 font-mono text-xs text-graphite-100 font-semibold">
            <FileCode className="w-3.5 h-3.5 text-brand-400" />
            <span>{filename}</span>
            <span className="text-graphite-600 font-normal font-sans">•</span>
            <span className="text-[11px] text-graphite-400 font-normal font-sans">{language}</span>
            {reviewData.metrics?.lines && (
              <>
                <span className="text-graphite-600 font-normal font-sans">•</span>
                <span className="text-[11px] text-graphite-400 font-normal font-sans">
                  {reviewData.metrics.lines} lines
                </span>
              </>
            )}
          </div>

          <div className="h-3.5 w-px bg-graphite-800 hidden sm:block" />

          {/* Primary Findings Headline */}
          {totalFindings === 0 ? (
            <div className="flex items-center gap-1.5 text-brand-400 font-medium font-sans">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
              <span>Review complete — All checks passed</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 font-sans flex-wrap">
              <span className="font-semibold text-graphite-100">
                {totalFindings} {totalFindings === 1 ? 'finding' : 'findings'} need attention
              </span>

              {/* Scannable Severity Distribution */}
              <div className="flex items-center gap-2 text-[11px]">
                {criticalCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-red-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {criticalCount} critical
                  </span>
                )}
                {highCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-orange-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    {highCount} high
                  </span>
                )}
                {mediumCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {mediumCount} medium
                  </span>
                )}
                {lowCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-cyan-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    {lowCount} low
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Quality Score + Interactive Category Signals + Review Engine */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Quality Score & Verdict (Supportive, not giant) */}
          <div className="flex items-center gap-2">
            <div
              title="Deterministic code quality score"
              className="flex items-baseline gap-1 px-2 py-0.5 rounded bg-graphite-950 border border-graphite-700/80 text-graphite-100 font-mono shadow-dev-sm"
            >
              <span className={`text-xs font-bold ${normScore >= 80 ? 'text-brand-400' : normScore >= 50 ? 'text-orange-400' : 'text-red-400'}`}>
                {normScore}
              </span>
              <span className="text-[10px] text-graphite-500 font-normal">/100</span>
            </div>
            <span className="text-[11px] font-semibold text-graphite-300 font-sans">
              {verdict}
            </span>
          </div>

          <div className="h-3.5 w-px bg-graphite-800 hidden md:block" />

          {/* Interactive Category Breakdown */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-sans">
            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory('security')}
              className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                activeCategory === 'security'
                  ? 'bg-brand-500 text-graphite-950 font-semibold'
                  : 'text-graphite-400 hover:text-graphite-200 hover:bg-graphite-800'
              }`}
            >
              Security <strong className="font-mono font-semibold">{breakdown.security ?? 100}</strong>
            </button>
            <span className="text-graphite-700">•</span>
            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory('quality')}
              className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                activeCategory === 'quality'
                  ? 'bg-brand-500 text-graphite-950 font-semibold'
                  : 'text-graphite-400 hover:text-graphite-200 hover:bg-graphite-800'
              }`}
            >
              Quality <strong className="font-mono font-semibold">{breakdown.quality ?? 100}</strong>
            </button>
            <span className="text-graphite-700">•</span>
            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory('performance')}
              className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                activeCategory === 'performance'
                  ? 'bg-brand-500 text-graphite-950 font-semibold'
                  : 'text-graphite-400 hover:text-graphite-200 hover:bg-graphite-800'
              }`}
            >
              Perf <strong className="font-mono font-semibold">{breakdown.performance ?? 100}</strong>
            </button>
            <span className="text-graphite-700">•</span>
            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory('complexity')}
              className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                activeCategory === 'complexity'
                  ? 'bg-brand-500 text-graphite-950 font-semibold'
                  : 'text-graphite-400 hover:text-graphite-200 hover:bg-graphite-800'
              }`}
            >
              Complexity <strong className="font-mono font-semibold">{breakdown.complexity ?? 100}</strong>
            </button>
          </div>

          {/* Historical Review Timestamp Indicator */}
          {isHistorical && historicalCreatedAt && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-graphite-800 border border-graphite-700 text-[10px] font-mono text-graphite-300">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Snapshot</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
