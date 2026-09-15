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
      <header className="sticky top-0 z-40 h-14 bg-graphite-950/80 backdrop-blur-md border-b border-graphite-800/80 px-6 flex items-center justify-between select-none">
        {/* Left: Brand Mark */}
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center hover:opacity-90 transition-opacity cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-[4px]"
            title="CodeEagle — AI Code Review"
          >
            <CodeEagleLogo size={24} withText={true} />
          </button>

          {/* Editorial Nav Anchors */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-graphite-400">
            <a
              href="#product-demo"
              className="hover:text-graphite-100 transition-colors focus-visible:outline-none focus-visible:text-graphite-100"
            >
              Demo
            </a>
            <a
              href="#why-codeeagle"
              className="hover:text-graphite-100 transition-colors focus-visible:outline-none focus-visible:text-graphite-100"
            >
              Why CodeEagle
            </a>
            <a
              href="#how-it-works"
              className="hover:text-graphite-100 transition-colors focus-visible:outline-none focus-visible:text-graphite-100"
            >
              How It Works
            </a>
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
          >
            <span>History</span>
            {typeof historyCount === 'number' && historyCount > 0 && (
              <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-graphite-800 text-graphite-300 font-semibold border border-graphite-700">
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

  // Workspace Mode (Compact, Precision Developer Cockpit)
  return (
    <header className="h-12 bg-graphite-900 border-b border-graphite-800 px-4 sm:px-5 flex items-center justify-between select-none shrink-0 z-20">
      {/* Left: Brand Mark + Breadcrumb File Context */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center hover:opacity-85 transition-opacity cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-[4px]"
          title="Return to Product Introduction"
        >
          <CodeEagleLogo size={20} withText={true} />
        </button>

        <div className="h-4 w-px bg-graphite-750 hidden sm:block shrink-0" />

        {/* Active File Context & Status */}
        <div className="hidden sm:flex items-center gap-2.5 text-xs min-w-0 font-sans">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-graphite-800/80 border border-graphite-700/60 font-mono text-[11px] text-graphite-200 shrink-0">
            <FileCode className="w-3 h-3 text-brand-400 shrink-0" />
            <span className="font-semibold">{filename}</span>
          </div>

          <span className="text-[11px] text-graphite-500 hidden md:inline">
            {language}
            {lineCount ? ` · ${lineCount} lines` : ''}
          </span>

          {/* Status Indicator */}
          {isRunning ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-brand-400 font-medium">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Analyzing...</span>
            </span>
          ) : isStale ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-orange-400 font-medium bg-orange-950/40 px-2 py-0.5 rounded border border-orange-800/40">
              <AlertCircle className="w-3 h-3" />
              <span>Code modified</span>
            </span>
          ) : reviewStatus === 'SUCCESS' ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-brand-400 font-medium">
              <CheckCircle2 className="w-3 h-3 text-brand-400" />
              <span className="hidden lg:inline">Complete</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* Center: 3 Review Lenses Switcher */}
      {onSelectLens && reviewStatus !== 'IDLE' && (
        <div className="flex items-center gap-1 bg-graphite-950 p-1 rounded-lg border border-graphite-800 shadow-dev-sm">
          <button
            type="button"
            onClick={() => onSelectLens('overview')}
            className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeLens === 'overview'
                ? 'bg-brand-500 text-graphite-950 font-semibold shadow-dev-sm'
                : 'text-graphite-400 hover:text-graphite-200 hover:bg-graphite-850'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectLens('findings')}
            className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeLens === 'findings'
                ? 'bg-brand-500 text-graphite-950 font-semibold shadow-dev-sm'
                : 'text-graphite-400 hover:text-graphite-200 hover:bg-graphite-850'
            }`}
          >
            <ListTree className="w-3.5 h-3.5" />
            <span>Findings</span>
            {typeof issueCount === 'number' && issueCount > 0 && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                  activeLens === 'findings'
                    ? 'bg-graphite-950 text-graphite-100'
                    : 'bg-graphite-800 text-graphite-300'
                }`}
              >
                {issueCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectLens('architecture')}
            className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeLens === 'architecture'
                ? 'bg-brand-500 text-graphite-950 font-semibold shadow-dev-sm'
                : 'text-graphite-400 hover:text-graphite-200 hover:bg-graphite-850'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Architecture</span>
          </button>
        </div>
      )}

      {/* Right: History & Primary Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Button
          variant={isHistoryOpen ? 'secondary' : 'ghost'}
          size="sm"
          onClick={onToggleHistory}
          leftIcon={<History className="w-3.5 h-3.5 text-graphite-400" />}
          aria-label={isHistoryOpen ? 'Close review history' : 'Open review history'}
          className={isHistoryOpen ? 'bg-graphite-800 border-graphite-600 text-graphite-100' : ''}
        >
          <span className="hidden sm:inline">History</span>
          {typeof historyCount === 'number' && historyCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-graphite-800 text-graphite-300 font-semibold border border-graphite-700">
              {historyCount}
            </span>
          )}
        </Button>

        {/* Primary Action Button */}
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
          <kbd className="hidden lg:inline-block ml-1 px-1 py-0.2 text-[9px] font-mono rounded bg-graphite-950/20 text-graphite-950/80 font-bold border border-graphite-950/10">
            ⌘↵
          </kbd>
        </Button>
      </div>
    </header>
  );
}
