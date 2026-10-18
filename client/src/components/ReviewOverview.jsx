import React from 'react';
import { ArrowUpRight, Check, FileCode2, ShieldAlert } from 'lucide-react';

const CATEGORIES = [
  ['security', 'Security'],
  ['quality', 'Correctness & quality'],
  ['performance', 'Performance'],
  ['complexity', 'Complexity'],
];

export function ReviewOverview({
  reviewData,
  filename = 'source.js',
  language = 'JavaScript',
  lineCount = 0,
  onNavigateFindings,
  onSelectIssue,
  className = '',
}) {
  if (!reviewData) return null;
  const { score = 100, breakdown = {}, issues = [], metadata = {} } = reviewData;
  const scoreValue = Math.max(0, Math.min(100, Math.round(score)));
  const topIssues = issues.slice(0, 5);
  const aiUsed = metadata.aiStatus === 'USED';
  const verdict = issues.length === 0
    ? 'No findings in this review'
    : issues.some((issue) => issue.severity === 'CRITICAL')
      ? 'Critical findings need review'
      : issues.some((issue) => issue.severity === 'HIGH')
        ? 'Prioritize these findings'
        : 'Review the suggested improvements';

  const openIssue = (issue) => {
    onSelectIssue?.(issue.id);
    onNavigateFindings?.();
  };

  return (
    <div className={`h-full overflow-y-auto bg-[#f6f5f2] dark:bg-[#0c0d0d] text-slate-900 dark:text-[#ecece7] ${className}`}>
      <div className="max-w-6xl mx-auto px-5 sm:px-10 py-8 sm:py-12 space-y-10">
        <header className="grid lg:grid-cols-[1fr_auto] gap-8 items-end border-b border-slate-200 dark:border-[#292b2b] pb-10">
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500 dark:text-[#aaa9a2]">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              Review report
            </div>
            <div>
              <h1 className="text-[clamp(2rem,5vw,4.2rem)] leading-[1.04] tracking-[-0.055em] font-semibold text-balance max-w-[16ch]">
                {verdict}
              </h1>
              <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-[#a8a9a3] max-w-2xl leading-relaxed">
                {issues.length === 0
                  ? 'The enabled checks found no issues in this file. Run tests and review behavior before shipping.'
                  : `${issues.length} ${issues.length === 1 ? 'finding' : 'findings'} in ${filename}, ordered by severity. Open a finding to inspect evidence and a suggested next step.`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-[#9c9d97] font-mono">
              <span className="inline-flex items-center gap-1.5"><FileCode2 className="w-3.5 h-3.5" />{filename}</span>
              <span>{language}</span>
              <span>{lineCount} lines</span>
              <span className="text-slate-700 dark:text-[#c8c9c3]">{aiUsed ? 'Static + AI checks' : 'Static checks only'}</span>
            </div>
          </div>
          <div className="lg:text-right">
            <div className="text-[11px] font-mono uppercase tracking-[0.17em] text-slate-500 dark:text-[#9c9d97] mb-1">Review score</div>
            <div className="font-mono tabular-nums tracking-[-0.08em] leading-none text-[clamp(4rem,8vw,7rem)] font-semibold">
              {scoreValue}<span className="text-xl tracking-normal text-slate-400 dark:text-[#696b68]">/100</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#9c9d97] mt-2">A weighted summary of detected issues</p>
          </div>
        </header>

        <section aria-label="Review score breakdown" className="grid md:grid-cols-4 gap-3">
          {CATEGORIES.map(([key, label]) => {
            const value = Math.max(0, Math.min(100, breakdown[key] ?? 100));
            return (
              <div key={key} className="bg-white dark:bg-[#151716] border border-slate-200 dark:border-[#2a2c2b] rounded-lg p-5">
                <div className="flex justify-between items-start gap-3">
                  <h2 className="text-sm font-medium">{label}</h2>
                  <span className="font-mono tabular-nums text-sm text-slate-600 dark:text-[#b9bab4]">{value}</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-[#303330] rounded-full mt-8 overflow-hidden" role="meter" aria-label={`${label} score`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
                  <div className={`h-full rounded-full ${value < 60 ? 'bg-red-500' : value < 85 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${value}%` }} />
                </div>
              </div>
            );
          })}
        </section>

        <section aria-labelledby="findings-title" className="grid lg:grid-cols-[minmax(0,1fr)_17rem] gap-8">
          <div>
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-orange-600 dark:text-orange-400 mb-2">Next steps</p>
                <h2 id="findings-title" className="text-2xl sm:text-3xl font-semibold tracking-[-0.04em]">Findings to inspect</h2>
              </div>
              <span className="font-mono text-xs text-slate-500 dark:text-[#9c9d97]">{issues.length} total</span>
            </div>
            {topIssues.length ? (
              <div className="border-t border-slate-200 dark:border-[#2a2c2b]">
                {topIssues.map((issue, index) => (
                  <button key={issue.id} type="button" onClick={() => openIssue(issue)}
                    className="w-full group text-left flex items-start gap-4 py-4 border-b border-slate-200 dark:border-[#2a2c2b] hover:bg-slate-100/70 dark:hover:bg-[#171918] focus-visible:outline-2 focus-visible:outline-orange-500 transition-colors">
                    <span className="font-mono text-xs text-slate-400 dark:text-[#858780] pt-1 w-7 shrink-0">{String(index + 1).padStart(2, '0')}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm sm:text-base font-semibold">{issue.title}</span>
                        <span className={`text-[10px] font-mono uppercase tracking-wide ${issue.severity === 'CRITICAL' ? 'text-red-600 dark:text-red-400' : issue.severity === 'HIGH' ? 'text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-[#a4a6a0]'}`}>{issue.severity}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a8a9a3] mt-1 line-clamp-2">{issue.description}</p>
                      <span className="text-xs font-mono text-slate-500 dark:text-[#8e908a] mt-2 inline-block">Line {issue.line} · {issue.source === 'AI' ? 'AI suggestion' : 'Static rule'}</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-orange-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
                {issues.length > topIssues.length && (
                  <button type="button" onClick={onNavigateFindings} className="mt-4 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline focus-visible:outline-2 focus-visible:outline-orange-500">
                    View all {issues.length} findings →
                  </button>
                )}
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-[#2a2c2b] rounded-lg bg-white dark:bg-[#151716] p-6 flex items-start gap-4">
                <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                <div><h3 className="font-semibold">No findings detected</h3><p className="text-sm text-slate-600 dark:text-[#a8a9a3] mt-1">This result reflects the enabled checks and the single file reviewed.</p></div>
              </div>
            )}
          </div>
          <aside className="bg-[#edeae3] dark:bg-[#1a1c1a] rounded-lg p-5 h-fit border border-slate-200 dark:border-[#30332f]">
            <ShieldAlert className="w-5 h-5 text-orange-600 dark:text-orange-400 mb-4" />
            <h3 className="font-semibold text-sm">How to use this report</h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-[#aaa9a2] mt-2">
              Findings are leads, not proof. Check each one in context. Preview edits, then run your tests after applying a fix.
            </p>
          </aside>
        </section>
      </div>
    </div>
  );
}
