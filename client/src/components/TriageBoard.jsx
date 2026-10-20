import React from 'react';
import { AlertCircle, CheckCircle2, Clock, GitPullRequest, ArrowRight, ShieldAlert, Sparkles, Filter } from 'lucide-react';

/**
 * 02 TRIAGE: PR Priority & Blocker Matrix Component.
 * Reverse-engineered from CodeRabbit's Triage Board (source-25).
 * Divides review findings into:
 * - 'Now': Capacity-prioritized immediate blockers (P0/P1) that block merge or cause regressions.
 * - 'Next': Async reviews (P2/P3) that can be handled asynchronously without stopping delivery.
 */
export default function TriageBoard({
  issues = [],
  filename = 'source.js',
  onSelectIssue,
  onApplyFix,
  score = 100,
}) {
  // Partition issues into Now (P0/P1 blockers) vs Next (P2/P3 polish)
  const nowIssues = issues.filter(
    (i) => i.severity === 'CRITICAL' || i.severity === 'HIGH' || i.rule?.startsWith('SEC-')
  );

  const nextIssues = issues.filter(
    (i) => i.severity !== 'CRITICAL' && i.severity !== 'HIGH' && !i.rule?.startsWith('SEC-')
  );

  const isBlocked = nowIssues.length > 0;

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-slate-50 dark:bg-obsidian-950 p-4 sm:p-6 space-y-6">
      {/* Triage Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-900 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
              02 TRIAGE
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-obsidian-100">
              PR Triage &amp; Blocker Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-obsidian-400 mt-1">
            Prioritizes merge blockers and security hazards so you review high-impact changes first.
          </p>
        </div>

        {/* Verdict Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-400 block">Merge Status</span>
            <span
              className={`text-xs font-mono font-bold uppercase tracking-wider ${
                isBlocked ? 'text-red-500' : 'text-emerald-500'
              }`}
            >
              {isBlocked ? 'Blocked by P0/P1' : 'Ready to Merge'}
            </span>
          </div>
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
              isBlocked
                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            }`}
          >
            {isBlocked ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-900">
          <span className="text-[11px] font-mono text-slate-400">P0/P1 Blockers (Now)</span>
          <div className="text-xl font-bold font-mono text-red-500 mt-1">{nowIssues.length}</div>
        </div>
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-900">
          <span className="text-[11px] font-mono text-slate-400">Async Polish (Next)</span>
          <div className="text-xl font-bold font-mono text-blue-500 mt-1">{nextIssues.length}</div>
        </div>
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-900">
          <span className="text-[11px] font-mono text-slate-400">Quality Health Score</span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-obsidian-100 mt-1">
            {score} <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </div>
        </div>
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-900">
          <span className="text-[11px] font-mono text-slate-400">Est. Review Time</span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-obsidian-100 mt-1">
            ~{Math.max(1, Math.ceil(issues.length * 1.5))}m
          </div>
        </div>
      </div>

      {/* Kanban Board Columns: Now vs Next */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1 min-h-0">
        {/* NOW COLUMN */}
        <div className="flex flex-col rounded-xl border border-red-500/20 bg-red-500/[0.02] dark:bg-red-950/[0.04] p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-red-500/20">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-obsidian-100">Now</h3>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-obsidian-400">
                Within immediate capacity · Merge blockers &amp; security
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-mono text-xs font-bold">
              {nowIssues.length} {nowIssues.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto flex-1 pr-1">
            {nowIssues.length === 0 ? (
              <div className="p-8 text-center rounded-lg border border-dashed border-emerald-500/30 bg-emerald-500/[0.03]">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  Zero P0/P1 blockers
                </div>
                <p className="text-[11px] text-slate-500 dark:text-obsidian-400 mt-1">
                  All critical security, syntax, and error bounds are clean.
                </p>
              </div>
            ) : (
              nowIssues.map((issue) => {
                const isCritical = issue.severity === 'CRITICAL';
                const priorityTag = isCritical ? 'P0' : 'P1';

                return (
                  <div
                    key={issue.id}
                    className="p-4 rounded-lg border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-900 shadow-sm space-y-2.5 hover:border-red-500/40 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isCritical
                            ? 'bg-red-500 text-white'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {priorityTag}
                      </span>
                      <span className="font-semibold text-xs text-slate-900 dark:text-obsidian-100 flex-1 leading-snug">
                        {issue.title || issue.message}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Line {issue.line}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-obsidian-400 leading-relaxed font-sans">
                      {issue.explanation || issue.recommendation || issue.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-obsidian-850">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-obsidian-800 text-[10px] font-mono text-slate-600 dark:text-obsidian-400">
                        {issue.category || 'SECURITY'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-mono">
                        {issue.rule}
                      </span>

                      <div className="ml-auto flex items-center gap-2">
                        {issue.fix && onApplyFix && (
                          <button
                            type="button"
                            onClick={() => onApplyFix(issue)}
                            className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            Apply Fix
                          </button>
                        )}
                        {onSelectIssue && (
                          <button
                            type="button"
                            onClick={() => onSelectIssue(issue.id)}
                            className="text-[10px] font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-0.5"
                          >
                            Review <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* NEXT COLUMN */}
        <div className="flex flex-col rounded-xl border border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-900/20 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-obsidian-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-obsidian-100">Next</h3>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-obsidian-400">
                All remaining reviews · Async polish &amp; maintainability
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-obsidian-800 text-slate-600 dark:text-obsidian-400 font-mono text-xs font-bold">
              {nextIssues.length} {nextIssues.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto flex-1 pr-1">
            {nextIssues.length === 0 ? (
              <div className="p-8 text-center rounded-lg border border-dashed border-slate-200 dark:border-obsidian-800 text-slate-400 text-xs">
                No non-blocking items remaining in queue.
              </div>
            ) : (
              nextIssues.map((issue) => {
                const priorityTag = issue.severity === 'MEDIUM' ? 'P2' : 'P3';

                return (
                  <div
                    key={issue.id}
                    className="p-4 rounded-lg border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-900 shadow-sm space-y-2.5 opacity-90 hover:opacity-100 hover:border-slate-300 dark:hover:border-obsidian-700 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {priorityTag}
                      </span>
                      <span className="font-semibold text-xs text-slate-900 dark:text-obsidian-100 flex-1 leading-snug">
                        {issue.title || issue.message}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Line {issue.line}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-obsidian-400 leading-relaxed font-sans">
                      {issue.explanation || issue.recommendation || issue.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-obsidian-850">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-obsidian-800 text-[10px] font-mono text-slate-600 dark:text-obsidian-400">
                        {issue.category || 'QUALITY'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-obsidian-800 text-slate-500 text-[10px] font-mono">
                        {issue.rule}
                      </span>

                      <div className="ml-auto flex items-center gap-2">
                        {onSelectIssue && (
                          <button
                            type="button"
                            onClick={() => onSelectIssue(issue.id)}
                            className="text-[10px] font-semibold text-slate-600 dark:text-obsidian-300 hover:text-orange-500 flex items-center gap-0.5"
                          >
                            Inspect <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
