import React, { useState, useMemo } from 'react';
import { CheckCircle2, Wrench } from 'lucide-react';
import { filterIssues, sortIssues, getSeverityCounts } from '../utils/reviewHelpers.js';

export function IssuePanel({
  issues = [],
  selectedIssueId,
  onSelectIssue,
  isStale = false,
  filename = 'auth.js',
  className = '',
}) {
  const [filter, setFilter] = useState('ALL');

  // Compute severity counts
  const counts = getSeverityCounts(issues);

  // Sort deterministically (CRITICAL -> HIGH -> MEDIUM -> LOW, then line number)
  const sorted = sortIssues(issues);
  const displayedIssues = filterIssues(sorted, filter);

  // Group displayed issues by severity
  const groupedIssues = useMemo(() => {
    const groups = [
      { key: 'CRITICAL', label: 'Critical', dot: 'bg-[#D92D20]', items: [] },
      { key: 'HIGH', label: 'High', dot: 'bg-[#E87B21]', items: [] },
      { key: 'MEDIUM', label: 'Medium', dot: 'bg-[#C58B00]', items: [] },
      { key: 'LOW', label: 'Low', dot: 'bg-[#4D78A8]', items: [] },
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
      aria-label="Findings navigation rail"
      className={`bg-white border-r border-stone-200/80 flex flex-col h-full overflow-hidden select-none ${className}`}
    >
      {/* Rail Header */}
      <div className="px-4 py-3 border-b border-stone-200/80 flex items-center justify-between shrink-0 bg-[#F5F7F6]/50">
        <div className="flex items-center gap-2">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-stone-700 font-sans">
            Needs Attention
          </h2>
          <span className="text-[10px] font-sans px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 font-semibold">
            {issues.length}
          </span>
        </div>

        {isStale && (
          <span className="text-[10px] font-sans text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-medium">
            Stale
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="px-3 py-1.5 border-b border-stone-200/60 flex items-center gap-1 overflow-x-auto text-[11px] shrink-0 bg-white">
        {filterTabs.map((tab) => {
          const isActive = filter === tab.key;
          if (tab.key !== 'ALL' && tab.count === 0) return null;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                isActive
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] ${isActive ? 'text-stone-300' : 'text-stone-400'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grouped Findings Rail */}
      <div className="flex-1 overflow-y-auto">
        {displayedIssues.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
            <CheckCircle2 className="w-6 h-6 text-[#0F9F6E] mb-2" />
            <p className="text-xs font-semibold text-stone-800">
              {issues.length === 0 ? 'No issues detected' : 'No matching issues'}
            </p>
            <p className="text-[11px] text-stone-500 mt-1 max-w-[200px] leading-relaxed font-sans">
              {issues.length === 0
                ? 'Your code passed all static AST and AI security checks.'
                : 'Try choosing another severity filter above.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {groupedIssues.map((group) => (
              <div key={group.key} className="py-1">
                {/* Severity Group Subheader */}
                <div className="px-4 py-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-600 bg-[#F5F7F6]/60">
                  <span className={`w-1.5 h-1.5 rounded-full ${group.dot}`} />
                  <span>{group.label}</span>
                  <span className="text-stone-400 font-normal">({group.items.length})</span>
                </div>

                {/* Items in this group */}
                <div className="divide-y divide-stone-50">
                  {group.items.map((issue) => {
                    const isSelected = selectedIssueId === issue.id;
                    const hasFix = Boolean(issue.fix);

                    return (
                      <button
                        key={issue.id}
                        type="button"
                        onClick={() => onSelectIssue(issue.id)}
                        className={`w-full text-left px-4 py-2.5 transition-colors flex flex-col gap-1 border-l-2 ${
                          isSelected
                            ? 'bg-[#DDF7EC]/35 border-[#0F9F6E] text-stone-900'
                            : 'border-transparent hover:bg-stone-50/80 text-stone-700'
                        }`}
                      >
                        {/* Title Row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-baseline gap-1.5 min-w-0">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${group.dot}`}
                              aria-hidden="true"
                            />
                            <span className="text-xs font-semibold text-stone-900 leading-snug truncate">
                              {issue.title}
                            </span>
                          </div>

                          {hasFix && (
                            <span
                              title="Verified automated fix available"
                              className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-emerald-50 text-[#087A54] border border-emerald-200/80 flex items-center gap-0.5 shrink-0"
                            >
                              <Wrench className="w-2.5 h-2.5 text-[#0F9F6E]" />
                              Fix
                            </span>
                          )}
                        </div>

                        {/* Location & Metadata Row */}
                        <div className="flex items-center justify-between text-[11px] text-stone-500 pl-3">
                          <span className="font-mono text-[10px] text-stone-500">
                            {filename}:{issue.line}{issue.endLine && issue.endLine !== issue.line ? `-${issue.endLine}` : ''}
                          </span>

                          <span className="text-[9px] font-sans px-1 rounded bg-stone-100 text-stone-600 border border-stone-200/60">
                            {issue.source === 'AI' ? 'AI' : 'Static'}
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


