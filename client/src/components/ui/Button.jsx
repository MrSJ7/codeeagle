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
    'inline-flex items-center justify-center font-sans font-medium select-none cursor-pointer transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian-950 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

  const sizeStyles = {
    xs: 'h-7 px-2 text-[11px] gap-1 rounded-[4px]',
    sm: 'h-8 px-3 text-xs gap-1.5 rounded-[5px]',
    md: 'h-9 px-3.5 text-xs font-semibold gap-2 rounded-[5px]',
    lg: 'h-11 px-5 text-sm font-semibold gap-2.5 rounded-[6px]',
  };

  const variantStyles = {
    // Primary: Unmistakable vibrant brand orange with dark text for maximum contrast & authority
    primary:
      'bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-obsidian-950 font-bold border border-brand-400/30 hover:text-white shadow-[0_1px_3px_rgba(249,115,22,0.3)]',
    // Secondary: Technical dark graphite with 1px border divider
    secondary:
      'bg-obsidian-800 hover:bg-obsidian-750 active:bg-obsidian-700 text-obsidian-300 hover:text-obsidian-50 font-medium border border-obsidian-700 hover:border-obsidian-600',
    // Ghost: Quiet technical control
    ghost:
      'bg-transparent hover:bg-obsidian-800 text-obsidian-400 hover:text-obsidian-50 border border-transparent',
    // Outline: Transparent with structural border
    outline:
      'bg-transparent hover:bg-obsidian-850 text-obsidian-300 hover:text-obsidian-50 border border-obsidian-700 hover:border-obsidian-600',
    // Danger: Controlled red
    danger:
      'bg-severity-critical/15 hover:bg-severity-critical/25 active:bg-severity-critical/30 text-severity-critical border border-severity-critical/30 font-semibold',
    // Success: Emerald for resolved patches
    success:
      'bg-severity-resolved/15 hover:bg-severity-resolved/25 active:bg-severity-resolved/30 text-severity-resolved border border-severity-resolved/30 font-semibold',
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

export const CodeEagleButton = Button;

export function CodeEagleIconButton({
  icon,
  'aria-label': ariaLabel,
  title,
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props
}) {
  const sizeMap = {
    xs: 'w-6 h-6 rounded-[4px]',
    sm: 'w-7 h-7 rounded-[4px]',
    md: 'w-8 h-8 rounded-[5px]',
    lg: 'w-9 h-9 rounded-[5px]',
  };

  return (
    <Button
      variant={variant}
      aria-label={ariaLabel || title}
      title={title || ariaLabel}
      className={`p-0 ${sizeMap[size] || sizeMap.md} ${className}`}
      {...props}
    >
      {icon}
    </Button>
  );
}
