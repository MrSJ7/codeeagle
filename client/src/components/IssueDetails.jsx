import React, { useState } from 'react';
import { ArrowRight, Check, Copy, ShieldCheck } from 'lucide-react';

export function IssueDetails({ issue, onPreviewAiPatch, onPreviewPatch, onGenerateRefactor, isAiConfigured = false, isGeneratingRefactor = false, isStale = false, isApplyingPatch = false, isVerifyingAiPatch = false, filename = 'source.js', code = '', className = '' }) {
  const [copied, setCopied] = useState(false);
  if (!issue) return <section aria-label="Finding details" className={`flex items-center justify-center p-8 text-center bg-white dark:bg-[#11110f] text-sm text-slate-500 dark:text-[#aaa59b] ${className}`}>Select a finding to inspect the evidence and next step.</section>;
  const lines = code.split('\n');
  const first = Math.max(1, issue.line - 2);
  const last = Math.min(lines.length, Math.max(issue.endLine || issue.line, issue.line) + 2);
  const excerpt = lines.slice(first - 1, last);
  const preview = onPreviewAiPatch || onPreviewPatch;
  const busy = isGeneratingRefactor || isApplyingPatch || isVerifyingAiPatch;
  const canSuggest = !issue.fix && isAiConfigured && onGenerateRefactor;
  const copyFix = async () => {
    try { await navigator.clipboard.writeText(issue.fix.replacement); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };
  return <section aria-label={`Finding details for ${issue.title}`} className={`flex flex-col min-h-0 bg-white dark:bg-[#11110f] ${className}`}>
    <div className="px-5 pt-5 pb-4 border-b border-slate-200 dark:border-[#292824]">
      <p className="text-[10px] uppercase tracking-[.19em] font-semibold text-orange-600 dark:text-orange-400">Finding detail</p>
      <h2 className="text-xl leading-tight font-semibold tracking-tight text-slate-950 dark:text-[#f6f2e9] mt-2">{issue.title}</h2>
      <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] font-mono text-slate-500 dark:text-[#a9a399]"><span className={`rounded px-1.5 py-1 font-semibold ${issue.severity === 'CRITICAL' ? 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300' : issue.severity === 'HIGH' ? 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300' : 'bg-slate-100 text-slate-700 dark:bg-[#312e28] dark:text-[#d3cdc2]'}`}>{issue.severity}</span><span>{issue.rule}</span><span>·</span><span>{issue.source === 'AI' ? 'AI review' : 'Static check'}</span></div>
    </div>
    <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-6">
      <div>
        <div className="flex items-center justify-between"><h3 className="text-[11px] uppercase tracking-widest font-semibold text-slate-500 dark:text-[#a9a399]">Evidence</h3><span className="text-[11px] font-mono text-slate-500 dark:text-[#a9a399]">{issue.path || filename}:{issue.line}</span></div>
        {excerpt.length > 0 && <div className="mt-3 rounded-lg overflow-hidden bg-[#181917] border border-[#33342f] p-3 font-mono text-[11px] leading-5 text-[#deded4]">{excerpt.map((line, index) => <div key={first + index} className={`flex min-w-0 px-1 ${first + index >= issue.line && first + index <= (issue.endLine || issue.line) ? 'bg-orange-500/15 text-orange-100' : ''}`}><span className="w-8 shrink-0 text-[#797a70] select-none">{first + index}</span><span className="min-w-0 whitespace-pre-wrap break-all">{line || ' '}</span></div>)}</div>}
        <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-[#d6d1c7]">{issue.description}</p>
      </div>
      <div><h3 className="text-[11px] uppercase tracking-widest font-semibold text-slate-500 dark:text-[#a9a399]">What to change</h3><p className="mt-2 text-sm leading-6 text-slate-700 dark:text-[#d6d1c7]">{issue.recommendation}</p></div>
      {issue.fix?.replacement && <div><div className="flex items-center justify-between"><h3 className="text-[11px] uppercase tracking-widest font-semibold text-slate-500 dark:text-[#a9a399]">Proposed edit</h3><button type="button" onClick={copyFix} className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 focus-visible:outline-2 focus-visible:outline-orange-500">{copied ? <Check size={13}/> : <Copy size={13}/>} {copied ? 'Copied' : 'Copy'}</button></div><pre className="mt-3 p-3 text-xs leading-5 rounded-lg overflow-x-auto bg-emerald-50 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900">{issue.fix.replacement}</pre></div>}
    </div>
    <div className="px-5 py-4 border-t border-slate-200 dark:border-[#292824]">
      {issue.fix && preview ? <button type="button" onClick={() => preview(issue)} disabled={isStale || busy} className="w-full min-h-11 flex items-center justify-center gap-2 rounded-md bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-[#15120f] text-sm font-semibold focus-visible:outline-2 focus-visible:outline-orange-500">Preview suggested edit <ArrowRight size={16}/></button> : canSuggest ? <button type="button" onClick={() => onGenerateRefactor(issue)} disabled={isStale || busy} className="w-full min-h-11 rounded-md bg-orange-500 disabled:opacity-50 text-[#15120f] text-sm font-semibold">{busy ? 'Generating…' : 'Suggest a fix with AI'}</button> : <div className="flex items-start gap-2 text-xs leading-5 text-slate-500 dark:text-[#aaa59b]"><ShieldCheck size={15} className="shrink-0 mt-0.5"/><span>{isStale ? 'Code changed. Run the review again before applying a fix.' : 'Review this recommendation against your code. Automated fix unavailable for this finding.'}</span></div>}
    </div>
  </section>;
}
