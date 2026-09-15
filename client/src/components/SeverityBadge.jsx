import React from 'react';

export function SeverityBadge({ severity }) {
  const norm = (severity || 'LOW').toUpperCase();

  const config = {
    CRITICAL: {
      pill: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60',
      dot: 'bg-red-500',
    },
    HIGH: {
      pill: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/60',
      dot: 'bg-orange-500',
    },
    MEDIUM: {
      pill: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
      dot: 'bg-amber-500',
    },
    LOW: {
      pill: 'bg-slate-100 dark:bg-obsidian-800/80 text-slate-700 dark:text-obsidian-300 border-slate-200 dark:border-obsidian-700/80',
      dot: 'bg-slate-400 dark:bg-obsidian-400',
    },
    RESOLVED: {
      pill: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
      dot: 'bg-emerald-500',
    },
  }[norm] || {
    pill: 'bg-slate-100 dark:bg-obsidian-800/80 text-slate-700 dark:text-obsidian-300 border-slate-200 dark:border-obsidian-700/80',
    dot: 'bg-slate-400 dark:bg-obsidian-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-semibold tracking-wider uppercase border select-none ${config.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      <span>{norm}</span>
    </span>
  );
}
