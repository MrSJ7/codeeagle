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
      <header className="sticky top-0 z-40 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between select-none shadow-dev-sm">
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
          <nav className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={onNavigateReview}
              className="px-3 py-1.5 rounded-md hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium cursor-pointer"
            >
              Review
            </button>
            <button
              type="button"
              onClick={onToggleHistory}
              className="px-3 py-1.5 rounded-md hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <span>History</span>
              {typeof historyCount === 'number' && historyCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                  {historyCount}
                </span>
              )}
            </button>
            {onOpenHowItWorks && (
              <button
                type="button"
                onClick={onOpenHowItWorks}
                className="px-3 py-1.5 rounded-md hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium cursor-pointer flex items-center gap-1"
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
              <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
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
    <header className="h-13 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between select-none shrink-0 z-20 shadow-dev-sm">
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

        <div className="h-4 w-px bg-slate-200 hidden sm:block shrink-0" />

        {/* Active File Context & Status */}
        <div className="hidden sm:flex items-center gap-2.5 text-xs min-w-0 font-sans">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-slate-100 border border-slate-200 font-mono text-[11px] text-slate-800 shrink-0">
            <FileCode className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span className="font-semibold">{filename}</span>
          </div>

          <span className="text-[11px] text-slate-500 hidden md:inline font-medium">
            {language}
            {lineCount ? ` · ${lineCount} lines` : ''}
          </span>

          {/* Status Indicator */}
          {isRunning ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-brand-600 font-semibold">
              <Loader2 className="w-3 h-3 animate-spin text-brand-600" />
              <span>Analyzing...</span>
            </span>
          ) : isStale ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <AlertCircle className="w-3 h-3 text-amber-600" />
              <span>Code modified</span>
            </span>
          ) : reviewStatus === 'SUCCESS' ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-brand-600 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-brand-600" />
              <span className="hidden lg:inline">Complete</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* Center: 3 Review Lenses Switcher */}
      {onSelectLens && reviewStatus !== 'IDLE' && (
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-dev-sm">
          <button
            type="button"
            onClick={() => onSelectLens('overview')}
            className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeLens === 'overview'
                ? 'bg-white text-slate-900 font-semibold shadow-dev-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-brand-600" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectLens('findings')}
            className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeLens === 'findings'
                ? 'bg-white text-slate-900 font-semibold shadow-dev-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ListTree className="w-3.5 h-3.5 text-brand-600" />
            <span>Findings</span>
            {typeof issueCount === 'number' && issueCount > 0 && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                  activeLens === 'findings'
                    ? 'bg-brand-100 text-brand-800'
                    : 'bg-slate-200 text-slate-700'
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
                ? 'bg-white text-slate-900 font-semibold shadow-dev-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-brand-600" />
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
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer hidden md:flex items-center gap-1 text-xs"
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
          leftIcon={<History className="w-3.5 h-3.5 text-slate-500" />}
          aria-label={isHistoryOpen ? 'Close review history' : 'Open review history'}
        >
          <span className="hidden sm:inline">History</span>
          {typeof historyCount === 'number' && historyCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
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
          <kbd className="hidden lg:inline-block ml-1 px-1 py-0.2 text-[9px] font-mono rounded bg-white/25 text-white font-bold">
            ⌘↵
          </kbd>
        </Button>
      </div>
    </header>
  );
}
