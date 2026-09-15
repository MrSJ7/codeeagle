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
    <div className="bg-emerald-50 border-b border-emerald-200 px-4 sm:px-6 py-2 shadow-dev-sm flex items-center justify-between gap-4 text-xs font-mono select-none shrink-0 text-emerald-950">
      <div className="flex items-center gap-3.5 flex-wrap">
        {/* Fix applied status */}
        <div className="flex items-center gap-1.5 text-emerald-700 font-bold font-sans text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Fix applied & verified</span>
        </div>

        <div className="hidden sm:block h-3.5 w-px bg-emerald-200" />

        {/* Score delta */}
        <div className="flex items-center gap-2 font-mono">
          <span className="text-emerald-800 font-sans text-[11px] uppercase tracking-wider font-semibold">
            Score:
          </span>
          <span className="font-bold text-emerald-900">{scoreBefore}</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
          <span className={`font-bold text-sm ${isImproved ? 'text-emerald-700' : 'text-emerald-950'}`}>
            {scoreAfter}
          </span>
          {isImproved && (
            <span className="text-[11px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.2 rounded border border-emerald-300">
              +{scoreAfter - scoreBefore} pts
            </span>
          )}
        </div>

        <div className="hidden sm:block h-3.5 w-px bg-emerald-200" />

        {/* Resolved Count */}
        <div className="flex items-center gap-1.5 text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200 font-semibold text-[11px] shadow-dev-sm">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>{resolvedIssues.length} resolved</span>
        </div>

        {/* Remaining Count */}
        <div className="flex items-center gap-1.5 text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold text-[11px] shadow-dev-sm">
          <AlertCircle className="w-3 h-3 text-amber-600" />
          <span>{remainingIssues.length} remaining</span>
        </div>

        {/* New Count */}
        {newIssues.length > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border text-red-700 bg-red-50 border-red-200 font-semibold text-[11px] shadow-dev-sm">
            <PlusCircle className="w-3 h-3 text-red-600" />
            <span>{newIssues.length} new</span>
          </div>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="p-1 rounded text-emerald-700 hover:text-emerald-950 hover:bg-emerald-100 transition-colors shrink-0 cursor-pointer"
        title="Dismiss resolution summary"
        aria-label="Dismiss patch summary"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
