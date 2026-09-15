import React from 'react';

/**
 * Geometric, precise CodeEagle brand mark.
 * Features an abstract, angular vector eagle silhouette with an inspecting optical diamond lens.
 * Designed for high-density developer tooling.
 */
export function CodeEagleLogo({
  size = 22,
  withText = false,
  withSubtitle = false,
  className = '',
}) {
  const pixelSize = typeof size === 'number' ? size : size === 'lg' ? 28 : size === 'sm' ? 18 : 22;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Geometric Eagle Mark */}
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="eagle-wing-left" x1="2" y1="6" x2="16" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#34D399" />
            <stop offset="1" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="eagle-wing-right" x1="30" y1="6" x2="16" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10B981" />
            <stop offset="1" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="eagle-keel" x1="16" y1="14" x2="16" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10B981" />
            <stop offset="1" stopColor="#064E3B" />
          </linearGradient>
        </defs>

        {/* Left Swept Wing Facet */}
        <path
          d="M16 5L2 12L7 18.5L16 14.5V5Z"
          fill="url(#eagle-wing-left)"
        />

        {/* Right Swept Wing Facet */}
        <path
          d="M16 5L30 12L25 18.5L16 14.5V5Z"
          fill="url(#eagle-wing-right)"
        />

        {/* Lower Keel / Vector Tail */}
        <path
          d="M16 15.5L23 22L16 29.5L9 22L16 15.5Z"
          fill="url(#eagle-keel)"
        />

        {/* Central Inspecting Optical Diamond Reticle */}
        <path
          d="M16 9L19 13.5L16 18L13 13.5L16 9Z"
          fill="#F1F5F9"
          fillOpacity="0.95"
        />

        {/* Sharp Precision Beak Indicator */}
        <polygon
          points="16,19 18,22.5 14,22.5"
          fill="#34D399"
        />
      </svg>

      {/* Brand Typography */}
      {withText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center text-sm font-semibold tracking-tight font-sans">
            <span className="text-graphite-100">Code</span>
            <span className="text-brand-400 font-bold ml-0.5">Eagle</span>
          </div>
          {withSubtitle && (
            <span className="text-[10px] font-medium tracking-wider text-graphite-400 uppercase font-sans mt-0.5">
              AI Code Review
            </span>
          )}
        </div>
      )}
    </div>
  );
}
