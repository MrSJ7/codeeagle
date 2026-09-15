import React, { useState } from 'react';
import { CodeEagleLogo } from './CodeEagleLogo.jsx';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  History,
  FileCode,
  Terminal,
  Cpu,
  Layers,
  Wrench,
  Check,
  Zap,
  Play,
  ArrowUpRight,
  ChevronRight,
  AlertTriangle,
  Lock,
  GitBranch,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { Button } from './ui/Button.jsx';
import { Badge } from './ui/Badge.jsx';
import { Navbar } from './Navbar.jsx';

export function LandingPage({
  onStartReviewing,
  onSelectScenarioAndStart,
  onOpenHistory,
  historyCount = 0,
}) {
  // Interactive Demo State
  const [demoFixed, setDemoFixed] = useState(false);

  return (
    <div className="min-h-screen bg-graphite-950 text-graphite-100 font-sans selection:bg-brand-500/20 selection:text-brand-300 flex flex-col">
      {/* 1. Landing Navbar */}
      <Navbar
        mode="landing"
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigateReview={() => onStartReviewing()}
        onToggleHistory={onOpenHistory}
        historyCount={historyCount}
      />

      {/* SECTION 1: Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-8 border-b border-graphite-800/80 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-graphite-900/60 via-graphite-950 to-graphite-950">
        <div className="max-w-4xl mx-auto text-center">
          {/* Top Brand Proposition */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-graphite-900 border border-graphite-750 text-brand-400 text-xs font-mono font-medium mb-6 shadow-dev-sm">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <span>STATIC PRECISION · AI REASONING · VERIFIED FIXES</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-graphite-100 tracking-tight leading-[1.08] mb-6">
            Review your code.
            <br />
            <span className="text-graphite-400">Catch problems before they ship.</span>
          </h1>

          <p className="text-base sm:text-lg text-graphite-300 leading-relaxed font-normal mb-8 max-w-2xl mx-auto">
            Static linters miss contextual logic bugs. Pure LLMs hallucinate invalid line numbers and break working code. CodeEagle pairs deterministic AST safety with contextual semantic reasoning for verified, regression-free code patches.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap mb-10">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onStartReviewing()}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start Reviewing
            </Button>

            <a
              href="#interactive-demo"
              className="px-4 py-2 text-sm font-medium text-graphite-300 hover:text-graphite-100 hover:bg-graphite-900 rounded-[8px] border border-graphite-800 hover:border-graphite-700 transition-all shadow-dev-sm flex items-center gap-1.5"
            >
              <span>See how it works</span>
              <ChevronRight className="w-3.5 h-3.5 text-graphite-400" />
            </a>
          </div>

          {/* Quick Scenario Jumps */}
          <div className="flex items-center justify-center gap-2 text-xs text-graphite-400 font-mono flex-wrap">
            <span className="text-graphite-500">or inspect scenario:</span>
            <button
              type="button"
              onClick={() => onSelectScenarioAndStart('insecure-login')}
              className="px-2.5 py-1 rounded-[6px] bg-graphite-900 hover:bg-graphite-850 text-graphite-200 border border-graphite-750 font-medium hover:border-brand-500/40 transition-colors cursor-pointer"
            >
              auth.js
            </button>
            <button
              type="button"
              onClick={() => onSelectScenarioAndStart('buggy-react')}
              className="px-2.5 py-1 rounded-[6px] bg-graphite-900 hover:bg-graphite-850 text-graphite-200 border border-graphite-750 font-medium hover:border-brand-500/40 transition-colors cursor-pointer"
            >
              ActivityFeed.jsx
            </button>
            <button
              type="button"
              onClick={() => onSelectScenarioAndStart('complex-function')}
              className="px-2.5 py-1 rounded-[6px] bg-graphite-900 hover:bg-graphite-850 text-graphite-200 border border-graphite-750 font-medium hover:border-brand-500/40 transition-colors cursor-pointer"
            >
              shippingFee.js
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: Full-Width Interactive Product Demo */}
      <section id="interactive-demo" className="py-16 sm:py-24 px-4 sm:px-8 border-b border-graphite-800/80 bg-graphite-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider mb-2">
              Interactive Workspace Preview
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-graphite-100 tracking-tight mb-3">
              See CodeEagle in action.
            </h2>
            <p className="text-sm sm:text-base text-graphite-400 leading-relaxed">
              Line-anchored security findings, contextual rationale, and verified one-click fixes. Click below to simulate applying a patch.
            </p>
          </div>

          {/* Realistic CodeEagle Workspace Cockpit */}
          <div className="rounded-xl border border-graphite-700/90 shadow-dev-lg bg-graphite-900 overflow-hidden">
            {/* Window Header Chrome */}
            <div className="h-10 bg-graphite-950 border-b border-graphite-800 px-4 flex items-center justify-between text-xs font-mono text-graphite-400 select-none">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="h-3.5 w-px bg-graphite-800" />
                <div className="flex items-center gap-2 text-graphite-200 font-medium">
                  <FileCode className="w-3.5 h-3.5 text-brand-400" />
                  <span>auth.js</span>
                  <span className="text-xs text-graphite-500 font-normal">JavaScript · 27 lines</span>
                </div>
              </div>

              {/* Status & Dynamic Score */}
              <div className="flex items-center gap-2.5">
                {demoFixed ? (
                  <span className="text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded font-mono font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Score: 66 / 100 (+16)</span>
                  </span>
                ) : (
                  <span className="text-xs text-orange-300 bg-orange-950/60 border border-orange-800/60 px-2 py-0.5 rounded font-mono font-semibold">
                    2 findings · 50 / 100
                  </span>
                )}
                <span className="text-[11px] text-brand-300 bg-brand-950/60 border border-brand-800/60 px-2 py-0.5 rounded font-mono font-semibold hidden sm:inline-block">
                  AST + AI
                </span>
              </div>
            </div>

            {/* Split Preview: Code Buffer (Left) + PR Review Comment & Diff (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
              {/* Left Code Buffer (7 cols) */}
              <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-graphite-800 p-4 font-mono text-xs leading-relaxed text-code-text overflow-x-auto bg-code">
                <div className="space-y-1">
                  <div className="text-graphite-500">// Express authentication handler</div>
                  <div><span className="text-graphite-600 select-none inline-block w-6 text-right mr-3">1</span><span className="text-purple-400">const</span> express = require(<span className="text-brand-300">'express'</span>);</div>
                  <div><span className="text-graphite-600 select-none inline-block w-6 text-right mr-3">2</span><span className="text-purple-400">const</span> jwt = require(<span className="text-brand-300">'jsonwebtoken'</span>);</div>
                  <div><span className="text-graphite-600 select-none inline-block w-6 text-right mr-3">3</span><span className="text-purple-400">const</span> db = require(<span className="text-brand-300">'./database'</span>);</div>
                  <div><span className="text-graphite-600 select-none inline-block w-6 text-right mr-3">4</span></div>
                  <div><span className="text-graphite-500 select-none inline-block w-6 text-right mr-3">5</span><span className="text-graphite-500">{demoFixed ? '// Verified fix applied' : '// Security risk: hardcoded fallback secret'}</span></div>
                  
                  {/* Dynamic Line 6 (Red when flawed, Emerald when fixed) */}
                  {demoFixed ? (
                    <div className="bg-emerald-950/40 text-emerald-200 -mx-4 px-4 py-0.5 border-l-2 border-emerald-500 flex items-baseline transition-colors">
                      <span className="text-emerald-400 select-none inline-block w-6 text-right mr-3 font-bold">6</span>
                      <span><span className="text-purple-400">const</span> JWT_SECRET = <span className="text-emerald-300 font-semibold">process.env.JWT_SECRET;</span></span>
                    </div>
                  ) : (
                    <div className="bg-red-950/40 text-red-200 -mx-4 px-4 py-0.5 border-l-2 border-red-500 flex items-baseline transition-colors">
                      <span className="text-red-400 select-none inline-block w-6 text-right mr-3 font-bold">6</span>
                      <span><span className="text-purple-400">const</span> JWT_SECRET = <span className="text-red-300 font-semibold">'super-secret-key-12345'</span>;</span>
                    </div>
                  )}

                  <div><span className="text-graphite-600 select-none inline-block w-6 text-right mr-3">7</span></div>
                  <div><span className="text-graphite-600 select-none inline-block w-6 text-right mr-3">8</span><span className="text-cyan-400">async</span> <span className="text-purple-400">function</span> <span className="text-amber-300">login</span>(req, res) &#123;</div>
                  <div><span className="text-graphite-600 select-none inline-block w-6 text-right mr-3">9</span>  <span className="text-purple-400">const</span> &#123; username, password &#125; = req.body;</div>
                  <div><span className="text-graphite-600 select-none inline-block w-6 text-right mr-3">10</span></div>
                  <div><span className="text-graphite-500 select-none inline-block w-6 text-right mr-3">11</span>  <span className="text-graphite-500">// Security risk: SQL string concatenation</span></div>
                  <div className="bg-red-950/40 text-red-200 -mx-4 px-4 py-0.5 border-l-2 border-red-500 flex items-baseline">
                    <span className="text-red-400 select-none inline-block w-6 text-right mr-3 font-bold">12</span>
                    <span>  <span className="text-purple-400">const</span> query = <span className="text-red-300 font-semibold">{"`SELECT * FROM users WHERE user = '${username}'`"}</span>;</span>
                  </div>
                  <div><span className="text-graphite-600 select-none inline-block w-6 text-right mr-3">13</span>  <span className="text-purple-400">const</span> user = <span className="text-cyan-400">await</span> db.query(query);</div>
                  <div><span className="text-graphite-600 select-none inline-block w-6 text-right mr-3">14</span>&#125;</div>
                </div>
              </div>

              {/* Right PR Review Comment & Diff (5 cols) */}
              <div className="lg:col-span-5 bg-graphite-900 p-5 flex flex-col justify-between font-sans">
                <div>
                  {/* PR Comment Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {demoFixed ? (
                        <Badge variant="success">RESOLVED</Badge>
                      ) : (
                        <Badge variant="critical">CRITICAL</Badge>
                      )}
                      <span className="text-xs font-mono font-medium text-graphite-400">
                        SECURITY
                      </span>
                    </div>
                    <Badge variant="ast">AST RULE</Badge>
                  </div>

                  <h3 className="text-sm font-bold text-graphite-100 mb-1">
                    {demoFixed ? 'Secret Secured via Environment Variable' : 'Hardcoded Secret Detected'}
                  </h3>
                  <div className="text-xs text-graphite-500 font-mono mb-3">
                    auth.js:6 · SEC-SECRET-5
                  </div>

                  <p className="text-xs text-graphite-300 leading-relaxed mb-4">
                    {demoFixed
                      ? 'The hardcoded credential has been replaced with an environment variable reference. Automated AST re-audit confirms vulnerability resolution.'
                      : 'Hardcoded cryptographic secrets in source code allow attackers to forge authentication tokens and bypass role-based access control.'}
                  </p>

                  {/* Suggested Diff Box */}
                  <div className="rounded-lg border border-graphite-800 bg-code font-mono text-[11px] p-3 mb-4 space-y-1 overflow-x-auto text-graphite-200">
                    <div className="text-graphite-500 text-[10px] uppercase tracking-wider mb-1 font-sans font-semibold">
                      {demoFixed ? 'Applied Verified Change' : 'Suggested Verified Change'}
                    </div>
                    <div className="text-red-300 bg-red-950/40 px-2 py-0.5 rounded border border-red-900/30">
                      - const JWT_SECRET = 'super-secret-key-12345';
                    </div>
                    <div className="text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30">
                      + const JWT_SECRET = process.env.JWT_SECRET;
                    </div>
                  </div>
                </div>

                {/* Remediation Action Callout */}
                <div className="pt-3 border-t border-graphite-800 flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-xs font-mono text-graphite-400">
                    {demoFixed ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        50 → 66 (+16 pts)
                      </span>
                    ) : (
                      <span>Expected: <strong className="text-brand-400 font-bold">50 → 66 (+16)</strong></span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {demoFixed ? (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setDemoFixed(false)}
                          leftIcon={<RotateCcw className="w-3 h-3" />}
                        >
                          Reset Demo
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onSelectScenarioAndStart('insecure-login')}
                          rightIcon={<ArrowRight className="w-3 h-3" />}
                        >
                          Open in Workspace
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setDemoFixed(true)}
                        leftIcon={<Wrench className="w-3 h-3" />}
                      >
                        Apply Suggested Fix
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Why CodeEagle Capability Rows */}
      <section id="why-codeeagle" className="py-16 sm:py-24 px-4 sm:px-8 border-b border-graphite-800/80 bg-graphite-950">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mb-14">
            <div className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider mb-2">
              Architecture & Trust
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-graphite-100 tracking-tight mb-3">
              Engineered for developer trust.
            </h2>
            <p className="text-sm sm:text-base text-graphite-400 leading-relaxed">
              We eliminated the failure modes of pure AI code reviewers by grounding semantic reasoning in deterministic compiler facts.
            </p>
          </div>

          <div className="divide-y divide-graphite-800">
            {/* Row 1: Deterministic Checks */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-4">
                <div className="w-9 h-9 rounded-lg bg-graphite-900 border border-graphite-800 flex items-center justify-center text-brand-400 mb-3 shadow-dev-sm">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="text-xs font-mono text-brand-400 font-bold mb-1">01</div>
                <h3 className="text-base font-bold text-graphite-100">
                  Deterministic AST Checks
                </h3>
                <span className="text-xs font-mono text-graphite-500 mt-0.5 block">
                  13 Built-in Babel Analyzers
                </span>
              </div>
              <div className="md:col-span-8 text-sm text-graphite-300 leading-relaxed space-y-2">
                <p>
                  Zero hallucinations. The AST engine inspects syntax trees directly to identify hardcoded credentials, unhandled promises, prototype pollution, memory leaks, missing React hook dependencies, and nested complexity.
                </p>
                <div className="flex items-center gap-2 font-mono text-xs text-graphite-400 pt-1 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-graphite-900 border border-graphite-800 text-graphite-300">Babel AST Parser</span>
                  <span className="px-2 py-0.5 rounded bg-graphite-900 border border-graphite-800 text-graphite-300">Cyclomatic Complexity</span>
                  <span className="px-2 py-0.5 rounded bg-graphite-900 border border-graphite-800 text-graphite-300">Zero Cloud Execution</span>
                </div>
              </div>
            </div>

            {/* Row 2: Contextual AI Reasoning */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-4">
                <div className="w-9 h-9 rounded-lg bg-graphite-900 border border-graphite-800 flex items-center justify-center text-amber-400 mb-3 shadow-dev-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs font-mono text-amber-400 font-bold mb-1">02</div>
                <h3 className="text-base font-bold text-graphite-100">
                  Contextual AI Reasoning
                </h3>
                <span className="text-xs font-mono text-graphite-500 mt-0.5 block">
                  Google Gemini 2.5 Flash
                </span>
              </div>
              <div className="md:col-span-8 text-sm text-graphite-300 leading-relaxed space-y-2">
                <p>
                  Deterministic linters cannot diagnose subtle logic flaws, state bugs, or contextual security hazards. Gemini reasoning models diagnose complex logic regressions, constrained strictly to exact line numbers and verifiable fix candidates.
                </p>
                <div className="flex items-center gap-2 font-mono text-xs text-graphite-400 pt-1 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-graphite-900 border border-graphite-800 text-graphite-300">Structured JSON Schemas</span>
                  <span className="px-2 py-0.5 rounded bg-graphite-900 border border-graphite-800 text-graphite-300">Physical Line Bounds</span>
                  <span className="px-2 py-0.5 rounded bg-graphite-900 border border-graphite-800 text-graphite-300">Deduplication Priority</span>
                </div>
              </div>
            </div>

            {/* Row 3: Cryptographic Verified Fixes */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-4">
                <div className="w-9 h-9 rounded-lg bg-graphite-900 border border-graphite-800 flex items-center justify-center text-brand-400 mb-3 shadow-dev-sm">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs font-mono text-brand-400 font-bold mb-1">03</div>
                <h3 className="text-base font-bold text-graphite-100">
                  Verified Safe Patches
                </h3>
                <span className="text-xs font-mono text-graphite-500 mt-0.5 block">
                  SHA-256 Stale Protection
                </span>
              </div>
              <div className="md:col-span-8 text-sm text-graphite-300 leading-relaxed space-y-2">
                <p>
                  No blind string replacements. Proposed patches require verbatim source match and cryptographic SHA-256 hash validation before application. Applying a fix immediately executes an automated server re-audit to verify resolution and ensure zero regressions.
                </p>
                <div className="flex items-center gap-2 font-mono text-xs text-graphite-400 pt-1 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-graphite-900 border border-graphite-800 text-graphite-300">Single Occurrence Rule</span>
                  <span className="px-2 py-0.5 rounded bg-graphite-900 border border-graphite-800 text-graphite-300">Automated Re-Analysis</span>
                  <span className="px-2 py-0.5 rounded bg-graphite-900 border border-graphite-800 text-graphite-300">Score Delta Tracking</span>
                </div>
              </div>
            </div>

            {/* Row 4: Auditable Review History */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-4">
                <div className="w-9 h-9 rounded-lg bg-graphite-900 border border-graphite-800 flex items-center justify-center text-cyan-400 mb-3 shadow-dev-sm">
                  <History className="w-4 h-4" />
                </div>
                <div className="text-xs font-mono text-cyan-400 font-bold mb-1">04</div>
                <h3 className="text-base font-bold text-graphite-100">
                  Auditable History Ledger
                </h3>
                <span className="text-xs font-mono text-graphite-500 mt-0.5 block">
                  MongoDB + In-Memory Fallback
                </span>
              </div>
              <div className="md:col-span-8 text-sm text-graphite-300 leading-relaxed space-y-2">
                <p>
                  Inspect previous audit iterations, compare before/after patch states, and restore historical snapshots with zero risk of overwriting unreviewed work. Operates seamlessly with MongoDB Atlas or in-memory persistence.
                </p>
                <div className="flex items-center gap-2 font-mono text-xs text-graphite-400 pt-1 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-graphite-900 border border-graphite-800 text-graphite-300">Immutable Snapshots</span>
                  <span className="px-2 py-0.5 rounded bg-graphite-900 border border-graphite-800 text-graphite-300">Score Progression</span>
                  <span className="px-2 py-0.5 rounded bg-graphite-900 border border-graphite-800 text-graphite-300">Zero Setup Fallback</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: How Review Works (5-Step Visual Flow) */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-8 border-b border-graphite-800/80 bg-graphite-900">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider mb-2">
              Step-by-step Workflow
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-graphite-100 tracking-tight mb-3">
              How review works.
            </h2>
            <p className="text-sm sm:text-base text-graphite-400 leading-relaxed">
              From pasting code to applying verified fixes in 5 discrete, reproducible steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {/* Step 1 */}
            <div className="p-4 rounded-lg bg-graphite-950 border border-graphite-800 flex flex-col justify-between shadow-dev-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-brand-400">01</span>
                  <span className="text-[10px] font-mono text-graphite-500">INPUT</span>
                </div>
                <h4 className="text-xs font-bold text-graphite-100 mb-1">Paste Code</h4>
                <p className="text-[11px] text-graphite-400 leading-relaxed mb-3">
                  Raw JS or JSX source code buffer.
                </p>
              </div>
              <div className="rounded bg-code border border-graphite-800 p-1.5 font-mono text-[10px] text-graphite-300 truncate">
                <code>auth.js (27 lines)</code>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-lg bg-graphite-950 border border-graphite-800 flex flex-col justify-between shadow-dev-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-brand-400">02</span>
                  <span className="text-[10px] font-mono text-brand-400">ANALYZE</span>
                </div>
                <h4 className="text-xs font-bold text-graphite-100 mb-1">Run Review</h4>
                <p className="text-[11px] text-graphite-400 leading-relaxed mb-3">
                  AST checks in ms; Gemini reasons concurrently.
                </p>
              </div>
              <div className="rounded bg-code border border-graphite-800 p-1.5 font-mono text-[10px] text-brand-300 flex items-center justify-between">
                <span>AST + AI</span>
                <span className="text-brand-400">Ready</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-lg bg-graphite-950 border border-graphite-800 flex flex-col justify-between shadow-dev-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-brand-400">03</span>
                  <span className="text-[10px] font-mono text-red-400">DIAGNOSE</span>
                </div>
                <h4 className="text-xs font-bold text-graphite-100 mb-1">Inspect Findings</h4>
                <p className="text-[11px] text-graphite-400 leading-relaxed mb-3">
                  In-situ review comment with rationale.
                </p>
              </div>
              <div className="rounded bg-red-950/40 border border-red-900/40 p-1.5 font-mono text-[10px] text-red-300 truncate">
                <span>! auth.js:6 SEC-SECRET</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-lg bg-graphite-950 border border-graphite-800 flex flex-col justify-between shadow-dev-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-brand-400">04</span>
                  <span className="text-[10px] font-mono text-brand-400">MUTATE</span>
                </div>
                <h4 className="text-xs font-bold text-graphite-100 mb-1">Apply Fix</h4>
                <p className="text-[11px] text-graphite-400 leading-relaxed mb-3">
                  Cryptographic SHA-256 line replacement.
                </p>
              </div>
              <div className="rounded bg-brand-950/40 border border-brand-900/40 p-1.5 font-mono text-[10px] text-brand-300 truncate">
                <span>+ process.env.SECRET</span>
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-4 rounded-lg bg-graphite-950 border border-graphite-800 flex flex-col justify-between shadow-dev-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-brand-400">05</span>
                  <span className="text-[10px] font-mono text-cyan-400">VERIFY</span>
                </div>
                <h4 className="text-xs font-bold text-graphite-100 mb-1">Re-Review</h4>
                <p className="text-[11px] text-graphite-400 leading-relaxed mb-3">
                  Automated re-audit proves zero regression.
                </p>
              </div>
              <div className="rounded bg-code border border-graphite-800 p-1.5 font-mono text-[10px] text-cyan-300 flex items-center justify-between">
                <span>Score: 50 → 75</span>
                <span className="text-brand-400 font-bold">✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Final Call to Action */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 bg-graphite-950 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-graphite-900 border border-graphite-800 mb-6 shadow-dev-sm">
            <CodeEagleLogo size={32} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-graphite-100 tracking-tight mb-4">
            Ready to review?
          </h2>
          <p className="text-base text-graphite-400 mb-8 leading-relaxed">
            Start reviewing your code with CodeEagle. Run deterministic AST checks and Gemini semantic reasoning in seconds.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onStartReviewing()}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start Reviewing Now
            </Button>
          </div>
        </div>
      </section>

      {/* Developer Footer */}
      <footer className="mt-auto border-t border-graphite-800/80 bg-graphite-950 py-6 px-4 sm:px-8 select-none">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-graphite-500 font-sans">
          <div className="flex items-center gap-2">
            <CodeEagleLogo size={18} />
            <span className="font-semibold text-graphite-300">CodeEagle</span>
            <span className="text-graphite-600">•</span>
            <span>AI Code Review Platform</span>
          </div>
          <div className="text-graphite-500 text-[11px] font-mono">
            Deterministic AST Safety + Google Gemini Reasoning
          </div>
        </div>
      </footer>
    </div>
  );
}
