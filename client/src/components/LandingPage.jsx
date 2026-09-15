import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  FileCode,
  RotateCcw,
} from 'lucide-react';
import { Button } from './ui/Button.jsx';
import { Card3D } from './ui/Card3D.jsx';
import { SeverityBadge } from './SeverityBadge.jsx';
import { LayoutTextFlip } from './ui/layout-text-flip.jsx';
import { Navbar } from './Navbar.jsx';
import { CodeEagleLogo } from './CodeEagleLogo.jsx';
import { CodeEagleBentoShowcase } from './ui/bento-product-features.tsx';
import { FeatureCard } from './ui/feature-card.tsx';
import { useTheme } from '@/context/ThemeContext.jsx';

export function LandingPage({
  onStartReviewing,
  onSelectScenarioAndStart,
  onOpenHistory,
  onOpenHowItWorks,
  historyCount = 0,
}) {
  const { isLight, isDark } = useTheme();
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#080808] text-slate-900 dark:text-[#F5F3EF] font-sans selection:bg-blue-500/20 dark:selection:bg-brand-500/20 selection:text-blue-700 dark:selection:text-brand-300 flex flex-col scroll-smooth">
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
          {/* Kinetic Editorial Headline */}
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-obsidian-50 leading-[1.12]">
            <span>Review your code.</span>
            <br />
            <span className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-slate-900 dark:text-obsidian-50">
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
                pillClassName="border-blue-300 dark:border-brand-500/40 bg-blue-50 dark:bg-brand-500/10 text-blue-700 dark:text-brand-400"
              />
            </span>
            <span>before you ship.</span>
          </h1>

          {/* Precision Technical Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-obsidian-400 leading-relaxed max-w-2xl mx-auto font-normal">
            Paste your code. Get line-by-line findings with fixes you can apply in one click.
          </p>

          {/* High-Contrast CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
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
          <div className="pt-8 border-t border-slate-200 dark:border-obsidian-800/80 max-w-2xl mx-auto">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-obsidian-400 mb-3.5 font-semibold">
              Try a live example:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                onClick={() => onSelectScenarioAndStart('insecure-login')}
                className="group flex items-center gap-2.5 px-3.5 py-2 rounded-[5px] bg-white dark:bg-obsidian-900 hover:bg-slate-100 dark:hover:bg-obsidian-850 border border-slate-200 dark:border-obsidian-750 hover:border-slate-300 dark:hover:border-obsidian-600 text-xs text-slate-700 dark:text-obsidian-300 hover:text-slate-900 dark:hover:text-obsidian-50 transition-all font-mono cursor-pointer shadow-xs"
              >
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded-[3px] bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50 font-bold">P0</span>
                <span className="font-semibold text-slate-900 dark:text-obsidian-100">auth.js</span>
                <span className="text-slate-500 dark:text-obsidian-400 text-[11px]">· Hardcoded Secret</span>
                <ArrowRight className="w-3 h-3 text-slate-400 dark:text-obsidian-500 group-hover:text-blue-600 dark:group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => onSelectScenarioAndStart('buggy-react')}
                className="group flex items-center gap-2.5 px-3.5 py-2 rounded-[5px] bg-white dark:bg-obsidian-900 hover:bg-slate-100 dark:hover:bg-obsidian-850 border border-slate-200 dark:border-obsidian-750 hover:border-slate-300 dark:hover:border-obsidian-600 text-xs text-slate-700 dark:text-obsidian-300 hover:text-slate-900 dark:hover:text-obsidian-50 transition-all font-mono cursor-pointer shadow-xs"
              >
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded-[3px] bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50 font-bold">P1</span>
                <span className="font-semibold text-slate-900 dark:text-obsidian-100">ActivityFeed.jsx</span>
                <span className="text-slate-500 dark:text-obsidian-400 text-[11px]">· Key Bug</span>
                <ArrowRight className="w-3 h-3 text-slate-400 dark:text-obsidian-500 group-hover:text-blue-600 dark:group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => onSelectScenarioAndStart('complex-function')}
                className="group flex items-center gap-2.5 px-3.5 py-2 rounded-[5px] bg-white dark:bg-obsidian-900 hover:bg-slate-100 dark:hover:bg-obsidian-850 border border-slate-200 dark:border-obsidian-750 hover:border-slate-300 dark:hover:border-obsidian-600 text-xs text-slate-700 dark:text-obsidian-300 hover:text-slate-900 dark:hover:text-obsidian-50 transition-all font-mono cursor-pointer shadow-xs"
              >
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded-[3px] bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 font-bold">P2</span>
                <span className="font-semibold text-slate-900 dark:text-obsidian-100">shippingFee.js</span>
                <span className="text-slate-500 dark:text-obsidian-400 text-[11px]">· Logic Edge Case</span>
                <ArrowRight className="w-3 h-3 text-slate-400 dark:text-obsidian-500 group-hover:text-blue-600 dark:group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
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
              <div className="text-[11px] font-mono text-blue-600 dark:text-brand-500 uppercase tracking-wider font-semibold">
                Live Demo
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-obsidian-50">
                See a review in action
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-600 dark:text-obsidian-400 flex items-center gap-2">
                <span>Status:</span>
                {demoFixed ? (
                  <span className="px-2.5 py-0.5 rounded-[4px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                    RESOLVED (100/100) · +25 pts
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-[4px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 font-semibold">
                    1 BLOCKER (50/100)
                  </span>
                )}
              </span>
              {demoFixed && (
                <button
                  onClick={handleResetDemo}
                  className="text-xs font-mono text-slate-700 dark:text-obsidian-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-[4px] bg-slate-100 dark:bg-[#141414] hover:bg-slate-200 dark:hover:bg-[#1C1C1C] border border-slate-200 dark:border-[#242424] inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3 h-3 text-blue-600 dark:text-brand-400" />
                  <span>Replay Demo</span>
                </button>
              )}
            </div>
          </div>

          {/* Workbench Frame with 3D Depth & Radial Specular Glare */}
          <Card3D
            maxTilt={1.0}
            withGlare={true}
            className="rounded-[10px] bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#242424] overflow-hidden shadow-xl dark:shadow-[0_24px_70px_-16px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.06),0_1px_0_rgba(255,255,255,0.08)_inset]"
          >
            {/* Workbench IDE Header Bar */}
            <div className="h-11 bg-slate-100 dark:bg-[#101010] px-4 flex items-center justify-between border-b border-slate-200 dark:border-[#202020] text-xs font-mono select-none">
              {/* Left: Active File Tab */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1 rounded-[4px] bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] text-xs font-mono font-medium text-slate-900 dark:text-[#F5F3EF]">
                  <FileCode className="w-3.5 h-3.5 text-blue-600 dark:text-brand-400" />
                  <span>auth.js</span>
                  <span className="text-[10px] text-slate-500 dark:text-obsidian-500">· JS · 27 lines</span>
                </div>
              </div>

              {/* Right: Engine Indicator Pill */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#242424] text-[11px] font-mono text-slate-700 dark:text-obsidian-300">
                  <span className="font-semibold text-slate-900 dark:text-obsidian-200">Babel AST Engine</span>
                  <span className="text-slate-400 dark:text-obsidian-600">·</span>
                  <span className="text-slate-500 dark:text-obsidian-400 text-[10px]">13 Rules Active</span>
                </div>
              </div>
            </div>

            {/* Workbench Grid: Left = Code Canvas, Right = Senior PR Review Comment */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-[#202020]">
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
                    <span className="text-obsidian-300">
                      <span className="text-[#6A9955] italic">// Authentication middleware</span>
                    </span>
                  </div>

                  {/* Line 4 */}
                  <div className="group flex items-center py-0.5 px-2 rounded-[3px] hover:bg-white/[0.03] transition-colors">
                    <span className="w-7 text-right pr-4 select-none text-obsidian-600 font-mono text-[11px]">4</span>
                    <span className="text-obsidian-300">
                      <span className="text-[#C586C0]">export</span> <span className="text-[#569CD6]">function</span> <span className="text-[#DCDCAA]">generateToken</span>(<span className="text-[#9CDCFE]">user</span>) &#123;
                    </span>
                  </div>

                  {/* Line 5 */}
                  <div className="group flex items-center py-0.5 px-2 rounded-[3px] hover:bg-white/[0.03] transition-colors">
                    <span className="w-7 text-right pr-4 select-none text-obsidian-600 font-mono text-[11px]">5</span>
                    <span className="text-obsidian-300 pl-4">
                      <span className="text-[#569CD6]">const</span> <span className="text-[#9CDCFE]">payload</span> = &#123; <span className="text-[#9CDCFE]">id</span>: <span className="text-[#9CDCFE]">user</span>.<span className="text-[#9CDCFE]">id</span>, <span className="text-[#9CDCFE]">role</span>: <span className="text-[#9CDCFE]">user</span>.<span className="text-[#9CDCFE]">role</span> &#125;;
                    </span>
                  </div>

                  {/* Line 6: Interactive Finding Line */}
                  <div
                    className={`group flex items-center py-0.5 px-2 rounded-[3px] transition-all duration-300 ${
                      demoFixed
                        ? 'bg-emerald-950/20 border-l-2 border-emerald-500'
                        : 'bg-red-950/25 border-l-2 border-red-500'
                    }`}
                  >
                    <span
                      className={`w-7 text-right pr-4 select-none font-mono text-[11px] font-bold ${
                        demoFixed ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      6
                    </span>
                    <span className="text-obsidian-100 pl-4 font-semibold">
                      {demoFixed ? (
                        <>
                          <span className="text-[#569CD6]">const</span> <span className="text-emerald-400 font-bold">JWT_SECRET</span> = <span className="text-[#9CDCFE]">process</span>.<span className="text-[#9CDCFE]">env</span>.<span className="text-emerald-400 font-bold">JWT_SECRET</span>;
                        </>
                      ) : (
                        <>
                          <span className="text-[#569CD6]">const</span> <span className="text-red-400 font-bold underline decoration-wavy decoration-red-500">JWT_SECRET</span> = <span className="text-[#CE9178]">&quot;production_super_secret_key_12345&quot;</span>;
                        </>
                      )}
                    </span>
                  </div>

                  {/* Line 7 */}
                  <div className="group flex items-center py-0.5 px-2 rounded-[3px] hover:bg-white/[0.03] transition-colors">
                    <span className="w-7 text-right pr-4 select-none text-obsidian-600 font-mono text-[11px]">7</span>
                    <span className="text-obsidian-300 pl-4">
                      <span className="text-[#C586C0]">return</span> <span className="text-[#9CDCFE]">jwt</span>.<span className="text-[#DCDCAA]">sign</span>(<span className="text-[#9CDCFE]">payload</span>, <span className="text-[#9CDCFE]">JWT_SECRET</span>, &#123; <span className="text-[#9CDCFE]">expiresIn</span>: <span className="text-[#CE9178]">'1h'</span> &#125;);
                    </span>
                  </div>

                  {/* Line 8 */}
                  <div className="group flex items-center py-0.5 px-2 rounded-[3px] hover:bg-white/[0.03] transition-colors">
                    <span className="w-7 text-right pr-4 select-none text-obsidian-600 font-mono text-[11px]">8</span>
                    <span className="text-obsidian-300">
                      &#125;
                    </span>
                  </div>
                </div>

                {/* Gutter footer status */}
                <div className="mt-6 pt-3 border-t border-[#1C1C1C] flex items-center justify-between text-[11px] font-mono text-obsidian-500 select-none">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        demoFixed ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-pulse'
                      }`}
                    />
                    <span>
                      {demoFixed
                        ? 'Zero vulnerabilities detected in current buffer'
                        : '1 high-severity blocker detected'}
                    </span>
                  </div>
                  {demoFixed && (
                    <button
                      onClick={handleResetDemo}
                      className="text-[11px] text-obsidian-400 hover:text-brand-400 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset Demo
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Senior PR Review Comment & Verified Patch */}
              <div className="lg:col-span-5 bg-slate-50 dark:bg-[#0C0C0C] p-5 sm:p-6 flex flex-col justify-between space-y-4">
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
                        <span className="font-mono text-[11px] text-slate-600 dark:text-obsidian-400 px-2 py-0.5 rounded-[4px] bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#222222]">
                          auth.js:6
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-[#F5F3EF] tracking-tight">
                        {demoFixed
                          ? 'Hardcoded Credential Resolved'
                          : 'Hardcoded credential in JWT_SECRET'}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-[4px] bg-white dark:bg-[#161616] text-[10px] font-mono font-semibold text-blue-600 dark:text-brand-400 border border-blue-200 dark:border-brand-500/30 tracking-wider">
                      SEC-SECRET
                    </span>
                  </div>

                  {/* Why this matters */}
                  <div className="p-3.5 rounded-[6px] bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#222222] hover:border-slate-300 dark:hover:border-[#2C2C2C] transition-colors space-y-1.5 shadow-xs dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                    <div className="font-mono text-[11px] font-semibold text-slate-800 dark:text-obsidian-200 uppercase tracking-wider">
                      Why This Matters
                    </div>
                    <p className="text-sm text-slate-600 dark:text-[#A6A29B] leading-relaxed">
                      Anyone with repo access could forge tokens and log in as any user.
                    </p>
                  </div>

                  {/* Recommendation */}
                  <div className="p-3.5 rounded-[6px] bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#222222] hover:border-slate-300 dark:hover:border-[#2C2C2C] transition-colors space-y-1.5 shadow-xs dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                    <div className="font-mono text-[11px] font-semibold text-slate-800 dark:text-obsidian-200 uppercase tracking-wider">
                      Recommendation
                    </div>
                    <p className="text-sm text-slate-600 dark:text-[#A6A29B] leading-relaxed">
                      Move the secret to an environment variable via{' '}
                      <code className="text-blue-600 dark:text-brand-400 font-mono bg-blue-50 dark:bg-brand-500/10 px-1.5 py-0.5 rounded-[3px] border border-blue-200 dark:border-brand-500/20">
                        process.env.JWT_SECRET
                      </code>.
                    </p>
                  </div>

                  {/* Unified Diff Box */}
                  <div className="rounded-[6px] border border-slate-200 dark:border-[#242424] bg-white dark:bg-[#0A0A0A] overflow-hidden shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                    <div className="px-3 py-1.5 bg-slate-100 dark:bg-[#121212] border-b border-slate-200 dark:border-[#202020] text-[10px] font-mono text-slate-600 dark:text-obsidian-400 flex items-center justify-between select-none">
                      <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-slate-700 dark:text-obsidian-300">
                        Suggested Change (Unified Diff)
                      </span>
                      <span className="flex items-center gap-1 text-[10px]">
                        <span className="text-red-500 font-semibold">-1</span>
                        <span className="text-slate-400 dark:text-obsidian-600">/</span>
                        <span className="text-emerald-500 font-semibold">+1</span>
                      </span>
                    </div>
                    <div className="font-mono text-[11px] p-1.5 space-y-1">
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 transition-colors">
                        <span className="text-red-500 font-bold select-none">-</span>
                        <span>const JWT_SECRET = &quot;production_super_secret_key_12345&quot;;</span>
                      </div>
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 transition-colors">
                        <span className="text-emerald-500 font-bold select-none">+</span>
                        <span>const JWT_SECRET = process.env.JWT_SECRET;</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  {demoFixed ? (
                    <div className="w-full py-3 px-4 rounded-[6px] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>Verified Patch Applied & Re-Analyzed</span>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400/80 bg-white dark:bg-emerald-900/40 px-2 py-0.5 rounded-[4px] border border-emerald-200 dark:border-emerald-700/60">
                        SHA-256 Valid
                      </span>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      className="w-full h-11 text-sm font-bold tracking-tight hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer group"
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

      {/* 4. Section 04: Product Storytelling — How a Review Happens */}
      <section id="how-it-works" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full border-t border-slate-200 dark:border-obsidian-850 scroll-mt-24">
        <div className="max-w-3xl mb-12">
          <div className="text-[11px] font-mono text-blue-600 dark:text-brand-500 uppercase tracking-wider font-semibold">
            How It Works
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-obsidian-50 mt-1">
            How a review happens
          </h2>
          <p className="text-sm text-slate-600 dark:text-obsidian-400 mt-2">
            From paste to fix in four steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard
            kicker="Step 1"
            title="Find real problems"
            description="Your code is parsed into a syntax tree — not searched with regex. No false alarms."
          />
          <FeatureCard
            kicker="Step 2"
            title="Know exactly what's wrong"
            description="13 built-in rules catch secrets, injections, and React anti-patterns on the first pass."
          />
          <FeatureCard
            kicker="Step 3"
            title="Understand why it matters"
            description="AI reads your logic and explains findings the way a senior engineer would."
          />
          <FeatureCard
            kicker="Step 4"
            title="Fix it safely"
            description="Every fix is checksummed before it touches your code. Apply it in one click."
          />
        </div>
      </section>

      {/* 5. Section 05: Why CodeEagle: SEE · UNDERSTAND · FIX · VERIFY */}
      <section id="philosophy" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full border-t border-slate-200 dark:border-obsidian-850 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="text-[11px] font-mono text-blue-600 dark:text-brand-500 uppercase tracking-wider font-semibold">
            Why CodeEagle
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-obsidian-50">
            See. Understand. Fix. Verify.
          </h2>
          <p className="text-sm text-slate-600 dark:text-obsidian-400">
            A complete review workflow that eliminates developer guesswork.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card3D maxTilt={1.5} className="p-6 bg-white dark:bg-[#111111] border-slate-200 dark:border-[#262626] space-y-4 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded-[4px] bg-blue-50 dark:bg-[#1A1A1A] border border-blue-200 dark:border-[#2E2E2E] text-blue-600 dark:text-brand-400 font-mono text-[11px] font-bold tracking-wider">
                01 / SEE
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-[#F5F3EF]">
                Find the exact line
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-[#D4D0C8] leading-relaxed">
              Every finding links to a specific line in your file. Click it and the editor scrolls there instantly.
            </p>
            <div className="p-3 rounded-[5px] bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#222222] font-mono text-[11px] text-slate-700 dark:text-[#A6A29B]">
              <span className="text-red-500 dark:text-red-400 font-semibold">Line 6: </span>const JWT_SECRET = &quot;production_super_secret_key_12345&quot;;
            </div>
          </Card3D>

          <Card3D maxTilt={1.5} className="p-6 bg-white dark:bg-[#111111] border-slate-200 dark:border-[#262626] space-y-4 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded-[4px] bg-blue-50 dark:bg-[#1A1A1A] border border-blue-200 dark:border-[#2E2E2E] text-blue-600 dark:text-brand-400 font-mono text-[11px] font-bold tracking-wider">
                02 / UNDERSTAND
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-[#F5F3EF]">
                Read a clear explanation
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-[#D4D0C8] leading-relaxed">
              Findings are written like a code review from a senior engineer — explaining why it matters and how to fix it, not just a compiler code.
            </p>
            <div className="p-3 rounded-[5px] bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#222222] text-xs text-slate-700 dark:text-[#D4D0C8]">
              <span className="text-blue-600 dark:text-brand-400 font-semibold font-mono">Why this matters: </span>Token forging allows unauthenticated access across your entire API service.
            </div>
          </Card3D>

          <Card3D maxTilt={1.5} className="p-6 bg-white dark:bg-[#111111] border-slate-200 dark:border-[#262626] space-y-4 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded-[4px] bg-blue-50 dark:bg-[#1A1A1A] border border-blue-200 dark:border-[#2E2E2E] text-blue-600 dark:text-brand-400 font-mono text-[11px] font-bold tracking-wider">
                03 / FIX
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-[#F5F3EF]">
                Apply a verified fix
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-[#D4D0C8] leading-relaxed">
              Each finding includes a diff you can apply in one click. The fix is verified before it touches your code.
            </p>
            <div className="p-3 rounded-[5px] bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#222222] font-mono text-[11px] space-y-1">
              <div className="text-red-500 dark:text-red-400">- const JWT_SECRET = &quot;...&quot;;</div>
              <div className="text-emerald-600 dark:text-emerald-400 font-semibold">+ const JWT_SECRET = process.env.JWT_SECRET;</div>
            </div>
          </Card3D>

          <Card3D maxTilt={1.5} className="p-6 bg-white dark:bg-[#111111] border-slate-200 dark:border-[#262626] space-y-4 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded-[4px] bg-blue-50 dark:bg-[#1A1A1A] border border-blue-200 dark:border-[#2E2E2E] text-blue-600 dark:text-brand-400 font-mono text-[11px] font-bold tracking-wider">
                04 / VERIFY
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-[#F5F3EF]">
                See your score improve
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-[#D4D0C8] leading-relaxed">
              After you apply a fix, the code is re-analyzed automatically. Your score updates in real time.
            </p>
            <div className="p-3 rounded-[5px] bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#222222] font-mono text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-between font-semibold">
              <span>Score: 50 → 75 (+25 pts)</span>
              <span className="text-slate-500 dark:text-[#A6A29B] text-[11px] font-normal">1 Blocker Resolved</span>
            </div>
          </Card3D>
        </div>
      </section>

      {/* 6. Section 06: Analysis Engine Pipeline Architecture */}
      <section id="architecture" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full border-t border-slate-200 dark:border-obsidian-850 scroll-mt-24">
        <div className="max-w-3xl mb-12">
          <div className="text-[11px] font-mono text-blue-600 dark:text-brand-500 uppercase tracking-wider font-semibold">
            Under the hood
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-obsidian-50 mt-1">
            How the engine works
          </h2>
          <p className="text-sm text-slate-600 dark:text-obsidian-400 mt-2">
            Two engines run in parallel — static rules for known patterns, AI for everything else.
          </p>
        </div>

        {/* Technical Flowchart */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard
            kicker="01 / INPUT"
            title="Source Code"
            description="JavaScript and JSX syntax streams parsed directly in memory without telemetry."
            footer={
              <span className="font-mono text-[10px] text-slate-500 dark:text-obsidian-400">
                Format: JS · JSX · ES2024
              </span>
            }
          />

          <FeatureCard
            kicker="02 / PARSER"
            title="Syntax Tree Traversal"
            description="Breaks code into program nodes to eliminate false positives from text matching."
            footer={
              <span className="font-mono text-[10px] text-slate-500 dark:text-obsidian-400">
                Engine: @babel/parser
              </span>
            }
          />

          <FeatureCard
            kicker="03 / ANALYZERS"
            title="Rules + Contextual AI"
            description="13 fast deterministic rules run first, then AI evaluates semantic logic and edge cases."
            className="border-blue-300 dark:border-brand-500/40 bg-blue-50/50 dark:bg-brand-500/[0.03]"
            footer={
              <span className="font-mono text-[10px] text-blue-700 dark:text-brand-400">
                Hybrid: Static Rules + AI
              </span>
            }
          />

          <FeatureCard
            kicker="04 / OUTPUT"
            title="Verified Diff"
            description="Cryptographic SHA-256 hashes ensure fixes match your code before applying."
            footer={
              <span className="font-mono text-[10px] text-slate-500 dark:text-obsidian-400">
                Guard: SHA-256 Checksum
              </span>
            }
          />
        </div>

        {/* CodeEagle Technical Pillars Bento Grid */}
        <CodeEagleBentoShowcase className="mt-8" />
      </section>

      {/* 7. Section 07: Review Intelligence & Findings Severity Spectrum */}
      <section id="prioritization" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full border-t border-slate-200 dark:border-obsidian-850 scroll-mt-24">
        <div className="max-w-3xl mb-12">
          <div className="text-[11px] font-mono text-blue-600 dark:text-brand-500 uppercase tracking-wider font-semibold">
            Severity levels
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-obsidian-50 mt-1">
            Not all issues are equal
          </h2>
          <p className="text-sm text-slate-600 dark:text-obsidian-400 mt-2">
            Findings are ranked by risk so you fix the dangerous ones first.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard
            badge={<SeverityBadge severity="CRITICAL" />}
            kicker="P0 Blocker"
            title="Security Flaws"
            description="Hardcoded credentials, SQL injection, and token vulnerabilities that immediately put users at risk."
            className="border-severity-critical/30 hover:border-severity-critical/60"
            footer={
              <span className="text-[11px] font-mono text-severity-critical font-semibold">
                P0 Blocker · Immediate Fix
              </span>
            }
          />

          <FeatureCard
            badge={<SeverityBadge severity="HIGH" />}
            kicker="P1 High"
            title="Runtime Defects"
            description="Unhandled promise rejections, mutable global state, and React key errors that cause runtime crashes."
            className="border-severity-high/30 hover:border-severity-high/60"
            footer={
              <span className="text-[11px] font-mono text-severity-high font-semibold">
                P1 High · Blocks Deployment
              </span>
            }
          />

          <FeatureCard
            badge={<SeverityBadge severity="MEDIUM" />}
            kicker="P2 Quality"
            title="Complexity & Smells"
            description="Functions that are too complex or deeply nested to maintain safely."
            className="border-severity-medium/30 hover:border-severity-medium/60"
            footer={
              <span className="text-[11px] font-mono text-severity-medium font-semibold">
                P2 Quality · Refactoring Req.
              </span>
            }
          />

          <FeatureCard
            badge={<SeverityBadge severity="LOW" />}
            kicker="P3 Style"
            title="Hygiene & Style"
            description="Unused variables, dead code paths, and opportunities to simplify."
            className="border-slate-200 dark:border-obsidian-750 hover:border-slate-300 dark:hover:border-obsidian-600"
            footer={
              <span className="text-[11px] font-mono text-slate-500 dark:text-obsidian-400 font-semibold">
                P3 Style · Advisory Only
              </span>
            }
          />
        </div>
      </section>

      {/* 8. Section 08: Technical Trust & Real Capabilities */}
      <section id="integrity" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full border-t border-slate-200 dark:border-obsidian-850 scroll-mt-24">
        <div className="max-w-3xl mb-12">
          <div className="text-[11px] font-mono text-blue-600 dark:text-brand-500 uppercase tracking-wider font-semibold">
            What makes it different
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-obsidian-50 mt-1">
            Built on real engineering
          </h2>
          <p className="text-sm text-slate-600 dark:text-obsidian-400 mt-2">
            Every review is derived strictly from real syntax tree parsing and contextual reasoning — no fake numbers or vanity metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureCard
            kicker="STATIC ENGINE"
            badge={<span className="font-mono text-xl font-bold text-blue-600 dark:text-brand-400">13</span>}
            title="Deterministic Rules"
            description="Built-in AST rules detect hardcoded secrets, injection flaws, and prototype pollution with zero false positives."
            footer={
              <span className="font-mono text-[10px] text-slate-500 dark:text-obsidian-400">
                Instant static verification
              </span>
            }
          />

          <FeatureCard
            kicker="INTEGRITY GUARD"
            badge={<span className="font-mono text-base font-bold text-blue-600 dark:text-brand-400">SHA-256</span>}
            title="Cryptographic Hash Guard"
            description="Every fix is checksummed before it touches your code. If the code changed since the fix was generated, it won't apply."
            footer={
              <span className="font-mono text-[10px] text-slate-500 dark:text-obsidian-400">
                Protects against stale code corruption
              </span>
            }
          />

          <FeatureCard
            kicker="LOCAL LATENCY"
            badge={<span className="font-mono text-xl font-bold text-blue-600 dark:text-brand-400">0 ms</span>}
            title="Instant Local Analysis"
            description="Static rules execute immediately in memory, returning baseline findings before network calls finish."
            footer={
              <span className="font-mono text-[10px] text-slate-500 dark:text-obsidian-400">
                Zero-latency first pass
              </span>
            }
          />
        </div>
      </section>

      {/* 9. Section 09: Final High-Contrast Call to Action */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-obsidian-50">
            Before you ship, let CodeEagle take a look.
          </h2>
          <p className="text-base text-slate-600 dark:text-obsidian-400 max-w-xl mx-auto">
            Paste your code, see what's wrong, and fix it — all in one place.
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
      <footer className="mt-auto border-t border-slate-200 dark:border-[#1F1F1F] bg-white dark:bg-[#0A0A0A] pt-14 pb-10 px-4 sm:px-8 w-full text-xs font-sans text-slate-600 dark:text-[#A6A29B]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Left Col: Brand + Tagline */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <CodeEagleLogo size={36} withText={true} withSubtitle={true} dark={isDark} />
              </div>
              <p className="text-sm text-slate-500 dark:text-[#74716C] max-w-sm leading-relaxed">
                AI-powered code review that finds real problems and helps you fix them.
              </p>
            </div>

            {/* Right Cols: Product, Engine, Project */}
            <div className="md:col-span-7 grid grid-cols-3 gap-6">
              {/* PRODUCT */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-900 dark:text-[#F5F3EF] font-semibold">
                  Product
                </h4>
                <ul className="space-y-2.5 text-xs">
                  <li>
                    <button
                      onClick={onStartReviewing}
                      className="hover:text-slate-900 dark:hover:text-[#F5F3EF] transition-colors cursor-pointer"
                    >
                      Review
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={onOpenHistory}
                      className="hover:text-slate-900 dark:hover:text-[#F5F3EF] transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>History</span>
                      {typeof historyCount === 'number' && historyCount > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-[#1C1C1C] text-slate-700 dark:text-[#D4D0C8] font-bold border border-slate-200 dark:border-[#262626]">
                          {historyCount}
                        </span>
                      )}
                    </button>
                  </li>
                  {onOpenHowItWorks && (
                    <li>
                      <button
                        onClick={onOpenHowItWorks}
                        className="hover:text-slate-900 dark:hover:text-[#F5F3EF] transition-colors cursor-pointer"
                      >
                        How It Works
                      </button>
                    </li>
                  )}
                </ul>
              </div>

              {/* ENGINE */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-900 dark:text-[#F5F3EF] font-semibold">
                  Engine
                </h4>
                <ul className="space-y-2.5 text-xs">
                  <li>
                    <a
                      href="#architecture"
                      className="hover:text-slate-900 dark:hover:text-[#F5F3EF] transition-colors cursor-pointer"
                    >
                      AST Analysis
                    </a>
                  </li>
                  <li>
                    <a
                      href="#philosophy"
                      className="hover:text-slate-900 dark:hover:text-[#F5F3EF] transition-colors cursor-pointer"
                    >
                      AI Reasoning
                    </a>
                  </li>
                  <li>
                    <a
                      href="#workbench"
                      className="hover:text-slate-900 dark:hover:text-[#F5F3EF] transition-colors cursor-pointer"
                    >
                      Verified Patches
                    </a>
                  </li>
                </ul>
              </div>

              {/* PROJECT */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-900 dark:text-[#F5F3EF] font-semibold">
                  Project
                </h4>
                <ul className="space-y-2.5 text-xs">
                  <li>
                    <button
                      onClick={onOpenHowItWorks}
                      className="hover:text-slate-900 dark:hover:text-[#F5F3EF] transition-colors cursor-pointer"
                    >
                      About
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        const el = document.getElementById('architecture');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="hover:text-slate-900 dark:hover:text-[#F5F3EF] transition-colors cursor-pointer"
                    >
                      Architecture
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-200 dark:border-[#1C1C1C] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-slate-500 dark:text-[#74716C]">
            <div>CodeEagle © 2026</div>
            <div className="text-slate-600 dark:text-[#A6A29B]">Built for developers who ship.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
