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
      const targetScroll = (activeStartLine - 4) * lineHeight;
      textareaRef.current.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  }, [activeStartLine]);

  // Highlight styling based on issue severity
  const getHighlightColor = () => {
    switch (activeSeverity) {
      case 'CRITICAL':
        return {
          gutter: 'bg-[#D92D20]/25 text-red-200 font-bold border-l-2 border-[#D92D20]',
          overlay: 'bg-[#D92D20]/10 border-l-2 border-[#D92D20]',
          badge: 'bg-[#D92D20]/20 text-red-300 border-[#D92D20]/40',
        };
      case 'HIGH':
        return {
          gutter: 'bg-[#E87B21]/25 text-orange-200 font-bold border-l-2 border-[#E87B21]',
          overlay: 'bg-[#E87B21]/10 border-l-2 border-[#E87B21]',
          badge: 'bg-[#E87B21]/20 text-orange-300 border-[#E87B21]/40',
        };
      case 'MEDIUM':
        return {
          gutter: 'bg-[#C58B00]/25 text-amber-200 font-bold border-l-2 border-[#C58B00]',
          overlay: 'bg-[#C58B00]/10 border-l-2 border-[#C58B00]',
          badge: 'bg-[#C58B00]/20 text-amber-300 border-[#C58B00]/40',
        };
      default:
        return {
          gutter: 'bg-[#4D78A8]/25 text-blue-200 font-bold border-l-2 border-[#4D78A8]',
          overlay: 'bg-[#4D78A8]/10 border-l-2 border-[#4D78A8]',
          badge: 'bg-[#4D78A8]/20 text-blue-300 border-[#4D78A8]/40',
        };
    }
  };

  const highlightStyles = getHighlightColor();

  return (
    <div className="flex flex-col h-full bg-[#171A19] border-r border-stone-200/90 overflow-hidden select-none">
      {/* Editor Header Bar */}
      <div className="h-10 px-4 bg-[#121514] border-b border-[#242826] flex items-center justify-between text-xs shrink-0 select-none">
        {/* Left: File metadata */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-mono text-[#E8EEE9] font-medium">
            <FileCode className="w-3.5 h-3.5 text-[#0F9F6E]" />
            <span>{filename}</span>
          </div>
          <span className="text-[#3A403C]">•</span>
          <span className="text-[11px] font-mono text-[#8F9E94]">{language}</span>
          <span className="text-[#3A403C]">•</span>
          <span className="text-[11px] font-mono text-[#8F9E94]">{lineCount} lines</span>

          {/* Active Highlight Badge */}
          {activeStartLine && (
            <span
              className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border ml-2 ${highlightStyles.badge}`}
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
              <span className="flex items-center gap-1 text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                <AlertTriangle className="w-3 h-3" />
                Review stale
              </span>
            ) : reviewStatus === 'SUCCESS' ? (
              <span className="flex items-center gap-1 text-[#0F9F6E] bg-[#0F9F6E]/10 px-2 py-0.5 rounded border border-[#0F9F6E]/30">
                <CheckCircle2 className="w-3 h-3" />
                Reviewed
              </span>
            ) : reviewStatus === 'ANALYZING' ? (
              <span className="flex items-center gap-1 text-[#0F9F6E] bg-[#0F9F6E]/10 px-2 py-0.5 rounded border border-[#0F9F6E]/30 animate-pulse">
                Analyzing...
              </span>
            ) : (
              <span className="text-[#5E6963] text-[10px]">Ready</span>
            )}
          </div>

          {/* Example Presets Dropdown */}
          {presets && presets.length > 0 && onSelectPreset && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPresetOpen(!isPresetOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1C201E] hover:bg-[#242826] text-[#C4CEC7] hover:text-[#E8EEE9] border border-[#2D3330] text-[11px] font-medium transition-colors"
                title="Load sample code"
              >
                <span>Examples</span>
                <ChevronDown className="w-3 h-3 text-[#7D8A82]" />
              </button>

              {isPresetOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsPresetOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-1 w-64 bg-[#171A19] border border-[#2D3330] rounded-md shadow-xl py-1 z-30 font-sans">
                    <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#7D8A82] border-b border-[#242826]">
                      Sample Code
                    </div>
                    {presets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          onSelectPreset(preset.id);
                          setIsPresetOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors flex flex-col ${
                          selectedPresetId === preset.id
                            ? 'bg-[#0F9F6E]/15 text-[#34D399] font-semibold'
                            : 'text-[#C4CEC7] hover:bg-[#202422] hover:text-white'
                        }`}
                      >
                        <span>{preset.name}</span>
                        {preset.description && (
                          <span className="text-[10px] text-[#7D8A82] font-normal mt-0.5 line-clamp-1">
                            {preset.description}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Editor Surface with Line Highlighting & Synchronized Gutter */}
      <div className="relative flex-1 flex overflow-hidden font-mono text-xs leading-6 bg-[#171A19]">
        {/* Line Numbers Gutter with Inline Finding Indicators */}
        <div
          ref={gutterRef}
          aria-hidden="true"
          className="w-14 bg-[#121514] text-[#5E6963] select-none text-right pr-2.5 py-3 border-r border-[#242826] overflow-hidden font-mono shrink-0"
        >
          {lines.map((_, i) => {
            const lineNum = i + 1;
            const isTargeted =
              activeStartLine !== null &&
              lineNum >= activeStartLine &&
              lineNum <= (activeEndLine || activeStartLine);

            const lineIssue = issuesByLine.get(lineNum);
            const dotColor =
              lineIssue?.severity === 'CRITICAL'
                ? 'text-[#D92D20]'
                : lineIssue?.severity === 'HIGH'
                ? 'text-[#E87B21]'
                : lineIssue?.severity === 'MEDIUM'
                ? 'text-[#C58B00]'
                : lineIssue?.severity === 'LOW'
                ? 'text-[#4D78A8]'
                : null;

            return (
              <div
                key={lineNum}
                onClick={() => {
                  if (lineIssue && onSelectIssue) {
                    onSelectIssue(lineIssue.id);
                  }
                }}
                className={`h-6 flex items-center justify-end gap-1.5 transition-colors ${
                  isTargeted ? highlightStyles.gutter + ' -mr-2.5 pr-2.5' : ''
                } ${lineIssue ? 'cursor-pointer hover:text-[#E8EEE9]' : ''}`}
                title={lineIssue ? `${lineIssue.severity}: ${lineIssue.title}` : undefined}
              >
                {/* Inline finding marker dot */}
                {lineIssue && (
                  <span className={`text-[9px] ${dotColor} leading-none select-none`} aria-hidden="true">
                    ●
                  </span>
                )}
                <span>{lineNum}</span>
              </div>
            );
          })}
        </div>

        {/* Line Highlight Overlay Layer (Behind Textarea, Pointer-Events None) */}
        <div
          ref={overlayRef}
          aria-hidden="true"
          className="absolute inset-y-0 left-14 right-0 pointer-events-none overflow-hidden py-3 font-mono text-xs leading-6"
        >
          {lines.map((_, i) => {
            const lineNum = i + 1;
            const isTargeted =
              activeStartLine !== null &&
              lineNum >= activeStartLine &&
              lineNum <= (activeEndLine || activeStartLine);

            return (
              <div
                key={lineNum}
                className={`h-6 w-full ${isTargeted ? highlightStyles.overlay : ''}`}
              />
            );
          })}
        </div>

        {/* Code Input Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          spellCheck="false"
          className="dark-editor-scrollbar relative z-10 flex-1 h-full w-full bg-transparent text-[#E8EEE9] p-3 pl-3 resize-none focus:outline-none font-mono text-xs leading-6 overflow-auto whitespace-pre tab-4 selection:bg-[#0F9F6E]/30 selection:text-[#E8EEE9]"
          placeholder="// Paste JavaScript or JSX source code here..."
        />
      </div>
    </div>
  );
}

