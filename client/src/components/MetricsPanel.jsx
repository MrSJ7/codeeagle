import React from 'react';
import { Layers } from 'lucide-react';

export function MetricsPanel({ metrics }) {
  if (!metrics) return null;

  const items = [
    { label: 'Lines', value: metrics.lines ?? '—' },
    { label: 'Functions', value: metrics.functions ?? '—' },
    { label: 'Branches', value: metrics.branches ?? '—' },
    { label: 'Complexity', value: metrics.complexity ?? '—' },
    { label: 'Max nesting', value: metrics.maxNesting ?? '—' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
      <div className="flex items-center gap-1.5 pb-2.5 border-b border-slate-800/80 mb-2.5 text-xs font-semibold text-slate-300">
        <Layers className="w-3.5 h-3.5 text-indigo-400" />
        <span className="uppercase tracking-wider text-[10px] font-mono text-slate-400">Static Metrics</span>
      </div>

      <div className="grid grid-cols-5 gap-1.5 text-center">
        {items.map((item) => (
          <div key={item.label} className="bg-slate-950/70 border border-slate-800/60 rounded p-1.5">
            <div className="text-sm font-bold font-mono text-slate-200">{item.value}</div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
