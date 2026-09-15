import React from 'react';
import { cn } from "@/lib/utils";

/**
 * Props for the FeatureCard component.
 */
export interface FeatureCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  badge?: React.ReactNode;
  kicker?: string;
  footer?: React.ReactNode;
}

/**
 * A responsive and theme-adaptive card component to highlight features.
 * Built with shadcn/ui principles and styled for CodeEagle's warm dark theme.
 */
export const FeatureCard = ({
  icon,
  title,
  description,
  className,
  badge,
  kicker,
  footer,
}: FeatureCardProps) => {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between p-6 sm:p-7 rounded-[8px] border transition-all duration-200 ease-out",
        "bg-white dark:bg-[#0D0D0D] hover:bg-slate-50/80 dark:hover:bg-[#121212]",
        "border-slate-200 dark:border-[#222222] hover:border-slate-300 dark:hover:border-[#333333]",
        "shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.03)_inset]",
        "hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.06)_inset] hover:-translate-y-1",
        className
      )}
    >
      <div>
        {/* Top bar: Kicker and Badge */}
        {(kicker || badge || icon) && (
          <div className="flex items-center justify-between mb-4">
            {icon ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-slate-100 dark:bg-[#161616] border border-slate-200 dark:border-[#262626] text-blue-600 dark:text-brand-500 transition-colors">
                {icon}
              </div>
            ) : kicker ? (
              <span className="font-mono text-[11px] tracking-wider uppercase text-slate-500 dark:text-[#74716C] group-hover:text-blue-600 dark:group-hover:text-brand-400 transition-colors font-semibold">
                {kicker}
              </span>
            ) : null}
            {badge ? <div>{badge}</div> : null}
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-[#F5F3EF] mb-2 tracking-tight">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 dark:text-[#A6A29B] leading-relaxed max-w-[65ch]">
          {description}
        </p>
      </div>

      {footer && (
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#1C1C1C]">
          {footer}
        </div>
      )}
    </div>
  );
};
