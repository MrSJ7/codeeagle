import React from 'react';

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) {
  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 rounded-[4px] font-mono font-medium',
    md: 'text-[11px] px-2 py-0.5 rounded-[6px] font-mono font-semibold',
  };

  const variantStyles = {
    default: 'bg-slate-100 dark:bg-obsidian-800 text-slate-700 dark:text-obsidian-300 border border-slate-200 dark:border-obsidian-700',
    critical: 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60 font-bold',
    high: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-bold',
    medium: 'bg-yellow-50 dark:bg-amber-950/40 text-yellow-800 dark:text-amber-300 border border-yellow-200 dark:border-amber-800/50 font-medium',
    low: 'bg-slate-100 dark:bg-obsidian-800 text-slate-700 dark:text-obsidian-400 border border-slate-200 dark:border-obsidian-700 font-medium',
    ast: 'bg-blue-50 dark:bg-obsidian-800 text-blue-700 dark:text-obsidian-300 border border-blue-200 dark:border-obsidian-700 font-semibold',
    ai: 'bg-blue-50 dark:bg-brand-500/15 text-blue-700 dark:text-brand-400 border border-blue-200 dark:border-brand-500/30 font-semibold',
    success: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-semibold',
    category: 'bg-slate-100 dark:bg-obsidian-800 text-slate-600 dark:text-obsidian-400 border border-slate-200 dark:border-obsidian-700 uppercase tracking-wider',
  };

  const chosenVariant = variantStyles[variant] || variantStyles.default;
  const chosenSize = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      className={`inline-flex items-center gap-1 leading-none select-none ${chosenSize} ${chosenVariant} ${className}`}
    >
      {children}
    </span>
  );
}
