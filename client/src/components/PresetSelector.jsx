import React from 'react';
import { ChevronDown, Code } from 'lucide-react';

export function PresetSelector({ presets, selectedPresetId, onSelectPreset }) {
  return (
    <div className="relative inline-flex items-center">
      <Code className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
      <select
        value={selectedPresetId}
        onChange={(e) => onSelectPreset(e.target.value)}
        className="appearance-none bg-slate-800/90 hover:bg-slate-700/80 text-slate-200 text-xs font-medium pl-8 pr-7 py-1.5 rounded-md border border-slate-700 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
      >
        {presets.map((preset) => (
          <option key={preset.id} value={preset.id} className="bg-slate-900 text-slate-200">
            {preset.name}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 pointer-events-none" />
    </div>
  );
}
