import React, { useState } from 'react';
import {
  Copy,
  Check,
  Sparkles,
  Info,
  ShieldCheck,
  ArrowRight,
  Code2,
  Layers,
  Wand2,
} from 'lucide-react';
import { SeverityBadge } from './SeverityBadge.jsx';
import { Button } from './ui/Button.jsx';
import { EagleEmblem } from './CodeEagleLogo.jsx';
import { sendReviewChatApi } from '../services/reviewApi.js';
import { MessageSquare, Send } from 'lucide-react';

function getArchitecturePattern(issue) {
  const rule = issue?.rule || '';

  if (rule === 'COMP-HIGH') {
    return {
      title: 'Modular Function Decomposition & Guard Clauses',
      summary: 'High cyclomatic complexity indicates excessive branch paths (if/else, loops, switch cases, logical operators). Flatten decision branches using early returns (guard clauses) and extract sub-routines into single-responsibility helpers.',
      snippet: `// Recommended Solution: Guard Clauses & Sub-routine Extraction
function processOrder(order) {
  // 1. Guard clauses eliminate nested branch conditions early
  if (!order || !order.items?.length) return { status: 'invalid' };
  if (!validatePayment(order)) return { status: 'payment_failed' };

  // 2. Delegate execution branches to dedicated helpers
  const discounts = calculateDiscounts(order);
  const total = computeTotal(order.items, discounts);

  return { status: 'confirmed', total };
}`,
      steps: [
        'Identify all conditional decision points (if/else, switch cases, ternary operators).',
        'Extract independent validation checks into top-level guard clauses.',
        'Decompose multi-step sequential blocks into focused helper functions.',
        'Write isolated unit tests for each extracted helper to ensure 100% path coverage.',
      ],
    };
  }

  if (rule === 'COMP-NESTING' || rule === 'QUAL-NESTING') {
    return {
      title: 'Guard Clause / Early Return Pattern',
      summary: 'Flatten nested conditional blocks by checking guard conditions early and returning immediately, eliminating pyramid-of-doom indentation.',
      snippet: `// Recommended Solution: Early Return Guard Clauses
function processPayload(payload) {
  if (!payload || !payload.id) return null;
  if (!payload.isActive) return null;
  
  // Core business logic executed at top-level indentation
  return executeAction(payload);
}`,
      steps: [
        'Invert condition checks at the top of the function.',
        'Return early on error, null, or invalid state.',
        'Keep the happy path at the outermost indentation level.',
      ],
    };
  }

  if (rule === 'QUAL-LENGTH') {
    return {
      title: 'Modular Function Decomposition',
      summary: 'Decompose monolithic function into single-responsibility helpers (Setup, Execution, Assertions) to maintain function length under 30 lines.',
      snippet: `// Recommended Solution: Modular Step Decomposition
async function testUploadWorkflow() {
  // 1. Setup session & browser context
  const session = await initTestSession();

  // 2. Execute document upload flow
  const uploadResult = await executeDocumentUpload(session, {
    file: 'document.pdf'
  });

  // 3. Verify upload assertions
  await verifyUploadSuccess(uploadResult);
}`,
      steps: [
        'Extract environment initialization into a dedicated setup helper.',
        'Encapsulate upload actions into a focused execution function.',
        'Move assertions into an assertion helper to keep orchestrator under 25 lines.',
      ],
    };
  }

  if (rule === 'QUAL-EMPTY-CATCH') {
    return {
      title: 'Diagnostic Logging & Fallback Handling',
      summary: 'Log the caught error or provide an intentional fallback to prevent silent failures in production.',
      snippet: `// Recommended Solution: Diagnostic Logging
try {
  await performCriticalTask();
} catch (err) {
  console.error('Task execution failed:', err.message);
  throw err; // or return fallback: return { success: false, error: err.message };
}`,
      steps: [
        'Capture the error parameter in the catch clause.',
        'Log diagnostic metadata (message, stack, or context).',
        'Decide whether to re-throw or return an explicit fallback object.',
      ],
    };
  }

  if (rule === 'QUAL-VAR') {
    return {
      title: 'Block-Scoped Declarations (const / let)',
      summary: "Replace function-scoped 'var' with 'const' (by default) or 'let' (for reassignment) to prevent hoisting bugs and accidental re-declarations.",
      snippet: `// Before:
// var count = 0;
// var total = calculateTotal();

// Recommended Solution:
const total = calculateTotal();
let count = 0;`,
      steps: [
        "Replace 'var' with 'const' if the variable is never reassigned.",
        "Use 'let' if the variable requires reassignment in a loop or branch.",
        "Verify scope boundaries: 'let' and 'const' are strictly block-scoped.",
      ],
    };
  }

  if (rule === 'SEC-SECRET') {
    return {
      title: 'Environment Variable & Secrets Vault Extraction',
      summary: 'Never commit plaintext credentials, API keys, or tokens to source code. Load them from environment variables via process.env.',
      snippet: `// Before:
// const API_KEY = "AIzaSyD...";

// Recommended Solution:
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error('API_KEY environment variable is required');
}`,
      steps: [
        'Add the secret variable to your .env file or deployment secret store.',
        'Ensure .env is listed in .gitignore to prevent accidental commits.',
        'Reference the secret at runtime using process.env.<NAME>.',
      ],
    };
  }

  if (rule === 'SEC-SQLI') {
    return {
      title: 'Parameterized Queries with Bind Parameters',
      summary: 'Prevent SQL injection by substituting user inputs with parameter placeholders ($1, ?, :param) supplied by the database driver.',
      snippet: `// Before (Vulnerable to SQL Injection):
// const query = \`SELECT * FROM users WHERE email = '\${email}'\`;

// Recommended Solution: Parameterized Query
const query = 'SELECT * FROM users WHERE email = $1';
const result = await db.query(query, [email]);`,
      steps: [
        'Replace string concatenation / template literals with parameter placeholders.',
        'Pass user input values in the driver-supported parameters array.',
        'Ensure input validation and type checking are performed before querying.',
      ],
    };
  }

  if (rule === 'REACT-INDEX-KEY') {
    return {
      title: 'Stable Item Identifier as React Key',
      summary: 'Use unique, deterministic identifiers (e.g. item.id) instead of array index to prevent list reconciliation glitches and stale state.',
      snippet: `// Before:
// items.map((item, index) => <ItemCard key={index} data={item} />)

// Recommended Solution:
items.map((item) => <ItemCard key={item.id} data={item} />)`,
      steps: [
        'Find a unique, persistent identifier on the data object (e.g., id, uuid, slug).',
        'Avoid using Math.random() or timestamps generated during render.',
        'Pass the stable identifier to the key prop on the outermost JSX element.',
      ],
    };
  }

  if (rule === 'REACT-HOOK-DEPS') {
    return {
      title: 'Exhaustive Dependencies or Ref Stashing',
      summary: 'Include all referenced outer variables in the dependency array to ensure the effect closure stays synchronized with latest state.',
      snippet: `// Recommended Solution:
useEffect(() => {
  fetchData(userId, filterType);
}, [userId, filterType]); // Include all reactive values used inside`,
      steps: [
        'Identify all outer props, state, and functions referenced inside useEffect.',
        'Add them to the dependency array.',
        'Wrap functions created inside the component with useCallback if needed.',
      ],
    };
  }

  if (rule === 'PERF-EFFECT-CLEANUP') {
    return {
      title: 'Event Listener / Subscription Teardown',
      summary: 'Return a cleanup function from useEffect to unregister event listeners and prevent memory leaks.',
      snippet: `useEffect(() => {
  const handleResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);

  // Teardown: Remove listener on unmount / re-render
  return () => window.removeEventListener('resize', handleResize);
}, []);`,
      steps: [
        'Define the handler with a named reference so it can be referenced in cleanup.',
        'Return a cleanup function from useEffect that unregisters the listener.',
        'Ensure the handler reference passed to removeEventListener is identical to addEventListener.',
      ],
    };
  }

  return {
    title: 'Architectural Remediation',
    summary: issue?.recommendation || 'Refactor target code according to architectural best practices.',
    snippet: null,
    steps: [
      'Isolate the flagged logic into a dedicated utility function.',
      'Ensure test coverage covers both standard and edge cases.',
    ],
  };
}

