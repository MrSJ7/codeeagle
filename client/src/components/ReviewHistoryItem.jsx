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
      ? 'text-[#087A54] bg-[#DDF7EC] border-[#0F9F6E]/40'
      : score >= 60
      ? 'text-[#C58B00] bg-amber-50 border-[#C58B00]/40'
      : 'text-[#D92D20] bg-red-50 border-[#D92D20]/40';

  const isHybrid = engine?.toLowerCase() === 'hybrid';

  return (
    <div
      onClick={() => onSelect(reviewId)}
      className={`group relative p-3 rounded border text-left cursor-pointer transition-all duration-150 select-none ${
        isSelected
          ? 'bg-[#DDF7EC]/20 border-[#0F9F6E] shadow-2xs ring-1 ring-[#0F9F6E]/30'
          : 'bg-white border-stone-200/90 hover:bg-stone-50/80 hover:border-stone-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2.5 mb-2">
        {/* Score & Filename */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded flex items-center justify-center font-mono font-bold text-xs border shrink-0 ${scoreColor}`}
          >
            {score}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900 truncate font-mono">
              <FileCode className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span className="truncate">{filename}</span>
            </div>
            <div className="text-[10px] text-stone-500 font-mono capitalize truncate">
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
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-stone-400 hover:text-[#D92D20] hover:bg-red-50 transition-all focus:opacity-100 shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metadata tags */}
      <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 pt-1.5 border-t border-stone-100">
        <div className="flex items-center gap-2">
          {/* Issue count */}
          <span className="flex items-center gap-1">
            {issueCount === 0 ? (
              <CheckCircle2 className="w-3 h-3 text-[#0F9F6E]" />
            ) : (
              <AlertCircle className="w-3 h-3 text-[#E87B21]" />
            )}
            <span className={issueCount === 0 ? 'text-[#087A54] font-medium' : 'text-stone-700'}>
              {issueCount} {issueCount === 1 ? 'issue' : 'issues'}
            </span>
          </span>

          {/* Engine badge */}
          <span
            className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-semibold border ${
              isHybrid
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-stone-100 text-stone-600 border-stone-200'
            }`}
          >
            {isHybrid ? 'Hybrid' : 'Static'}
          </span>
        </div>

        {/* Timestamp */}
        <span className="text-stone-400 text-[10px] truncate max-w-[130px]" title={createdAt}>
          {formatDate(createdAt)}
        </span>
      </div>

      {/* Selected marker pill */}
      {isSelected && (
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[9px] font-mono font-medium text-[#087A54] bg-[#DDF7EC] border border-[#0F9F6E]/40 px-1.5 py-0.2 rounded">
          Active
        </div>
      )}
    </div>
  );
}

