"use client";
import React, { useRef, useState, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
} from 'motion/react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Aceternity Resizable Navbar with Liquid Glass & 3D Depth
 *
 * Features:
 * - Dynamic scroll-based width resizing with spring physics
 * - Ultra-clear frosted obsidian liquid glass backdrop with specular highlight
 * - 3D tactile button effects and micro-lifts
 * - Magnetic hover tracking pill on nav links
 * - Smooth animated mobile drawer
 */

export const Navbar = ({
  children,
  className,
  sticky = true,
  threshold = 60,
}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  // Monitor window scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      if (scrollY > threshold) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return (
    <motion.header
      ref={ref}
      className={cn(
        sticky ? 'sticky inset-x-0 top-0 z-50 w-full px-3 sm:px-6 transition-all duration-300' : 'relative w-full px-3 sm:px-6',
        className
      )}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { visible })
          : child
      )}
    </motion.header>
  );
};

export const NavBody = ({
  children,
  className,
  visible = false,
  fullWidth = false,
}) => {
  return (
    <motion.div
      animate={{
        width: fullWidth ? '100%' : visible ? '76%' : '100%',
        maxWidth: fullWidth ? '100%' : visible ? '1024px' : '1280px',
        y: visible ? 8 : 0,
        borderRadius: visible ? '9999px' : '12px',
        backdropFilter: 'blur(20px)',
        backgroundColor: visible ? 'rgba(8, 9, 10, 0.88)' : 'rgba(8, 9, 10, 0.72)',
        borderColor: visible ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.08)',
        boxShadow: visible
          ? '0 0 30px rgba(0, 0, 0, 0.7), 0 1px 0 rgba(255, 255, 255, 0.14) inset, 0 16px 40px -12px rgba(0, 0, 0, 0.85)'
          : '0 0 20px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.08) inset',
      }}
      transition={{
        type: 'spring',
        stiffness: 220,
        damping: 28,
        mass: 0.8,
      }}
      className={cn(
        'relative mx-auto hidden lg:flex items-center justify-between border px-4 py-2.5 transition-colors',
        className
      )}
    >
      {/* Specular Liquid Glass Top Highlight Glint */}
      <div className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      {children}
    </motion.div>
  );
};

export const NavItems = ({
  items = [],
  className,
  onItemClick,
}) => {
  const [hovered, setHovered] = useState(null);

  return (
    <nav
      onMouseLeave={() => setHovered(null)}
      className={cn(
        'relative flex items-center justify-center gap-1 text-xs font-medium text-obsidian-300',
        className
      )}
    >
      {items.map((item, idx) => (
        <a
          key={`nav-item-${idx}-${item.name}`}
          href={item.link || '#'}
          onMouseEnter={() => setHovered(idx)}
          onClick={(e) => {
            if (item.onClick) {
              e.preventDefault();
              item.onClick();
            } else if (onItemClick) {
              onItemClick(item);
            }
          }}
          className="relative px-3.5 py-1.5 rounded-full text-obsidian-300 hover:text-white transition-colors cursor-pointer group flex items-center gap-1.5"
        >
          {hovered === idx && (
            <motion.div
              layoutId="nav-hover-pill"
              className="absolute inset-0 rounded-full bg-white/[0.08] border border-white/[0.09] shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10">{item.name}</span>
          {item.badge && (
            <span className="relative z-10 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-obsidian-800 text-obsidian-300 font-bold border border-obsidian-700">
              {item.badge}
            </span>
          )}
        </a>
      ))}
    </nav>
  );
};

export const MobileNav = ({
  children,
  className,
  visible = false,
}) => {
  return (
    <motion.div
      animate={{
        width: visible ? '92%' : '100%',
        y: visible ? 6 : 0,
        borderRadius: visible ? '16px' : '8px',
        backdropFilter: 'blur(20px)',
        backgroundColor: visible ? 'rgba(8, 9, 10, 0.92)' : 'rgba(8, 9, 10, 0.85)',
        borderColor: visible ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.08)',
        boxShadow: visible
          ? '0 0 24px rgba(0, 0, 0, 0.6), 0 1px 0 rgba(255, 255, 255, 0.12) inset'
          : 'none',
      }}
      transition={{
        type: 'spring',
        stiffness: 220,
        damping: 28,
      }}
      className={cn(
        'relative mx-auto flex lg:hidden w-full flex-col items-center justify-between border px-4 py-2',
        className
      )}
    >
      {/* Specular Liquid Glass Top Highlight Glint */}
      <div className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex w-full flex-row items-center justify-between',
        className
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            'absolute inset-x-0 top-full mt-2 z-50 flex w-full flex-col items-start justify-start gap-3 rounded-xl border border-white/[0.1] bg-obsidian-950/95 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.1)_inset] backdrop-blur-xl',
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 rounded-lg text-obsidian-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
      aria-label="Toggle navigation menu"
    >
      {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </button>
  );
};

export const NavbarButton = ({
  children,
  className,
  variant = 'primary',
  onClick,
  ...props
}) => {
  const isPrimary = variant === 'primary';

  return (
    <motion.button
      whileHover={{ y: -1.5, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer select-none transition-shadow',
        isPrimary
          ? 'bg-brand-500 text-obsidian-950 shadow-[0_1px_0_rgba(255,255,255,0.3)_inset,0_3px_12px_rgba(249,115,22,0.35)] hover:bg-brand-400 hover:shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_4px_16px_rgba(249,115,22,0.5)]'
          : 'bg-white/[0.06] text-obsidian-200 border border-white/[0.08] shadow-[0_1px_0_rgba(255,255,255,0.08)_inset] hover:bg-white/[0.1] hover:text-white',
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};
