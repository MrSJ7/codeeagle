import React from 'react';

/**
 * Official CodeEagle brand mark using the provided asset.
 * Eagle head with glowing amber beak, eye, and <> code emblem.
 */
export function CodeEagleLogo({
  size = 24,
  withText = false,
  withSubtitle = false,
  dark = true,
  className = '',
}) {
  const pixelSize = typeof size === 'number' ? size : size === 'lg' ? 32 : size === 'sm' ? 18 : 24;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official CodeEagle Brand Mark Image */}
      <img
        src="/codeeagle-logo.png"
        alt="CodeEagle Logo"
        width={pixelSize}
        height={pixelSize}
        className="rounded-[4px] object-contain shrink-0 shadow-sm"
        style={{ width: `${pixelSize}px`, height: `${pixelSize}px` }}
      />

      {/* Brand Typography Lockup */}
      {withText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center text-sm font-semibold tracking-tight font-sans">
            <span className={dark ? 'text-obsidian-50' : 'text-obsidian-900'}>Code</span>
            <span className="text-brand-500 font-bold ml-0.5">Eagle</span>
          </div>
          {withSubtitle && (
            <span className={`text-[10px] font-semibold tracking-wider uppercase font-sans mt-0.5 ${dark ? 'text-obsidian-400' : 'text-obsidian-500'}`}>
              AI Code Review
            </span>
          )}
        </div>
      )}
    </div>
  );
}
