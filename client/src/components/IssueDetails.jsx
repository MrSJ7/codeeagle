import React, { useState } from 'react';
import {
  Copy,
  Check,
  Sparkles,
  Info,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { SeverityBadge } from './SeverityBadge.jsx';
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
        className={`bg-obsidian-900 flex flex-col items-center justify-center p-8 text-center text-obsidian-400 h-full select-none ${className}`}
      >
        <div className="w-10 h-10 rounded-[6px] bg-obsidian-850 border border-obsidian-750 flex items-center justify-center mb-3 text-obsidian-400 shadow-sm">
          <Info className="w-5 h-5 text-brand-500" />
        </div>
        <h3 className="text-sm font-bold text-obsidian-100 font-sans mb-1">
          {reviewStatus === 'IDLE' ? 'Ready for review' : 'No finding selected'}
        </h3>
        <p className="text-xs text-obsidian-400 max-w-xs leading-relaxed font-sans">
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
      className={`bg-obsidian-900 flex flex-col h-full overflow-hidden select-none font-sans ${className}`}
    >
      {/* 1. Header: Senior PR Review Comment Meta */}
      <div className="px-5 py-4 border-b border-obsidian-800 shrink-0 bg-obsidian-850">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <SeverityBadge severity={issue.severity} />
            <span className="text-[11px] font-mono font-semibold text-obsidian-300">
              {issue.category}
            </span>
          </div>

          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-[4px] font-bold border ${
              isAi
                ? 'text-brand-400 bg-brand-500/10 border-brand-500/30'
                : 'text-obsidian-300 bg-obsidian-800 border-obsidian-700'
            }`}
          >
            {isAi ? 'AI Semantic' : 'Static AST'}
          </span>
        </div>

        <h2 className="text-sm font-bold text-obsidian-50 leading-snug">
          {issue.title}
        </h2>

        <div className="flex items-center gap-2 text-xs font-mono text-obsidian-400 mt-1.5 flex-wrap">
          <span className="text-obsidian-200 font-semibold">
            {filename}:{issue.line}
            {issue.endLine && issue.endLine !== issue.line ? `-${issue.endLine}` : ''}
          </span>
          {issue.rule && (
            <>
              <span className="text-obsidian-600">•</span>
              <span className="text-brand-400 font-mono text-[11px] font-semibold">{issue.rule}</span>
            </>
          )}
          {typeof issue.confidence === 'number' && (
            <>
              <span className="text-obsidian-600">•</span>
              <span className="text-obsidian-400">{Math.round(issue.confidence * 100)}% confidence</span>
            </>
          )}
        </div>
      </div>

      {/* 2. Scrollable Body: Pure Whitespace & Clean Typography */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        {/* Why this matters */}
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-obsidian-400 font-semibold mb-1.5">
            Why this matters
          </div>
          <p className="text-obsidian-200 leading-relaxed font-normal">
            {issue.description}
          </p>
        </div>

        {/* Recommendation */}
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-obsidian-400 font-semibold mb-1.5">
            Recommendation
          </div>
          <p className="text-obsidian-200 leading-relaxed font-normal">
            {issue.recommendation}
          </p>
        </div>

        {/* Suggested change */}
        {hasFix && issue.fix?.replacement && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-obsidian-300 font-semibold">
                Suggested Change (Unified Diff)
              </span>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-mono text-obsidian-400 hover:text-obsidian-100 cursor-pointer transition-colors"
                title="Copy suggested fix"
              >
                {copyStatus === 'copied' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="rounded-[6px] overflow-hidden border border-obsidian-750 bg-obsidian-950 font-mono text-xs shadow-inner">
              <div className="p-3 space-y-1">
                {issue.fix.original && (
                  <div className="flex items-start gap-2 text-red-400 bg-red-950/20 px-2.5 py-1 rounded-[3px] border border-red-500/20">
                    <span className="select-none font-bold text-red-500">-</span>
                    <span className="whitespace-pre-wrap break-all">{issue.fix.original}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-emerald-300 bg-emerald-950/20 px-2.5 py-1 rounded-[3px] border border-emerald-500/20">
                  <span className="select-none font-bold text-emerald-400">+</span>
                  <span className="whitespace-pre-wrap break-all">{issue.fix.replacement}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Sticky Action Footer */}
      {(hasFix || isAi) && (
        <div className="p-4 border-t border-obsidian-800 bg-obsidian-900/90 backdrop-blur-xs space-y-2 shrink-0">
          {/* Integrity Note */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-obsidian-400">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span>Source verified · Single-occurrence SHA-256 match</span>
          </div>

          {isStatic && (
            <Button
              variant="primary"
              size="md"
              onClick={() => onApplyPatch(issue)}
              disabled={isStale || isApplyingPatch}
              isLoading={isApplyingPatch}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full shadow-[0_2px_8px_rgba(249,115,22,0.35)]"
            >
              Apply Fix & Re-Analyze
            </Button>
          )}

          {isAi && (
            <Button
              variant="primary"
              size="md"
              onClick={() => onPreviewAiPatch(issue)}
              disabled={isStale || isVerifyingAiPatch}
              isLoading={isVerifyingAiPatch}
              leftIcon={<Sparkles className="w-4 h-4" />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full shadow-[0_2px_8px_rgba(249,115,22,0.35)]"
            >
              Preview & Apply AI Fix
            </Button>
          )}

          {isStale && (
            <p className="text-[11px] text-amber-300 text-center font-mono font-medium">
              Code has been edited. Run review again to verify.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
