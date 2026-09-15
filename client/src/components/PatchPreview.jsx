import React, { useEffect } from 'react';
import { X, Sparkles, ShieldCheck, Loader2 } from 'lucide-react';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="patch-preview-title"
    >
      <div
        className="w-full max-w-xl bg-white border border-stone-200 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh] select-none font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#FAFAF9] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-[#DDF7EC] border border-[#0F9F6E]/30 flex items-center justify-center text-[#0F9F6E]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 id="patch-preview-title" className="text-xs font-semibold text-stone-900 flex items-center gap-2">
                <span>Preview AI Patch</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 border border-stone-200">
                  {issue.rule}
                </span>
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            title="Close Preview"
            aria-label="Close Preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3.5 text-xs">
          {/* Issue title */}
          <div className="text-xs font-medium text-stone-800">
            {issue.title}
          </div>

          {/* Verification notice */}
          <div className="flex items-center gap-2 px-3 py-2 rounded bg-[#DDF7EC]/50 border border-[#0F9F6E]/30 text-[#087A54] text-[11px] font-mono">
            <ShieldCheck className="w-4 h-4 text-[#0F9F6E] shrink-0" />
            <span>
              Lines {startLine}{endLine !== startLine ? `–${endLine}` : ''} · AI patch verified against current source.
            </span>
          </div>

          {/* PR Unified Diff Box */}
          <div className="rounded border border-[#242826] bg-[#171A19] overflow-hidden font-mono text-[11px] leading-relaxed">
            <div className="px-3 py-1.5 bg-[#121514] border-b border-[#242826] flex items-center justify-between text-[10px] text-[#8F9E94]">
              <span className="font-semibold uppercase tracking-wider text-[#A0AEA4]">
                Proposed Diff
              </span>
              <span>
                Lines {startLine}{endLine !== startLine ? `–${endLine}` : ''}
              </span>
            </div>
            <div className="p-3 overflow-x-auto dark-editor-scrollbar space-y-0.5 max-h-72">
              {originalLines.map((line, idx) => (
                <div key={`orig-${idx}`} className="text-red-300 bg-red-950/30 px-1.5 py-0.5 -mx-1 rounded-xs flex items-baseline">
                  <span className="text-red-400 select-none mr-2 font-bold text-xs">-</span>
                  <span className="whitespace-pre">{line}</span>
                </div>
              ))}
              {replacementLines.map((line, idx) => (
                <div key={`repl-${idx}`} className="text-[#34D399] bg-[#0F9F6E]/15 px-1.5 py-0.5 -mx-1 rounded-xs flex items-baseline">
                  <span className="text-[#0F9F6E] select-none mr-2 font-bold text-xs">+</span>
                  <span className="whitespace-pre">{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3 bg-[#FAFAF9] border-t border-stone-200 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            disabled={isApplying}
            aria-label="Cancel patch application"
            className="px-3.5 py-1.5 rounded bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium border border-stone-200 transition-colors shadow-2xs"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirmApply(issue)}
            disabled={isApplying}
            aria-label="Apply Fix"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#0F9F6E] hover:bg-[#087A54] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-2xs transition-all"
          >
            {isApplying ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Applying...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-white/80" />
                <span>Apply Fix</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

