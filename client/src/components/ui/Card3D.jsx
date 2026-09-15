import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * Card3D: Subtle physical depth card with restrained perspective tilt and radial glare.
 * - Max tilt: ~1.5° (never exceeds 2°)
 * - Respects prefers-reduced-motion
 * - Matte graphite material with subtle specular top edge highlight
 */
export function Card3D({
  children,
  className = '',
  innerClassName = '',
  maxTilt = 1.5,
  withGlare = true,
  interactive = true,
  onClick = null,
  ...props
}) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Motion values for tilt
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(smoothMouseX, [0, 1], [-maxTilt, maxTilt]);

  const handleMouseMove = (e) => {
    if (reducedMotion || !cardRef.current || !interactive) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    if (!reducedMotion && interactive) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        perspective: 1200,
        transformStyle: 'preserve-3d',
        rotateX: !reducedMotion && interactive ? rotateX : 0,
        rotateY: !reducedMotion && interactive ? rotateY : 0,
      }}
      className={cn(
        'relative rounded-[8px] bg-[#111111] border border-[#262626] transition-colors duration-200',
        'shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.035)_inset]',
        interactive && 'hover:border-[#333333] hover:bg-[#141414]',
        onClick && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {/* Subtle Specular Top Highlight */}
      <div className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* Controlled Radial Glare Highlight */}
      {withGlare && isHovered && !reducedMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[8px] transition-opacity duration-300 overflow-hidden"
          style={{
            background: `radial-gradient(circle 280px at ${mouseX.get() * 100}% ${mouseY.get() * 100}%, rgba(255, 255, 255, 0.035), transparent 70%)`,
          }}
        />
      )}

      <div className={cn('relative z-10', innerClassName)}>
        {children}
      </div>
    </motion.div>
  );
}
