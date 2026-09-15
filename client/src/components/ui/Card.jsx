import React from 'react';

export function Card({
  children,
  variant = 'default',
  className = '',
  onClick,
  ...props
}) {
  const variantStyles = {
    default: 'bg-graphite-900 border border-graphite-700/60 shadow-dev-sm',
    elevated: 'bg-graphite-850 border border-graphite-700 shadow-dev',
    interactive:
      'bg-graphite-900 border border-graphite-700/60 hover:border-graphite-600 hover:bg-graphite-850 transition-all duration-150 cursor-pointer shadow-dev-sm',
    active:
      'bg-graphite-850 border border-brand-500/50 shadow-dev ring-1 ring-brand-500/20',
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
