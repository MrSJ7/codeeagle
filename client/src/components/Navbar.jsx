import React, { useState } from 'react';
import {
  Play,
  Loader2,
  History,
  ArrowRight,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Layers,
  ListTree,
  GitBranch,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CodeEagleLogo } from './CodeEagleLogo.jsx';
import {
  Navbar as AceternityNavbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarButton,
} from './ui/resizable-navbar.jsx';
import { cn } from '@/lib/utils';

export function Navbar({
  mode = 'workspace', // 'landing' | 'workspace'
  onRunAudit,
  onRunReview,
  isAuditing = false,
  isReviewing = false,
  isStale = false,
  onToggleHistory,
  isHistoryOpen = false,
  historyCount = null,
  onNavigateHome,
  onNavigateReview,
  onOpenHowItWorks,
  filename = 'auth.js',
  language = 'JavaScript',
  lineCount = null,
  issueCount = null,
  reviewStatus = 'IDLE',
  activeLens = 'overview', // 'overview' | 'findings' | 'architecture'
  onSelectLens = null,
}) {
  const handleRun = onRunReview || onRunAudit;
  const isRunning = isReviewing || isAuditing;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lensHovered, setLensHovered] = useState(null);

  // --------------------------------------------------------------------------
  // LANDING MODE: Aceternity Resizable Liquid Glass Floating Navbar
  // --------------------------------------------------------------------------
  if (mode === 'landing') {
    const navItems = [
      {
        name: 'Review',
        onClick: onNavigateReview,
      },
      {
        name: 'History',
        onClick: onToggleHistory,
        badge: typeof historyCount === 'number' && historyCount > 0 ? historyCount : null,
      },
      ...(onOpenHowItWorks
        ? [
            {
              name: 'How it works',
              onClick: onOpenHowItWorks,
            },
          ]
        : []),
    ];

    return (
      <AceternityNavbar sticky={true} threshold={50} className="pt-3">
        {/* Desktop Resizable Liquid Glass Nav */}
        <NavBody>
          {/* Brand Logo with 3D micro hover */}
          <motion.button
            type="button"
            onClick={onNavigateHome}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="flex items-center cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-[6px]"
            title="CodeEagle — AI Code Review"
          >
            <CodeEagleLogo size={28} withText={true} />
          </motion.button>

          {/* Center: Dynamic Floating Hover Nav Items */}
          <NavItems items={navItems} />

          {/* Right: 3D Liquid Glass CTA Buttons */}
          <div className="flex items-center gap-2.5">
            <NavbarButton
              variant="secondary"
              onClick={onToggleHistory}
              aria-label="Open review history"
              className="hidden sm:inline-flex"
            >
              <History className="w-3.5 h-3.5 text-obsidian-300" />
              <span>History</span>
              {typeof historyCount === 'number' && historyCount > 0 && (
                <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-obsidian-800 text-obsidian-300 font-bold border border-obsidian-700">
                  {historyCount}
                </span>
              )}
            </NavbarButton>

            <NavbarButton
              variant="primary"
              onClick={onNavigateReview}
            >
              <span>Start Reviewing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Liquid Glass Nav */}
        <MobileNav>
          <MobileNavHeader>
            <button
              type="button"
              onClick={onNavigateHome}
              className="flex items-center cursor-pointer"
            >
              <CodeEagleLogo size={24} withText={true} />
            </button>

            <div className="flex items-center gap-2">
              <NavbarButton
                variant="primary"
                onClick={onNavigateReview}
                className="px-2.5 py-1 text-[11px]"
              >
                <span>Review</span>
                <ArrowRight className="w-3 h-3" />
              </NavbarButton>
              <MobileNavToggle
                isOpen={mobileMenuOpen}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              />
            </div>
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          >
            <div className="flex flex-col gap-2 w-full">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateReview?.();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-obsidian-200 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                Launch Review
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onToggleHistory?.();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-obsidian-200 hover:text-white hover:bg-white/[0.08] transition-colors flex items-center justify-between"
              >
                <span>History</span>
                {typeof historyCount === 'number' && historyCount > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-obsidian-800 text-obsidian-300 font-bold border border-obsidian-700">
                    {historyCount}
                  </span>
                )}
              </button>
              {onOpenHowItWorks && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenHowItWorks();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-obsidian-200 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  How it works
                </button>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </AceternityNavbar>
    );
  }

  // --------------------------------------------------------------------------
  // WORKSPACE MODE: Liquid Glass Developer Cockpit with 3D Sliding Lenses
  // --------------------------------------------------------------------------
  const lenses = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'findings', label: 'Findings', icon: ListTree, count: issueCount },
    { id: 'architecture', label: 'Architecture', icon: GitBranch },
  ];

  return (
    <header className="relative h-13 bg-[#10141D]/92 backdrop-blur-xl border-b border-[#212736] px-4 sm:px-6 flex items-center justify-between select-none shrink-0 z-30 shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_10px_25px_-5px_rgba(0,0,0,0.6)]">
      {/* Specular Liquid Glass Top Highlight Glint */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Left: Brand Mark + Breadcrumb File Context */}
      <div className="flex items-center gap-3.5 min-w-0">
        <motion.button
          type="button"
          onClick={onNavigateHome}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="flex items-center cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-[6px]"
          title="Return to Product Introduction"
        >
          <CodeEagleLogo size={24} withText={true} />
        </motion.button>

        <div className="h-4 w-px bg-white/[0.1] hidden sm:block shrink-0" />

        {/* Active File Context & Status */}
        <div className="hidden sm:flex items-center gap-2.5 text-xs min-w-0 font-sans">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-white/[0.04] border border-white/[0.08] shadow-[0_1px_0_rgba(255,255,255,0.06)_inset] font-mono text-[11px] text-obsidian-200 shrink-0">
            <FileCode className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span className="font-semibold">{filename}</span>
          </div>

          <span className="text-[11px] text-obsidian-400 hidden md:inline font-medium">
            {language}
            {lineCount ? ` · ${lineCount} lines` : ''}
          </span>

          {/* Status Indicator */}
          {isRunning ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-brand-400 font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20">
              <Loader2 className="w-3 h-3 animate-spin text-brand-500" />
              <span>Analyzing...</span>
            </span>
          ) : isStale ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 font-medium bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-800/40">
              <AlertCircle className="w-3 h-3 text-amber-400" />
              <span>Code modified</span>
            </span>
          ) : reviewStatus === 'SUCCESS' ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-800/30">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span className="hidden lg:inline">Complete</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* Center: Aceternity 3D Liquid Lens Switcher */}
      {onSelectLens && reviewStatus !== 'IDLE' && (
        <div
          onMouseLeave={() => setLensHovered(null)}
          className="flex items-center gap-1 bg-obsidian-950/90 p-1 rounded-full border border-white/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.5)_inset,0_1px_0_rgba(255,255,255,0.06)]"
        >
          {lenses.map((lens, idx) => {
            const Icon = lens.icon;
            const isActive = activeLens === lens.id;
            const isHovered = lensHovered === lens.id;

            return (
              <button
                key={lens.id}
                type="button"
                onMouseEnter={() => setLensHovered(lens.id)}
                onClick={() => onSelectLens(lens.id)}
                className={cn(
                  'relative px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer z-10',
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-obsidian-400 hover:text-obsidian-200'
                )}
              >
                {/* 3D Liquid Spring Gliding Active Pill */}
                {isActive && (
                  <motion.div
                    layoutId="active-lens-indicator"
                    className="absolute inset-0 rounded-full bg-[#1E2535] border border-white/[0.16] shadow-[0_2px_8px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.14)_inset]"
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 32,
                    }}
                  />
                )}

                {/* Micro Hover Tracking Pill */}
                {!isActive && isHovered && (
                  <motion.div
                    layoutId="lens-hover-pill"
                    className="absolute inset-0 rounded-full bg-white/[0.05]"
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}

                <Icon className={cn('w-3.5 h-3.5 relative z-10', isActive ? 'text-brand-400' : 'text-obsidian-400')} />
                <span className="relative z-10">{lens.label}</span>

                {typeof lens.count === 'number' && lens.count > 0 && (
                  <span
                    className={cn(
                      'relative z-10 text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold',
                      isActive
                        ? 'bg-brand-500/25 text-brand-300 border border-brand-500/40 shadow-sm'
                        : 'bg-obsidian-800 text-obsidian-400 border border-obsidian-700'
                    )}
                  >
                    {lens.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Right: History, Help & 3D Tactile Action */}
      <div className="flex items-center gap-2 shrink-0">
        {onOpenHowItWorks && (
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenHowItWorks}
            className="p-1.5 rounded-full text-obsidian-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer hidden md:flex items-center gap-1 text-xs"
            title="How CodeEagle works"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden lg:inline">Help</span>
          </motion.button>
        )}

        <motion.button
          type="button"
          whileHover={{ y: -1, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={onToggleHistory}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer flex items-center gap-1.5 transition-colors border select-none',
            isHistoryOpen
              ? 'bg-white/[0.1] text-white border-white/[0.15] shadow-[0_1px_0_rgba(255,255,255,0.1)_inset]'
              : 'bg-white/[0.04] text-obsidian-300 border-white/[0.08] hover:bg-white/[0.08] hover:text-white'
          )}
          aria-label={isHistoryOpen ? 'Close review history' : 'Open review history'}
        >
          <History className="w-3.5 h-3.5 text-obsidian-400" />
          <span className="hidden sm:inline">History</span>
          {typeof historyCount === 'number' && historyCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-obsidian-800 text-obsidian-300 font-semibold border border-obsidian-700">
              {historyCount}
            </span>
          )}
        </motion.button>

        {/* Primary Action Button: 3D Tactile Orange with Micro Hover & Spring Press */}
        <motion.button
          type="button"
          whileHover={!isRunning ? { y: -1.5, scale: 1.03 } : {}}
          whileTap={!isRunning ? { scale: 0.97 } : {}}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onClick={handleRun}
          disabled={isRunning}
          className={cn(
            'relative inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer select-none transition-shadow',
            isRunning
              ? 'bg-brand-500/60 text-obsidian-950 cursor-not-allowed opacity-80'
              : 'bg-brand-500 text-obsidian-950 shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_3px_12px_rgba(249,115,22,0.4)] hover:bg-brand-400 hover:shadow-[0_1px_0_rgba(255,255,255,0.45)_inset,0_4px_18px_rgba(249,115,22,0.55)]'
          )}
          aria-label={isStale ? 'Re-run code review' : 'Run code review'}
          title="Run review (⌘ + Enter)"
        >
          {isRunning ? (
            <Loader2 className="w-3 h-3 animate-spin text-obsidian-950" />
          ) : (
            <Play className="w-3 h-3 fill-current" />
          )}
          <span>{isStale ? 'Re-run Review' : 'Run Review'}</span>
          <kbd className="hidden lg:inline-block ml-0.5 px-1 py-0.2 text-[9px] font-mono rounded-[3px] bg-obsidian-950/30 text-obsidian-950 font-bold">
            ⌘↵
          </kbd>
        </motion.button>
      </div>
    </header>
  );
}
