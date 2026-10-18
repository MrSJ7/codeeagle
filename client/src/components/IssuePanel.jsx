import React, { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, Search, SlidersHorizontal } from 'lucide-react';
import { sortIssues } from '../utils/reviewHelpers.js';

const advisory = (issue) => issue.severity === 'LOW' && (issue.impactWeight ?? 1) <= 0.25;

export function IssuePanel({ issues = [], selectedIssueId, onSelectIssue, reviewStatus = 'IDLE', onRunReview, isStale, filename = 'source.js', className = '', externalCategoryFilter, onClearCategoryFilter }) {
  const [view, setView] = useState('focus');
  const [query, setQuery] = useState('');
  const focusCount = issues.filter((issue) => !advisory(issue)).length;
  const advisoryCount = issues.length - focusCount;
  useEffect(() => { const selected = issues.find((issue) => issue.id === selectedIssueId); if (selected) setView(advisory(selected) ? 'advisory' : 'focus'); }, [selectedIssueId]);
  const displayed = useMemo(() => sortIssues(issues).filter((issue) =>
    (view === 'focus' ? !advisory(issue) : advisory(issue)) &&
    (!externalCategoryFilter || externalCategoryFilter === 'ALL' || issue.category?.toUpperCase() === externalCategoryFilter.toUpperCase()) &&
    (issue.title + issue.rule + issue.description).toLowerCase().includes(query.toLowerCase())
  ), [issues, view, query, externalCategoryFilter]);

  return <aside aria-label="Review findings" className={`ce-surface flex min-h-0 flex-col ${className}`}>
    <div className="border-b ce-line px-4 pb-4 pt-5 sm:px-5"><div className="flex items-baseline justify-between gap-3"><div><p className="ce-label">Review queue</p><h2 className="mt-1 text-2xl font-semibold tracking-[-.045em]">Findings <span className="ce-muted ce-mono text-lg">{issues.length}</span></h2></div>{isStale && <span className="ce-severity-high text-xs font-semibold">Needs rerun</span>}</div>
      {reviewStatus !== 'IDLE' && <><div role="group" aria-label="Finding priority" className="mt-5 grid grid-cols-2 border-b ce-line">{[['focus', `Focus · ${focusCount}`], ['advisory', `Advisory · ${advisoryCount}`]].map(([key,label]) => <button key={key} type="button" onClick={() => setView(key)} aria-pressed={view === key} className="ce-tab ce-focus">{label}</button>)}</div><label className="ce-outline ce-focus mt-4 flex min-h-11 items-center gap-2 rounded-lg px-3"><Search size={17} className="ce-muted"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search findings" aria-label="Search findings" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--ce-muted)]"/></label>{externalCategoryFilter && externalCategoryFilter !== 'ALL' && <button type="button" onClick={onClearCategoryFilter} className="ce-accent ce-focus mt-3 inline-flex items-center gap-1 text-xs font-semibold hover:underline"><SlidersHorizontal size={13}/>{externalCategoryFilter} filter · Clear</button>}</>}
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto">
      {reviewStatus === 'IDLE' ? <div className="p-6"><h3 className="font-semibold">Ready to review</h3><p className="ce-muted mt-2 text-sm leading-6">Run a review to inspect findings in this file.</p><button type="button" onClick={onRunReview} className="ce-action ce-focus ce-button mt-5">Run review</button></div>
      : reviewStatus === 'ANALYZING' ? <div className="flex items-center gap-3 p-6 text-sm ce-muted"><Loader2 size={18} className="animate-spin"/>Analyzing source…</div>
      : displayed.length === 0 ? <div className="p-6"><Check size={22} className="ce-accent"/><h3 className="mt-4 font-semibold">{issues.length === 0 ? 'No findings from enabled checks' : view === 'focus' && focusCount === 0 ? 'No priority findings' : 'No matching findings'}</h3><p className="ce-muted mt-2 text-sm leading-6">{view === 'focus' && advisoryCount > 0 ? 'Lower-impact suggestions are under Advisory.' : 'Try another search or filter.'}</p></div>
      : <div>{displayed.map((issue) => <button key={issue.id} type="button" onClick={() => onSelectIssue(issue.id)} aria-current={selectedIssueId === issue.id ? 'true' : undefined} className="ce-issue-row ce-focus w-full px-4 py-4 text-left sm:px-5"><span className="flex flex-wrap items-center justify-between gap-2"><span className={`ce-mono text-[11px] font-semibold ce-severity-${issue.severity.toLowerCase()}`}>{issue.severity} · {issue.rule}</span>{issue.fix && <span className="ce-accent text-xs font-semibold">Fix ready</span>}</span><strong className="mt-2 block text-sm leading-6">{issue.title}</strong><span className="ce-muted mt-1 block line-clamp-2 text-xs leading-5">{issue.description}</span><span className="ce-muted ce-mono mt-3 block truncate text-[11px]">{issue.path || filename}:{issue.line}</span></button>)}</div>}
    </div>
    <div className="ce-muted border-t ce-line px-5 py-3 text-xs">Select a finding to see evidence and a next step.</div>
  </aside>;
}
