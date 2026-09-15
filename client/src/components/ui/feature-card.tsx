import React from 'react';
import { cn } from "@/lib/utils";

/**
 * Props for the FeatureCard component.
 */
export interface FeatureCardProps {
  icon: React.ReactNode;
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
        "group relative flex flex-col justify-between p-6 sm:p-7 rounded-[8px] border",
        "bg-[#0D0D0D] hover:bg-[#121212] border-[#222222] hover:border-[#333333]",
        "transition-all duration-200 ease-out",
        "shadow-[0_1px_3px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.03)_inset]",
        "hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.06)_inset] hover:-translate-y-1",
        className
      )}
    >
      <div>
        {/* Top bar: Icon and Badge/Kicker */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#161616] border border-[#262626] text-brand-500 group-hover:border-brand-500/40 group-hover:bg-brand-500/10 transition-colors">
            {icon}
          </div>
          {badge ? (
            <div>{badge}</div>
          ) : kicker ? (
            <span className="font-mono text-[10px] tracking-wider uppercase text-[#74716C] group-hover:text-brand-400 transition-colors">
              {kicker}
            </span>
          ) : null}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-[#F5F3EF] mb-2 tracking-tight">
          {title}
        </h3>

        {/* Description */}
        <p className="text-xs text-[#A6A29B] leading-relaxed">
          {description}
        </p>
      </div>

      {footer && (
        <div className="mt-4 pt-3 border-t border-[#1C1C1C]">
          {footer}
        </div>
      )}
    </div>
  );
};
