import React, { useState } from 'react';
import { CodeEagleLogo } from './CodeEagleLogo.jsx';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Layers,
  ListTree,
  GitBranch,
  RotateCcw,
  Sparkles,
  Zap,
  Check,
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
  // Live Miniature Product Demo State
  const [demoFixed, setDemoFixed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-500/20 selection:text-brand-900 flex flex-col">
      {/* 1. Header Navigation */}
      <Navbar
        mode="landing"
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigateReview={onStartReviewing}
        onToggleHistory={onOpenHistory}
        historyCount={historyCount}
      />

      {/* 2. Hero Section: Product-Led Split Composition */}
      <section className="pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Product Value & Immediate Action */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Review your code.
                <br />
                <span className="text-brand-600">Catch problems before they ship.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-xl">
                CodeEagle combines deterministic code analysis with AI reasoning to identify security vulnerabilities, logic bugs, and quality hazards before you open a pull request.
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={onStartReviewing}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto shadow-dev hover:shadow-dev-lg text-base py-3 px-6"
              >
                Start Reviewing
              </Button>
            </div>

            {/* Instant Sample Scenario Triggers */}
            <div className="pt-4 border-t border-slate-200">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                Or explore an example scenario:
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectScenarioAndStart && onSelectScenarioAndStart('insecure-login')}
                  className="px-3 py-1.5 rounded-[6px] bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-medium transition-colors shadow-dev-sm cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>Insecure Login (auth.js)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectScenarioAndStart && onSelectScenarioAndStart('buggy-react')}
                  className="px-3 py-1.5 rounded-[6px] bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-medium transition-colors shadow-dev-sm cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Buggy React (ActivityFeed.jsx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectScenarioAndStart && onSelectScenarioAndStart('complex-function')}
                  className="px-3 py-1.5 rounded-[6px] bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-medium transition-colors shadow-dev-sm cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Complex Function (shippingFee.js)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Actual Interactive Product Demonstration */}
          <div className="lg:col-span-6" id="product-demo">
            <div className="rounded-xl border border-slate-200 bg-white shadow-dev-lg overflow-hidden transition-all duration-300">
              {/* Demo Window Chrome */}
              <div className="h-11 bg-slate-100 border-b border-slate-200 px-4 flex items-center justify-between text-xs select-none">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 mr-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  </div>
                  <FileCode className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono font-semibold text-slate-800">auth.js</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 text-[11px]">JavaScript · 27 lines</span>
                </div>

                {/* Interactive Score Indicator */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Score:</span>
                  <span
                    className={`font-mono font-bold text-xs px-2 py-0.5 rounded-[4px] border transition-colors ${
                      demoFixed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {demoFixed ? '66 / 100 (+16 pts)' : '50 / 100'}
                  </span>
                </div>
              </div>

              {/* Dual-Canvas: Top Half Deep Graphite Code Editor */}
              <div className="bg-[#0D1117] text-[#E6EDF3] p-4 font-mono text-xs overflow-x-auto border-b border-slate-200">
                <div className="space-y-1 select-none">
                  <div className="text-slate-500 flex items-center gap-3">
                    <span className="w-4 text-right">1</span>
                    <span className="text-slate-400">const express = require('express');</span>
                  </div>
                  <div className="text-slate-500 flex items-center gap-3">
                    <span className="w-4 text-right">2</span>
                    <span className="text-slate-400">const jwt = require('jsonwebtoken');</span>
                  </div>
                  <div className="text-slate-500 flex items-center gap-3">
                    <span className="w-4 text-right">3</span>
                    <span>const app = express();</span>
                  </div>
                  <div className="text-slate-500 flex items-center gap-3">
                    <span className="w-4 text-right">4</span>
                    <span className="text-slate-500">// Authentication endpoint</span>
                  </div>
                  <div className="text-slate-500 flex items-center gap-3">
                    <span className="w-4 text-right">5</span>
                    <span>app.post('/api/login', (req, res) =&gt; &#123;</span>
                  </div>

                  {/* Highlighted Finding Line */}
                  <div
                    className={`flex items-center gap-3 px-2 py-1 -mx-2 rounded transition-colors ${
                      demoFixed
                        ? 'bg-emerald-950/60 border-l-2 border-emerald-500 text-emerald-300'
                        : 'bg-red-950/70 border-l-2 border-red-500 text-red-200'
                    }`}
                  >
                    <span className="w-4 text-right font-bold">{demoFixed ? '6' : '6'}</span>
                    <span className="font-semibold">
                      {demoFixed
                        ? '  const JWT_SECRET = process.env.JWT_SECRET;'
                        : "  const JWT_SECRET = 'supersecretjwtkey123';"}
                    </span>
                    <span className="ml-auto text-[10px] font-sans font-bold px-1.5 py-0.2 rounded uppercase">
                      {demoFixed ? 'Fixed' : 'CRITICAL'}
                    </span>
                  </div>

                  <div className="text-slate-500 flex items-center gap-3">
                    <span className="w-4 text-right">7</span>
                    <span>  const token = jwt.sign(&#123; id: user.id &#125;, JWT_SECRET);</span>
                  </div>
                  <div className="text-slate-500 flex items-center gap-3">
                    <span className="w-4 text-right">8</span>
                    <span>  res.json(&#123; token &#125;);</span>
                  </div>
                </div>
              </div>

              {/* Bottom Half: Senior PR Review Comment on Clean White Surface */}
              <div className="p-5 bg-white space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Badge variant={demoFixed ? 'success' : 'critical'} size="sm">
                      {demoFixed ? 'RESOLVED' : 'CRITICAL · SECURITY'}
                    </Badge>
                    <span className="font-mono text-xs text-slate-500 font-semibold">SEC-SECRET · auth.js:6</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Source verified</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    {demoFixed ? 'Secret key safely parameterized from environment' : 'Hardcoded JWT Secret in source code'}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {demoFixed
                      ? 'The secret key is now loaded securely from process.env.JWT_SECRET. Cryptographic token signatures cannot be forged by repository viewers.'
                      : 'Storing sensitive cryptographic keys in plaintext source code allows unauthorized token generation if the repository is leaked.'}
                  </p>
                </div>

                {/* Clean Unified Diff */}
                <div className="rounded-lg border border-slate-200 bg-slate-900 text-slate-100 p-3 font-mono text-xs select-none">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                    Suggested Change
                  </div>
                  <div className="text-red-400 bg-red-950/40 px-2 py-0.5 rounded -mx-1 mb-1">
                    - const JWT_SECRET = 'supersecretjwtkey123';
                  </div>
                  <div className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded -mx-1">
                    + const JWT_SECRET = process.env.JWT_SECRET;
                  </div>
                </div>

                {/* Tactile Action Button */}
                <div className="pt-1 flex items-center justify-between gap-4">
                  {demoFixed ? (
                    <>
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Fix applied & verified (50 → 66 pts)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDemoFixed(false)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset</span>
                        </button>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={onStartReviewing}
                          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        >
                          Open in Workspace
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-slate-500">Click to apply single-click patch:</span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setDemoFixed(true)}
                        leftIcon={<Check className="w-3.5 h-3.5" />}
                        className="shadow-dev-sm"
                      >
                        Apply Suggested Fix
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section: Why CodeEagle (4 Editorial Concepts, NOT 4 Giant Cards) */}
      <section id="why-codeeagle" className="py-16 sm:py-20 px-4 sm:px-8 border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Built for developers who care about code correctness.
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Unlike generic chat assistants or basic linters, CodeEagle pairs deterministic compiler-level precision with contextual AI reasoning and cryptographically verified patches.
            </p>
          </div>

          <div className="divide-y divide-slate-200">
            {/* Concept 1 */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline">
              <div className="md:col-span-4 flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-brand-600">01</span>
                <h3 className="text-lg font-bold text-slate-900">Deterministic AST Checks</h3>
              </div>
              <div className="md:col-span-8 text-sm text-slate-600 leading-relaxed">
                13 native static analyzers parse your JavaScript AST locally. High-confidence detection of SQL injections, hardcoded credentials, and prototype pollution runs in milliseconds with zero false positives.
              </div>
            </div>

            {/* Concept 2 */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline">
              <div className="md:col-span-4 flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-brand-600">02</span>
                <h3 className="text-lg font-bold text-slate-900">Contextual AI Reasoning</h3>
              </div>
              <div className="md:col-span-8 text-sm text-slate-600 leading-relaxed">
                Google Gemini semantic analysis inspects multi-line function behavior, error handling branches, and business logic flaws that standard static rules cannot catch alone.
              </div>
            </div>

            {/* Concept 3 */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline">
              <div className="md:col-span-4 flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-brand-600">03</span>
                <h3 className="text-lg font-bold text-slate-900">Verified Safe Patches</h3>
              </div>
              <div className="md:col-span-8 text-sm text-slate-600 leading-relaxed">
                Every patch is cryptographically verified against SHA-256 source hashes and line ranges before application. One click applies the fix and immediately re-audits the code to confirm score improvement.
              </div>
            </div>

            {/* Concept 4 */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline">
              <div className="md:col-span-4 flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-brand-600">04</span>
                <h3 className="text-lg font-bold text-slate-900">Auditable Review Ledger</h3>
              </div>
              <div className="md:col-span-8 text-sm text-slate-600 leading-relaxed">
                Every audit creates an immutable snapshot of code state, findings, and score progression. Seamlessly inspect your improvement timeline and restore past reviews in a single click.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section: How It Works (Connected 5-Step Progression) */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-8 border-t border-slate-200 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              From code to confidence in five steps.
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              A continuous, guided workflow designed to resolve issues without cognitive overload.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-dev-sm space-y-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-mono font-bold text-xs text-slate-800">
                01
              </div>
              <h4 className="text-sm font-bold text-slate-900">Paste Code</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Paste any source snippet or load an example scenario.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-dev-sm space-y-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-mono font-bold text-xs text-slate-800">
                02
              </div>
              <h4 className="text-sm font-bold text-slate-900">Run Review</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                AST checks run in milliseconds followed by AI reasoning.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-dev-sm space-y-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-mono font-bold text-xs text-slate-800">
                03
              </div>
              <h4 className="text-sm font-bold text-slate-900">Inspect Findings</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Read the executive briefing and explore prioritized blockers.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-dev-sm space-y-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-mono font-bold text-xs text-slate-800">
                04
              </div>
              <h4 className="text-sm font-bold text-slate-900">Apply Fix</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inspect clean unified diffs and apply verified patches with one click.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-dev-sm space-y-2">
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center font-mono font-bold text-xs text-brand-700">
                05
              </div>
              <h4 className="text-sm font-bold text-slate-900">Verify Result</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated re-audit confirms resolution and score jump.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section: Product Capabilities (3 Review Lenses) */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Three review lenses. Zero guesswork.
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Every perspective answers one specific question so you can take action without friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/70 shadow-dev-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-brand-600 shadow-dev-sm">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Overview Lens</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Executive briefing answering <em>"What's stopping this code?"</em> with quality score verdict, ranked blocker checklist, and review signals.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/70 shadow-dev-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-brand-600 shadow-dev-sm">
                <ListTree className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Findings Lens</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Actionable task list paired with the dark code editor and senior PR review comments with verified diffs and one-click patching.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/70 shadow-dev-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-brand-600 shadow-dev-sm">
                <GitBranch className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Architecture Lens</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inferred execution control flow graph mapping handlers, validation, and database queries with vulnerable nodes highlighted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section: Final CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 border-t border-slate-200 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Ready to review?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Paste your code or pick an example scenario. Catch problems before they reach production.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={onStartReviewing}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="shadow-dev text-base py-3.5 px-8"
            >
              Start Reviewing Now
            </Button>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-8 px-4 sm:px-8 border-t border-slate-200 bg-white select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <CodeEagleLogo size={20} withText={true} withSubtitle={true} />
          <div className="text-xs text-slate-500 font-sans">
            Deterministic AST Static Analysis · Contextual AI Reasoning · Verified Fixes
          </div>
        </div>
      </footer>
    </div>
  );
}
