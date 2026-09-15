import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Official CodeEagle brand mark.
 * Eagle head with glowing amber beak, eye, and <> code emblem.
 * Supports piece-by-piece scroll collapse where each letter and subtitle chunk
 * animates sequentially directly into the emblem as the user scrolls.
 */
const PREFIX_CHARS = ['C', 'o', 'd', 'e'];
const SUFFIX_CHARS = ['E', 'a', 'g', 'l', 'e'];
const SUBTITLE_WORDS = ['AI', 'Code', 'Review'];

export function CodeEagleLogo({
  size = 30,
  withText = false,
  withSubtitle = false,
  dark = true,
  className = '',
  scrollCollapse = false,
}) {
  const pixelSize = typeof size === 'number' ? size : size === 'lg' ? 36 : size === 'sm' ? 22 : 30;

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!scrollCollapse) return;
    let rafId = null;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
    };
  }, [scrollCollapse]);

  // Normalized scroll progress between 0 (top of page) and 1 (fully collapsed into logo)
  const maxScrollDistance = 140;
  const progress = scrollCollapse ? Math.min(1, Math.max(0, scrollY / maxScrollDistance)) : 0;

  const titleClass = pixelSize >= 32
    ? 'text-lg sm:text-xl font-bold tracking-tight font-sans'
    : pixelSize >= 26
    ? 'text-base sm:text-lg font-bold tracking-tight font-sans'
    : 'text-sm font-semibold tracking-tight font-sans';

  const subtitleClass = pixelSize >= 32
    ? 'text-xs font-semibold tracking-wider uppercase font-sans'
    : 'text-[11px] font-semibold tracking-wider uppercase font-sans';

  // Helper to compute character/piece motion styles:
  // pieceIndex: 0 = 'C' (collapses last), 8 = last 'e' (collapses first)
  const getCharStyle = (globalIndex) => {
    if (!scrollCollapse) return {};

    // 9 letters total: index 8 goes in first (rev = 0), index 0 goes in last (rev = 8)
    const rev = 8 - globalIndex;
    const start = 0.1 + (rev * 0.08);
    const end = Math.min(1, start + 0.16);

    let local = 0;
    if (progress >= end) local = 1;
    else if (progress > start) local = (progress - start) / (end - start);

    if (local === 0) return {};

    return {
      opacity: Math.max(0, 1 - local),
      transform: `translate3d(${-local * (28 + rev * 4)}px, 0, 0) scale(${1 - local * 0.65})`,
      filter: `blur(${local * 3}px)`,
      display: local >= 1 ? 'none' : 'inline-block',
    };
  };

  // Subtitle words collapse even earlier: 'Review' -> 'Code' -> 'AI'
  const getSubtitleWordStyle = (wordIndex) => {
    if (!scrollCollapse) return {};

    const rev = 2 - wordIndex; // 0 for 'Review', 1 for 'Code', 2 for 'AI'
    const start = rev * 0.08;
    const end = start + 0.14;

    let local = 0;
    if (progress >= end) local = 1;
    else if (progress > start) local = (progress - start) / (end - start);

    if (local === 0) return {};

    return {
      opacity: Math.max(0, 1 - local),
      transform: `translate3d(${-local * 24}px, 0, 0) scale(${1 - local * 0.5})`,
      filter: `blur(${local * 2}px)`,
      display: local >= 1 ? 'none' : 'inline-block',
    };
  };

  // Container width smoothly contracts as the letters tuck in
  const isFullyCollapsed = progress >= 0.98;
  const containerMaxWidth = scrollCollapse
    ? `${Math.max(0, (1 - Math.max(0, (progress - 0.6) / 0.4)) * 220)}px`
    : 'none';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official CodeEagle Brand Mark (Clean, zero orange highlight halo) */}
      <motion.div
        className="relative shrink-0 flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <img
          src="/codeeagle-logo.png"
          alt="CodeEagle Logo"
          width={pixelSize}
          height={pixelSize}
          className="rounded-[5px] object-contain shrink-0 shadow-sm relative z-10"
          style={{ width: `${pixelSize}px`, height: `${pixelSize}px` }}
        />
      </motion.div>

      {/* Brand Typography Lockup that enters logo in pieces on scroll */}
      {withText && !isFullyCollapsed && (
        <div
          className="flex flex-col leading-tight overflow-hidden whitespace-nowrap will-change-transform"
          style={{ maxWidth: containerMaxWidth }}
        >
          {/* Main Brand Title: "Code" + "Eagle" broken into animated character pieces */}
          <div className={`flex items-center ${titleClass}`}>
            <span className={dark ? 'text-obsidian-50' : 'text-obsidian-900'}>
              {PREFIX_CHARS.map((char, i) => (
                <span
                  key={`prefix-${i}`}
                  className="inline-block transition-transform duration-75"
                  style={getCharStyle(i)}
                >
                  {char}
                </span>
              ))}
            </span>

            <span className="text-brand-500 font-bold ml-0.5">
              {SUFFIX_CHARS.map((char, i) => (
                <span
                  key={`suffix-${i}`}
                  className="inline-block transition-transform duration-75"
                  style={getCharStyle(4 + i)}
                >
                  {char}
                </span>
              ))}
            </span>
          </div>

          {/* Subtitle: "AI Code Review" broken into word pieces */}
          {withSubtitle && (
            <div
              className={`flex items-center gap-1 mt-0.5 ${subtitleClass} ${
                dark ? 'text-obsidian-400' : 'text-obsidian-500'
              }`}
            >
              {SUBTITLE_WORDS.map((word, i) => (
                <span
                  key={`sub-${i}`}
                  className="inline-block transition-transform duration-75"
                  style={getSubtitleWordStyle(i)}
                >
                  {word}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
