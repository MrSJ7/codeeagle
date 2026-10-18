import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({ children, variant = 'primary', size = 'md', isLoading = false, disabled = false, leftIcon = null, rightIcon = null, className = '', type = 'button', onClick, ...props }) {
  const variants = { primary: 'ce-action', secondary: 'ce-outline', outline: 'ce-outline', ghost: 'ce-ghost', danger: 'border border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-300', success: 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' };
  const sizes = { xs: 'min-h-9 px-3 text-xs', sm: 'min-h-10 px-3.5 text-sm', md: 'min-h-11 px-4 text-sm', lg: 'min-h-12 px-5 text-[15px]' };
  return <button type={type} onClick={onClick} disabled={disabled || isLoading} className={`ce-focus inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`} {...props}>
    {isLoading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : leftIcon}
    {children}
    {!isLoading && rightIcon}
  </button>;
}
