import React, { useEffect } from 'react';
import { X, ShieldCheck, Cpu, GitCommit, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button.jsx';

export function HowItWorksModal({ isOpen, onClose, onStartReview }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="how-it-works-title"
    >
      <div
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-dev-xl overflow-hidden flex flex-col max-h-[90vh] select-none font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-brand-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 id="how-it-works-title" className="text-sm font-bold text-slate-900">
                How CodeEagle Reviews Your Code
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Deterministic compiler checks + contextual AI reasoning
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-600 leading-relaxed">
          {/* Step 1: AST */}
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-slate-700 text-xs shrink-0 mt-0.5">
              01
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-900">
                Deterministic AST Static Analysis
              </h3>
              <p>
                CodeEagle parses JavaScript/JSX into an Abstract Syntax Tree (AST) using Babel. 13 deterministic security and quality rules run in milliseconds to catch SQL injection, hardcoded credentials, eval usage, prototype pollution, and dangerous DOM mutations with zero hallucinations.
              </p>
            </div>
          </div>

          {/* Step 2: Gemini */}
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center font-mono font-bold text-emerald-800 text-xs shrink-0 mt-0.5">
              02
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-900">
                Contextual AI Reasoning (Google Gemini)
              </h3>
              <p>
                When configured, Google Gemini inspects cross-function state, error handling completeness, logic bugs, and algorithmic bottlenecks that static linters cannot infer. Findings are ranked by severity and confidence.
              </p>
            </div>
          </div>

          {/* Step 3: Patch Verification */}
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center font-mono font-bold text-teal-800 text-xs shrink-0 mt-0.5">
              03
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-900">
                SHA-256 Verified Safe Patches
              </h3>
              <p>
                Every proposed fix is bounded to single-occurrence snippet replacement and cryptographically verified against source hashes before mutating code. Applying a fix automatically triggers instant re-analysis to confirm resolution.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            Esc to dismiss
          </span>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
            {onStartReview && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onStartReview();
                }}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Start Reviewing
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
