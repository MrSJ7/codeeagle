import React from 'react';
import { Clock, CheckCircle2, Sparkles, Shield, AlertTriangle, FileCode } from 'lucide-react';

export function ReviewSummary({
  reviewData,
  isStale = false,
  isHistorical = false,
  historicalCreatedAt = null,
  filename = 'source.js',
  language = 'JavaScript',
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
    if (s >= 90) return 'Minor issues to address';
    if (s >= 70) return 'Needs attention';
    if (s >= 50) return 'Significant issues';
    return 'High risk';
  };

  const verdict = getVerdict(normScore);

  return (
    <div
      className={`px-4 sm:px-6 py-2 border-b select-none text-xs shrink-0 ${
        isStale
          ? 'bg-amber-50/80 border-amber-200 text-amber-950'
          : 'bg-white border-stone-200/80 text-stone-700'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        {/* Left: Target File + Findings Headline + Verdict */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* File Context */}
          <div className="flex items-center gap-1.5 font-mono text-xs text-stone-900 font-semibold">
            <FileCode className="w-3.5 h-3.5 text-[#0F9F6E]" />
            <span>{filename}</span>
            <span className="text-stone-300 font-normal font-sans">•</span>
            <span className="text-[11px] text-stone-500 font-normal font-sans">{language}</span>
            {reviewData.metrics?.lines && (
              <>
                <span className="text-stone-300 font-normal font-sans">•</span>
                <span className="text-[11px] text-stone-500 font-normal font-sans">
                  {reviewData.metrics.lines} lines
                </span>
              </>
            )}
          </div>

          <span className="text-stone-200 hidden sm:inline">|</span>

          {/* Primary Findings Headline */}
          {totalFindings === 0 ? (
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium font-sans">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0F9F6E]" />
              <span>Review complete — All checks passed</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 font-sans flex-wrap">
              <span className="font-semibold text-stone-900">
                {totalFindings} {totalFindings === 1 ? 'finding' : 'findings'} need attention
              </span>

              {/* Scannable Severity Distribution */}
              <div className="flex items-center gap-1.5 text-[11px]">
                {criticalCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[#D92D20] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D92D20]" />
                    {criticalCount} critical
                  </span>
                )}
                {highCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[#E87B21] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E87B21]" />
                    {highCount} high
                  </span>
                )}
                {mediumCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[#C58B00] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C58B00]" />
                    {mediumCount} medium
                  </span>
                )}
                {lowCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[#4D78A8] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4D78A8]" />
                    {lowCount} low
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Quality Index Verdict + Compressed Category Signals + Review Engine */}
        <div className="flex items-center gap-3.5 flex-wrap">
          {/* Quality Score & Verdict */}
          <div className="flex items-center gap-2">
            <div
              title="Deterministic code quality score"
              className="flex items-baseline gap-1 px-2 py-0.5 rounded bg-stone-50 border border-stone-200 text-stone-900 font-mono"
            >
              <span className="text-xs font-bold">{normScore}</span>
              <span className="text-[10px] text-stone-400 font-normal">/100</span>
            </div>
            <span className="text-[11px] font-medium text-stone-500 font-sans">
              {verdict}
            </span>
          </div>

          <span className="text-stone-200 hidden md:inline">|</span>

          {/* Compressed Category Breakdown */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-sans text-stone-500">
            <span>
              Security <strong className="font-mono text-stone-800 font-semibold">{breakdown.security ?? 100}</strong>
            </span>
            <span className="text-stone-300">•</span>
            <span>
              Quality <strong className="font-mono text-stone-800 font-semibold">{breakdown.quality ?? 100}</strong>
            </span>
            <span className="text-stone-300">•</span>
            <span>
              Perf <strong className="font-mono text-stone-800 font-semibold">{breakdown.performance ?? 100}</strong>
            </span>
            <span className="text-stone-300">•</span>
            <span>
              Complexity <strong className="font-mono text-stone-800 font-semibold">{breakdown.complexity ?? 100}</strong>
            </span>
          </div>

          <span className="text-stone-200 hidden sm:inline">|</span>

          {/* Engine / State Tag */}
          <div className="flex items-center gap-1.5">
            {isHistorical ? (
              <span
                title={historicalCreatedAt ? `Saved on ${new Date(historicalCreatedAt).toLocaleString()}` : ''}
                className="flex items-center gap-1 text-[10px] font-sans text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200"
              >
                <Clock className="w-3 h-3 text-stone-500" />
                Historical Review
              </span>
            ) : isStale ? (
              <span className="flex items-center gap-1 text-[10px] font-sans text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300 font-medium">
                <AlertTriangle className="w-3 h-3 text-amber-700" />
                Review stale
              </span>
            ) : isHybrid ? (
              <span className="flex items-center gap-1 text-[10px] font-sans text-[#065F42] bg-[#DDF7EC] px-2 py-0.5 rounded border border-[#B8EED5] font-medium">
                <Sparkles className="w-3 h-3 text-[#0F9F6E]" />
                AI + Static
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-sans text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                <Shield className="w-3 h-3 text-stone-500" />
                Static review
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


