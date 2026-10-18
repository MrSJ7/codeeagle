import React, { useMemo, useState } from 'react';
import { CheckCircle2, Loader2, Search } from 'lucide-react';
import { sortIssues } from '../utils/reviewHelpers.js';

const advisory = (issue) => issue.severity === 'LOW' && (issue.impactWeight ?? 1) <= 0.25;

export function IssuePanel({ issues = [], selectedIssueId, onSelectIssue, reviewStatus = 'IDLE', onRunReview, isStale, filename = 'source.js', className = '', externalCategoryFilter, onClearCategoryFilter }) {
  const [view, setView] = useState('focus');
  const [query, setQuery] = useState('');
  const focusCount = issues.filter((issue) => !advisory(issue)).length;
  const advisoryCount = issues.length - focusCount;
  const displayed = useMemo(() => sortIssues(issues).filter((issue) =>
    (view === 'focus' ? !advisory(issue) : advisory(issue)) &&
    (!externalCategoryFilter || externalCategoryFilter === 'ALL' || issue.category?.toUpperCase() === externalCategoryFilter.toUpperCase()) &&
    (issue.title + issue.rule + issue.description).toLowerCase().includes(query.toLowerCase())
  ), [issues, view, query, externalCategoryFilter]);

  return <aside aria-label="Review findings" className={`flex flex-col min-h-0 bg-white dark:bg-[#11110f] ${className}`}>
    <div className="px-5 pt-5 pb-4 border-b border-slate-200 dark:border-[#292824]">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-[10px] uppercase tracking-[.19em] font-semibold text-orange-600 dark:text-orange-400">Review queue</p><h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-[#f6f2e9] mt-1">Findings <span className="text-slate-400 dark:text-[#8a867f]">{issues.length}</span></h2></div>
        {isStale && <span className="text-xs text-amber-700 dark:text-amber-300">Needs rerun</span>}
      </div>
      {reviewStatus !== 'IDLE' && <>
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-[#22211e] rounded-lg mt-5" role="group" aria-label="Finding priority">
          {[['focus', `Focus · ${focusCount}`], ['advisory', `Advisory · ${advisoryCount}`]].map(([key, label]) => <button key={key} type="button" onClick={() => setView(key)} aria-pressed={view === key} className={`min-h-9 rounded-md text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-orange-500 ${view === key ? 'bg-white dark:bg-[#39362e] text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 dark:text-[#aaa59b]'}`}>{label}</button>)}
        </div>
        <label className="flex items-center gap-2 h-10 mt-3 px-3 border border-slate-200 dark:border-[#38362f] rounded-lg text-slate-500 dark:text-[#aaa59b]"><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search findings" className="w-full bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400"/></label>
        {externalCategoryFilter && externalCategoryFilter !== 'ALL' && <button type="button" onClick={onClearCategoryFilter} className="text-xs text-orange-600 dark:text-orange-400 mt-3 hover:underline">{externalCategoryFilter} filter · Clear</button>}
      </>}
    </div>
    <div className="flex-1 min-h-0 overflow-y-auto">
      {reviewStatus === 'IDLE' ? <div className="p-7 text-center text-slate-500 dark:text-[#aaa59b]"><h3 className="text-base text-slate-900 dark:text-white font-semibold">Ready to review</h3><p className="text-sm mt-2">Run a review to inspect issues in this file.</p><button type="button" onClick={onRunReview} className="mt-5 px-4 py-2 bg-orange-500 text-black font-semibold rounded-md">Run review</button></div>
      : reviewStatus === 'ANALYZING' ? <div className="p-7 text-center text-sm text-slate-500 dark:text-[#aaa59b]"><Loader2 className="animate-spin mx-auto mb-3"/>Analyzing source…</div>
      : displayed.length === 0 ? <div className="p-7 text-center text-slate-500 dark:text-[#aaa59b]"><CheckCircle2 size={27} className="mx-auto mb-4 text-emerald-500"/><h3 className="text-base text-slate-900 dark:text-white font-semibold">{issues.length === 0 ? 'No findings from enabled checks' : view === 'focus' && focusCount === 0 ? 'No actionable findings' : 'No matching findings'}</h3><p className="text-sm mt-2">{view === 'focus' && advisoryCount > 0 ? 'Low impact suggestions are in Advisory.' : 'Try another filter or review your code.'}</p></div>
      : <div className="p-2.5 space-y-1.5">{displayed.map((issue, index) => <button key={issue.id} type="button" onClick={() => onSelectIssue(issue.id)} aria-current={selectedIssueId === issue.id ? 'true' : undefined} className={`w-full text-left rounded-lg p-3.5 border transition-colors focus-visible:outline-2 focus-visible:outline-orange-500 ${selectedIssueId === issue.id ? 'bg-orange-50 border-orange-300 dark:bg-[#2b2319] dark:border-orange-500/50' : 'bg-white border-transparent hover:bg-slate-50 dark:bg-transparent dark:hover:bg-[#22211e]'}`}>
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider"><span className={`w-2 h-2 rounded-full ${issue.severity === 'CRITICAL' ? 'bg-red-500' : issue.severity === 'HIGH' ? 'bg-orange-500' : issue.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-slate-400'}`}/><span className="text-slate-600 dark:text-[#b8b1a5]">{issue.severity}</span><span className="ml-auto text-slate-400 dark:text-[#77736d]">{String(index + 1).padStart(2, '0')}</span></div>
        <h3 className="text-sm font-semibold leading-snug text-slate-950 dark:text-[#f6f2e9] mt-2 line-clamp-2">{issue.title}</h3>
        <p className="text-xs leading-relaxed text-slate-600 dark:text-[#aaa59b] mt-1.5 line-clamp-2">{issue.description}</p>
        <div className="flex items-center gap-2 mt-3 text-[11px] font-mono text-slate-500 dark:text-[#8e8a83]"><span>{issue.path || filename}:{issue.line}</span><span>·</span><span>{issue.rule}</span>{issue.fix && <span className="ml-auto text-emerald-700 dark:text-emerald-400">Fix ready</span>}</div>
      </button>)}</div>}
    </div>
    <div className="px-5 py-3 border-t border-slate-200 dark:border-[#292824] text-[11px] text-slate-500 dark:text-[#8e8a83]">Verify the behavior before applying a suggestion.</div>
  </aside>;
}
