import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Official CodeEagle brand mark.
 * Powered by Framer Motion:
 * - Clean logo emblem with no orange highlight/halo
 * - Brand typography dismantles into pieces (character by character & word by word)
 *   that fly into the logo emblem in sequence when scrolling down
 * - Characters emerge out of the emblem in sequence when scrolling back up
 */
const PREFIX_CHARS = ['C', 'o', 'd', 'e'];
const SUFFIX_CHARS = ['E', 'a', 'g', 'l', 'e'];
const SUBTITLE_WORDS = ['AI', 'Code', 'Review'];

// Framer Motion spring variants for each individual character piece
// Global index: 0 ('C') to 8 (last 'e')
const letterVariants = {
  visible: (i) => ({
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
      mass: 0.7,
      delay: i * 0.028, // Left to right emergence
    },
  }),
  hidden: (i) => ({
    x: -30 - ((8 - i) * 3.5), // Fly to the left directly into the emblem
    y: 0,
    opacity: 0,
    scale: 0.15,
    filter: 'blur(3px)',
    transition: {
      type: 'spring',
      stiffness: 340,
      damping: 24,
      mass: 0.6,
      delay: (8 - i) * 0.032, // Outermost letters fly in first!
    },
  }),
};

// Framer Motion spring variants for subtitle word pieces
const subtitleVariants = {
  visible: (i) => ({
    x: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 380,
      damping: 25,
      delay: 0.12 + (i * 0.03),
    },
  }),
  hidden: (i) => ({
    x: -26 - ((2 - i) * 4),
    opacity: 0,
    scale: 0.2,
    filter: 'blur(2.5px)',
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 24,
      delay: (2 - i) * 0.025, // 'Review' first, then 'Code', then 'AI'
    },
  }),
};

const containerVariants = {
  visible: {
    maxWidth: 240,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  hidden: {
    maxWidth: 0,
    opacity: 0,
    transition: {
      duration: 0.4,
      delay: 0.28,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function CodeEagleLogo({
  size = 30,
  withText = false,
  withSubtitle = false,
  dark = true,
  className = '',
  scrollCollapse = false,
  isScrolled: isScrolledProp = null,
}) {
  const pixelSize = typeof size === 'number' ? size : size === 'lg' ? 36 : size === 'sm' ? 22 : 30;

  const [internalScrolled, setInternalScrolled] = useState(false);
  const isScrolled = scrollCollapse
    ? (typeof isScrolledProp === 'boolean' ? isScrolledProp : internalScrolled)
    : false;

  useEffect(() => {
    if (!scrollCollapse || typeof isScrolledProp === 'boolean') return;
    const onScroll = () => {
      setInternalScrolled(window.scrollY > 35);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollCollapse, isScrolledProp]);

  const titleClass = pixelSize >= 32
    ? 'text-lg sm:text-xl font-bold tracking-tight font-sans'
    : pixelSize >= 26
    ? 'text-base sm:text-lg font-bold tracking-tight font-sans'
    : 'text-sm font-semibold tracking-tight font-sans';

  const subtitleClass = pixelSize >= 32
    ? 'text-xs font-semibold tracking-wider uppercase font-sans'
    : 'text-[11px] font-semibold tracking-wider uppercase font-sans';

  const animationState = isScrolled ? 'hidden' : 'visible';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official CodeEagle Brand Mark (Clean, zero orange highlight halo) */}
      <motion.div
        className="relative shrink-0 flex items-center justify-center"
        animate={{
          scale: isScrolled ? [1, 1.07, 1] : 1,
        }}
        transition={{
          duration: 0.35,
          delay: 0.22,
          ease: [0.16, 1, 0.3, 1],
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
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

      {/* Brand Typography Lockup that enters logo in pieces on scroll via Framer Motion */}
      {withText && (
        <motion.div
          variants={containerVariants}
          initial="visible"
          animate={animationState}
          className="flex flex-col leading-tight overflow-hidden whitespace-nowrap will-change-transform"
        >
          {/* Main Brand Title: "Code" + "Eagle" broken into animated character pieces */}
          <div className={`flex items-center ${titleClass}`}>
            <span className={dark ? 'text-obsidian-50' : 'text-obsidian-900'}>
              {PREFIX_CHARS.map((char, i) => (
                <motion.span
                  key={`prefix-${i}`}
                  custom={i}
                  variants={letterVariants}
                  initial="visible"
                  animate={animationState}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </span>

            <span className="text-brand-500 font-bold ml-0.5">
              {SUFFIX_CHARS.map((char, i) => (
                <motion.span
                  key={`suffix-${i}`}
                  custom={4 + i}
                  variants={letterVariants}
                  initial="visible"
                  animate={animationState}
                  className="inline-block"
                >
                  {char}
                </motion.span>
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
                <motion.span
                  key={`sub-${i}`}
                  custom={i}
                  variants={subtitleVariants}
                  initial="visible"
                  animate={animationState}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
