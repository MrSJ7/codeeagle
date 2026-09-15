import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-sans select-none cursor-pointer transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs gap-1.5 rounded-[6px]',
    md: 'px-3.5 py-1.5 text-xs font-medium gap-2 rounded-[8px]',
    lg: 'px-5 py-2.5 text-sm font-semibold gap-2.5 rounded-[8px]',
  };

  const variantStyles = {
    primary:
      'bg-brand-500 hover:bg-brand-400 text-graphite-950 font-semibold shadow-dev hover:shadow-glow-emerald border border-brand-400/50 active:bg-brand-600',
    secondary:
      'bg-graphite-800 hover:bg-graphite-750 text-graphite-100 font-medium border border-graphite-700 hover:border-graphite-600 shadow-dev-sm',
    ghost:
      'bg-transparent hover:bg-graphite-800 text-graphite-400 hover:text-graphite-100 border border-transparent',
    danger:
      'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 shadow-dev-sm',
    accent:
      'bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 hover:border-teal-500/50',
  };

  const chosenVariant = variantStyles[variant] || variantStyles.primary;
  const chosenSize = sizeStyles[size] || sizeStyles.md;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${chosenSize} ${chosenVariant} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
