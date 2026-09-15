import React, { useState } from 'react';
import { CodeEagleLogo } from './CodeEagleLogo.jsx';
import {
  ArrowRight,
  ShieldAlert,
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
  ShieldCheck,
  AlertTriangle,
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
    <div className="min-h-screen bg-[#F5F7F6] text-[#161918] font-sans selection:bg-[#DDF7EC] selection:text-[#065F42] flex flex-col">
      {/* 1. Product Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Brand Mark */}
          <div className="flex items-center gap-2.5">
            <CodeEagleLogo size={28} />
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-base tracking-tight text-stone-900 font-sans">
                CodeEagle
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#087A54] bg-[#DDF7EC] px-1.5 py-0.5 rounded font-medium border border-[#0F9F6E]/30 hidden sm:inline-block">
                AI Code Review
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-600 font-sans">
            <a
              href="#how-it-works"
              className="hover:text-stone-900 transition-colors"
            >
              How it works
            </a>
            <a
              href="#why-codeeagle"
              className="hover:text-stone-900 transition-colors"
            >
              Why CodeEagle
            </a>
            <a
              href="#product-values"
              className="hover:text-stone-900 transition-colors"
            >
              Architecture
            </a>
            <button
              type="button"
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 hover:text-stone-900 transition-colors"
            >
              <History className="w-3.5 h-3.5 text-stone-400" />
              <span>History</span>
              {historyCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
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
              className="group flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded bg-[#0F9F6E] hover:bg-[#087A54] text-white text-xs font-semibold shadow-2xs transition-all active:scale-[0.99]"
            >
              <span>Start Reviewing</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-12 sm:pt-16 pb-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left: Product Headline & Direct Value */}
          <div className="max-w-xl text-left space-y-5">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#DDF7EC] border border-[#0F9F6E]/40 text-[#087A54] text-xs font-medium font-sans">
              <Sparkles className="w-3.5 h-3.5 text-[#0F9F6E]" />
              <span>Static precision. AI reasoning. Verified fixes.</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-950 font-sans leading-[1.12]">
              Review your code. <br />
              <span className="text-[#087A54]">Catch problems</span> before they ship.
            </h1>

            {/* Subhead */}
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-sans">
              CodeEagle pairs deterministic AST static analysis with Gemini semantic reasoning to detect security vulnerabilities, logic bugs, and quality risks—with verified, one-click safe patches.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-3.5 pt-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => onStartReviewing()}
                className="flex items-center gap-2 px-5 py-2.5 rounded bg-[#0F9F6E] hover:bg-[#087A54] text-white text-sm font-semibold shadow-2xs transition-all active:scale-[0.99]"
              >
                <span>Start Reviewing</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#how-it-works"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded bg-white hover:bg-stone-50 text-stone-700 text-sm font-medium border border-stone-200 transition-colors shadow-2xs"
              >
                <span>How it works</span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              </a>
            </div>

            {/* Feature Checkpoints */}
            <div className="pt-3 flex items-center gap-5 text-xs text-stone-500 font-mono flex-wrap">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#0F9F6E]" />
                <span>Zero untrusted code execution</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#0F9F6E]" />
                <span>SHA-256 stale-source guarded</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#0F9F6E]" />
                <span>Authoritative re-analysis</span>
              </div>
            </div>
          </div>

          {/* Right: Miniature Product Preview Representation */}
          <div className="w-full max-w-lg lg:max-w-md shrink-0">
            <div className="rounded-lg border border-[#242826] bg-[#171A19] shadow-xl overflow-hidden font-mono text-xs select-none">
              {/* Preview Window Titlebar */}
              <div className="px-3.5 py-2.5 bg-[#121514] border-b border-[#242826] flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[#8F9E94] font-medium ml-1">auth.js · JavaScript</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#0F9F6E] bg-[#0F9F6E]/15 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    82 / 100
                  </span>
                </div>
              </div>

              {/* Preview Code View */}
              <div className="p-3.5 space-y-1 text-[11.5px] leading-relaxed text-[#E8EEE9]">
                <div className="flex gap-3 text-[#5E6963]">
                  <span className="w-4 text-right">4</span>
                  <span className="text-[#8F9E94]">const router = express.Router();</span>
                </div>
                <div className="flex gap-3 text-[#5E6963]">
                  <span className="w-4 text-right">5</span>
                  <span className="text-[#8F9E94]"></span>
                </div>
                {/* Highlighted Vulnerable Line with Critical Dot */}
                <div className="flex gap-3 bg-[#D92D20]/15 -mx-3.5 px-3.5 py-0.5 border-l-2 border-[#D92D20]">
                  <span className="w-4 text-right text-[#D92D20] font-bold flex items-center justify-end gap-1">
                    <span className="text-[8px]">●</span>
                    <span>6</span>
                  </span>
                  <span className="text-red-200">
                    const JWT_SECRET = <span className="text-red-300">"super_secret_jwt_key_998822"</span>;
                  </span>
                </div>
                <div className="flex gap-3 text-[#5E6963]">
                  <span className="w-4 text-right">7</span>
                  <span className="text-[#8F9E94]"></span>
                </div>
                <div className="flex gap-3 text-[#5E6963]">
                  <span className="w-4 text-right">8</span>
                  <span className="text-[#8F9E94]">router.post('/login', async (req, res) =&gt; &#123;</span>
                </div>
              </div>

              {/* Contextual PR Review Comment Overlay */}
              <div className="m-3 p-3 rounded bg-[#1C201E] border border-[#2D3330] space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono uppercase font-bold text-[#D92D20] bg-red-950/40 border border-red-800/40 px-1 py-0.2 rounded">
                      CRITICAL
                    </span>
                    <span className="text-[9px] font-mono text-[#8F9E94] uppercase">
                      Security
                    </span>
                  </div>
                  <span className="text-[10px] text-[#5E6963] font-mono">auth.js:6</span>
                </div>

                <div className="text-xs font-semibold text-[#E8EEE9] font-sans">
                  Hardcoded credential in 'JWT_SECRET'
                </div>

                <p className="text-[11px] text-[#A0AEA4] font-sans leading-relaxed">
                  Plaintext token exposed in source code. Can be leaked into git history or build artifacts.
                </p>

                {/* Diff Block */}
                <div className="rounded bg-[#121514] border border-[#242826] p-2 text-[10.5px] font-mono space-y-0.5">
                  <div className="text-red-400">
                    - const JWT_SECRET = "super_secret_jwt_key_998822";
                  </div>
                  <div className="text-[#34D399]">
                    + const JWT_SECRET = process.env.JWT_SECRET;
                  </div>
                </div>

                {/* Action button inside preview */}
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] text-[#0F9F6E] font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#0F9F6E]" />
                    <span>Safe patch verified</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectScenarioAndStart('insecure-login')}
                    className="px-2.5 py-1 rounded bg-[#0F9F6E] hover:bg-[#087A54] text-white text-[11px] font-semibold transition-colors"
                  >
                    Preview Fix →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section: Why CodeEagle (4 Pillars) */}
      <section id="why-codeeagle" className="py-16 bg-white border-y border-stone-200/80 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#087A54]">
              Why CodeEagle
            </h2>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 font-sans">
              Engineered for developer trust.
            </p>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed font-sans">
              Generic LLM prompts hallucinate line numbers, miss syntax errors, and suggest unsafe modifications. CodeEagle bridges deterministic AST static analysis with structured semantic reasoning.
            </p>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="p-5 rounded-lg bg-[#F5F7F6]/60 border border-stone-200/80 space-y-3">
              <div className="w-8 h-8 rounded bg-white border border-stone-200 flex items-center justify-center text-[#0F9F6E] shadow-2xs">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-stone-900 font-sans">
                Deterministic AST Baseline
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                In-memory Babel AST parser extracts exact complexity metrics, nesting levels, and evaluates 13 security/quality rules with zero hallucination.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-5 rounded-lg bg-[#F5F7F6]/60 border border-stone-200/80 space-y-3">
              <div className="w-8 h-8 rounded bg-white border border-stone-200 flex items-center justify-center text-[#0F9F6E] shadow-2xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-stone-900 font-sans">
                Contextual AI Reasoning
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Google Gemini analyzes semantic logic, asynchronous race conditions, and architectural concerns using source-grounded line references and strict JSON schemas.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-5 rounded-lg bg-[#F5F7F6]/60 border border-stone-200/80 space-y-3">
              <div className="w-8 h-8 rounded bg-white border border-stone-200 flex items-center justify-center text-[#0F9F6E] shadow-2xs">
                <Wrench className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-stone-900 font-sans">
                Verified Safe Patching
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Every patch must pass SHA-256 stale-source verification, verbatim character matching, and line range boundaries before you confirm application.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-5 rounded-lg bg-[#F5F7F6]/60 border border-stone-200/80 space-y-3">
              <div className="w-8 h-8 rounded bg-white border border-stone-200 flex items-center justify-center text-[#0F9F6E] shadow-2xs">
                <History className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-stone-900 font-sans">
                Traceable Review History
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Review records are stored with pre/post patch comparisons. Restore past audits as pure strings without re-executing analysis or losing work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section: How It Works (5-Step Progressive Workflow) */}
      <section id="how-it-works" className="py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#087A54]">
              Workflow
            </h2>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 font-sans">
              How CodeEagle works
            </p>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed font-sans">
              From pasting code to verifying patch resolution in seconds.
            </p>
          </div>

          {/* 5-Step Process Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Step 1 */}
            <div className="p-4 rounded-lg bg-white border border-stone-200/90 space-y-2.5 relative">
              <span className="text-xs font-mono font-bold text-[#0F9F6E] bg-[#DDF7EC] px-2 py-0.5 rounded">
                01
              </span>
              <h3 className="text-xs font-semibold text-stone-900 font-sans">
                Paste your code
              </h3>
              <p className="text-[11px] text-stone-500 leading-relaxed font-sans">
                Paste JavaScript or JSX into the editor, or choose a sample scenario.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-lg bg-white border border-stone-200/90 space-y-2.5 relative">
              <span className="text-xs font-mono font-bold text-[#0F9F6E] bg-[#DDF7EC] px-2 py-0.5 rounded">
                02
              </span>
              <h3 className="text-xs font-semibold text-stone-900 font-sans">
                Run dual review
              </h3>
              <p className="text-[11px] text-stone-500 leading-relaxed font-sans">
                Static AST rules execute in-memory; Gemini runs contextual semantic checks.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-lg bg-white border border-stone-200/90 space-y-2.5 relative">
              <span className="text-xs font-mono font-bold text-[#0F9F6E] bg-[#DDF7EC] px-2 py-0.5 rounded">
                03
              </span>
              <h3 className="text-xs font-semibold text-stone-900 font-sans">
                Inspect findings
              </h3>
              <p className="text-[11px] text-stone-500 leading-relaxed font-sans">
                Browse prioritized issues with synchronized line highlights and PR comments.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-lg bg-white border border-stone-200/90 space-y-2.5 relative">
              <span className="text-xs font-mono font-bold text-[#0F9F6E] bg-[#DDF7EC] px-2 py-0.5 rounded">
                04
              </span>
              <h3 className="text-xs font-semibold text-stone-900 font-sans">
                Apply verified fix
              </h3>
              <p className="text-[11px] text-stone-500 leading-relaxed font-sans">
                Preview the exact unified diff, verify code safety, and apply the patch.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-4 rounded-lg bg-white border border-stone-200/90 space-y-2.5 relative">
              <span className="text-xs font-mono font-bold text-[#0F9F6E] bg-[#DDF7EC] px-2 py-0.5 rounded">
                05
              </span>
              <h3 className="text-xs font-semibold text-stone-900 font-sans">
                Authoritative re-review
              </h3>
              <p className="text-[11px] text-stone-500 leading-relaxed font-sans">
                The engine automatically audits the patched code and confirms score improvement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section: Product Values (Honest Technical Architecture) */}
      <section id="product-values" className="py-16 bg-white border-y border-stone-200/80 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="max-w-xl space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#087A54]">
              Architecture
            </h2>
            <p className="text-2xl font-bold tracking-tight text-stone-900 font-sans">
              Built on sound engineering principles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-lg bg-[#F5F7F6]/50 border border-stone-200/80 space-y-2">
              <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm font-sans">
                <ShieldCheck className="w-4 h-4 text-[#0F9F6E]" />
                <span>Static + AI, Never Pure AI</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Pure LLM reviewers are probabilistic. CodeEagle requires static AST analysis to establish a deterministic foundation, then layers Gemini reasoning for complementary semantic insights.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#F5F7F6]/50 border border-stone-200/80 space-y-2">
              <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm font-sans">
                <Terminal className="w-4 h-4 text-[#0F9F6E]" />
                <span>Safe by Design</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Source code is never executed, evaluated, or compiled into runnable binaries. Fixes are applied via strict pure-string mutations guarded by SHA-256 hash checks.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#F5F7F6]/50 border border-stone-200/80 space-y-2">
              <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm font-sans">
                <Layers className="w-4 h-4 text-[#0F9F6E]" />
                <span>Actionable, Not Noisy</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Findings include "Why this matters", specific remediation instructions, and PR-style suggested changes with line-by-line diff previews.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#F5F7F6]/50 border border-stone-200/80 space-y-2">
              <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm font-sans">
                <Zap className="w-4 h-4 text-[#0F9F6E]" />
                <span>Real Re-Analysis</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Applying a patch does not arbitrarily increment score. It triggers an authoritative, full re-analysis that verifies whether the issue was genuinely resolved and whether new bugs were introduced.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section: Interactive Showcase Scenarios */}
      <section id="showcase" className="py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#087A54]">
                Sample Scenarios
              </h2>
              <p className="text-2xl font-bold tracking-tight text-stone-900 font-sans">
                Explore real vulnerability patterns
              </p>
              <p className="text-xs text-stone-500 font-sans">
                Select a scenario to inspect how CodeEagle identifies issues and generates safe patches.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onSelectScenarioAndStart(activeTab)}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#0F9F6E] hover:bg-[#087A54] text-white text-xs font-semibold shadow-2xs transition-colors self-start sm:self-auto"
            >
              <span>Launch this scenario in Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scenario Tabs */}
          <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto text-xs">
            {PRESETS.map((preset) => {
              const isSelected = activeTab === preset.id;
              const badge =
                preset.id === 'insecure-login'
                  ? { label: 'SECURITY', color: 'text-[#D92D20] bg-red-50 border-red-200' }
                  : preset.id === 'buggy-react'
                  ? { label: 'REACT', color: 'text-[#4D78A8] bg-blue-50 border-blue-200' }
                  : { label: 'COMPLEXITY', color: 'text-[#C58B00] bg-amber-50 border-amber-200' };

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setActiveTab(preset.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded border transition-all ${
                    isSelected
                      ? 'bg-white border-stone-900 text-stone-900 shadow-2xs font-semibold'
                      : 'bg-transparent border-transparent text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <span className={`text-[9px] font-mono px-1 py-0.2 rounded border uppercase font-bold ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span>{preset.name}</span>
                </button>
              );
            })}
          </div>

          {/* Code Viewer Preview */}
          <div className="rounded-lg border border-[#242826] bg-[#171A19] shadow-md overflow-hidden font-mono text-xs">
            <div className="px-4 py-2.5 bg-[#121514] border-b border-[#242826] flex items-center justify-between text-[11px] text-[#8F9E94]">
              <div className="flex items-center gap-2 font-medium text-[#E8EEE9]">
                <FileCode className="w-3.5 h-3.5 text-[#0F9F6E]" />
                <span>
                  {selectedPreset.id === 'insecure-login'
                    ? 'auth.js'
                    : selectedPreset.id === 'buggy-react'
                    ? 'ActivityFeed.jsx'
                    : 'shippingFee.js'}
                </span>
              </div>
              <span className="text-[10px] text-[#7D8A82]">
                {selectedPreset.description}
              </span>
            </div>
            <pre className="p-4 overflow-x-auto text-[#E8EEE9] leading-relaxed max-h-64 dark-editor-scrollbar">
              <code>{selectedPreset.code}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* 7. Bottom Call to Action */}
      <section className="py-16 bg-[#171A19] text-white border-t border-[#242826] px-4 sm:px-8 text-center select-none">
        <div className="max-w-2xl mx-auto space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-sans">
            Ready to review your code?
          </h2>
          <p className="text-xs sm:text-sm text-[#A0AEA4] leading-relaxed font-sans max-w-lg mx-auto">
            Test CodeEagle on your source code or launch one of the built-in vulnerability scenarios.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onStartReviewing()}
              className="flex items-center gap-2 px-6 py-2.5 rounded bg-[#0F9F6E] hover:bg-[#087A54] text-white text-sm font-semibold shadow-2xs transition-all active:scale-[0.99]"
            >
              <span>Start Reviewing Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 8. Minimalist Product Footer */}
      <footer className="bg-[#121514] border-t border-[#242826] px-4 sm:px-8 py-8 text-xs text-[#7D8A82] font-sans">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CodeEagleLogo size={20} />
            <span className="font-semibold text-stone-200">CodeEagle</span>
            <span className="text-[#3A403C]">•</span>
            <span>AI Code Review</span>
          </div>

          <div className="flex items-center gap-5 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => onStartReviewing()}
              className="hover:text-stone-300 transition-colors"
            >
              Workspace
            </button>
            <button
              type="button"
              onClick={onOpenHistory}
              className="hover:text-stone-300 transition-colors"
            >
              Audit History
            </button>
            <span className="text-[#3A403C]">•</span>
            <span>Static AST + Google Gemini</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
