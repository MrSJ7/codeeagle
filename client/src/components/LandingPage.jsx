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
              <span className="text-xs font-mono text-obsidian-400 flex items-center gap-2">
                <span>Status:</span>
                {demoFixed ? (
                  <span className="px-2.5 py-0.5 rounded-[4px] bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 font-semibold flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    RESOLVED (100/100) · +25 pts
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-[4px] bg-red-950/40 border border-red-800/60 text-red-300 font-semibold flex items-center gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.25)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    1 BLOCKER (50/100)
                  </span>
                )}
              </span>
              {demoFixed && (
                <button
                  onClick={handleResetDemo}
                  className="text-xs font-mono text-obsidian-300 hover:text-white px-2.5 py-1 rounded-[4px] bg-[#141414] hover:bg-[#1C1C1C] border border-[#242424] inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3 h-3 text-brand-400" />
                  <span>Replay Demo</span>
                </button>
              )}
            </div>
          </div>

          {/* Workbench Frame with 3D Depth & Radial Specular Glare */}
          <Card3D
            maxTilt={1.0}
            withGlare={true}
            className="rounded-[10px] bg-[#0A0A0A] border border-[#242424] overflow-hidden shadow-[0_24px_70px_-16px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.06),0_1px_0_rgba(255,255,255,0.08)_inset]"
          >
            {/* Workbench IDE Header Bar */}
            <div className="h-11 bg-[#101010] px-4 flex items-center justify-between border-b border-[#202020] text-xs font-mono select-none">
              {/* Left: Window Traffic Controls + Active File Tab */}
              <div className="flex items-center gap-3.5">
                <div className="flex items-center gap-1.5 pr-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]/80 border border-[#E0443E]/50" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/80 border border-[#DEA123]/50" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]/80 border border-[#1AAB29]/50" />
                </div>

                <div className="flex items-center gap-2 px-3 py-1 rounded-[5px] bg-[#0A0A0A] border border-[#262626] text-xs font-mono font-medium text-[#F5F3EF] shadow-[0_1px_3px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.04)_inset]">
                  <FileCode className="w-3.5 h-3.5 text-brand-400" />
                  <span>auth.js</span>
                  <span className="text-[10px] text-obsidian-500">· JS · 27 lines</span>
                </div>
              </div>

              {/* Right: Engine Indicator Pill with Pulsating Status */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-[#141414] border border-[#242424] text-[11px] font-mono text-obsidian-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse shadow-[0_0_6px_rgba(255,122,24,0.6)]" />
                  <span className="font-semibold text-obsidian-200">Babel AST Engine</span>
                  <span className="text-obsidian-600">·</span>
                  <span className="text-obsidian-400 text-[10px]">13 Rules Active</span>
                </div>
              </div>
            </div>

            {/* Workbench Grid: Left = Code Canvas, Right = Senior PR Review Comment */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#202020]">
              {/* Left Column: Monaco-Style Code Canvas */}
              <div className="lg:col-span-7 bg-[#070707] font-mono text-xs overflow-x-auto select-text p-4 sm:p-5">
                <div className="space-y-0.5">
                  {/* Line 1 */}
                  <div className="group flex items-center py-0.5 px-2 rounded-[3px] hover:bg-white/[0.03] transition-colors">
                    <span className="w-7 text-right pr-4 select-none text-obsidian-600 font-mono text-[11px]">1</span>
                    <span className="text-obsidian-300">
                      <span className="text-[#C586C0]">import</span> <span className="text-[#9CDCFE]">jwt</span> <span className="text-[#C586C0]">from</span> <span className="text-[#CE9178]">'jsonwebtoken'</span>;
                    </span>
                  </div>

                  {/* Line 2 */}
                  <div className="group flex items-center py-0.5 px-2 rounded-[3px] hover:bg-white/[0.03] transition-colors">
                    <span className="w-7 text-right pr-4 select-none text-obsidian-600 font-mono text-[11px]">2</span>
                    <span className="text-obsidian-300">
                      <span className="text-[#C586C0]">import</span> <span className="text-[#9CDCFE]">bcrypt</span> <span className="text-[#C586C0]">from</span> <span className="text-[#CE9178]">'bcrypt'</span>;
                    </span>
                  </div>

                  {/* Line 3 */}
                  <div className="group flex items-center py-0.5 px-2 rounded-[3px] hover:bg-white/[0.03] transition-colors">
                    <span className="w-7 text-right pr-4 select-none text-obsidian-600 font-mono text-[11px]">3</span>
                    <span className="text-[#6A9955] italic">// Authentication middleware</span>
                  </div>

                  {/* Line 4 */}
                  <div className="group flex items-center py-0.5 px-2 rounded-[3px] hover:bg-white/[0.03] transition-colors">
                    <span className="w-7 text-right pr-4 select-none text-obsidian-600 font-mono text-[11px]">4</span>
                    <span className="text-obsidian-200">
                      <span className="text-[#C586C0]">export</span> <span className="text-[#569CD6]">function</span> <span className="text-[#DCDCAA]">generateToken</span>(<span className="text-[#9CDCFE]">user</span>) &#123;
                    </span>
                  </div>

                  {/* Line 5 */}
                  <div className="group flex items-center py-0.5 px-2 rounded-[3px] hover:bg-white/[0.03] transition-colors">
                    <span className="w-7 text-right pr-4 select-none text-obsidian-600 font-mono text-[11px]">5</span>
                    <span className="text-obsidian-200 pl-4">
                      <span className="text-[#569CD6]">const</span> <span className="text-[#9CDCFE]">payload</span> = &#123; <span className="text-[#9CDCFE]">id</span>: <span className="text-[#9CDCFE]">user</span>.<span className="text-[#9CDCFE]">id</span>, <span className="text-[#9CDCFE]">role</span>: <span className="text-[#9CDCFE]">user</span>.<span className="text-[#9CDCFE]">role</span> &#125;;
                    </span>
                  </div>

                  {/* Line 6: The Highlighted Flaw */}
                  <div
                    className={`flex items-center py-1.5 px-2 rounded-[4px] transition-all duration-300 ${
                      demoFixed
                        ? 'bg-emerald-950/25 border border-emerald-500/40 text-emerald-200 shadow-[0_0_24px_rgba(16,185,129,0.12)_inset]'
                        : 'bg-red-950/30 border border-red-500/40 text-red-200 shadow-[0_0_24px_rgba(239,68,68,0.15)_inset]'
                    }`}
                  >
                    <div className="w-7 flex items-center justify-end pr-2 select-none">
                      <span className={`w-1.5 h-3.5 rounded-full mr-1.5 ${demoFixed ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]' : 'bg-severity-critical animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.7)]'}`} />
                      <span className="font-bold text-obsidian-300 font-mono text-[11px]">6</span>
                    </div>
                    <span className="pl-3 font-semibold tracking-wide">
                      {demoFixed ? (
                        <span>
                          <span className="text-[#569CD6]">const</span> <span className="text-emerald-400 font-bold">JWT_SECRET</span> = <span className="text-[#9CDCFE]">process</span>.<span className="text-[#9CDCFE]">env</span>.<span className="text-emerald-400 font-bold">JWT_SECRET</span>;
                        </span>
                      ) : (
                        <span>
                          <span className="text-[#569CD6]">const</span> <span className="text-red-400 font-bold underline decoration-wavy decoration-red-500">JWT_SECRET</span> = <span className="text-[#CE9178]">"production_super_secret_key_12345"</span>;
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Line 7 */}
                  <div className="group flex items-center py-0.5 px-2 rounded-[3px] hover:bg-white/[0.03] transition-colors">
                    <span className="w-7 text-right pr-4 select-none text-obsidian-600 font-mono text-[11px]">7</span>
                    <span className="text-obsidian-200 pl-4">
                      <span className="text-[#C586C0]">return</span> <span className="text-[#9CDCFE]">jwt</span>.<span className="text-[#DCDCAA]">sign</span>(<span className="text-[#9CDCFE]">payload</span>, <span className="text-[#9CDCFE]">JWT_SECRET</span>, &#123; <span className="text-[#9CDCFE]">expiresIn</span>: <span className="text-[#CE9178]">'1h'</span> &#125;);
                    </span>
                  </div>

                  {/* Line 8 */}
                  <div className="group flex items-center py-0.5 px-2 rounded-[3px] hover:bg-white/[0.03] transition-colors">
                    <span className="w-7 text-right pr-4 select-none text-obsidian-600 font-mono text-[11px]">8</span>
                    <span className="text-obsidian-300">&#125;</span>
                  </div>
                </div>

                {/* Live Diff Mutation Notice */}
                {demoFixed && (
                  <div className="mt-5 p-3.5 rounded-[6px] bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 flex items-center justify-between shadow-[0_4px_16px_rgba(16,185,129,0.15)] animate-in fade-in duration-300">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs font-sans">
                        Patch verified via SHA-256 hash and applied. Score improved: <strong>50 → 75 (+25 pts)</strong>
                      </span>
                    </div>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-[4px] bg-emerald-900/50 text-emerald-200 border border-emerald-700/60 shrink-0">
                      1 BLOCKER RESOLVED
                    </span>
                  </div>
                )}
              </div>

              {/* Right Column: Senior PR Review Comment & Verified Patch */}
              <div className="lg:col-span-5 bg-[#0C0C0C] p-5 sm:p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  {/* Finding Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        {demoFixed ? (
                          <SeverityBadge severity="RESOLVED" />
                        ) : (
                          <SeverityBadge severity="CRITICAL" />
                        )}
                        <span className="font-mono text-[11px] text-obsidian-400 px-2 py-0.5 rounded-[4px] bg-[#141414] border border-[#222222]">
                          auth.js:6
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#F5F3EF] tracking-tight">
                        {demoFixed
                          ? 'Hardcoded Credential Resolved'
                          : 'Hardcoded credential in JWT_SECRET'}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-[4px] bg-[#161616] text-[10px] font-mono font-semibold text-brand-400 border border-brand-500/30 tracking-wider">
                      SEC-SECRET
                    </span>
                  </div>

                  {/* Why this matters */}
                  <div className="p-3.5 rounded-[6px] bg-[#111111] border border-[#222222] hover:border-[#2C2C2C] transition-colors space-y-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                    <div className="font-mono text-[11px] font-semibold text-obsidian-200 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-severity-critical shrink-0" />
                      Why This Matters
                    </div>
                    <p className="text-xs text-[#A6A29B] leading-relaxed">
                      Storing sensitive JWT secrets in source code allows anyone with repo access to forge authentication tokens and impersonate any user.
                    </p>
                  </div>

                  {/* Recommendation */}
                  <div className="p-3.5 rounded-[6px] bg-[#111111] border border-[#222222] hover:border-[#2C2C2C] transition-colors space-y-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                    <div className="font-mono text-[11px] font-semibold text-obsidian-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      Recommendation
                    </div>
                    <p className="text-xs text-[#A6A29B] leading-relaxed">
                      Read secret credentials exclusively from environment variables via{' '}
                      <code className="text-brand-400 font-mono bg-brand-500/10 px-1.5 py-0.5 rounded-[3px] border border-brand-500/20">
                        process.env.JWT_SECRET
                      </code>.
                    </p>
                  </div>

                  {/* Unified Diff Box */}
                  <div className="rounded-[6px] border border-[#242424] bg-[#0A0A0A] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                    <div className="px-3 py-1.5 bg-[#121212] border-b border-[#202020] text-[10px] font-mono text-obsidian-400 flex items-center justify-between select-none">
                      <span className="flex items-center gap-1.5 font-medium text-obsidian-300">
                        <GitBranch className="w-3 h-3 text-brand-400" />
                        Suggested Change (Unified Diff)
                      </span>
                      <span className="flex items-center gap-1 text-[10px]">
                        <span className="text-red-400 font-semibold">-1</span>
                        <span className="text-obsidian-600">/</span>
                        <span className="text-emerald-400 font-semibold">+1</span>
                      </span>
                    </div>
                    <div className="font-mono text-[11px] p-1.5 space-y-1">
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-red-950/20 border border-red-500/30 text-red-300 hover:bg-red-950/35 transition-colors">
                        <span className="text-red-400 font-bold select-none">-</span>
                        <span>const JWT_SECRET = "production_super_secret_key_12345";</span>
                      </div>
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/35 transition-colors">
                        <span className="text-emerald-400 font-bold select-none">+</span>
                        <span>const JWT_SECRET = process.env.JWT_SECRET;</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  {demoFixed ? (
                    <div className="w-full py-3 px-4 rounded-[6px] bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-[0_4px_16px_rgba(16,185,129,0.2),0_1px_0_rgba(255,255,255,0.06)_inset] animate-in fade-in duration-200">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Verified Patch Applied & Re-Analyzed</span>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-400/80 bg-emerald-900/40 px-2 py-0.5 rounded-[4px] border border-emerald-700/60">
                        SHA-256 Valid
                      </span>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      className="w-full h-11 text-xs font-bold tracking-tight shadow-[0_4px_20px_rgba(255,122,24,0.4),0_1px_0_rgba(255,255,255,0.3)_inset] hover:shadow-[0_6px_28px_rgba(255,122,24,0.55),0_1px_0_rgba(255,255,255,0.4)_inset] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer group"
                      size="md"
                      isLoading={isApplyingDemo}
                      onClick={handleApplyDemoFix}
                      rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    >
                      Apply Fix & Re-Analyze
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card3D>
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
