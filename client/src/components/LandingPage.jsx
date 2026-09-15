import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Layers,
  ListTree,
  GitBranch,
  RotateCcw,
  Check,
  Play,
  Wrench,
  AlertCircle,
} from 'lucide-react';
import { Button } from './ui/Button.jsx';
import { Badge } from './ui/Badge.jsx';
import { Navbar } from './Navbar.jsx';

export function LandingPage({
  onStartReviewing,
  onSelectScenarioAndStart,
  onOpenHistory,
  onOpenHowItWorks,
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
        onOpenHowItWorks={onOpenHowItWorks}
        historyCount={historyCount}
      />

      {/* 2. Above The Fold: Developer Entry Point */}
      <section className="pt-10 sm:pt-16 pb-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          {/* Left Column: Clear Value Proposition & Direct Entry Points */}
          <div className="lg:col-span-6 space-y-6 pt-2">
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Review your code.
                <br />
                <span className="text-brand-600">Catch problems before they ship.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-xl">
                CodeEagle pairs deterministic AST compiler checks with contextual AI reasoning to identify security vulnerabilities, logic bugs, and quality hazards in your JavaScript and JSX code.
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={onStartReviewing}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto text-base py-3 px-6 shadow-dev"
              >
                Start Reviewing
              </Button>
            </div>

            {/* Instant-Start Example Scenarios */}
            <div className="pt-4 border-t border-slate-200">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                Instant sample scenarios (1-click live review):
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectScenarioAndStart && onSelectScenarioAndStart('insecure-login')}
                  className="px-3 py-1.5 rounded-[6px] bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-medium transition-colors shadow-dev-sm cursor-pointer flex items-center gap-1.5"
                  title="Run review on insecure auth handler"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span>Insecure Login (auth.js)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectScenarioAndStart && onSelectScenarioAndStart('buggy-react')}
                  className="px-3 py-1.5 rounded-[6px] bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-medium transition-colors shadow-dev-sm cursor-pointer flex items-center gap-1.5"
                  title="Run review on buggy React component"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span>Buggy React (ActivityFeed.jsx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectScenarioAndStart && onSelectScenarioAndStart('complex-function')}
                  className="px-3 py-1.5 rounded-[6px] bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-medium transition-colors shadow-dev-sm cursor-pointer flex items-center gap-1.5"
                  title="Run review on complex logic function"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span>Complex Function (shippingFee.js)</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-mono">
                Clicking any scenario immediately launches analysis and highlights findings.
              </p>
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

                {/* Score Verdict */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Verdict:</span>
                  <span
                    className={`font-mono font-bold text-xs px-2 py-0.5 rounded-[4px] border transition-colors ${
                      demoFixed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {demoFixed ? '66 / 100 · (+16 pts)' : '50 / 100 · NEEDS ATTENTION'}
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

              {/* Bottom Half: Senior PR Review Comment */}
              <div className="p-5 bg-white space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Badge variant={demoFixed ? 'success' : 'critical'} size="sm">
                      {demoFixed ? 'RESOLVED' : 'CRITICAL · SECURITY'}
                    </Badge>
                    <span className="font-mono text-xs text-slate-700 font-semibold">SEC-SECRET · auth.js:6</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-medium">AST static verified</span>
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
                <div className="rounded-lg border border-slate-800 bg-[#0D1117] text-slate-100 p-3 font-mono text-xs select-none">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                    Suggested Change
                  </div>
                  <div className="text-red-300 bg-red-950/50 px-2 py-0.5 rounded -mx-1 mb-1">
                    - const JWT_SECRET = 'supersecretjwtkey123';
                  </div>
                  <div className="text-emerald-300 bg-emerald-950/50 px-2 py-0.5 rounded -mx-1">
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

      {/* 3. Section: The 5-Step Review Workflow */}
      <section className="py-14 sm:py-16 px-4 sm:px-8 border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              The Effortless Review Loop
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Designed around how developers inspect code: understand what is wrong, where it is wrong, and fix it in one step.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-slate-700 shadow-dev-sm">
                01
              </div>
              <h3 className="text-xs font-bold text-slate-900">Paste Code</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Paste any JS/JSX snippet or select an example scenario.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-slate-700 shadow-dev-sm">
                02
              </div>
              <h3 className="text-xs font-bold text-slate-900">Run Review</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deterministic AST static checks run in milliseconds with AI reasoning.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-slate-700 shadow-dev-sm">
                03
              </div>
              <h3 className="text-xs font-bold text-slate-900">Inspect Findings</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                See exact code locations, threat impact, and clean unified diffs.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-slate-700 shadow-dev-sm">
                04
              </div>
              <h3 className="text-xs font-bold text-slate-900">Apply Fix</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apply cryptographically verified patches with a single click.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/60 space-y-2">
              <div className="w-7 h-7 rounded-md bg-white border border-emerald-200 flex items-center justify-center font-mono font-bold text-xs text-emerald-800 shadow-dev-sm">
                05
              </div>
              <h3 className="text-xs font-bold text-slate-900">Re-Analyze</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated re-audit verifies resolution and updates score delta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section: Three Review Lenses */}
      <section className="py-14 sm:py-16 px-4 sm:px-8 border-t border-slate-200 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Three Dedicated Review Lenses
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Progressive disclosure: see the executive verdict first, then dive into code lines and architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-dev-sm space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-brand-600 shadow-dev-sm">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Overview Lens (Hotkey 1)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Answers <em>"What's stopping this code?"</em> with quality score verdict, ranked blocker checklist, and 4-dimension review signals.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-dev-sm space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-brand-600 shadow-dev-sm">
                <ListTree className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Findings Lens (Hotkey 2)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Actionable 3-column cockpit: task queue, dark code canvas with line range pips, and senior PR review comments with 1-click patching.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-dev-sm space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-brand-600 shadow-dev-sm">
                <GitBranch className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Architecture Lens (Hotkey 3)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Visual control flow diagram inferred from AST structure, highlighting vulnerable nodes and connecting them directly to source lines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 border-t border-slate-200 bg-white">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Ready to review your code?
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Paste your JavaScript or JSX code. Inspect vulnerabilities with compiler precision and apply verified fixes.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={onStartReviewing}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="py-3.5 px-8 text-base shadow-dev"
            >
              Start Reviewing Now
            </Button>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="py-6 px-4 sm:px-8 border-t border-slate-200 bg-slate-50 select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-sans">
            CodeEagle · Deterministic AST Static Analysis · Contextual AI Reasoning · Verified Fixes
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Pure JavaScript & JSX Static Engine
          </div>
        </div>
      </footer>
    </div>
  );
}
