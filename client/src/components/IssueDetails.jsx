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
  Maximize2,
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
        className={`bg-slate-50 flex flex-col items-center justify-center p-8 text-center text-slate-400 h-full select-none ${className}`}
      >
        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-3 text-slate-400 shadow-xs">
          <Info className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 font-sans mb-1">
          No finding selected
        </h3>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-sans">
          Select an issue from the findings queue to inspect its rationale, security impact, and verified fix.
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
      <div className="px-5 py-4 border-b border-slate-200/90 shrink-0 bg-slate-50/70">
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Severity + Category Pill */}
          <div className="flex items-center gap-2">
            <SeverityBadge severity={issue.severity} />
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-600 px-2 py-0.5 rounded bg-white border border-slate-200">
              {issue.category}
            </span>
          </div>

          {/* Source Attribution Tag */}
          <span
            className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
              isAi
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {isAi ? 'AI Semantic' : 'Static AST'}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-sm font-bold text-slate-900 leading-snug font-sans">
          {issue.title}
        </h2>

        {/* Location Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mt-1.5">
          <span className="text-slate-800 font-semibold">
            {filename}:{issue.line}{issue.endLine && issue.endLine !== issue.line ? `-${issue.endLine}` : ''}
          </span>
          {typeof issue.confidence === 'number' && (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">{Math.round(issue.confidence * 100)}% confidence</span>
            </>
          )}
          {issue.rule && (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-mono text-[11px]">{issue.rule}</span>
            </>
          )}
        </div>
      </div>

      {/* Finding Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans text-xs">
        {/* Section 1: Why This Matters */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Why this matters</span>
          </h3>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 leading-relaxed text-xs">
            {issue.description}
          </div>
        </div>

        {/* Section 2: Recommendation */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-slate-500" />
            <span>Recommendation</span>
          </h3>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 leading-relaxed text-xs">
            {issue.recommendation}
          </div>
        </div>

        {/* Section 3: Suggested Fix Diff View */}
        {hasFix && issue.fix?.replacement && (
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
              <span className="flex items-center gap-1 text-[#087A54]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F9F6E]" />
                <span>Suggested Change</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500 font-normal">
                {issue.fix.original ? 'inline diff' : 'replacement'}
              </span>
            </div>

            {/* PR-style Diff Box */}
            <div className="rounded-lg border border-[#21262D] bg-[#16191D] overflow-hidden font-mono text-xs leading-relaxed shadow-xs">
              <div className="px-3 py-1.5 bg-[#111316] border-b border-[#21262D] flex items-center justify-between text-[11px] text-[#8B949E]">
                <span className="font-semibold uppercase tracking-wider text-slate-300">
                  {filename}
                </span>
                <span>
                  Lines {issue.line}{issue.endLine && issue.endLine !== issue.line ? `-${issue.endLine}` : ''}
                </span>
              </div>
              <div className="p-3 overflow-x-auto dark-editor-scrollbar space-y-1">
                {originalLines.length > 0 &&
                  originalLines.map((line, idx) => (
                    <div key={`orig-${idx}`} className="text-red-300 bg-red-950/40 px-2 py-0.5 rounded flex items-baseline">
                      <span className="text-red-400 select-none mr-2 font-bold">-</span>
                      <span className="whitespace-pre">{line}</span>
                    </div>
                  ))}
                {replacementLines.map((line, idx) => (
                  <div key={`repl-${idx}`} className="text-[#34D399] bg-[#0F9F6E]/20 px-2 py-0.5 rounded flex items-baseline">
                    <span className="text-[#34D399] select-none mr-2 font-bold">+</span>
                    <span className="whitespace-pre">{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stale Warning Notice */}
        {isStale && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold text-amber-950">Source code has been modified</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Run review again before applying patches to ensure line numbers and source hashes match.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Finding Footer Actions */}
      <div className="px-5 py-3 border-t border-slate-200/90 bg-slate-50/80 flex items-center justify-between gap-2 shrink-0 select-none">
        {/* Copy snippet button */}
        {hasFix && issue.fix?.replacement ? (
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium transition-colors shadow-2xs"
            title="Copy fix snippet to clipboard"
          >
            {copyStatus === 'copied' ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#0F9F6E]" />
                <span className="font-semibold text-[#087A54]">Copied</span>
              </>
            ) : copyStatus === 'failed' ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                <span>Failed</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Fix</span>
              </>
            )}
          </button>
        ) : (
          <span className="text-xs text-slate-500 font-mono">Manual review required</span>
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
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#0F9F6E] hover:bg-[#087A54] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-colors"
            >
              {isApplyingPatch ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                  <span>Applying...</span>
                </>
              ) : (
                <>
                  <Wrench className="w-3.5 h-3.5 text-white/90" />
                  <span>Apply Patch</span>
                </>
              )}
            </button>
          )}

          {/* AI Patch: Preview Fix flow */}
          {hasFix && isAi && (
            <div>
              {isStale ? (
                <span className="text-[11px] font-mono text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  Source changed
                </span>
              ) : typeof issue.confidence === 'number' && issue.confidence < 0.8 ? (
                <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                  Low confidence ({Math.round(issue.confidence * 100)}%)
                </span>
              ) : !issue.fix?.original ? (
                <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                  Manual fix only
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onPreviewAiPatch && onPreviewAiPatch(issue)}
                  disabled={isVerifyingAiPatch || isApplyingPatch}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#0F9F6E] hover:bg-[#087A54] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  {isVerifyingAiPatch ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-white/90" />
                      <span>Apply Patch</span>
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
