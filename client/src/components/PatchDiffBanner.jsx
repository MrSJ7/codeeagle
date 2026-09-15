import React from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, PlusCircle, X } from 'lucide-react';

/**
 * Compact CodeEagle review diff banner displaying patch outcome and score delta.
 */
export function PatchDiffBanner({ diff, onDismiss }) {
  if (!diff) return null;

  const { scoreBefore, scoreAfter, resolvedIssues = [], remainingIssues = [], newIssues = [] } = diff;
  const isImproved = scoreAfter > scoreBefore;

  return (
    <div className="bg-brand-950/80 border-b border-brand-800/80 px-4 sm:px-5 py-2 shadow-dev-sm flex items-center justify-between gap-4 text-xs font-mono select-none shrink-0">
      <div className="flex items-center gap-3.5 flex-wrap">
        {/* Fix applied status */}
        <div className="flex items-center gap-1.5 text-brand-400 font-bold font-sans text-xs">
          <CheckCircle2 className="w-4 h-4 text-brand-400" />
          <span>Fix applied & verified</span>
        </div>

        <div className="hidden sm:block h-3.5 w-px bg-brand-800/60" />

        {/* Score delta */}
        <div className="flex items-center gap-2 font-mono">
          <span className="text-graphite-400 font-sans text-[11px] uppercase tracking-wider font-semibold">
            Score:
          </span>
          <span className="font-bold text-graphite-300">{scoreBefore}</span>
          <ArrowRight className="w-3.5 h-3.5 text-graphite-500" />
          <span className={`font-bold text-sm ${isImproved ? 'text-brand-400' : 'text-graphite-100'}`}>
            {scoreAfter}
          </span>
          {isImproved && (
            <span className="text-[11px] text-brand-300 font-bold bg-brand-900/60 px-2 py-0.2 rounded border border-brand-700/60">
              +{scoreAfter - scoreBefore} pts
            </span>
          )}
        </div>

        <div className="hidden sm:block h-3.5 w-px bg-brand-800/60" />

        {/* Resolved Count */}
        <div className="flex items-center gap-1.5 text-brand-300 bg-graphite-900 px-2 py-0.5 rounded border border-brand-800/60 font-semibold text-[11px]">
          <CheckCircle2 className="w-3 h-3 text-brand-400" />
          <span>{resolvedIssues.length} resolved</span>
        </div>

        {/* Remaining Count */}
        <div className="flex items-center gap-1.5 text-graphite-300 bg-graphite-900 px-2 py-0.5 rounded border border-graphite-700 font-semibold text-[11px]">
          <AlertCircle className="w-3 h-3 text-orange-400" />
          <span>{remainingIssues.length} remaining</span>
        </div>

        {/* New Count */}
        {newIssues.length > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border text-red-300 bg-red-950/60 border-red-800/60 font-semibold text-[11px]">
            <PlusCircle className="w-3 h-3 text-red-400" />
            <span>{newIssues.length} new</span>
          </div>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="p-1 rounded text-graphite-400 hover:text-graphite-100 hover:bg-graphite-800 transition-colors shrink-0 cursor-pointer"
        title="Dismiss resolution summary"
        aria-label="Dismiss patch summary"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
