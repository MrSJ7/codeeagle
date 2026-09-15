import React, { useState, useMemo } from 'react';
import { CheckCircle2, Wrench, Filter, Shield, Zap, Sparkles } from 'lucide-react';
import { filterIssues, sortIssues, getSeverityCounts } from '../utils/reviewHelpers.js';

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
      { key: 'CRITICAL', label: 'Critical', dot: 'bg-[#DC2626]', text: 'text-[#DC2626]', bg: 'bg-red-50/70', items: [] },
      { key: 'HIGH', label: 'High', dot: 'bg-[#EA580C]', text: 'text-[#EA580C]', bg: 'bg-orange-50/70', items: [] },
      { key: 'MEDIUM', label: 'Medium', dot: 'bg-[#D97706]', text: 'text-[#D97706]', bg: 'bg-amber-50/70', items: [] },
      { key: 'LOW', label: 'Low', dot: 'bg-[#2563EB]', text: 'text-[#2563EB]', bg: 'bg-blue-50/70', items: [] },
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
      className={`bg-white border-r border-slate-200/90 flex flex-col h-full overflow-hidden select-none ${className}`}
    >
      {/* Rail Header */}
      <div className="px-4 py-3 border-b border-slate-200/90 flex items-center justify-between shrink-0 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-slate-800 font-sans tracking-tight">
            Review Findings
          </h2>
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
            {issues.length}
          </span>
        </div>

        {isStale && (
          <span className="text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
            Stale
          </span>
        )}
      </div>

      {/* Category Filter Notice (if filtered via Summary Bar) */}
      {externalCategoryFilter && externalCategoryFilter !== 'ALL' && (
        <div className="px-3 py-1.5 bg-[#DCFCE7]/40 border-b border-[#0F9F6E]/30 flex items-center justify-between text-xs text-[#087A54] font-medium shrink-0">
          <span>Filtered by {externalCategoryFilter}</span>
          {onClearCategoryFilter && (
            <button
              type="button"
              onClick={onClearCategoryFilter}
              className="text-[11px] underline hover:text-[#065F42]"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Severity Filter Tabs */}
      <div className="px-3 py-1.5 border-b border-slate-200/80 flex items-center gap-1 overflow-x-auto text-[11px] shrink-0 bg-white">
        {filterTabs.map((tab) => {
          const isActive = severityFilter === tab.key;
          if (tab.key !== 'ALL' && tab.count === 0) return null;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSeverityFilter(tab.key)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                isActive
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grouped Findings Rail */}
      <div className="flex-1 overflow-y-auto">
        {displayedIssues.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <CheckCircle2 className="w-6 h-6 text-[#0F9F6E] mb-2" />
            <p className="text-xs font-semibold text-slate-800">
              {issues.length === 0 ? 'No issues detected' : 'No matching issues'}
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px] leading-relaxed font-sans">
              {issues.length === 0
                ? 'Your code passed all static AST and AI security checks.'
                : 'Try choosing another severity or category filter.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {groupedIssues.map((group) => (
              <div key={group.key}>
                {/* Severity Group Subheader */}
                <div className={`px-4 py-1.5 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-slate-700 ${group.bg} border-b border-slate-100`}>
                  <span className={`w-2 h-2 rounded-full ${group.dot}`} />
                  <span>{group.label}</span>
                  <span className="text-slate-500 font-mono text-[10px]">({group.items.length})</span>
                </div>

                {/* Items in this group */}
                <div className="divide-y divide-slate-100">
                  {group.items.map((issue) => {
                    const isSelected = selectedIssueId === issue.id;
                    const hasFix = Boolean(issue.fix);
                    const isAi = issue.source === 'AI';

                    return (
                      <button
                        key={issue.id}
                        type="button"
                        onClick={() => onSelectIssue(issue.id)}
                        className={`w-full text-left px-4 py-2.5 transition-colors flex flex-col gap-1 border-b ${
                          isSelected
                            ? 'bg-[#DCFCE7]/30 text-slate-900 border-slate-200 ring-1 ring-inset ring-[#0F9F6E]/40'
                            : 'border-slate-100 hover:bg-slate-50/90 text-slate-700'
                        }`}
                      >
                        {/* Title Row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-baseline gap-1.5 min-w-0">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${group.dot}`}
                              aria-hidden="true"
                            />
                            <span className="text-xs font-semibold text-slate-900 leading-snug truncate">
                              {issue.title}
                            </span>
                          </div>

                          {hasFix && (
                            <span
                              title="Verified automated patch available"
                              className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-[#087A54] border border-emerald-200/80 flex items-center gap-0.5 shrink-0"
                            >
                              <Wrench className="w-2.5 h-2.5" />
                              <span>Fix</span>
                            </span>
                          )}
                        </div>

                        {/* Location & Provenance Tag */}
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 pl-3">
                          <span className="text-slate-700 font-medium">
                            {filename}:{issue.line}{issue.endLine && issue.endLine !== issue.line ? `-${issue.endLine}` : ''}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className={`text-[10px] uppercase px-1 py-0.5 rounded font-semibold ${
                            isAi ? 'text-purple-700 bg-purple-50' : 'text-slate-600 bg-slate-100'
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
