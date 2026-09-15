import React, { useState, useMemo } from 'react';
import { CheckCircle2, Play, Loader2 } from 'lucide-react';
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
      className={`bg-obsidian-900 border-r border-obsidian-800 flex flex-col h-full overflow-hidden select-none font-sans ${className}`}
    >
      {/* Rail Header */}
      <div className="px-4 py-3 border-b border-obsidian-800 flex items-center justify-between shrink-0 bg-obsidian-850">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-obsidian-100">
            Needs Attention
          </h2>
          {reviewStatus !== 'IDLE' && (
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-[4px] bg-obsidian-800 text-obsidian-300 font-bold border border-obsidian-700">
              {issues.length}
            </span>
          )}
        </div>

        {isStale && (
          <span className="text-[10px] font-mono text-amber-300 bg-amber-950/40 border border-amber-800/50 px-1.5 py-0.5 rounded-[4px] font-medium">
            Stale
          </span>
        )}
      </div>

      {/* Category Filter Notice */}
      {externalCategoryFilter && externalCategoryFilter !== 'ALL' && (
        <div className="px-3 py-1.5 bg-brand-500/10 border-b border-brand-500/30 flex items-center justify-between text-xs text-brand-400 font-medium shrink-0">
          <span>Filtered by {externalCategoryFilter}</span>
          {onClearCategoryFilter && (
            <button
              type="button"
              onClick={onClearCategoryFilter}
              className="text-[11px] underline hover:text-brand-300 cursor-pointer font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Severity Filter Tabs */}
      {reviewStatus !== 'IDLE' && issues.length > 0 && (
        <div className="px-3 py-1.5 border-b border-obsidian-800 flex items-center gap-1 overflow-x-auto text-[11px] shrink-0 bg-obsidian-900">
          {filterTabs.map((tab) => {
            const isActive = severityFilter === tab.key;
            if (tab.key !== 'ALL' && tab.count === 0) return null;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSeverityFilter(tab.key)}
                className={`px-2 py-0.5 rounded-[4px] text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-obsidian-800 text-obsidian-50 font-semibold shadow-sm border border-obsidian-700'
                    : 'text-obsidian-400 hover:text-obsidian-200 hover:bg-obsidian-850'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono ${isActive ? 'text-brand-400 font-bold' : 'text-obsidian-500'}`}>
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
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-obsidian-400">
            <div className="w-9 h-9 rounded-[6px] bg-obsidian-850 border border-obsidian-750 flex items-center justify-center mb-3 text-brand-500 shadow-sm">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
            <p className="text-xs font-semibold text-obsidian-200 mb-1">
              Ready to review
            </p>
            <p className="text-xs text-obsidian-400 mb-4 max-w-[200px] leading-relaxed">
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
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-obsidian-400">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500 mb-2" />
            <p className="text-xs font-semibold text-obsidian-200">
              Analyzing code...
            </p>
          </div>
        ) : displayedIssues.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-obsidian-400">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-2" />
            <p className="text-xs font-semibold text-obsidian-200">
              {issues.length === 0 ? 'All checks passed' : 'No matching issues'}
            </p>
            <p className="text-xs text-obsidian-500 mt-1 max-w-[200px] leading-relaxed">
              {issues.length === 0
                ? 'Zero vulnerabilities or regressions detected.'
                : 'Try choosing another filter.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-obsidian-800">
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
                      ? 'bg-obsidian-800 text-obsidian-50 border-l-brand-500 shadow-sm'
                      : 'border-l-transparent hover:bg-obsidian-850 text-obsidian-300'
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
                            ? 'bg-orange-500'
                            : issue.severity === 'MEDIUM'
                            ? 'bg-amber-500'
                            : 'bg-obsidian-400'
                        }`}
                        aria-hidden="true"
                      />
                      <span className={`text-xs font-bold leading-snug truncate ${isSelected ? 'text-obsidian-50' : 'text-obsidian-200'}`}>
                        {issue.title}
                      </span>
                    </div>

                    {hasFix && (
                      <span
                        title="Verified patch available"
                        className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[3px] bg-emerald-950/40 text-emerald-400 border border-emerald-800/60 shrink-0"
                      >
                        PATCH
                      </span>
                    )}
                  </div>

                  {/* Location & Provenance */}
                  <div className="flex items-center gap-2 text-[11px] font-mono text-obsidian-400 pl-4">
                    <span className="text-obsidian-300">
                      {filename}:{issue.line}
                      {issue.endLine && issue.endLine !== issue.line ? `-${issue.endLine}` : ''}
                    </span>
                    <span className="text-obsidian-600">•</span>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.2 rounded-[3px] font-bold ${
                        isAi
                          ? 'text-brand-400 bg-brand-500/15 border border-brand-500/30'
                          : 'text-obsidian-300 bg-obsidian-800 border border-obsidian-700'
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
