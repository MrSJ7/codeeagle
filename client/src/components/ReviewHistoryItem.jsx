import React from 'react';
import { Trash2, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';

function formatDate(isoString) {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export function ReviewHistoryItem({
  review,
  isSelected,
  onSelect,
  onDelete,
}) {
  const {
    reviewId,
    score = 0,
    filename = 'source.js',
    language = 'javascript',
    issueCount = 0,
    engine = 'static',
    createdAt,
  } = review;

  const scoreColor =
    score >= 80
      ? 'text-emerald-300 bg-emerald-950/50 border-emerald-800/60'
      : score >= 50
      ? 'text-amber-300 bg-amber-950/50 border-amber-800/60'
      : 'text-red-300 bg-red-950/50 border-red-800/60';

  const isHybrid = engine?.toLowerCase() === 'hybrid';

  return (
    <div
      onClick={() => onSelect(reviewId)}
      className={`group relative p-3 rounded-[6px] border text-left cursor-pointer transition-all duration-150 select-none shadow-sm ${
        isSelected
          ? 'bg-obsidian-800 border-brand-500 ring-1 ring-brand-500/40 text-obsidian-50'
          : 'bg-obsidian-850 border-obsidian-750 hover:border-obsidian-600 hover:bg-obsidian-800 text-obsidian-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2.5 mb-2">
        {/* Score & Filename */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-[4px] flex items-center justify-center font-mono font-bold text-xs border shrink-0 ${scoreColor}`}
          >
            {score}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-obsidian-100 truncate font-mono">
              <FileCode className="w-3.5 h-3.5 text-brand-500 shrink-0" />
              <span className="truncate">{filename}</span>
            </div>
            <div className="text-[10px] text-obsidian-400 font-mono capitalize truncate">
              {language}
            </div>
          </div>
        </div>

        {/* Delete button */}
        <button
          type="button"
          aria-label={`Delete review for ${filename}`}
          title="Delete this review"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(reviewId);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-[4px] text-obsidian-400 hover:text-red-400 hover:bg-obsidian-750 transition-all focus:opacity-100 shrink-0 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metadata tags */}
      <div className="flex items-center justify-between text-[11px] font-mono text-obsidian-400 pt-1.5 border-t border-obsidian-750">
        <div className="flex items-center gap-2">
          {/* Issue count */}
          <span className="flex items-center gap-1">
            {issueCount === 0 ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3 h-3 text-amber-400" />
            )}
            <span className={issueCount === 0 ? 'text-emerald-400 font-semibold' : 'text-obsidian-200 font-medium'}>
              {issueCount} {issueCount === 1 ? 'issue' : 'issues'}
            </span>
          </span>


        </div>

        {/* Timestamp */}
        <span className="text-[11px] text-obsidian-500">
          {formatDate(createdAt)}
        </span>
      </div>
    </div>
  );
}
