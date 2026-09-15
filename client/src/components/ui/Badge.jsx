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
    default: 'bg-graphite-800 text-graphite-300 border border-graphite-700',
    critical: 'bg-red-950/60 text-red-300 border border-red-800/60',
    high: 'bg-orange-950/60 text-orange-300 border border-orange-800/60',
    medium: 'bg-amber-950/60 text-amber-300 border border-amber-800/60',
    low: 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60',
    ast: 'bg-cyan-950/40 text-cyan-300 border border-cyan-800/50',
    ai: 'bg-amber-950/40 text-amber-300 border border-amber-800/50',
    success: 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60',
    category: 'bg-graphite-800 text-graphite-300 border border-graphite-700 uppercase tracking-wider',
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
