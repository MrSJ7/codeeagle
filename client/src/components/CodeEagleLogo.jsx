import React from 'react';

/**
 * Geometric, precise CodeEagle brand mark.
 * Symbolizes vision, precision code analysis, and oversight.
 */
export function CodeEagleLogo({
  size = 24,
  withText = false,
  withSubtitle = false,
  className = '',
}) {
  const pixelSize = typeof size === 'number' ? size : size === 'lg' ? 32 : size === 'sm' ? 18 : 24;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Eagle Geometric Mark */}
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
          <linearGradient id="eagle-wings" x1="2" y1="4" x2="30" y2="18" gradientUnits="userSpaceOnUse">
            <stop stopColor="#087A54" />
            <stop offset="0.5" stopColor="#0F9F6E" />
            <stop offset="1" stopColor="#087A54" />
          </linearGradient>
          <linearGradient id="eagle-core" x1="16" y1="12" x2="16" y2="29" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0F9F6E" />
            <stop offset="1" stopColor="#044430" />
          </linearGradient>
        </defs>

        {/* Outer faceted wingspan */}
        <path
          d="M2 11L16 4L30 11L25 18L16 13.5L7 18L2 11Z"
          fill="url(#eagle-wings)"
        />

        {/* Inner geometric focal body */}
        <path
          d="M16 13.5L22 22L16 29L10 22L16 13.5Z"
          fill="url(#eagle-core)"
        />

        {/* Central inspecting lens facet */}
        <path
          d="M16 8L18.5 12.5L16 15L13.5 12.5L16 8Z"
          fill="#FFFFFF"
          fillOpacity="0.95"
        />

        {/* Sharp detection beak point */}
        <path
          d="M16 17L18 21H14L16 17Z"
          fill="#10B981"
        />
      </svg>

      {/* Brand Typography */}
      {withText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center">
            <span className="text-sm font-semibold tracking-tight text-[#161918] font-sans">
              Code<span className="text-[#0F9F6E] font-bold">Eagle</span>
            </span>
          </div>
          {withSubtitle && (
            <span className="text-[10px] font-medium tracking-wider text-[#626A65] uppercase font-sans mt-0.5">
              AI Code Review
            </span>
          )}
        </div>
      )}
    </div>
  );
}

