import React from 'react';

/**
 * Official CodeEagle brand mark using the provided asset.
 * Eagle head with glowing amber beak, eye, and <> code emblem.
 */
export function CodeEagleLogo({
  size = 28,
  withText = false,
  withSubtitle = false, // Deprecated: removed as per request
  dark = true,
  className = '',
  textSize = 'text-[17px] sm:text-[18px]',
}) {
  const pixelSize = typeof size === 'number' ? size : size === 'lg' ? 34 : size === 'sm' ? 20 : 28;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official CodeEagle Brand Mark Image */}
      <img
        src="/codeeagle-logo.png"
        alt="CodeEagle Logo"
        width={pixelSize}
        height={pixelSize}
        className="rounded-[5px] object-contain shrink-0 shadow-sm"
        style={{ width: `${pixelSize}px`, height: `${pixelSize}px` }}
      />

      {/* Brand Typography Lockup - CodeEagle only, slightly larger */}
      {withText && (
        <div className="flex items-center leading-none">
          <span className={`${textSize} font-bold tracking-tight font-sans`}>
            <span className={dark ? 'text-obsidian-50' : 'text-obsidian-900'}>Code</span>
            <span className="text-brand-500 font-extrabold ml-0.5">Eagle</span>
          </span>
        </div>
      )}
    </div>
  );
}
