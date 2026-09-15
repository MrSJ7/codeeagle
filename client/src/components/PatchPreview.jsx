import React, { useEffect } from 'react';
import { X, Sparkles, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from './ui/Button.jsx';
import { Badge } from './ui/Badge.jsx';

export function PatchPreview({
  isOpen,
  onClose,
  issue,
  previewData,
  onConfirmApply,
  isApplying = false,
}) {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-950/80 backdrop-blur-xs"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="patch-preview-title"
    >
      <div
        className="w-full max-w-xl bg-graphite-900 border border-graphite-700 rounded-xl shadow-dev-lg overflow-hidden flex flex-col max-h-[85vh] select-none font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-graphite-950 border-b border-graphite-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-brand-950/80 border border-brand-800/60 flex items-center justify-center text-brand-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 id="patch-preview-title" className="text-xs font-semibold text-graphite-100 flex items-center gap-2">
                <span>Preview AI Patch</span>
                {issue.rule && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-graphite-800 text-cyan-300 border border-graphite-700">
                    {issue.rule}
                  </span>
                )}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded flex items-center justify-center text-graphite-400 hover:text-graphite-100 hover:bg-graphite-800 transition-colors cursor-pointer"
            title="Close Preview"
            aria-label="Close Preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3.5 text-xs">
          {/* Issue title */}
          <div className="text-xs font-medium text-graphite-200">
            {issue.title}
          </div>

          {/* Verification notice */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-950/50 border border-brand-800/50 text-brand-300 text-[11px] font-mono">
            <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
            <span>
              Lines {startLine}{endLine !== startLine ? `–${endLine}` : ''} · AI patch verified against current source.
            </span>
          </div>

          {/* PR Unified Diff Box */}
          <div className="rounded-lg border border-graphite-800 bg-code overflow-hidden font-mono text-[11px] leading-relaxed shadow-dev-sm">
            <div className="px-3 py-1.5 bg-graphite-950 border-b border-graphite-800 flex items-center justify-between text-[10px] text-graphite-400">
              <span className="font-semibold uppercase tracking-wider text-graphite-300">
                Proposed Diff
              </span>
              <span>
                Lines {startLine}{endLine !== startLine ? `–${endLine}` : ''}
              </span>
            </div>
            <div className="p-3 overflow-x-auto dark-editor-scrollbar space-y-1 max-h-72">
              {originalLines.map((line, idx) => (
                <div key={`orig-${idx}`} className="text-red-300 bg-red-950/40 px-2 py-0.5 rounded border border-red-900/30 flex items-baseline gap-2">
                  <span className="text-red-500 select-none font-bold text-xs">-</span>
                  <span className="whitespace-pre">{line}</span>
                </div>
              ))}
              {replacementLines.map((line, idx) => (
                <div key={`repl-${idx}`} className="text-brand-300 bg-brand-950/40 px-2 py-0.5 rounded border border-brand-900/30 flex items-baseline gap-2">
                  <span className="text-brand-500 select-none font-bold text-xs">+</span>
                  <span className="whitespace-pre">{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3 bg-graphite-950 border-t border-graphite-800 flex items-center justify-end gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isApplying}
            aria-label="Cancel patch application"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onConfirmApply(issue)}
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
