import React from 'react';
import { Clock, CheckCircle2, Sparkles, Shield, AlertTriangle, FileCode } from 'lucide-react';

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

  // Human-readable verdict according to Section 19
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
      className={`px-4 sm:px-6 py-2 border-b select-none text-xs shrink-0 ${
        isStale
          ? 'bg-amber-50/90 border-amber-200 text-amber-950'
          : 'bg-white border-slate-200/90 text-slate-700'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        {/* Left: Target File + Findings Headline */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* File Context */}
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-900 font-semibold">
            <FileCode className="w-3.5 h-3.5 text-[#0F9F6E]" />
            <span>{filename}</span>
            <span className="text-slate-400 font-normal font-sans">•</span>
            <span className="text-[11px] text-slate-600 font-normal font-sans">{language}</span>
            {reviewData.metrics?.lines && (
              <>
                <span className="text-slate-400 font-normal font-sans">•</span>
                <span className="text-[11px] text-slate-600 font-normal font-sans">
                  {reviewData.metrics.lines} lines
                </span>
              </>
            )}
          </div>

          <div className="h-3.5 w-px bg-slate-200 hidden sm:block" />

          {/* Primary Findings Headline */}
          {totalFindings === 0 ? (
            <div className="flex items-center gap-1.5 text-emerald-800 font-medium font-sans">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0F9F6E]" />
              <span>Review complete — All checks passed</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 font-sans flex-wrap">
              <span className="font-semibold text-slate-900">
                {totalFindings} {totalFindings === 1 ? 'finding' : 'findings'} need attention
              </span>

              {/* Scannable Severity Distribution */}
              <div className="flex items-center gap-2 text-[11px]">
                {criticalCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[#DC2626] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                    {criticalCount} critical
                  </span>
                )}
                {highCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[#EA580C] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
                    {highCount} high
                  </span>
                )}
                {mediumCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[#D97706] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                    {mediumCount} medium
                  </span>
                )}
                {lowCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[#2563EB] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                    {lowCount} low
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Quality Score + Interactive Category Signals + Review Engine */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Quality Score & Verdict */}
          <div className="flex items-center gap-2">
            <div
              title="Deterministic code quality score"
              className="flex items-baseline gap-1 px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-900 font-mono"
            >
              <span className="text-xs font-bold">{normScore}</span>
              <span className="text-[10px] text-slate-500 font-normal">/100</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-600 font-sans">
              {verdict}
            </span>
          </div>

          <div className="h-3.5 w-px bg-slate-200 hidden md:block" />

          {/* Interactive Category Breakdown */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-sans">
            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory('security')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                activeCategory === 'security'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Security <strong className="font-mono font-semibold">{breakdown.security ?? 100}</strong>
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory('quality')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                activeCategory === 'quality'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Quality <strong className="font-mono font-semibold">{breakdown.quality ?? 100}</strong>
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory('performance')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                activeCategory === 'performance'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Perf <strong className="font-mono font-semibold">{breakdown.performance ?? 100}</strong>
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory('complexity')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                activeCategory === 'complexity'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Complexity <strong className="font-mono font-semibold">{breakdown.complexity ?? 100}</strong>
            </button>
          </div>

          <div className="h-3.5 w-px bg-slate-200 hidden sm:block" />

          {/* Engine / State Tag */}
          <div className="flex items-center gap-1.5">
            {isHistorical ? (
              <span
                title={historicalCreatedAt ? `Saved on ${new Date(historicalCreatedAt).toLocaleString()}` : ''}
                className="flex items-center gap-1 text-[10px] font-sans text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-medium"
              >
                <Clock className="w-3 h-3 text-slate-500" />
                Historical
              </span>
            ) : isStale ? (
              <span className="flex items-center gap-1 text-[10px] font-sans text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 font-semibold">
                <AlertTriangle className="w-3 h-3 text-amber-700" />
                Stale review
              </span>
            ) : isHybrid ? (
              <span className="flex items-center gap-1 text-[10px] font-sans text-[#065F42] bg-[#DCFCE7] px-2 py-0.5 rounded border border-[#0F9F6E]/30 font-semibold">
                <Sparkles className="w-3 h-3 text-[#0F9F6E]" />
                AI + Static
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-sans text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-medium">
                <Shield className="w-3 h-3 text-slate-500" />
                Static review
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
