import React, { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';

/**
 * Official CodeEagle brand mark.
 * Powered by Framer Motion:
 * - Clean logo emblem with no orange highlight/halo
 * - Brand typography dismantles into pieces (character by character & word by word)
 *   that fly directly into the logo emblem in sequence when scrolling down
 * - Characters emerge out of the emblem in sequence when scrolling back up
 */
const PREFIX_CHARS = ['C', 'o', 'd', 'e'];
const SUFFIX_CHARS = ['E', 'a', 'g', 'l', 'e'];
const SUBTITLE_WORDS = ['AI', 'Code', 'Review'];

// Framer Motion spring variants for each individual character piece
// Global index: 0 ('C') to 8 (last 'e')
// Logo emblem center is ~30px to the left of the container, plus each letter's x-offset
const letterVariants = {
  visible: (i) => ({
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 420,
      damping: 26,
      mass: 0.6,
      delay: i * 0.025, // Left to right emergence
    },
  }),
  hidden: (i) => ({
    x: -30 - (i * 10.5), // Fly left directly into the emblem center
    y: 0,
    opacity: 0,
    scale: 0.1,
    filter: 'blur(2px)',
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 24,
      mass: 0.6,
      delay: (8 - i) * 0.03, // Outermost letters fly in first!
    },
  }),
};

// Framer Motion spring variants for subtitle word pieces
const subtitleVariants = {
  visible: (i) => ({
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 26,
      delay: 0.1 + (i * 0.03),
    },
  }),
  hidden: (i) => ({
    x: -30 - (i * 28), // Fly directly into emblem center
    y: 0,
    opacity: 0,
    scale: 0.1,
    filter: 'blur(2px)',
    transition: {
      type: 'spring',
      stiffness: 340,
      damping: 24,
      delay: (2 - i) * 0.03, // 'Review' first, then 'Code', then 'AI'
    },
  }),
};

const containerVariants = {
  visible: {
    maxWidth: 240,
    opacity: 1,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  hidden: {
    maxWidth: 0,
    opacity: 1, // Keep opacity 1 so letters remain visible while travelling across gap
    transition: {
      duration: 0.45,
      delay: 0.24,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function EagleEmblem({ size = 30, dark = true, className = '' }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs transition-transform duration-300 select-none"
      >
        <defs>
          <linearGradient id={`crOrangeGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B1A" />
            <stop offset="50%" stopColor="#FF570A" />
            <stop offset="100%" stopColor="#E04600" />
          </linearGradient>

          <linearGradient id={`eagleWhite-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F4F4F5" />
            <stop offset="100%" stopColor="#E4E4E7" />
          </linearGradient>

          <linearGradient id={`beakGold-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          <radialGradient id={`eyePulse-${size}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FDE047" />
            <stop offset="85%" stopColor="#FF570A" />
            <stop offset="100%" stopColor="#FF570A" stopOpacity="0" />
          </radialGradient>

          <filter id={`subtleGlow-${size}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Circular Brand Badge Container (Exact CodeRabbit Geometry) */}
        <circle
          cx="32"
          cy="32"
          r="30"
          fill={`url(#crOrangeGrad-${size})`}
          stroke="#FFA24D"
          strokeWidth={isHovered ? "1.8" : "1.2"}
          strokeOpacity={isHovered ? "0.8" : "0.5"}
          className="transition-all duration-300"
        />

        {/* Subtle Specular Rim Light */}
        <circle
          cx="32"
          cy="32"
          r="28.8"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          strokeOpacity={isHovered ? "0.4" : "0.22"}
        />

        {/* Eagle Vector Silhouette Group */}
        <g transform="translate(6, 6)">
          {/* Back Crest Feathers (Aerodynamic Sweep) */}
          <path
            d="M12 24 L22 13 L20 21 L28 13 L26 22 L35 14 L32 24 L38 21 L33 29 L40 27 L32 36 L24 42 L16 37 L14 43 L11 35 Z"
            fill={`url(#eagleWhite-${size})`}
            stroke="#FFFFFF"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />

          {/* Wing Facet Layer */}
          <path
            d="M16 25 L26 17 L24 27 L31 21 L27 33 L19 37 Z"
            fill="#E4E4E7"
            opacity="0.95"
          />

          {/* Front Crown & Brow Structure */}
          <path
            d="M25 14 L37 17 L41 23 L36 25 L30 21 Z"
            fill="#FFFFFF"
          />

          {/* Hooked Predatory Beak (Golden Accent) */}
          <path
            d="M36 23 L47 28 L50 33 C49 36 45 38 41 37 L36 34 L38 30 L36 29 Z"
            fill={`url(#beakGold-${size})`}
            stroke="#F59E0B"
            strokeWidth="0.75"
            strokeLinejoin="round"
            filter={`url(#subtleGlow-${size})`}
          />

          {/* Lower Jaw / Throat Ridge */}
          <path
            d="M36 34 L41 37 C37 40 32 39 29 35 L33 32 Z"
            fill="#D97706"
            opacity="0.9"
          />

          {/* Eagle Piercing Eye Structure */}
          <path
            d="M31 21.5 Q35 19 39 22.5 Q35 24.5 31 21.5 Z"
            fill="#18181B"
            stroke="#FFA24D"
            strokeWidth="0.6"
          />

          {/* Glowing Iris / Pupil with animated breathing pulse */}
          <circle cx="35" cy="22" r="1.8" fill={`url(#eyePulse-${size})`} filter={`url(#subtleGlow-${size})`}>
            <animate attributeName="r" values="1.6;2.3;1.6" dur="2.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.85;1;0.85" dur="2.8s" repeatCount="indefinite" />
          </circle>

          {/* Radar Focus Sweep Ring */}
          <circle cx="35" cy="22" r="3.2" fill="none" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.6">
            <animate attributeName="r" values="2.4;5.2;2.4" dur="2.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.75;0;0.75" dur="2.8s" repeatCount="indefinite" />
          </circle>

          {/* Sharp Eye Glint Point */}
          <circle cx="34.3" cy="21.3" r="0.6" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );
}

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

  const { scrollY } = useScroll();

  useEffect(() => {
    if (!scrollCollapse || typeof isScrolledProp === 'boolean') return;
    
    // Check initial scroll offset
    if (typeof window !== 'undefined') {
      setInternalScrolled(window.scrollY > 20);
    }

    // Subscribe to Framer Motion scroll changes
    const unsubscribe = scrollY.on('change', (latest) => {
      setInternalScrolled(latest > 20);
    });

    return () => unsubscribe();
  }, [scrollCollapse, isScrolledProp, scrollY]);

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
      {/* Official CodeEagle Animated Vector Brand Mark */}
      <motion.div
        className="relative shrink-0 flex items-center justify-center z-20"
        animate={{
          scale: isScrolled ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 0.35,
          delay: 0.22,
          ease: [0.16, 1, 0.3, 1],
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
      >
        <EagleEmblem size={pixelSize} dark={dark} />
      </motion.div>

      {/* Brand Typography Lockup that enters logo in pieces on scroll via Framer Motion */}
      {withText && (
        <motion.div
          variants={containerVariants}
          initial="visible"
          animate={animationState}
          className="flex flex-col leading-tight overflow-visible whitespace-nowrap will-change-transform z-10"
        >
          {/* Main Brand Title: "Code" + "Eagle" broken into animated character pieces */}
          <div className={`flex items-center ${titleClass}`}>
            <span className={dark ? 'text-obsidian-50' : 'text-slate-900'}>
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
                dark ? 'text-obsidian-400' : 'text-slate-500'
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
