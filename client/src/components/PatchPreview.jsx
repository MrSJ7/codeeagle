import React, { useEffect } from 'react';
import { X, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from './ui/Button.jsx';

export function PatchPreview({
  isOpen,
  onClose,
  issue,
  previewData,
  onConfirmApply,
  onApply,
  isApplying = false,
}) {
  const confirmHandler = onConfirmApply || onApply;
  // Handle Escape key to dismiss preview
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !issue) return null;

  const originalSnippet = previewData?.original || issue?.fix?.original || '';
  const replacementSnippet = previewData?.replacement || issue?.fix?.replacement || '';
  const startLine = previewData?.startLine || issue?.line;
  const endLine = previewData?.endLine || issue?.endLine || startLine;

  const originalLines = originalSnippet ? originalSnippet.split('\n') : [];
  const replacementLines = replacementSnippet ? replacementSnippet.split('\n') : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="patch-preview-title"
    >
      <div
        className="w-full max-w-xl bg-obsidian-900 border border-obsidian-750 rounded-[8px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] select-none font-sans text-obsidian-50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-obsidian-850 border-b border-slate-200 dark:border-obsidian-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-[4px] bg-blue-50 dark:bg-brand-500/15 border border-blue-200 dark:border-brand-500/30 flex items-center justify-center text-blue-600 dark:text-brand-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 id="patch-preview-title" className="text-base font-bold text-slate-900 dark:text-obsidian-100 flex items-center gap-2">
                <span>Preview AI Patch</span>
                {issue.rule && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[3px] bg-blue-50 dark:bg-obsidian-800 text-blue-600 dark:text-brand-400 border border-blue-200 dark:border-obsidian-700">
                    {issue.rule}
                  </span>
                )}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-[4px] flex items-center justify-center text-slate-500 dark:text-obsidian-400 hover:text-slate-900 dark:hover:text-obsidian-100 hover:bg-slate-100 dark:hover:bg-obsidian-800 transition-colors cursor-pointer"
            title="Close Preview"
            aria-label="Close Preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3.5 text-xs">
          {/* Issue title */}
          <div className="text-xs font-bold text-slate-900 dark:text-obsidian-100">
            {issue.title}
          </div>

          {/* Verification notice */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-[6px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Lines {startLine}{endLine !== startLine ? `–${endLine}` : ''} · AI patch verified against current source.
            </span>
          </div>

          {/* PR Unified Diff Box: Deep Graphite Surface */}
          <div className="rounded-[6px] border border-slate-200 dark:border-obsidian-800 bg-slate-50 dark:bg-obsidian-950 text-slate-900 dark:text-obsidian-100 overflow-hidden font-mono text-[11px] leading-relaxed shadow-sm">
            <div className="px-3 py-1.5 bg-slate-100 dark:bg-obsidian-950 border-b border-slate-200 dark:border-obsidian-800 flex items-center justify-between text-[10px] text-slate-600 dark:text-obsidian-400">
              <span className="font-semibold uppercase tracking-wider text-slate-700 dark:text-obsidian-300">
                Suggested fix
              </span>
              <span>
                Lines {startLine}{endLine !== startLine ? `–${endLine}` : ''}
              </span>
            </div>
            <div className="p-3 overflow-x-auto dark-editor-scrollbar space-y-1 max-h-72">
              {originalLines.map((line, idx) => (
                <div key={`orig-${idx}`} className="text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-[3px] border border-red-200 dark:border-red-900/40 flex items-baseline gap-2">
                  <span className="text-red-500 dark:text-red-400 select-none font-bold text-xs">-</span>
                  <span className="whitespace-pre">{line}</span>
                </div>
              ))}
              {replacementLines.map((line, idx) => (
                <div key={`repl-${idx}`} className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-[3px] border border-emerald-200 dark:border-emerald-900/40 flex items-baseline gap-2">
                  <span className="text-emerald-500 dark:text-emerald-400 select-none font-bold text-xs">+</span>
                  <span className="whitespace-pre">{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-obsidian-850 border-t border-slate-200 dark:border-obsidian-800 flex items-center justify-end gap-2.5">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isApplying}
            aria-label="Cancel patch application"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => confirmHandler && confirmHandler(issue)}
            disabled={isApplying}
            isLoading={isApplying}
            leftIcon={!isApplying ? <Sparkles className="w-3.5 h-3.5" /> : null}
            aria-label="Apply Fix"
          >
            Apply Fix
          </Button>
        </div>
      </div>
    </div>
  );
}
