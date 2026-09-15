import React, { useState, useMemo } from 'react';
import { CheckCircle2, Wrench, Play, Loader2 } from 'lucide-react';
import { filterIssues, sortIssues, getSeverityCounts } from '../utils/reviewHelpers.js';
import { Button } from './ui/Button.jsx';

export function IssuePanel({
  issues = [],
  selectedIssueId,
  onSelectIssue,
  reviewStatus = 'IDLE',
  onRunReview = null,
  isStale = false,
  filename = 'auth.js',
  className = '',
  externalCategoryFilter = null,
  onClearCategoryFilter = null,
}) {
  const [severityFilter, setSeverityFilter] = useState('ALL');

  // Compute severity counts
  const counts = getSeverityCounts(issues);

  // Sort deterministically (CRITICAL -> HIGH -> MEDIUM -> LOW, then line number)
  const sorted = sortIssues(issues);

  // Apply filters
  const displayedIssues = useMemo(() => {
    let result = filterIssues(sorted, severityFilter);
    if (externalCategoryFilter && externalCategoryFilter !== 'ALL') {
      result = result.filter(
        (i) => i.category?.toUpperCase() === externalCategoryFilter.toUpperCase()
      );
    }
    return result;
  }, [sorted, severityFilter, externalCategoryFilter]);

  const filterTabs = [
    { key: 'ALL', label: 'All', count: counts.ALL },
    { key: 'CRITICAL', label: 'Critical', count: counts.CRITICAL },
    { key: 'HIGH', label: 'High', count: counts.HIGH },
    { key: 'MEDIUM', label: 'Medium', count: counts.MEDIUM },
    { key: 'LOW', label: 'Low', count: counts.LOW },
  ];

  return (
    <aside
      aria-label="Findings queue"
      className={`bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden select-none font-sans ${className}`}
    >
      {/* Rail Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Needs Attention
          </h2>
          {reviewStatus !== 'IDLE' && (
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-bold border border-slate-300/60">
              {issues.length}
            </span>
          )}
        </div>

        {isStale && (
          <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
            Stale
          </span>
        )}
      </div>

      {/* Category Filter Notice */}
      {externalCategoryFilter && externalCategoryFilter !== 'ALL' && (
        <div className="px-3 py-1.5 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between text-xs text-emerald-800 font-medium shrink-0">
          <span>Filtered by {externalCategoryFilter}</span>
          {onClearCategoryFilter && (
            <button
              type="button"
              onClick={onClearCategoryFilter}
              className="text-[11px] underline hover:text-emerald-950 cursor-pointer font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Severity Filter Tabs */}
      {reviewStatus !== 'IDLE' && issues.length > 0 && (
        <div className="px-3 py-1.5 border-b border-slate-200 flex items-center gap-1 overflow-x-auto text-[11px] shrink-0 bg-slate-50/70">
          {filterTabs.map((tab) => {
            const isActive = severityFilter === tab.key;
            if (tab.key !== 'ALL' && tab.count === 0) return null;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSeverityFilter(tab.key)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 font-semibold shadow-dev-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono ${isActive ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {reviewStatus === 'IDLE' ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-3 text-brand-600 shadow-dev-sm">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
            <p className="text-xs font-semibold text-slate-800 mb-1">
              Ready to review
            </p>
            <p className="text-xs text-slate-500 mb-4 max-w-[200px] leading-relaxed">
              Click Run Review or press ⌘↵ to start analysis.
            </p>
            {onRunReview && (
              <Button
                variant="primary"
                size="sm"
                onClick={onRunReview}
                leftIcon={<Play className="w-3 h-3 fill-current" />}
              >
                Run Review
              </Button>
            )}
          </div>
        ) : reviewStatus === 'ANALYZING' ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600 mb-2" />
            <p className="text-xs font-semibold text-slate-800">
              Analyzing code...
            </p>
          </div>
        ) : displayedIssues.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <CheckCircle2 className="w-6 h-6 text-brand-600 mb-2" />
            <p className="text-xs font-semibold text-slate-800">
              {issues.length === 0 ? 'All checks passed' : 'No matching issues'}
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px] leading-relaxed">
              {issues.length === 0
                ? 'Zero vulnerabilities or regressions detected.'
                : 'Try choosing another filter.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayedIssues.map((issue) => {
              const isSelected = selectedIssueId === issue.id;
              const hasFix = Boolean(issue.fix);
              const isAi = issue.source === 'AI';

              return (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => onSelectIssue(issue.id)}
                  className={`w-full text-left px-4 py-3 transition-all flex flex-col gap-1 cursor-pointer border-l-2 ${
                    isSelected
                      ? 'bg-emerald-50/60 text-slate-900 border-l-brand-600 shadow-dev-sm'
                      : 'border-l-transparent hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {/* Title & Severity */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 mt-1 ${
                          issue.severity === 'CRITICAL'
                            ? 'bg-red-500'
                            : issue.severity === 'HIGH'
                            ? 'bg-amber-500'
                            : issue.severity === 'MEDIUM'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-xs font-bold text-slate-900 leading-snug truncate">
                        {issue.title}
                      </span>
                    </div>

                    {hasFix && (
                      <span
                        title="Verified patch available"
                        className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-0.5 shrink-0"
                      >
                        <Wrench className="w-2.5 h-2.5" />
                        <span>Fix</span>
                      </span>
                    )}
                  </div>

                  {/* Location & Provenance */}
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 pl-4">
                    <span className="text-slate-600">
                      {filename}:{issue.line}
                      {issue.endLine && issue.endLine !== issue.line ? `-${issue.endLine}` : ''}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                        isAi
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                          : 'text-blue-700 bg-blue-50 border border-blue-200'
                      }`}
                    >
                      {isAi ? 'AI' : 'AST'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
