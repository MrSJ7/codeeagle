import React, { useState, useMemo } from 'react';
import { CheckCircle2, Wrench, Filter, Shield, Zap, Sparkles } from 'lucide-react';
import { filterIssues, sortIssues, getSeverityCounts } from '../utils/reviewHelpers.js';
import { Badge } from './ui/Badge.jsx';

export function IssuePanel({
  issues = [],
  selectedIssueId,
  onSelectIssue,
  isStale = false,
  filename = 'auth.js',
  className = '',
  externalCategoryFilter = null,
  onClearCategoryFilter = null,
}) {
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Compute severity counts
  const counts = getSeverityCounts(issues);

  // Sort deterministically (CRITICAL -> HIGH -> MEDIUM -> LOW, then line number)
  const sorted = sortIssues(issues);

  // Apply both severity and category filters
  const displayedIssues = useMemo(() => {
    let result = filterIssues(sorted, severityFilter);
    const activeCategory = externalCategoryFilter || categoryFilter;
    if (activeCategory && activeCategory !== 'ALL') {
      result = result.filter(
        (i) => i.category?.toUpperCase() === activeCategory.toUpperCase()
      );
    }
    return result;
  }, [sorted, severityFilter, categoryFilter, externalCategoryFilter]);

  // Group displayed issues by severity
  const groupedIssues = useMemo(() => {
    const groups = [
      { key: 'CRITICAL', label: 'Critical', dot: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-950/20', items: [] },
      { key: 'HIGH', label: 'High', dot: 'bg-orange-500', text: 'text-orange-400', bg: 'bg-orange-950/20', items: [] },
      { key: 'MEDIUM', label: 'Medium', dot: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-950/20', items: [] },
      { key: 'LOW', label: 'Low', dot: 'bg-cyan-400', text: 'text-cyan-400', bg: 'bg-cyan-950/20', items: [] },
    ];

    displayedIssues.forEach((issue) => {
      const g = groups.find((grp) => grp.key === issue.severity) || groups[3];
      g.items.push(issue);
    });

    return groups.filter((g) => g.items.length > 0);
  }, [displayedIssues]);

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
      className={`bg-graphite-900 border-r border-graphite-800 flex flex-col h-full overflow-hidden select-none ${className}`}
    >
      {/* Rail Header */}
      <div className="px-4 py-3 border-b border-graphite-800 flex items-center justify-between shrink-0 bg-graphite-950">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-graphite-200 font-sans tracking-tight uppercase">
            Findings Queue
          </h2>
          <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-graphite-800 text-graphite-300 font-semibold border border-graphite-700">
            {issues.length}
          </span>
        </div>

        {isStale && (
          <span className="text-[10px] font-mono text-orange-400 bg-orange-950/40 border border-orange-800/40 px-1.5 py-0.5 rounded font-medium">
            Stale
          </span>
        )}
      </div>

      {/* Category Filter Notice (if filtered via Summary Bar) */}
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

      {/* Grouped Findings Rail */}
      <div className="flex-1 overflow-y-auto">
        {displayedIssues.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-graphite-500">
            <CheckCircle2 className="w-6 h-6 text-brand-400 mb-2" />
            <p className="text-xs font-semibold text-graphite-200">
              {issues.length === 0 ? 'No issues detected' : 'No matching issues'}
            </p>
            <p className="text-xs text-graphite-400 mt-1 max-w-[200px] leading-relaxed font-sans">
              {issues.length === 0
                ? 'Your code passed all static AST and AI security checks.'
                : 'Try choosing another severity or category filter.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-graphite-800">
            {groupedIssues.map((group) => (
              <div key={group.key}>
                {/* Severity Group Subheader */}
                <div className={`px-4 py-1.5 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-graphite-300 ${group.bg} border-b border-graphite-800`}>
                  <span className={`w-2 h-2 rounded-full ${group.dot}`} />
                  <span>{group.label}</span>
                  <span className="text-graphite-500 font-mono text-[10px]">({group.items.length})</span>
                </div>

                {/* Items in this group */}
                <div className="divide-y divide-graphite-800/60">
                  {group.items.map((issue) => {
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
                            : 'border-graphite-800/40 hover:bg-graphite-850/60 text-graphite-300'
                        }`}
                      >
                        {/* Title Row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-baseline gap-1.5 min-w-0">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${group.dot}`}
                              aria-hidden="true"
                            />
                            <span className="text-xs font-semibold text-graphite-100 leading-snug truncate">
                              {issue.title}
                            </span>
                          </div>

                          {hasFix && (
                            <span
                              title="Verified automated patch available"
                              className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-brand-950/80 text-brand-300 border border-brand-800/60 flex items-center gap-0.5 shrink-0 font-mono"
                            >
                              <Wrench className="w-2.5 h-2.5" />
                              <span>Fix</span>
                            </span>
                          )}
                        </div>

                        {/* Location & Provenance Tag */}
                        <div className="flex items-center gap-2 text-[11px] font-mono text-graphite-400 pl-3">
                          <span className="text-graphite-300 font-medium">
                            {filename}:{issue.line}{issue.endLine && issue.endLine !== issue.line ? `-${issue.endLine}` : ''}
                          </span>
                          <span className="text-graphite-600">•</span>
                          <span className={`text-[10px] uppercase px-1 py-0.2 rounded font-semibold ${
                            isAi ? 'text-teal-300 bg-teal-950/60 border border-teal-800/40' : 'text-cyan-300 bg-cyan-950/60 border border-cyan-800/40'
                          }`}>
                            {isAi ? 'AI' : 'AST'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
