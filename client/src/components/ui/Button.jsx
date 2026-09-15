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
    'inline-flex items-center justify-center font-sans select-none cursor-pointer transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs gap-1.5 rounded-[6px]',
    md: 'px-3.5 py-1.5 text-xs font-medium gap-2 rounded-[8px]',
    lg: 'px-5 py-2.5 text-sm font-semibold gap-2.5 rounded-[8px]',
  };

  const variantStyles = {
    primary:
      'bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-dev-sm hover:shadow-dev border border-brand-700/40 active:bg-brand-800',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-medium border border-slate-200 hover:border-slate-300 shadow-dev-sm',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent',
    danger:
      'bg-red-600 hover:bg-red-700 text-white font-semibold shadow-dev-sm border border-red-700/40',
    accent:
      'bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-dev-sm border border-teal-700/40',
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
