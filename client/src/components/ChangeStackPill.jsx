import React from 'react';
import { EagleEmblem } from './CodeEagleLogo';

/**
 * Signature "Review Change Stack" Pill Component.
 * Reverse-engineered from CodeRabbit's signature SVG pill:
 * viewBox: 0 0 202 32 with circular emblem, typography, and directional indicator.
 */
export default function ChangeStackPill({
  label = 'Review Change Stack',
  onClick,
  className = '',
  tone = 'default',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      data-review-change-stack-trigger="true"
      className={`group relative inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs font-semibold font-mono tracking-tight transition-all duration-200 select-none ${
        tone === 'primary'
          ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-400 shadow-sm shadow-orange-500/20'
          : 'bg-white dark:bg-[#121212] hover:bg-slate-50 dark:hover:bg-[#1A1A1A] text-slate-800 dark:text-obsidian-100 border-slate-300 dark:border-[#2E2E2E] shadow-sm'
      } ${className}`}
    >
      {/* Circular Emblem Badge */}
      <span className="relative flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 shadow-sm overflow-hidden flex-shrink-0">
        <EagleEmblem size={14} animate={false} />
      </span>

      {/* Label */}
      <span className="font-sans font-semibold text-[13px] tracking-tight truncate">
        {label}
      </span>

      {/* Forward Arrow */}
      <svg
        className="w-3.5 h-3.5 text-current opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 ml-auto flex-shrink-0"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 3.5L10.5 8L6 12.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.5 8H10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
