import React, { useState } from 'react';
import { ArrowRight, Check, Copy, FileCode2, Lightbulb, ShieldCheck } from 'lucide-react';

export function IssueDetails({ issue, onPreviewAiPatch, onPreviewPatch, onGenerateRefactor, isAiConfigured = false, isGeneratingRefactor = false, isStale = false, isApplyingPatch = false, isVerifyingAiPatch = false, filename = 'source.js', code = '', className = '' }) {
  const [copied, setCopied] = useState(false);
  if (!issue) return <section aria-label="Finding details" className={`ce-surface flex items-center justify-center p-8 text-center ${className}`}><div className="max-w-xs"><FileCode2 size={28} className="mx-auto mb-4 ce-muted"/><h2 className="text-lg font-semibold">Select a finding</h2><p className="ce-muted mt-2 text-sm leading-6">The evidence, location, and recommended change will appear here.</p></div></section>;
  const lines = code.split('\n');
  const first = Math.max(1, (issue.line || 1) - 2);
  const last = Math.min(lines.length, Math.max(issue.endLine || issue.line || 1, issue.line || 1) + 2);
  const excerpt = lines.slice(first - 1, last);
  const preview = onPreviewAiPatch || onPreviewPatch;
  const busy = isGeneratingRefactor || isApplyingPatch || isVerifyingAiPatch;
  const canSuggest = !issue.fix && isAiConfigured && onGenerateRefactor;
  const copyFix = async () => {
    try { await navigator.clipboard.writeText(issue.fix.replacement); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };
  return <section aria-label={`Finding details for ${issue.title}`} className={`ce-surface flex flex-col min-h-0 ${className}`}>
    <div className="border-b ce-line px-5 py-5">
      <p className="ce-label uppercase tracking-[.12em]">Finding detail</p>
      <h2 className="mt-2 text-xl leading-snug font-semibold tracking-tight">{issue.title}</h2>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs"><span className={`ce-mono font-bold ce-severity-${(issue.severity || 'low').toLowerCase()}`}>{issue.severity}</span><span className="ce-muted">·</span><span className="ce-muted ce-mono">{issue.rule || issue.category || 'Review'}</span><span className="ce-muted">·</span><span className="ce-muted">{issue.source === 'AI' ? 'AI review' : 'Static check'}</span></div>
    </div>
    <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-7">
      <section><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">Evidence</h3><span className="ce-muted ce-mono text-[11px] truncate" title={`${issue.path || filename}:${issue.line}`}>{issue.path || filename}:{issue.line}</span></div>
        {excerpt.length > 0 && <div className="ce-code ce-code-scroll mt-3 rounded-lg overflow-x-auto p-3 ce-mono text-xs leading-5">{excerpt.map((line, index) => { const n = first + index; const active = n >= issue.line && n <= (issue.endLine || issue.line); return <div key={n} className={`flex min-w-max -mx-1 px-1 ${active ? 'bg-amber-500/15 border-l-2 border-amber-400' : ''}`}><span className="w-9 shrink-0 text-[#8da69a] select-none">{n}</span><span className="whitespace-pre">{line || ' '}</span></div>; })}</div>}
        <p className="ce-muted mt-3 text-sm leading-6">{issue.description}</p>
      </section>
      <section className="rounded-xl border ce-line p-4" style={{background:'var(--ce-surface-2)'}}><h3 className="flex items-center gap-2 text-sm font-semibold"><Lightbulb size={16} className="ce-accent"/>Recommended change</h3><p className="mt-2 text-sm leading-6">{issue.recommendation || 'Inspect the highlighted code and verify the behavior before changing it.'}</p></section>
      {issue.fix?.replacement && <section><div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Proposed edit</h3><button type="button" onClick={copyFix} className="ce-ghost ce-focus inline-flex items-center gap-1 rounded px-2 py-1 text-xs">{copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Copied' : 'Copy'}</button></div><pre className="mt-3 rounded-lg border ce-line overflow-x-auto p-3 ce-mono text-xs leading-5" style={{background:'var(--ce-action-soft)'}}>{issue.fix.replacement}</pre></section>}
    </div>
    <div className="border-t ce-line p-4">
      {issue.fix && preview ? <button type="button" onClick={() => preview(issue)} disabled={isStale || busy} className="ce-button ce-action ce-focus w-full">Preview suggested edit <ArrowRight size={16}/></button> : canSuggest ? <button type="button" onClick={() => onGenerateRefactor(issue)} disabled={isStale || busy} className="ce-button ce-action ce-focus w-full">{busy ? 'Generating…' : 'Suggest a fix with AI'}</button> : <div className="ce-muted flex items-start gap-2 text-xs leading-5"><ShieldCheck size={16} className="shrink-0 mt-0.5"/><span>{isStale ? 'Code changed. Run the review again before applying a fix.' : 'Review this recommendation against your code. Automated fix unavailable for this finding.'}</span></div>}
    </div>
  </section>;
}
