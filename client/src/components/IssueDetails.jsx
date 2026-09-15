import React, { useState } from 'react';
import {
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  Wrench,
  Info,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { SeverityBadge } from './SeverityBadge.jsx';

export function IssueDetails({
  issue,
  onApplyPatch,
  onPreviewAiPatch,
  isStale = false,
  isApplyingPatch = false,
  isVerifyingAiPatch = false,
  filename = 'auth.js',
  className = '',
}) {
  const [copyStatus, setCopyStatus] = useState(null); // 'copied' | 'failed' | null

  if (!issue) {
    return (
      <section
        aria-label="Finding remediation"
        className={`bg-[#FAFAF9] flex flex-col items-center justify-center p-8 text-center text-stone-400 h-full select-none ${className}`}
      >
        <div className="w-9 h-9 rounded-full bg-white border border-stone-200/80 flex items-center justify-center mb-2.5 text-stone-400 shadow-2xs">
          <Info className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-semibold text-stone-700 font-sans mb-1">
          No finding selected
        </h3>
        <p className="text-[11px] text-stone-500 max-w-xs leading-relaxed">
          Select an issue from the rail to view remediation rationale, security impact, and verified patches.
        </p>
      </section>
    );
  }

  const handleCopy = async () => {
    if (!issue.fix?.replacement) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(issue.fix.replacement);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = issue.fix.replacement;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      setCopyStatus('failed');
      setTimeout(() => setCopyStatus(null), 2500);
    }
  };

  const hasFix = Boolean(issue.fix);
  const isStatic = issue.source === 'STATIC';
  const isAi = issue.source === 'AI';
  const originalLines = issue.fix?.original ? issue.fix.original.split('\n') : [];
  const replacementLines = issue.fix?.replacement ? issue.fix.replacement.split('\n') : [];

  return (
    <section
      aria-label={`Finding details for ${issue.title}`}
      className={`bg-white flex flex-col h-full overflow-hidden select-none ${className}`}
    >
      {/* Finding Header - PR Review Comment Style */}
      <div className="px-5 py-4 border-b border-stone-200/90 shrink-0 bg-[#FAFAF9]">
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Severity + Category Pill */}
          <div className="flex items-center gap-2">
            <SeverityBadge severity={issue.severity} />
            <span className="text-[10px] font-mono uppercase tracking-wider font-medium text-stone-500 px-1.5 py-0.5 rounded bg-white border border-stone-200/80">
              {issue.category}
            </span>
          </div>

          {/* Source Attribution Tag */}
          <span
            className={`text-[9px] font-mono uppercase font-semibold px-2 py-0.5 rounded border ${
              isAi
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-stone-100 text-stone-600 border-stone-200'
            }`}
          >
            {isAi ? 'AI Semantic' : 'Static Rule'}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-[13px] font-semibold text-stone-900 leading-snug font-sans">
          {issue.title}
        </h2>

        {/* Location Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-stone-500 mt-1.5">
          <span className="text-stone-800 font-medium">{filename}:{issue.line}{issue.endLine && issue.endLine !== issue.line ? `-${issue.endLine}` : ''}</span>
          {typeof issue.confidence === 'number' && (
            <>
              <span className="text-stone-300">•</span>
              <span className="text-stone-500">{Math.round(issue.confidence * 100)}% confidence</span>
            </>
          )}
          {issue.rule && (
            <>
              <span className="text-stone-300">•</span>
              <span className="text-stone-400 font-mono text-[10px]">{issue.rule}</span>
            </>
          )}
        </div>
      </div>

      {/* Finding Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans text-xs">
        {/* Section 1: Why This Matters */}
        <div>
          <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 mb-1.5 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Why this matters</span>
          </h3>
          <div className="p-3 rounded bg-stone-50/80 border border-stone-200/70 text-stone-700 leading-relaxed text-xs">
            {issue.description}
          </div>
        </div>

        {/* Section 2: Recommendation */}
        <div>
          <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 mb-1.5 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-stone-500" />
            <span>Recommendation</span>
          </h3>
          <div className="p-3 rounded bg-stone-50/80 border border-stone-200/70 text-stone-700 leading-relaxed text-xs">
            {issue.recommendation}
          </div>
        </div>

        {/* Section 3: Suggested Fix Diff View */}
        {hasFix && issue.fix?.replacement && (
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              <span className="flex items-center gap-1 text-[#0F9F6E]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F9F6E]" />
                <span>Suggested Change</span>
              </span>
              <span className="text-[10px] font-mono text-stone-400 lowercase font-normal">
                {issue.fix.original ? 'inline diff' : 'replacement'}
              </span>
            </div>

            {/* PR-style Diff Box */}
            <div className="rounded border border-[#242826] bg-[#171A19] overflow-hidden font-mono text-[11px] leading-relaxed">
              <div className="px-3 py-1 bg-[#121514] border-b border-[#242826] flex items-center justify-between text-[10px] text-[#8F9E94]">
                <span className="font-semibold uppercase tracking-wider text-[#A0AEA4]">
                  {filename}
                </span>
                <span>
                  Lines {issue.line}{issue.endLine && issue.endLine !== issue.line ? `-${issue.endLine}` : ''}
                </span>
              </div>
              <div className="p-3 overflow-x-auto dark-editor-scrollbar space-y-0.5">
                {originalLines.length > 0 &&
                  originalLines.map((line, idx) => (
                    <div key={`orig-${idx}`} className="text-red-300 bg-red-950/30 px-1.5 py-0.5 -mx-1 rounded-xs flex items-baseline">
                      <span className="text-red-400 select-none mr-2 font-bold text-xs">-</span>
                      <span className="whitespace-pre">{line}</span>
                    </div>
                  ))}
                {replacementLines.map((line, idx) => (
                  <div key={`repl-${idx}`} className="text-[#34D399] bg-[#0F9F6E]/15 px-1.5 py-0.5 -mx-1 rounded-xs flex items-baseline">
                    <span className="text-[#0F9F6E] select-none mr-2 font-bold text-xs">+</span>
                    <span className="whitespace-pre">{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stale Warning Notice */}
        {isStale && (
          <div className="flex items-start gap-2 p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-900">Source code has been modified</p>
              <p className="text-[10px] text-amber-800 mt-0.5">
                Run review again before applying patches to ensure line numbers and source hashes match.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Finding Footer Actions */}
      <div className="px-5 py-3 border-t border-stone-200/90 bg-[#FAFAF9] flex items-center justify-between gap-2 shrink-0 select-none">
        {/* Copy snippet button */}
        {hasFix && issue.fix?.replacement ? (
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-xs font-medium transition-colors shadow-2xs"
            title="Copy fix snippet to clipboard"
          >
            {copyStatus === 'copied' ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#0F9F6E]" />
                <span>Copied</span>
              </>
            ) : copyStatus === 'failed' ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                <span>Failed</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-400" />
                <span>Copy Fix</span>
              </>
            )}
          </button>
        ) : (
          <span className="text-[11px] text-stone-400 font-mono">Manual review required</span>
        )}

        {/* Patch Action Button */}
        <div className="flex items-center gap-2">
          {/* Static Patch: One-Click Apply Patch */}
          {hasFix && isStatic && (
            <button
              type="button"
              onClick={() => onApplyPatch(issue)}
              disabled={isStale || isApplyingPatch}
              title={isStale ? 'Re-run review before applying patch' : 'Apply patch to editor'}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#0F9F6E] hover:bg-[#087A54] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-2xs transition-colors"
            >
              {isApplyingPatch ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                  <span>Applying...</span>
                </>
              ) : (
                <>
                  <Wrench className="w-3.5 h-3.5 text-white/80" />
                  <span>Apply Patch</span>
                </>
              )}
            </button>
          )}

          {/* AI Patch: Preview Fix flow */}
          {hasFix && isAi && (
            <div>
              {isStale ? (
                <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  Source changed
                </span>
              ) : typeof issue.confidence === 'number' && issue.confidence < 0.8 ? (
                <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2 py-1 rounded border border-stone-200">
                  Low confidence ({Math.round(issue.confidence * 100)}%)
                </span>
              ) : !issue.fix?.original ? (
                <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2 py-1 rounded border border-stone-200">
                  Manual fix only
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onPreviewAiPatch && onPreviewAiPatch(issue)}
                  disabled={isVerifyingAiPatch || isApplyingPatch}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#0F9F6E] hover:bg-[#087A54] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-2xs transition-colors"
                >
                  {isVerifyingAiPatch ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-white/80" />
                      <span>Preview Fix</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

