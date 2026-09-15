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
    <div className="bg-emerald-950/40 border-b border-emerald-800/60 px-4 sm:px-6 py-2 shadow-sm flex items-center justify-between gap-4 text-xs font-mono select-none shrink-0 text-emerald-300">
      <div className="flex items-center gap-3.5 flex-wrap">
        {/* Fix applied status */}
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-sans text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Fix applied & verified</span>
        </div>

        <div className="hidden sm:block h-3.5 w-px bg-emerald-800/60" />

        {/* Score delta */}
        <div className="flex items-center gap-2 font-mono">
          <span className="text-emerald-400/80 font-sans text-[11px] uppercase tracking-wider font-semibold">
            Score:
          </span>
          <span className="font-bold text-obsidian-300">{scoreBefore}</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
          <span className={`font-bold text-sm ${isImproved ? 'text-emerald-400' : 'text-obsidian-100'}`}>
            {scoreAfter}
          </span>
          {isImproved && (
            <span className="text-[11px] text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.2 rounded-[4px] border border-emerald-800/60">
              +{scoreAfter - scoreBefore} pts
            </span>
          )}
        </div>

        <div className="hidden sm:block h-3.5 w-px bg-emerald-800/60" />

        {/* Resolved Count */}
        <div className="flex items-center gap-1.5 text-emerald-300 bg-obsidian-900 px-2 py-0.5 rounded-[4px] border border-emerald-800/60 font-semibold text-[11px] shadow-sm">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>{resolvedIssues.length} resolved</span>
        </div>

        {/* Remaining Count */}
        <div className="flex items-center gap-1.5 text-amber-300 bg-obsidian-900 px-2 py-0.5 rounded-[4px] border border-amber-800/50 font-semibold text-[11px] shadow-sm">
          <AlertCircle className="w-3 h-3 text-amber-400" />
          <span>{remainingIssues.length} remaining</span>
        </div>

        {/* New Count */}
        {newIssues.length > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] border text-red-300 bg-red-950/50 border-red-800/60 font-semibold text-[11px] shadow-sm">
            <PlusCircle className="w-3 h-3 text-red-400" />
            <span>{newIssues.length} new</span>
          </div>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="p-1 rounded-[4px] text-emerald-400 hover:text-emerald-200 hover:bg-emerald-900/40 transition-colors shrink-0 cursor-pointer"
        title="Dismiss resolution summary"
        aria-label="Dismiss patch summary"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
