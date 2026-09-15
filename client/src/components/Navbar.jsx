import React from 'react';
import { Play, Loader2, History, ArrowRight } from 'lucide-react';
import { CodeEagleLogo } from './CodeEagleLogo.jsx';

export function Navbar({
  onRunAudit,
  onRunReview,
  isAuditing = false,
  isReviewing = false,
  isStale = false,
  onToggleHistory,
  isHistoryOpen = false,
  isAiConfigured = false,
  historyCount = null,
  onNavigateHome,
}) {
  const handleRun = onRunReview || onRunAudit;
  const isRunning = isReviewing || isAuditing;

  return (
    <header className="h-12 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between select-none shrink-0 z-20">
      {/* Left: CodeEagle Brand Mark & Navigation Tabs */}
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-2 hover:opacity-85 transition-opacity text-left cursor-pointer"
          title="Return to CodeEagle Home"
        >
          <CodeEagleLogo size={22} withText={true} withSubtitle={false} />
        </button>

        {/* View Switcher / Tabs */}
        <nav className="flex items-center gap-1 pl-4 border-l border-slate-200">
          <button
            type="button"
            onClick={onNavigateHome}
            className="px-2.5 py-1 rounded-[6px] text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Product
          </button>
          <button
            type="button"
            className="px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-slate-100 text-slate-900 border border-slate-200/80 transition-colors"
          >
            Review
          </button>
          <button
            type="button"
            onClick={onToggleHistory}
            aria-label={isHistoryOpen ? 'Close review history' : 'Open review history'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-medium border transition-colors ${
              isHistoryOpen
                ? 'bg-slate-100 text-slate-900 border-slate-300'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent'
            }`}
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>History</span>
            {typeof historyCount === 'number' && historyCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                {historyCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Right: AI Capability Dot & Primary CTA */}
      <div className="flex items-center gap-4">
        {/* Subtle AI Status Dot */}
        <div
          title={isAiConfigured ? 'Google Gemini semantic analysis enabled' : 'Deterministic static AST analysis'}
          className="text-xs font-sans text-slate-600 flex items-center gap-1.5 select-none"
        >
          <span>{isAiConfigured ? 'AI' : 'Static'}</span>
          <span
            className={`w-2 h-2 rounded-full ${
              isAiConfigured ? 'bg-[#0F9F6E]' : 'bg-slate-400'
            }`}
            aria-hidden="true"
          />
        </div>

        {/* Primary Action Button: Run Review */}
        <button
          onClick={handleRun}
          disabled={isRunning}
          aria-label={isStale ? 'Re-run code review' : 'Run code review'}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] text-xs font-semibold transition-all shadow-xs ${
            isRunning
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : isStale
              ? 'bg-[#EA580C] hover:bg-[#C2410C] text-white ring-2 ring-orange-500/20'
              : 'bg-[#0F9F6E] hover:bg-[#087A54] active:bg-[#065F42] text-white'
          }`}
        >
          {isRunning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Reviewing...</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>{isStale ? 'Re-run Review' : 'Run Review'}</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-80" />
            </>
          )}
        </button>
      </div>
    </header>
  );
}


