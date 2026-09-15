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
  ChevronRight,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Button } from './ui/Button.jsx';
import { Badge } from './ui/Badge.jsx';
import { Navbar } from './Navbar.jsx';

export function LandingPage({
  onStartReviewing,
  onOpenHistory,
  historyCount = 0,
}) {
  // Live Miniature Product Demo State
  const [demoFixed, setDemoFixed] = useState(false);

  return (
    <div className="min-h-screen bg-graphite-950 text-graphite-100 font-sans selection:bg-brand-500/25 selection:text-white flex flex-col">
      {/* 1. Navbar */}
      <Navbar
        mode="landing"
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigateReview={onStartReviewing}
        onToggleHistory={onOpenHistory}
        historyCount={historyCount}
      />

      {/* 2. Hero Section: Product Introduction */}
      <section className="relative pt-16 sm:pt-24 pb-14 sm:pb-18 px-4 sm:px-8 border-b border-graphite-800/80 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-graphite-900/60 via-graphite-950 to-graphite-950">
        <div className="max-w-4xl mx-auto text-center">
          {/* Brand Kicker */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-graphite-900 border border-graphite-750 text-brand-400 text-xs font-mono font-medium mb-6 shadow-dev-sm">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <span>STATIC PRECISION · AI REASONING · VERIFIED FIXES</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-graphite-100 tracking-tight leading-[1.08] mb-6 font-sans">
            Review your code.
            <br />
            <span className="text-graphite-400">Catch problems before they ship.</span>
          </h1>

          <p className="text-base sm:text-lg text-graphite-300 leading-relaxed font-normal mb-8 max-w-2xl mx-auto">
            CodeEagle identifies security vulnerabilities, logic bugs, and quality regressions in your code — then helps you fix them safely before you open a pull request.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button
              variant="primary"
              size="lg"
              onClick={onStartReviewing}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start Reviewing
            </Button>

            <a
              href="#product-demo"
              className="px-4 py-2 text-sm font-medium text-graphite-300 hover:text-graphite-100 hover:bg-graphite-900 rounded-[8px] border border-graphite-800 hover:border-graphite-700 transition-all shadow-dev-sm flex items-center gap-1.5"
            >
              <span>See how it works</span>
              <ChevronRight className="w-3.5 h-3.5 text-graphite-400" />
            </a>
          </div>
        </div>
      </section>

      {/* 3. Product Demonstration: Miniature Real Surface */}
      <section id="product-demo" className="py-16 sm:py-20 px-4 sm:px-8 border-b border-graphite-800/80 bg-graphite-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider mb-2">
              Interactive Preview
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-graphite-100 tracking-tight mb-2">
              How CodeEagle reviews your code
            </h2>
            <p className="text-xs sm:text-sm text-graphite-400 leading-relaxed">
              Line-anchored findings with actionable rationale and single-click verified patches. Click below to simulate applying the fix.
            </p>
          </div>

          {/* Miniature Real Product Surface */}
          <div className="rounded-xl border border-graphite-750 shadow-dev-lg bg-graphite-900 overflow-hidden">
            {/* Window Header */}
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

              {/* Dynamic Score & Status */}
              <div className="flex items-center gap-3">
                {demoFixed ? (
                  <span className="text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded font-mono font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Score: 82 / 100 (+16)</span>
                  </span>
                ) : (
                  <span className="text-xs text-orange-300 bg-orange-950/60 border border-orange-800/60 px-2 py-0.5 rounded font-mono font-semibold">
                    Score: 66 / 100
                  </span>
                )}
                <span className="text-[11px] text-teal-300 bg-teal-950/60 border border-teal-800/60 px-2 py-0.5 rounded font-mono font-semibold hidden sm:inline-block">
                  Review Complete
                </span>
              </div>
            </div>

            {/* Split View: Code Context (Left) + PR Review Comment (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
              {/* Left: Code Surface */}
              <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-graphite-800 p-4 font-mono text-xs leading-relaxed text-code-text overflow-x-auto bg-code">
                <div className="space-y-1">
                  <div className="text-graphite-500">// Express authentication handler</div>
                  <div><span className="text-graphite-600 select-none inline-block w-6 text-right mr-3">1</span><span className="text-purple-400">const</span> express = require(<span className="text-amber-300">'express'</span>);</div>
                  <div><span className="text-graphite-600 select-none inline-block w-6 text-right mr-3">2</span><span className="text-purple-400">const</span> jwt = require(<span className="text-amber-300">'jsonwebtoken'</span>);</div>
                  <div><span className="text-graphite-600 select-none inline-block w-6 text-right mr-3">3</span><span className="text-purple-400">const</span> db = require(<span className="text-amber-300">'./database'</span>);</div>
                  <div><span className="text-graphite-600 select-none inline-block w-6 text-right mr-3">4</span></div>
                  <div><span className="text-graphite-500 select-none inline-block w-6 text-right mr-3">5</span><span className="text-graphite-500">{demoFixed ? '// Environment variable configured' : '// Security risk: hardcoded fallback secret'}</span></div>

                  {/* Line 6: Flawed vs Fixed */}
                  {demoFixed ? (
                    <div className="bg-emerald-950/40 text-emerald-200 -mx-4 px-4 py-0.5 border-l-2 border-emerald-500 flex items-baseline transition-colors">
                      <span className="text-emerald-400 select-none inline-block w-6 text-right mr-3 font-bold">6</span>
                      <span><span className="text-purple-400">const</span> JWT_SECRET = <span className="text-emerald-300 font-semibold">process.env.JWT_SECRET;</span></span>
                    </div>
                  ) : (
                    <div className="bg-red-950/40 text-red-200 -mx-4 px-4 py-0.5 border-l-2 border-red-500 flex items-baseline transition-colors">
                      <span className="text-red-400 select-none inline-block w-6 text-right mr-3 font-bold">6</span>
                      <span><span className="text-purple-400">const</span> JWT_SECRET = <span className="text-red-300 font-semibold">'super_secret_key_12345'</span>;</span>
                    </div>
                  )}

                  <div><span className="text-graphite-600 select-none inline-block w-6 text-right mr-3">7</span></div>
                  <div><span className="text-graphite-600 select-none inline-block w-6 text-right mr-3">8</span><span className="text-cyan-400">async</span> <span className="text-purple-400">function</span> <span className="text-amber-300">login</span>(req, res) &#123;</div>
                  <div><span className="text-graphite-600 select-none inline-block w-6 text-right mr-3">9</span>  <span className="text-purple-400">const</span> &#123; username, password &#125; = req.body;</div>
                  <div><span className="text-graphite-600 select-none inline-block w-6 text-right mr-3">10</span></div>
                  <div><span className="text-graphite-600 select-none inline-block w-6 text-right mr-3">11</span>  <span className="text-purple-400">const</span> user = <span className="text-cyan-400">await</span> db.query(query);</div>
                  <div><span className="text-graphite-600 select-none inline-block w-6 text-right mr-3">12</span>&#125;</div>
                </div>
              </div>

              {/* Right: Review Comment */}
              <div className="lg:col-span-5 bg-graphite-900 p-5 flex flex-col justify-between font-sans">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {demoFixed ? (
                        <Badge variant="success">RESOLVED</Badge>
                      ) : (
                        <Badge variant="critical">CRITICAL</Badge>
                      )}
                      <span className="text-xs font-mono uppercase tracking-wider font-semibold text-graphite-300">
                        SECURITY
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-graphite-400">auth.js:6</span>
                  </div>

                  <h3 className="text-sm font-bold text-graphite-100 mb-1">
                    {demoFixed ? 'Secret secured via environment variable' : 'Hardcoded credential detected'}
                  </h3>

                  <p className="text-xs text-graphite-300 leading-relaxed mb-4">
                    {demoFixed
                      ? 'The credential has been moved to an environment variable. Re-analysis confirms the finding is resolved.'
                      : 'Move the hardcoded secret to an environment variable to prevent unauthorized token signing and credential leaks.'}
                  </p>

                  {/* Suggested Diff */}
                  <div className="rounded-lg border border-graphite-800 bg-code font-mono text-[11px] p-3 mb-4 space-y-1 shadow-dev-sm">
                    <div className="text-graphite-500 text-[10px] uppercase tracking-wider mb-1 font-sans font-semibold">
                      {demoFixed ? 'Applied Change' : 'Suggested Change'}
                    </div>
                    <div className="text-red-300 bg-red-950/40 px-2 py-0.5 rounded border border-red-900/30">
                      - const JWT_SECRET = 'super_secret_key_12345';
                    </div>
                    <div className="text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30">
                      + const JWT_SECRET = process.env.JWT_SECRET;
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-3 border-t border-graphite-800 flex items-center justify-between gap-3">
                  <div className="text-xs font-mono text-graphite-400">
                    {demoFixed ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        66 → 82 (+16 pts)
                      </span>
                    ) : (
                      <span>Expected: <strong className="text-brand-400 font-bold">66 → 82 (+16)</strong></span>
                    )}
                  </div>

                  {demoFixed ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setDemoFixed(false)}
                        leftIcon={<RotateCcw className="w-3 h-3" />}
                      >
                        Reset
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={onStartReviewing}
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        Try with your code
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setDemoFixed(true)}
                      leftIcon={<Wrench className="w-3.5 h-3.5" />}
                    >
                      Apply Fix
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Why CodeEagle: 4 Concise Value Items */}
      <section id="why-codeeagle" className="py-16 sm:py-20 px-4 sm:px-8 border-b border-graphite-800/80 bg-graphite-950">
        <div className="max-w-4xl mx-auto">
          <div className="max-w-xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-graphite-100 tracking-tight mb-2">
              Why CodeEagle
            </h2>
            <p className="text-xs sm:text-sm text-graphite-400 leading-relaxed">
              Engineered to eliminate the two biggest flaws of existing code review tools: noisy linters and hallucinating LLMs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Value 1 */}
            <div className="p-5 rounded-xl bg-graphite-900 border border-graphite-800 shadow-dev-sm">
              <div className="w-8 h-8 rounded-lg bg-graphite-850 border border-graphite-750 flex items-center justify-center text-brand-400 mb-3 shadow-dev-sm">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-graphite-100 mb-1.5">
                Static precision
              </h3>
              <p className="text-xs text-graphite-400 leading-relaxed">
                Known security patterns and syntax bugs are verified deterministically against AST trees — zero hallucinations, zero false line numbers.
              </p>
            </div>

            {/* Value 2 */}
            <div className="p-5 rounded-xl bg-graphite-900 border border-graphite-800 shadow-dev-sm">
              <div className="w-8 h-8 rounded-lg bg-graphite-850 border border-graphite-750 flex items-center justify-center text-teal-400 mb-3 shadow-dev-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-graphite-100 mb-1.5">
                AI reasoning
              </h3>
              <p className="text-xs text-graphite-400 leading-relaxed">
                Contextual logic bugs, unhandled exceptions, and edge cases that static linters miss are caught with targeted semantic analysis.
              </p>
            </div>

            {/* Value 3 */}
            <div className="p-5 rounded-xl bg-graphite-900 border border-graphite-800 shadow-dev-sm">
              <div className="w-8 h-8 rounded-lg bg-graphite-850 border border-graphite-750 flex items-center justify-center text-brand-400 mb-3 shadow-dev-sm">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-graphite-100 mb-1.5">
                Verified fixes
              </h3>
              <p className="text-xs text-graphite-400 leading-relaxed">
                Suggested changes are verified before application. Applying a fix immediately triggers an automated re-audit to guarantee zero regressions.
              </p>
            </div>

            {/* Value 4 */}
            <div className="p-5 rounded-xl bg-graphite-900 border border-graphite-800 shadow-dev-sm">
              <div className="w-8 h-8 rounded-lg bg-graphite-850 border border-graphite-750 flex items-center justify-center text-cyan-400 mb-3 shadow-dev-sm">
                <History className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-graphite-100 mb-1.5">
                Review history
              </h3>
              <p className="text-xs text-graphite-400 leading-relaxed">
                Every review iteration is tracked on a progress timeline so you can see your code quality improve from first draft to production-ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works: 5-Step Visual Sequence */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-8 border-b border-graphite-800/80 bg-graphite-900">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-xl mb-12">
            <div className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider mb-2">
              Workflow
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-graphite-100 tracking-tight mb-2">
              How review works
            </h2>
            <p className="text-xs sm:text-sm text-graphite-400 leading-relaxed">
              From pasting code to applying verified fixes in 5 straightforward steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {/* Step 1 */}
            <div className="p-4 rounded-lg bg-graphite-950 border border-graphite-800 flex flex-col justify-between shadow-dev-sm">
              <div>
                <span className="text-xs font-mono font-bold text-brand-400 mb-2 block">01</span>
                <h4 className="text-xs font-bold text-graphite-100 mb-1">Paste code</h4>
                <p className="text-[11px] text-graphite-400 leading-relaxed">
                  Enter raw JavaScript or JSX source into the editor.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-lg bg-graphite-950 border border-graphite-800 flex flex-col justify-between shadow-dev-sm">
              <div>
                <span className="text-xs font-mono font-bold text-brand-400 mb-2 block">02</span>
                <h4 className="text-xs font-bold text-graphite-100 mb-1">Run review</h4>
                <p className="text-[11px] text-graphite-400 leading-relaxed">
                  Deterministic AST checks and AI reasoning run concurrently.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-lg bg-graphite-950 border border-graphite-800 flex flex-col justify-between shadow-dev-sm">
              <div>
                <span className="text-xs font-mono font-bold text-brand-400 mb-2 block">03</span>
                <h4 className="text-xs font-bold text-graphite-100 mb-1">Understand</h4>
                <p className="text-[11px] text-graphite-400 leading-relaxed">
                  Review briefing highlights what is stopping your code.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-lg bg-graphite-950 border border-graphite-800 flex flex-col justify-between shadow-dev-sm">
              <div>
                <span className="text-xs font-mono font-bold text-brand-400 mb-2 block">04</span>
                <h4 className="text-xs font-bold text-graphite-100 mb-1">Fix</h4>
                <p className="text-[11px] text-graphite-400 leading-relaxed">
                  Apply verified single-click code patches directly.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-4 rounded-lg bg-graphite-950 border border-graphite-800 flex flex-col justify-between shadow-dev-sm">
              <div>
                <span className="text-xs font-mono font-bold text-brand-400 mb-2 block">05</span>
                <h4 className="text-xs font-bold text-graphite-100 mb-1">Re-review</h4>
                <p className="text-[11px] text-graphite-400 leading-relaxed">
                  Automated re-audit confirms resolution and updates score.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Final Call to Action */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 bg-graphite-950 text-center">
        <div className="max-w-xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-graphite-900 border border-graphite-800 mb-6 shadow-dev-sm">
            <CodeEagleLogo size={32} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-graphite-100 tracking-tight mb-3 font-sans">
            Ready to review?
          </h2>
          <p className="text-sm text-graphite-400 mb-8 leading-relaxed">
            Start reviewing your code with CodeEagle. Catch issues before they reach production.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={onStartReviewing}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start Reviewing Now
            </Button>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="mt-auto border-t border-graphite-800/80 bg-graphite-950 py-6 px-4 sm:px-8 select-none">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-graphite-500 font-sans">
          <div className="flex items-center gap-2">
            <CodeEagleLogo size={18} />
            <span className="font-semibold text-graphite-300">CodeEagle</span>
            <span className="text-graphite-600">•</span>
            <span>AI Code Review Platform</span>
          </div>
          <div className="text-graphite-500 text-[11px] font-mono">
            Static Precision · AI Reasoning · Verified Fixes
          </div>
        </div>
      </footer>
    </div>
  );
}
