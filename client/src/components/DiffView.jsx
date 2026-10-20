import React, { useState } from 'react';
import {
  GitCommit,
  Copy,
  Check,
  Columns,
  AlignJustify,
  ArrowRight,
  Shield,
  Sparkles,
  FileCode,
  CheckCircle2,
} from 'lucide-react';
import { Button } from './ui/Button.jsx';
import { SeverityBadge } from './SeverityBadge.jsx';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext.jsx';

/**
 * CodeRabbit-Style Diff Review Experience.
 * Provides unified & split diff views with inline review findings and one-click patch application.
 */
export function DiffView({
  code = '',
  filename = 'source.js',
  issues = [],
  onApplyFix,
  onSelectIssue,
  className = '',
}) {
  const { isLight } = useTheme();
  const [diffMode, setDiffMode] = useState('unified'); // 'unified' | 'split'
  const [copied, setCopied] = useState(false);
  const [expandedIssueId, setExpandedIssueId] = useState(null);

  const lines = code.split('\n');

  // Map issues by starting line number
  const issuesByLine = new Map();
  issues.forEach((issue) => {
    const l = issue.line || 1;
    if (!issuesByLine.has(l)) {
      issuesByLine.set(l, []);
    }
    issuesByLine.get(l).push(issue);
  });

  // Generate unified diff representation
  const generateUnifiedDiffText = () => {
    let diff = `--- a/${filename}\n+++ b/${filename}\n@@ -1,${lines.length} +1,${lines.length} @@\n`;
    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const lineIssues = issuesByLine.get(lineNum) || [];
      const fix = lineIssues.find((i) => i.fix?.replacement)?.fix;

      if (fix && fix.original) {
        diff += `- ${fix.original}\n`;
        diff += `+ ${fix.replacement}\n`;
      } else {
        diff += `  ${lineText}\n`;
      }
    });
    return diff;
  };

  const handleCopyDiff = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(generateUnifiedDiffText());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {}
  };

  return (
    <div className={cn("h-full flex flex-col overflow-hidden font-sans", className)}>
      {/* 1. Diff View Toolbar */}
      <div className={cn(
        "px-4 py-2.5 border-b flex items-center justify-between gap-4 shrink-0 select-none text-xs",
        isLight ? "bg-slate-50 border-slate-200" : "bg-obsidian-900 border-obsidian-800"
      )}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold">
            <FileCode className="w-4 h-4 text-brand-500" />
            <span className={isLight ? "text-slate-900" : "text-obsidian-100"}>{filename}</span>
          </div>

          <span className={isLight ? "text-slate-400" : "text-obsidian-600"}>•</span>

          <span className="text-[11px] font-mono text-slate-500 dark:text-obsidian-400">
            {issues.length} {issues.length === 1 ? 'change annotation' : 'change annotations'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher: Unified vs Split */}
          <div className={cn(
            "flex items-center p-0.5 rounded-[5px] border text-xs font-mono",
            isLight ? "bg-white border-slate-200" : "bg-obsidian-950 border-obsidian-750"
          )}>
            <button
              type="button"
              onClick={() => setDiffMode('unified')}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-[3px] transition-colors cursor-pointer",
                diffMode === 'unified'
                  ? isLight ? "bg-slate-100 text-slate-900 font-bold" : "bg-obsidian-800 text-obsidian-50 font-bold"
                  : "text-slate-500 dark:text-obsidian-400 hover:text-slate-900 dark:hover:text-obsidian-200"
              )}
            >
              <AlignJustify className="w-3 h-3" />
              <span>Unified</span>
            </button>
            <button
              type="button"
              onClick={() => setDiffMode('split')}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-[3px] transition-colors cursor-pointer",
                diffMode === 'split'
                  ? isLight ? "bg-slate-100 text-slate-900 font-bold" : "bg-obsidian-800 text-obsidian-50 font-bold"
                  : "text-slate-500 dark:text-obsidian-400 hover:text-slate-900 dark:hover:text-obsidian-200"
              )}
            >
              <Columns className="w-3 h-3" />
              <span>Split</span>
            </button>
          </div>

          {/* Copy Raw Diff Button */}
          <button
            type="button"
            onClick={handleCopyDiff}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] border text-xs font-mono transition-colors cursor-pointer shadow-xs",
              isLight
                ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                : "bg-obsidian-950 border-obsidian-750 text-obsidian-300 hover:bg-obsidian-850"
            )}
            title="Copy Raw Patch Diff"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-500 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy Diff</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Scrollable Diff Code Canvas */}
      <div className="flex-1 overflow-auto bg-[#070709] font-mono text-xs select-text">
        {lines.map((lineText, idx) => {
          const lineNum = idx + 1;
          const lineIssues = issuesByLine.get(lineNum) || [];
          const hasIssue = lineIssues.length > 0;
          const primaryIssue = lineIssues[0];
          const hasFix = primaryIssue?.fix?.replacement;

          return (
            <div key={lineNum} className="group flex flex-col border-b border-white/[0.02]">
              {/* Diff Code Line */}
              <div
                className={cn(
                  "flex items-stretch hover:bg-white/[0.03] transition-colors",
                  hasIssue && "bg-amber-950/20"
                )}
              >
                {/* Line Gutter */}
                <div className="w-12 py-1 pr-3 text-right select-none text-obsidian-600 font-mono text-[11px] bg-black/40 border-r border-white/5 shrink-0">
                  {lineNum}
                </div>

                {/* Diff Type Symbol (+ / - / blank) */}
                <div className="w-6 py-1 text-center select-none font-bold text-obsidian-600 shrink-0">
                  {hasIssue ? (
                    <span className="text-amber-500 font-bold">!</span>
                  ) : (
                    ' '
                  )}
                </div>

                {/* Code Content */}
                <div className="flex-1 py-1 px-3 text-obsidian-200 whitespace-pre overflow-x-auto">
                  {lineText || ' '}
                </div>

                {/* Quick Finding Indicator Pill */}
                {hasIssue && (
                  <div className="px-3 py-1 flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedIssueId(expandedIssueId === primaryIssue.id ? null : primaryIssue.id);
                        if (onSelectIssue) onSelectIssue(primaryIssue.id);
                      }}
                      className={cn(
                        "px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1",
                        primaryIssue.severity === 'CRITICAL'
                          ? "bg-red-950/60 text-red-400 border border-red-800/60 hover:bg-red-900/60"
                          : primaryIssue.severity === 'HIGH'
                          ? "bg-orange-950/60 text-orange-400 border border-orange-800/60 hover:bg-orange-900/60"
                          : "bg-amber-950/60 text-amber-400 border border-amber-800/60 hover:bg-amber-900/60"
                      )}
                    >
                      <span>{primaryIssue.rule}</span>
                      <span className="text-white/60">·</span>
                      <span>Review</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Inline Expanded CodeRabbit Review Box */}
              {hasIssue && (expandedIssueId === primaryIssue.id || lineIssues.length > 0) && (
                <div className="ml-12 mr-4 my-2 p-3.5 rounded-[8px] bg-obsidian-900/90 border border-obsidian-750 shadow-xl space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={primaryIssue.severity} />
                      <span className="font-bold text-sm text-obsidian-100 font-sans">
                        {primaryIssue.title}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/30">
                      Line {lineNum}
                    </span>
                  </div>

                  <p className="text-xs text-obsidian-300 font-sans leading-relaxed">
                    {primaryIssue.description}
                  </p>

                  {/* Remediation / Suggested Diff Block */}
                  {hasFix && (
                    <div className="rounded-[6px] border border-obsidian-800 bg-obsidian-950 overflow-hidden font-mono text-xs">
                      <div className="px-3 py-1 bg-obsidian-900 border-b border-obsidian-800 text-[10px] uppercase tracking-wider text-obsidian-400 flex items-center justify-between">
                        <span>Suggested Fix</span>
                        <span className="text-emerald-400 font-semibold">+1 line</span>
                      </div>
                      <div className="p-2 space-y-1">
                        {primaryIssue.fix.original && (
                          <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-red-950/30 text-red-300 border border-red-800/30">
                            <span className="text-red-500 font-bold">-</span>
                            <span>{primaryIssue.fix.original}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-emerald-950/30 text-emerald-300 border border-emerald-800/30">
                          <span className="text-emerald-500 font-bold">+</span>
                          <span>{primaryIssue.fix.replacement}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => onSelectIssue && onSelectIssue(primaryIssue.id)}
                      className="text-xs font-mono text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Open in Findings Panel</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    {hasFix && onApplyFix && (
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => onApplyFix(primaryIssue)}
                        rightIcon={<CheckCircle2 className="w-3 h-3" />}
                      >
                        Apply Fix
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
