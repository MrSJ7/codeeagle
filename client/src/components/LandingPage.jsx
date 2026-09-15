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
} from 'lucide-react';
import { PRESETS } from '../data/mockReviews.js';

export function LandingPage({
  onStartReviewing,
  onSelectScenarioAndStart,
  onOpenHistory,
  historyCount = 0,
}) {
  const [activeTab, setActiveTab] = useState(PRESETS[0].id);
  const selectedPreset = PRESETS.find((p) => p.id === activeTab) || PRESETS[0];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0F172A] font-sans selection:bg-[#ECFDF5] selection:text-[#065F42] flex flex-col">
      {/* 1. Minimal Product Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Brand Mark */}
          <div className="flex items-center gap-2.5">
            <CodeEagleLogo size={26} />
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900 font-sans">
                CodeEagle
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#087A54] bg-[#DCFCE7] px-1.5 py-0.5 rounded font-semibold border border-[#0F9F6E]/30 hidden sm:inline-block">
                AI Code Review
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-600 font-sans">
            <a href="#why-codeeagle" className="hover:text-slate-900 transition-colors">
              Why CodeEagle
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
              How it works
            </a>
            <a href="#product-showcase" className="hover:text-slate-900 transition-colors">
              Workspace
            </a>
            <button
              type="button"
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 hover:text-slate-900 transition-colors text-slate-600"
            >
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>History</span>
              {historyCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                  {historyCount}
                </span>
              )}
            </button>
          </nav>

          {/* Primary CTA */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onStartReviewing()}
              className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F9F6E] hover:bg-[#087A54] text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.99]"
            >
              <span>Start Reviewing</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: Asymmetrical Editorial Composition */}
      <section className="pt-12 sm:pt-16 pb-12 sm:pb-20 px-4 sm:px-8 border-b border-slate-200/80 bg-gradient-to-b from-white to-[#F8F9FA]">
        <div className="max-w-6xl mx-auto">
          {/* Top Hero Typography & Callout */}
          <div className="max-w-3xl mb-10">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#DCFCE7] border border-[#0F9F6E]/30 text-[#087A54] text-xs font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#0F9F6E]" />
              <span>Deterministic AST static precision + Gemini semantic reasoning</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight leading-[1.15] mb-4">
              Review your code.
              <br />
              <span className="text-slate-700">Catch problems before they ship.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal mb-6 max-w-2xl">
              Static linters miss contextual logic bugs. Pure LLMs hallucinate invalid line numbers and break working code. CodeEagle pairs deterministic AST safety with contextual reasoning for verified, regression-free code patches.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => onStartReviewing()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F9F6E] hover:bg-[#087A54] text-white text-sm font-semibold shadow-xs transition-all"
              >
                <span>Start Reviewing</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span className="text-slate-400">or try scenario:</span>
                <button
                  type="button"
                  onClick={() => onSelectScenarioAndStart('insecure-login')}
                  className="px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-medium hover:border-slate-400 transition-colors"
                >
                  auth.js
                </button>
                <button
                  type="button"
                  onClick={() => onSelectScenarioAndStart('buggy-react')}
                  className="px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-medium hover:border-slate-400 transition-colors"
                >
                  ActivityFeed.jsx
                </button>
              </div>
            </div>
          </div>

          {/* Integrated Product Demonstration Surface (Believable CodeEagle Workspace) */}
          <div className="rounded-xl border border-slate-300 shadow-lg bg-[#16191D] overflow-hidden">
            {/* Mock Header Chrome */}
            <div className="h-10 bg-[#111316] border-b border-[#21262D] px-4 flex items-center justify-between text-xs font-mono text-slate-400 select-none">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/80" />
                </div>
                <div className="h-3.5 w-px bg-[#21262D]" />
                <div className="flex items-center gap-2 text-slate-200 font-medium">
                  <FileCode className="w-3.5 h-3.5 text-[#0F9F6E]" />
                  <span>auth.js</span>
                  <span className="text-xs text-slate-500 font-normal">27 lines</span>
                </div>
              </div>

              {/* Score Indicator */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#EA580C] bg-[#EA580C]/10 border border-[#EA580C]/30 px-2 py-0.5 rounded font-semibold">
                  2 findings · 50/100
                </span>
                <span className="text-[11px] text-[#0F9F6E] bg-[#0F9F6E]/10 border border-[#0F9F6E]/30 px-2 py-0.5 rounded font-semibold">
                  AST + AI
                </span>
              </div>
            </div>

            {/* Split Preview Grid: Code on Left, PR Comment & Diff on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
              {/* Left Code Buffer (7 cols) */}
              <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[#21262D] p-4 font-mono text-xs leading-relaxed text-[#E6EDF3] overflow-x-auto bg-[#16191D]">
                <div className="space-y-1">
                  <div className="text-slate-500">// Simulated auth handler with credentials & SQL query</div>
                  <div><span className="text-slate-500 select-none inline-block w-6 text-right mr-3">1</span><span className="text-purple-400">const</span> express = require(<span className="text-emerald-400">'express'</span>);</div>
                  <div><span className="text-slate-500 select-none inline-block w-6 text-right mr-3">2</span><span className="text-purple-400">const</span> jwt = require(<span className="text-emerald-400">'jsonwebtoken'</span>);</div>
                  <div><span className="text-slate-500 select-none inline-block w-6 text-right mr-3">3</span><span className="text-purple-400">const</span> db = require(<span className="text-emerald-400">'./database'</span>);</div>
                  <div><span className="text-slate-500 select-none inline-block w-6 text-right mr-3">4</span></div>
                  <div><span className="text-slate-500 select-none inline-block w-6 text-right mr-3">5</span><span className="text-slate-500">// Security risk: hardcoded fallback secret</span></div>
                  <div className="bg-[#DC2626]/20 text-red-200 -mx-4 px-4 py-0.5 border-l-2 border-[#DC2626] flex items-baseline">
                    <span className="text-slate-400 select-none inline-block w-6 text-right mr-3 font-bold">6</span>
                    <span><span className="text-purple-400">const</span> JWT_SECRET = <span className="text-red-300 font-semibold">'super-secret-key-12345'</span>;</span>
                  </div>
                  <div><span className="text-slate-500 select-none inline-block w-6 text-right mr-3">7</span></div>
                  <div><span className="text-slate-500 select-none inline-block w-6 text-right mr-3">8</span><span className="text-blue-400">async</span> <span className="text-purple-400">function</span> <span className="text-yellow-300">login</span>(req, res) &#123;</div>
                  <div><span className="text-slate-500 select-none inline-block w-6 text-right mr-3">9</span>  <span className="text-purple-400">const</span> &#123; username, password &#125; = req.body;</div>
                  <div><span className="text-slate-500 select-none inline-block w-6 text-right mr-3">10</span></div>
                  <div><span className="text-slate-500 select-none inline-block w-6 text-right mr-3">11</span>  <span className="text-slate-500">// Security risk: direct string interpolation</span></div>
                  <div className="bg-[#DC2626]/20 text-red-200 -mx-4 px-4 py-0.5 border-l-2 border-[#DC2626] flex items-baseline">
                    <span className="text-slate-400 select-none inline-block w-6 text-right mr-3 font-bold">12</span>
                    <span>  <span className="text-purple-400">const</span> query = <span className="text-red-300 font-semibold">{"`SELECT * FROM users WHERE user = '${username}'`"}</span>;</span>
                  </div>
                  <div><span className="text-slate-500 select-none inline-block w-6 text-right mr-3">13</span>  <span className="text-purple-400">const</span> user = <span className="text-blue-400">await</span> db.query(query);</div>
                  <div><span className="text-slate-500 select-none inline-block w-6 text-right mr-3">14</span>&#125;</div>
                </div>
              </div>

              {/* Right PR Review Comment & Diff (5 cols) */}
              <div className="lg:col-span-5 bg-white p-5 flex flex-col justify-between font-sans">
                <div>
                  {/* PR Comment Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[11px] font-bold tracking-wide uppercase">
                        CRITICAL
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        SECURITY
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#DCFCE7] text-[#087A54] border border-[#0F9F6E]/30 text-[10px] font-mono font-semibold">
                      AST RULE
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1">
                    Hardcoded Secret Detected
                  </h3>
                  <div className="text-xs text-slate-500 font-mono mb-3">
                    auth.js:6 · SEC-SECRET-5
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Hardcoded cryptographic secrets in source code allow attackers to forge authentication tokens and bypass role-based access control.
                  </p>

                  {/* Suggested Diff Box */}
                  <div className="rounded border border-slate-200 bg-slate-900 font-mono text-[11px] p-3 mb-4 space-y-1 overflow-x-auto text-slate-200">
                    <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1 font-sans">
                      Suggested Verified Change
                    </div>
                    <div className="text-red-400 bg-red-950/40 px-2 py-0.5 rounded">
                      - const JWT_SECRET = 'super-secret-key-12345';
                    </div>
                    <div className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded">
                      + const JWT_SECRET = process.env.JWT_SECRET;
                    </div>
                  </div>
                </div>

                {/* Remediation Action Callout */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-xs font-mono text-slate-500">
                    Expected score: <strong className="text-[#087A54] font-bold">50 → 66 (+16)</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectScenarioAndStart('insecure-login')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#0F9F6E] hover:bg-[#087A54] text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span>Inspect in Reviewer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. "Why CodeEagle" Editorial Capability Rows */}
      <section id="why-codeeagle" className="py-16 sm:py-20 px-4 sm:px-8 border-b border-slate-200/80 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight mb-3">
              Engineered for developer trust.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              We eliminated the failure modes of pure AI code reviewers by grounding semantic reasoning in deterministic compiler facts.
            </p>
          </div>

          <div className="divide-y divide-slate-200">
            {/* Row 1: Deterministic Checks */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-4">
                <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-3">
                  <Cpu className="w-5 h-5 text-[#0F9F6E]" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Deterministic AST Checks
                </h3>
                <span className="text-xs font-mono text-slate-500 mt-0.5 block">
                  13 Built-in Babel Analyzers
                </span>
              </div>
              <div className="md:col-span-8 text-sm text-slate-600 leading-relaxed space-y-2">
                <p>
                  Zero hallucinations. The AST engine inspects syntax trees directly to identify hardcoded credentials, unhandled promises, prototype pollution, memory leaks, missing React hook dependencies, and nested complexity.
                </p>
                <div className="flex items-center gap-2 font-mono text-xs text-slate-500 pt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium">Babel AST Parser</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium">Cyclomatic Complexity</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium">Zero Cloud Execution</span>
                </div>
              </div>
            </div>

            {/* Row 2: Contextual AI Reasoning */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-4">
                <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Contextual AI Reasoning
                </h3>
                <span className="text-xs font-mono text-slate-500 mt-0.5 block">
                  Google Gemini 2.5 Flash
                </span>
              </div>
              <div className="md:col-span-8 text-sm text-slate-600 leading-relaxed space-y-2">
                <p>
                  Deterministic linters cannot diagnose subtle logic flaws, state bugs, or contextual security hazards. Gemini reasoning models diagnose complex logic regressions, constrained strictly to exact line numbers and verifiable fix candidates.
                </p>
                <div className="flex items-center gap-2 font-mono text-xs text-slate-500 pt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium">Structured JSON Schemas</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium">Physical Line Bounds</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium">Deduplication Priority</span>
                </div>
              </div>
            </div>

            {/* Row 3: Cryptographic Verified Fixes */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-4">
                <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-3">
                  <ShieldCheck className="w-5 h-5 text-[#0F9F6E]" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Verified Safe Patches
                </h3>
                <span className="text-xs font-mono text-slate-500 mt-0.5 block">
                  SHA-256 Stale Protection
                </span>
              </div>
              <div className="md:col-span-8 text-sm text-slate-600 leading-relaxed space-y-2">
                <p>
                  No blind string replacements. Proposed patches require verbatim source match and cryptographic SHA-256 hash validation before application. Applying a fix immediately executes an automated server re-audit to verify resolution and ensure zero regressions.
                </p>
                <div className="flex items-center gap-2 font-mono text-xs text-slate-500 pt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium">Single Occurrence Rule</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium">Automated Re-Analysis</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium">Score Delta Tracking</span>
                </div>
              </div>
            </div>

            {/* Row 4: Auditable Review History */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-4">
                <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-3">
                  <History className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Auditable History Ledger
                </h3>
                <span className="text-xs font-mono text-slate-500 mt-0.5 block">
                  MongoDB + In-Memory Fallback
                </span>
              </div>
              <div className="md:col-span-8 text-sm text-slate-600 leading-relaxed space-y-2">
                <p>
                  Inspect previous audit iterations, compare before/after patch states, and restore historical snapshots with zero risk of overwriting unreviewed work. Operates seamlessly with MongoDB Atlas or in-memory persistence.
                </p>
                <div className="flex items-center gap-2 font-mono text-xs text-slate-500 pt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium">Immutable Snapshots</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium">Score Progression</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium">Zero Setup Fallback</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. "How It Works" Continuous Workflow Pipeline */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-8 border-b border-slate-200/80 bg-[#F8F9FA]">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight mb-3">
              How review works.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              From pasting code to applying verified fixes in 5 discrete steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {/* Step 1 */}
            <div className="p-4 rounded-lg bg-white border border-slate-200/90 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-[#0F9F6E]">01</span>
                <h4 className="text-sm font-bold text-slate-900 mt-2 mb-1">Paste Code</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter JS or JSX source code directly or pick a reference scenario.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-lg bg-white border border-slate-200/90 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-[#0F9F6E]">02</span>
                <h4 className="text-sm font-bold text-slate-900 mt-2 mb-1">Run Review</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  AST analyzers run in milliseconds; Gemini models reason concurrently.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-lg bg-white border border-slate-200/90 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-[#0F9F6E]">03</span>
                <h4 className="text-sm font-bold text-slate-900 mt-2 mb-1">Inspect Findings</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Scannable findings rail highlights the code line and PR review commentary.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-lg bg-white border border-slate-200/90 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-[#0F9F6E]">04</span>
                <h4 className="text-sm font-bold text-slate-900 mt-2 mb-1">Apply Fix</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  One click mutates the code buffer with cryptographic hash matching.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-4 rounded-lg bg-white border border-slate-200/90 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-[#0F9F6E]">05</span>
                <h4 className="text-sm font-bold text-slate-900 mt-2 mb-1">Re-Review</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Authoritative re-audit proves resolution and updates the history log.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Product Showcase: Interactive Workspace Preview */}
      <section id="product-showcase" className="py-16 sm:py-20 px-4 sm:px-8 border-b border-slate-200/80 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight mb-3">
              The Code Review Workspace.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Dense, focused, and code-first. Designed for engineers auditing high-stakes changes before opening a pull request.
            </p>
          </div>

          <div className="rounded-xl border border-slate-300 shadow-sm bg-slate-50 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-slate-700">Sample Scenario:</span>
                <div className="flex items-center gap-1.5">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setActiveTab(preset.id)}
                      className={`px-3 py-1 rounded text-xs font-medium font-mono transition-colors ${
                        activeTab === preset.id
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectScenarioAndStart(selectedPreset.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0F9F6E] hover:bg-[#087A54] text-white text-xs font-semibold shadow-2xs transition-colors"
              >
                <span>Open in Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scenario Description Callout */}
            <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 mb-4 text-xs leading-relaxed text-slate-700">
              <strong className="text-slate-900 font-semibold">{selectedPreset.name}:</strong> {selectedPreset.description}
            </div>

            {/* Compact Code Surface */}
            <div className="rounded-lg border border-[#21262D] bg-[#16191D] p-4 font-mono text-xs text-[#E6EDF3] max-h-60 overflow-y-auto dark-editor-scrollbar">
              <pre className="whitespace-pre">{selectedPreset.code}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Final Call to Action */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 bg-gradient-to-b from-white to-[#F8F9FA] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mb-4">
            Ready to review?
          </h2>
          <p className="text-base text-slate-600 mb-8 leading-relaxed">
            Run deterministic static analysis and contextual Gemini reasoning on your code in seconds.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => onStartReviewing()}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#0F9F6E] hover:bg-[#087A54] text-white text-sm font-semibold shadow-xs transition-all active:scale-[0.99]"
            >
              <span>Start Reviewing Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6 px-4 sm:px-8 select-none">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-sans">
          <div className="flex items-center gap-2">
            <CodeEagleLogo size={18} />
            <span className="font-semibold text-slate-800">CodeEagle</span>
            <span className="text-slate-400">•</span>
            <span>AI Code Review Platform</span>
          </div>
          <div className="text-slate-500 text-[11px] font-mono">
            Deterministic AST Safety + Google Gemini Reasoning
          </div>
        </div>
      </footer>
    </div>
  );
}
