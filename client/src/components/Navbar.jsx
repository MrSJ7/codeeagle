import React from 'react';
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
import { CodeEagleLogo } from './CodeEagleLogo.jsx';
import { Button } from './ui/Button.jsx';
import { cn } from '@/lib/utils';

/**
 * CodeEagle Navbar: Context-Aware Navigation
 * - variant="marketing" (Landing): Floating, refined marketing navigation with single clear CTA
 * - variant="app" (Review Workspace): Precision IDE application shell with file context, 3 lenses, score & Run Review
 */
export function Navbar({
  mode = 'workspace', // 'landing' | 'workspace'
  variant = null,     // 'marketing' | 'app' (takes precedence over mode)
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
  score = null,
  activeLens = 'overview', // 'overview' | 'findings' | 'architecture'
  onSelectLens = null,
}) {
  const isMarketing = variant === 'marketing' || mode === 'landing';
  const handleRun = onRunReview || onRunAudit;
  const isRunning = isReviewing || isAuditing;

  // --------------------------------------------------------------------------
  // 1. MARKETING SHELL (Landing Page Navigation)
  // --------------------------------------------------------------------------
  if (isMarketing) {
    return (
      <header className="sticky top-0 z-50 w-full px-4 sm:px-8 select-none bg-[#08090A]/92 backdrop-blur-xl border-b border-[#222222]/80 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          {/* Left: Brand Mark */}
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={onNavigateHome}
              className="flex items-center hover:opacity-90 transition-opacity cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-[4px]"
              title="CodeEagle — AI Code Review"
            >
              <CodeEagleLogo size={24} withText={true} withSubtitle={true} scrollCollapse={true} />
            </button>

            {/* Center / Primary Marketing Navigation */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-[#A6A29B]">
              <a
                href="#workbench"
                className="px-3 py-1.5 rounded-[5px] hover:text-[#F5F3EF] hover:bg-[#161616] transition-colors cursor-pointer"
              >
                Product
              </a>

              <a
                href="#how-it-works"
                className="px-3 py-1.5 rounded-[5px] hover:text-[#F5F3EF] hover:bg-[#161616] transition-colors cursor-pointer"
              >
                How It Works
              </a>

              <button
                type="button"
                onClick={onToggleHistory}
                className="px-3 py-1.5 rounded-[5px] hover:text-[#F5F3EF] hover:bg-[#161616] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>History</span>
                {typeof historyCount === 'number' && historyCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#1A1A1A] text-[#D4D0C8] font-bold border border-[#2A2A2A]">
                    {historyCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Right: Single Primary CTA (No duplicate History button) */}
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={onNavigateReview}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Start Reviewing
            </Button>
          </div>
        </div>
      </header>
    );
  }

  // --------------------------------------------------------------------------
  // 2. APPLICATION SHELL (Precision Review IDE Cockpit)
  // --------------------------------------------------------------------------
  const lenses = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'findings', label: 'Findings', icon: ListTree, count: issueCount },
    { id: 'architecture', label: 'Architecture', icon: GitBranch },
  ];

  return (
    <header className="h-12 bg-[#0C0C0C] border-b border-[#222222] px-4 sm:px-6 flex items-center justify-between select-none shrink-0 z-30 shadow-xs">
      {/* Left: CodeEagle Logo + Vertical Divider + Active File Context */}
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center hover:opacity-85 transition-opacity cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-[4px]"
          title="Return to Product Introduction"
        >
          <CodeEagleLogo size={20} withText={true} withSubtitle={true} />
        </button>

        <div className="h-4 w-px bg-[#262626] hidden sm:block shrink-0" />

        {/* Active File Context & Status */}
        <div className="hidden sm:flex items-center gap-2.5 text-xs min-w-0 font-sans">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-[#141414] border border-[#262626] font-mono text-[11px] text-[#D4D0C8] shrink-0">
            <FileCode className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span className="font-semibold">{filename}</span>
          </div>

          <span className="text-[11px] text-[#A6A29B] hidden md:inline font-medium">
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
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-800/40">
              <AlertCircle className="w-3 h-3 text-amber-400" />
              <span>Modified</span>
            </span>
          ) : reviewStatus === 'SUCCESS' ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#38C793] font-semibold px-2 py-0.5 rounded-full bg-[#38C793]/10 border border-[#38C793]/25">
              <CheckCircle2 className="w-3 h-3 text-[#38C793]" />
              <span className="hidden lg:inline">Complete</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* Center: 3 Review Lenses Switcher */}
      {onSelectLens && reviewStatus !== 'IDLE' && (
        <div className="flex items-center gap-1 bg-[#121212] p-0.5 rounded-[6px] border border-[#222222]">
          {lenses.map((lens) => {
            const Icon = lens.icon;
            const isActive = activeLens === lens.id;

            return (
              <button
                key={lens.id}
                type="button"
                onClick={() => onSelectLens(lens.id)}
                className={cn(
                  'px-2.5 py-1 rounded-[4px] text-[13px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer',
                  isActive
                    ? 'bg-[#1E1E1E] text-[#F5F3EF] font-semibold shadow-xs border border-[#2D2D2D]'
                    : 'text-[#A6A29B] hover:text-[#F5F3EF] hover:bg-[#181818]'
                )}
              >
                <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-brand-500' : 'text-[#74716C]')} />
                <span>{lens.label}</span>

                {typeof lens.count === 'number' && lens.count > 0 && (
                  <span
                    className={cn(
                      'text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold',
                      isActive
                        ? 'bg-brand-500/25 text-brand-400 border border-brand-500/35'
                        : 'bg-[#181818] text-[#A6A29B] border border-[#262626]'
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

      {/* Right: Score, History, Help & RUN REVIEW */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Normalized Score Badge */}
        {typeof score === 'number' && (
          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[#141414] border border-[#262626] text-xs font-mono">
            <span className="text-[#74716C]">Score</span>
            <span className="font-bold text-[#F5F3EF]">{score}</span>
            <span className="text-[#74716C]">/100</span>
          </div>
        )}

        {onOpenHowItWorks && (
          <button
            type="button"
            onClick={onOpenHowItWorks}
            className="p-1.5 rounded-[4px] text-[#A6A29B] hover:text-[#F5F3EF] hover:bg-[#181818] transition-colors cursor-pointer hidden md:flex items-center gap-1 text-xs"
            title="How CodeEagle works"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden xl:inline">Help</span>
          </button>
        )}

        {/* History Drawer Trigger */}
        <Button
          variant={isHistoryOpen ? 'secondary' : 'ghost'}
          size="xs"
          onClick={onToggleHistory}
          leftIcon={<History className="w-3.5 h-3.5 text-[#A6A29B]" />}
          aria-label={isHistoryOpen ? 'Close review history' : 'Open review history'}
          className="h-8 px-2.5"
        >
          <span className="hidden sm:inline">History</span>
          {typeof historyCount === 'number' && historyCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#1C1C1C] text-[#D4D0C8] font-bold border border-[#262626]">
              {historyCount}
            </span>
          )}
        </Button>

        {/* Primary Action Button: Unmistakably visible warm orange */}
        <Button
          variant="primary"
          size="xs"
          onClick={handleRun}
          disabled={isRunning}
          isLoading={isRunning}
          leftIcon={!isRunning ? <Play className="w-3 h-3 fill-current" /> : null}
          aria-label={isStale ? 'Re-run code review' : 'Run code review'}
          title="Run review (⌘ + Enter)"
          className="h-8 px-3.5"
        >
          <span>{isStale ? 'Re-run Review' : 'Run Review'}</span>
          <kbd className="hidden lg:inline-block ml-1 px-1 py-0.2 text-[9px] font-mono rounded-[3px] bg-[#080808]/25 text-[#080808] font-bold">
            ⌘↵
          </kbd>
        </Button>
      </div>
    </header>
  );
}
