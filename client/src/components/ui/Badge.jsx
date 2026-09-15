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
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    critical: 'bg-red-50 text-red-700 border border-red-200 font-bold',
    high: 'bg-amber-50 text-amber-700 border border-amber-200 font-bold',
    medium: 'bg-yellow-50 text-yellow-800 border border-yellow-200 font-medium',
    low: 'bg-blue-50 text-blue-700 border border-blue-200 font-medium',
    ast: 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold',
    ai: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold',
    category: 'bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider',
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