export function IssueDetails({
  issue,
  onApplyPatch,
  onApplyFix,
  onPreviewAiPatch,
  onPreviewPatch,
  onGenerateRefactor,
  isGeneratingRefactor = false,
  reviewStatus = 'IDLE',
  isStale = false,
  isApplyingPatch = false,
  isApplying = false,
  isVerifyingAiPatch = false,
  filename = '',
  className = '',
}) {
  const [copyStatus, setCopyStatus] = useState(null);
  const [patternCopyStatus, setPatternCopyStatus] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatAnswer, setChatAnswer] = useState(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatCopied, setChatCopied] = useState(false);

  const handleAskInline = async (customPrompt = null) => {
    const q = (customPrompt || chatQuery).trim();
    if (!q || isChatLoading) return;

    setIsChatLoading(true);
    try {
      const res = await sendReviewChatApi({
        filename: filename || issue?.path || 'source.js',
        issue,
        question: q,
      });
      setChatAnswer({
        question: q,
        reply: res.reply || 'No response generated.',
      });
      setChatQuery('');
    } catch (err) {
      setChatAnswer({
        question: q,
        reply: `Error: ${err.message}`,
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  const applyHandler = onApplyPatch || onApplyFix;
  const previewHandler = onPreviewAiPatch || onPreviewPatch;
  const isBusy = isApplyingPatch || isApplying || isVerifyingAiPatch || isGeneratingRefactor;

  if (!issue) {
    return (
      <section
        aria-label="Finding remediation"
        className={`bg-obsidian-900 flex flex-col items-center justify-center p-8 text-center text-obsidian-400 h-full select-none ${className}`}
      >
        <div className="w-10 h-10 rounded-[6px] bg-obsidian-850 border border-obsidian-750 flex items-center justify-center mb-3 text-obsidian-400 shadow-sm">
          <Info className="w-5 h-5 text-brand-500" />
        </div>
        <h3 className="text-sm font-bold text-obsidian-100 font-sans mb-1">
          {reviewStatus === 'IDLE' ? 'Ready for review' : 'No finding selected'}
        </h3>
        <p className="text-xs text-obsidian-400 max-w-xs leading-relaxed font-sans">
          {reviewStatus === 'IDLE'
            ? 'Run code review to inspect findings, view actionable security rationale, and apply verified code fixes.'
            : 'Select an issue from the findings list to inspect its rationale, security impact, and verified fix.'}
        </p>
      </section>
    );
  }

  const handleCopy = async () => {
    if (!issue.fix?.replacement) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(issue.fix.replacement);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = issue.fix.replacement;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      setCopyStatus('failed');
      setTimeout(() => setCopyStatus(null), 2500);
    }
  };

  const hasFix = Boolean(issue.fix);
  const isStatic = issue.source === 'STATIC';
  const isAi = issue.source === 'AI';
  const originalLines = issue.fix?.original ? issue.fix.original.split('\n') : [];
  const replacementLines = issue.fix?.replacement ? issue.fix.replacement.split('\n') : [];

  return (
    <section
      aria-label={`Finding details for ${issue.title}`}
      className={`bg-white dark:bg-obsidian-900 flex flex-col h-full min-h-0 overflow-hidden select-none font-sans ${className}`}
    >
      {/* 1. Header: Senior PR Review Comment Meta */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-obsidian-800 shrink-0 bg-slate-50 dark:bg-obsidian-850">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <SeverityBadge severity={issue.severity} />
            <span className="text-[11px] font-mono font-semibold text-slate-700 dark:text-obsidian-300">
              {issue.category}
            </span>
          </div>

          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-[4px] font-bold border ${
              isAi
                ? 'text-blue-700 dark:text-brand-400 bg-blue-50 dark:bg-brand-500/10 border-blue-200 dark:border-brand-500/30'
                : 'text-slate-700 dark:text-obsidian-300 bg-slate-100 dark:bg-obsidian-800 border border-slate-200 dark:border-obsidian-700'
            }`}
          >
            {isAi ? 'AI' : 'Static'}
          </span>
        </div>

        <h2 className="text-sm font-bold text-slate-900 dark:text-obsidian-50 leading-snug">
          {issue.title}
        </h2>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-obsidian-400 mt-1.5 flex-wrap">
          <span className="text-slate-800 dark:text-obsidian-200 font-semibold">
            {filename || issue.path || 'source.js'}:{issue.line}
            {issue.endLine && issue.endLine !== issue.line ? `-${issue.endLine}` : ''}
          </span>
          {issue.rule && (
            <>
              <span className="text-slate-300 dark:text-obsidian-600">•</span>
              <span className="text-blue-600 dark:text-brand-400 font-mono text-[11px] font-semibold">{issue.rule}</span>
            </>
          )}
          {typeof issue.confidence === 'number' && (
            <>
              <span className="text-slate-300 dark:text-obsidian-600">•</span>
              <span className="text-slate-500 dark:text-obsidian-400">{Math.round(issue.confidence * 100)}% confidence</span>
            </>
          )}
        </div>
      </div>

      {/* 2. Scrollable Body: Pure Whitespace & Clean Typography */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5 text-xs">
        {/* Defect Analysis & Root Cause */}
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-obsidian-400 font-semibold mb-1.5">
            Defect Analysis & Root Cause
          </div>
          <p className="text-sm text-slate-700 dark:text-obsidian-200 leading-relaxed font-normal">
            {issue.description}
          </p>
        </div>

        {/* Actionable Remediation */}
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-obsidian-400 font-semibold mb-1.5">
            Actionable Remediation
          </div>
          <p className="text-sm text-slate-700 dark:text-obsidian-200 leading-relaxed font-normal">
            {issue.recommendation}
          </p>
        </div>

        {/* Suggested change (when auto-fix is available) */}
        {hasFix && issue.fix?.replacement ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-700 dark:text-obsidian-300 font-semibold">
                Suggested fix
              </span>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-obsidian-400 hover:text-slate-900 dark:hover:text-obsidian-100 cursor-pointer transition-colors"
                title="Copy suggested fix"
              >
                {copyStatus === 'copied' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="rounded-[6px] overflow-hidden border border-slate-200 dark:border-obsidian-750 bg-slate-50 dark:bg-obsidian-950 font-mono text-xs shadow-inner">
              <div className="p-3 space-y-1">
                {issue.fix.original && (
                  <div className="flex items-start gap-2 text-red-700 dark:text-red-400 bg-red-100/80 dark:bg-red-950/20 px-2.5 py-1 rounded-[3px] border border-red-200 dark:border-red-500/20">
                    <span className="select-none font-bold text-red-600 dark:text-red-500">-</span>
                    <span className="whitespace-pre-wrap break-all">{issue.fix.original}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/20 px-2.5 py-1 rounded-[3px] border border-emerald-200 dark:border-emerald-500/20">
                  <span className="select-none font-bold text-emerald-600 dark:text-emerald-400">+</span>
                  <span className="whitespace-pre-wrap break-all">{issue.fix.replacement}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Architectural Remediation & Solution Guidance */
          <div className="p-4 rounded-lg border border-slate-300 dark:border-[#2A2A2A] bg-slate-100/90 dark:bg-[#151515] text-slate-800 dark:text-obsidian-200 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 dark:text-obsidian-100 uppercase tracking-wider">
                <Code2 className="w-4 h-4 text-blue-600 dark:text-brand-400" />
                <span>{getArchitecturePattern(issue).title}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-brand-500/10 text-blue-700 dark:text-brand-400 border border-blue-200 dark:border-brand-500/20 font-semibold">
                Architecture Solution
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-obsidian-300 leading-relaxed font-sans">
              {getArchitecturePattern(issue).summary}
            </p>

            {getArchitecturePattern(issue).snippet && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-obsidian-400">
                  <span className="font-semibold">Recommended Pattern</span>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        if (navigator.clipboard?.writeText) {
                          await navigator.clipboard.writeText(getArchitecturePattern(issue).snippet);
                          setPatternCopyStatus(true);
                          setTimeout(() => setPatternCopyStatus(false), 2000);
                        }
                      } catch (e) {}
                    }}
                    className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-obsidian-100 cursor-pointer transition-colors"
                  >
                    {patternCopyStatus ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Pattern</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 rounded-[6px] border border-slate-300 dark:border-[#262626] bg-slate-50 dark:bg-[#0E0E0E] font-mono text-xs overflow-x-auto text-slate-800 dark:text-obsidian-200">
                  <pre className="leading-relaxed whitespace-pre font-mono">{getArchitecturePattern(issue).snippet}</pre>
                </div>
              </div>
            )}

            <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-[#222222]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-obsidian-400 font-bold">
                Action Steps
              </div>
              <ul className="space-y-1 text-xs text-slate-600 dark:text-obsidian-300 list-disc list-inside">
                {getArchitecturePattern(issue).steps.map((st, i) => (
                  <li key={i} className="leading-snug">{st}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 4. CodeRabbit-Style Inline "Ask CodeEagle" Section */}
        <div className="p-3.5 rounded-[8px] bg-slate-100/90 dark:bg-obsidian-900 border border-slate-300 dark:border-obsidian-750 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 dark:text-obsidian-100 uppercase tracking-wider">
              <EagleEmblem size={18} />
              <span>Ask CodeEagle</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-brand-500/10 text-brand-400 border border-brand-500/30 font-semibold">
              Finding Assistant
            </span>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => handleAskInline('Why is this a security hazard?')}
              className="px-2 py-0.5 rounded bg-white dark:bg-obsidian-850 hover:bg-slate-200 dark:hover:bg-obsidian-800 border border-slate-200 dark:border-obsidian-700 text-slate-700 dark:text-obsidian-300 transition-colors cursor-pointer"
            >
              Why hazardous?
            </button>
            <button
              type="button"
              onClick={() => handleAskInline('Show me a unit test for this edge case')}
              className="px-2 py-0.5 rounded bg-white dark:bg-obsidian-850 hover:bg-slate-200 dark:hover:bg-obsidian-800 border border-slate-200 dark:border-obsidian-700 text-slate-700 dark:text-obsidian-300 transition-colors cursor-pointer"
            >
              Unit test snippet
            </button>
            <button
              type="button"
              onClick={() => handleAskInline('How can I rewrite this using idiomatic modern patterns?')}
              className="px-2 py-0.5 rounded bg-white dark:bg-obsidian-850 hover:bg-slate-200 dark:hover:bg-obsidian-800 border border-slate-200 dark:border-obsidian-700 text-slate-700 dark:text-obsidian-300 transition-colors cursor-pointer"
            >
              Modern pattern rewrite
            </button>
          </div>

          {/* Chat Answer Box */}
          {chatAnswer && (
            <div className="p-3 rounded-[6px] bg-white dark:bg-obsidian-950 border border-slate-200 dark:border-obsidian-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-obsidian-400 border-b border-black/5 dark:border-white/5 pb-1">
                <span className="font-semibold text-slate-800 dark:text-obsidian-200">Q: {chatAnswer.question}</span>
                <button
                  type="button"
                  onClick={async () => {
                    if (navigator.clipboard?.writeText) {
                      await navigator.clipboard.writeText(chatAnswer.reply);
                      setChatCopied(true);
                      setTimeout(() => setChatCopied(false), 2000);
                    }
                  }}
                  className="hover:text-slate-800 dark:hover:text-obsidian-200 cursor-pointer flex items-center gap-1"
                >
                  {chatCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="text-xs text-slate-700 dark:text-obsidian-200 leading-relaxed font-sans whitespace-pre-wrap">
                {chatAnswer.reply}
              </div>
            </div>
          )}

          {/* Quick Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskInline();
            }}
            className="flex items-center gap-1.5"
          >
            <input
              type="text"
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              placeholder="Ask anything about this finding..."
              disabled={isChatLoading}
              className="flex-1 px-2.5 py-1.5 text-xs rounded-[5px] bg-white dark:bg-obsidian-950 border border-slate-300 dark:border-obsidian-750 text-slate-900 dark:text-obsidian-100 outline-none focus:border-brand-500 font-sans"
            />
            <Button
              type="submit"
              variant="primary"
              size="xs"
              disabled={!chatQuery.trim() || isChatLoading}
              isLoading={isChatLoading}
              rightIcon={<Send className="w-3 h-3" />}
            >
              Ask
            </Button>
          </form>
        </div>
      </div>

      {/* 3. Sticky Action Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-obsidian-800 bg-white/95 dark:bg-obsidian-900/90 backdrop-blur-xs space-y-2 shrink-0">
        {/* Integrity Note */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-obsidian-400">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-brand-500 shrink-0" />
          <span>
            {hasFix
              ? 'Source verified · Fix verified against current code'
              : 'Architectural refactor engine · Verifies diff before applying'}
          </span>
        </div>

        {hasFix && isStatic && applyHandler && (
          <Button
            variant="primary"
            size="lg"
            onClick={() => applyHandler(issue)}
            disabled={isStale || isBusy}
            isLoading={isBusy}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full"
          >
            Apply Fix & Re-Analyze
          </Button>
        )}

        {hasFix && previewHandler && (
          <Button
            variant={isStatic ? "secondary" : "primary"}
            size="lg"
            onClick={() => previewHandler(issue)}
            disabled={isStale || isBusy}
            isLoading={isBusy}
            leftIcon={<Sparkles className="w-4 h-4" />}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full"
          >
            Preview & Apply Fix
          </Button>
        )}

        {!hasFix && (
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              if (onGenerateRefactor) {
                onGenerateRefactor(issue);
              } else if (previewHandler) {
                previewHandler(issue);
              }
            }}
            disabled={isStale || isBusy}
            isLoading={isBusy}
            leftIcon={<Sparkles className="w-4 h-4" />}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full"
          >
            {isGeneratingRefactor ? 'Generating Refactor...' : 'Generate AI Refactor & Fix'}
          </Button>
        )}

        {isStale && (
          <p className="text-[11px] text-amber-700 dark:text-amber-300 text-center font-mono font-medium">
            Code has been edited. Run review again to verify.
          </p>
        )}
      </div>
    </section>
  );
}
