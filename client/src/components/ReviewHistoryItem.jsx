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
      ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
      : score >= 50
      ? 'text-amber-800 bg-amber-50 border-amber-200'
      : 'text-red-700 bg-red-50 border-red-200';

  const isHybrid = engine?.toLowerCase() === 'hybrid';

  return (
    <div
      onClick={() => onSelect(reviewId)}
      className={`group relative p-3 rounded-lg border text-left cursor-pointer transition-all duration-150 select-none shadow-dev-sm ${
        isSelected
          ? 'bg-emerald-50/70 border-brand-500 ring-1 ring-brand-500/30'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
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
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 truncate font-mono">
              <FileCode className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span className="truncate">{filename}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono capitalize truncate">
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
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-all focus:opacity-100 shrink-0 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metadata tags */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1.5 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {/* Issue count */}
          <span className="flex items-center gap-1">
            {issueCount === 0 ? (
              <CheckCircle2 className="w-3 h-3 text-brand-600" />
            ) : (
              <AlertCircle className="w-3 h-3 text-amber-600" />
            )}
            <span className={issueCount === 0 ? 'text-brand-700 font-semibold' : 'text-slate-700 font-medium'}>
              {issueCount} {issueCount === 1 ? 'issue' : 'issues'}
            </span>
          </span>

          {/* Engine indicator */}
          <span className="text-slate-300">•</span>
          <span
            className={`text-[9px] uppercase px-1 py-0.2 rounded font-bold ${
              isHybrid
                ? 'text-teal-800 bg-teal-50 border border-teal-200'
                : 'text-blue-800 bg-blue-50 border border-blue-200'
            }`}
          >
            {engine}
          </span>
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-slate-400">
          {formatDate(createdAt)}
        </span>
      </div>
    </div>
  );
}
