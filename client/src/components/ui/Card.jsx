import React from 'react';

export function Card({
  children,
  variant = 'default',
  className = '',
  onClick,
  ...props
}) {
  const variantStyles = {
    default: 'bg-white dark:bg-graphite-900 border border-slate-200 dark:border-graphite-700/60 shadow-xs dark:shadow-dev-sm',
    elevated: 'bg-slate-50 dark:bg-graphite-850 border border-slate-200 dark:border-graphite-700 shadow-sm dark:shadow-dev',
    interactive:
      'bg-white dark:bg-graphite-900 border border-slate-200 dark:border-graphite-700/60 hover:border-slate-300 dark:hover:border-graphite-600 hover:bg-slate-50 dark:hover:bg-graphite-850 transition-all duration-150 cursor-pointer shadow-xs dark:shadow-dev-sm',
    active:
      'bg-blue-50/70 dark:bg-graphite-850 border border-blue-500/50 dark:border-brand-500/50 shadow-sm dark:shadow-dev ring-1 ring-blue-500/20 dark:ring-brand-500/20',
  };

  const chosenVariant = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={`rounded-[8px] ${chosenVariant} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
