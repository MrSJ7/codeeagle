import React, { useState } from 'react';
import {
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  Wrench,
  Info,
  ShieldCheck,
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
  const [copyStatus, setCopyStatus] = useState(null);

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
          {reviewStatus === 'IDLE' ? 'Ready for review' : 'No finding selected'}
        </h3>
        <p className="text-xs text-graphite-400 max-w-xs leading-relaxed font-sans">
          {reviewStatus === 'IDLE'
            ? 'Run code review to inspect findings, view actionable security rationale, and apply verified code fixes.'
            : 'Select an issue from the findings list to inspect its rationale, security impact, and verified fix.'}
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
      className={`bg-graphite-900 flex flex-col h-full overflow-hidden select-none font-sans ${className}`}
    >
      {/* 1. Header: Senior PR Review Comment Meta */}
      <div className="px-5 py-4 border-b border-graphite-800 shrink-0 bg-graphite-950">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Badge variant={issue.severity.toLowerCase()}>
              {issue.severity}
            </Badge>
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-graphite-300">
              {issue.category}
            </span>
          </div>

          <Badge variant={isAi ? 'ai' : 'ast'}>
            {isAi ? 'AI Semantic' : 'Static AST'}
          </Badge>
        </div>

        <h2 className="text-sm font-bold text-graphite-100 leading-snug">
          {issue.title}
        </h2>

        <div className="flex items-center gap-2 text-xs font-mono text-graphite-400 mt-1.5 flex-wrap">
          <span className="text-graphite-200 font-semibold">
            {filename}:{issue.line}
            {issue.endLine && issue.endLine !== issue.line ? `-${issue.endLine}` : ''}
          </span>
          {issue.rule && (
            <>
              <span className="text-graphite-600">•</span>
              <span className="text-cyan-400 font-mono text-[11px]">{issue.rule}</span>
            </>
          )}
          {typeof issue.confidence === 'number' && (
            <>
              <span className="text-graphite-600">•</span>
              <span className="text-graphite-400">{Math.round(issue.confidence * 100)}% confidence</span>
            </>
          )}
        </div>
      </div>

      {/* 2. Scrollable Body: Pure Whitespace & Clean Typography (No Nested Card Bloat) */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        {/* Why this matters */}
        <div>
          <div className="text-xs font-bold text-graphite-200 mb-1 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Why this matters</span>
          </div>
          <p className="text-graphite-300 leading-relaxed pl-5 font-normal">
            {issue.description}
          </p>
        </div>

        {/* Recommendation */}
        <div>
          <div className="text-xs font-bold text-graphite-200 mb-1 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>Recommendation</span>
          </div>
          <p className="text-graphite-300 leading-relaxed pl-5 font-normal">
            {issue.recommendation}
          </p>
        </div>

        {/* Suggested change */}
        {hasFix && issue.fix?.replacement && (
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-graphite-200 mb-2">
              <span className="flex items-center gap-1.5 text-brand-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Suggested change</span>
              </span>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-mono text-graphite-400 hover:text-graphite-200 cursor-pointer transition-colors"
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
            <div className="rounded-lg border border-graphite-800 bg-code font-mono text-[11px] p-3 space-y-1 shadow-dev-sm overflow-x-auto">
              {originalLines.map((line, idx) => (
                <div
                  key={`orig-${idx}`}
                  className="text-red-300 bg-red-950/40 px-2 py-0.5 rounded border border-red-900/30 flex items-baseline gap-2"
                >
                  <span className="text-red-500 select-none font-bold shrink-0">-</span>
                  <span className="whitespace-pre">{line}</span>
                </div>
              ))}

              {replacementLines.map((line, idx) => (
                <div
                  key={`rep-${idx}`}
                  className="text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30 flex items-baseline gap-2"
                >
                  <span className="text-emerald-500 select-none font-bold shrink-0">+</span>
                  <span className="whitespace-pre">{line}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-mono text-graphite-500 mt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
              <span>Source verified · Single-occurrence SHA-256 match</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Action Callout Footer */}
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
              Apply Fix
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
              Preview & Apply AI Fix
            </Button>
          )}

          {isStale && (
            <p className="text-[11px] text-orange-400 text-center font-mono">
              Code has been edited. Run review again to verify.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
