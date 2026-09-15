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
    <div className="bg-[#DDF7EC]/70 border-b border-[#0F9F6E]/30 px-4 sm:px-6 py-2 shadow-2xs flex items-center justify-between gap-4 text-xs font-mono select-none shrink-0">
      <div className="flex items-center gap-3.5 flex-wrap">
        {/* Fix applied status */}
        <div className="flex items-center gap-1.5 text-[#087A54] font-semibold font-sans text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#0F9F6E]" />
          <span>Fix applied</span>
        </div>

        <div className="hidden sm:block h-3.5 w-px bg-[#0F9F6E]/30" />

        {/* Score delta */}
        <div className="flex items-center gap-2">
          <span className="text-stone-500 font-sans text-[11px] uppercase tracking-wider font-medium">
            Score:
          </span>
          <span className="font-bold text-stone-700">{scoreBefore}</span>
          <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
          <span className={`font-bold text-sm ${isImproved ? 'text-[#087A54]' : 'text-stone-800'}`}>
            {scoreAfter}
          </span>
          {isImproved && (
            <span className="text-[10px] text-[#087A54] font-bold bg-white px-1.5 py-0.5 rounded border border-[#0F9F6E]/40">
              +{scoreAfter - scoreBefore} pts
            </span>
          )}
        </div>

        {/* Separator */}
        <div className="hidden sm:block h-3.5 w-px bg-[#0F9F6E]/30" />

        {/* Resolved Count */}
        <div className="flex items-center gap-1.5 text-[#087A54] bg-white px-2 py-0.5 rounded border border-[#0F9F6E]/30 font-medium text-[11px]">
          <CheckCircle2 className="w-3 h-3 text-[#0F9F6E]" />
          <span>{resolvedIssues.length} resolved</span>
        </div>

        {/* Remaining Count */}
        <div className="flex items-center gap-1.5 text-stone-700 bg-white px-2 py-0.5 rounded border border-stone-200 font-medium text-[11px]">
          <AlertCircle className="w-3 h-3 text-[#E87B21]" />
          <span>{remainingIssues.length} remaining</span>
        </div>

        {/* New Count */}
        {newIssues.length > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border text-[#D92D20] bg-red-50 border-red-200 font-medium text-[11px]">
            <PlusCircle className="w-3 h-3 text-[#D92D20]" />
            <span>{newIssues.length} new</span>
          </div>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-[#DDF7EC] transition-colors shrink-0"
        title="Dismiss resolution summary"
        aria-label="Dismiss patch summary"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

