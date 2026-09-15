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
  Cpu,
  Terminal,
  Hash,
  Sparkles,
  Zap,
  Lock,
  ChevronRight,
  Code2,
  Eye,
  Brain,
} from 'lucide-react';
import { Button } from './ui/Button.jsx';
import { Card3D } from './ui/Card3D.jsx';
import { SeverityBadge } from './SeverityBadge.jsx';
import { LayoutTextFlip } from './ui/layout-text-flip.jsx';
import { Navbar } from './Navbar.jsx';
import { CodeEagleLogo } from './CodeEagleLogo.jsx';
import { CodeEagleBentoShowcase } from './ui/bento-product-features.tsx';
import { FeatureCard } from './ui/feature-card.tsx';

export function LandingPage({
  onStartReviewing,
  onSelectScenarioAndStart,
  onOpenHistory,
  onOpenHowItWorks,
  historyCount = 0,
}) {
  // Live Miniature Product Demo State
  const [demoFixed, setDemoFixed] = useState(false);
  const [isApplyingDemo, setIsApplyingDemo] = useState(false);

  const handleApplyDemoFix = () => {
    setIsApplyingDemo(true);
    setTimeout(() => {
      setIsApplyingDemo(false);
      setDemoFixed(true);
    }, 600);
  };

  const handleResetDemo = () => {
    setDemoFixed(false);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-obsidian-50 font-sans selection:bg-brand-500/20 selection:text-brand-300 flex flex-col scroll-smooth">
      {/* 1. Header Navigation */}
      <Navbar
        variant="marketing"
        mode="landing"
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigateReview={onStartReviewing}
        onToggleHistory={onOpenHistory}
        onOpenHowItWorks={onOpenHowItWorks}
        historyCount={historyCount}
      />

      {/* 2. Hero Section: Editorial Developer Entry Point */}
      <section className="pt-12 sm:pt-20 pb-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Technical Kicker */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-obsidian-900 border border-obsidian-750 text-xs font-mono text-obsidian-300 shadow-sm">
            <Cpu className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span>Deterministic Babel AST + Gemini Contextual Reasoning</span>
          </div>

          {/* Kinetic Editorial Headline */}
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-obsidian-50 leading-[1.12]">
            <span>Review your code.</span>
            <br />
            <span className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-obsidian-50">
              <span>Catch</span>
              <LayoutTextFlip
                words={[
                  'SECURITY FLAWS',
                  'LOGIC BUGS',
                  'REACT KEY LEAKS',
                  'ASYNC HAZARDS',
                  'SECRET LEAKS',
                ]}
                duration={2600}
                pillClassName="border-brand-500/40 bg-brand-500/10 text-brand-400"
              />
            </span>
            <span>before you ship.</span>
          </h1>

          {/* Precision Technical Subtitle */}
          <p className="text-base sm:text-lg text-obsidian-400 leading-relaxed max-w-2xl mx-auto font-normal">
            CodeEagle combines compiler-grade Babel AST parsing with contextual Gemini reasoning. It detects vulnerabilities, grounds findings to exact line numbers, and executes verified 1-click patches with automated score re-auditing.
          </p>

          {/* High-Contrast CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              variant="primary"
              onClick={onStartReviewing}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start Reviewing
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => {
                const el = document.getElementById('workbench');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              See How It Works
            </Button>
          </div>

          {/* Instant Scenario Quick-Starts */}
          <div className="pt-6 border-t border-obsidian-800/80 max-w-2xl mx-auto">
            <p className="text-[11px] font-mono uppercase tracking-wider text-obsidian-400 mb-3">
              Or run instant live review scenarios:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => onSelectScenarioAndStart('insecure-login')}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-obsidian-900 hover:bg-obsidian-850 border border-obsidian-750 hover:border-obsidian-600 text-xs text-obsidian-300 hover:text-obsidian-50 transition-all font-mono"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-severity-critical" />
                <span className="font-semibold text-obsidian-100">auth.js</span>
                <span className="text-obsidian-400 text-[11px]">· Hardcoded Secret</span>
                <ArrowRight className="w-3 h-3 text-obsidian-500 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => onSelectScenarioAndStart('buggy-react')}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-obsidian-900 hover:bg-obsidian-850 border border-obsidian-750 hover:border-obsidian-600 text-xs text-obsidian-300 hover:text-obsidian-50 transition-all font-mono"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-severity-high" />
                <span className="font-semibold text-obsidian-100">ActivityFeed.jsx</span>
                <span className="text-obsidian-400 text-[11px]">· Key Bug</span>
                <ArrowRight className="w-3 h-3 text-obsidian-500 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => onSelectScenarioAndStart('complex-function')}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-obsidian-900 hover:bg-obsidian-850 border border-obsidian-750 hover:border-obsidian-600 text-xs text-obsidian-300 hover:text-obsidian-50 transition-all font-mono"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-severity-medium" />
                <span className="font-semibold text-obsidian-100">shippingFee.js</span>
                <span className="text-obsidian-400 text-[11px]">· Logic Edge Case</span>
                <ArrowRight className="w-3 h-3 text-obsidian-500 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section 03: The Visual Centerpiece — Interactive Live Review Workbench */}
      <section id="workbench" className="py-12 px-4 sm:px-8 max-w-7xl mx-auto w-full scroll-mt-20">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
            <div>
              <div className="text-[11px] font-mono text-brand-500 uppercase tracking-wider font-semibold">
                Live Interactive Demonstration
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-obsidian-50">
                The CodeEagle Review & Patch Loop
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-obsidian-400">
                Status: {demoFixed ? (
                  <span className="text-severity-resolved font-semibold">RESOLVED (100/100)</span>
                ) : (
                  <span className="text-severity-critical font-semibold">1 BLOCKER (50/100)</span>
                )}
              </span>
              {demoFixed && (
                <button
                  onClick={handleResetDemo}
                  className="text-xs font-mono text-obsidian-400 hover:text-obsidian-200 underline inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Demo
                </button>
              )}
            </div>
          </div>

          {/* Workbench Frame */}
          <div className="bg-obsidian-900 border border-obsidian-750 rounded-[8px] overflow-hidden shadow-2xl">
            {/* Workbench Header */}
            <div className="h-10 bg-obsidian-850 px-4 flex items-center justify-between border-b border-obsidian-750 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 font-semibold text-obsidian-200">
                  <FileCode className="w-3.5 h-3.5 text-obsidian-400" />
                  auth.js
                </span>
                <span className="text-obsidian-500">·</span>
                <span className="text-obsidian-400">JavaScript</span>
                <span className="text-obsidian-500">·</span>
                <span className="text-obsidian-400">27 lines</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[4px] bg-obsidian-800 text-[10px] text-obsidian-300 border border-obsidian-700">
                  Babel AST Engine
                </span>
              </div>
            </div>

            {/* Workbench Grid: Left = Code Canvas, Right = Senior PR Review Comment */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-obsidian-750">
              {/* Left Column: Monaco-Style Code Canvas */}
              <div className="lg:col-span-7 bg-obsidian-950 font-mono text-xs overflow-x-auto select-text p-4">
                <div className="space-y-1">
                  <div className="flex items-center text-obsidian-600">
                    <span className="w-8 text-right pr-4 select-none">1</span>
                    <span className="text-obsidian-400">import jwt from 'jsonwebtoken';</span>
                  </div>
                  <div className="flex items-center text-obsidian-600">
                    <span className="w-8 text-right pr-4 select-none">2</span>
                    <span className="text-obsidian-400">import bcrypt from 'bcrypt';</span>
                  </div>
                  <div className="flex items-center text-obsidian-600">
                    <span className="w-8 text-right pr-4 select-none">3</span>
                    <span className="text-obsidian-600">// Authentication middleware</span>
                  </div>
                  <div className="flex items-center text-obsidian-600">
                    <span className="w-8 text-right pr-4 select-none">4</span>
                    <span className="text-obsidian-300">export function generateToken(user) &#123;</span>
                  </div>
                  <div className="flex items-center text-obsidian-600">
                    <span className="w-8 text-right pr-4 select-none">5</span>
                    <span className="text-obsidian-300 pl-4">const payload = &#123; id: user.id, role: user.role &#125;;</span>
                  </div>

                  {/* Line 6: The Highlighted Flaw */}
                  <div
                    className={`flex items-center transition-colors duration-300 ${
                      demoFixed
                        ? 'bg-severity-resolved/10 text-emerald-300 border-l-2 border-severity-resolved'
                        : 'bg-severity-critical/15 text-red-200 border-l-2 border-severity-critical'
                    }`}
                  >
                    <span className="w-8 text-right pr-4 select-none font-bold text-obsidian-300">6</span>
                    <span className="pl-4 font-semibold">
                      {demoFixed ? (
                        <span className="text-emerald-300">
                          const JWT_SECRET = process.env.JWT_SECRET;
                        </span>
                      ) : (
                        <span className="text-red-300">
                          const JWT_SECRET = "production_super_secret_key_12345";
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center text-obsidian-600">
                    <span className="w-8 text-right pr-4 select-none">7</span>
                    <span className="text-obsidian-300 pl-4">return jwt.sign(payload, JWT_SECRET, &#123; expiresIn: '1h' &#125;);</span>
                  </div>
                  <div className="flex items-center text-obsidian-600">
                    <span className="w-8 text-right pr-4 select-none">8</span>
                    <span className="text-obsidian-300">&#125;</span>
                  </div>
                </div>

                {/* Live Diff Mutation Notice */}
                {demoFixed && (
                  <div className="mt-4 p-3 rounded-[5px] bg-severity-resolved/10 border border-severity-resolved/30 text-emerald-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs font-sans">
                        Patch verified via SHA-256 hash and applied. Score improved: <strong>50 → 75 (+25 pts)</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Senior PR Review Comment & Verified Patch */}
              <div className="lg:col-span-5 bg-obsidian-900 p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  {/* Finding Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {demoFixed ? (
                          <SeverityBadge severity="RESOLVED" />
                        ) : (
                          <SeverityBadge severity="CRITICAL" />
                        )}
                        <span className="text-[11px] font-mono text-obsidian-400">auth.js:6</span>
                      </div>
                      <h3 className="text-sm font-bold text-obsidian-50">
                        {demoFixed
                          ? 'Hardcoded credential resolved'
                          : 'Hardcoded credential in JWT_SECRET'}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-[4px] bg-obsidian-800 text-[10px] font-mono text-obsidian-300 border border-obsidian-750">
                      SEC-SECRET
                    </span>
                  </div>

                  {/* Why this matters */}
                  <div className="space-y-1.5 text-xs text-obsidian-300">
                    <div className="font-semibold text-obsidian-100 flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-mono">
                      <AlertCircle className="w-3.5 h-3.5 text-severity-critical" />
                      Why This Matters
                    </div>
                    <p className="leading-relaxed text-obsidian-300">
                      Storing sensitive JWT secrets in source code allows anyone with repo access to forge authentication tokens and impersonate any user.
                    </p>
                  </div>

                  {/* Recommendation */}
                  <div className="space-y-1.5 text-xs text-obsidian-300">
                    <div className="font-semibold text-obsidian-100 flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-mono">
                      <Wrench className="w-3.5 h-3.5 text-brand-500" />
                      Recommendation
                    </div>
                    <p className="leading-relaxed text-obsidian-300">
                      Read secret credentials exclusively from environment variables via <code className="text-brand-400 font-mono">process.env.JWT_SECRET</code>.
                    </p>
                  </div>

                  {/* Unified Diff Box */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-obsidian-400">
                      Suggested Change (Unified Diff)
                    </div>
                    <div className="p-3 rounded-[5px] bg-obsidian-950 border border-obsidian-800 font-mono text-[11px] space-y-1">
                      <div className="text-red-400 bg-red-950/30 px-1.5 py-0.5 rounded-[3px]">
                        - const JWT_SECRET = "production_super_secret_key_12345";
                      </div>
                      <div className="text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded-[3px]">
                        + const JWT_SECRET = process.env.JWT_SECRET;
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  {demoFixed ? (
                    <div className="w-full py-2.5 px-4 rounded-[5px] bg-emerald-950/30 border border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Verified Patch Applied & Re-Analyzed
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      className="w-full"
                      size="md"
                      isLoading={isApplyingDemo}
                      onClick={handleApplyDemoFix}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Apply Fix & Re-Analyze
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section 04: Product Storytelling — The 7-Step Review Flow */}
      <section id="how-it-works" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full border-t border-obsidian-850 scroll-mt-24">
        <div className="max-w-3xl mb-12">
          <div className="text-[11px] font-mono text-brand-500 uppercase tracking-wider font-semibold">
            Product Storytelling
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-obsidian-50 mt-1">
            How CodeEagle Evaluates Every Line
          </h2>
          <p className="text-sm text-obsidian-400 mt-2">
            No vague AI hallucinations. CodeEagle adheres to a rigorous 7-step review cycle grounded directly in source code AST.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard
            icon={<Cpu className="w-5 h-5 text-brand-500" />}
            kicker="01 / AST"
            title="Babel AST Parsing"
            description="Source code is parsed into an abstract syntax tree. Rules evaluate actual program nodes, preventing false positives from regex string matching."
          />
          <FeatureCard
            icon={<ShieldCheck className="w-5 h-5 text-brand-500" />}
            kicker="02 / RULES"
            title="Deterministic Rules"
            description="13 static rules instantly flag hardcoded secrets, SQL injection, eval injection, prototype pollution, and React key index anti-patterns."
          />
          <FeatureCard
            icon={<Sparkles className="w-5 h-5 text-brand-500" />}
            kicker="03 / AI"
            title="Gemini Contextual AI"
            description="Gemini contextual reasoning inspects complex logic flows, evaluates boundary conditions, and generates human-readable senior PR review comments."
          />
          <FeatureCard
            icon={<Hash className="w-5 h-5 text-brand-500" />}
            kicker="04 / PATCH"
            title="SHA-256 Verified Fix"
            description="Safe string mutations are guarded by single-authority SHA-256 hashes. Applying a patch instantly mutates the code and re-runs the full review suite."
          />
        </div>
      </section>

      {/* 5. Section 05: Why CodeEagle: SEE · UNDERSTAND · FIX · VERIFY */}
      <section id="philosophy" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full border-t border-obsidian-850 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="text-[11px] font-mono text-brand-500 uppercase tracking-wider font-semibold">
            Core Philosophy
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-obsidian-50">
            See. Understand. Fix. Verify.
          </h2>
          <p className="text-sm text-obsidian-400">
            A complete review workflow that eliminates developer guesswork.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card3D maxTilt={1.5} className="p-6 bg-[#111111] border-[#262626] space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-[4px] bg-[#FF7A18]/15 border border-[#FF7A18]/30 text-[#FFA24D] font-mono text-xs font-bold flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                SEE
              </span>
              <h3 className="text-base font-bold text-[#F5F3EF]">
                Grounded Line-Anchored Precision
              </h3>
            </div>
            <p className="text-xs text-[#D4D0C8] leading-relaxed">
              Every finding points directly to an exact start line and end line in your file. Clicking any finding in the triage queue auto-scrolls the code canvas and activates synchronized gutter severity pips.
            </p>
            <div className="p-3 rounded-[5px] bg-[#0A0A0A] border border-[#222222] font-mono text-[11px] text-[#A6A29B]">
              <span className="text-[#FF4D4D]">●</span> Line 6: const JWT_SECRET = "production_super_secret_key_12345";
            </div>
          </Card3D>

          <Card3D maxTilt={1.5} className="p-6 bg-[#111111] border-[#262626] space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-[4px] bg-[#FF7A18]/15 border border-[#FF7A18]/30 text-[#FFA24D] font-mono text-xs font-bold flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" />
                UNDERSTAND
              </span>
              <h3 className="text-base font-bold text-[#F5F3EF]">
                Senior Staff PR Review Comments
              </h3>
            </div>
            <p className="text-xs text-[#D4D0C8] leading-relaxed">
              Findings are not cryptic compiler error codes. They are written as constructive, senior-level code review comments detailing the exact risk mechanism, exploit vector, and remediation advice.
            </p>
            <div className="p-3 rounded-[5px] bg-[#0A0A0A] border border-[#222222] text-xs text-[#D4D0C8]">
              <span className="text-[#FFA24D] font-semibold font-mono">Why this matters:</span> Token forging allows unauthenticated access across your entire API service.
            </div>
          </Card3D>

          <Card3D maxTilt={1.5} className="p-6 bg-[#111111] border-[#262626] space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-[4px] bg-[#FF7A18]/15 border border-[#FF7A18]/30 text-[#FFA24D] font-mono text-xs font-bold flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                FIX
              </span>
              <h3 className="text-base font-bold text-[#F5F3EF]">
                Executable Unified Diffs
              </h3>
            </div>
            <p className="text-xs text-[#D4D0C8] leading-relaxed">
              Review comments do not stop at theoretical advice. They provide concrete, syntactically verified unified diffs formatted for instant review and 1-click in-memory patch execution.
            </p>
            <div className="p-3 rounded-[5px] bg-[#0A0A0A] border border-[#222222] font-mono text-[11px] space-y-1">
              <div className="text-[#FF4D4D]">- const JWT_SECRET = "...";</div>
              <div className="text-[#38C793]">+ const JWT_SECRET = process.env.JWT_SECRET;</div>
            </div>
          </Card3D>

          <Card3D maxTilt={1.5} className="p-6 bg-[#111111] border-[#262626] space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-[4px] bg-[#FF7A18]/15 border border-[#FF7A18]/30 text-[#FFA24D] font-mono text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                VERIFY
              </span>
              <h3 className="text-base font-bold text-[#F5F3EF]">
                Automated Score Re-Auditing
              </h3>
            </div>
            <p className="text-xs text-[#D4D0C8] leading-relaxed">
              Applying a patch automatically re-analyzes the modified code against the entire 13-rule AST catalog and recalculates your audit score in real time.
            </p>
            <div className="p-3 rounded-[5px] bg-[#0A0A0A] border border-[#222222] font-mono text-xs text-[#38C793] flex items-center justify-between">
              <span>Score: 50 → 75 (+25 pts)</span>
              <span className="text-[#A6A29B] text-[11px]">1 Blocker Resolved</span>
            </div>
          </Card3D>
        </div>
      </section>

      {/* 6. Section 06: Analysis Engine Pipeline Architecture */}
      <section id="architecture" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full border-t border-obsidian-850 scroll-mt-24">
        <div className="max-w-3xl mb-12">
          <div className="text-[11px] font-mono text-brand-500 uppercase tracking-wider font-semibold">
            Technical Architecture
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-obsidian-50 mt-1">
            Engine Pipeline Schematic
          </h2>
          <p className="text-sm text-obsidian-400 mt-2">
            Deterministic rules guarantee zero false-negatives on known vulnerabilities, while Gemini handles nuanced semantic logic.
          </p>
        </div>

        {/* Technical Flowchart */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard
            icon={<FileCode className="w-5 h-5 text-brand-500" />}
            kicker="01 / INPUT"
            title="Source Code"
            description="JavaScript and JSX syntax streams ingested directly into memory without telemetry."
            footer={
              <span className="font-mono text-[10px] text-obsidian-400">
                Format: JS · JSX · ES2024
              </span>
            }
          />

          <FeatureCard
            icon={<Cpu className="w-5 h-5 text-brand-500" />}
            kicker="02 / PARSER"
            title="Babel AST Traversal"
            description="Deconstructs code into program nodes, eliminating regex string matching false positives."
            footer={
              <span className="font-mono text-[10px] text-obsidian-400">
                Engine: @babel/parser
              </span>
            }
          />

          <FeatureCard
            icon={<Sparkles className="w-5 h-5 text-brand-500" />}
            kicker="03 / ANALYZERS"
            title="13 Rules + Gemini AI"
            description="Deterministic rules evaluate AST nodes while Gemini models nuanced semantic control flow."
            className="border-brand-500/40 bg-brand-500/[0.03]"
            footer={
              <span className="font-mono text-[10px] text-brand-400">
                Hybrid: Deterministic + AI
              </span>
            }
          />

          <FeatureCard
            icon={<ShieldCheck className="w-5 h-5 text-brand-500" />}
            kicker="04 / OUTPUT"
            title="Verified Unified Diff"
            description="Cryptographic SHA-256 single-authority hashes validate edits before patch execution."
            footer={
              <span className="font-mono text-[10px] text-obsidian-400">
                Guard: SHA-256 Checksum
              </span>
            }
          />
        </div>

        {/* CodeEagle Technical Pillars Bento Grid */}
        <CodeEagleBentoShowcase className="mt-8" />
      </section>

      {/* 7. Section 07: Review Intelligence & Findings Severity Spectrum */}
      <section id="prioritization" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full border-t border-obsidian-850 scroll-mt-24">
        <div className="max-w-3xl mb-12">
          <div className="text-[11px] font-mono text-brand-500 uppercase tracking-wider font-semibold">
            Prioritization
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-obsidian-50 mt-1">
            Prioritized Findings Spectrum
          </h2>
          <p className="text-sm text-obsidian-400 mt-2">
            Not all code issues are created equal. CodeEagle classifies findings into 4 distinct severity tiers so developers fix blockers first.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard
            icon={<Lock className="w-5 h-5 text-severity-critical" />}
            badge={<SeverityBadge severity="CRITICAL" />}
            kicker="P0 Blocker"
            title="Security Flaws"
            description="Hardcoded secrets, unescaped SQL injections, eval() execution, and unverified token validations that immediately block deployment."
            className="border-severity-critical/30 hover:border-severity-critical/60"
            footer={
              <span className="text-[11px] font-mono text-severity-critical font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-severity-critical animate-pulse" />
                P0 Blocker · Immediate Fix
              </span>
            }
          />

          <FeatureCard
            icon={<Zap className="w-5 h-5 text-severity-high" />}
            badge={<SeverityBadge severity="HIGH" />}
            kicker="P1 High"
            title="Runtime Defects"
            description="Unhandled asynchronous rejections, mutable global state side-effects, and React array-index key mutations causing state corruption."
            className="border-severity-high/30 hover:border-severity-high/60"
            footer={
              <span className="text-[11px] font-mono text-severity-high font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-severity-high" />
                P1 High · Blocks Deployment
              </span>
            }
          />

          <FeatureCard
            icon={<Layers className="w-5 h-5 text-severity-medium" />}
            badge={<SeverityBadge severity="MEDIUM" />}
            kicker="P2 Quality"
            title="Complexity & Smells"
            description="Cyclomatic complexity exceeding thresholds, deeply nested branching logic, and unoptimized resource allocations."
            className="border-severity-medium/30 hover:border-severity-medium/60"
            footer={
              <span className="text-[11px] font-mono text-severity-medium font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-severity-medium" />
                P2 Quality · Refactoring Req.
              </span>
            }
          />

          <FeatureCard
            icon={<FileCode className="w-5 h-5 text-obsidian-400" />}
            badge={<SeverityBadge severity="LOW" />}
            kicker="P3 Style"
            title="Hygiene & Conventions"
            description="Unused identifier bindings, dead code paths, missing type annotations, and minor readability opportunities."
            className="border-obsidian-750 hover:border-obsidian-600"
            footer={
              <span className="text-[11px] font-mono text-obsidian-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-obsidian-500" />
                P3 Style · Advisory Only
              </span>
            }
          />
        </div>
      </section>

      {/* 8. Section 08: Technical Trust & Real Capabilities */}
      <section id="integrity" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full border-t border-obsidian-850 scroll-mt-24">
        <div className="max-w-3xl mb-12">
          <div className="text-[11px] font-mono text-brand-500 uppercase tracking-wider font-semibold">
            Technical Integrity
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-obsidian-50 mt-1">
            Built on Concrete Engineering Principles
          </h2>
          <p className="text-sm text-obsidian-400 mt-2">
            CodeEagle does not invent fake statistics, fake repositories, or fake AI capabilities. Every review is derived strictly from real AST parsing and contextual reasoning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureCard
            icon={<ShieldCheck className="w-5 h-5 text-brand-500" />}
            kicker="STATIC ENGINE"
            badge={<span className="font-mono text-xl font-bold text-brand-400">13</span>}
            title="Deterministic AST Rules"
            description="Babel-powered AST static verification detects hardcoded secrets, SQL injections, and prototype pollution with zero false positives."
            footer={
              <span className="font-mono text-[10px] text-obsidian-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                Deterministic AST static verification
              </span>
            }
          />

          <FeatureCard
            icon={<Hash className="w-5 h-5 text-brand-500" />}
            kicker="INTEGRITY GUARD"
            badge={<span className="font-mono text-base font-bold text-brand-400">SHA-256</span>}
            title="Single-Authority Hash Guard"
            description="Cryptographic checksum validation guarantees string mutations match the authoritative buffer, preventing stale source corruption."
            footer={
              <span className="font-mono text-[10px] text-obsidian-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Protects against stale source corruption
              </span>
            }
          />

          <FeatureCard
            icon={<Zap className="w-5 h-5 text-brand-500" />}
            kicker="LOCAL LATENCY"
            badge={<span className="font-mono text-xl font-bold text-brand-400">0 ms</span>}
            title="Local AST Execution"
            description="Static analyzer rules execute immediately in memory, returning instant baseline diagnostics before outbound network requests."
            footer={
              <span className="font-mono text-[10px] text-obsidian-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                Instant static analysis before network calls
              </span>
            }
          />
        </div>
      </section>

      {/* 9. Section 09: Final High-Contrast Call to Action */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-obsidian-50">
            Before you ship, let CodeEagle take a look.
          </h2>
          <p className="text-sm sm:text-base text-obsidian-400 max-w-xl mx-auto">
            Paste your JavaScript or JSX source code into CodeEagle. Receive immediate line-grounded findings, senior PR review comments, and verified patches.
          </p>
          <div className="pt-2">
            <Button
              size="lg"
              variant="primary"
              onClick={onStartReviewing}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start Reviewing
            </Button>
          </div>
        </div>
      </section>

      {/* 10. Complete Professional Developer Footer */}
      <footer className="mt-auto border-t border-[#1F1F1F] bg-[#0A0A0A] pt-14 pb-10 px-4 sm:px-8 w-full text-xs font-sans text-[#A6A29B]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Left Col: Brand + Tagline */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <CodeEagleLogo size={24} withText={true} withSubtitle={true} />
              </div>
              <p className="text-sm text-[#74716C] max-w-sm leading-relaxed">
                See what your code missed before your users do. Compiler-grade AST verification paired with contextual AI reasoning.
              </p>
            </div>

            {/* Right Cols: Product, Engine, Project */}
            <div className="md:col-span-7 grid grid-cols-3 gap-6">
              {/* PRODUCT */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#F5F3EF] font-semibold">
                  Product
                </h4>
                <ul className="space-y-2.5 text-xs">
                  <li>
                    <button
                      onClick={onStartReviewing}
                      className="hover:text-[#F5F3EF] transition-colors cursor-pointer"
                    >
                      Review
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={onOpenHistory}
                      className="hover:text-[#F5F3EF] transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>History</span>
                      {typeof historyCount === 'number' && historyCount > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#1C1C1C] text-[#D4D0C8] font-bold border border-[#262626]">
                          {historyCount}
                        </span>
                      )}
                    </button>
                  </li>
                  {onOpenHowItWorks && (
                    <li>
                      <button
                        onClick={onOpenHowItWorks}
                        className="hover:text-[#F5F3EF] transition-colors cursor-pointer"
                      >
                        How It Works
                      </button>
                    </li>
                  )}
                </ul>
              </div>

              {/* ENGINE */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#F5F3EF] font-semibold">
                  Engine
                </h4>
                <ul className="space-y-2.5 text-xs">
                  <li>
                    <a
                      href="#pipeline"
                      className="hover:text-[#F5F3EF] transition-colors cursor-pointer"
                    >
                      AST Analysis
                    </a>
                  </li>
                  <li>
                    <a
                      href="#philosophy"
                      className="hover:text-[#F5F3EF] transition-colors cursor-pointer"
                    >
                      AI Reasoning
                    </a>
                  </li>
                  <li>
                    <a
                      href="#workbench"
                      className="hover:text-[#F5F3EF] transition-colors cursor-pointer"
                    >
                      Verified Patches
                    </a>
                  </li>
                </ul>
              </div>

              {/* PROJECT */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#F5F3EF] font-semibold">
                  Project
                </h4>
                <ul className="space-y-2.5 text-xs">
                  <li>
                    <button
                      onClick={onOpenHowItWorks}
                      className="hover:text-[#F5F3EF] transition-colors cursor-pointer"
                    >
                      About
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={onStartReviewing}
                      className="hover:text-[#F5F3EF] transition-colors cursor-pointer"
                    >
                      Architecture
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[#1C1C1C] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-[#74716C]">
            <div>CodeEagle © 2026 · Single-Authority Safe Code Review</div>
            <div className="text-[#A6A29B]">Built for developers who ship.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
