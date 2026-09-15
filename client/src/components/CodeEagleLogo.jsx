import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Official CodeEagle brand mark using the provided asset.
 * Eagle head with glowing amber beak, eye, and <> code emblem.
 * Supports framer-motion scroll-triggered collapse where text animates into the emblem.
 */
export function CodeEagleLogo({
  size = 24,
  withText = false,
  withSubtitle = false,
  dark = true,
  className = '',
  scrollCollapse = false,
  isScrolled = null,
}) {
  const pixelSize = typeof size === 'number' ? size : size === 'lg' ? 36 : size === 'sm' ? 22 : 30;

  const [internalScrolled, setInternalScrolled] = useState(false);
  const activeScrolled = scrollCollapse ? (typeof isScrolled === 'boolean' ? isScrolled : internalScrolled) : false;

  const titleClass = pixelSize >= 32
    ? 'text-lg sm:text-xl font-bold tracking-tight font-sans'
    : pixelSize >= 26
    ? 'text-base sm:text-lg font-bold tracking-tight font-sans'
    : 'text-sm font-semibold tracking-tight font-sans';

  const subtitleClass = pixelSize >= 32
    ? 'text-xs font-semibold tracking-wider uppercase font-sans mt-0.5'
    : 'text-[11px] font-semibold tracking-wider uppercase font-sans mt-0.5';

  useEffect(() => {
    if (!scrollCollapse || typeof isScrolled === 'boolean') return;
    const handleScroll = () => {
      setInternalScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollCollapse, isScrolled]);

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official CodeEagle Brand Mark with Framer Motion Depth */}
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

        {/* Ambient Amber Glow Halo */}
        <motion.div
          className="absolute inset-0 rounded-[5px] bg-brand-500/25 blur-[6px] -z-0 pointer-events-none"
          animate={{
            opacity: activeScrolled ? [0.35, 0.75, 0.35] : 0.25,
            scale: activeScrolled ? [1, 1.18, 1] : 1,
          }}
          transition={{
            duration: activeScrolled ? 2.2 : 0.3,
            repeat: activeScrolled ? Infinity : 0,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      {/* Animated Brand Typography Lockup */}
      {withText && (
        <AnimatePresence initial={false}>
          {!activeScrolled && (
            <motion.div
              key="brand-text"
              initial={{ opacity: 0, x: -10, width: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, width: 'auto', filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -14, width: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col leading-tight overflow-hidden whitespace-nowrap"
            >
              <div className={`flex items-center ${titleClass}`}>
                <span className={dark ? 'text-obsidian-50' : 'text-obsidian-900'}>Code</span>
                <span className="text-brand-500 font-bold ml-0.5">Eagle</span>
              </div>
              {withSubtitle && (
                <span className={`${subtitleClass} ${dark ? 'text-obsidian-400' : 'text-obsidian-500'}`}>
                  AI Code Review
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
