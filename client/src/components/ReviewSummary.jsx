import React from 'react';
import { Clock, CheckCircle2, FileCode, Play, Loader2, X, AlertCircle } from 'lucide-react';
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
      <div className="px-4 sm:px-6 py-2 bg-obsidian-900 border-b border-obsidian-800 text-obsidian-300 text-xs shrink-0 select-none">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* File Context */}
          <div className="flex items-center gap-2 font-mono text-xs text-obsidian-300">
            <FileCode className="w-3.5 h-3.5 text-brand-500" />
            <span className="font-semibold text-obsidian-100">{filename}</span>
            <span className="text-obsidian-600 font-sans">•</span>
            <span className="text-[11px] text-obsidian-400 font-sans">{language}</span>
            {lineCount && (
              <>
                <span className="text-obsidian-600 font-sans">•</span>
                <span className="text-[11px] text-obsidian-400 font-sans">{lineCount} lines</span>
              </>
            )}
          </div>

          {/* Idle Prompt */}
          <div className="flex items-center gap-2 text-obsidian-400 text-xs font-sans">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <span>Ready for review · AST static checks & Gemini semantic reasoning</span>
          </div>

          {/* Quick Action Button */}
          {onRunReview && (
            <Button
              variant="primary"
              size="xs"
              onClick={onRunReview}
              leftIcon={<Play className="w-3 h-3 fill-current" />}
            >
              <span>Run Review</span>
              <kbd className="hidden sm:inline-block ml-1 px-1 py-0.2 text-[9px] font-mono rounded bg-obsidian-950/30 text-obsidian-950 font-bold">
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
      <div className="px-4 sm:px-6 py-2 bg-obsidian-900 border-b border-brand-500/40 text-brand-400 text-xs shrink-0 select-none">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500 shrink-0" />
            <span className="font-mono text-xs text-obsidian-200">
              Analyzing <strong className="text-obsidian-50">{filename}</strong>... Deterministic AST checks complete · Gemini semantic reasoning running...
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-[4px] border border-brand-500/30 font-bold">
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
          ? 'bg-amber-950/25 border-amber-800/40 text-amber-200'
          : 'bg-obsidian-900 border-obsidian-800 text-obsidian-200'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        {/* Left: Target File + Findings Headline */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* File Context */}
          <div className="flex items-center gap-1.5 font-mono text-xs text-obsidian-200 font-semibold">
            <FileCode className="w-3.5 h-3.5 text-brand-500" />
            <span>{filename}</span>
            <span className="text-obsidian-600 font-normal font-sans">•</span>
            <span className="text-[11px] text-obsidian-400 font-normal font-sans">{language}</span>
            {lineCount && (
              <>
                <span className="text-obsidian-600 font-normal font-sans">•</span>
                <span className="text-[11px] text-obsidian-400 font-normal font-sans">
                  {lineCount} lines
                </span>
              </>
            )}
          </div>

          <div className="h-3.5 w-px bg-obsidian-750 hidden sm:block" />

          {/* Primary Findings Headline */}
          {totalFindings === 0 ? (
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold font-sans">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Review complete — All checks passed</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 font-sans flex-wrap">
              <span className="font-bold text-obsidian-50">
                {totalFindings} {totalFindings === 1 ? 'finding' : 'findings'} need attention
              </span>

              {/* Scannable Severity Distribution */}
              <div className="flex items-center gap-2 text-[11px]">
                {criticalCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-red-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {criticalCount} critical
                  </span>
                )}
                {highCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-orange-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    {highCount} high
                  </span>
                )}
                {mediumCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {mediumCount} medium
                  </span>
                )}
                {lowCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-obsidian-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-obsidian-400" />
                    {lowCount} low
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Inline Patch Resolution Pill if diff exists */}
          {patchDiff && (
            <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded-[4px] text-[11px] font-mono text-emerald-300 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Score {patchDiff.scoreBefore} → {patchDiff.scoreAfter}</span>
              {patchDiff.scoreAfter > patchDiff.scoreBefore && (
                <span className="font-bold text-emerald-400">
                  (+{patchDiff.scoreAfter - patchDiff.scoreBefore})
                </span>
              )}
              {onDismissDiff && (
                <button
                  type="button"
                  onClick={onDismissDiff}
                  className="text-emerald-400 hover:text-emerald-200 ml-1 cursor-pointer"
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
              className="flex items-baseline gap-1 px-2.5 py-0.5 rounded-[4px] bg-obsidian-950 border border-obsidian-750 text-obsidian-100 font-mono"
            >
              <span className={`text-xs font-black ${normScore >= 80 ? 'text-emerald-400' : normScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {normScore}
              </span>
              <span className="text-[10px] text-obsidian-500 font-normal">/100</span>
            </div>
            <span className="text-[11px] font-bold text-obsidian-300 font-sans">
              {verdict}
            </span>
          </div>

          <div className="h-3.5 w-px bg-obsidian-750 hidden md:block" />

          {/* Interactive Category Breakdown */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-sans">
            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory('security')}
              className={`px-2 py-0.5 rounded-[4px] transition-colors cursor-pointer ${
                activeCategory === 'security'
                  ? 'bg-brand-500 text-obsidian-950 font-bold'
                  : 'text-obsidian-400 hover:text-obsidian-200 hover:bg-obsidian-850'
              }`}
            >
              Security <strong className="font-mono font-semibold">{breakdown.security ?? 100}</strong>
            </button>
            <span className="text-obsidian-600">•</span>
            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory('quality')}
              className={`px-2 py-0.5 rounded-[4px] transition-colors cursor-pointer ${
                activeCategory === 'quality'
                  ? 'bg-brand-500 text-obsidian-950 font-bold'
                  : 'text-obsidian-400 hover:text-obsidian-200 hover:bg-obsidian-850'
              }`}
            >
              Quality <strong className="font-mono font-semibold">{breakdown.quality ?? 100}</strong>
            </button>
            <span className="text-obsidian-600">•</span>
            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory('performance')}
              className={`px-2 py-0.5 rounded-[4px] transition-colors cursor-pointer ${
                activeCategory === 'performance'
                  ? 'bg-brand-500 text-obsidian-950 font-bold'
                  : 'text-obsidian-400 hover:text-obsidian-200 hover:bg-obsidian-850'
              }`}
            >
              Perf <strong className="font-mono font-semibold">{breakdown.performance ?? 100}</strong>
            </button>
            <span className="text-obsidian-600">•</span>
            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory('complexity')}
              className={`px-2 py-0.5 rounded-[4px] transition-colors cursor-pointer ${
                activeCategory === 'complexity'
                  ? 'bg-brand-500 text-obsidian-950 font-bold'
                  : 'text-obsidian-400 hover:text-obsidian-200 hover:bg-obsidian-850'
              }`}
            >
              Complexity <strong className="font-mono font-semibold">{breakdown.complexity ?? 100}</strong>
            </button>
          </div>

          {/* Historical Review Timestamp Indicator */}
          {isHistorical && historicalCreatedAt && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-obsidian-950 border border-obsidian-750 text-[10px] font-mono text-obsidian-300">
              <Clock className="w-3 h-3 text-brand-400" />
              <span>Snapshot</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
