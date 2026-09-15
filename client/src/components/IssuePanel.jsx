import React, { useState, useMemo } from 'react';
import { CheckCircle2, Wrench, Sparkles, Play, Loader2, AlertTriangle } from 'lucide-react';
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
      className={`bg-graphite-900 border-r border-graphite-800 flex flex-col h-full overflow-hidden select-none font-sans ${className}`}
    >
      {/* Rail Header */}
      <div className="px-4 py-3 border-b border-graphite-800 flex items-center justify-between shrink-0 bg-graphite-950">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-graphite-200 uppercase tracking-wider">
            Needs Attention
          </h2>
          {reviewStatus !== 'IDLE' && (
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-graphite-800 text-graphite-300 font-semibold border border-graphite-750">
              {issues.length}
            </span>
          )}
        </div>

        {isStale && (
          <span className="text-[10px] font-mono text-orange-400 bg-orange-950/40 border border-orange-800/40 px-1.5 py-0.5 rounded font-medium">
            Stale
          </span>
        )}
      </div>

      {/* Category Filter Notice */}
      {externalCategoryFilter && externalCategoryFilter !== 'ALL' && (
        <div className="px-3 py-1.5 bg-brand-950/40 border-b border-brand-800/40 flex items-center justify-between text-xs text-brand-300 font-medium shrink-0">
          <span>Filtered by {externalCategoryFilter}</span>
          {onClearCategoryFilter && (
            <button
              type="button"
              onClick={onClearCategoryFilter}
              className="text-[11px] underline hover:text-brand-200 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Severity Filter Tabs */}
      {reviewStatus !== 'IDLE' && issues.length > 0 && (
        <div className="px-3 py-1.5 border-b border-graphite-800 flex items-center gap-1 overflow-x-auto text-[11px] shrink-0 bg-graphite-900">
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
                    ? 'bg-brand-500 text-graphite-950 font-semibold shadow-dev-sm'
                    : 'text-graphite-400 hover:text-graphite-200 hover:bg-graphite-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono ${isActive ? 'text-graphite-950 font-bold' : 'text-graphite-500'}`}>
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
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-graphite-500">
            <div className="w-9 h-9 rounded-full bg-graphite-850 border border-graphite-750 flex items-center justify-center mb-3 text-brand-400 shadow-dev-sm">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
            <p className="text-xs font-semibold text-graphite-200 mb-1">
              Ready to review
            </p>
            <p className="text-xs text-graphite-400 mb-4 max-w-[200px] leading-relaxed">
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
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-graphite-500">
            <Loader2 className="w-6 h-6 animate-spin text-brand-400 mb-2" />
            <p className="text-xs font-semibold text-graphite-200">
              Analyzing code...
            </p>
          </div>
        ) : displayedIssues.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-graphite-500">
            <CheckCircle2 className="w-6 h-6 text-brand-400 mb-2" />
            <p className="text-xs font-semibold text-graphite-200">
              {issues.length === 0 ? 'All checks passed' : 'No matching issues'}
            </p>
            <p className="text-xs text-graphite-400 mt-1 max-w-[200px] leading-relaxed">
              {issues.length === 0
                ? 'Zero vulnerabilities or regressions detected.'
                : 'Try choosing another filter.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-graphite-800">
            {displayedIssues.map((issue) => {
              const isSelected = selectedIssueId === issue.id;
              const hasFix = Boolean(issue.fix);
              const isAi = issue.source === 'AI';

              return (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => onSelectIssue(issue.id)}
                  className={`w-full text-left px-4 py-2.5 transition-all flex flex-col gap-1 border-b cursor-pointer ${
                    isSelected
                      ? 'bg-graphite-850 text-graphite-100 border-graphite-700 border-l-2 border-l-brand-400 shadow-dev-sm'
                      : 'border-graphite-800/50 hover:bg-graphite-850/60 text-graphite-300'
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
                            : 'bg-cyan-400'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-xs font-semibold text-graphite-100 leading-snug truncate">
                        {issue.title}
                      </span>
                    </div>

                    {hasFix && (
                      <span
                        title="Verified patch available"
                        className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-brand-950 text-brand-300 border border-brand-800/80 flex items-center gap-0.5 shrink-0"
                      >
                        <Wrench className="w-2.5 h-2.5" />
                        <span>Fix</span>
                      </span>
                    )}
                  </div>

                  {/* Location & Provenance */}
                  <div className="flex items-center gap-2 text-[11px] font-mono text-graphite-400 pl-4">
                    <span className="text-graphite-300">
                      {filename}:{issue.line}
                      {issue.endLine && issue.endLine !== issue.line ? `-${issue.endLine}` : ''}
                    </span>
                    <span className="text-graphite-600">•</span>
                    <span
                      className={`text-[9px] uppercase px-1 py-0.2 rounded font-bold ${
                        isAi
                          ? 'text-teal-300 bg-teal-950 border border-teal-800/50'
                          : 'text-cyan-300 bg-cyan-950 border border-cyan-800/50'
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
