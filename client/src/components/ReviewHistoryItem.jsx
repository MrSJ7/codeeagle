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
      ? 'text-brand-300 bg-brand-950/80 border-brand-800/80'
      : score >= 50
      ? 'text-orange-300 bg-orange-950/80 border-orange-800/80'
      : 'text-red-300 bg-red-950/80 border-red-800/80';

  const isHybrid = engine?.toLowerCase() === 'hybrid';

  return (
    <div
      onClick={() => onSelect(reviewId)}
      className={`group relative p-3 rounded-lg border text-left cursor-pointer transition-all duration-150 select-none shadow-dev-sm ${
        isSelected
          ? 'bg-graphite-850 border-brand-500 ring-1 ring-brand-500/30'
          : 'bg-graphite-900 border-graphite-800 hover:border-graphite-700 hover:bg-graphite-850'
      }`}
    >
      <div className="flex items-start justify-between gap-2.5 mb-2">
        {/* Score & Filename */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-md flex items-center justify-center font-mono font-bold text-xs border shrink-0 ${scoreColor}`}
          >
            {score}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-graphite-100 truncate font-mono">
              <FileCode className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span className="truncate">{filename}</span>
            </div>
            <div className="text-[10px] text-graphite-500 font-mono capitalize truncate">
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
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-graphite-500 hover:text-red-400 hover:bg-graphite-800 transition-all focus:opacity-100 shrink-0 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metadata tags */}
      <div className="flex items-center justify-between text-[11px] font-mono text-graphite-400 pt-1.5 border-t border-graphite-800">
        <div className="flex items-center gap-2">
          {/* Issue count */}
          <span className="flex items-center gap-1">
            {issueCount === 0 ? (
              <CheckCircle2 className="w-3 h-3 text-brand-400" />
            ) : (
              <AlertCircle className="w-3 h-3 text-orange-400" />
            )}
            <span className={issueCount === 0 ? 'text-brand-300 font-medium' : 'text-graphite-300'}>
              {issueCount} {issueCount === 1 ? 'issue' : 'issues'}
            </span>
          </span>

          {/* Engine badge */}
          <span
            className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-semibold border ${
              isHybrid
                ? 'bg-teal-950/60 text-teal-300 border-teal-800/60'
                : 'bg-graphite-800 text-cyan-300 border-graphite-700'
            }`}
          >
            {isHybrid ? 'Hybrid' : 'Static'}
          </span>
        </div>

        {/* Timestamp */}
        <span className="text-graphite-500 text-[11px] truncate max-w-[130px]" title={createdAt}>
          {formatDate(createdAt)}
        </span>
      </div>

      {/* Selected marker pill */}
      {isSelected && (
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[10px] font-mono font-medium text-brand-300 bg-brand-950/80 border border-brand-700/60 px-1.5 py-0.2 rounded">
          Active
        </div>
      )}
    </div>
  );
}
