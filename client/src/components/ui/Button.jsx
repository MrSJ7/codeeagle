import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext.jsx';

/**
 * CodeEagle Button System
 * - Primary (Dark): Warm confident orange (#FF7A18) with dark text (#080808)
 * - Primary (Light): Vibrant developer blue (#2563EB) with white text & specular bevel
 * - Secondary: Precision matte graphite in dark / clean white slate in light
 * - Micro-interactions: translateY(-1px) hover lift, 0.98 active press
 */
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
  const { isLight } = useTheme();

  const baseStyles =
    'group relative inline-flex items-center justify-center font-sans font-semibold select-none cursor-pointer ' +
    'transition-all duration-150 ease-out will-change-transform ' +
    (isLight
      ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white '
      : 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808] ') +
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none ' +
    'hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98]';

  const sizeStyles = {
    xs: 'h-7 px-2.5 text-xs gap-1 rounded-[4px]',
    sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-[5px]',
    md: 'h-9 px-4 text-sm gap-2 rounded-[5px]',
    lg: 'h-11 px-5 text-[15px] gap-2.5 rounded-[6px]',
  };

  const variantStyles = {
    // Primary: Vibrant blue in Light mode / Warm orange in Dark mode
    primary: isLight
      ? 'bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white border border-blue-500/50 ' +
        'shadow-[0_1px_2px_rgba(37,99,235,0.25),0_2px_8px_rgba(37,99,235,0.35),0_1px_0_rgba(255,255,255,0.25)_inset] ' +
        'hover:shadow-[0_2px_4px_rgba(37,99,235,0.35),0_4px_14px_rgba(37,99,235,0.45),0_1px_0_rgba(255,255,255,0.35)_inset]'
      : 'bg-[#FF7A18] hover:bg-[#FF8A2A] text-[#080808] border border-[#FFA24D]/30 ' +
        'shadow-[0_1px_2px_rgba(0,0,0,0.5),0_2px_10px_rgba(255,122,24,0.35),0_1px_0_rgba(255,255,255,0.25)_inset] ' +
        'hover:shadow-[0_2px_4px_rgba(0,0,0,0.6),0_4px_16px_rgba(255,122,24,0.45),0_1px_0_rgba(255,255,255,0.35)_inset]',

    // Secondary: Clean white slate in Light mode / Technical dark graphite in Dark mode
    secondary: isLight
      ? 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 ' +
        'shadow-[0_1px_2px_rgba(0,0,0,0.05),0_1px_0_rgba(255,255,255,0.8)_inset]'
      : 'bg-[#161616] hover:bg-[#1C1C1C] text-[#F5F3EF] border border-[#262626] hover:border-[#383838] ' +
        'shadow-[0_1px_2px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.04)_inset]',

    // Ghost: Subtle hover in Light/Dark
    ghost: isLight
      ? 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent'
      : 'bg-transparent hover:bg-[#181818] text-[#A6A29B] hover:text-[#F5F3EF] border border-transparent',

    // Outline: Transparent with structural border
    outline: isLight
      ? 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400'
      : 'bg-transparent hover:bg-[#141414] text-[#D4D0C8] hover:text-[#F5F3EF] border border-[#262626] hover:border-[#383838]',

    // Danger: Controlled red
    danger:
      'bg-[#FF4D4D]/15 hover:bg-[#FF4D4D]/25 active:bg-[#FF4D4D]/30 text-[#FF4D4D] border border-[#FF4D4D]/30 font-semibold',

    // Success: Emerald for resolved patches
    success:
      'bg-[#38C793]/15 hover:bg-[#38C793]/25 active:bg-[#38C793]/30 text-[#38C793] border border-[#38C793]/30 font-semibold',
  };

  const chosenVariant = variantStyles[variant] || variantStyles.primary;
  const chosenSize = sizeStyles[size] || sizeStyles.md;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(baseStyles, chosenSize, chosenVariant, className)}
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
          {rightIcon && (
            <span className="shrink-0 transition-transform duration-150 group-hover:translate-x-0.5">
              {rightIcon}
            </span>
          )}
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
      className={cn('p-0', sizeMap[size] || sizeMap.md, className)}
      {...props}
    >
      {icon}
    </Button>
  );
}
