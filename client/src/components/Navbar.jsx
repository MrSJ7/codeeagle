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
  Sun,
  Moon,
} from 'lucide-react';
import { CodeEagleLogo } from './CodeEagleLogo.jsx';
import { Button } from './ui/Button.jsx';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext.jsx';

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
  const { isLight, isDark, toggleTheme } = useTheme();
  const isMarketing = variant === 'marketing' || mode === 'landing';
  const handleRun = onRunReview || onRunAudit;
  const isRunning = isReviewing || isAuditing;

  // --------------------------------------------------------------------------
  // 1. MARKETING SHELL (Landing Page Navigation)
  // --------------------------------------------------------------------------
  if (isMarketing) {
    return (
      <header
        className={cn(
          'sticky top-0 z-50 w-full px-4 sm:px-8 select-none backdrop-blur-xl transition-colors',
          isLight
            ? 'bg-white/90 border-b border-slate-200/90 shadow-sm'
            : 'bg-[#08090A]/92 border-b border-[#222222]/80 shadow-[0_4px_20px_rgba(0,0,0,0.6)]'
        )}
      >
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          {/* Left: Brand Mark */}
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={onNavigateHome}
              className="flex items-center hover:opacity-90 transition-opacity cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-[4px]"
              title="CodeEagle — AI Code Review"
            >
              <CodeEagleLogo size={36} withText={true} withSubtitle={true} scrollCollapse={true} dark={isDark} />
            </button>

            {/* Center / Primary Marketing Navigation */}
            <nav className={cn(
              "hidden md:flex items-center gap-1 text-sm font-medium",
              isLight ? "text-slate-600" : "text-[#A6A29B]"
            )}>
              <a
                href="#workbench"
                className={cn(
                  "px-3 py-1.5 rounded-[5px] transition-colors cursor-pointer",
                  isLight ? "hover:text-slate-900 hover:bg-slate-100" : "hover:text-[#F5F3EF] hover:bg-[#161616]"
                )}
              >
                Product
              </a>

              <a
                href="#how-it-works"
                className={cn(
                  "px-3 py-1.5 rounded-[5px] transition-colors cursor-pointer",
                  isLight ? "hover:text-slate-900 hover:bg-slate-100" : "hover:text-[#F5F3EF] hover:bg-[#161616]"
                )}
              >
                How It Works
              </a>

              <button
                type="button"
                onClick={onToggleHistory}
                className={cn(
                  "px-3 py-1.5 rounded-[5px] transition-colors flex items-center gap-1.5 cursor-pointer",
                  isLight ? "hover:text-slate-900 hover:bg-slate-100" : "hover:text-[#F5F3EF] hover:bg-[#161616]"
                )}
              >
                <span>History</span>
                {typeof historyCount === 'number' && historyCount > 0 && (
                  <span className={cn(
                    "text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold border",
                    isLight
                      ? "bg-slate-100 text-slate-700 border-slate-200"
                      : "bg-[#1A1A1A] text-[#D4D0C8] border-[#2A2A2A]"
                  )}>
                    {historyCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Right: Theme Toggle + Single Primary CTA */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-[5px] transition-colors cursor-pointer flex items-center justify-center",
                isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-xs"
                  : "text-[#A6A29B] hover:text-[#F5F3EF] hover:bg-[#181818] border border-transparent"
              )}
              title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
              aria-label={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

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
    <header
      className={cn(
        'h-12 px-4 sm:px-6 flex items-center justify-between select-none shrink-0 z-30 transition-colors shadow-xs',
        isLight ? 'bg-white border-b border-slate-200 text-slate-900' : 'bg-[#0C0C0C] border-b border-[#222222] text-obsidian-50'
      )}
    >
      {/* Left: CodeEagle Logo + Vertical Divider + Active File Context */}
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center hover:opacity-85 transition-opacity cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-[4px]"
          title="Return to Product Introduction"
        >
          <CodeEagleLogo size={28} withText={true} withSubtitle={true} dark={isDark} />
        </button>

        <div className={cn("h-4 w-px hidden sm:block shrink-0", isLight ? "bg-slate-200" : "bg-[#262626]")} />

        {/* Active File Context & Status */}
        <div className="hidden sm:flex items-center gap-2.5 text-xs min-w-0 font-sans">
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] border font-mono text-[11px] shrink-0",
            isLight ? "bg-slate-100 border-slate-200 text-slate-800" : "bg-[#141414] border-[#262626] text-[#D4D0C8]"
          )}>
            <FileCode className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span className="font-semibold">{filename}</span>
          </div>

          <span className={cn("text-[11px] hidden md:inline font-medium", isLight ? "text-slate-500" : "text-[#A6A29B]")}>
            {language}
            {lineCount ? ` · ${lineCount} lines` : ''}
          </span>

          {/* Status Indicator */}
          {isRunning ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-brand-500 font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20">
              <Loader2 className="w-3 h-3 animate-spin text-brand-500" />
              <span>Analyzing...</span>
            </span>
          ) : isStale ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-medium px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="w-3 h-3" />
              <span>Modified</span>
            </span>
          ) : reviewStatus === 'SUCCESS' ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              <span>Reviewed</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* Center: Cognitive Lens Switcher (Integrated In-Shell Tab Bar) */}
      {onSelectLens && (
        <div className={cn(
          "hidden md:flex items-center gap-1 p-0.5 rounded-[6px] border",
          isLight ? "bg-slate-100/90 border-slate-200" : "bg-[#101010] border-[#222222]"
        )}>
          {lenses.map((lens) => {
            const Icon = lens.icon;
            const isActive = activeLens === lens.id;
            return (
              <button
                key={lens.id}
                type="button"
                onClick={() => onSelectLens(lens.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1 rounded-[5px] text-xs font-semibold transition-all cursor-pointer select-none',
                  isActive
                    ? isLight
                      ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
                      : 'bg-[#181818] text-[#F5F3EF] border border-[#333333] shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-transparent'
                    : 'text-[#74716C] hover:text-[#A6A29B] hover:bg-[#141414] border border-transparent'
                )}
                aria-pressed={isActive}
              >
                <Icon className={cn('w-3.5 h-3.5', isActive ? (isLight ? 'text-blue-600' : 'text-brand-400') : (isLight ? 'text-slate-500' : 'text-[#74716C]'))} />
                <span>{lens.label}</span>
                {typeof lens.count === 'number' && lens.count > 0 && (
                  <span
                    className={cn(
                      'text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold',
                      isActive
                        ? isLight
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-brand-500/25 text-brand-400 border border-brand-500/35'
                        : isLight
                        ? 'bg-slate-200 text-slate-700 border border-slate-300'
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

      {/* Right: Score, History, Theme Toggle & RUN REVIEW */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Normalized Score Badge */}
        {typeof score === 'number' && (
          <div className={cn(
            "hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-[4px] border text-xs font-mono",
            isLight ? "bg-slate-100 border-slate-200" : "bg-[#141414] border-[#262626]"
          )}>
            <span className={isLight ? "text-slate-500" : "text-[#74716C]"}>Score</span>
            <span className={cn("font-bold", isLight ? "text-slate-900" : "text-[#F5F3EF]")}>{score}</span>
            <span className={isLight ? "text-slate-500" : "text-[#74716C]"}>/100</span>
          </div>
        )}

        {onOpenHowItWorks && (
          <button
            type="button"
            onClick={onOpenHowItWorks}
            className={cn(
              "p-1.5 rounded-[4px] transition-colors cursor-pointer hidden md:flex items-center gap-1 text-xs",
              isLight
                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                : "text-[#A6A29B] hover:text-[#F5F3EF] hover:bg-[#181818]"
            )}
            title="How CodeEagle works"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden xl:inline">Help</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className={cn(
            "p-1.5 rounded-[4px] transition-colors cursor-pointer flex items-center justify-center",
            isLight
              ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-xs"
              : "text-[#A6A29B] hover:text-[#F5F3EF] hover:bg-[#181818] border border-transparent"
          )}
          title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
          aria-label={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
        </button>

        {/* History Drawer Trigger */}
        <Button
          variant={isHistoryOpen ? 'secondary' : 'ghost'}
          size="xs"
          onClick={onToggleHistory}
          leftIcon={<History className={cn("w-3.5 h-3.5", isLight ? "text-slate-600" : "text-[#A6A29B]")} />}
          aria-label={isHistoryOpen ? 'Close review history' : 'Open review history'}
          className="h-8 px-2.5"
        >
          <span className="hidden sm:inline">History</span>
          {typeof historyCount === 'number' && historyCount > 0 && (
            <span className={cn(
              "text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold border",
              isLight
                ? "bg-slate-100 text-slate-700 border-slate-200"
                : "bg-[#1C1C1C] text-[#D4D0C8] border-[#262626]"
            )}>
              {historyCount}
            </span>
          )}
        </Button>

        {/* Primary Action Button: Blue in light mode / warm orange in dark mode */}
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
          <kbd className={cn(
            "hidden lg:inline-block ml-1 px-1 py-0.2 text-[9px] font-mono rounded-[3px] font-bold",
            isLight
              ? "bg-blue-700/40 text-white"
              : "bg-[#080808]/25 text-[#080808]"
          )}>
            ⌘↵
          </kbd>
        </Button>
      </div>
    </header>
  );
}
