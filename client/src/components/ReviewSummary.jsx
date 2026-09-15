import React from 'react';
import { Clock, CheckCircle2, FileCode, Play, Loader2, X } from 'lucide-react';
import { Button } from './ui/Button.jsx';

export function ReviewSummary({
  reviewData,
  reviewStatus = 'IDLE',
  isStale = false,
  isHistorical = false,
  historicalCreatedAt = null,
  filename = 'auth.js',
  language = 'JavaScript',
  lineCount = null,
  activeCategory = null,
  onSelectCategory = null,
  onRunReview = null,
  patchDiff = null,
  onDismissDiff = null,
}) {
  // 1. Idle State: Clean prompt without fake scores
  if (reviewStatus === 'IDLE' || !reviewData) {
    return (
      <div className="px-4 sm:px-6 py-2 bg-slate-100 border-b border-slate-200 text-slate-700 text-xs shrink-0 select-none">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* File Context */}
          <div className="flex items-center gap-2 font-mono text-xs text-slate-700">
            <FileCode className="w-3.5 h-3.5 text-brand-600" />
            <span className="font-semibold text-slate-900">{filename}</span>
            <span className="text-slate-400 font-sans">•</span>
            <span className="text-[11px] text-slate-500 font-sans">{language}</span>
            {lineCount && (
              <>
                <span className="text-slate-400 font-sans">•</span>
                <span className="text-[11px] text-slate-500 font-sans">{lineCount} lines</span>
              </>
            )}
          </div>

          {/* Idle Prompt */}
          <div className="flex items-center gap-2 text-slate-600 text-xs font-sans">
            <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
            <span>Ready for review · AST static checks & Gemini semantic reasoning</span>
          </div>

          {/* Quick Action Button */}
          {onRunReview && (
            <Button
              variant="primary"
              size="sm"
              onClick={onRunReview}
              leftIcon={<Play className="w-3 h-3 fill-current" />}
            >
              <span>Run Review</span>
              <kbd className="hidden sm:inline-block ml-1 px-1 py-0.2 text-[9px] font-mono rounded bg-white/20 text-white font-bold">
                ⌘↵
              </kbd>
            </Button>
          )}
        </div>
      </div>
    );
  }

  // 2. Analyzing State: Non-blocking progress indicator
  if (reviewStatus === 'ANALYZING') {
    return (
      <div className="px-4 sm:px-6 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs shrink-0 select-none">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600 shrink-0" />
            <span className="font-mono text-xs">
              Analyzing <strong className="text-slate-900">{filename}</strong>... Deterministic AST checks complete · Gemini semantic reasoning running...
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-700 bg-white px-2 py-0.5 rounded border border-emerald-200 font-bold shadow-dev-sm">
            Analyzing
          </span>
        </div>
      </div>
    );
  }

  // 3. Reviewed State (Success / Stale)
  const { score = 100, breakdown = {}, issues = [] } = reviewData;
  const normScore = Math.max(0, Math.min(100, Math.round(score)));

  const totalFindings = issues.length;
  const criticalCount = issues.filter((i) => i.severity === 'CRITICAL').length;
  const highCount = issues.filter((i) => i.severity === 'HIGH').length;
  const mediumCount = issues.filter((i) => i.severity === 'MEDIUM').length;
  const lowCount = issues.filter((i) => i.severity === 'LOW').length;

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
          ? 'bg-amber-50 border-amber-200 text-amber-900'
          : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        {/* Left: Target File + Findings Headline */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* File Context */}
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-800 font-semibold">
            <FileCode className="w-3.5 h-3.5 text-brand-600" />
            <span>{filename}</span>
            <span className="text-slate-400 font-normal font-sans">•</span>
            <span className="text-[11px] text-slate-500 font-normal font-sans">{language}</span>
            {lineCount && (
              <>
                <span className="text-slate-400 font-normal font-sans">•</span>
                <span className="text-[11px] text-slate-500 font-normal font-sans">
                  {lineCount} lines
                </span>
              </>
            )}
          </div>

          <div className="h-3.5 w-px bg-slate-200 hidden sm:block" />

          {/* Primary Findings Headline */}
          {totalFindings === 0 ? (
            <div className="flex items-center gap-1.5 text-brand-600 font-semibold font-sans">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
              <span>Review complete — All checks passed</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 font-sans flex-wrap">
              <span className="font-bold text-slate-900">
                {totalFindings} {totalFindings === 1 ? 'finding' : 'findings'} need attention
              </span>

              {/* Scannable Severity Distribution */}
              <div className="flex items-center gap-2 text-[11px]">
                {criticalCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {criticalCount} critical
                  </span>
                )}
                {highCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {highCount} high
                  </span>
                )}
                {mediumCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-yellow-700 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    {mediumCount} medium
                  </span>
                )}
                {lowCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {lowCount} low
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Inline Patch Resolution Pill if diff exists */}
          {patchDiff && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-mono text-emerald-800 shadow-dev-sm font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Score {patchDiff.scoreBefore} → {patchDiff.scoreAfter}</span>
              {patchDiff.scoreAfter > patchDiff.scoreBefore && (
                <span className="font-bold text-emerald-700">
                  (+{patchDiff.scoreAfter - patchDiff.scoreBefore})
                </span>
              )}
              {onDismissDiff && (
                <button
                  type="button"
                  onClick={onDismissDiff}
                  className="text-emerald-700 hover:text-emerald-950 ml-1 cursor-pointer"
                  title="Dismiss diff badge"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Quality Score + Interactive Category Signals */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Quality Score & Verdict */}
          <div className="flex items-center gap-2">
            <div
              title="Deterministic code quality score"
              className="flex items-baseline gap-1 px-2.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-900 font-mono shadow-dev-sm"
            >
              <span className={`text-xs font-black ${normScore >= 80 ? 'text-brand-600' : normScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                {normScore}
              </span>
              <span className="text-[10px] text-slate-400 font-normal">/100</span>
            </div>
            <span className="text-[11px] font-bold text-slate-700 font-sans">
              {verdict}
            </span>
          </div>

          <div className="h-3.5 w-px bg-slate-200 hidden md:block" />

          {/* Interactive Category Breakdown */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-sans">
            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory('security')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                activeCategory === 'security'
                  ? 'bg-brand-600 text-white font-semibold shadow-dev-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Security <strong className="font-mono font-semibold">{breakdown.security ?? 100}</strong>
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory('quality')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                activeCategory === 'quality'
                  ? 'bg-brand-600 text-white font-semibold shadow-dev-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Quality <strong className="font-mono font-semibold">{breakdown.quality ?? 100}</strong>
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory('performance')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                activeCategory === 'performance'
                  ? 'bg-brand-600 text-white font-semibold shadow-dev-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Perf <strong className="font-mono font-semibold">{breakdown.performance ?? 100}</strong>
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory('complexity')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                activeCategory === 'complexity'
                  ? 'bg-brand-600 text-white font-semibold shadow-dev-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Complexity <strong className="font-mono font-semibold">{breakdown.complexity ?? 100}</strong>
            </button>
          </div>

          {/* Historical Review Timestamp Indicator */}
          {isHistorical && historicalCreatedAt && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-700">
              <Clock className="w-3 h-3 text-blue-600" />
              <span>Snapshot</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
