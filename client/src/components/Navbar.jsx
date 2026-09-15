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

  if (mode === 'landing') {
    return (
      <header className="sticky top-0 z-40 h-14 bg-obsidian-950/85 backdrop-blur-md border-b border-obsidian-800 px-4 sm:px-8 flex items-center justify-between select-none shadow-sm">
        {/* Left: Brand Mark */}
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center hover:opacity-90 transition-opacity cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-[4px]"
            title="CodeEagle — AI Code Review"
          >
            <CodeEagleLogo size={24} withText={true} withSubtitle={true} />
          </button>

          {/* Product Primary Navigation */}
          <nav className="hidden md:flex items-center gap-2 text-xs font-medium text-obsidian-400">
            <button
              type="button"
              onClick={onNavigateReview}
              className="px-3 py-1.5 rounded-[5px] hover:text-obsidian-100 hover:bg-obsidian-850 transition-colors cursor-pointer"
            >
              Review
            </button>
            <button
              type="button"
              onClick={onToggleHistory}
              className="px-3 py-1.5 rounded-[5px] hover:text-obsidian-100 hover:bg-obsidian-850 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>History</span>
              {typeof historyCount === 'number' && historyCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[4px] bg-obsidian-800 text-obsidian-300 font-bold border border-obsidian-700">
                  {historyCount}
                </span>
              )}
            </button>
            {onOpenHowItWorks && (
              <button
                type="button"
                onClick={onOpenHowItWorks}
                className="px-3 py-1.5 rounded-[5px] hover:text-obsidian-100 hover:bg-obsidian-850 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>How it works</span>
              </button>
            )}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleHistory}
            leftIcon={<History className="w-3.5 h-3.5" />}
            aria-label="Open review history"
            className="hidden sm:inline-flex"
          >
            <span>History</span>
            {typeof historyCount === 'number' && historyCount > 0 && (
              <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-[4px] bg-obsidian-800 text-obsidian-300 font-semibold border border-obsidian-750">
                {historyCount}
              </span>
            )}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onNavigateReview}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Start Reviewing
          </Button>
        </div>
      </header>
    );
  }

  // Workspace Mode (Precision Developer Review Cockpit)
  return (
    <header className="h-13 bg-obsidian-900 border-b border-obsidian-800 px-4 sm:px-6 flex items-center justify-between select-none shrink-0 z-20 shadow-sm">
      {/* Left: Brand Mark + Breadcrumb File Context */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center hover:opacity-85 transition-opacity cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-[4px]"
          title="Return to Product Introduction"
        >
          <CodeEagleLogo size={20} withText={true} withSubtitle={true} />
        </button>

        <div className="h-4 w-px bg-obsidian-750 hidden sm:block shrink-0" />

        {/* Active File Context & Status */}
        <div className="hidden sm:flex items-center gap-2.5 text-xs min-w-0 font-sans">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-obsidian-850 border border-obsidian-750 font-mono text-[11px] text-obsidian-200 shrink-0">
            <FileCode className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span className="font-semibold">{filename}</span>
          </div>

          <span className="text-[11px] text-obsidian-400 hidden md:inline font-medium">
            {language}
            {lineCount ? ` · ${lineCount} lines` : ''}
          </span>

          {/* Status Indicator */}
          {isRunning ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-brand-400 font-semibold">
              <Loader2 className="w-3 h-3 animate-spin text-brand-500" />
              <span>Analyzing...</span>
            </span>
          ) : isStale ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 font-medium bg-amber-950/40 px-2 py-0.5 rounded-[4px] border border-amber-800/40">
              <AlertCircle className="w-3 h-3 text-amber-400" />
              <span>Code modified</span>
            </span>
          ) : reviewStatus === 'SUCCESS' ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span className="hidden lg:inline">Complete</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* Center: 3 Review Lenses Switcher */}
      {onSelectLens && reviewStatus !== 'IDLE' && (
        <div className="flex items-center gap-1 bg-obsidian-950 p-1 rounded-[6px] border border-obsidian-800">
          <button
            type="button"
            onClick={() => onSelectLens('overview')}
            className={`px-3 py-1 rounded-[5px] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeLens === 'overview'
                ? 'bg-obsidian-800 text-obsidian-50 font-semibold shadow-sm border border-obsidian-700'
                : 'text-obsidian-400 hover:text-obsidian-200 hover:bg-obsidian-850'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-brand-500" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectLens('findings')}
            className={`px-3 py-1 rounded-[5px] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeLens === 'findings'
                ? 'bg-obsidian-800 text-obsidian-50 font-semibold shadow-sm border border-obsidian-700'
                : 'text-obsidian-400 hover:text-obsidian-200 hover:bg-obsidian-850'
            }`}
          >
            <ListTree className="w-3.5 h-3.5 text-brand-500" />
            <span>Findings</span>
            {typeof issueCount === 'number' && issueCount > 0 && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-[4px] font-bold ${
                  activeLens === 'findings'
                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                    : 'bg-obsidian-800 text-obsidian-400'
                }`}
              >
                {issueCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectLens('architecture')}
            className={`px-3 py-1 rounded-[5px] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeLens === 'architecture'
                ? 'bg-obsidian-800 text-obsidian-50 font-semibold shadow-sm border border-obsidian-700'
                : 'text-obsidian-400 hover:text-obsidian-200 hover:bg-obsidian-850'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-brand-500" />
            <span className="hidden sm:inline">Architecture</span>
          </button>
        </div>
      )}

      {/* Right: History, Info & Primary Action */}
      <div className="flex items-center gap-2 shrink-0">
        {onOpenHowItWorks && (
          <button
            type="button"
            onClick={onOpenHowItWorks}
            className="p-1.5 rounded-[5px] text-obsidian-400 hover:text-obsidian-200 hover:bg-obsidian-800 transition-colors cursor-pointer hidden md:flex items-center gap-1 text-xs"
            title="How CodeEagle works"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden lg:inline">Help</span>
          </button>
        )}

        <Button
          variant={isHistoryOpen ? 'secondary' : 'ghost'}
          size="sm"
          onClick={onToggleHistory}
          leftIcon={<History className="w-3.5 h-3.5 text-obsidian-400" />}
          aria-label={isHistoryOpen ? 'Close review history' : 'Open review history'}
        >
          <span className="hidden sm:inline">History</span>
          {typeof historyCount === 'number' && historyCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[4px] bg-obsidian-800 text-obsidian-300 font-semibold border border-obsidian-700">
              {historyCount}
            </span>
          )}
        </Button>

        {/* Primary Action Button: Unmistakably visible orange */}
        <Button
          variant="primary"
          size="sm"
          onClick={handleRun}
          disabled={isRunning}
          isLoading={isRunning}
          leftIcon={!isRunning ? <Play className="w-3 h-3 fill-current" /> : null}
          aria-label={isStale ? 'Re-run code review' : 'Run code review'}
          title="Run review (⌘ + Enter)"
        >
          <span>{isStale ? 'Re-run Review' : 'Run Review'}</span>
          <kbd className="hidden lg:inline-block ml-1 px-1 py-0.2 text-[9px] font-mono rounded-[3px] bg-obsidian-950/30 text-obsidian-950 font-bold">
            ⌘↵
          </kbd>
        </Button>
      </div>
    </header>
  );
}
