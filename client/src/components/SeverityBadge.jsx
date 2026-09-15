import React from 'react';

export function SeverityBadge({ severity }) {
  const norm = (severity || 'LOW').toUpperCase();

  const config = {
    CRITICAL: {
      pill: 'bg-red-50 text-[#D92D20] border-red-200/80',
      dot: 'bg-[#D92D20]',
    },
    HIGH: {
      pill: 'bg-orange-50 text-[#E87B21] border-orange-200/80',
      dot: 'bg-[#E87B21]',
    },
    MEDIUM: {
      pill: 'bg-amber-50 text-[#C58B00] border-amber-200/80',
      dot: 'bg-[#C58B00]',
    },
    LOW: {
      pill: 'bg-slate-50 text-[#4D78A8] border-slate-200/80',
      dot: 'bg-[#4D78A8]',
    },
  }[norm] || {
    pill: 'bg-slate-50 text-[#4D78A8] border-slate-200/80',
    dot: 'bg-[#4D78A8]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-sans font-semibold tracking-wider uppercase border ${config.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      <span>{norm}</span>
    </span>
  );
}

