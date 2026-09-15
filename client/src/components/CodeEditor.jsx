import React, { useRef, useEffect, useState, useMemo } from 'react';
import { FileCode, Hash, AlertTriangle, CheckCircle2, ChevronDown, Sparkles } from 'lucide-react';

export function CodeEditor({
  code = '',
  onChange,
  issues = [],
  highlightedIssue = null,
  highlightedLine = null,
  filename = 'auth.js',
  language = 'JavaScript',
  reviewStatus = 'IDLE',
  isStale = false,
  presets = [],
  selectedPresetId = '',
  onSelectPreset,
  onSelectIssue,
}) {
  const textareaRef = useRef(null);
  const gutterRef = useRef(null);
  const overlayRef = useRef(null);
  const [isPresetOpen, setIsPresetOpen] = useState(false);

  const lines = code.split('\n');
  const lineCount = lines.length;

  // Determine active target lines for highlighting
  const activeStartLine = highlightedIssue?.line ?? highlightedLine ?? null;
  const activeEndLine = highlightedIssue?.endLine ?? activeStartLine ?? null;
  const activeSeverity = highlightedIssue?.severity || 'HIGH';

  // Map each line with an issue to its most severe issue for gutter indicators
  const issuesByLine = useMemo(() => {
    const map = new Map();
    if (!issues || !Array.isArray(issues)) return map;
    issues.forEach((issue) => {
      const line = issue.line;
      if (typeof line === 'number') {
        const existing = map.get(line);
        if (!existing) {
          map.set(line, issue);
        } else {
          // Keep more severe
          const rank = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          if ((rank[issue.severity] || 0) > (rank[existing.severity] || 0)) {
            map.set(line, issue);
          }
        }
      }
    });
    return map;
  }, [issues]);

  // Sync scroll between textarea, gutter, and background line overlay
  const handleScroll = () => {
    if (textareaRef.current) {
      const { scrollTop, scrollLeft } = textareaRef.current;
      if (gutterRef.current) gutterRef.current.scrollTop = scrollTop;
      if (overlayRef.current) overlayRef.current.scrollTop = scrollTop;
    }
  };

  // Support 2-space tab indentation
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      });
    }
  };

  // Auto-scroll to selected finding
  useEffect(() => {
    if (activeStartLine && textareaRef.current) {
      const lineHeight = 24; // matches leading-6
      const targetScroll = Math.max(0, (activeStartLine - 3) * lineHeight);
      textareaRef.current.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      });
    }
  }, [activeStartLine, filename, code]);

  // Highlight styling based on issue severity
  const getHighlightColor = () => {
    switch (activeSeverity) {
      case 'CRITICAL':
        return {
          gutter: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold border-l-2 border-red-500',
          overlay: 'bg-red-50/70 dark:bg-red-950/30 border-l-2 border-red-500',
          badge: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60',
        };
      case 'HIGH':
        return {
          gutter: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-bold border-l-2 border-orange-500',
          overlay: 'bg-orange-50/70 dark:bg-orange-950/30 border-l-2 border-orange-500',
          badge: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/60',
        };
      case 'MEDIUM':
        return {
          gutter: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border-l-2 border-amber-500',
          overlay: 'bg-amber-50/70 dark:bg-amber-950/30 border-l-2 border-amber-500',
          badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
        };
      default:
        return {
          gutter: 'bg-slate-100 dark:bg-obsidian-800/80 text-slate-700 dark:text-obsidian-300 font-bold border-l-2 border-slate-400 dark:border-obsidian-500',
          overlay: 'bg-slate-100/50 dark:bg-obsidian-800/40 border-l-2 border-slate-400 dark:border-obsidian-500',
          badge: 'bg-slate-100 dark:bg-obsidian-800 text-slate-700 dark:text-obsidian-300 border-slate-200 dark:border-obsidian-700',
        };
    }
  };

  const highlightStyles = getHighlightColor();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-obsidian-900 border-r border-slate-200 dark:border-obsidian-800 overflow-hidden select-none">
      {/* Editor Header Bar */}
      <div className="h-10 px-4 bg-slate-50 dark:bg-obsidian-950 border-b border-slate-200 dark:border-obsidian-800 flex items-center justify-between text-xs shrink-0 select-none">
        {/* Left: File metadata */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-mono text-slate-900 dark:text-obsidian-100 font-semibold">
            <FileCode className="w-3.5 h-3.5 text-blue-600 dark:text-brand-500" />
            <span>{filename}</span>
          </div>
          <span className="text-slate-300 dark:text-obsidian-600">•</span>
          <span className="text-[11px] font-mono text-slate-500 dark:text-obsidian-400">{language}</span>
          <span className="text-slate-300 dark:text-obsidian-600">•</span>
          <span className="text-[11px] font-mono text-slate-500 dark:text-obsidian-400">{lineCount} lines</span>

          {/* Active Highlight Badge */}
          {activeStartLine && (
            <span
              className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-[4px] border ml-2 ${highlightStyles.badge}`}
            >
              <Hash className="w-3 h-3" />
              Lines {activeStartLine}{activeEndLine && activeEndLine !== activeStartLine ? `-${activeEndLine}` : ''}
            </span>
          )}
        </div>

        {/* Right: Review status badge + Example preset selector */}
        <div className="flex items-center gap-3">
          {/* Review Status Pill */}
          <div className="text-[11px] font-medium flex items-center gap-1.5 font-mono">
            {isStale ? (
              <span className="flex items-center gap-1 text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded-[4px] border border-amber-800/40">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                Modified
              </span>
            ) : reviewStatus === 'ANALYZING' ? (
              <span className="flex items-center gap-1 text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-[4px] border border-brand-500/30">
                <Sparkles className="w-3 h-3 text-brand-500 animate-spin" />
                Analyzing
              </span>
            ) : reviewStatus === 'SUCCESS' ? (
              <span className="flex items-center gap-1 text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-[4px] border border-emerald-800/40">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Reviewed
              </span>
            ) : (
              <span className="text-obsidian-400">Ready</span>
            )}
          </div>

          {/* Examples Preset Dropdown */}
          {presets.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPresetOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-obsidian-850 hover:bg-obsidian-800 text-obsidian-200 border border-obsidian-750 text-xs font-mono font-medium transition-colors cursor-pointer shadow-sm"
                title="Load sample code scenario"
              >
                <span>Examples</span>
                <ChevronDown className="w-3 h-3 text-obsidian-400" />
              </button>

              {isPresetOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsPresetOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-[6px] shadow-2xl z-30 py-1 font-sans text-xs">
                    <div className="px-3 py-1.5 text-[10px] font-mono text-slate-500 dark:text-obsidian-400 uppercase tracking-wider border-b border-slate-200 dark:border-obsidian-800">
                      Sample Scenarios
                    </div>
                    {presets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          onSelectPreset(preset.id);
                          setIsPresetOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex flex-col gap-0.5 hover:bg-slate-50 dark:hover:bg-obsidian-800 transition-colors cursor-pointer ${
                          selectedPresetId === preset.id ? 'bg-blue-50 dark:bg-brand-500/15 text-blue-700 dark:text-brand-300' : 'text-slate-800 dark:text-obsidian-200'
                        }`}
                      >
                        <div className="font-semibold text-xs flex items-center justify-between">
                          <span>{preset.name}</span>
                          {selectedPresetId === preset.id && (
                            <span className="text-[10px] font-mono text-blue-600 dark:text-brand-400 font-bold">Active</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-obsidian-400 truncate">
                          {preset.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Editor Body: Gutter + Synchronized Textarea */}
      <div className="relative flex-1 flex overflow-hidden font-mono text-xs leading-6">
        {/* Line Numbers Gutter */}
        <div
          ref={gutterRef}
          className="w-12 py-3 bg-slate-50 dark:bg-obsidian-950 border-r border-slate-200 dark:border-obsidian-800 text-slate-400 dark:text-obsidian-500 text-right pr-3 select-none overflow-hidden shrink-0"
          aria-hidden="true"
        >
          {lines.map((_, index) => {
            const lineNum = index + 1;
            const isTargetLine =
              activeStartLine !== null &&
              lineNum >= activeStartLine &&
              lineNum <= (activeEndLine || activeStartLine);
            const lineIssue = issuesByLine.get(lineNum);

            let gutterItemClass = 'h-6 relative flex items-center justify-end font-mono';
            if (isTargetLine) {
              gutterItemClass += ` ${highlightStyles.gutter}`;
            }

            return (
              <div
                key={lineNum}
                className={gutterItemClass}
                onClick={() => {
                  if (lineIssue && onSelectIssue) {
                    onSelectIssue(lineIssue.id);
                  }
                }}
                style={{ cursor: lineIssue ? 'pointer' : 'default' }}
                title={lineIssue ? `${lineIssue.severity}: ${lineIssue.title}` : undefined}
              >
                {/* Issue Indicator Pip */}
                {lineIssue && (
                  <span
                    className={`absolute left-2 w-1.5 h-1.5 rounded-full ${
                      lineIssue.severity === 'CRITICAL'
                        ? 'bg-red-500'
                        : lineIssue.severity === 'HIGH'
                        ? 'bg-orange-500'
                        : lineIssue.severity === 'MEDIUM'
                        ? 'bg-amber-500'
                        : 'bg-slate-400 dark:bg-obsidian-400'
                    }`}
                  />
                )}
                <span>{lineNum}</span>
              </div>
            );
          })}
        </div>

        {/* Code Canvas Container */}
        <div className="relative flex-1 h-full overflow-hidden bg-white dark:bg-obsidian-900">
          {/* Highlight Background Layer */}
          <div
            ref={overlayRef}
            className="absolute inset-0 py-3 pointer-events-none overflow-hidden select-none"
            aria-hidden="true"
          >
            {lines.map((_, index) => {
              const lineNum = index + 1;
              const isTargetLine =
                activeStartLine !== null &&
                lineNum >= activeStartLine &&
                lineNum <= (activeEndLine || activeStartLine);

              return (
                <div
                  key={lineNum}
                  className={`h-6 w-full ${isTargetLine ? highlightStyles.overlay : ''}`}
                />
              );
            })}
          </div>

          {/* Empty State Overlay when buffer is cleared */}
          {!code.trim() && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none pointer-events-auto z-20 bg-white dark:bg-obsidian-900">
              <div className="w-12 h-12 rounded-[8px] bg-blue-50 dark:bg-obsidian-850 border border-blue-200 dark:border-obsidian-750 flex items-center justify-center mb-4 text-blue-600 dark:text-brand-500 shadow-xs">
                <FileCode className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-obsidian-100 font-sans mb-1">
                Paste your code
              </h3>
              <p className="text-sm text-slate-500 dark:text-obsidian-400 font-sans max-w-sm mb-5 leading-relaxed">
                Paste raw JavaScript or JSX source code to review, or select a pre-configured sample scenario:
              </p>
              <div className="flex items-center gap-2 flex-wrap justify-center font-mono text-xs">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onSelectPreset(preset.id)}
                    className="px-3 py-1.5 rounded-[4px] bg-slate-100 dark:bg-obsidian-850 hover:bg-slate-200 dark:hover:bg-obsidian-800 text-slate-800 dark:text-obsidian-200 border border-slate-200 dark:border-obsidian-750 hover:border-blue-400 dark:hover:border-brand-500/40 transition-colors cursor-pointer shadow-xs"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Editable Textarea Surface */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            aria-label={`Code editor for ${filename}`}
            className="absolute inset-0 w-full h-full py-3 px-4 bg-transparent text-slate-900 dark:text-[#E6EDF3] resize-none outline-none font-mono text-[13px] leading-6 selection:bg-blue-500/25 dark:selection:bg-brand-500/25 dark-editor-scrollbar overflow-auto z-10"
            style={{ tabSize: 2 }}
          />
        </div>
      </div>
    </div>
  );
}
