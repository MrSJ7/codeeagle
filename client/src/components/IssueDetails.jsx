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
import { Badge } from './ui/Badge.jsx';
import { Button } from './ui/Button.jsx';

export function IssueDetails({
  issue,
  onApplyPatch,
  onPreviewAiPatch,
  reviewStatus = 'IDLE',
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
        className={`bg-graphite-900 flex flex-col items-center justify-center p-8 text-center text-graphite-500 h-full select-none ${className}`}
      >
        <div className="w-10 h-10 rounded-full bg-graphite-850 border border-graphite-750 flex items-center justify-center mb-3 text-graphite-400 shadow-dev-sm">
          <Info className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-graphite-200 font-sans mb-1">
          {reviewStatus === 'IDLE' ? 'Review not started' : 'No finding selected'}
        </h3>
        <p className="text-xs text-graphite-400 max-w-xs leading-relaxed font-sans">
          {reviewStatus === 'IDLE'
            ? 'Run code review to inspect findings, view actionable security rationale, and apply verified code fixes.'
            : 'Select an issue from the findings queue to inspect its rationale, security impact, and verified fix.'}
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
      className={`bg-graphite-900 flex flex-col h-full overflow-hidden select-none ${className}`}
    >
      {/* Finding Header - PR Review Comment Style */}
      <div className="px-5 py-4 border-b border-graphite-800 shrink-0 bg-graphite-950">
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Severity + Category Pill */}
          <div className="flex items-center gap-2">
            <Badge variant={issue.severity.toLowerCase()}>
              {issue.severity}
            </Badge>
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-graphite-300 px-2 py-0.5 rounded bg-graphite-850 border border-graphite-700">
              {issue.category}
            </span>
          </div>

          {/* Source Attribution Tag */}
          <Badge variant={isAi ? 'ai' : 'ast'}>
            {isAi ? 'AI Semantic' : 'Static AST'}
          </Badge>
        </div>

        {/* Title */}
        <h2 className="text-sm font-bold text-graphite-100 leading-snug font-sans">
          {issue.title}
        </h2>

        {/* Location Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-graphite-400 mt-1.5 flex-wrap">
          <span className="text-graphite-200 font-semibold">
            {filename}:{issue.line}{issue.endLine && issue.endLine !== issue.line ? `-${issue.endLine}` : ''}
          </span>
          {typeof issue.confidence === 'number' && (
            <>
              <span className="text-graphite-600">•</span>
              <span className="text-graphite-400">{Math.round(issue.confidence * 100)}% confidence</span>
            </>
          )}
          {issue.rule && (
            <>
              <span className="text-graphite-600">•</span>
              <span className="text-cyan-400 font-mono text-[11px]">{issue.rule}</span>
            </>
          )}
        </div>
      </div>

      {/* Finding Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans text-xs">
        {/* Section 1: Why This Matters */}
        <div>
          <h3 className="text-xs font-bold text-graphite-200 mb-1.5 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Why this matters</span>
          </h3>
          <div className="p-3 rounded-lg bg-graphite-950 border border-graphite-800 text-graphite-300 leading-relaxed text-xs">
            {issue.description}
          </div>
        </div>

        {/* Section 2: Recommendation */}
        <div>
          <h3 className="text-xs font-bold text-graphite-200 mb-1.5 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-graphite-400" />
            <span>Recommendation</span>
          </h3>
          <div className="p-3 rounded-lg bg-graphite-950 border border-graphite-800 text-graphite-300 leading-relaxed text-xs">
            {issue.recommendation}
          </div>
        </div>

        {/* Section 3: Suggested Fix Diff View */}
        {hasFix && issue.fix?.replacement && (
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-graphite-200 mb-1.5">
              <span className="flex items-center gap-1 text-brand-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Suggested Change</span>
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-mono text-graphite-400 hover:text-graphite-200 cursor-pointer"
              >
                {copyStatus === 'copied' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* In-situ Diff Box */}
            <div className="rounded-lg border border-graphite-800 bg-code font-mono text-[11px] p-3 space-y-1 overflow-x-auto shadow-dev-sm">
              <div className="text-graphite-500 text-[10px] uppercase tracking-wider mb-1 font-sans font-semibold">
                Unified Diff Preview
              </div>

              {/* Removed Lines */}
              {originalLines.map((line, idx) => (
                <div
                  key={`orig-${idx}`}
                  className="text-red-300 bg-red-950/40 px-2 py-0.5 rounded border border-red-900/30 flex items-baseline gap-2"
                >
                  <span className="text-red-500 select-none font-bold shrink-0">-</span>
                  <span className="whitespace-pre overflow-x-auto">{line}</span>
                </div>
              ))}

              {/* Added Lines */}
              {replacementLines.map((line, idx) => (
                <div
                  key={`rep-${idx}`}
                  className="text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30 flex items-baseline gap-2"
                >
                  <span className="text-emerald-500 select-none font-bold shrink-0">+</span>
                  <span className="whitespace-pre overflow-x-auto">{line}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: Static Rule Metadata */}
        {issue.rule && (
          <div className="p-2.5 rounded-md bg-graphite-950 border border-graphite-800 text-[11px] font-mono text-graphite-400 flex items-center justify-between">
            <span>Rule Identifier</span>
            <span className="text-cyan-400 font-semibold">{issue.rule}</span>
          </div>
        )}
      </div>

      {/* Remediation Action Callout Footer */}
      {hasFix && (
        <div className="p-4 border-t border-graphite-800 bg-graphite-950 shrink-0 flex flex-col gap-2">
          {isStatic && (
            <Button
              variant="primary"
              size="md"
              onClick={() => onApplyPatch(issue)}
              disabled={isStale || isApplyingPatch}
              isLoading={isApplyingPatch}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              className="w-full"
            >
              Apply Patch & Re-Analyze
            </Button>
          )}

          {isAi && (
            <Button
              variant="accent"
              size="md"
              onClick={() => onPreviewAiPatch(issue)}
              disabled={isStale || isVerifyingAiPatch}
              isLoading={isVerifyingAiPatch}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              className="w-full"
            >
              Preview & Verify AI Patch
            </Button>
          )}

          {isStale && (
            <p className="text-[11px] text-orange-400 text-center font-mono">
              Code has been edited. Re-run review to enable patch application.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
