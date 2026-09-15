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
          gutter: 'bg-[#DC2626]/20 text-red-300 font-bold border-l border-[#DC2626]',
          overlay: 'bg-[#DC2626]/12 border-l border-[#DC2626]',
          badge: 'bg-[#DC2626]/20 text-red-300 border-[#DC2626]/40',
        };
      case 'HIGH':
        return {
          gutter: 'bg-[#EA580C]/20 text-orange-300 font-bold border-l border-[#EA580C]',
          overlay: 'bg-[#EA580C]/12 border-l border-[#EA580C]',
          badge: 'bg-[#EA580C]/20 text-orange-300 border-[#EA580C]/40',
        };
      case 'MEDIUM':
        return {
          gutter: 'bg-[#D97706]/20 text-amber-300 font-bold border-l border-[#D97706]',
          overlay: 'bg-[#D97706]/12 border-l border-[#D97706]',
          badge: 'bg-[#D97706]/20 text-amber-300 border-[#D97706]/40',
        };
      default:
        return {
          gutter: 'bg-[#2563EB]/20 text-blue-300 font-bold border-l border-[#2563EB]',
          overlay: 'bg-[#2563EB]/12 border-l border-[#2563EB]',
          badge: 'bg-[#2563EB]/20 text-blue-300 border-[#2563EB]/40',
        };
    }
  };

  const highlightStyles = getHighlightColor();

  return (
    <div className="flex flex-col h-full bg-[#16191D] border-r border-slate-200/90 overflow-hidden select-none">
      {/* Editor Header Bar */}
      <div className="h-10 px-4 bg-[#111316] border-b border-[#21262D] flex items-center justify-between text-xs shrink-0 select-none">
        {/* Left: File metadata */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-mono text-[#E6EDF3] font-semibold">
            <FileCode className="w-3.5 h-3.5 text-[#0F9F6E]" />
            <span>{filename}</span>
          </div>
          <span className="text-[#6E7681]">•</span>
          <span className="text-[11px] font-mono text-[#8B949E]">{language}</span>
          <span className="text-[#6E7681]">•</span>
          <span className="text-[11px] font-mono text-[#8B949E]">{lineCount} lines</span>

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
              <span className="flex items-center gap-1 text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/40">
                <AlertTriangle className="w-3 h-3" />
                Review stale
              </span>
            ) : reviewStatus === 'ANALYZING' ? (
              <span className="flex items-center gap-1 text-[#34D399] bg-[#0F9F6E]/20 px-2 py-0.5 rounded border border-[#0F9F6E]/40">
                <Sparkles className="w-3 h-3 text-[#34D399] animate-spin" />
                Analyzing
              </span>
            ) : reviewStatus === 'SUCCESS' ? (
              <span className="flex items-center gap-1 text-[#34D399] bg-[#0F9F6E]/15 px-2 py-0.5 rounded border border-[#0F9F6E]/30">
                <CheckCircle2 className="w-3 h-3" />
                Reviewed
              </span>
            ) : (
              <span className="text-[#8B949E]">Ready to review</span>
            )}
          </div>

          {/* Examples Preset Dropdown */}
          {presets.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPresetOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1C2128] hover:bg-[#262C36] text-[#C9D1D9] border border-[#30363D] text-xs font-mono font-medium transition-colors"
                title="Load sample code scenario"
              >
                <span>Examples</span>
                <ChevronDown className="w-3 h-3 text-[#8B949E]" />
              </button>

              {isPresetOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsPresetOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-60 bg-[#161B22] border border-[#30363D] rounded-lg shadow-xl z-30 py-1 font-sans text-xs">
                    <div className="px-3 py-1.5 text-[10px] font-mono text-[#8B949E] uppercase tracking-wider border-b border-[#21262D]">
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
                        className={`w-full text-left px-3 py-2 flex flex-col gap-0.5 hover:bg-[#1F242C] transition-colors ${
                          selectedPresetId === preset.id ? 'bg-[#0F9F6E]/15 text-[#34D399]' : 'text-[#C9D1D9]'
                        }`}
                      >
                        <div className="font-semibold text-xs flex items-center justify-between">
                          <span>{preset.name}</span>
                          {selectedPresetId === preset.id && (
                            <span className="text-[10px] font-mono text-[#34D399]">Active</span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#8B949E] truncate">
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
          className="w-12 py-3 bg-[#111316] border-r border-[#21262D] text-[#8B949E] text-right pr-3 select-none overflow-hidden shrink-0"
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
                        ? 'bg-[#DC2626]'
                        : lineIssue.severity === 'HIGH'
                        ? 'bg-[#EA580C]'
                        : lineIssue.severity === 'MEDIUM'
                        ? 'bg-[#D97706]'
                        : 'bg-[#2563EB]'
                    }`}
                  />
                )}
                <span>{lineNum}</span>
              </div>
            );
          })}
        </div>

        {/* Code Canvas Container */}
        <div className="relative flex-1 h-full overflow-hidden bg-[#16191D]">
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
            className="absolute inset-0 w-full h-full py-3 px-4 bg-transparent text-[#E6EDF3] resize-none outline-hidden font-mono text-xs leading-6 selection:bg-[#264F78] selection:text-white dark-editor-scrollbar overflow-auto z-10"
            style={{ tabSize: 2 }}
          />
        </div>
      </div>
    </div>
  );
}
